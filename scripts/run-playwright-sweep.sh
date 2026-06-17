#!/usr/bin/env bash
# Wrapper — canonical script lives in VaultCap/scripts (versioned).
exec "$(cd "$(dirname "$0")/.." && pwd)/VaultCap/scripts/run-playwright-sweep.sh" "$@"
