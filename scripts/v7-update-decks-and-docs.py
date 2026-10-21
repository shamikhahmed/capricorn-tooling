#!/usr/bin/env python3
"""Fleet v7 follow-up: noscript ios-tokens, version sync in decks/docs,
README stories links, PRESENTATION stories slide, CHANGELOG note.

Run from Cap-Apps root or tooling:
  python3 capricorn-tooling/scripts/v7-update-decks-and-docs.py
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

APPS = [
    ("VaultCap", "vaultcap", "5.4.0"),
    ("SteadyCap", "steadycap", "2.6.6"),
    ("PulseCap", "pulsecap", "6.46.10"),
    ("SoulCap", "soulcap", "8.4.1"),
    ("DeePonyCap", "deeponycap", "3.9.10"),
    ("LedgerCap", "ledgercap", "3.58.10"),
    ("ScentCap", "scentcap", "2.2.1"),
    ("CarCap", "carcap", "1.1.3"),
    ("MasteryCap", "masterycap", "51.10.11"),
    ("TravelCap", "travelcap", "1.1.11"),
    ("CookCap", "cookcap", "3.7.4"),
    ("IdeaCap", "ideacap", "2.1.4"),
    ("DeeFoodieApp", "deefoodie", "1.1.1"),
]

# Old version strings commonly left in decks (replaced with current)
OLD_BY_APP = {
    "VaultCap": ["5.1.17", "5.1.1", "5.3.1", "5.3.0", "5.2.2"],
    "SteadyCap": ["2.6.0", "2.5.0", "2.6.5"],
    "PulseCap": ["6.41.0", "6.46.0", "6.45.0"],
    "SoulCap": ["8.0.2", "8.4.0", "1.9.0"],
    "DeePonyCap": ["3.7.0", "3.9.0", "3.8.0"],
    "LedgerCap": ["3.55.2", "3.46.0", "3.58.0"],
    "ScentCap": ["2.2.0", "2.1.0", "2.0.0"],
    "CarCap": ["0.2.0", "1.1.0", "1.1.2"],
    "MasteryCap": ["51.8.0", "51.10.0", "51.10.10"],
    "TravelCap": ["1.1.0", "1.1.10", "1.0.0"],
    "CookCap": ["3.7.0", "3.6.1", "3.7.3"],
    "IdeaCap": ["2.1.0", "2.0.0", "2.1.3"],
    "DeeFoodieApp": ["1.1.0", "1.0.0", "1.1.1+3"],
}

DECK_GLOBS = [
    "pitch.html",
    "presentation.html",
    "docs/pitch.html",
    "docs/PRESENTATION.md",
    "PRESENTATION.md",
    "public/pitch.html",
    "public/presentation.html",
    "INVESTOR_DECK.md",
]


def read_version(app_dir: Path, fallback: str) -> str:
    for rel in ("VERSION.json", "public/VERSION.json", "docs/VERSION.json"):
        p = app_dir / rel
        if p.exists():
            try:
                return json.loads(p.read_text())["version"].split("+")[0]
            except Exception:
                pass
    return fallback


def fix_noscript_ios_tokens(html_path: Path) -> bool:
    if not html_path.exists():
        return False
    text = html_path.read_text(encoding="utf-8")
    if "ios-tokens" not in text:
        return False
    # Find the async/print link href for ios-tokens
    m = re.search(
        r'<link[^>]+href="([^"]*ios-tokens\.css[^"]*)"[^>]*>',
        text,
        re.I,
    )
    if not m:
        return False
    href = m.group(1)
    changed = False

    def ensure_in_noscript(block: str) -> str:
        nonlocal changed
        if "ios-tokens" in block:
            return block
        # insert before closing — after first stylesheet if any
        insert = f'    <link rel="stylesheet" href="{href}" />\n'
        if re.search(r'<link[^>]+stylesheet', block, re.I):
            # after last stylesheet link
            def after_last(m2):
                return m2.group(0) + "\n" + insert.rstrip("\n")

            new_b, n = re.subn(
                r'(<link[^>]+rel=["\']stylesheet["\'][^>]*/?>)',
                after_last,
                block,
                count=1,
                flags=re.I,
            )
            if n:
                changed = True
                return new_b
        changed = True
        return insert + block

    def repl(m_ns):
        inner = m_ns.group(1)
        return "<noscript>\n" + ensure_in_noscript(inner) + "</noscript>"

    new_text, n = re.subn(
        r"<noscript>(.*?)</noscript>",
        repl,
        text,
        count=1,
        flags=re.S | re.I,
    )
    if n and changed:
        html_path.write_text(new_text, encoding="utf-8")
        return True
    return False


def bump_versions_in_text(text: str, app: str, new_ver: str) -> str:
    for old in OLD_BY_APP.get(app, []):
        if old == new_ver:
            continue
        # v-prefixed and bare in footer-ish contexts
        text = text.replace(f"v{old}", f"v{new_ver}")
        # avoid rewriting dates; only bare X.Y.Z when preceded by version-ish words
        text = re.sub(
            rf"(?i)(version[:\s]*|·\s*|ship build\.|PWA\s*\(|offline[^\n]{{0,40}})\b{re.escape(old)}\b",
            lambda m: m.group(1) + new_ver,
            text,
        )
    return text


STORIES_SLIDE = """
---

