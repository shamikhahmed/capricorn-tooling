#!/usr/bin/env python3
"""Rebuild Cap story bundles: longer day narratives, multi-device screenshots
from finish-loop/gallery, and 35–42s silent videos.

  python3 capricorn-tooling/scripts/rebuild-stories-v7.py
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from story_day_copy_v7 import FEATURES_USED, apply_rich_copy  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
LAB = ROOT / "capricorn-lab" / "content" / "stories"
HOLD_S = 8.5  # 5–6 frames → ~42–51s; longer holds for readable captions

# device → (max_w, max_h) for export
SIZE = {"iphone": (804, 1748), "ipad": (820, 1180), "mac": (1440, 900)}

REPO = {
    "vaultcap": "VaultCap",
    "steadycap": "SteadyCap",
    "pulsecap": "PulseCap",
    "soulcap": "SoulCap",
    "deeponycap": "DeePonyCap",
    "ledgercap": "LedgerCap",
    "scentcap": "ScentCap",
    "carcap": "CarCap",
    "masterycap": "MasteryCap",
    "travelcap": "TravelCap",
    "cookcap": "CookCap",
    "ideacap": "IdeaCap",
    "deefoodie": "DeeFoodieApp",
}


def glob_sources(repo: str) -> dict[str, list[Path]]:
    d = ROOT / repo
    phone: list[Path] = []
    for pat in [
        "qa/finish-loop/shots/**/light/iphone-16.png",
        "qa/finish-loop/shots/**/light/iphone-17.png",
        "docs/screenshots/gallery/light/iphone/*.webp",
        "docs/screenshots/gallery/mobile-*.png",
        "mobile/assets/screenshots/mobile/*.png",
    ]:
        phone.extend(sorted(d.glob(pat)))
    dark = sorted(d.glob("qa/finish-loop/shots/**/dark/iphone-16.png"))
    dark += sorted(d.glob("docs/screenshots/gallery/mobile__*.png"))
    ipad = sorted(d.glob("docs/screenshots/gallery/light/ipad/*.webp"))
    ipad += sorted(d.glob("qa/finish-loop/shots/**/light/ipad-mini.png"))
    mac = sorted(d.glob("qa/finish-loop/shots/**/light/laptop.png"))
    mac += sorted(d.glob("qa/finish-loop/shots/**/light/desktop.png"))
    mac += sorted(d.glob("docs/screenshots/gallery/light/mac/*.webp"))
    mac += sorted(d.glob("docs/screenshots/gallery/desktop-*.png"))
    mac += sorted(d.glob("docs/screenshots/gallery/sepia/mac/*.webp"))
    # unique preserve order
    def uniq(xs: list[Path]) -> list[Path]:
        seen = set()
        out = []
        for p in xs:
            if p.exists() and p not in seen:
                seen.add(p)
                out.append(p)
        return out

    return {"iphone": uniq(phone), "ipad": uniq(ipad) or uniq(phone), "mac": uniq(mac) or uniq(phone), "dark": uniq(dark) or uniq(phone)}


def export_shot(src: Path, dest_png: Path, device: str) -> None:
    dest_png.parent.mkdir(parents=True, exist_ok=True)
    w, h = SIZE[device]
    # scale to fit inside box, pad not needed — letterbox via scale
    vf = f"scale={w}:{h}:force_original_aspect_ratio=decrease"
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(src), "-vf", vf, str(dest_png)],
        check=True,
        capture_output=True,
    )
    webp = dest_png.with_suffix(".webp")
    subprocess.run(["cwebp", "-quiet", "-q", "82", str(dest_png), "-o", str(webp)], check=False)


def _caption_frame(src: Path, dest: Path, time_label: str, title: str, text: str) -> None:
    """Letterbox to 1280x720 with a caption bar via Pillow (ffmpeg lacks drawtext)."""
    from PIL import Image, ImageDraw, ImageFont

    W, H, BAR = 1280, 720, 124
    im = Image.open(src).convert("RGB")
    im.thumbnail((W, H - BAR), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (W, H), (0, 0, 0))
    canvas.paste(im, ((W - im.width) // 2, (H - BAR - im.height) // 2))
    overlay = Image.new("RGBA", (W, BAR), (0, 0, 0, 200))
    canvas.paste(overlay, (0, H - BAR), overlay)
    draw = ImageDraw.Draw(canvas)
    try:
        font_b = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 26)
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 20)
    except OSError:
        font_b = font = ImageFont.load_default()
    line1 = f"{time_label}  ·  {title}" if time_label else title
    body = text if len(text) <= 108 else text[:105].rsplit(" ", 1)[0] + "…"
    draw.text((36, H - 100), line1, fill=(255, 255, 255), font=font_b)
    draw.text((36, H - 62), body, fill=(235, 235, 235), font=font)
    canvas.save(dest, "PNG")


def build_video(persona_dir: Path, day: list[dict], short: str) -> None:
    shots = []
    for step in day:
        name = step["shot"].split("/")[-1]
        png = persona_dir / f"{name}.png"
        if png.exists():
            shots.append((png, step.get("time", ""), step.get("title", ""), step.get("text", "")))
    if not shots:
        return
    framed: list[Path] = []
    for i, (png, time_label, title, text) in enumerate(shots):
        out = persona_dir / f"_frame{i:02d}.png"
        _caption_frame(png, out, time_label, title, text)
        framed.append(out)
    listfile = persona_dir / "_concat.txt"
    lines = []
    for fp in framed:
        lines.append(f"file '{fp.name}'")
        lines.append(f"duration {HOLD_S}")
    lines.append(f"file '{framed[-1].name}'")
    listfile.write_text("\n".join(lines) + "\n")
    poster = persona_dir / "poster.jpg"
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(framed[0]), "-q:v", "3", str(poster)],
        check=True,
        capture_output=True,
    )
    mp4 = persona_dir / "story.mp4"
    subprocess.run(
        [
            "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(listfile),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-an",
            "-movflags", "+faststart", str(mp4),
        ],
        check=True,
        capture_output=True,
        cwd=persona_dir,
    )
    webm = persona_dir / "story.webm"
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(mp4), "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "32", "-an", str(webm)],
        check=True,
        capture_output=True,
    )
    vtt = ["WEBVTT", ""]
    t = 0.0
    for _, time_label, title, text in shots:
        start, end = t, t + HOLD_S
        cue = f"{title}. {text}".strip()
        if time_label:
            cue = f"{time_label} — {cue}"
        vtt.append(f"{_ts(start)} --> {_ts(end)}")
        vtt.append(cue)
        vtt.append("")
        t = end
    (persona_dir / "story.vtt").write_text("\n".join(vtt) + "\n")
    listfile.unlink(missing_ok=True)
    for fp in framed:
        fp.unlink(missing_ok=True)


def _ts(sec: float) -> str:
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


# Rich narratives: (slug -> list of persona story dicts without media paths filled)
# devices cycle: iphone, iphone, ipad, mac, iphone, mac

NARRATIVES: dict[str, list[dict]] = {}


def _p(id_, name, age, city, goal, headline, summary, quote, features, needs, before, after, day_specs, transcript):
    """day_specs: list of (time, title, text, device_key, alt_suffix)"""
    short = id_.split("-")[-1]
    day = []
    for i, (time, title, text, device, alt) in enumerate(day_specs, 1):
        day.append({
            "time": time,
            "title": title,
            "text": text,
            "shot": f"{short}/{i:02d}-{device}",
            "device": device if device != "dark" else "iphone",
            "alt": alt,
        })
    return {
        "id": id_,
        "name": name,
        "age": age,
        "city": city,
        "goal": goal,
        "headline": headline,
        "summary": summary,
        "day": day,
        "before": [{"label": a, "value": b} for a, b in before],
        "after": [{"label": a, "value": b} for a, b in after],
        "video": {
            "mp4": f"{short}/story.mp4",
            "webm": f"{short}/story.webm",
            "vtt": f"{short}/story.vtt",
            "poster": f"{short}/poster.jpg",
            "transcript": transcript,
        },
        "features_used": features,
        "quote": quote,
        "fictional": True,
        "needs": needs,
        "_devices": [d[3] for d in day_specs],  # for media copy
    }


def build_narratives() -> dict[str, list[dict]]:
    return {
        "steadycap": [
            _p(
                "steadycap-bilal", "Bilal Khan", 34, "Karachi, Pakistan",
                "A daily recovery routine he can keep without guilt",
                "How Bilal rebuilt a quiet morning routine",
                "Bilal works late shifts at a warehouse in Karachi. He uses SteadyCap on his phone at dawn, reviews forecasts on a tablet at lunch, and checks SOS contacts on his laptop before sleep — never scored, never shamed.",
                "I log my day. Nobody scores me.",
                ["sos-crisis-flow", "medicine-tracker", "no-streak-guilt"],
                ["health"],
                [("Mornings he skipped logging", "4 / week"), ("Panic without a plan", "Often")],
                [("Mornings logged", "6 / week"), ("SOS plan ready", "1 tap")],
                [
                    ("06:40", "Wake check-in", "Still half-asleep, he opens Today on his iPhone and marks how the night went — no streak banner yelling at him.", "iphone", "Bilal’s Today screen on iPhone at dawn"),
                    ("07:05", "Medicine list", "He ticks morning meds from the same phone before leaving for the bus.", "iphone", "Medicine tracker on Bilal’s phone"),
                    ("13:20", "Craving forecast", "On break he opens the iPad view of the forecast — a hard window flagged for late afternoon.", "ipad", "Craving forecast on iPad"),
                    ("18:45", "Journal on the laptop", "At home he types three lines on his laptop while tea cools — private, on-device.", "mac", "Journal entry on laptop"),
                    ("21:10", "SOS contacts", "Before bed he confirms his brother and sponsor are still one tap away.", "iphone", "SOS contacts on phone"),
                    ("22:00", "Quiet close", "Laptop stays on the desk with Today closed. No guilt for a missed tick earlier.", "mac", "SteadyCap on laptop evening"),
                ],
                "Bilal checks in on iPhone, reviews meds, reads a craving forecast on iPad, journals on laptop, and confirms SOS contacts. Fictional sample data throughout.",
            ),
            _p(
                "steadycap-priya", "Priya Sharma", 47, "Toronto, Canada",
                "A medicine schedule she can show at clinic visits",
                "How Priya keeps her father’s meds readable",
                "Priya cares for her father between work calls. Phone for quick ticks, tablet for the full schedule at appointments, laptop for export before the next visit — all fictional sample data.",
                "His pills are in one list now.",
                ["medicine-tracker", "journal-check-ins"],
                ["health"],
                [("Clinic questions unanswered", "Most visits"), ("Med list on paper scraps", "3 pads")],
                [("Clinic questions answered", "From one screen"), ("Shared list", "On device")],
                [
                    ("08:15", "Morning ticks", "She opens the medicine tracker on her iPhone while making breakfast.", "iphone", "Priya’s medicine list on iPhone"),
                    ("11:00", "Clinic preview", "In the waiting room she switches to iPad so the nurse can see the full day schedule.", "ipad", "Full schedule on iPad"),
                    ("14:30", "Notes after the visit", "Back home she journals what the doctor said on her laptop.", "mac", "Journal on laptop"),
                    ("19:00", "Evening meds", "Phone again for evening ticks — large enough without squinting.", "iphone", "Evening meds on phone"),
                    ("21:30", "Tomorrow’s plan", "Laptop open to Tomorrow so her brother can glance when he visits.", "mac", "Tomorrow plan on laptop"),
                ],
                "Priya ticks meds on iPhone, shows the schedule on iPad at clinic, journals on laptop, and closes the evening on phone. Fictional.",
            ),
            _p(
                "steadycap-hamza", "Hamza Ali", 22, "Islamabad, Pakistan",
                "Gentle streaks and a support contact when stress spikes",
                "How Hamza stays steady through exam week",
                "Hamza is a student who hates streak shaming. He checks in on his phone, uses Knowledge on a shared iPad at the hostel, and keeps SOS on the laptop he studies on.",
                "Support is one tap. No lecture.",
                ["no-streak-guilt", "sos-crisis-flow", "journal-check-ins"],
                ["health"],
                [("Nights he spiralled alone", "2 / week"), ("Knew who to call", "Unclear")],
                [("Nights with a check-in", "Most"), ("SOS contact", "Saved")],
                [
                    ("09:30", "Quick check-in", "Between classes he opens Today on his phone — missed yesterday, no red alert.", "iphone", "Hamza Today on iPhone"),
                    ("15:00", "Learn something small", "On the hostel iPad he reads a short Knowledge card about sleep.", "ipad", "Knowledge on iPad"),
                    ("20:15", "Study laptop, SOS ready", "Laptop stays open to SOS while he revises — roommate is the contact.", "mac", "SOS on laptop"),
                    ("23:40", "One line journal", "Phone in bed for a single honest sentence.", "iphone", "Journal on phone"),
                    ("00:10", "Close the day", "He locks the phone. The app does not nag him for more.", "iphone", "SteadyCap closed quietly"),
                ],
                "Hamza checks in on phone, reads Knowledge on iPad, keeps SOS on laptop, journals once. Fictional exam-week sample.",
            ),
        ],
        "pulsecap": [
            _p(
                "pulsecap-sara", "Sara Ahmed", 26, "Karachi, Pakistan",
                "A beginner 3-day split she can log offline at a basement gym",
                "How Sara logged her first consistent month",
                "Sara trains in a basement gym with weak signal. Phone for the logger on the floor, iPad for My Plan on the bus, laptop for progress charts on Sundays.",
                "The basement has no signal. The log still works.",
                ["workout-logger", "my-plan", "offline-pwa"],
                ["health"],
                [("Workouts abandoned mid-set", "Half"), ("Remembered last weights", "Guesswork")],
                [("Workouts finished", "11 / 12"), ("Last weights", "On screen")],
                [
                    ("07:00", "Plan on the bus", "iPad shows her 3-day split before she reaches the gym.", "ipad", "My Plan on iPad"),
                    ("07:40", "First warm-up set", "Phone logger open — kg and reps with no cloud wait.", "iphone", "Workout logger on iPhone"),
                    ("08:15", "Superset done", "Still offline; rest timer ticks on the phone.", "iphone", "Rest timer on phone"),
                    ("20:00", "Sunday charts", "Laptop progress chart for the week — she smiles at three finished sessions.", "mac", "Progress on laptop"),
                    ("20:30", "Next week tweak", "She nudges a load on My Plan from the laptop.", "mac", "Plan edit on laptop"),
                ],
                "Sara reviews My Plan on iPad, logs sets offline on iPhone, and checks progress on laptop. Fictional.",
            ),
            _p(
                "pulsecap-daniel", "Daniel Okonkwo", 38, "London, UK",
                "Runner-plus-strength progress he can trust",
                "How Daniel mixes runs and lifts without losing the thread",
                "Daniel coaches himself between client meetings. Phone at the track, iPad for mobility, laptop for long progress reviews.",
                "One log for legs and long runs.",
                ["workout-logger", "progress-charts", "smart-coach"],
                ["health"],
                [("Separate apps for run vs lift", "3 apps"), ("Skipped mobility", "Often")],
                [("Single log", "PulseCap"), ("Mobility done", "2× / week")],
                [
                    ("06:20", "Track intervals", "Phone in hand for cardio protocol notes.", "iphone", "Cardio log on iPhone"),
                    ("12:40", "Desk mobility", "iPad open to a short mobility block between calls.", "ipad", "Mobility on iPad"),
                    ("18:50", "Strength session", "Phone logger for squats after work.", "iphone", "Strength log on phone"),
                    ("21:00", "Week review", "Laptop charts — volume trending up gently.", "mac", "Charts on laptop"),
                    ("21:25", "Coach tip", "Rules-based tip on laptop — no LLM claim, just a cue he accepts.", "mac", "Smart Coach on laptop"),
                ],
                "Daniel logs runs and lifts on phone, mobility on iPad, reviews charts on laptop. Fictional.",
            ),
            _p(
                "pulsecap-khalid", "Khalid Al-Rashid", 55, "Riyadh, Saudi Arabia",
                "Doctor-approved walking plus light weights, large text",
                "How Khalid kept moving after clearance",
                "Khalid’s doctor cleared light training. Large text on phone, iPad for calm plan view, laptop when his son visits to help.",
                "Slow is still training.",
                ["workout-logger", "my-plan"],
                ["health"],
                [("Skipped walks when unsure", "3 / week"), ("Could read the plan", "Hard")],
                [("Walks logged", "5 / week"), ("Plan readable", "Large text")],
                [
                    ("05:50", "Morning walk log", "Phone with large text — 25 minutes noted.", "iphone", "Walk log large text"),
                    ("16:00", "Light session plan", "iPad shows today’s light weights clearly.", "ipad", "Plan on iPad"),
                    ("16:40", "Sets done", "Phone logger for two machines only.", "iphone", "Light sets on phone"),
                    ("20:10", "Son checks in", "Laptop open so his son can see the week at a glance.", "mac", "Week on laptop"),
                    ("20:40", "Tomorrow ready", "Phone reminder for the next walk.", "iphone", "Reminder on phone"),
                ],
                "Khalid logs walks and light weights across phone and iPad, reviews with family on laptop. Fictional.",
            ),
        ],
        "soulcap": [
            _p(
                "soulcap-zainab", "Zainab Farooq", 31, "Lahore, Pakistan",
                "Breathing and a short journal before work",
                "How Zainab starts work without borrowing tomorrow’s worry",
                "Zainab teaches mornings. Phone for a physiological sigh, laptop for a longer journal on Fridays, tablet when she wants a calmer landscape view.",
                "Two minutes. Then the day can start.",
                ["breathing", "journal"],
                ["health"],
                [("Spirals before class", "Most mornings"), ("Wrote anything down", "Rarely")],
                [("Breath before class", "Habit"), ("Friday journal", "On device")],
                [
                    ("06:50", "Breath first", "Phone — physiological sigh before she unlocks email.", "iphone", "Breathing on iPhone"),
                    ("07:05", "Feeling check", "Same phone — she taps how she feels without overthinking.", "iphone", "Check-in on phone"),
                    ("12:30", "Tablet calm", "iPad open to Calm tools during lunch break.", "ipad", "Calm on tablet"),
                    ("21:00", "Friday laptop journal", "Longer entry on laptop — still private, still on device.", "mac", "Journal on laptop"),
                    ("21:40", "Close kindly", "Phone shows crisis info is reachable — she does not need it tonight.", "iphone", "Help nearby on phone"),
                ],
                "Zainab breathes and checks in on phone, uses Calm on tablet, journals on laptop. Crisis copy unchanged. Fictional.",
            ),
            _p(
                "soulcap-tom", "Tom Weber", 44, "Berlin, Germany",
                "An evening wind-down he can keep after late meetings",
                "How Tom ends loud days quietly",
                "Tom consults across time zones. Phone for a short wind-down on the U-Bahn, laptop for evening reflection, tablet on the sofa.",
                "The day can stop without a scroll hole.",
                ["breathing", "journal", "sleep-routine"],
                ["health"],
                [("Doomscroll after work", "45 min"), ("Sleep onset", "Late")],
                [("Wind-down", "10 min"), ("Screens down", "Earlier")],
                [
                    ("19:10", "Commute breath", "Phone sigh between stations.", "iphone", "Breath on commute"),
                    ("21:00", "Sofa tablet", "iPad Calm playlist of tools — no autoplay noise.", "ipad", "Calm on iPad"),
                    ("22:15", "Laptop reflection", "Three lines on laptop, then lid closed.", "mac", "Reflection on laptop"),
                    ("22:45", "Phone away", "Last check that help is listed — then Do Not Disturb.", "iphone", "Phone wind-down"),
                ],
                "Tom winds down across phone, iPad, and laptop. Fictional Berlin evening.",
            ),
            _p(
                "soulcap-amina", "Amina Otieno", 19, "Nairobi, Kenya",
                "Grounding before exams — with crisis info exactly as locked",
                "How Amina grounds before exams",
                "Amina is a first-year student. Phone for grounding before papers, laptop in the library for journaling, shared tablet at home.",
                "I can feel my feet again.",
                ["breathing", "journal"],
                ["health"],
                [("Exam panic peaks", "Weekly"), ("Knew helplines existed", "Vague")],
                [("Grounding used", "Before papers"), ("Helplines visible", "As shipped")],
                [
                    ("08:00", "Grounding", "Phone before the exam hall.", "iphone", "Grounding on phone"),
                    ("14:00", "Library laptop", "Quiet journal on laptop between papers.", "mac", "Journal on laptop"),
                    ("18:30", "Home tablet", "Shared iPad for a short Calm reset.", "ipad", "Calm on tablet"),
                    ("21:00", "Help is there", "Phone shows locked crisis info — she reads it once, calmly.", "iphone", "Crisis info as locked"),
                ],
                "Amina grounds on phone, journals on laptop, resets on tablet. Crisis copy exact. Fictional.",
            ),
        ],
        "vaultcap": [
            _p(
                "vaultcap-ayesha", "Ayesha Siddiqui", 41, "Lahore, Pakistan",
                "Family documents and expiries in one encrypted vault",
                "How Ayesha stopped digging through drawers",
                "Ayesha runs a pharmacy and two school runs. Phone for quick document finds, iPad for family profiles at the kitchen table, laptop for Zakat review in Ramadan.",
                "I stopped digging through drawers.",
                ["family-vault", "expiry-reminders", "zakat"],
                ["family", "money"],
                [("Time to find a passport", "20 min"), ("Places documents lived", "3 drawers + chats")],
                [("Time to find a passport", "1 min"), ("Expiry surprises", "0 missed")],
                [
                    ("07:40", "Morning vault", "Phone home — three expiries this month, including a school passport.", "iphone", "Vault home on iPhone"),
                    ("12:15", "Documents find", "Phone search finds a passport scan between customers.", "iphone", "Documents on phone"),
                    ("18:30", "Family on iPad", "Kitchen iPad — husband’s profile separate, still on-device.", "ipad", "Family profiles on iPad"),
                    ("20:10", "Banks glance", "Laptop for a calm look at sample accounts.", "mac", "Banks on laptop"),
                    ("21:00", "Zakat summary", "Laptop Zakat from holdings before she emails the accountant.", "mac", "Zakat on laptop"),
                    ("21:40", "Reminders set", "Phone locks with renewal reminders confirmed.", "iphone", "Reminders on phone"),
                ],
                "Ayesha checks expiries and documents on iPhone, family on iPad, banks and Zakat on laptop. Fictional sample vault.",
            ),
            _p(
                "vaultcap-omar", "Omar Rahman", 29, "Dubai, UAE",
                "Multi-currency accounts and a backup before a phone change",
                "How Omar backed up before swapping phones",
                "Omar freelances across currencies. Phone for day balances, laptop for encrypted export, iPad when reviewing cards on the sofa.",
                "New phone. Same vault. No cloud rent.",
                ["multi-currency", "encrypted-backup", "cards"],
                ["money"],
                [("Fear of losing vault on swap", "High"), ("Backup age", "Unknown")],
                [("Encrypted export", "Done"), ("Restore tested", "On device")],
                [
                    ("09:00", "Currency glance", "Phone dashboard — AED and GBP sample balances.", "iphone", "Dashboard on phone"),
                    ("11:30", "Cards check", "iPad cards list before a client lunch.", "ipad", "Cards on iPad"),
                    ("16:00", "Export on laptop", "Encrypted .vos backup to a disk he owns.", "mac", "Backup on laptop"),
                    ("19:20", "Security review", "Laptop security settings before the swap.", "mac", "Security on laptop"),
                    ("21:00", "Phone ready", "New phone restored from backup — sample vault opens.", "iphone", "Restored vault on phone"),
                ],
                "Omar reviews money on phone and iPad, exports on laptop, restores on a new phone. Fictional.",
            ),
            _p(
                "vaultcap-margaret", "Margaret Ellis", 68, "Manchester, UK",
                "Pension and insurance papers her son can help with — large text",
                "How Margaret keeps pension papers readable",
                "Margaret uses larger text on iPhone, reviews documents on iPad with her son, and keeps settings clear on the laptop in the study.",
                "He can help without taking the papers away.",
                ["expiry-reminders", "documents", "family-vault"],
                ["family", "money"],
                [("Time to find a policy", "25 min"), ("Could read small print", "Often no")],
                [("Time to find a policy", "2 min"), ("Text size", "Comfortable")],
                [
                    ("10:00", "Large-text home", "iPhone home at larger text — renewals readable.", "iphone", "Large text home"),
                    ("14:20", "Documents", "Phone documents list for pension letters.", "iphone", "Documents large text"),
                    ("16:00", "Son on iPad", "iPad on the table while her son helps label files.", "ipad", "Documents on iPad"),
                    ("19:00", "Reminders", "Laptop reminders for home insurance.", "mac", "Reminders on laptop"),
                    ("19:40", "Settings check", "Laptop settings — demo labelled, text size kept.", "mac", "Settings on laptop"),
                ],
                "Margaret uses large text on iPhone, reviews with her son on iPad, settings on laptop. Fictional.",
            ),
        ],
    }


# Fill remaining apps with solid templates using shared pattern
def more_narratives(base: dict[str, list[dict]]) -> dict[str, list[dict]]:
    # DeePony, Ledger, Scent, Car, Mastery, Travel, Cook, Idea, DeeFoodie
    base["deeponycap"] = [
        _p("deeponycap-ali", "Ali Raza", 27, "Karachi, Pakistan", "Sneaker collection + wishlist on every shelf",
           "How Ali finally knew what he owned",
           "Ali photographs pairs on phone, browses the shelf on iPad, and plans wishlist buys on laptop.",
           "The shelf matches the box under the bed.",
           ["collection", "wishlist", "photos"], ["fun"],
           [("Pairs he forgot he owned", "6+"), ("Wishlist in chats", "Scattered")],
           [("Catalogued pairs", "On device"), ("Wishlist", "One list")],
           [("09:00", "Shelf on phone", "Stable view while he opens a box.", "iphone", "Collection on phone"),
            ("11:00", "Detail photos", "Phone camera shot attached to a pair.", "iphone", "Pair detail"),
            ("15:00", "iPad shelf map", "Wider shelf layout on iPad.", "ipad", "Shelf on iPad"),
            ("20:00", "Wishlist laptop", "Laptop wishlist before payday.", "mac", "Wishlist on laptop"),
            ("21:00", "Stats glance", "Laptop stats — fictional counts only.", "mac", "Stats on laptop")],
           "Ali catalogues on phone, reviews on iPad, plans on laptop. Fictional."),
        _p("deeponycap-fatima", "Fatima Hassan", 36, "Dubai, UAE", "Kids’ book shelves she can tidy weekly",
           "How Fatima keeps the kids’ shelves honest",
           "Fatima logs books on phone, sorts shelves on iPad with the kids, plans donations on laptop.",
           "We stopped buying doubles.",
           ["collection", "wishlist"], ["family", "fun"],
           [("Duplicate buys", "Monthly"), ("Shelf chaos", "High")],
           [("Duplicates caught", "Before checkout"), ("Weekly tidy", "Logged")],
           [("08:30", "Scan a spine", "Phone add during breakfast tidy.", "iphone", "Add book on phone"),
            ("16:00", "Kids on iPad", "iPad shelf — they point at favourites.", "ipad", "Shelf with kids"),
            ("20:30", "Donation list", "Laptop list for the weekend drop.", "mac", "Donation plan"),
            ("21:00", "Wishlist trim", "Laptop wishlist trimmed.", "mac", "Wishlist"),
            ("21:20", "Phone lock", "Quick phone confirm of tonight’s adds.", "iphone", "Confirm on phone")],
           "Fatima logs on phone, sorts on iPad, plans on laptop. Fictional."),
        _p("deeponycap-george", "George Whitfield", 61, "Manchester, UK", "Vinyl with condition notes",
           "How George keeps condition notes with the sleeves",
           "George photographs sleeves on phone, reviews the collection on iPad, updates condition on laptop.",
           "The note travels with the record.",
           ["collection", "condition-notes"], ["fun"],
           [("Condition forgotten", "Often"), ("Insurance list", "Out of date")],
           [("Condition noted", "Per sleeve"), ("List current", "On device")],
           [("10:00", "Sleeve photo", "Phone photo + condition.", "iphone", "Vinyl detail"),
            ("14:00", "iPad browse", "Afternoon browse on iPad.", "ipad", "Collection on iPad"),
            ("19:00", "Laptop inventory", "Full list on laptop for insurance.", "mac", "Inventory on laptop"),
            ("20:00", "Wishlist pressings", "Laptop wishlist of pressings.", "mac", "Wishlist"),
            ("20:30", "Phone end", "Phone confirms today’s adds.", "iphone", "Phone confirm")],
           "George notes condition on phone, browses on iPad, inventories on laptop. Fictional."),
    ]
    base["ledgercap"] = [
        _p("ledgercap-usman", "Usman Malik", 45, "Karachi, Pakistan", "PSX portfolio tracking without advice",
           "How Usman tracks without being told what to buy",
           "Usman tracks holdings on phone, reads markets on iPad, reviews on laptop — LedgerCap tracks, never advises.",
           "It tracks. It does not tip.",
           ["portfolio-tracking", "dividends", "watchlist"], ["money"],
           [("Positions across notebooks", "4"), ("Dividend log", "Missing")],
           [("Positions", "One portfolio"), ("Dividends", "Logged")],
           [("09:15", "Open wealth", "Phone wealth glance after chai.", "iphone", "Wealth on phone"),
            ("11:00", "Watchlist", "Phone watchlist — fictional symbols.", "iphone", "Watchlist"),
            ("15:30", "iPad markets", "iPad markets view after close.", "ipad", "Markets on iPad"),
            ("21:00", "Laptop dividends", "Dividend log on laptop.", "mac", "Dividends on laptop"),
            ("21:40", "Paper trade note", "Laptop paper trade — practice only.", "mac", "Paper trade")],
           "Usman tracks on phone, markets on iPad, dividends on laptop. No advice. Fictional."),
        _p("ledgercap-nida", "Nida Khan", 30, "Islamabad, Pakistan", "Funds and a monthly SIP log",
           "How Nida logs SIPs without spreadsheets",
           "Nida logs SIPs on phone, reviews funds on iPad, monthly summary on laptop.",
           "The SIP is a line, not a lecture.",
           ["funds", "portfolio-tracking"], ["money"],
           [("SIP proof", "In email"), ("Fund list", "Messy")],
           [("SIP log", "In app"), ("Funds", "Listed")],
           [("08:00", "SIP tick", "Phone log after salary day.", "iphone", "SIP on phone"),
            ("13:00", "Funds on iPad", "Fund NAVs on iPad.", "ipad", "Funds on iPad"),
            ("19:00", "Monthly laptop", "Month summary on laptop.", "mac", "Monthly on laptop"),
            ("19:40", "Watchlist trim", "Laptop watchlist.", "mac", "Watchlist"),
            ("20:00", "Phone lock", "Phone confirms the SIP line.", "iphone", "Confirm")],
           "Nida logs SIPs on phone, funds on iPad, month on laptop. Fictional."),
        _p("ledgercap-raza", "Raza Ahmed", 63, "Lahore, Pakistan", "Retirement holdings and dividends, large text",
           "How Raza keeps retirement holdings readable",
           "Raza uses large text on phone, iPad with his daughter, laptop for dividend history.",
           "She can see it without taking the file away.",
           ["dividends", "portfolio-tracking"], ["money", "family"],
           [("Statements in drawers", "Years"), ("Could read the app", "Hard")],
           [("Holdings visible", "Large text"), ("Dividends", "History")],
           [("10:00", "Large-text wealth", "Phone wealth at large text.", "iphone", "Large text wealth"),
            ("15:00", "Daughter on iPad", "iPad review together.", "ipad", "Review on iPad"),
            ("19:00", "Dividend history", "Laptop dividend log.", "mac", "Dividends"),
            ("19:45", "Announcements", "Laptop announcements — informational.", "mac", "Announcements"),
            ("20:10", "Phone goodnight", "Phone lock.", "iphone", "Phone")],
           "Raza uses large text on phone, reviews on iPad, dividends on laptop. Fictional."),
    ]
    base["scentcap"] = [
        _p("scentcap-hira", "Hira Naz", 28, "Lahore, Pakistan", "What to wear today by weather",
           "How Hira picks a scent before she leaves",
           "Hira checks Today on phone, browses collection on iPad, journals notes on laptop.",
           "Weather first. Then the bottle.",
           ["today-pick", "collection", "notes"], ["fun"],
           [("Decision time", "15 min"), ("Notes", "In head")],
           [("Decision time", "2 min"), ("Notes", "Saved")],
           [("08:10", "Today pick", "Phone Today by weather.", "iphone", "Today on phone"),
            ("08:20", "Bottle confirm", "Phone detail before bagging it.", "iphone", "Bottle detail"),
            ("18:00", "iPad collection", "Evening browse on iPad.", "ipad", "Collection on iPad"),
            ("21:00", "Laptop notes", "Occasion notes on laptop.", "mac", "Notes on laptop"),
            ("21:30", "Calendar", "Laptop calendar of wears.", "mac", "Calendar")],
           "Hira picks on phone, browses on iPad, notes on laptop. Fictional."),
        _p("scentcap-james", "James Cole", 40, "London, UK", "Collection and decants tracked",
           "How James stopped losing decants",
           "James logs decants on phone, collection on iPad, analytics on laptop.",
           "The decant has a home now.",
           ["collection", "decants", "analytics"], ["fun"],
           [("Lost decants", "Monthly"), ("Collection count", "Guess")],
           [("Decants logged", "All"), ("Count", "Exact")],
           [("07:30", "Add decant", "Phone add before commute.", "iphone", "Add on phone"),
            ("12:00", "Collection iPad", "iPad collection at lunch.", "ipad", "Collection"),
            ("20:00", "Analytics laptop", "Laptop analytics — illustrative.", "mac", "Analytics"),
            ("20:40", "Advisor", "Laptop advisor tips — rules, not magic.", "mac", "Advisor"),
            ("21:00", "Phone check", "Phone Today for tomorrow.", "iphone", "Today")],
           "James logs on phone, collection on iPad, analytics on laptop. Fictional."),
        _p("scentcap-saad", "Saad Alami", 33, "Dubai, UAE", "Gift ideas with occasion notes",
           "How Saad remembers what he already gifted",
           "Saad notes gifts on phone, browses on iPad with his partner, plans on laptop.",
           "I stopped regifting the same bottle.",
           ["notes", "collection"], ["fun", "family"],
           [("Regifts", "Awkward"), ("Occasion memory", "Gone")],
           [("Gift log", "Notes"), ("Occasions", "Tagged")],
           [("09:00", "Note a gift", "Phone note after shopping.", "iphone", "Gift note"),
            ("16:00", "Browse together", "iPad collection on the sofa.", "ipad", "Browse on iPad"),
            ("20:00", "Laptop plan", "Laptop occasion list.", "mac", "Occasions"),
            ("20:30", "Today test", "Laptop Today for weekend.", "mac", "Today"),
            ("21:00", "Phone", "Phone confirm.", "iphone", "Confirm")],
           "Saad notes gifts on phone, browses on iPad, plans on laptop. Fictional."),
    ]
    base["carcap"] = [
        _p("carcap-faisal", "Faisal Sheikh", 42, "Karachi, Pakistan", "Two family cars — service and fuel",
           "How Faisal keeps two cars honest",
           "Faisal logs fuel on phone, service on iPad in the driveway, documents on laptop.",
           "Both cars. One garage.",
           ["fuel", "service", "documents"], ["family", "money"],
           [("Missed services", "1 / year"), ("Fuel receipts", "Glovebox")],
           [("Services logged", "On time"), ("Fuel", "In app")],
           [("08:00", "Today", "Phone Today for both cars.", "iphone", "Today on phone"),
            ("08:20", "Fuel tick", "Phone fuel log at the pump.", "iphone", "Fuel log"),
            ("17:00", "Service on iPad", "iPad service history in the driveway.", "ipad", "Service on iPad"),
            ("21:00", "Docs laptop", "Laptop documents — fictional registration.", "mac", "Docs on laptop"),
            ("21:30", "Garage overview", "Laptop garage for both cars.", "mac", "Garage")],
           "Faisal uses phone at the pump, iPad for service, laptop for docs. Fictional."),
        _p("carcap-sophie", "Sophie Bennett", 33, "Manchester, UK", "EV charging and MOT reminders",
           "How Sophie never misses an MOT again",
           "Sophie tracks charging on phone, reminders on iPad, MOT docs on laptop.",
           "The reminder beats the fine.",
           ["charging", "reminders", "documents"], ["money"],
           [("MOT surprise", "Last year"), ("Charge log", "None")],
           [("MOT reminder", "30 days out"), ("Charges", "Logged")],
           [("07:40", "Charge log", "Phone after overnight charge.", "iphone", "Charge on phone"),
            ("12:00", "Reminder check", "iPad reminders at lunch.", "ipad", "Reminders"),
            ("19:00", "MOT docs", "Laptop document pack.", "mac", "MOT docs"),
            ("19:40", "Garage", "Laptop garage.", "mac", "Garage"),
            ("20:00", "Phone", "Phone Today.", "iphone", "Today")],
           "Sophie logs charge on phone, reminders on iPad, MOT on laptop. Fictional."),
        _p("carcap-rashid", "Rashid Nasser", 50, "Riyadh, Saudi Arabia", "Three business cars and their papers",
           "How Rashid keeps a tiny fleet documented",
           "Rashid checks Today on phone, service on iPad at the yard, papers on laptop at the office.",
           "Three cars. Zero missing papers.",
           ["documents", "service", "fuel"], ["money"],
           [("Paper hunts", "Weekly"), ("Service gaps", "Common")],
           [("Papers found", "Seconds"), ("Service", "Scheduled")],
           [("06:30", "Yard Today", "Phone Today across three cars.", "iphone", "Fleet Today"),
            ("10:00", "Service iPad", "iPad service board.", "ipad", "Service board"),
            ("16:00", "Office laptop", "Laptop documents.", "mac", "Documents"),
            ("17:00", "Fuel costs", "Laptop fuel rollup — illustrative.", "mac", "Fuel"),
            ("20:00", "Phone close", "Phone confirms tomorrow.", "iphone", "Tomorrow")],
           "Rashid runs a three-car day across phone, iPad, laptop. Fictional."),
    ]
    base["masterycap"] = [
        _p("masterycap-ahmed", "Ahmed Iqbal", 20, "Lahore, Pakistan", "Trading basics in Roman Urdu",
           "How Ahmed learns without fake tips",
           "Ahmed studies Campus on phone, practices on iPad, reviews records on laptop — education, not advice.",
           "Roman Urdu first. Ego later.",
           ["campus", "practice", "records"], ["learning"],
           [("Confused by English-only", "Often"), ("Practice log", "None")],
           [("Lessons done", "Campus"), ("Practice", "Logged")],
           [("09:00", "Campus phone", "Phone Campus in Roman Urdu.", "iphone", "Campus on phone"),
            ("14:00", "Practice iPad", "iPad practice lab.", "ipad", "Practice on iPad"),
            ("20:00", "Records laptop", "Laptop records.", "mac", "Records"),
            ("20:40", "School of money", "Laptop module.", "mac", "Module"),
            ("21:00", "Phone recap", "Phone Today recap.", "iphone", "Today")],
           "Ahmed learns on phone, practices on iPad, records on laptop. Fictional."),
        _p("masterycap-ruth", "Ruth Wanjiku", 35, "Nairobi, Kenya", "Career switch into software basics",
           "How Ruth practices without performative hustle",
           "Ruth uses Campus on phone between shifts, iPad on weekends, laptop for HTTP lab.",
           "Practice is quiet. That is fine.",
           ["campus", "practice", "http-lab"], ["learning"],
           [("Tutorial tabs forever", "12+"), ("Finished labs", "0")],
           [("Labs finished", "Logged"), ("Tabs", "Fewer")],
           [("07:00", "Lesson phone", "Phone Campus before shift.", "iphone", "Campus"),
            ("15:00", "Weekend iPad", "iPad practice.", "ipad", "Practice"),
            ("21:00", "HTTP lab laptop", "Laptop HTTP lab.", "mac", "HTTP lab"),
            ("21:45", "Records", "Laptop records.", "mac", "Records"),
            ("22:00", "Phone", "Phone close.", "iphone", "Close")],
           "Ruth studies on phone, practices on iPad, labs on laptop. Fictional."),
        _p("masterycap-bilqees", "Bilqees Rahman", 45, "Karachi, Pakistan", "Teacher upskilling with progress she can see",
           "How Bilqees tracks progress between classes",
           "Bilqees learns on phone, reviews on iPad after school, deep practice on laptop.",
           "Progress is a page, not a performance.",
           ["campus", "records"], ["learning"],
           [("Progress felt invisible", "Yes"), ("Time to study", "Stolen minutes")],
           [("Progress visible", "Records"), ("Minutes used", "Logged")],
           [("06:30", "Before school", "Phone Campus.", "iphone", "Campus"),
            ("14:30", "iPad review", "iPad after school.", "ipad", "Review"),
            ("21:00", "Laptop practice", "Laptop practice block.", "mac", "Practice"),
            ("21:50", "Records", "Laptop records.", "mac", "Records"),
            ("22:10", "Phone", "Phone goodnight.", "iphone", "Phone")],
           "Bilqees uses phone, iPad, and laptop across a school day. Fictional."),
    ]
    base["travelcap"] = [
        _p("travelcap-sana", "Sana & Kamran", 29, "Karachi → Istanbul", "Honeymoon tickets, hotel, docs",
           "How Sana kept the honeymoon docs in one trip",
           "Phone for boarding passes, iPad for the itinerary on the sofa, laptop for documents before departure.",
           "One trip. No WhatsApp archaeology.",
           ["trips", "documents", "flights"], ["travel", "family"],
           [("Docs across chats", "Dozens"), ("Day-of panic", "High")],
           [("Docs in trip", "One place"), ("Day-of", "Calm")],
           [("09:00", "Trip home", "Phone trip dashboard.", "iphone", "Trip on phone"),
            ("11:00", "Flights", "Phone flight details.", "iphone", "Flights"),
            ("16:00", "iPad itinerary", "iPad day plan.", "ipad", "Itinerary"),
            ("20:00", "Docs laptop", "Laptop passports scan list.", "mac", "Documents"),
            ("21:00", "Budget", "Laptop budget — illustrative.", "mac", "Budget")],
           "Sana runs the honeymoon trip across phone, iPad, laptop. Fictional."),
        _p("travelcap-hassan", "Hassan Qureshi", 39, "Dubai, UAE", "Monthly business trips and visas",
           "How Hassan stopped re-finding the same visa PDF",
           "Hassan opens trips on phone in rides, iPad in lounges, laptop at the hotel desk.",
           "The visa lives with the trip.",
           ["trips", "documents", "visas"], ["travel", "money"],
           [("Visa PDF hunts", "Every trip"), ("Lounge chaos", "High")],
           [("Visa with trip", "Pinned"), ("Lounge", "Clear")],
           [("06:00", "Airport phone", "Phone trip on the way.", "iphone", "Trip"),
            ("09:00", "Lounge iPad", "iPad documents.", "ipad", "Docs"),
            ("21:00", "Hotel laptop", "Laptop next trip draft.", "mac", "Next trip"),
            ("21:40", "Expenses", "Laptop expenses — illustrative.", "mac", "Expenses"),
            ("22:00", "Phone", "Phone tomorrow.", "iphone", "Tomorrow")],
           "Hassan uses phone, iPad, laptop across a business hop. Fictional."),
        _p("travelcap-malik", "The Malik family", 42, "London → Lahore", "Umrah + family visit, kids’ passports",
           "How the Maliks kept five passports visible",
           "Phone for day-of, iPad for kids’ list, laptop for the full document pack.",
           "Five passports. One checklist.",
           ["trips", "documents", "family"], ["travel", "family"],
           [("Passport scramble", "Every departure"), ("Kids’ docs", "Scattered")],
           [("Checklist", "Complete"), ("Kids’ docs", "In trip")],
           [("08:00", "Family trip", "Phone trip overview.", "iphone", "Trip"),
            ("10:00", "Kids on iPad", "iPad document checklist.", "ipad", "Checklist"),
            ("19:00", "Laptop pack", "Laptop full docs.", "mac", "Docs"),
            ("20:00", "Flights", "Laptop flights.", "mac", "Flights"),
            ("21:00", "Phone", "Phone day-of view.", "iphone", "Day-of")],
           "The Maliks coordinate across phone, iPad, laptop. Fictional."),
    ]
    base["cookcap"] = [
        _p("cookcap-shahida", "Shahida Begum", 70, "Karachi, Pakistan", "Family recipes for grandchildren",
           "How Nani saved the recipes that lived in her head",
           "Shahida dictates on phone with her granddaughter, browses the book on iPad, edits on laptop.",
           "The masala finally has a page.",
           ["recipes", "family", "cookbook"], ["family", "fun"],
           [("Recipes only in memory", "Most"), ("Grandkids could cook them", "No")],
           [("Recipes written", "In book"), ("Shared on device", "Yes")],
           [("10:00", "Add a recipe", "Phone capture with help.", "iphone", "Add recipe"),
            ("15:00", "Book on iPad", "iPad cookbook browse.", "ipad", "Cookbook"),
            ("19:00", "Laptop edit", "Laptop chapter edit.", "mac", "Edit"),
            ("20:00", "Family profiles", "Laptop family profiles.", "mac", "Family"),
            ("20:30", "Phone", "Phone tonight’s dish.", "iphone", "Tonight")],
           "Shahida captures on phone, browses on iPad, edits on laptop. Fictional."),
        _p("cookcap-rohan", "Rohan Mehta", 31, "London, UK", "Weeknight meal plan that survives 8pm",
           "How Rohan meal-plans without heroics",
           "Rohan plans on laptop Sunday, cooks from phone, shops from iPad list.",
           "Tuesday still has a dinner.",
           ["meal-plan", "shopping-list", "recipes"], ["fun"],
           [("Takeaway default", "4 / week"), ("Shopping chaos", "Yes")],
           [("Cooked nights", "5 / week"), ("List", "Ready")],
           [("11:00", "Sunday plan", "Laptop week plan.", "mac", "Meal plan"),
            ("18:30", "Phone cook", "Phone recipe on the counter.", "iphone", "Recipe"),
            ("19:40", "iPad shop", "iPad shopping list.", "ipad", "Shopping"),
            ("20:30", "Laptop tweak", "Laptop next week tweak.", "mac", "Tweak"),
            ("21:00", "Phone", "Phone tomorrow.", "iphone", "Tomorrow")],
           "Rohan plans on laptop, cooks on phone, shops on iPad. Fictional."),
        _p("cookcap-mariam", "Mariam Syed", 26, "Islamabad, Pakistan", "Learning to cook with a shopping list",
           "How Mariam went from recipes to a real list",
           "Mariam saves recipes on phone, studies on iPad, builds the shopping list on laptop.",
           "The list is half the cooking.",
           ["recipes", "shopping-list"], ["learning", "fun"],
           [("Abandoned recipes", "Many"), ("Shopping", "Improvised")],
           [("Recipes tried", "Weekly"), ("List", "Complete")],
           [("09:00", "Save recipe", "Phone save.", "iphone", "Save"),
            ("14:00", "iPad study", "iPad recipe read.", "ipad", "Study"),
            ("18:00", "Laptop list", "Laptop shopping list.", "mac", "List"),
            ("19:00", "Cook phone", "Phone while cooking.", "iphone", "Cook"),
            ("20:30", "Laptop notes", "Laptop notes for next time.", "mac", "Notes")],
           "Mariam learns across phone, iPad, laptop. Fictional."),
    ]
    base["ideacap"] = [
        _p("ideacap-zara", "Zara Malik", 32, "Lahore, Pakistan", "Voice ideas while commuting",
           "How Zara catches ideas before they vanish",
           "Zara records on phone in the rickshaw, tags on iPad at the studio, reviews on laptop.",
           "If I can say it, it is saved.",
           ["voice-capture", "ideas", "tags"], ["learning"],
           [("Lost ideas", "Daily"), ("Notes app mess", "Bad")],
           [("Captured", "On device"), ("Tagged", "By project")],
           [("08:40", "Voice capture", "Phone record on the commute.", "iphone", "Voice capture"),
            ("11:00", "Tag on iPad", "iPad tags at the desk.", "ipad", "Tags"),
            ("18:00", "Laptop review", "Laptop idea list.", "mac", "Ideas"),
            ("19:00", "Note detail", "Laptop note detail.", "mac", "Detail"),
            ("19:30", "Phone", "Phone inbox zero-ish.", "iphone", "Inbox")],
           "Zara captures on phone, tags on iPad, reviews on laptop. Fictional."),
        _p("ideacap-kevin", "Kevin Ortiz", 45, "Toronto, Canada", "Product ideas tagged by project",
           "How Kevin keeps product ideas from drowning in Slack",
           "Kevin dumps ideas on phone, sorts on iPad, decisions on laptop.",
           "Slack is not my notebook.",
           ["ideas", "tags", "projects"], ["learning"],
           [("Ideas in Slack", "Lost"), ("Decision log", "None")],
           [("Ideas in IdeaCap", "Tagged"), ("Decisions", "Notes")],
           [("07:30", "Quick capture", "Phone idea.", "iphone", "Capture"),
            ("13:00", "iPad sort", "iPad by project.", "ipad", "Sort"),
            ("21:00", "Laptop decide", "Laptop note detail.", "mac", "Decide"),
            ("21:40", "Settings", "Laptop settings — offline.", "mac", "Settings"),
            ("22:00", "Phone", "Phone clear.", "iphone", "Clear")],
           "Kevin captures on phone, sorts on iPad, decides on laptop. Fictional."),
        _p("ideacap-hamid", "Hamid Siddiqui", 60, "Karachi, Pakistan", "Story ideas, offline only",
           "How Hamid keeps story seeds offline",
           "Hamid writes on phone in the garden, expands on iPad, manuscripts on laptop — no account wall.",
           "Offline is the point.",
           ["ideas", "offline"], ["learning"],
           [("Ideas on paper scraps", "Lost"), ("Needed an account", "Elsewhere")],
           [("Seeds saved", "On device"), ("Accounts", "None")],
           [("07:00", "Garden phone", "Phone seed.", "iphone", "Seed"),
            ("11:00", "iPad expand", "iPad expand.", "ipad", "Expand"),
            ("17:00", "Laptop draft", "Laptop note.", "mac", "Draft"),
            ("18:00", "Laptop list", "Laptop ideas list.", "mac", "List"),
            ("18:30", "Phone", "Phone lock.", "iphone", "Lock")],
           "Hamid works fully offline across phone, iPad, laptop. Fictional."),
    ]
    base["deefoodie"] = [
        _p("deefoodie-dee", "Dee Rahman", 27, "Karachi, Pakistan", "Food journal and ratings",
           "How Dee journals eats without performing them",
           "Dee logs visits on phone, maps on a larger phone view, taste profile when reviewing the week — private beta sample screens.",
           "The rating is for me.",
           ["journal", "ratings", "map"], ["fun"],
           [("Forgot where she ate", "Weekly"), ("Ratings", "In head")],
           [("Visits logged", "Journal"), ("Ratings", "Saved")],
           [("13:00", "Log a visit", "Phone journal add.", "iphone", "Add visit"),
            ("13:20", "Rate it", "Phone rating.", "iphone", "Rating"),
            ("18:00", "Map", "Phone map of eats.", "iphone", "Map"),
            ("21:00", "Taste profile", "Phone taste profile.", "iphone", "Taste"),
            ("21:30", "Wishlist", "Phone wishlist.", "iphone", "Wishlist")],
           "Dee journals and rates on phone across a Karachi day. Fictional. Private beta UI."),
        _p("deefoodie-arsalan", "Arsalan Khan", 35, "Karachi, Pakistan", "Family dinner spots, kid-friendly notes",
           "How Arsalan remembers kid-friendly tables",
           "Arsalan tags kid-friendly notes on phone after family dinners.",
           "Kid-friendly is a tag, not a guess.",
           ["journal", "notes", "wishlist"], ["family", "fun"],
           [("Forgot kid-friendly spots", "Often"), ("Notes in chat", "Lost")],
           [("Tagged spots", "In journal"), ("Wishlist", "Shared intent")],
           [("14:00", "After lunch log", "Phone visit.", "iphone", "Visit"),
            ("14:15", "Kid note", "Phone note.", "iphone", "Note"),
            ("20:00", "Wishlist", "Phone wishlist.", "iphone", "Wishlist"),
            ("20:20", "Areas", "Phone areas.", "iphone", "Areas"),
            ("20:40", "Home", "Phone home.", "iphone", "Home")],
           "Arsalan logs family dinners on phone. Fictional."),
        _p("deefoodie-noor", "Noor Fatima", 24, "Karachi, Pakistan", "Budget eats list",
           "How Noor keeps budget eats honest",
           "Noor tracks budget-friendly spots on phone between classes.",
           "Cheap and good can both be true.",
           ["journal", "wishlist", "map"], ["fun", "money"],
           [("Budget spots forgotten", "Yes"), ("Map", "In head")],
           [("Budget list", "Wishlist"), ("Map", "Pinned")],
           [("12:00", "Log cheap eat", "Phone visit.", "iphone", "Visit"),
            ("12:20", "Wishlist", "Phone wishlist.", "iphone", "Wishlist"),
            ("17:00", "Map", "Phone map.", "iphone", "Map"),
            ("21:00", "Journal", "Phone journal.", "iphone", "Journal"),
            ("21:20", "Seasonal", "Phone seasonal.", "iphone", "Seasonal")],
           "Noor tracks budget eats on phone. Fictional."),
    ]
    return base


def assign_sources(day_devices: list[str], pools: dict[str, list[Path]]) -> list[Path]:
    """Pick a source file per day step, rotating through pools."""
    cursors = {k: 0 for k in pools}
    out = []
    for dev in day_devices:
        key = "iphone" if dev == "dark" else dev
        if key == "iphone" and cursors["iphone"] == 0 and pools.get("dark"):
            # second phone step can use dark for variety when available
            pass
        pool = pools.get(key) or pools["iphone"]
        if not pool:
            raise RuntimeError(f"no sources for {key}")
        idx = cursors[key] % len(pool)
        # prefer dark for later iphone steps if available
        if key == "iphone" and cursors["iphone"] >= 1 and pools.get("dark"):
            src = pools["dark"][(cursors["iphone"] - 1) % len(pools["dark"])]
        else:
            src = pool[idx]
        cursors[key] += 1
        out.append(src)
    return out


def main() -> None:
    narratives = more_narratives(build_narratives())
    # schema: allow device
    schema_path = LAB / "schema.json"
    schema = json.loads(schema_path.read_text())
    day = schema["$defs"]["dayStep"]
    day["additionalProperties"] = False
    day["properties"]["device"] = {"type": "string", "enum": ["iphone", "ipad", "mac"]}
    schema_path.write_text(json.dumps(schema, indent=2) + "\n")

    for slug, personas in narratives.items():
        repo = REPO[slug]
        pools = glob_sources(repo)
        print(f"== {slug} phone={len(pools['iphone'])} ipad={len(pools['ipad'])} mac={len(pools['mac'])}")
        bundle_personas = []
        for persona in personas:
            apply_rich_copy(persona)
            short = persona["id"].split("-")[-1]
            dest = LAB / slug / short
            if dest.exists():
                shutil.rmtree(dest)
            dest.mkdir(parents=True)
            devices = persona.pop("_devices")
            sources = assign_sources(devices, pools)
            for step, src in zip(persona["day"], sources):
                name = step["shot"].split("/")[-1]
                device = step["device"]
                export_shot(src, dest / f"{name}.png", device)
            build_video(dest, persona["day"], short)
            # strip device from required? keep it for builder
            bundle_personas.append(persona)
            print(f"  {persona['id']}: {len(persona['day'])} steps video OK")

        # preserve features_used validation — already set
        # keep vaultcap needs etc.
        old = {}
        old_path = LAB / f"{slug}.json"
        if old_path.exists():
            old = json.loads(old_path.read_text())
        bundle = {
            "slug": slug,
            "fictional": True,
            "disclaimer": "Illustrative story. People and data are fictional.",
            "personas": bundle_personas,
        }
        # For soulcap keep gentle tone already in copy
        old_path.write_text(json.dumps(bundle, indent=2, ensure_ascii=False) + "\n")
        print(f"wrote {old_path}")

    print("DONE")


if __name__ == "__main__":
    main()
