#!/usr/bin/env bash
# Clone or update every Capricorn git repo in the workspace.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
ORG="${CAP_GITHUB_ORG:-shamikhahmed}"

REPOS=(
  capricorn-tooling
  shamikhahmed.github.io
  VaultCap
  PulseCap
  PrismCap
  SteadyCap
  LedgerCap
  DeePonyCap
  ScentCap
  AuraCap
)

clone_or_pull() {
  local name="$1"
  local dir="$ROOT/$name"
  local url="https://github.com/$ORG/$name.git"

  if [ -d "$dir/.git" ]; then
    echo "▸ pull  $name"
    git -C "$dir" pull --ff-only origin main
    return
  fi

  if [ -e "$dir" ]; then
    echo "▸ init  $name (existing folder, no .git)"
    git -C "$dir" init -b main
    git -C "$dir" remote add origin "$url" 2>/dev/null || git -C "$dir" remote set-url origin "$url"
    git -C "$dir" add -A
    if ! git -C "$dir" diff --cached --quiet; then
      git -C "$dir" commit -m "Initial commit from local workspace."
    fi
    git -C "$dir" branch -M main
    git -C "$dir" push -u origin main 2>/dev/null || echo "  (push skipped — remote may already have history; pull/rebase manually)"
    return
  fi

  echo "▸ clone $name"
  git clone "$url" "$dir"
}

echo "Capricorn workspace: $ROOT"
echo ""

for repo in "${REPOS[@]}"; do
  clone_or_pull "$repo"
done

echo ""
echo "Done. Symlink tooling if needed:"
echo "  ln -sf capricorn-tooling/scripts  $ROOT/scripts"
echo "  ln -sf capricorn-tooling/shared    $ROOT/shared"
echo "  ln -sf capricorn-tooling/cap-agents $ROOT/cap-agents"
