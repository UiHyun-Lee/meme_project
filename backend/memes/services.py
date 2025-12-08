# import json
# import os
# from io import BytesIO
#
# import requests
# from PIL import Image, ImageDraw, ImageFont
# import cloudinary.uploader
# from openai import OpenAI
# from django.conf import settings
#
# client = OpenAI(api_key=settings.OPENAI_API_KEY)
#
#
# def generate_ai_meme_design(
#     topic: str,
#     category_name: str,
#     template_desc: str,
#     template_url: str,
# ) -> dict:
#
#     prompt = f"""
# You are an expert meme designer AI.
#
# This week’s global meme TOPIC is:
# - Topic: "{topic}"
#
# You are given an existing meme template image:
# - Category: {category_name}
# - Description: {template_desc}
# - Image URL: {template_url}
#
# Your job:
# - Create memes that clearly relate to the given TOPIC.
# - Imagine how humans would create memes with this template for that topic.
# - Create between 2 and 5 different meme ideas.
# - For each meme, decide:
#   - a short, funny caption,
#   - where the text should be placed (top, bottom, or center),
#   - what text color fits the image,
#   - whether the style should be normal, bold, italic, or bold_italic,
#   - which font family to use among a small set of options.
#
# You MUST respond with ONLY one JSON object with this structure:
#
# {{
#   "memes": [
#     {{
#       "caption": "first meme caption",
#       "position": "top",
#       "color": "white",
#       "emphasis": "bold",
#       "font_face": "impact"
#     }},
#     {{
#       "caption": "second meme caption",
#       "position": "bottom",
#       "color": "#FFFF00",
#       "emphasis": "normal",
#       "font_face": "arial"
#     }}
#   ]
# }}
#
# Rules:
# - All captions MUST be about the given TOPIC: "{topic}".
# - The top-level object MUST have exactly one key: "memes".
# - "memes" MUST be a non-empty array (2 to 5 elements).
# - Each element MUST have exactly five keys:
#   - "caption": string
#   - "position": "top", "bottom", or "center"
#   - "color": string (CSS color name or hex like "#FFFFFF")
#   - "emphasis": "normal", "bold", "italic", or "bold_italic"
#   - "font_face": one of "impact" or "arial"
# - All values of "font_face" MUST be lowercase.
# - Do NOT include any other keys or comments.
# - Do NOT wrap the JSON in backticks.
# - The response MUST be valid JSON.
# """
#
#     try:
#         response = client.chat.completions.create(
#             model="gpt-4o-mini",
#             messages=[{"role": "user", "content": prompt.strip()}],
#             max_tokens=300,
#             response_format={"type": "json_object"},
#         )
#     except Exception as e:
#         print("OpenAI error:", repr(e))
#         return {"error": f"openai_error: {str(e)}"}
#
#     msg = response.choices[0].message
#
#     if hasattr(msg, "parsed") and msg.parsed is not None:
#         raw_data = msg.parsed
#     else:
#         raw = msg.content
#         try:
#             raw_data = json.loads(raw)
#         except Exception as e:
#             print("JSON parse error:", e)
#             print("RAW FROM OPENAI:", raw[:600])
#             return {
#                 "error": "json_parse_error",
#                 "detail": str(e),
#                 "raw": raw[:600],
#             }
#
#     memes = raw_data.get("memes", []) or []
#     if not isinstance(memes, list):
#         return {"error": "invalid_response", "detail": "'memes' is not a list"}
#
#     captions = []
#     for m in memes:
#         if not isinstance(m, dict):
#             continue
#
#         text = m.get("caption", "") or ""
#         if not text.strip():
#             continue
#
#         captions.append(
#             {
#                 "text": text,
#                 "position": m.get("position", "bottom"),
#                 "color": m.get("color", "white"),
#                 "font_face": (m.get("font_face") or "impact").lower().strip(),
#             }
#         )
#
#     return {"captions": captions}
#
#
# def apply_ai_text_to_image(template_url: str, captions: list) -> str:
#     resp = requests.get(template_url)
#     resp.raise_for_status()
#
#     image = Image.open(BytesIO(resp.content)).convert("RGB")
#     draw = ImageDraw.Draw(image)
#     W, H = image.size
#
#     FONT_FILES = {
#         "impact": "Monaco.ttf",
#         "arial": "Geneva.ttf",
#     }
#
#     for cap in captions:
#         text = cap.get("text", "")
#         if not text:
#             continue
#
#         font_size = cap.get("font_size")
#         if not font_size:
#             font_size = int(H * 0.10)
#
#         if font_size < 48:
#             font_size = 48
#
#         font_key = (cap.get("font_face") or "impact").lower().strip()
#         font_file = FONT_FILES.get(font_key, "Impact.ttf")
#
#         font_path = os.path.join(settings.BASE_DIR, "fonts", font_file)
#
#         try:
#             font = ImageFont.truetype(font_path, font_size)
#         except Exception as e:
#             print(f"⚠ 폰트 로드 실패 ({font_path}) → 기본 폰트 사용:", e)
#             font = ImageFont.load_default()
#
#         color = cap.get("color", "white")
#         stroke_color = cap.get("stroke_color", "black")
#         stroke_width = cap.get("stroke_width", 5)
#
#         bbox = draw.textbbox((0, 0), text, font=font, stroke_width=stroke_width)
#         text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
#
#         pos = cap.get("position", "bottom")
#         if pos == "top":
#             x, y = (W - text_w) / 2, int(H * 0.05)
#         elif pos == "center":
#             x, y = (W - text_w) / 2, (H - text_h) / 2
#         else:  # bottom
#             x, y = (W - text_w) / 2, H - text_h - int(H * 0.05)
#
#         draw.text(
#             (x, y),
#             text,
#             font=font,
#             fill=color,
#             stroke_width=stroke_width,
#             stroke_fill=stroke_color,
#         )
#
#     buffer = BytesIO()
#     image.save(buffer, format="PNG")
#     buffer.seek(0)
#
#     upload_result = cloudinary.uploader.upload(buffer, folder="memes/ai/")
#     return upload_result["public_id"]

