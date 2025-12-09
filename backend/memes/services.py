# import re
# import json
# import os
# from io import BytesIO
# from typing import Optional
#
# import requests
# from PIL import Image, ImageDraw, ImageFont
# import cloudinary.uploader
# from openai import OpenAI
# from django.conf import settings
#
# from .models import MemeTemplate, Meme
#
# client = OpenAI(api_key=settings.OPENAI_API_KEY)
#
#
# def generate_ai_meme_design(
#         topic: str,
#         category_name: str,
#         template_desc: str,
#         template_url: str,
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
# - Create between 5 and 7 different meme ideas.
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
#     }},
#     {{
#   "caption": "example",
#   "position": "top",
#   "color": "#ff00cc",
#   "emphasis": "bold",
#   "font_face": "impact"
# }},
# {{
#   "caption": "example2",
#   "position": "bottom",
#   "color": "deepskyblue",
#   "emphasis": "italic",
#   "font_face": "arial"
# }},
# {{
#   "caption": "example3",
#   "position": "center",
#   "color": "rgb(120, 220, 50)",
#   "emphasis": "normal",
#   "font_face": "impact"
# }}
#   ]
# }}
#
# Rules:
# - All captions MUST be about the given TOPIC: "{topic}".
# - The top-level object MUST have exactly one key: "memes".
# - "memes" MUST be a non-empty array (5 to 7 elements).
# - Each element MUST have exactly five keys:
#   - "caption": string
#   - "position": "top", "bottom", or "center"
#   - "color": string (CSS color name or hex like "#FFFFFF")
#   - "emphasis": "normal", "bold", "italic", or "bold_italic"
#   - "font_face": one of "impact" or "arial"
# - Captions MUST be written in simple English.
# - Do NOT use emojis.
# - Do NOT use non-Latin scripts (no Korean, Chinese, Arabic, etc.).
# - Avoid fancy Unicode symbols; use normal ASCII characters only.
# - Do NOT include any other keys or comments.
# - Do NOT wrap the JSON in backticks.
# - The response MUST be valid JSON.
# - "color" may be ANY valid CSS color or hexadecimal color.
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
#                 "emphasis": (m.get("emphasis") or "normal").lower().strip(),
#             }
#         )
#
#     if not captions:
#         return {"error": "no_captions"}
#
#     return {"captions": captions}
#
#
# def _wrap_text_to_width(draw, text, font, max_width, stroke_width=0):
#     words = text.split()
#     if not words:
#         return ""
#
#     lines = []
#     current = words[0]
#     for w in words[1:]:
#         test = current + " " + w
#         bbox = draw.textbbox((0, 0), test, font=font, stroke_width=stroke_width)
#         width = bbox[2] - bbox[0]
#         if width <= max_width:
#             current = test
#         else:
#             lines.append(current)
#             current = w
#     lines.append(current)
#     return "\n".join(lines)
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
#         ("impact", "normal"): "MarkerFelt.ttc",
#         ("impact", "bold"): "MarkerFelt.ttc",
#         ("impact", "italic"): "MarkerFelt.ttc",
#         ("impact", "bold_italic"): "MarkerFelt.ttc",
#
#         ("arial", "normal"): "ArialHB.ttc",
#         ("arial", "bold"): "ArialHB.ttc",
#         ("arial", "italic"): "NewYorkItalic.ttf",
#         ("arial", "bold_italic"): "NewYorkItalic.ttf",
#     }
#
#     for cap in captions:
#         text = cap.get("text", "")
#         if not text:
#             continue
#
#         text = re.sub(r"[^A-Za-z0-9 .,!?\"':;()\-_/]", "", text)
#         if not text.strip():
#             continue
#
#         emphasis = (cap.get("emphasis") or "normal").lower().strip()
#         if emphasis not in ["normal", "bold", "italic", "bold_italic"]:
#             emphasis = "normal"
#
#         font_size = cap.get("font_size")
#         if not font_size:
#             font_size = int(H * 0.10)
#
#         if emphasis in ["bold", "bold_italic"]:
#             font_size = int(font_size * 1.05)
#
#         if font_size < 48:
#             font_size = 48
#
#         font_key = (cap.get("font_face") or "impact").lower().strip()
#         font_file = FONT_FILES.get(
#             (font_key, emphasis),
#             FONT_FILES.get((font_key, "normal"), "Impact.ttf"),
#         )
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
#
#         stroke_color = cap.get("stroke_color")
#         if not stroke_color:
#             lower = str(color).lower()
#             if lower in ["white", "#ffffff", "fff"]:
#                 stroke_color = "black"
#             else:
#                 stroke_color = "white"
#
#         stroke_width = cap.get("stroke_width")
#         if not stroke_width:
#             if emphasis in ["bold", "bold_italic"]:
#                 stroke_width = 6
#             else:
#                 stroke_width = 4
#
#         max_text_width = int(W * 0.9)
#         wrapped_text = _wrap_text_to_width(
#             draw, text, font, max_text_width, stroke_width=stroke_width
#         )
#
#         bbox = draw.textbbox(
#             (0, 0), wrapped_text, font=font, stroke_width=stroke_width
#         )
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
#             wrapped_text,
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
#
#
# def ensure_ai_balance_for_topic(
#         topic: str,
#         base_template: Optional[MemeTemplate] = None,
#         min_ratio: float = 0.7,
#         max_diff: int = 3,
#         max_new: int = 5,
# ) -> None:
#     human_count = Meme.objects.filter(topic=topic, created_by="human").count()
#     ai_count = Meme.objects.filter(topic=topic, created_by="ai").count()
#
#     if human_count == 0:
#         return
#
#     target_by_ratio = int(human_count * min_ratio)
#     target_by_diff = human_count - max_diff
#     target_ai = max(target_by_ratio, target_by_diff, 0)
#
#     needed = target_ai - ai_count
#     if needed <= 0:
#         return
#
#     needed = min(needed, max_new)
#
#     for _ in range(needed):
#         template = base_template
#         if template is None:
#             template = MemeTemplate.objects.order_by("?").first()
#
#         if not template:
#             return
#
#         category_name = template.category.name if template.category else ""
#         template_desc = template.description or ""
#
#         try:
#             try:
#                 template_image_url = template.image.url
#             except Exception:
#                 template_image_url = str(template.image)
#         except Exception:
#             continue
#
#         if not template_image_url:
#             continue
#
#         design = generate_ai_meme_design(
#             topic=topic,
#             category_name=category_name,
#             template_desc=template_desc,
#             template_url=template_image_url,
#         )
#
#         if "error" in design:
#             print("AI design error during balance for topic:", topic, design)
#             continue
#
#         captions = design.get("captions") or []
#         if not captions:
#             continue
#
#         cap = captions[0]
#
#         try:
#             public_id = apply_ai_text_to_image(template_image_url, [cap])
#         except Exception as e:
#             print("apply_ai_text_to_image balance error:", repr(e))
#             continue
#
#         try:
#             Meme.objects.create(
#                 template=template,
#                 image=public_id,
#                 caption=str(cap.get("text", "")),
#                 created_by="ai",
#                 format="macro",
#                 topic=topic,
#             )
#         except Exception as e:
#             print("Meme create error during balance:", repr(e))
#             continue




