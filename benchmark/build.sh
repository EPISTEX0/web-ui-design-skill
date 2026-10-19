#!/usr/bin/env bash
# Usage: build.sh <brief> <arm> <rep>
# arm: none | frontend-design | web-ui-design (v0.1, frozen) | web-ui-design-0.2 (this repo's skill)
# Runs one clean headless Claude Code session on the brief and saves the site and the transcript.
set -euo pipefail
brief=$1 arm=$2 rep=$3
here=$(cd "$(dirname "$0")" && pwd)
model=${MODEL:-claude-sonnet-5-5}
root=${WORK_ROOT:-/tmp/client-sites}
id="$brief--$arm--$rep"
out="$here/results/raw/$id"
[[ -f "$out/result.json" ]] && { echo "skip $id"; exit 0; }
mkdir -p "$out" "$root/bin"
# Every arm gets the same browser on PATH, as most developer machines have one.
chrome=${CHROME_BIN:-$(ls "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux*/chrome 2>/dev/null | tail -1)}
[[ -x "$root/bin/chromium" ]] || printf '#!/bin/sh\nexec "%s" "$@"\n' "$chrome" > "$root/bin/chromium"
chmod +x "$root/bin/chromium"

run=$(mktemp -d "$root/XXXXXX")
cfg="$run/.config"
site="$run/$brief"
mkdir -p "$cfg" "$site"
cp "$HOME/.claude/.credentials.json" "$cfg/"
trap 'rm -f "$cfg/.credentials.json"' EXIT
case $arm in
	none) ;;
	frontend-design) mkdir -p "$cfg/skills" && cp -r "$here/arms/frontend-design" "$cfg/skills/" ;;
	web-ui-design) mkdir -p "$cfg/skills" && cp -r "$here/arms/web-ui-design-0.1" "$cfg/skills/web-ui-design" ;;
	web-ui-design-0.2) mkdir -p "$cfg/skills" && cp -r "$here/../skills/web-ui-design" "$cfg/skills/web-ui-design" ;;
	*) echo "unknown arm $arm" >&2; exit 2 ;;
esac

start=$(date +%s)
# Each build gets a private /tmp, so parallel builds cannot read each other's screenshots.
bwrap --dev-bind / / --tmpfs /tmp --bind "$run" "$run" --bind "$root/bin" "$root/bin" --chdir "$site" -- \
	env PATH="$root/bin:$PATH" CLAUDE_CONFIG_DIR="$cfg" timeout 2400 claude -p "$(cat "$here/briefs/$brief.md")" \
	--model "$model" --permission-mode bypassPermissions --max-budget-usd 8 \
	--output-format stream-json --verbose > "$out/transcript.jsonl" 2> "$out/stderr.txt" || true
end=$(date +%s)

tail -n 1 "$out/transcript.jsonl" | jq --arg s $((end - start)) --arg arm "$arm" --arg brief "$brief" --arg model "$model" \
	'{brief: $brief, arm: $arm, model: $model, wall_s: ($s|tonumber), is_error, num_turns, total_cost_usd, usage}' > "$out/result.json" || echo '{"error":"no result"}' > "$out/result.json"
rm -rf "$out/site" && rsync -a --exclude node_modules --exclude .git "$site/" "$out/site/"
rm -rf "$run"
echo "done $id $((end - start))s"
