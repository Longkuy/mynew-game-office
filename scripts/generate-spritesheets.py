#!/usr/bin/env python3
"""
60 FPS Anime-Pixel SpriteSheet Generator for Our Final Year (11 Characters)
High-craft rounded anime pixel proportions (48x64 per frame):
  - 4 animation rows: idle, walk, run, talk
  - 60 frames per row -> 2880 x 256 px (240 frames per character)
  - Matching engine-ready JSON Atlas (Godot / Unity / Phaser / HTML5 Canvas)
"""
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw

FRAME_W = 48
FRAME_H = 64
FRAMES_PER_ROW = 60
ANIMATIONS = ["idle", "walk", "run", "talk"]

OUTLINE = (45, 27, 24, 255)  # Warm dark-brown anime pixel outline (#2D1B18)

def hex_rgba(h, a=255):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), a)

def darken(rgba, factor=0.72):
    return (int(rgba[0] * factor), int(rgba[1] * factor), int(rgba[2] * factor), rgba[3])

CHARACTERS = [
    {
        "id": "01_Time", "name": "ไทม์ (Time)", "gender": "male",
        "skin": "#EFC098", "skinS": "#D49B71", "hair": "#3A241B", "hairH": "#634133", "hairStyle": "boyMessy",
        "eye": "#4A2C1D", "top": "#FFFFFF", "topS": "#D2DCE8", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#F1F5F9", "accent": "#5D6B41", "prop": "oliveBag"
    },
    {
        "id": "02_Rin", "name": "ริน (Rin)", "gender": "female",
        "skin": "#FBE0CB", "skinS": "#E3B898", "hair": "#1B2640", "hairH": "#3B5285", "hairStyle": "longStraight",
        "eye": "#1E3A5F", "top": "#FFFFFF", "topS": "#D2DCE8", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#3B2416", "accent": "#1E3A8A", "prop": "hairpin"
    },
    {
        "id": "03_Mind", "name": "มายด์ (Mind)", "gender": "female",
        "skin": "#F6D2B5", "skinS": "#DBA780", "hair": "#6E3F28", "hairH": "#A36443", "hairStyle": "halfUp",
        "eye": "#63381E", "top": "#FFFFFF", "topS": "#D2DCE8", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#F1F5F9", "accent": "#FACC15", "prop": "yellowRibbon"
    },
    {
        "id": "04_Scene", "name": "ซีน (Scene)", "gender": "female",
        "skin": "#F9DFD0", "skinS": "#DFB8A2", "hair": "#2A1F36", "hairH": "#533F6B", "hairStyle": "bob",
        "eye": "#3D2B52", "top": "#6D7564", "topS": "#4F5748", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#475569", "accent": "#94A3B8", "prop": "camera"
    },
    {
        "id": "05_Ava", "name": "เอวา (Ava)", "gender": "female",
        "skin": "#F2C7A5", "skinS": "#D49F78", "hair": "#7C2D23", "hairH": "#B54A3C", "hairStyle": "ponytail",
        "eye": "#7C2D12", "top": "#FFFFFF", "topS": "#D2DCE8", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#1E293B", "accent": "#9F1239", "prop": "apronHeadphones"
    },
    {
        "id": "06_Luna", "name": "ลูน่า (Luna)", "gender": "female",
        "skin": "#F4ECEA", "skinS": "#D8C8C4", "hair": "#191724", "hairH": "#3A3652", "hairStyle": "sideBraid",
        "eye": "#475569", "top": "#2B2738", "topS": "#1B1824", "bot": "#1F2029", "botS": "#111218",
        "shoe": "#1E1B24", "accent": "#B8BCC8", "prop": "book"
    },
    {
        "id": "07_Prim", "name": "พริม (Prim)", "gender": "female",
        "skin": "#FBE2CE", "skinS": "#E2B99B", "hair": "#F2C97D", "hairH": "#E88D96", "hairStyle": "wavyTips",
        "eye": "#B43E55", "top": "#FFFFFF", "topS": "#D2DCE8", "bot": "#3B82A6", "botS": "#245773",
        "shoe": "#3B2416", "accent": "#4ECDC4", "prop": "tealTie"
    },
    {
        "id": "08_Mean", "name": "มีน (Mean)", "gender": "female",
        "skin": "#FCE3D2", "skinS": "#E3BAA0", "hair": "#7A585B", "hairH": "#A87E82", "hairStyle": "lowPonytail",
        "eye": "#3B66B8", "top": "#8FA6D4", "topS": "#6B82B3", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#1E293B", "accent": "#3B4CCA", "prop": "blueHeadphones"
    },
    {
        "id": "09_Faye", "name": "เฟย์ (Faye)", "gender": "female",
        "skin": "#F9D8C0", "skinS": "#DFAF8F", "hair": "#6B3B28", "hairH": "#9C5B3E", "hairStyle": "twintails",
        "eye": "#B8352E", "top": "#4A332D", "topS": "#32201C", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#4A2C20", "accent": "#C83E37", "prop": "fayeGlasses"
    },
    {
        "id": "10_Nicha", "name": "นิชา (Nicha)", "gender": "female",
        "skin": "#FCE0D2", "skinS": "#E3B8A5", "hair": "#A63D55", "hairH": "#D9667E", "hairStyle": "bob",
        "eye": "#7F1D3A", "top": "#FFFFFF", "topS": "#D2DCE8", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#1E293B", "accent": "#1F2421", "prop": "headband"
    },
    {
        "id": "11_Guy", "name": "กาย (Guy)", "gender": "male",
        "skin": "#D9A47A", "skinS": "#B88158", "hair": "#2D241E", "hairH": "#544338", "hairStyle": "boySpiky",
        "eye": "#3A2318", "top": "#FFFFFF", "topS": "#D2DCE8", "bot": "#1E293B", "botS": "#0F172A",
        "shoe": "#1E293B", "accent": "#D97706", "prop": "varsityBandage"
    }
]