import re
import json
import os
import random
from io import BytesIO
from typing import Optional

import requests
from PIL import Image, ImageDraw, ImageFont
import cloudinary.uploader
from openai import OpenAI
from django.conf import settings

from .models import MemeTemplate, Meme

client = OpenAI(api_key=settings.OPENAI_API_KEY)


# ------------------------------------------------------
# 로깅: 나중에 분석용으로 OpenAI 호출/응답을 파일에 저장
# ------------------------------------------------------
def log_ai_meme_call(model_name: str, topic: str, template_url: str, prompt: str, raw_response: str) -> None:
    """
    BASE_DIR/ai_logs/meme_design.log 에 JSONL 로 한 줄씩 append.
    나중에 어떤 템플릿 + 어떤 토픽 + 어떤 모델이 어떤 응답을 줬는지 분석할 수 있음.
    """
    try:
        log_dir = os.path.join(settings.BASE_DIR, "ai_logs")
        os.makedirs(log_dir, exist_ok=True)

        log_path = os.path.join(log_dir, "meme_design.log")
        record = {
            "model": model_name,
            "topic": topic,
            "template_url": template_url,
            "prompt": prompt,
            "raw_response": raw_response[:4000],
        }
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
    except Exception as e:
        # 로깅 실패는 서비스에 영향 주면 안 됨
        print("AI meme log error:", repr(e))


