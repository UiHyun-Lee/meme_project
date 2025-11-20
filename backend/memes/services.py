import json
import requests
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import cloudinary.uploader
from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_ai_meme_design(category_name: str, template_desc: str, template_url: str) -> dict:

    prompt = f"""
    You are an expert meme designer AI.

    You are given a real image (not to generate new ones) with the following info:
    - Category: {category_name}
    - Description: {template_desc}
    - Image URL: {template_url}

    Your task:
    1. Analyze the image and imagine how a human would make a meme using it.
<<<<<<< HEAD
    2. Create between 1 and N meme designs (N ≥ 1). e.g. between 7 and 10 memems randomly!!!!.
=======
    2. Create between 1 and N meme designs (N ≥ 1). e.g. between 7 and 10 memems.
>>>>>>> origin/main
    3. For each meme, define one or more text captions.
    4. Output ONLY valid JSON.
    5. For each caption, define:
       - text: the meme caption
       - position: top|bottom|center|custom
       - x, y (if custom)
       - font_face (e.g., Impact, Arial, Comic Sans MS)
       - font_size (integer)
       - color (CSS or RGB color)
       - stroke_color
       - stroke_width
       - bold, italic, underline
       - shadow {{
            "enabled": true/false,
            "x_offset": integer,
            "y_offset": integer,
            "color": string,
            "blur": integer
         }}

    DO NOT generate or describe a new image.
    Only design meme text and style that fits the existing image.

    Return ONLY valid JSON in this format:
    {{
      "memes": [
        {{
          "captions": [
            {{
              "text": "When you realize your exam is tomorrow",
              "position": "top",
              "x": 120,
              "y": 80,
              "font_face": "Impact",
              "font_size": 48,
              "color": "white",
              "stroke_color": "black",
              "stroke_width": 3,
              "bold": true,
              "italic": false,
              "underline": false,
              "shadow": {{
                "enabled": true,
                "x_offset": 3,
                "y_offset": 3,
                "color": "black",
                "blur": 2
              }}
            }}
          ]
        }}
      ]
    }}
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=900,
        response_format = {"type": "json_object"}
    )

    try:
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print("JSON parse error:", e)
        return {"error": "Invalid JSON from AI"}


def apply_ai_text_to_image(template_url: str, captions: list) -> str:

    response = requests.get(template_url)
    image = Image.open(BytesIO(response.content)).convert("RGB")
    draw = ImageDraw.Draw(image)
    W, H = image.size

    for cap in captions:
        text = cap.get("text", "")
        font_face = cap.get("font_face", "Arial")
        font_size = cap.get("font_size", 40)
        color = cap.get("color", "white")
        stroke_color = cap.get("stroke_color", "black")
        stroke_width = cap.get("stroke_width", 2)

        # font load
        try:
            font = ImageFont.truetype(f"/Library/Fonts/{font_face}.ttf", font_size)
        except:
            try:
                font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
            except:
                font = ImageFont.load_default()

        # position config
        bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
        text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]

        pos = cap.get("position", "bottom")
        if pos == "top":
            x, y = (W - text_w) / 2, 30
        elif pos == "bottom":
            x, y = (W - text_w) / 2, H - text_h - 40
        elif pos == "center":
            x, y = (W - text_w) / 2, (H - text_h) / 2
        elif pos == "custom":
            x, y = cap.get("x", 50), cap.get("y", 50)
        else:
            x, y = (W - text_w) / 2, H - text_h - 40

        # shadow
        shadow = cap.get("shadow", {})
        if shadow.get("enabled", False):
            sx = x + shadow.get("x_offset", 2)
            sy = y + shadow.get("y_offset", 2)
            draw.text((sx, sy), text, font=font, fill=shadow.get("color", "black"))

        # text
        draw.text(
            (x, y),
            text,
            font=font,
            fill=color,
            stroke_width=stroke_width,
            stroke_fill=stroke_color
        )

    # Cloudinary upload
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    upload_result = cloudinary.uploader.upload(buffer, folder="memes/")
    return upload_result["secure_url"]


# def upload_template_image(file):
#     result = cloudinary.uploader.upload(
#         file,
#         folder="templates/"
#     )
#     return result["secure_url"]
#
# def upload_user_meme(file):
#     result = cloudinary.uploader.upload(
#         file,
#         folder="memes/"
#     )
#     return result["secure_url"]