def draw_seg(draw, x0, y0, x1, y1, radius, color):
    steps = max(int(math.hypot(x1 - x0, y1 - y0) * 2.5), 1)
    for i in range(steps + 1):
        t = i / steps
        x = x0 + (x1 - x0) * t
        y = y0 + (y1 - y0) * t
        draw.ellipse([round(x - radius), round(y - radius), round(x + radius), round(y + radius)], fill=color)

def render_frame(ch, anim, frame_idx, total_frames=FRAMES_PER_ROW):
    """Render one crisp 48x64 rounded anime pixel-art frame with selective outline."""
    img = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    phase = (frame_idx / total_frames) * 2.0 * math.pi
    skin = hex_rgba(ch["skin"])
    skinS = hex_rgba(ch["skinS"])
    hair = hex_rgba(ch["hair"])
    hairH = hex_rgba(ch["hairH"])
    hairD = darken(hair, 0.72)
    eye = hex_rgba(ch["eye"])
    top = hex_rgba(ch["top"])
    topS = hex_rgba(ch["topS"])
    bot = hex_rgba(ch["bot"])
    botS = hex_rgba(ch["botS"])
    shoe = hex_rgba(ch["shoe"])
    accent = hex_rgba(ch["accent"])
    white = (255, 255, 255, 255)
    dark_tights = (36, 33, 44, 255)
    apron_col = (74, 34, 15, 255)

    lean = 0.0
    bob = 0.0
    leg_amp = 0.0
    arm_amp = 0.0
    hair_sway = math.sin(phase - 0.6) * 0.9
    talking = False

    if anim == "idle":
        bob = math.sin(phase) * 0.85
        arm_amp = 0.5
        hair_sway = math.sin(phase - 0.5) * 1.1
    elif anim == "walk":
        bob = abs(math.sin(phase)) * -1.8
        lean = 0.9
        leg_amp = 5.4
        arm_amp = 4.8
        hair_sway = math.sin(phase - 0.85) * 2.4 - 0.6
    elif anim == "run":
        bob = abs(math.sin(phase)) * -2.8 + 1.0
        lean = 2.8
        leg_amp = 7.6
        arm_amp = 7.0
        hair_sway = math.sin(phase - 1.0) * 3.8 - 2.6
    elif anim == "talk":
        bob = math.sin(phase * 2.0) * 0.65
        arm_amp = 2.0
        talking = (math.sin(phase * 4.0) > 0.0)
        hair_sway = math.sin(phase - 0.4) * 1.1

    cx = 24.0
    hip_y = 40.0 + bob
    sh_y = 27.0 + bob
    head_x = cx + lean
    head_y = 15.0 + bob

    stride = math.sin(phase)
    lift_f = max(0.0, -math.cos(phase)) * (2.6 if anim == "run" else (1.5 if anim == "walk" else 0.0))
    lift_b = max(0.0, math.cos(phase)) * (2.6 if anim == "run" else (1.5 if anim == "walk" else 0.0))

    # --- 1) BACK HAIR (flowing curved anime hair locks) ---
    hs = ch["hairStyle"]
    if hs == "longStraight":
        d.polygon([
            (round(head_x - 6), round(head_y - 4)),
            (round(head_x + 1), round(head_y - 4)),
            (round(head_x - 1 + hair_sway * 0.5), round(head_y + 27)),
            (round(head_x - 9 + hair_sway * 0.9), round(head_y + 25)),
        ], fill=hair)
        d.line([(round(head_x - 5), round(head_y + 2)), (round(head_x - 6 + hair_sway * 0.6), round(head_y + 22))], fill=hairD, width=1)
    elif hs == "twintails":
        # Distinct high arched back twin-tail (Faye signature!)
        draw_seg(d, head_x - 5, head_y - 5, head_x - 10 + hair_sway * 0.4, head_y + 2, 2.4, hair)
        draw_seg(d, head_x - 10 + hair_sway * 0.4, head_y + 2, head_x - 12 + hair_sway, head_y + 18, 2.0, hair)
        draw_seg(d, head_x - 11 + hair_sway, head_y + 18, head_x - 13 + hair_sway * 1.1, head_y + 22, 1.1, hair)
        draw_seg(d, head_x - 9 + hair_sway * 0.4, head_y + 1, head_x - 10 + hair_sway * 0.7, head_y + 10, 0.8, hairH)
        d.ellipse([round(head_x - 8), round(head_y - 7), round(head_x - 4), round(head_y - 3)], fill=accent)
    elif hs == "ponytail":
        draw_seg(d, head_x - 5, head_y - 4, head_x - 11 + hair_sway * 0.5, head_y + 3, 2.3, hair)
        draw_seg(d, head_x - 11 + hair_sway * 0.5, head_y + 3, head_x - 12 + hair_sway, head_y + 14, 1.7, hair)
        draw_seg(d, head_x - 10 + hair_sway * 0.5, head_y + 3, head_x - 11 + hair_sway * 0.7, head_y + 9, 0.7, hairH)
    elif hs == "lowPonytail":
        draw_seg(d, head_x - 6, head_y + 2, head_x - 11 + hair_sway, head_y + 14, 1.9, hair)
    elif hs == "halfUp":
        d.polygon([
            (round(head_x - 6), round(head_y - 2)),
            (round(head_x + 1), round(head_y - 2)),
            (round(head_x - 1 + hair_sway * 0.5), round(head_y + 16)),
            (round(head_x - 9 + hair_sway * 0.8), round(head_y + 15)),
        ], fill=hair)
        d.rectangle([round(head_x - 9 + hair_sway * 0.2), round(head_y - 3), round(head_x - 6 + hair_sway * 0.2), round(head_y + 1)], fill=accent)
    elif hs == "wavyTips":
        d.polygon([
            (round(head_x - 6), round(head_y - 3)),
            (round(head_x + 1), round(head_y - 3)),
            (round(head_x - 1 + hair_sway * 0.5), round(head_y + 18)),
            (round(head_x - 9 + hair_sway * 0.8), round(head_y + 17)),
        ], fill=hair)
        d.polygon([
            (round(head_x - 8 + hair_sway * 0.6), round(head_y + 14)),
            (round(head_x - 1 + hair_sway * 0.5), round(head_y + 14)),
            (round(head_x - 2 + hair_sway * 0.7), round(head_y + 23)),
            (round(head_x - 9 + hair_sway * 1.0), round(head_y + 22)),
        ], fill=hairH)
    elif hs == "sideBraid":
        d.polygon([
            (round(head_x - 6), round(head_y - 3)),
            (round(head_x + 1), round(head_y - 3)),
            (round(head_x - 2 + hair_sway * 0.4), round(head_y + 25)),
            (round(head_x - 9 + hair_sway * 0.7), round(head_y + 23)),
        ], fill=hair)
    elif hs == "bob":
        d.ellipse([round(head_x - 9), round(head_y - 6), round(head_x + 3), round(head_y + 10)], fill=hair)

    # --- 2) BACK ARM (with sleeve + bare forearm) ---
    b_arm_dx = -stride * arm_amp if anim in ("walk", "run") else (math.sin(phase) * arm_amp)
    b_elbow_x = cx + lean * 0.5 + 2 + b_arm_dx * 0.5
    b_elbow_y = sh_y + 6
    b_hand_x = cx + lean * 0.5 + 3 + b_arm_dx
    b_hand_y = sh_y + 12 - abs(b_arm_dx) * 0.2
    long_sleeve = ch["id"] in ("04_Scene", "06_Luna", "08_Mean", "09_Faye")
    draw_seg(d, cx + lean * 0.5 + 1, sh_y + 2, b_elbow_x, b_elbow_y, 1.5, topS)
    draw_seg(d, b_elbow_x, b_elbow_y, b_hand_x, b_hand_y, 1.2, topS if long_sleeve else skinS)
    d.ellipse([round(b_hand_x - 1.3), round(b_hand_y - 1.2), round(b_hand_x + 1.3), round(b_hand_y + 1.4)], fill=skinS)

    # --- 3) BACK LEG (slimmer ankle & knee bend) ---
    b_foot_x = cx - stride * leg_amp
    b_foot_y = 58.0 - lift_b
    b_knee_x = (cx + b_foot_x) * 0.5 + (1.4 if anim in ("walk", "run") else 0.5)
    b_knee_y = (hip_y + 3 + b_foot_y) * 0.5 - lift_b * 0.35
    leg_col_b = botS if ch["gender"] == "male" else (dark_tights if ch["prop"] == "blueHeadphones" else skinS)
    draw_seg(d, cx - 1, hip_y + 2, b_knee_x, b_knee_y, 1.7, leg_col_b)
    draw_seg(d, b_knee_x, b_knee_y, b_foot_x, b_foot_y - 2, 1.3, leg_col_b)
    if ch["gender"] == "female" and ch["prop"] != "blueHeadphones":
        sock_col = (30, 32, 42, 255) if ch["id"] in ("02_Rin", "06_Luna") else white
        draw_seg(d, (b_knee_x + b_foot_x) * 0.5, (b_knee_y + b_foot_y - 2) * 0.5, b_foot_x, b_foot_y - 2, 1.3, sock_col)
    d.rounded_rectangle([round(b_foot_x - 2), round(b_foot_y - 2), round(b_foot_x + 3), round(b_foot_y + 1)], radius=1, fill=shoe)

    # --- 4) FRONT LEG ---
    f_foot_x = cx + stride * leg_amp
    f_foot_y = 58.0 - lift_f
    f_knee_x = (cx + f_foot_x) * 0.5 + (1.6 if anim in ("walk", "run") else 0.5)
    f_knee_y = (hip_y + 3 + f_foot_y) * 0.5 - lift_f * 0.35
    leg_col_f = bot if ch["gender"] == "male" else (dark_tights if ch["prop"] == "blueHeadphones" else skin)
    draw_seg(d, cx + 1, hip_y + 2, f_knee_x, f_knee_y, 1.8, leg_col_f)
    draw_seg(d, f_knee_x, f_knee_y, f_foot_x, f_foot_y - 2, 1.35, leg_col_f)
    if ch["gender"] == "female" and ch["prop"] != "blueHeadphones":
        sock_col = (35, 38, 50, 255) if ch["id"] in ("02_Rin", "06_Luna") else white
        draw_seg(d, (f_knee_x + f_foot_x) * 0.5, (f_knee_y + f_foot_y - 2) * 0.5, f_foot_x, f_foot_y - 2, 1.35, sock_col)
    d.rounded_rectangle([round(f_foot_x - 2), round(f_foot_y - 2), round(f_foot_x + 3.5), round(f_foot_y + 1)], radius=1, fill=shoe)

    # --- 5) TORSO & SKIRT / TROUSERS ---
    tx = round(cx + lean * 0.45)
    d.rounded_rectangle([tx - 4, round(sh_y), tx + 5, round(hip_y)], radius=2, fill=top)
    d.rectangle([tx - 4, round(sh_y + 1), tx - 2, round(hip_y - 1)], fill=topS)
    # Crisp sailor/shirt collar
    d.polygon([(tx - 1, round(sh_y - 1)), (tx + 4, round(sh_y - 1)), (tx + 5, round(sh_y + 2)), (tx + 1, round(sh_y + 2))], fill=white)
    if ch["gender"] == "female":
        d.polygon([(tx + 3, round(sh_y + 2)), (tx + 6, round(sh_y + 3)), (tx + 4, round(sh_y + 6)), (tx + 2, round(sh_y + 5))], fill=accent)

    if ch["gender"] == "female":
        skirt_len = 13 if ch["id"] == "06_Luna" else 9
        sway = round(stride * 1.6) if anim in ("walk", "run") else 0
        d.polygon([
            (tx - 4, round(hip_y - 1)),
            (tx + 5, round(hip_y - 1)),
            (tx + 7 + sway, round(hip_y + skirt_len)),
            (tx - 6 + sway, round(hip_y + skirt_len)),
        ], fill=bot)
        d.line([(tx - 1, round(hip_y)), (tx - 2 + sway, round(hip_y + skirt_len))], fill=botS, width=1)
        d.line([(tx + 3, round(hip_y)), (tx + 4 + sway, round(hip_y + skirt_len))], fill=botS, width=1)
    else:
        d.rectangle([tx - 4, round(hip_y - 2), tx + 5, round(hip_y + 4)], fill=bot)

    # Role-specific Torso Props
    if ch["prop"] == "apronHeadphones":
        d.rectangle([tx - 2, round(sh_y + 3), tx + 5, round(hip_y + 7)], fill=apron_col)
    elif ch["prop"] == "oliveBag":
        d.line([(tx - 3, round(sh_y + 1)), (tx + 3, round(hip_y + 1))], fill=accent, width=1)
        d.rounded_rectangle([tx - 8, round(hip_y - 1), tx - 2, round(hip_y + 5)], radius=1, fill=accent)
    elif ch["prop"] == "camera":
        d.rectangle([tx + 3, round(hip_y - 4), tx + 8, round(hip_y)], fill=(148, 163, 184, 255))
        d.rectangle([tx + 5, round(hip_y - 3), tx + 7, round(hip_y - 1)], fill=(30, 41, 59, 255))
    elif ch["prop"] == "varsityBandage":
        d.rounded_rectangle([tx - 8, round(sh_y + 1), tx - 3, round(hip_y + 3)], radius=1, fill=(30, 41, 59, 255))
        d.rectangle([tx - 7, round(sh_y + 2), tx - 5, round(hip_y + 1)], fill=accent)

    # --- 6) ROUNDED ANIME HEAD & EXPRESSIVE FACE ---
    hx, hy = round(head_x), round(head_y)
    # Neck
    d.rectangle([hx - 1, hy + 5, hx + 2, round(sh_y + 1)], fill=skinS)
    # Rounded anime face silhouette with gentle chin!
    d.ellipse([hx - 6, hy - 6, hx + 6, hy + 6], fill=skin)
    d.polygon([(hx - 3, hy + 3), (hx + 5, hy + 2), (hx + 4, hy + 6), (hx - 1, hy + 6)], fill=skin)
    d.line([(hx - 1, hy + 6), (hx + 3, hy + 6)], fill=skinS, width=1)
    d.point((hx + 6, hy + 2), fill=skin)  # tiny cute anime nose tip!

    # Natural eye blink on frames 45..49
    blinking = (45 <= frame_idx <= 49) and anim != "run"
    if blinking:
        d.line([(hx + 1, hy + 1), (hx + 4, hy + 1)], fill=OUTLINE, width=1)
    else:
        # Expressive luminous anime eye (Faye style!)
        d.rectangle([hx + 1, hy - 1, hx + 4, hy + 2], fill=white)
        d.rectangle([hx + 2, hy - 1, hx + 4, hy + 2], fill=eye)
        d.line([(hx + 1, hy - 2), (hx + 5, hy - 2)], fill=OUTLINE, width=1)  # upper eyelash!
        d.point((hx + 2, hy - 1), fill=white)  # sparkle!
    # Blush & Mouth
    d.rectangle([hx + 0, hy + 3, hx + 3, hy + 3], fill=(244, 114, 130, 150))
    if talking:
        d.rectangle([hx + 3, hy + 4, hx + 4, hy + 5], fill=(168, 66, 60, 255))
    else:
        d.line([(hx + 3, hy + 4), (hx + 4, hy + 4)], fill=(168, 66, 60, 255))

    if ch["prop"] == "varsityBandage":
        d.rectangle([hx + 4, hy + 1, hx + 6, hy + 2], fill=(245, 226, 200, 255))

    # --- 7) ROUNDED ANIME HAIR CROWN & FLUFFY BANGS ---
    d.ellipse([hx - 7, hy - 10, hx + 6, hy - 2], fill=hair)
    d.ellipse([hx - 7, hy - 6, hx - 1, hy + 4], fill=hair)
    # Soft hair highlight arc
    d.line([(hx - 3, hy - 7), (hx + 3, hy - 7)], fill=hairH, width=1)
    d.point((hx - 4, hy - 6), fill=hairH)
    # Layered bangs (non-blocky!)
    d.polygon([(hx - 2, hy - 6), (hx + 6, hy - 5), (hx + 6, hy - 2), (hx + 2, hy - 3)], fill=hair)
    d.line([(hx - 1, hy - 4), (hx - 2, hy + 3)], fill=hair, width=2)  # side lock framing cheek

    if hs in ("boyMessy", "boySpiky"):
        d.polygon([(hx - 4, hy - 9), (hx - 2, hy - 12), (hx, hy - 9)], fill=hair)
        d.polygon([(hx + 1, hy - 9), (hx + 4, hy - 11), (hx + 5, hy - 8)], fill=hair)
    elif hs == "twintails":
        # Front/side bouncy twin-tail!
        draw_seg(d, hx - 4, hy - 4, hx - 7 + hair_sway * 0.5, hy + 5, 2.0, hair)
        draw_seg(d, hx - 7 + hair_sway * 0.5, hy + 5, hx - 8 + hair_sway * 0.8, hy + 17, 1.6, hair)
        d.ellipse([hx - 6, hy - 7, hx - 2, hy - 3], fill=accent)
        d.point((hx - 4, hy - 5), fill=(250, 204, 21, 255))
    elif hs == "sideBraid":
        draw_seg(d, hx - 1, hy + 3, hx + 2 + hair_sway * 0.4, hy + 17, 1.3, hair)

    # Head/Neck Accessories (clean & crisp!)
    if ch["prop"] == "fayeGlasses":
        # Thin delicate round wire glasses (non-obstructive!)
        d.line([(hx + 1, hy - 2), (hx + 5, hy - 2)], fill=(120, 82, 58, 255), width=1)
        d.line([(hx + 1, hy + 3), (hx + 5, hy + 3)], fill=(120, 82, 58, 255), width=1)
        d.line([(hx + 0, hy - 1), (hx + 0, hy + 2)], fill=(120, 82, 58, 255), width=1)
        d.line([(hx + 6, hy - 1), (hx + 6, hy + 2)], fill=(120, 82, 58, 255), width=1)
    elif ch["prop"] == "hairpin":
        d.line([(hx - 3, hy - 4), (hx, hy - 4)], fill=(226, 232, 240, 255), width=1)
    elif ch["prop"] == "headband":
        d.arc([hx - 6, hy - 10, hx + 5, hy - 2], start=200, end=330, fill=(31, 36, 33, 255), width=2)
    elif ch["prop"] in ("apronHeadphones", "blueHeadphones"):
        hp_col = (220, 38, 38, 255) if ch["prop"] == "apronHeadphones" else (59, 76, 202, 255)
        d.rounded_rectangle([hx - 2, hy + 6, hx + 4, hy + 10], radius=1, fill=(30, 41, 59, 255))
        d.rectangle([hx, hy + 7, hx + 3, hy + 9], fill=hp_col)

    # --- 8) FRONT ARM WITH SUBTLE INTERNAL SEPARATION SHADOW ---
    f_arm_dx = stride * arm_amp if anim in ("walk", "run") else (-math.sin(phase) * arm_amp)
    if anim == "talk":
        f_elbow_x = tx + 2
        f_elbow_y = sh_y + 7
        f_hand_x = tx + 7 + math.sin(phase * 2.0) * 1.4
        f_hand_y = sh_y + 6 + math.cos(phase * 2.0) * 1.4
    else:
        f_elbow_x = tx - 1 + f_arm_dx * 0.45
        f_elbow_y = sh_y + 6
        f_hand_x = tx - 1 + f_arm_dx
        f_hand_y = sh_y + 12 - abs(f_arm_dx) * 0.22

    # Draw subtle 1px darker rim behind front arm so it NEVER disappears into white shirt!
    arm_rim = darken(topS, 0.72)
    draw_seg(d, tx - 1, sh_y + 2, f_elbow_x, f_elbow_y, 2.0, arm_rim)
    draw_seg(d, f_elbow_x, f_elbow_y, f_hand_x, f_hand_y, 1.7, arm_rim if long_sleeve else skinS)
    draw_seg(d, tx - 1, sh_y + 2, f_elbow_x, f_elbow_y, 1.4, top)
    draw_seg(d, f_elbow_x, f_elbow_y, f_hand_x, f_hand_y, 1.15, top if long_sleeve else skin)
    d.ellipse([round(f_hand_x - 1.3), round(f_hand_y - 1.2), round(f_hand_x + 1.3), round(f_hand_y + 1.4)], fill=skin)

    # --- 9) SELECTIVE CRISP 1PX DARK-BROWN PIXEL OUTLINE PASS ---
    px = img.load()
    outlined = img.copy()
    opx = outlined.load()
    for y in range(1, FRAME_H - 1):
        for x in range(1, FRAME_W - 1):
            if px[x, y][3] == 0:
                if (px[x - 1, y][3] > 180 or px[x + 1, y][3] > 180 or
                        px[x, y - 1][3] > 180 or px[x, y + 1][3] > 180):
                    opx[x, y] = OUTLINE

    # --- 10) SOFT GROUND SHADOW UNDER FEET ---
    final_img = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(final_img)
    sh_w = 9 if anim != "run" else 11
    sd.ellipse([round(cx - sh_w), 58, round(cx + sh_w), 62], fill=(45, 27, 24, 62))
    final_img.alpha_composite(outlined)
    return final_img