# ------------------------------------------------------
# 1) 비전 + 멀티 블록 지원 AI 디자인 생성
# ------------------------------------------------------
def generate_ai_meme_design(
    topic: str,
    category_name: str,
    template_desc: str,
    template_url: str,
) -> dict:
    """
    - gpt-4o(비전) + 필요하면 settings 에서 지정한 다른 비전 모델 중 하나를 랜덤으로 사용
    - 템플릿 이미지를 실제로 "보고" (Vision) 레이아웃을 이해한 뒤,
      1~3 개의 텍스트 블록을 가진 밈 아이디어 5~7개 생성
    - 내부적으로는 designs(이미지 하나당 여러 블록)와
      flat captions(기존 코드 호환용)를 둘 다 리턴
    """

    # settings 에서 모델 이름 가져오기 (없으면 기본값 gpt-4o)
    main_model = getattr(settings, "OPENAI_VISION_MODEL_MAIN", "gpt-4o")
    # alt_model = getattr(settings, "OPENAI_VISION_MODEL_ALT", None)

    # model_candidates = [m for m in [main_model, alt_model] if m]
    model_name = main_model

    prompt = f"""
You are an expert meme designer AI.

This week’s global meme TOPIC is:
- "{topic}"

You are given a meme template image (attached image). Analyze the image carefully:
- Detect how many panels it has (1-panel, 2-panel like Drake, 3+ panels, etc.).
- Detect where the main subject(s) and the empty text areas are.
- Infer the typical meme usage of this template if it is a well-known meme format.
- Based on this layout, decide how many caption blocks (1 to 3) are appropriate.
- Choose correct placement ("top", "center", "bottom") for each block based on the image composition.
- All captions MUST clearly relate to the given TOPIC.

For this SINGLE template image, create between 5 and 7 different meme ideas.

You MUST respond with ONLY one JSON object with this structure:

{{
  "memes": [
    {{
      "blocks": [
        {{
          "text": "first text block for this meme",
          "position": "top",
          "color": "#ff00cc",
          "emphasis": "bold",
          "font_face": "impact"
        }},
        {{
          "text": "second text block (if needed)",
          "position": "bottom",
          "color": "deepskyblue",
          "emphasis": "normal",
          "font_face": "arial"
        }}
      ]
    }},
    {{
      "blocks": [
        {{
          "text": "single line meme text for this idea",
          "position": "center",
          "color": "rgb(120, 220, 50)",
          "emphasis": "italic",
          "font_face": "impact"
        }}
      ]
    }}
  ]
}}

Rules:
- The top-level object MUST have exactly one key: "memes".
- "memes" MUST be a non-empty array with 5 to 7 elements.
- Each element in "memes" MUST have exactly one key: "blocks".
- "blocks" MUST be a non-empty array with 1 to 3 elements.
- Each block MUST have exactly five keys:
  - "text": string
  - "position": "top", "bottom", or "center"
  - "color": string (ANY valid CSS color or hex like "#FFFFFF")
  - "emphasis": "normal", "bold", "italic", or "bold_italic"
  - "font_face": one of "impact" or "arial"
- All captions MUST be written in simple English.
- Do NOT use emojis.
- Do NOT use non-Latin scripts (no Korean, Chinese, Arabic, etc.).
- Avoid fancy Unicode symbols; use normal ASCII characters only.
- Do NOT include any other keys or comments.
- Do NOT wrap the JSON in backticks.
- The response MUST be valid JSON.
"""

    raw_for_log = ""

    try:
        response = client.chat.completions.create(
            model=model_name,
            temperature=0.1,  # or 0
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a JSON generator. "
                        "You MUST respond with a single valid JSON object only. "
                        "No explanations, no comments, no extra text."
                    ),
                },
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt.strip()},
                        {"type": "image_url", "image_url": {"url": template_url}},
                    ],
                },
            ],
            max_tokens=1500,
        )
    except Exception as e:
        print("OpenAI error:", repr(e))
        return {"error": f"openai_error: {str(e)}"}

    msg = response.choices[0].message

    # structured output
    if hasattr(msg, "parsed") and msg.parsed is not None:
        raw_data = msg.parsed
        raw_for_log = json.dumps(raw_data, ensure_ascii=False)
    else:
        raw = msg.content or ""
        raw_for_log = raw
        try:
            raw_data = json.loads(raw)
        except Exception as e:
            print("JSON parse error:", e)
            print("RAW FROM OPENAI:", raw[:600])
            log_ai_meme_call(model_name, topic, template_url, prompt.strip(), raw)
            return {
                "error": "json_parse_error",
                "detail": str(e),
                "raw": raw[:600],
            }

    # 성공 응답 로그
    try:
        log_ai_meme_call(model_name, topic, template_url, prompt.strip(), raw_for_log)
    except Exception:
        pass

    memes = raw_data.get("memes", []) or []
    if not isinstance(memes, list):
        return {"error": "invalid_response", "detail": "'memes' is not a list"}

    designs: list[list[dict]] = []

    for m in memes:
        if not isinstance(m, dict):
            continue

        blocks = m.get("blocks") or []
        if not isinstance(blocks, list):
            continue

        parsed_blocks = []
        for b in blocks:
            if not isinstance(b, dict):
                continue

            text = (b.get("text") or "").strip()
            if not text:
                continue

            # 영어/숫자/기본 문장부호만 허용 → 네모(□) 방지
            text = re.sub(r"[^A-Za-z0-9 .,!?\"':;()\-_/]", "", text)
            if not text.strip():
                continue

            parsed_blocks.append(
                {
                    "text": text,
                    "position": b.get("position", "bottom"),
                    "color": b.get("color", "white"),
                    "font_face": (b.get("font_face") or "impact").lower().strip(),
                    "emphasis": (b.get("emphasis") or "normal").lower().strip(),
                }
            )

        if parsed_blocks:
            designs.append(parsed_blocks)

    if not designs:
        return {"error": "no_captions"}

    # 기존 코드와 호환되도록 flat captions도 같이 리턴
    flat_captions = [block for blocks in designs for block in blocks]

    return {
        "captions": flat_captions,
        "designs": designs,
        "model_used": model_name,
    }


