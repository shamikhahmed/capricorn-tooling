#!/usr/bin/env python3
"""Build 20–40s silent story.mp4 + story.webm + poster.jpg + story.vtt
from persona day screenshots under capricorn-lab/content/stories/<slug>/.

Usage:
  python3 make-story-videos.py <slug>           # one app
  python3 make-story-videos.py --all            # every stories/*.json
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LAB_STORIES = ROOT / "capricorn-lab" / "content" / "stories"
HOLD_S = 6.5  # ~5–6 frames → 20–40s


def persona_short(pid: str) -> str:
    return pid.split("-")[-1]


def build_persona(slug: str, persona: dict) -> None:
    short = persona_short(persona["id"])
    d = LAB_STORIES / slug / short
    d.mkdir(parents=True, exist_ok=True)

    shots: list[tuple[Path, str, str, str]] = []
    for step in persona.get("day") or []:
        shot = step.get("shot") or ""
        name = shot.split("/")[-1]
        if not name:
            continue
        png = d / f"{name}.png"
        if png.exists():
            shots.append(
                (
                    png,
                    step.get("time") or "",
                    step.get("title") or "",
                    step.get("text") or "",
                )
            )
    if not shots:
        print(f"SKIP {slug}/{short}: no PNG shots")
        return

    listfile = d / "_concat.txt"
    lines = []
    for png, *_ in shots:
        lines.append(f"file '{png.name}'")
        lines.append(f"duration {HOLD_S}")
    # concat demuxer needs last file repeated
    lines.append(f"file '{shots[-1][0].name}'")
    listfile.write_text("\n".join(lines) + "\n")

    poster = d / "poster.jpg"
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(shots[0][0]), "-q:v", "3", str(poster)],
        check=True,
        capture_output=True,
    )

    mp4 = d / "story.mp4"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(listfile),
            "-vf",
            "scale=720:-2:flags=lanczos",
            "-c:v",
            "libx264",
            "-pix_fmt",
            "yuv420p",
            "-crf",
            "28",
            "-an",
            "-movflags",
            "+faststart",
            str(mp4),
        ],
        check=True,
        capture_output=True,
        cwd=d,
    )

    webm = d / "story.webm"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(mp4),
            "-c:v",
            "libvpx-vp9",
            "-b:v",
            "0",
            "-crf",
            "35",
            "-an",
            str(webm),
        ],
        check=True,
        capture_output=True,
    )

    # WebVTT captions — one cue per day step
    vtt_lines = ["WEBVTT", ""]
    t = 0.0
    for i, (_, time_label, title, text) in enumerate(shots):
        start = t
        end = t + HOLD_S
        cue = f"{title}. {text}".strip() or f"Step {i + 1}"
        if time_label:
            cue = f"{time_label} — {cue}"
        vtt_lines.append(f"{_ts(start)} --> {_ts(end)}")
        vtt_lines.append(cue)
        vtt_lines.append("")
        t = end
    (d / "story.vtt").write_text("\n".join(vtt_lines) + "\n")

    listfile.unlink(missing_ok=True)
    size = mp4.stat().st_size
    print(f"OK {slug}/{short}: {len(shots)} shots → {size // 1024}KB mp4")


def _ts(sec: float) -> str:
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = sec % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}"


def build_slug(slug: str) -> None:
    bundle = LAB_STORIES / f"{slug}.json"
    if not bundle.exists():
        print(f"missing {bundle}")
        return
    data = json.loads(bundle.read_text())
    for p in data.get("personas") or []:
        build_persona(slug, p)


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    if args[0] == "--all":
        for p in sorted(LAB_STORIES.glob("*.json")):
            if p.name == "schema.json":
                continue
            build_slug(p.stem)
        return 0
    build_slug(args[0].lower())
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
