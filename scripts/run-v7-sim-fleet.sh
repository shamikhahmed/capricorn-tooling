#!/usr/bin/env bash
# v7 §7.4 — one simulator at a time, three presets × light/dark (+ optional AX3).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$ROOT/capricorn-tooling/scripts/v7-sim-pass.mjs"
BASE="${SIM_BASE_URL:-https://shamikhahmed.github.io}"

run_app() {
  local app="$1" path="$2"
  local url="$BASE/$path"
  local out="$ROOT/$app/build/qa/v7/sim"
  mkdir -p "$out"
  for preset in se pro ipad; do
    node "$SCRIPT" --app "$app" --url "$url" --out "$out" --preset="$preset"
    node "$SCRIPT" --app "$app" --url "$url" --out "$out" --preset="$preset" --dark
    node "$SCRIPT" --app "$app" --url "$url" --out "$out" --preset="$preset" --larger-text
  done
}

run_app SteadyCap "SteadyCap/?demo=1"
run_app DeePonyCap "DeePonyCap/?demo=1"
run_app LedgerCap "LedgerCap/?demo=1"
run_app ScentCap "ScentCap/?demo=1"
run_app SoulCap "SoulCap/?demo=1"

echo "v7 sim fleet: Capacitor/PWA targets done (Safari sim). Expo/Flutter: run native separately."
