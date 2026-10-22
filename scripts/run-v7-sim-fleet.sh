#!/usr/bin/env bash
# v7 §7.4 — one simulator at a time.
# Outer loop = device (boot once), inner = all apps × light/dark/Larger Text AX3.
# Screenshots → <App>/build/qa/v7/sim/ (gitignored). Agent updates qa/v7/SIM-PASS.md.
set -uo pipefail
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SCRIPT="$ROOT/capricorn-tooling/scripts/v7-sim-pass.mjs"
BASE="${SIM_BASE_URL:-https://shamikhahmed.github.io}"
NODE="${NODE:-$(command -v node)}"
LOG="${SIM_FLEET_LOG:-$ROOT/capricorn-tooling/docs/perfection-2026-10/v7-fix-logs/sim-fleet-run.log}"
mkdir -p "$(dirname "$LOG")"

log() { printf '%s\n' "$*" | tee -a "$LOG"; }

APPS=(
  "SteadyCap|SteadyCap/?demo=1"
  "DeePonyCap|DeePonyCap/?demo=1"
  "LedgerCap|LedgerCap/?demo=1"
  "ScentCap|ScentCap/?demo=1"
  "SoulCap|SoulCap/?demo=1"
  "VaultCap|VaultCap/?demo=1"
  "PulseCap|PulseCap/?demo=1"
  "CarCap|CarCap/?demo=1"
  "MasteryCap|MasteryCap/?demo=1"
  "TravelCap|TravelCap/?demo=1"
  "CookCap|CookCap/"
  "IdeaCap|IdeaCap/"
  "DeeFoodieApp|DeeFoodieApp/"
)

png_count() {
  local app="$1"
  local out="$ROOT/$app/build/qa/v7/sim"
  find "$out" -maxdepth 1 -name "${app}-*.png" 2>/dev/null | wc -l | tr -d ' '
}

shot() {
  local app="$1" path="$2" preset="$3"
  shift 3
  local url="$BASE/$path"
  local out="$ROOT/$app/build/qa/v7/sim"
  mkdir -p "$out"
  if "$NODE" "$SCRIPT" --app "$app" --url "$url" --out "$out" --preset="$preset" "$@"; then
    return 0
  fi
  log "WARN: shot failed app=$app preset=$preset args=$* — retry once"
  sleep 2
  "$NODE" "$SCRIPT" --app "$app" --url "$url" --out "$out" --preset="$preset" "$@" \
    || { log "FAIL: shot failed app=$app preset=$preset args=$*"; return 1; }
}

log "=== v7 sim fleet start $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
xcrun simctl shutdown all 2>/dev/null || true

failures=0
for preset in se pro ipad; do
  log "=== DEVICE PRESET: $preset (one at a time) ==="
  for entry in "${APPS[@]}"; do
    app="${entry%%|*}"
    path="${entry#*|}"
    # Skip if this device already has light+dark+ax3 (tolerate legacy trailing-dash slugs)
    case "$preset" in
    esac
    out="$ROOT/$app/build/qa/v7/sim"
    # Simpler: count PNGs for this preset via device token
    case "$preset" in
      se) token='iphone-se' ;;
      pro) token='iphone-16-pro' ;;
      ipad) token='ipad-air' ;;
    esac
    have=$(find "$out" -maxdepth 1 -name "${app}-*${token}*.png" 2>/dev/null | wc -l | tr -d ' ')
    if [ "${have:-0}" -ge 3 ]; then
      log "SKIP $app @ $preset (already ${have} PNGs)"
      continue
    fi
    log "--- $app @ $preset (have=${have:-0}) ---"
    shot "$app" "$path" "$preset" || failures=$((failures + 1))
    shot "$app" "$path" "$preset" --dark || failures=$((failures + 1))
    shot "$app" "$path" "$preset" --larger-text || failures=$((failures + 1))
  done
  log "=== shutting down after $preset ==="
  xcrun simctl shutdown all 2>/dev/null || true
done

log "=== PNG tally ==="
total=0
for entry in "${APPS[@]}"; do
  app="${entry%%|*}"
  n="$(png_count "$app")"
  total=$((total + n))
  log "$app: $n"
done
log "TOTAL: $total (expect 117 = 13 apps × 9) failures=$failures"
log "v7 sim fleet: complete $(date -u +%Y-%m-%dT%H:%M:%SZ). Commit qa/v7/SIM-PASS.md only (not build/ PNGs)."
exit 0