def build_spritesheet(ch, out_dir, frames_per_row=FRAMES_PER_ROW):
    sheet_w = FRAME_W * frames_per_row
    sheet_h = FRAME_H * len(ANIMATIONS)
    sheet = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    meta = {
        "characterId": ch["id"],
        "characterName": ch["name"],
        "frameWidth": FRAME_W,
        "frameHeight": FRAME_H,
        "fps": 60,
        "framesPerRow": frames_per_row,
        "sheetWidth": sheet_w,
        "sheetHeight": sheet_h,
        "animations": {}
    }
    for row_idx, anim in enumerate(ANIMATIONS):
        meta["animations"][anim] = {
            "row": row_idx,
            "frames": frames_per_row,
            "fps": 60,
            "y": row_idx * FRAME_H,
            "loop": True
        }
        for f in range(frames_per_row):
            frame_img = render_frame(ch, anim, f, frames_per_row)
            sheet.paste(frame_img, (f * FRAME_W, row_idx * FRAME_H))

    png_path = out_dir / f"SpriteSheet_60fps_{ch['id']}.png"
    json_path = out_dir / f"SpriteSheet_60fps_{ch['id']}.atlas.json"
    sheet.save(png_path, "PNG", optimize=True)
    json_path.write_text(json.dumps(meta, indent=2, ensure_ascii=False), encoding="utf-8")
    return png_path, json_path

