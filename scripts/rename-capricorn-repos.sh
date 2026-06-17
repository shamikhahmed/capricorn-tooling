#!/usr/bin/env bash
# Run after: gh auth login
# Renames GitHub repos to match Capricorn product names.
set -euo pipefail

GH="${GH:-gh}"
REPOS=(
  "VaultOS:VaultCap"
  "FitnessOS:PulseCap"
  "PrismOS:PrismCap"
  "DisciplineOS:SteadyCap"
  "StundsOS:LedgerCap"
  "DeePonyOS:DeePonyCap"
)

for pair in "${REPOS[@]}"; do
  old="${pair%%:*}"
  new="${pair##*:}"
  echo "Renaming shamikhahmed/$old → $new"
  $GH repo rename "$new" --repo "shamikhahmed/$old" --yes
done

PROJECTS_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for pair in "${REPOS[@]}"; do
  new="${pair##*:}"
  dir="$PROJECTS_ROOT/$new"
  if [[ -d "$dir/.git" ]]; then
    git -C "$dir" remote set-url origin "https://github.com/shamikhahmed/$new.git"
    echo "Updated remote: $new"
  fi
done

echo "Done. GitHub Pages URLs:"
echo "  https://shamikhahmed.github.io/VaultCap/"
echo "  https://shamikhahmed.github.io/PulseCap/"
echo "  https://shamikhahmed.github.io/PrismCap/"
echo "  https://shamikhahmed.github.io/SteadyCap/"
echo "  https://shamikhahmed.github.io/LedgerCap/"
echo "  https://shamikhahmed.github.io/DeePonyCap/"
