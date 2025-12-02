# import json
# import requests
# from io import BytesIO
# from PIL import Image, ImageDraw, ImageFont
# import cloudinary.uploader
# from openai import OpenAI
# from django.conf import settings
#
# client = OpenAI(api_key=settings.OPENAI_API_KEY)
#
#
# # def generate_ai_meme_design(category_name: str, template_desc: str, template_url: str) -> dict:
# #
# #     prompt = f"""
# #     You are an expert meme designer AI.
# #
# #     You are given a real image (not to generate new ones) with the following info:
# #     - Category: {category_name}
# #     - Description: {template_desc}
# #     - Image URL: {template_url}
# #
# #     Your task:
# #     1. Analyze the image and imagine how a human would make a meme using it.
# #     2. Create between 1 and N meme designs (N ≥ 1). e.g. between 7 and 10 memems randomly!!!!.
# #     3. For each meme, define one or more text captions.
# #     4. Output ONLY valid JSON.
# #     5. For each caption, define:
# #        - text: the meme caption
# #        - position: top|bottom|center|custom
# #        - x, y (if custom)
# #        - font_face (e.g., Impact, Arial, Comic Sans MS)
# #        - font_size (integer)
# #        - color (CSS or RGB color)
# #        - stroke_color
# #        - stroke_width
# #        - bold, italic, underline
# #        - shadow {{
# #             "enabled": true/false,
# #             "x_offset": integer,
# #             "y_offset": integer,
# #             "color": string,
# #             "blur": integer
# #          }}
# #
# #     DO NOT generate or describe a new image.
# #     Only design meme text and style that fits the existing image.
# #
# #     Return ONLY valid JSON in this format:
# #     {{
# #       "memes": [
# #         {{
# #           "captions": [
# #             {{
# #               "text": "When you realize your exam is tomorrow",
# #               "position": "top",
# #               "x": 120,
# #               "y": 80,
# #               "font_face": "Impact",
# #               "font_size": 48,
# #               "color": "white",
# #               "stroke_color": "black",
# #               "stroke_width": 3,
# #               "bold": true,
# #               "italic": false,
# #               "underline": false,
# #               "shadow": {{
# #                 "enabled": true,
# #                 "x_offset": 3,
# #                 "y_offset": 3,
# #                 "color": "black",
# #                 "blur": 2
# #               }}
# #             }}
# #           ]
# #         }}
# #       ]
# #     }}
# #     """
# #
# #     response = client.chat.completions.create(
# #         model="gpt-4o-mini",
# #         messages=[{"role": "user", "content": prompt}],
# #         max_tokens=900,
# #         response_format = {"type": "json_object"}
# #     )
# #
# #     try:
# #         return json.loads(response.choices[0].message.content)
# #     except Exception as e:
# #         print("JSON parse error:", e)
# #         return {"error": "Invalid JSON from AI"}
#
#
# import json
# from openai import OpenAI
# from django.conf import settings
# import re
# client = OpenAI(api_key=settings.OPENAI_API_KEY)
#
# import json
#
#
# def generate_ai_meme_design(category_name: str, template_desc: str, template_url: str) -> dict:
#     """
#     AI한테 '캡션만' 여러 개 만들어달라고 요청.
#     JSON 포맷은 아주 단순: {"memes": [{"caption": "..."} , ...]}
#     """
#     prompt = f"""
# You are an expert meme caption writer.
#
# You are given information about an existing meme template image:
# - Category: {category_name}
# - Description: {template_desc}
# - Image URL: {template_url}
#
# Your job:
# 1. Imagine how people would use this template to make memes.
# 2. Create between 3 and 7 funny meme ideas.
# 3. Each idea should be a short caption.
# 4. Respond ONLY with valid JSON.
#
# The JSON MUST have exactly this structure:
#
# {{
#   "memes": [
#     {{"caption": "first meme caption"}},
#     {{"caption": "second meme caption"}}
#   ]
# }}
#
# Do NOT include any other fields. Do NOT include comments or explanations.
# Only return the JSON object.
# """
#
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": prompt}],
#             max_tokens=300,  # 훨씬 줄여도 충분
#             response_format={"type": "json_object"},
#         )
#     except Exception as e:
#         print("OpenAI error:", repr(e))
#         return {"error": f"openai_error: {str(e)}"}
#
#     msg = response.choices[0].message
#
#     # 새 버전이면 parsed에 바로 dict로 들어올 수 있음
#     if hasattr(msg, "parsed") and msg.parsed is not None:
#         return msg.parsed
#
#     # 구버전일 경우 content는 JSON 문자열
#     raw = msg.content
#     try:
#         return json.loads(raw)
#     except Exception as e:
#         print("JSON parse error:", e)
#         print("RAW FROM OPENAI:", raw[:600])
#         return {
#             "error": "json_parse_error",
#             "detail": str(e),
#             "raw": raw[:600],
#         }
#
#
# def apply_ai_text_to_image(template_url: str, captions: list) -> str:
#
#     response = requests.get(template_url)
#     image = Image.open(BytesIO(response.content)).convert("RGB")
#     draw = ImageDraw.Draw(image)
#     W, H = image.size
#
#     for cap in captions:
#         text = cap.get("text", "")
#         font_face = cap.get("font_face", "Arial")
#         font_size = cap.get("font_size", 40)
#         color = cap.get("color", "white")
#         stroke_color = cap.get("stroke_color", "black")
#         stroke_width = cap.get("stroke_width", 2)
#
#         # font load
#         try:
#             font = ImageFont.truetype(f"/Library/Fonts/{font_face}.ttf", font_size)
#         except:
#             try:
#                 font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
#             except:
#                 font = ImageFont.load_default()
#
#         # position config
#         bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
#         text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
#
#         pos = cap.get("position", "bottom")
#         if pos == "top":
#             x, y = (W - text_w) / 2, 30
#         elif pos == "bottom":
#             x, y = (W - text_w) / 2, H - text_h - 40
#         elif pos == "center":
#             x, y = (W - text_w) / 2, (H - text_h) / 2
#         elif pos == "custom":
#             x, y = cap.get("x", 50), cap.get("y", 50)
#         else:
#             x, y = (W - text_w) / 2, H - text_h - 40
#
#         # shadow
#         shadow = cap.get("shadow", {})
#         if shadow.get("enabled", False):
#             sx = x + shadow.get("x_offset", 2)
#             sy = y + shadow.get("y_offset", 2)
#             draw.text((sx, sy), text, font=font, fill=shadow.get("color", "black"))
#
#         # text
#         draw.text(
#             (x, y),
#             text,
#             font=font,
#             fill=color,
#             stroke_width=stroke_width,
#             stroke_fill=stroke_color
#         )
#
#     # Cloudinary upload
#     buffer = BytesIO()
#     image.save(buffer, format="PNG")
#     buffer.seek(0)
#     upload_result = cloudinary.uploader.upload(buffer, folder="memes/")
#     return upload_result["public_id"]
#
#
# def upload_template_image(file):
#     result = cloudinary.uploader.upload(
#         file,
#         folder="templates/"
#     )
#     return result["public_id"]
#
# def upload_user_meme(file):
#     result = cloudinary.uploader.upload(
#         file,
#         folder="memes/"
#     )
#     return result["public_id"]




