import openai
import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import cloudinary.uploader
from django.conf import settings
from openai import OpenAI
import textwrap

openai.api_key = settings.OPENAI_API_KEY
client = OpenAI()

def generate_ai_caption(category_name: str, template_desc: str) -> str:
    prompt = f"Write a short, funny meme caption for the category '{category_name}' using this template: {template_desc}"
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a meme caption generator. Keep it short and funny."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=50
    )
    return response.choices[0].message.content.strip()


def create_meme_image(template_url: str, caption: str) -> str:
    # template img download
    response = requests.get(template_url)
    image = Image.open(BytesIO(response.content)).convert("RGB")

    draw = ImageDraw.Draw(image)

    # font config
    try:
        font = ImageFont.truetype("/Library/Fonts/Arial.ttf", 40)  # macOS
    except:
        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", 40)   # Linux
        except:
            font = ImageFont.load_default()

    W, H = image.size

    # text size config
    sample_bbox = draw.textbbox((0, 0), "A", font=font)
    char_width = sample_bbox[2] - sample_bbox[0]

    # line length
    max_chars_per_line = max(1, int((W * 0.8) / char_width))

    # line
    wrapped_text = textwrap.fill(caption, width=max_chars_per_line)

    # config
    bbox = draw.multiline_textbbox((0, 0), wrapped_text, font=font, spacing=5)
    text_width, text_height = bbox[2] - bbox[0], bbox[3] - bbox[1]

    # position
    x = (W - text_width) / 2
    y = H - text_height - 40

    # print
    draw.multiline_text(
        (x, y),
        wrapped_text,
        font=font,
        fill="white",
        stroke_width=3,
        stroke_fill="black",
        align="center",
        spacing=5
    )

    # Cloudinary upload
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    upload_result = cloudinary.uploader.upload(buffer, folder="memes/")
    return upload_result["secure_url"]
