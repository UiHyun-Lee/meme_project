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
# def log_ai_meme_call(model_name: str, topic: str, template_url: str, prompt: str, raw_response: str) -> None:
#
#     try:
#         log_dir = os.path.join(settings.BASE_DIR, "ai_logs")
#         os.makedirs(log_dir, exist_ok=True)
#
#         log_path = os.path.join(log_dir, "meme_design.log")
#         record = {
#             "model": model_name,
#             "topic": topic,
#             "template_url": template_url,
#             "prompt": prompt,
#             "raw_response": raw_response[:4000],
#         }
#         with open(log_path, "a", encoding="utf-8") as f:
#             f.write(json.dumps(record, ensure_ascii=False) + "\n")
#     except Exception as e:
#         print("AI meme log error:", repr(e))
#
#
# def generate_ai_meme_design(
#     topic: str,
#     category_name: str,
#     template_desc: str,
#     template_url: str,
# ) -> dict:
#
#     # settings
#     main_model = getattr(settings, "OPENAI_VISION_MODEL_MAIN", "gpt-4o")
#     # alt_model = getattr(settings, "OPENAI_VISION_MODEL_ALT", None)
#     # model_candidates = [m for m in [main_model, alt_model] if m]
#
#     model_name = main_model
#
#     prompt = f"""
# You are an expert meme designer AI.
#
# This week’s global meme TOPIC is:
# - "{topic}"
#
# You are given a meme template image (attached image). Analyze the image carefully:
# - Detect how many panels it has (1-panel, 2-panel like Drake, 3+ panels, etc.).
# - Detect where the main subject(s) and the empty text areas are.
# - Infer the typical meme usage of this template if it is a well-known meme format.
# - Based on this layout, decide how many caption blocks (1 to 3) are appropriate.
# - Choose correct placement ("top", "center", "bottom") for each block based on the image composition.
# - All captions MUST clearly relate to the given TOPIC.
#
# For this SINGLE template image, create between 3 and 5 different meme ideas.
#
# You MUST respond with ONLY one JSON object with this structure:
#
# {{
#   "memes": [
#     {{
#       "blocks": [
#         {{
#           "text": "first text block for this meme",
#           "position": "top",
#           "color": "#ff00cc",
#           "emphasis": "bold",
#           "font_face": "impact"
#         }},
#         {{
#           "text": "second text block (if needed)",
#           "position": "bottom",
#           "color": "deepskyblue",
#           "emphasis": "normal",
#           "font_face": "arial"
#         }}
#       ]
#     }},
#     {{
#       "blocks": [
#         {{
#           "text": "single line meme text for this idea",
#           "position": "center",
#           "color": "rgb(120, 220, 50)",
#           "emphasis": "italic",
#           "font_face": "impact"
#         }}
#       ]
#     }}
#   ]
# }}
#
# Rules:
# - The top-level object MUST have exactly one key: "memes".
# - "memes" MUST be a non-empty array with 3 to 5 elements.
# - Each element in "memes" MUST have exactly one key: "blocks".
# - "blocks" MUST be a non-empty array with 1 to 3 elements.
# - Each block MUST have exactly five keys:
#   - "text": string
#   - "position": "top", "bottom", or "center"
#   - "color": string (ANY valid CSS color or hex like "#FFFFFF")
#   - "emphasis": "normal", "bold", "italic", or "bold_italic"
#   - "font_face": one of "impact" or "arial"
# - All captions MUST be written in simple English.
# - Do NOT use emojis.
# - Do NOT use non-Latin scripts (no Korean, Chinese, Arabic, etc.).
# - Avoid fancy Unicode symbols; use normal ASCII characters only.
# - Do NOT include any other keys or comments.
# - Do NOT wrap the JSON in backticks.
# - The response MUST be valid JSON.
# """
#
#     raw_for_log = ""
#
#     try:
#         response = client.chat.completions.create(
#             model=model_name,
#             temperature=0.1,  # or 0
#             response_format={"type": "json_object"},
#             messages=[
#                 {
#                     "role": "system",
#                     "content": (
#                         "You are a JSON generator. "
#                         "You MUST respond with a single valid JSON object only. "
#                         "No explanations, no comments, no extra text."
#                     ),
#                 },
#                 {
#                     "role": "user",
#                     "content": [
#                         {"type": "text", "text": prompt.strip()},
#                         {"type": "image_url", "image_url": {"url": template_url}},
#                     ],
#                 },
#             ],
#             max_tokens=1500,
#         )
#     except Exception as e:
#         print("OpenAI error:", repr(e))
#         return {"error": f"openai_error: {str(e)}"}
#
#     msg = response.choices[0].message
#
#     # structured output
#     if hasattr(msg, "parsed") and msg.parsed is not None:
#         raw_data = msg.parsed
#         raw_for_log = json.dumps(raw_data, ensure_ascii=False)
#     else:
#         raw = msg.content or ""
#         raw_for_log = raw
#         try:
#             raw_data = json.loads(raw)
#         except Exception as e:
#             print("JSON parse error:", e)
#             print("RAW FROM OPENAI:", raw[:600])
#             log_ai_meme_call(model_name, topic, template_url, prompt.strip(), raw)
#             return {
#                 "error": "json_parse_error",
#                 "detail": str(e),
#                 "raw": raw[:600],
#             }
#
#     try:
#         log_ai_meme_call(model_name, topic, template_url, prompt.strip(), raw_for_log)
#     except Exception:
#         pass
#
#     memes = raw_data.get("memes", []) or []
#     if not isinstance(memes, list):
#         return {"error": "invalid_response", "detail": "'memes' is not a list"}
#
#     designs: list[list[dict]] = []
#
#     for m in memes:
#         if not isinstance(m, dict):
#             continue
#
#         blocks = m.get("blocks") or []
#         if not isinstance(blocks, list):
#             continue
#
#         parsed_blocks = []
#         for b in blocks:
#             if not isinstance(b, dict):
#                 continue
#
#             text = (b.get("text") or "").strip()
#             if not text:
#                 continue
#
#             text = re.sub(r"[^A-Za-z0-9 .,!?\"':;()\-_/]", "", text)
#             if not text.strip():
#                 continue
#
#             parsed_blocks.append(
#                 {
#                     "text": text,
#                     "position": b.get("position", "bottom"),
#                     "color": b.get("color", "white"),
#                     "font_face": (b.get("font_face") or "impact").lower().strip(),
#                     "emphasis": (b.get("emphasis") or "normal").lower().strip(),
#                 }
#             )
#
#         if parsed_blocks:
#             designs.append(parsed_blocks)
#
#     if not designs:
#         return {"error": "no_captions"}
#
#     flat_captions = [block for blocks in designs for block in blocks]
#
#     return {
#         "captions": flat_captions,
#         "designs": designs,
#         "model_used": model_name,
#     }
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
#     # FONT_FILES = {
#     #     ("impact", "normal"): "MarkerFelt.ttc",
#     #     ("impact", "bold"): "MarkerFelt.ttc",
#     #     ("impact", "italic"): "MarkerFelt.ttc",
#     #     ("impact", "bold_italic"): "MarkerFelt.ttc",
#     #     ("arial", "normal"): "ArialHB.ttc",
#     #     ("arial", "bold"): "ArialHB.ttc",
#     #     ("arial", "italic"): "NewYorkItalic.ttf",
#     #     ("arial", "bold_italic"): "NewYorkItalic.ttf",
#     # }
#
#     FONT_FILES = {
#         "impact": "MarkerFelt.ttc",
#         "arial": "Geneva.ttf",
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
#         font_family = (cap.get("font_face") or "impact").lower().strip()
#         if font_family not in FONT_FILES:
#             font_family = "impact"
#
#         font_file = FONT_FILES[font_family]
#         font_path = os.path.join(settings.BASE_DIR, "fonts", font_file)
#
#         try:
#             font = ImageFont.truetype(font_path, font_size)
#         except Exception as e:
#             print(f"⚠ font load failed({font_path})", e)
#             font = ImageFont.load_default()
#
#         color = cap.get("color", "white")
#
#         # stroke default
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
#             stroke_width = 6 if emphasis in ["bold", "bold_italic"] else 4
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
#     topic: str,
#     base_template: Optional[MemeTemplate] = None,
#     min_ratio: float = 0.7,
#     max_diff: int = 3,
#     max_new: int = 1,  # Todo : ??
# ) -> None:
#
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
from io import BytesIO
from typing import Optional
import base64
import requests
from PIL import Image, ImageDraw, ImageFont
import cloudinary.uploader
from openai import OpenAI
from django.conf import settings

