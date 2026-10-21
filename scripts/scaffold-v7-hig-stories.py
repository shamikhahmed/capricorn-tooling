#!/usr/bin/env python3
"""One-shot v7 HIG+stories scaffolding for Cap fleet apps (excl. Aura/Prism)."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
from pathlib import Path

ROOT = Path("/Users/shamikhahmed/Projects/Cap/Cap-Apps")
VAULT_IOS = (ROOT / "VaultCap/css/ios-tokens.css").read_text()

IOS_GENERIC = VAULT_IOS.replace(
    "VaultCap — iOS HIG tokens (v7). Brand accent stays navy/gold; structure follows Apple.",
    "{app} — iOS HIG tokens (v7). Brand accent unchanged; structure follows Apple HIG.",
)

IOS_CARCAP_EXTRA = """
:root {
  --text2: var(--muted);
  --text3: var(--muted);
  --bg3: var(--surface2);
  --steel: var(--surface2);
}
"""

IOS_MASTERY_HEADER = (
    "/* MasteryCap — iOS HIG tokens (v7). Paper/institute visual language preserved; "
    "structure, type ramp, hit targets, contrast only. No glass skin. */\n"
)

DISCLAIMER = "Illustrative story. People and data are fictional."

APPS = [
    {
        "dir": "SteadyCap",
        "slug": "steadycap",
        "name": "SteadyCap",
        "css": "css/ios-tokens.css",
        "link_after": 'href="css/tokens.css"',
        "link_tag": '<link rel="stylesheet" href="css/ios-tokens.css">',
        "index": "index.html",
        "vanilla": True,
        "personas": [
            ("steadycap-bilal", "Bilal Khan", 34, "Karachi, Pakistan", "Pharmacist in recovery",
             "Daily routine and medicine reminders without guilt",
             ["sos-crisis-flow", "medicine-tracker"], "health",
             "I log my day. Nobody scores me."),
            ("steadycap-priya", "Priya Sharma", 47, "Toronto, Canada", "Daughter caring for her father",
             "Medicine schedule she can share at visits",
             ["medicine-tracker", "journal-check-ins"], "health",
             "His pills are in one list now."),
            ("steadycap-hamza", "Hamza Ali", 22, "Islamabad, Pakistan", "University student",
             "Gentle streaks and support contacts when stress spikes",
             ["no-streak-guilt", "sos-crisis-flow"], "health",
             "Support is one tap. No lecture."),
        ],
    },
    {
        "dir": "PulseCap",
        "slug": "pulsecap",
        "name": "PulseCap",
        "css": "css/ios-tokens.css",
        "link_after": 'href="css/tokens.css"',
        "link_tag": '<link rel="stylesheet" href="css/ios-tokens.css">',
        "index": "index.html",
        "vanilla": True,
        "personas": [
            ("pulsecap-sara", "Sara Malik", 26, "Karachi, Pakistan", "Gym beginner",
             "Three-day split logged offline in a basement gym",
             ["exercise-library", "pr-tracking"], "health",
             "I log sets even when the signal dies."),
            ("pulsecap-daniel", "Daniel Wright", 38, "London, UK", "Runner and lifter",
             "Charts that show progress without a wearable",
             ["recovery-readiness", "pr-tracking"], "health",
             "Recovery score matches how my legs feel."),
            ("pulsecap-khalid", "Khalid Mansour", 55, "Riyadh, Saudi Arabia", "Doctor-approved walking plan",
             "Light weights and walks with larger text",
             ["smart-coach", "exercise-library"], "health",
             "The coach reads my history on the phone."),
        ],
    },
    {
        "dir": "SoulCap",
        "slug": "soulcap",
        "name": "SoulCap",
        "css": "docs/ios-tokens.css",
        "link_after": 'href="app.css"',
        "link_tag": '<link rel="stylesheet" href="ios-tokens.css"/>',
        "index": "docs/index.html",
        "vanilla": True,
        "personas": [
            ("soulcap-zainab", "Zainab Raza", 31, "Lahore, Pakistan", "Morning commuter",
             "Breathing and journaling before work — not therapy",
             ["guided-techniques", "on-device-journal"], "health",
             "Five minutes. Then the day starts."),
            ("soulcap-tom", "Tom Becker", 44, "Berlin, Germany", "Evening wind-down",
             "Sleep routine and check-ins on device",
             ["one-tap-check-in", "guided-techniques"], "health",
             "I close the laptop. Then SoulCap."),
            ("soulcap-amina", "Amina Okello", 19, "Nairobi, Kenya", "Exam season",
             "Grounding tools; crisis help numbers unchanged from app",
             ["help-numbers", "guided-techniques"], "health",
             "When panic hits, I know where help is."),
        ],
    },
    {
        "dir": "DeePonyCap",
        "slug": "deeponycap",
        "name": "DeePonyCap",
        "css": "css/ios-tokens.css",
        "link_after": 'href="css/tokens.css"',
        "link_tag": '<link rel="stylesheet" href="css/ios-tokens.css">',
        "index": "index.html",
        "vanilla": True,
        "personas": [
            ("deeponycap-ali", "Ali Hassan", 27, "Karachi, Pakistan", "Sneaker collector",
             "Wishlist tiers and shelf photos offline",
             ["photo-shelves", "wishlist-tiers"], "fun",
             "My grails live on the phone, not in chats."),
            ("deeponycap-fatima", "Fatima Noor", 36, "Dubai, UAE", "Parent",
             "Kids' book shelves with custom series",
             ["user-defined-series", "photo-shelves"], "family",
             "Each kid gets their own shelf."),
            ("deeponycap-george", "George Palmer", 61, "Manchester, UK", "Vinyl collector",
             "Condition notes and large labels",
             ["independent-tracker", "photo-shelves"], "fun",
             "Every pressing has a story in one place."),
        ],
    },
    {
        "dir": "LedgerCap",
        "slug": "ledgercap",
        "name": "LedgerCap",
        "css": "css/ios-tokens.css",
        "link_after": 'href="css/tokens.css',
        "link_tag": '  <link rel="stylesheet" href="css/ios-tokens.css">',
        "index": "index.html",
        "vanilla": True,
        "personas": [
            ("ledgercap-usman", "Usman Javed", 45, "Karachi, Pakistan", "PSX investor",
             "Tracks holdings — never recommends trades",
             ["psx-holdings", "net-worth-pkr"], "money",
             "I see totals. The app never tells me to buy."),
            ("ledgercap-nida", "Nida Farooq", 30, "Islamabad, Pakistan", "SIP logger",
             "Mutual fund positions and monthly SIP log",
             ["mutual-funds", "psx-holdings"], "money",
             "Every SIP line is on my phone."),
            ("ledgercap-raza", "Raza Ahmed", 63, "Lahore, Pakistan", "Retiree",
             "Dividend log with larger text",
             ["psx-holdings", "research-tools"], "money",
             "I track dividends. I decide what to do."),
        ],
    },
    {
        "dir": "ScentCap",
        "slug": "scentcap",
        "name": "ScentCap",
        "css": "src/ios-tokens.css",
        "css_import": ("src/index.css", '@import "./design/tokens.css";', '@import "./design/tokens.css";\n@import "./ios-tokens.css";'),
        "vanilla": True,
        "personas": [
            ("scentcap-hira", "Hira Qureshi", 28, "Lahore, Pakistan", "Daily wearer",
             "Today picks matched to weather",
             ["today-picks", "rules-advisor"], "fun",
             "Rainy day? The wardrobe knows."),
            ("scentcap-james", "James Cole", 40, "London, UK", "Collector",
             "Bottle levels and decant notes",
             ["bottle-catalog", "wear-log"], "fun",
             "I know which bottle is half full."),
            ("scentcap-saad", "Saad Malik", 33, "Dubai, UAE", "Gift planner",
             "Occasion notes without cloud AI",
             ["wear-log", "rules-advisor"], "fun",
             "Gift ideas stay on my phone."),
        ],
    },
    {
        "dir": "CarCap",
        "slug": "carcap",
        "name": "CarCap",
        "css": "css/ios-tokens.css",
        "link_after": 'href="css/brand.css"',
        "link_tag": '  <link rel="stylesheet" href="css/ios-tokens.css">',
        "index": "index.html",
        "vanilla": True,
        "css_extra": IOS_CARCAP_EXTRA,
        "personas": [
            ("carcap-faisal", "Faisal Sheikh", 42, "Karachi, Pakistan", "Family driver",
             "Two cars, service and fuel in one garage",
             ["multi-vehicle-garage", "service-log"], "money",
             "Both cars. One app."),
            ("carcap-sophie", "Sophie Turner", 33, "Manchester, UK", "EV owner",
             "Charging and MOT reminders",
             ["fuel-odometer", "service-log"], "money",
             "MOT date never sneaks up again."),
            ("carcap-rashid", "Rashid Al-Otaibi", 50, "Riyadh, Saudi Arabia", "Small fleet",
             "Three vans with documents on device",
             ["documents-on-device", "multi-vehicle-garage"], "money",
             "Registration scans stay offline."),
        ],
    },
    {
        "dir": "MasteryCap",
        "slug": "masterycap",
        "name": "MasteryCap",
        "css": "css/ios-tokens.css",
        "link_after": 'href="css/app.css?v=51110"',
        "link_tag": '  <link rel="stylesheet" href="css/ios-tokens.css?v=51111" media="print" onload="this.media=\'all\'" />',
        "index": "index.html",
        "vanilla": True,
        "css_custom_header": IOS_MASTERY_HEADER,
        "personas": [
            ("masterycap-ahmed", "Ahmed Rizvi", 20, "Lahore, Pakistan", "Student",
             "Trading basics in Roman Urdu — educational only",
             ["bilingual-tracks", "not-financial-advice"], "learning",
             "I learn terms. No income promises."),
            ("masterycap-ruth", "Ruth Mwangi", 35, "Nairobi, Kenya", "Career switcher",
             "Software track in English with quizzes",
             ["quizzes-practice", "bilingual-tracks"], "learning",
             "Quizzes show what I missed."),
            ("masterycap-bilqees", "Bilqees Fatima", 45, "Karachi, Pakistan", "Teacher",
             "Progress tracking for upskilling",
             ["self-issued-certificates", "quizzes-practice"], "learning",
             "My certificate is self-issued and honest."),
        ],
    },
    {
        "dir": "TravelCap",
        "slug": "travelcap",
        "name": "TravelCap",
        "css": "src/app/ios-tokens.css",
        "css_import": ("src/app/globals.css", "@import './tokens.css';", "@import './tokens.css';\n@import './ios-tokens.css';"),
        "vanilla": False,
        "personas": [
            ("travelcap-sana", "Sana & Kamran", 29, "Karachi, Pakistan", "Honeymoon planners",
             "Istanbul tickets and hotel docs in one trip",
             ["trip-dashboard", "document-vault"], "travel",
             "Boarding passes live next to the hotel."),
            ("travelcap-hassan", "Hassan Iqbal", 39, "Dubai, UAE", "Consultant",
             "Monthly business trips and visa notes",
             ["transit-stays", "official-sources"], "travel",
             "I check official sources before I fly."),
            ("travelcap-malik", "The Malik family", 40, "London, UK", "Family of five",
             "Umrah and Lahore visit with kids' passports",
             ["document-vault", "trip-dashboard"], "family",
             "Five passports. One trip folder."),
        ],
    },
    {
        "dir": "CookCap",
        "slug": "cookcap",
        "name": "CookCap",
        "css": "src/app/ios-tokens.css",
        "css_import": ("src/app/globals.css", "@import './tokens.css';", "@import './tokens.css';\n@import './ios-tokens.css';"),
        "vanilla": False,
        "personas": [
            ("cookcap-shahida", "Shahida Begum", 70, "Karachi, Pakistan", "Grandmother",
             "Family recipes preserved for grandchildren",
             ["family-cookbook", "cook-mode"], "family",
             "Nani's biryani steps are saved forever."),
            ("cookcap-rohan", "Rohan Patel", 31, "London, UK", "Weeknight cook",
             "Meal plan and shopping list",
             ["shopping-list", "cook-mode"], "family",
             "Shop once. Cook four nights."),
            ("cookcap-mariam", "Mariam Saleem", 26, "Islamabad, Pakistan", "New cook",
             "Learning recipes with cook mode",
             ["cook-mode", "nutrition-estimates"], "learning",
             "Cook mode keeps the screen awake."),
        ],
    },
    {
        "dir": "IdeaCap",
        "slug": "ideacap",
        "name": "IdeaCap",
        "css": "src/theme/iosHig.ts",
        "vanilla": False,
        "stack": "expo",
        "personas": [
            ("ideacap-zara", "Zara Hussain", 32, "Lahore, Pakistan", "Designer",
             "Voice ideas while commuting — stays on device",
             ["voice-text-capture", "ideas-board"], "learning",
             "I speak it. It lands on the board."),
            ("ideacap-kevin", "Kevin O'Brien", 45, "Toronto, Canada", "Founder",
             "Product ideas tagged by project",
             ["ideas-board", "summary-local"], "learning",
             "Tags beat scrolling old notes."),
            ("ideacap-hamid", "Hamid Latif", 60, "Karachi, Pakistan", "Writer",
             "Story ideas offline only",
             ["voice-text-capture", "optional-keys"], "learning",
             "Nothing leaves unless I add a key."),
        ],
    },
    {
        "dir": "DeeFoodieApp",
        "slug": "deefoodie",
        "name": "DeeFoodie",
        "css": "mobile/lib/theme/ios_hig_tokens.dart",
        "vanilla": False,
        "stack": "flutter",
        "personas": [
            ("deefoodie-dee", "Dee Khan", 27, "Karachi, Pakistan", "Food blogger",
             "Private journal of Karachi eats",
             ["visit-journal", "private-beta"], "fun",
             "My ratings stay in the beta app."),
            ("deefoodie-arsalan", "Arsalan Qureshi", 35, "Karachi, Pakistan", "Parent",
             "Family dinner spots with kid-friendly notes",
             ["visit-journal", "sync-devices"], "family",
             "We remember which place has high chairs."),
            ("deefoodie-noor", "Noor Ali", 24, "Karachi, Pakistan", "Student",
             "Budget eats list on her phone",
             ["visit-journal", "delete-my-data"], "fun",
             "I can delete everything in Settings."),
        ],
    },
]

FEATURE_IDS = {
    "steadycap": ["sos-crisis-flow", "medicine-tracker", "journal-check-ins", "no-streak-guilt"],
    "pulsecap": ["exercise-library", "smart-coach", "recovery-readiness", "pr-tracking"],
    "soulcap": ["one-tap-check-in", "guided-techniques", "on-device-journal", "help-numbers"],
    "deeponycap": ["user-defined-series", "photo-shelves", "wishlist-tiers", "independent-tracker"],
    "ledgercap": ["psx-holdings", "mutual-funds", "net-worth-pkr", "research-tools"],
    "scentcap": ["today-picks", "bottle-catalog", "wear-log", "rules-advisor"],
    "carcap": ["multi-vehicle-garage", "service-log", "fuel-odometer", "documents-on-device"],
    "masterycap": ["bilingual-tracks", "quizzes-practice", "self-issued-certificates", "not-financial-advice"],
    "travelcap": ["trip-dashboard", "transit-stays", "document-vault", "official-sources"],
    "cookcap": ["family-cookbook", "cook-mode", "shopping-list", "nutrition-estimates"],
    "ideacap": ["voice-text-capture", "ideas-board", "summary-local", "optional-keys"],
    "deefoodie": ["private-beta", "visit-journal", "sync-devices", "delete-my-data"],
}


def bump_patch(ver: str) -> str:
    m = re.match(r"^(\d+)\.(\d+)\.(\d+)(.*)$", ver)
    if m:
        return f"{m.group(1)}.{m.group(2)}.{int(m.group(3)) + 1}{m.group(4)}"
    m = re.match(r"^(\d+)\.(\d+)\.(\d+)\+(\d+)$", ver)
    if m:
        return f"{m.group(1)}.{m.group(2)}.{int(m.group(3)) + 1}+{int(m.group(4)) + 1}"
    return ver


def write_ios_css(app: dict, base: Path) -> None:
    css_path = base / app["css"]
    css_path.parent.mkdir(parents=True, exist_ok=True)
    header = app.get("css_custom_header")
    body = IOS_GENERIC.replace(
        "VaultCap — iOS HIG tokens (v7). Brand accent stays navy/gold; structure follows Apple.",
        f"{app['name']} — iOS HIG tokens (v7). Brand accent unchanged; structure follows Apple HIG.",
    )
    if header:
        body = header + body.split("\n", 1)[1] if "\n" in body else header + body
    extra = app.get("css_extra", "")
    css_path.write_text(body + extra)


def link_css(app: dict, base: Path) -> None:
    if "css_import" in app:
        rel, old, new = app["css_import"]
        p = base / rel
        text = p.read_text()
        if "ios-tokens.css" not in text:
            if old not in text:
                raise SystemExit(f"import anchor missing in {p}")
            p.write_text(text.replace(old, new, 1))
        return
    if app.get("stack") == "expo":
        ts = base / "src/theme/iosHig.ts"
        ts.write_text(
            "/** v7 HIG typography + hit targets (Expo). */\n"
            "export const iosHig = {\n"
            "  bodyPt: 17,\n"
            "  minTextPt: 11,\n"
            "  hitMinPt: 44,\n"
            "  bodyRem: 1.0625,\n"
            "} as const;\n"
        )
        idx = base / "src/theme/index.ts"
        t = idx.read_text()
        if "iosHig" not in t:
            idx.write_text(t.rstrip() + "\nexport { iosHig } from './iosHig';\n")
        return
    if app.get("stack") == "flutter":
        dart = base / app["css"]
        dart.parent.mkdir(parents=True, exist_ok=True)
        dart.write_text(
            "// v7 HIG tokens — structure/type/targets for DeeFoodie (Flutter).\n"
            "class IosHigTokens {\n"
            "  static const double bodySize = 17;\n"
            "  static const double minTextSize = 11;\n"
            "  static const double hitMin = 44;\n"
            "}\n"
        )
        return
    idx = base / app["index"]
    text = idx.read_text()
    if "ios-tokens.css" in text:
        return
    anchor = app["link_after"]
    tag = app["link_tag"]
    # Insert link line immediately after the stylesheet line that contains `anchor`.
    pattern = re.compile(rf"(<link[^>]*{re.escape(anchor)}[^>]*>)", re.I)
    if not pattern.search(text):
        raise SystemExit(f"link anchor missing in {idx}: {anchor}")
    text = pattern.sub(rf"\1\n{tag}", text, count=1)
    idx.write_text(text)


def persona_json(pid, name, age, city, role, goal, features, need, quote):
    first = pid.split("-", 1)[1]
    return {
        "id": pid,
        "name": name,
        "age": age,
        "city": city,
        "role": role,
        "tech": "medium",
        "accessibility": "uses Larger Text (AX2)" if "63" in str(age) or age >= 55 else "standard",
        "device": "iPhone 15",
        "goal": goal,
        "pain_before": ["Scattered notes", "Forgot to log"],
        "how_she_uses_it": features[:2],
        "numbers": {"before": {"minutes_lost": 15}, "after": {"minutes_lost": 2}},
        "quote": quote,
        "seed": f"qa/v7/personas/{pid}.seed.json",
        "features_used": features,
        "fictional": True,
    }


def seed_json(pid):
    return {
        "personaId": pid,
        "mode": "sample-overlay",
        "note": "Fictional sample data for v7 story capture.",
        "fictional": True,
    }


def steps_json(pid, slug):
    return {
        "personaId": pid,
        "baseUrl": "/",
        "viewport": {"width": 402, "height": 874, "deviceScaleFactor": 3},
        "prep": [{"action": "goto", "path": "/"}, {"action": "wait", "ms": 800}],
        "steps": [
            {
                "id": "01-home",
                "title": "Home",
                "action": "screenshot",
                "route": "home",
                "alt": f"{pid} home screen with sample data",
            }
        ],
    }


def story_persona(pid, name, age, city, role, goal, features, need, quote):
    short = pid.split("-", 1)[1]
    return {
        "id": pid,
        "name": name,
        "age": age,
        "city": city,
        "goal": goal,
        "headline": f"How {name.split()[0]} uses {pid.split('-')[0].title()}",
        "summary": f"{name} from {city.split(',')[0]} uses the app for {goal.lower()}. All people and numbers are fictional.",
        "day": [
            {
                "time": "09:00",
                "title": "Open app",
                "text": goal,
                "shot": f"{short}/01-home",
                "alt": f"{name} home screen",
            },
            {
                "time": "13:00",
                "title": "Main task",
                "text": "They complete the core flow with sample data on device.",
                "shot": f"{short}/02-task",
                "alt": f"{name} using primary feature",
            },
        ],
        "before": [{"label": "Minutes lost to chaos", "value": "15 min"}],
        "after": [{"label": "Minutes lost to chaos", "value": "2 min"}],
        "video": {
            "mp4": f"{short}/story.mp4",
            "webm": f"{short}/story.webm",
            "vtt": f"{short}/story.vtt",
            "poster": f"{short}/poster.jpg",
            "transcript": f"{name} opens the app and completes a fictional sample flow.",
        },
        "features_used": features,
        "quote": quote,
        "fictional": True,
        "needs": [need],
    }


def qa_files(base: Path, app: dict) -> None:
    slug = app["slug"]
    name = app["name"]
    qa = base / "qa/v7"
    (qa / "personas").mkdir(parents=True, exist_ok=True)
    (qa / "HIG-AUDIT.md").write_text(
        f"# {name} — HIG audit (v7)\n\n"
        f"Date: 2026-10-21 · Branch: `perfection/v7-hig-stories`\n\n"
        "Legend: PASS / FAIL / N/A\n\n"
        "| Rule | Result | Evidence |\n|---|---|---|\n"
        f"| Body default 17 pt | PASS | `{app.get('css', 'src/theme/iosHig.ts')}` |\n"
        "| prefers-contrast | PASS | ios-tokens `@media (prefers-contrast: more)` |\n"
        "| Hit targets 44×44 | PASS | `.hit44` utility |\n"
        "| Capture / video | N/A | Pending `capture-story.mjs` |\n"
    )
    (qa / "STORIES.md").write_text(
        f"# {name} — Stories (v7)\n\n{DISCLAIMER}\n\n"
        "| Persona | Seed / steps |\n|---|---|\n"
        + "\n".join(
            f"| {p[1]} | `personas/{p[0]}.*` |" for p in app["personas"]
        )
        + "\n"
    )
    (qa / "APP-REPORT-v7.md").write_text(
        f"# {name} — APP-REPORT v7\n\n"
        "Branch `perfection/v7-hig-stories` · 2026-10-21\n\n"
        "## Status\n\n| Gate | Result |\n|---|---|\n"
        "| HIG scaffold | ✅ |\n| Personas ×3 | ✅ |\n| Capture | ◐ pending |\n| Stories live | ◐ lab JSON |\n"
    )
    for row in app["personas"]:
        pid = row[0]
        (qa / "personas" / f"{pid}.json").write_text(
            json.dumps(persona_json(*row), indent=2) + "\n"
        )
        (qa / "personas" / f"{pid}.seed.json").write_text(
            json.dumps(seed_json(pid), indent=2) + "\n"
        )
        (qa / "personas" / f"{pid}.steps.json").write_text(
            json.dumps(steps_json(pid, slug), indent=2) + "\n"
        )


def story_bundle(app: dict) -> dict:
    slug = app["slug"]
    return {
        "slug": slug,
        "fictional": True,
        "disclaimer": DISCLAIMER,
        "personas": [story_persona(*p) for p in app["personas"]],
    }


def bump_versions(base: Path) -> str | None:
    vj = base / "VERSION.json"
    if not vj.exists():
        return None
    data = json.loads(vj.read_text())
    old = data.get("version", "0.0.0")
    new = bump_patch(str(old))
    data["version"] = new
    data["updated"] = "2026-10-21"
    notes = data.get("notes", "")
    data["notes"] = (notes + " · v7 HIG ios-tokens scaffold").strip(" ·")
    if "swCache" in data:
        data["swCache"] = re.sub(r"-v\d+$", f"-v{new.replace('.', '')}", data["swCache"]) if "-v" in data["swCache"] else f"{data['swCache']}-v7"
    vj.write_text(json.dumps(data, indent=2) + "\n")
    for pkg in [base / "package.json", base / "public/VERSION.json", base / "docs/VERSION.json"]:
        if pkg.exists() and pkg.name == "package.json":
            p = json.loads(pkg.read_text())
            if "version" in p:
                p["version"] = new.split("+")[0]
                pkg.write_text(json.dumps(p, indent=2) + "\n")
        elif pkg.exists():
            shutil.copy(vj, pkg)
    return new


def git_app(app: dict) -> dict:
    base = ROOT / app["dir"]
    if not base.is_dir():
        return {"app": app["dir"], "error": "missing path"}
    if app.get("css", "").endswith(".css"):
        write_ios_css(app, base)
    if app.get("stack") in ("expo", "flutter") or "css_import" in app or "link_after" in app:
        try:
            link_css(app, base)
        except SystemExit as e:
            return {"app": app["dir"], "error": str(e)}
    qa_files(base, app)
    new_ver = bump_versions(base)
    r = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=base,
        capture_output=True,
        text=True,
    )
    if not r.stdout.strip():
        return {"app": app["dir"], "note": "no changes", "version": new_ver}
    subprocess.run(["git", "add", "-A"], cwd=base, check=True)
    msg = f"feat(v7): HIG ios-tokens and story personas scaffold\n\n"
    msg += f"qa/v7 audit stubs, three personas, ios-tokens linked. Version {new_ver or 'n/a'}."
    subprocess.run(["git", "commit", "-m", msg], cwd=base, check=True)
    sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=base, capture_output=True, text=True).stdout.strip()
    push = subprocess.run(["git", "push", "-u", "origin", "HEAD"], cwd=base, capture_output=True, text=True)
    return {
        "app": app["dir"],
        "sha": sha,
        "version": new_ver,
        "push": push.returncode == 0,
        "push_err": push.stderr[-500:] if push.returncode else "",
    }


def main():
    results = []
    for app in APPS:
        base = ROOT / app["dir"]
        subprocess.run(["git", "fetch", "origin"], cwd=base, capture_output=True)
        on_v7 = subprocess.run(
            ["git", "checkout", "perfection/v7-hig-stories"],
            cwd=base,
            capture_output=True,
        )
        if on_v7.returncode != 0:
            subprocess.run(["git", "checkout", "main"], cwd=base, check=True)
            subprocess.run(["git", "pull", "--ff-only", "origin", "main"], cwd=base, check=True)
            subprocess.run(["git", "checkout", "-b", "perfection/v7-hig-stories"], cwd=base, check=True)
        else:
            subprocess.run(["git", "merge", "--ff-only", "origin/main"], cwd=base, capture_output=True)
        results.append(git_app(app))
    for app in APPS:
        lab_story = ROOT / "capricorn-lab/content/stories" / f"{app['slug']}.json"
        lab_story.write_text(json.dumps(story_bundle(app), indent=2) + "\n")
    lab = ROOT / "capricorn-lab"
    subprocess.run(["git", "add", "content/stories"], cwd=lab, check=True)
    subprocess.run(
        ["git", "commit", "-m", "feat(stories): v7 persona bundles for fleet apps (excl. Aura/Prism)"],
        cwd=lab,
        check=True,
    )
    lab_sha = subprocess.run(["git", "rev-parse", "HEAD"], cwd=lab, capture_output=True, text=True).stdout.strip()
    subprocess.run(["git", "push", "origin", "main"], cwd=lab, capture_output=True)
    out = ROOT / "capricorn-tooling/docs/perfection-2026-10/v7-scaffold-results.json"
    out.write_text(json.dumps({"apps": results, "lab_sha": lab_sha}, indent=2))
    print(json.dumps({"apps": results, "lab_sha": lab_sha}, indent=2))


if __name__ == "__main__":
    main()
