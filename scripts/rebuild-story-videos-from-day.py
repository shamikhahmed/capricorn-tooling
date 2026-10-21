#!/usr/bin/env python3
"""Rebuild story.mp4/webm/vtt/poster from day[].shot PNGs already on disk."""
from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LAB = ROOT / "capricorn-lab" / "content" / "stories"
HERE = Path(__file__).resolve().parent

spec = importlib.util.spec_from_file_location("rebuild_stories_v7", HERE / "rebuild-stories-v7.py")
mod = importlib.util.module_from_spec(spec)
assert spec.loader
spec.loader.exec_module(mod)


def main() -> None:
    slugs = [p.stem for p in LAB.glob("*.json") if p.name not in ("schema.json",) and not p.name.startswith("_")]
    if len(sys.argv) > 1:
        slugs = [sys.argv[1]]
    for slug in slugs:
        bundle = json.loads((LAB / f"{slug}.json").read_text())
        for p in bundle.get("personas", []):
            short = p["id"].split("-")[-1]
            dest = LAB / slug / short
            if not dest.exists():
                print(f"skip missing {dest}")
                continue
            # day shots are like "ayesha/01-iphone" — build_video expects basename under dest
            day = []
            for step in p["day"]:
                shot = step["shot"].split("/")[-1]
                day.append({**step, "shot": f"{short}/{shot}"})
            mod.build_video(dest, day, short)
            print(f"video {p['id']} ({len(day)} steps)")


if __name__ == "__main__":
    main()