from .models import MemeTemplate, Meme
import numpy as np

try:
    import cv2
except Exception:
    cv2 = None


client = OpenAI(api_key=settings.OPENAI_API_KEY)


def log_ai_meme_call(model_name: str, topic: str, template_url: str, prompt: str, raw_response: str) -> None:

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
        print("AI meme log error:", repr(e))

def _detect_faces_pil(pil_image: Image.Image):
    """
    Returns a list of face rectangles: [(x, y, w, h), ...] in pixel coords.
    Uses OpenCV Haar cascades. If cv2 is not available, returns [].
    """
    if cv2 is None:
        return []

    # PIL(RGB) -> OpenCV(BGR)
    img_rgb = np.array(pil_image.convert("RGB"))
    img_bgr = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Haar cascade path (opencv 설치 시 기본 제공)
    try:
        cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    except Exception:
        return []

    face_cascade = cv2.CascadeClassifier(cascade_path)
    if face_cascade.empty():
        return []

    # detectMultiScale params are relatively safe defaults
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(40, 40),
    )

    # faces is array of (x,y,w,h)
    rects = []
    for (x, y, w, h) in faces:
        rects.append((int(x), int(y), int(w), int(h)))
    return rects


def _inflate_rect(rect, pad_x, pad_y, W, H):
    x, y, w, h = rect
    nx = max(0, x - pad_x)
    ny = max(0, y - pad_y)
    nw = min(W - nx, w + 2 * pad_x)
    nh = min(H - ny, h + 2 * pad_y)
    return (nx, ny, nw, nh)