import re
import json
import os
from io import BytesIO
from typing import Optional

import requests
from PIL import Image, ImageDraw, ImageFont
import cloudinary.uploader
from openai import OpenAI
from django.conf import settings

from .models import MemeTemplate, Meme

client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_ai_meme_design(
        topic: str,
        category_name: str,
        template_desc: str,
        template_url: str,
) -> dict:

    prompt = f"""
You are an expert meme designer AI.

This week’s global meme TOPIC is:
- Topic: "{topic}"

You are given an existing meme template image:
- Category: {category_name}
- Description: {template_desc}
- Image URL: {template_url}

Your job:
- Create memes that clearly relate to the given TOPIC.
- Imagine how humans would create memes with this template for that topic.
- Create between 5 and 7 different meme ideas.
- For each meme, decide:
  - a short, funny caption,
  - where the text should be placed (top, bottom, or center),
  - what text color fits the image,
  - whether the style should be normal, bold, italic, or bold_italic,
  - which font family to use among a small set of options.

You MUST respond with ONLY one JSON object with this structure:

{{
  "memes": [
    {{
      "caption": "first meme caption",
      "position": "top",
      "color": "white",
      "emphasis": "bold",
      "font_face": "impact"
    }},
    {{
      "caption": "second meme caption",
      "position": "bottom",
      "color": "#FFFF00",
      "emphasis": "normal",
      "font_face": "arial"
    }},
    {{
  "caption": "example",
  "position": "top",
  "color": "#ff00cc",
  "emphasis": "bold",
  "font_face": "impact"
}},
{{
  "caption": "example2",
  "position": "bottom",
  "color": "deepskyblue",
  "emphasis": "italic",
  "font_face": "arial"
}},
{{
  "caption": "example3",
  "position": "center",
  "color": "rgb(120, 220, 50)",
  "emphasis": "normal",
  "font_face": "impact"
}}
  ]
}}

Rules:
- All captions MUST be about the given TOPIC: "{topic}".
- The top-level object MUST have exactly one key: "memes".
- "memes" MUST be a non-empty array (5 to 7 elements).
- Each element MUST have exactly five keys:
  - "caption": string
  - "position": "top", "bottom", or "center"
  - "color": string (CSS color name or hex like "#FFFFFF")
  - "emphasis": "normal", "bold", "italic", or "bold_italic"
  - "font_face": one of "impact" or "arial"
- Captions MUST be written in simple English.
- Do NOT use emojis.
- Do NOT use non-Latin scripts (no Korean, Chinese, Arabic, etc.).
- Avoid fancy Unicode symbols; use normal ASCII characters only.
- Do NOT include any other keys or comments.
- Do NOT wrap the JSON in backticks.
- The response MUST be valid JSON.
- "color" may be ANY valid CSS color or hexadecimal color.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt.strip()}],
            max_tokens=300,
            response_format={"type": "json_object"},
        )
    except Exception as e:
        print("OpenAI error:", repr(e))
        return {"error": f"openai_error: {str(e)}"}

    msg = response.choices[0].message

    if hasattr(msg, "parsed") and msg.parsed is not None:
        raw_data = msg.parsed
    else:
        raw = msg.content
        try:
            raw_data = json.loads(raw)
        except Exception as e:
            print("JSON parse error:", e)
            print("RAW FROM OPENAI:", raw[:600])
            return {
                "error": "json_parse_error",
                "detail": str(e),
                "raw": raw[:600],
            }

    memes = raw_data.get("memes", []) or []
    if not isinstance(memes, list):
        return {"error": "invalid_response", "detail": "'memes' is not a list"}

    captions = []
    for m in memes:
        if not isinstance(m, dict):
            continue

        text = m.get("caption", "") or ""
        if not text.strip():
            continue

        captions.append(
            {
                "text": text,
                "position": m.get("position", "bottom"),
                "color": m.get("color", "white"),
                "font_face": (m.get("font_face") or "impact").lower().strip(),
                "emphasis": (m.get("emphasis") or "normal").lower().strip(),
            }
        )

    if not captions:
        return {"error": "no_captions"}

    return {"captions": captions}


def _wrap_text_to_width(draw, text, font, max_width, stroke_width=0):
    words = text.split()
    if not words:
        return ""

    lines = []
    current = words[0]
    for w in words[1:]:
        test = current + " " + w
        bbox = draw.textbbox((0, 0), test, font=font, stroke_width=stroke_width)
        width = bbox[2] - bbox[0]
        if width <= max_width:
            current = test
        else:
            lines.append(current)
            current = w
    lines.append(current)
    return "\n".join(lines)


def apply_ai_text_to_image(template_url: str, captions: list) -> str:
    resp = requests.get(template_url)
    resp.raise_for_status()

    image = Image.open(BytesIO(resp.content)).convert("RGB")
    draw = ImageDraw.Draw(image)
    W, H = image.size

    FONT_FILES = {
        ("impact", "normal"): "MarkerFelt.ttc",
        ("impact", "bold"): "MarkerFelt.ttc",
        ("impact", "italic"): "MarkerFelt.ttc",
        ("impact", "bold_italic"): "MarkerFelt.ttc",

        ("arial", "normal"): "ArialHB.ttc",
        ("arial", "bold"): "ArialHB.ttc",
        ("arial", "italic"): "NewYorkItalic.ttf",
        ("arial", "bold_italic"): "NewYorkItalic.ttf",
    }

    for cap in captions:
        text = cap.get("text", "")
        if not text:
            continue

        text = re.sub(r"[^\x20-\x7E]", "", text)
        if not text.strip():
            continue

        emphasis = (cap.get("emphasis") or "normal").lower().strip()
        if emphasis not in ["normal", "bold", "italic", "bold_italic"]:
            emphasis = "normal"

        font_size = cap.get("font_size")
        if not font_size:
            font_size = int(H * 0.10)

        if emphasis in ["bold", "bold_italic"]:
            font_size = int(font_size * 1.05)

        if font_size < 48:
            font_size = 48

        font_key = (cap.get("font_face") or "impact").lower().strip()
        font_file = FONT_FILES.get(
            (font_key, emphasis),
            FONT_FILES.get((font_key, "normal"), "Impact.ttf"),
        )

        font_path = os.path.join(settings.BASE_DIR, "fonts", font_file)

        try:
            font = ImageFont.truetype(font_path, font_size)
        except Exception as e:
            print(f"⚠ 폰트 로드 실패 ({font_path}) → 기본 폰트 사용:", e)
            font = ImageFont.load_default()

        color = cap.get("color", "white")

        stroke_color = cap.get("stroke_color")
        if not stroke_color:
            lower = str(color).lower()
            if lower in ["white", "#ffffff", "fff"]:
                stroke_color = "black"
            else:
                stroke_color = "white"

        stroke_width = cap.get("stroke_width")
        if not stroke_width:
            if emphasis in ["bold", "bold_italic"]:
                stroke_width = 6
            else:
                stroke_width = 4

        max_text_width = int(W * 0.9)
        wrapped_text = _wrap_text_to_width(
            draw, text, font, max_text_width, stroke_width=stroke_width
        )

        bbox = draw.textbbox(
            (0, 0), wrapped_text, font=font, stroke_width=stroke_width
        )
        text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]

        pos = cap.get("position", "bottom")
        if pos == "top":
            x, y = (W - text_w) / 2, int(H * 0.05)
        elif pos == "center":
            x, y = (W - text_w) / 2, (H - text_h) / 2
        else:  # bottom
            x, y = (W - text_w) / 2, H - text_h - int(H * 0.05)

        draw.text(
            (x, y),
            wrapped_text,
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


def ensure_ai_balance_for_topic(
        topic: str,
        base_template: Optional[MemeTemplate] = None,
        min_ratio: float = 0.7,
        max_diff: int = 3,
        max_new: int = 5,
) -> None:
    human_count = Meme.objects.filter(topic=topic, created_by="human").count()
    ai_count = Meme.objects.filter(topic=topic, created_by="ai").count()

    if human_count == 0:
        return

    target_by_ratio = int(human_count * min_ratio)
    target_by_diff = human_count - max_diff
    target_ai = max(target_by_ratio, target_by_diff, 0)

    needed = target_ai - ai_count
    if needed <= 0:
        return

    needed = min(needed, max_new)

    for _ in range(needed):
        template = base_template
        if template is None:
            template = MemeTemplate.objects.order_by("?").first()

        if not template:
            return

        category_name = template.category.name if template.category else ""
        template_desc = template.description or ""

        try:
            try:
                template_image_url = template.image.url
            except Exception:
                template_image_url = str(template.image)
        except Exception:
            continue

        if not template_image_url:
            continue

        design = generate_ai_meme_design(
            topic=topic,
            category_name=category_name,
            template_desc=template_desc,
            template_url=template_image_url,
        )

        if "error" in design:
            print("AI design error during balance for topic:", topic, design)
            continue

        captions = design.get("captions") or []
        if not captions:
            continue

        cap = captions[0]

        try:
            public_id = apply_ai_text_to_image(template_image_url, [cap])
        except Exception as e:
            print("apply_ai_text_to_image balance error:", repr(e))
            continue

        try:
            Meme.objects.create(
                template=template,
                image=public_id,
                caption=str(cap.get("text", "")),
                created_by="ai",
                format="macro",
                topic=topic,
            )
        except Exception as e:
            print("Meme create error during balance:", repr(e))
            continue