## Slide — Real people (illustrative)

Three fictional personas show how people use {name} day to day — before/after numbers, timeline screenshots, and a short silent video with captions.

**Stories:** https://shamikhahmed.github.io/apps/{slug}/  
**Index:** https://shamikhahmed.github.io/stories/

*Illustrative story. People and data are fictional.*
"""

README_STORIES = """
## Real stories

Illustrative day-in-the-life stories (fictional personas) with screenshots and captions:

- App stories: https://shamikhahmed.github.io/apps/{slug}/
- All Cap stories: https://shamikhahmed.github.io/stories/

"""


def update_presentation_md(path: Path, name: str, slug: str, ver: str) -> bool:
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    orig = text
    text = bump_versions_in_text(text, path.parent.name if path.parent.name != "docs" else path.parents[1].name, ver)
    # Fix app name from parent
    app = name
    text = bump_versions_in_text(text, app, ver)
    if "shamikhahmed.github.io/stories" not in text and "Real people" not in text:
        # insert before final Close slide if present, else append
        close = re.search(r"\n## Slide[^\n]*[Cc]lose", text)
        block = STORIES_SLIDE.format(name=name, slug=slug)
        if close:
            text = text[: close.start()] + "\n" + block + text[close.start() :]
        else:
            text = text.rstrip() + "\n" + block + "\n"
    # VaultCap brand correction in PRESENTATION if still blue
    if name == "VaultCap" and "#5b8dee" in text:
        text = text.replace("#5b8dee", "#D4A017")
        text = text.replace("trust blue on obsidian", "midnight + gold")
    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def update_readme(path: Path, slug: str, ver: str, app: str) -> bool:
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    orig = text
    # Version line
    text = re.sub(
        r"(?m)^(\*\*Version:\*\*\s*)[\d.]+(\+\d+)?\s*$",
        rf"\g<1>{ver}",
        text,
        count=1,
    )
    text = bump_versions_in_text(text, app, ver)
    if "shamikhahmed.github.io/stories" not in text and "github.io/apps/" not in text:
        # after first ## or after intro block
        block = README_STORIES.format(slug=slug)
        m = re.search(r"\n---\n", text)
        if m:
            text = text[: m.end()] + "\n" + block + text[m.end() :]
        else:
            text = text.rstrip() + "\n" + block
    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def update_changelog(path: Path, ver: str, app: str) -> bool:
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    if re.search(rf"\[{re.escape(ver)}\]|## .*{re.escape(ver)}", text):
        # ensure stories/HIG mentioned in that section
        if "stories" in text.lower() or "HIG" in text or "ios-tokens" in text:
            return False
    # prepend brief entry if missing top version
    if not re.search(rf"## \[{re.escape(ver)}\]", text) and not re.search(
        rf"^## .*{re.escape(ver)}", text, re.M
    ):
        entry = (
            f"## [{ver}] — 2026-10-21\n\n"
            f"- HIG v7: iOS tokens / native feel; Dynamic Type & hit targets where applicable\n"
            f"- Real-people stories live on hub (`/apps/<slug>/` + `/stories/`)\n"
            f"- Pitch/presentation/README synced to {ver}\n\n"
        )
        path.write_text(entry + text, encoding="utf-8")
        return True
    return False


def update_deck_html(path: Path, app: str, ver: str, slug: str, name: str) -> bool:
    if not path.exists():
        return False
    text = path.read_text(encoding="utf-8")
    orig = text
    text = bump_versions_in_text(text, app, ver)
    # Add stories link near close if missing
    if "github.io/stories" not in text and "github.io/apps/" not in text:
        link = (
            f'<p class="anim" style="margin-top:18px;font-size:14px">'
            f'<a href="https://shamikhahmed.github.io/apps/{slug}/" style="color:inherit">'
            f"Real stories · {name}</a> · "
            f'<a href="https://shamikhahmed.github.io/stories/" style="color:inherit">All stories</a>'
            f"</p>"
        )
        # before last closing of a closing slide if we find "Close" or built by
        if "Built by" in text:
            text = text.replace("Built by", link + "\nBuilt by", 1)
        elif "</body>" in text:
            text = text.replace("</body>", link + "\n</body>", 1)
    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    report = []
    for app, slug, fallback in APPS:
        d = ROOT / app
        if not d.is_dir():
            report.append(f"SKIP missing {app}")
            continue
        ver = read_version(d, fallback)
        changes = []

        for html in [
            d / "index.html",
            d / "docs" / "index.html",
            d / "public" / "index.html",
        ]:
            if fix_noscript_ios_tokens(html):
                changes.append(f"noscript:{html.relative_to(d)}")

        touched = set()
        for rel in DECK_GLOBS:
            p = d / rel
            if not p.exists():
                continue
            key = str(rel)
            if p.suffix == ".html":
                if update_deck_html(p, app, ver, slug, app):
                    changes.append(key)
                    touched.add(key)
            elif p.suffix == ".md":
                if update_presentation_md(p, app, slug, ver):
                    changes.append(key)
                    touched.add(key)
        if update_readme(d / "README.md", slug, ver, app):
            changes.append("README.md")

        for cl in [d / "CHANGELOG.md", d / "docs" / "CHANGELOG.md"]:
            if update_changelog(cl, ver, app):
                changes.append(str(cl.relative_to(d)))

        report.append(f"{app} v{ver}: {', '.join(changes) if changes else '(no file changes)'}")

    # Hub pitch + lab meta
    hub_pitch = ROOT / "shamikhahmed.github.io" / "pitch.html"
    if hub_pitch.exists():
        t = hub_pitch.read_text(encoding="utf-8")
        o = t
        t = t.replace("Fifteen Caps", "Thirteen Caps")
        t = t.replace("fifteen Cap", "thirteen Cap")
        t = t.replace("Fifteen Caps. Offline-first.", "Thirteen Caps. Offline-first.")
        if "github.io/stories" not in t:
            t = t.replace(
                '<a class="ghost" href="https://shamikhahmed.github.io/VaultCap/?demo=1">Vault demo</a>',
                '<a class="ghost" href="https://shamikhahmed.github.io/VaultCap/?demo=1">Vault demo</a>\n'
                '      <a class="ghost" href="https://shamikhahmed.github.io/stories/">Real stories</a>',
            )
        # Drop Aura/Prism QR if present
        t = re.sub(r'<a[^>]*>[\s\S]*?(AuraCap|PrismCap)[\s\S]*?</a>\s*', "", t)
        if t != o:
            hub_pitch.write_text(t, encoding="utf-8")
            report.append("hub pitch.html: Thirteen Caps + stories CTA")

    # Lab index meta Fifteen → Thirteen (source for hub)
    for labf in [
        ROOT / "capricorn-lab" / "index.html",
        ROOT / "shamikhahmed.github.io" / "index.html",
    ]:
        if not labf.exists():
            continue
        t = labf.read_text(encoding="utf-8")
        o = t
        t = t.replace("Fifteen Caps", "Thirteen Caps")
        t = t.replace("fifteen Caps", "thirteen Caps")
        if t != o:
            labf.write_text(t, encoding="utf-8")
            report.append(f"{labf.relative_to(ROOT)}: Fifteen→Thirteen")

    print("\n".join(report))


if __name__ == "__main__":
    main()