def _rects_intersect(a, b):
    ax, ay, aw, ah = a
    bx, by, bw, bh = b
    return not (ax + aw <= bx or bx + bw <= ax or ay + ah <= by or by + bh <= ay)


def _overlaps_any_face(text_rect, face_rects):
    for fr in face_rects:
        if _rects_intersect(text_rect, fr):
            return True
    return False



def generate_ai_meme_design(
    topic: str,
    category_name: str,
    template_desc: str,
    template_url: str,
) -> dict:

    # settings
    main_model = getattr(settings, "OPENAI_VISION_MODEL_MAIN", "gpt-4o")
    # alt_model = getattr(settings, "OPENAI_VISION_MODEL_ALT", None)
    # model_candidates = [m for m in [main_model, alt_model] if m]

    model_name = main_model

    prompt = f"""
    You are an expert meme designer AI.

    This week’s global meme TOPIC is:
    - "{topic}"

    You are given a meme template image (attached image). Analyze it carefully:
    - Detect how many panels it has (1-panel, 2-panel, 3+ panels).
    - Detect where the main subjects are (faces/people/important objects).
    - Detect empty areas suitable for text.
    - Decide how many caption blocks (1 to 3) are appropriate for each meme idea.
    - For each block, output an EXACT caption rectangle as a normalized bounding box.

    IMPORTANT: Bounding box format:
    - box.x, box.y, box.w, box.h are floats in [0,1]
    - x,y is the top-left corner
    - The box must lie fully inside the image
    - Choose boxes that do NOT cover faces or important subjects
    - Prefer low-detail/empty regions
    - For multi-panel memes, choose boxes inside the correct panel area

    Create between 3 and 5 different meme ideas for this single template.

    You MUST respond with ONLY one JSON object:

    {{
      "memes": [
        {{
          "blocks": [
            {{
              "text": "short meme text (max 8 words)",
              "box": {{"x": 0.05, "y": 0.05, "w": 0.90, "h": 0.18}},
              "color": "white",
              "emphasis": "bold",
              "font_face": "impact"
            }}
          ]
        }}
      ]
    }}

    Rules:
    - Top-level object must have exactly one key: "memes"
    - memes: array with 3 to 5 elements
    - each memes[i] has exactly one key: "blocks"
    - blocks: array with 1 to 3 elements
    - each block MUST have exactly these keys:
      - text (string)
      - box (object with x,y,w,h floats in [0,1])
      - color (string)
      - emphasis ("normal","bold","italic","bold_italic")
      - font_face ("impact" or "arial")
    - Text must be natural, meme-like English. No emojis. ASCII only.
    - Return valid JSON only (no backticks).
    
    CRITICAL SEMANTIC RULES:

Each meme idea MUST express exactly ONE coherent idea.

If a meme has multiple text blocks:
- All blocks MUST be semantically connected.
- The blocks together must form a clear relation such as:
  - contrast (A vs B)
  - cause vs consequence
  - expectation vs reality
  - rejection vs preference
- Do NOT generate independent or unrelated statements.
- A viewer must immediately understand why the blocks belong together.

    """

    raw_for_log = ""

    # 1) 항상 https로
    template_url_https = _force_https(template_url)

    # 2) 우선 https URL로 시도
    image_payload_url = template_url_https

    # 3) 혹시 실패하면 data URL(base64)로 fallback 하도록 try/except 2단계 호출
    try:
        response = client.chat.completions.create(
            model=model_name,
            temperature=0.1,
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
                        {"type": "image_url", "image_url": {"url": image_payload_url}},
                    ],
                },
            ],
            max_tokens=1500,
        )
    except Exception as e:
        # URL 방식이 실패하면, base64(data URL) 방식으로 재시도
        print("OpenAI URL image failed, retrying with data URL:", repr(e))

        try:
            data_url = _image_url_to_data_url(template_url_https)
        except Exception as dl_err:
            print("Image download failed:", repr(dl_err))
            return {"error": f"image_download_error: {str(dl_err)}"}

        try:
            response = client.chat.completions.create(
                model=model_name,
                temperature=0.1,
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
                            {"type": "image_url", "image_url": {"url": data_url}},
                        ],
                    },
                ],
                max_tokens=1500,
            )
        except Exception as e2:
            print("OpenAI data URL retry failed:", repr(e2))
            return {"error": f"openai_error: {str(e2)}"}

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

    # flat_captions = [block for blocks in designs for block in blocks]

    return {
        # "captions": flat_captions,
        "designs": designs,
        "model_used": model_name,
    }


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
    resp = requests.get(template_url, timeout=15)
    resp.raise_for_status()

    image = Image.open(BytesIO(resp.content)).convert("RGB")
    draw = ImageDraw.Draw(image)
    W, H = image.size

    # 얼굴 감지 (없으면 [])
    face_rects = _detect_faces_pil(image)

    # 얼굴 영역을 조금 크게 잡아서(패딩) 텍스트가 가까이 붙는 것도 방지
    if face_rects:
        pad_x = int(W * 0.06)
        pad_y = int(H * 0.06)
        face_rects = [_inflate_rect(r, pad_x, pad_y, W, H) for r in face_rects]

    FONT_FILES = {
        "impact": "MarkerFelt.ttc",
        "arial": "Geneva.ttf",
    }

    def load_font(font_face: str, font_size: int):
        font_face = (font_face or "impact").lower().strip()
        if font_face not in FONT_FILES:
            font_face = "impact"

        font_file = FONT_FILES[font_face]
        font_path = os.path.join(settings.BASE_DIR, "fonts", font_file)

        try:
            return ImageFont.truetype(font_path, font_size)
        except Exception as e:
            print(f"⚠ font load failed({font_path})", e)
            return ImageFont.load_default()

    def normalize_pos(pos: str, text: str):
        pos = (pos or "bottom").lower().strip()
        if pos not in ("top", "center", "bottom"):
            pos = "bottom"

        # center는 얼굴/주요오브젝트 가릴 확률이 커서 기본 회피
        if pos == "center":
            pos = "top" if len(text) <= 35 else "bottom"
        return pos

    def choose_color_defaults(color: str):
        color = color or "white"
        lower = str(color).lower()
        if lower in ["white", "#ffffff", "fff"]:
            return color, "black"
        return color, "white"

    # 후보 위치를 여러 개 시험해서(좌/중/우 + top/bottom) 얼굴 안 가리는 걸 선택
    def candidate_positions(base_pos: str, text_w: int, text_h: int):
        margin_y = int(H * 0.05)
        margin_x = int(W * 0.05)

        # x 후보: left / center / right
        x_left = margin_x
        x_center = int((W - text_w) / 2)
        x_right = int(W - text_w - margin_x)

        # y 후보: top / bottom
        y_top = margin_y
        y_bottom = int(H - text_h - margin_y)

        # 기본 포지션 우선순위
        if base_pos == "top":
            order = [
                (x_center, y_top),
                (x_left, y_top),
                (x_right, y_top),
                (x_center, y_bottom),
                (x_left, y_bottom),
                (x_right, y_bottom),
            ]
        elif base_pos == "bottom":
            order = [
                (x_center, y_bottom),
                (x_left, y_bottom),
                (x_right, y_bottom),
                (x_center, y_top),
                (x_left, y_top),
                (x_right, y_top),
            ]
        else:
            # center는 이미 normalize에서 거의 안 오지만, 혹시 몰라 fallback
            y_center = int((H - text_h) / 2)
            order = [
                (x_center, y_center),
                (x_left, y_top),
                (x_right, y_top),
                (x_left, y_bottom),
                (x_right, y_bottom),
            ]

        # 화면 밖으로 나가지 않게 클램프
        fixed = []
        for x, y in order:
            x = max(0, min(W - text_w, x))
            y = max(0, min(H - text_h, y))
            fixed.append((x, y))
        return fixed

    # 텍스트를 최대 폭에 맞게 줄바꿈
    def wrap_text(draw, text, font, max_width, stroke_width=0):
        return _wrap_text_to_width(draw, text, font, max_width, stroke_width=stroke_width)

    for cap in captions:
        text = (cap.get("text") or "").strip()
        if not text:
            continue

        # ASCII만 (기존 로직 유지)
        text = re.sub(r"[^A-Za-z0-9 .,!?\"':;()\-_/]", "", text)
        if not text.strip():
            continue

        emphasis = (cap.get("emphasis") or "normal").lower().strip()
        if emphasis not in ["normal", "bold", "italic", "bold_italic"]:
            emphasis = "normal"

        base_font_size = cap.get("font_size")
        if not base_font_size:
            base_font_size = int(H * 0.10)

        if emphasis in ["bold", "bold_italic"]:
            base_font_size = int(base_font_size * 1.05)

        # 너무 작으면 가독성 깨짐
        if base_font_size < 48:
            base_font_size = 48

        font_face = (cap.get("font_face") or "impact").lower().strip()
        color = cap.get("color", "white")
        color, stroke_color = choose_color_defaults(color)

        stroke_width = cap.get("stroke_width")
        if not stroke_width:
            stroke_width = 6 if emphasis in ["bold", "bold_italic"] else 4

        pos = normalize_pos(cap.get("position"), text)

        # ✅ 핵심: 폰트 사이즈 자동 조절 (너무 커서 얼굴 회피가 불가능할 때 대비)
        # 시도: base_font_size부터 점점 줄여서 "얼굴 안가림 가능한 위치" 찾기
        # (무한 루프 방지)
        chosen = None
        chosen_font = None
        chosen_wrapped = None

        # 텍스트가 들어갈 최대 폭은 이미지의 90%
        max_text_width = int(W * 0.90)

        # 폰트 크기를 단계적으로 줄이며 시도
        for font_size in [base_font_size, int(base_font_size * 0.9), int(base_font_size * 0.8), int(base_font_size * 0.7), 48]:
            font = load_font(font_face, font_size)
            wrapped = wrap_text(draw, text, font, max_text_width, stroke_width=stroke_width)

            bbox = draw.textbbox((0, 0), wrapped, font=font, stroke_width=stroke_width)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]

            # 후보 위치들 중 얼굴과 안 겹치는 첫 번째를 선택
            for (x, y) in candidate_positions(pos, text_w, text_h):
                text_rect = (int(x), int(y), int(text_w), int(text_h))

                if face_rects and _overlaps_any_face(text_rect, face_rects):
                    continue

                chosen = (x, y)
                chosen_font = font
                chosen_wrapped = wrapped
                break

            if chosen is not None:
                break

        # 그래도 못 찾으면(얼굴이 너무 크거나 텍스트가 너무 큼):
        # 얼굴 무시하고 base 위치로라도 그린다 (서비스 다운 방지)
        if chosen is None:
            font = load_font(font_face, base_font_size)
            wrapped = wrap_text(draw, text, font, max_text_width, stroke_width=stroke_width)
            bbox = draw.textbbox((0, 0), wrapped, font=font, stroke_width=stroke_width)
            text_w = bbox[2] - bbox[0]
            text_h = bbox[3] - bbox[1]
            # base pos 중심
            if pos == "top":
                chosen = (int((W - text_w) / 2), int(H * 0.05))
            elif pos == "bottom":
                chosen = (int((W - text_w) / 2), int(H - text_h - H * 0.05))
            else:
                chosen = (int((W - text_w) / 2), int((H - text_h) / 2))
            chosen_font = font
            chosen_wrapped = wrapped

        x, y = chosen

        draw.text(
            (x, y),
            chosen_wrapped,
            font=chosen_font,
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
    max_new: int = 1,  # Todo : ??
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

        designs = design.get("designs") or []
        if not designs:
            continue

        blocks = designs[0]  # ✅ 블록 묶음 1세트 = 밈 1개

        try:
            public_id = apply_ai_text_to_image(template_image_url, blocks)
        except Exception as e:
            print("apply_ai_text_to_image balance error:", repr(e))
            continue

        full_caption = " / ".join([b.get("text", "") for b in blocks]).strip()

        try:
            Meme.objects.create(
                template=template,
                image=public_id,
                caption=full_caption,
                created_by="ai",
                format="macro",
                topic=topic,
            )
        except Exception as e:
            print("Meme create error during balance:", repr(e))
            continue

def _force_https(url: str) -> str:
    if not url:
        return url
    return url.replace("http://", "https://")


def _image_url_to_data_url(url: str) -> str:
    """
    Download image ourselves and convert to data URL (base64),
    so OpenAI doesn't need to fetch Cloudinary directly.
    """
    url = _force_https(url)
    r = requests.get(url, timeout=20, headers={"User-Agent": "meme-battle-bot/1.0"})
    r.raise_for_status()

    content_type = r.headers.get("Content-Type", "image/png")
    b64 = base64.b64encode(r.content).decode("utf-8")
    return f"data:{content_type};base64,{b64}"