# ------------------------------------------------------
# 2) 텍스트 래핑 헬퍼
# ------------------------------------------------------
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


# ------------------------------------------------------
# 3) 실제 이미지 위에 텍스트/색 입히기
# ------------------------------------------------------
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

        # 안전하게 한 번 더 필터링 (이모지/이상한 유니코드 제거)
        text = re.sub(r"[^A-Za-z0-9 .,!?\"':;()\-_/]", "", text)
        if not text.strip():
            continue

        emphasis = (cap.get("emphasis") or "normal").lower().strip()
        if emphasis not in ["normal", "bold", "italic", "bold_italic"]:
            emphasis = "normal"

        font_size = cap.get("font_size")
        if not font_size:
            font_size = int(H * 0.10)  # 기본: 높이의 10%

        if emphasis in ["bold", "bold_italic"]:
            font_size = int(font_size * 1.05)

        if font_size < 48:
            font_size = 48

        font_key = (cap.get("font_face") or "impact").lower().strip()
        font_file = FONT_FILES.get(
            (font_key, emphasis),
            FONT_FILES.get((font_key, "normal"), "MarkerFelt.ttc"),
        )
        font_path = os.path.join(settings.BASE_DIR, "fonts", font_file)

        try:
            font = ImageFont.truetype(font_path, font_size)
        except Exception as e:
            print(f"⚠ 폰트 로드 실패 ({font_path}) → 기본 폰트 사용:", e)
            font = ImageFont.load_default()

        color = cap.get("color", "white")

        # stroke 기본값: 밝은 글자면 검정, 그 외엔 흰색
        stroke_color = cap.get("stroke_color")
        if not stroke_color:
            lower = str(color).lower()
            if lower in ["white", "#ffffff", "fff"]:
                stroke_color = "black"
            else:
                stroke_color = "white"

        stroke_width = cap.get("stroke_width")
        if not stroke_width:
            stroke_width = 6 if emphasis in ["bold", "bold_italic"] else 4

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


# ------------------------------------------------------
# 4) 사람/AI 밸런스 맞추기
# ------------------------------------------------------
def ensure_ai_balance_for_topic(
    topic: str,
    base_template: Optional[MemeTemplate] = None,
    min_ratio: float = 0.7,
    max_diff: int = 3,
    max_new: int = 5,
) -> None:
    """
    - topic 기준으로 human/ai 밈 개수 체크
    - human 대비 ai 최소 비율(min_ratio), 최대 차이(max_diff)를 만족하도록
      부족한 ai 밈을 자동 생성 (최대 max_new개)
    """
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

        # 가장 첫 블록만 사용 (간단 버전)
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