def build_preview_montage(out_dir):
    cols, rows = 6, 2
    cell_w, cell_h = FRAME_W * 3 + 12, FRAME_H * 3 + 22
    canvas = Image.new("RGBA", (cols * cell_w + 16, rows * cell_h + 16), (246, 240, 220, 255))
    draw = ImageDraw.Draw(canvas)
    for idx, ch in enumerate(CHARACTERS):
        r, c = divmod(idx, cols)
        x0, y0 = 8 + c * cell_w, 8 + r * cell_h
        frame = render_frame(ch, "walk", 15, 60).resize((FRAME_W * 3, FRAME_H * 3), Image.NEAREST)
        canvas.alpha_composite(frame, (x0 + 6, y0 + 4))
        draw.text((x0 + 16, y0 + FRAME_H * 3 + 6), ch["id"], fill=(45, 27, 24, 255))
    preview_path = out_dir / "_Preview_All_11_Cast.png"
    canvas.save(preview_path, "PNG")
    return preview_path

if __name__ == "__main__":
    out_dir = Path("/home/antigravity/mynew-game-office/workspace/spritesheets_60fps")
    out_dir.mkdir(parents=True, exist_ok=True)
    for ch in CHARACTERS:
        png_p, _ = build_spritesheet(ch, out_dir, FRAMES_PER_ROW)
        print(f"OK {png_p.name} ({png_p.stat().st_size//1024} KB)")
    preview_p = build_preview_montage(out_dir)
    print(f"Preview: {preview_p}")