# memes/services.py

import json
from io import BytesIO

import requests
from PIL import Image, ImageDraw, ImageFont
import cloudinary.uploader
from openai import OpenAI
from django.conf import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_ai_meme_design(category_name: str, template_desc: str, template_url: str) -> dict:
    """
    템플릿 정보를 보고, AI가 캡션 + 스타일(위치, 폰트, 색, 그림자 등)을 설계해서
    captions 배열(항상 1개짜리)을 JSON으로 돌려줌.
    JSON 포맷: { "captions": [ { ... } ] }
    """

    prompt = f"""
You are an expert meme designer AI.

You are given an existing meme template image:
- Category: {category_name}
- Description: {template_desc}
- Image URL: {template_url}

Your job:
- Imagine how humans would create memes with this template.
- Create EXACTLY ONE meme caption for this template.
- For this single caption, you must also design the style (position, font, color, shadow, etc.).

You MUST respond with a single JSON object with exactly one top-level key: "captions".

The value of "captions" MUST be an array with exactly one caption object.
That single caption object MUST contain ALL of the following fields:

- text: string, the meme caption text
- position: one of "top", "bottom", "center", "custom"
- x: integer (used only if position = "custom", otherwise you can still fill a sensible value)
- y: integer (same rule as x)
- font_face: string, e.g. "Impact", "Arial", "Comic Sans MS"
- font_size: integer, e.g. between 32 and 96 depending on image size
- color: string, a valid CSS color name or hex code like "#FFFFFF"
- stroke_color: string, outline color, e.g. "black"
- stroke_width: integer, e.g. 3 or 4
- bold: boolean
- italic: boolean
- underline: boolean
- shadow: object with the following fields:
    - enabled: boolean
    - x_offset: integer
    - y_offset: integer
    - color: string
    - blur: integer

IMPORTANT RULES:
- Do NOT include any other top-level keys besides "captions".
- Do NOT include comments or explanations.
- Do NOT wrap the JSON in backticks.
- The response MUST be valid JSON.
- The "captions" array MUST have exactly one element.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt.strip()}],
            max_tokens=600,  # 여유 충분히
            response_format={"type": "json_object"},
        )
    except Exception as e:
        print("OpenAI error:", repr(e))
        return {"error": f"openai_error: {str(e)}"}

    msg = response.choices[0].message

    # 최신 openai 클라이언트: parsed가 있으면 그걸 그대로 dict로 사용
    if hasattr(msg, "parsed") and msg.parsed is not None:
        return msg.parsed

    # fallback: content를 직접 파싱
    raw = msg.content
    try:
        return json.loads(raw)
    except Exception as e:
        print("JSON parse error:", e)
        print("RAW FROM OPENAI:", raw[:600])
        return {
            "error": "json_parse_error",
            "detail": str(e),
            "raw": raw[:600],
        }


def apply_ai_text_to_image(template_url: str, captions: list) -> str:
    """
    템플릿 이미지 URL + 캡션 리스트를 받아서
    Pillow로 텍스트 합성 후 Cloudinary에 업로드하고 public_id를 리턴.
    captions: [{ "text": "...", "position": "bottom" }, ...]
    """
    resp = requests.get(template_url)
    resp.raise_for_status()

    image = Image.open(BytesIO(resp.content)).convert("RGB")
    draw = ImageDraw.Draw(image)
    W, H = image.size

    for cap in captions:
        text = cap.get("text", "")
        if not text:
            continue

        font_size = cap.get("font_size", 40)
        color = cap.get("color", "white")
        stroke_color = cap.get("stroke_color", "black")
        stroke_width = cap.get("stroke_width", 2)

        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()

        bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
        text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]

        pos = cap.get("position", "bottom")
        if pos == "top":
            x, y = (W - text_w) / 2, 30
        elif pos == "center":
            x, y = (W - text_w) / 2, (H - text_h) / 2
        else:  # bottom 기본
            x, y = (W - text_w) / 2, H - text_h - 40

        draw.text(
            (x, y),
            text,
            font=font,
            fill=color,
            stroke_width=stroke_width,
            stroke_fill=stroke_color,
        )

    buffer = BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)

    upload_result = cloudinary.uploader.upload(buffer, folder="memes/ai/")
    return upload_result["public_id"]
