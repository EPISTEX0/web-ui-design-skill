#!/usr/bin/env bash
# Usage: build.sh <brief> <arm> <rep>
# arm: none | frontend-design | web-ui-design (0.1, frozen) | web-ui-design-0.2 (frozen)
#      | web-ui-design-0.3 (this repo's skill) | web-ui-design-0.3-silent (same skill, the client declines to answer questions)
#      | web-ui-design-0.3-wired (same skill plus the README's CLAUDE.md line)
# Runs one clean headless Claude Code session on the brief and saves the site and the transcript.
# A brief with fixtures/<brief>/ starts from a copy of that project. A brief with profiles/<brief>.md has a
# simulated client: when the builder ends a turn without delivering, the client answers from the notes and the
# session resumes, at most twice.
set -euo pipefail
brief=$1 arm=$2 rep=$3
here=$(cd "$(dirname "$0")" && pwd)
model=${MODEL:-claude-sonnet-5-5}
client_model=${CLIENT_MODEL:-claude-sonnet-5-5}
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
trap 'rm -f "$cfg/.credentials.json" "$run/.client/.credentials.json"' EXIT
case $arm in
	none) ;;
	frontend-design) mkdir -p "$cfg/skills" && cp -r "$here/arms/frontend-design" "$cfg/skills/" ;;
	web-ui-design) mkdir -p "$cfg/skills" && cp -r "$here/arms/web-ui-design-0.1" "$cfg/skills/web-ui-design" ;;
	web-ui-design-0.2) mkdir -p "$cfg/skills" && cp -r "$here/arms/web-ui-design-0.2" "$cfg/skills/web-ui-design" ;;
	web-ui-design-0.3 | web-ui-design-0.3-silent | web-ui-design-0.3-wired) mkdir -p "$cfg/skills" && cp -r "$here/../skills/web-ui-design" "$cfg/skills/web-ui-design" ;;
	*) echo "unknown arm $arm" >&2; exit 2 ;;
esac
# The -wired arm adds the one line the README asks users to put in their CLAUDE.md.
[[ $arm == *-wired ]] && echo 'Use the web-ui-design skill for any UI work, and read DESIGN.md first when it exists.' > "$cfg/CLAUDE.md"

fixture="$here/fixtures/$brief"
if [[ -d "$fixture" ]]; then
	rsync -a "$fixture/" "$site/"
	git -C "$site" init -q && git -C "$site" add -A "$site" && git -C "$site" -c user.name=dev -c user.email=dev@localhost commit -qm "Current site"
fi

delivered() {
	if [[ -d "$fixture" ]]; then
		[[ -n $(git -C "$site" status --porcelain -- . ':!DESIGN.md' ':!dist') || $(git -C "$site" rev-list --count HEAD) -gt 1 ]]
	else
		[[ -f "$site/index.html" ]]
	fi
}

claude_turn() { # <n> <claude args...>
	local n=$1; shift
	# Each build gets a private /tmp, so parallel builds cannot read each other's screenshots.
	bwrap --dev-bind / / --tmpfs /tmp --bind "$run" "$run" --bind "$root/bin" "$root/bin" --chdir "$site" -- \
		env PATH="$root/bin:$PATH" CLAUDE_CONFIG_DIR="$cfg" timeout 2400 claude -p "$@" \
		--model "$model" --permission-mode bypassPermissions --max-budget-usd 8 \
		--output-format stream-json --verbose > "$out/transcript-$n.jsonl" 2> "$out/stderr-$n.txt" || true
}

client_reply() { # <builder message>
	if [[ $arm == *-silent ]]; then
		echo "Sorry, I don't have time to go through questions. Please go with whatever you think is best and build it."
		return
	fi
	mkdir -p "$run/.client/cwd"
	cp "$HOME/.claude/.credentials.json" "$run/.client/"
	local prompt
	prompt=$(printf '%s\n\n<request>\n%s\n</request>\n\n<notes>\n%s\n</notes>\n\n<developer_message>\n%s\n</developer_message>\n' \
		"You are the client who sent the request below to a developer. Your private notes are below. The developer replied with the message below. Write your reply as the client, in a few short lines. Answer only what the developer asked, using your notes. When asked to choose between options, choose the one closest to your notes. When your notes say nothing about a question, say it is their call. Do not add requests that were not asked about. Output only the reply text." \
		"$(cat "$here/briefs/$brief.md")" "$(cat "$here/profiles/$brief.md")" "$1")
	(cd "$run/.client/cwd" && CLAUDE_CONFIG_DIR="$run/.client" timeout 300 claude -p "$prompt" --model "$client_model" \
		--output-format json 2>/dev/null | jq -r '.result // empty')
}

start=$(date +%s)
claude_turn 1 "$(cat "$here/briefs/$brief.md")"
turns=1
questions='[]'
while ! delivered && [[ -f "$here/profiles/$brief.md" ]] && ((turns < 3)); do
	sid=$(tail -n 1 "$out/transcript-$turns.jsonl" | jq -r '.session_id // empty')
	asked=$(tail -n 1 "$out/transcript-$turns.jsonl" | jq -r '.result // empty')
	[[ -n $sid && -n $asked ]] || break
	answer=$(client_reply "$asked")
	[[ -n $answer ]] || break
	questions=$(jq -c --arg q "$asked" --arg a "$answer" '. + [{asked: $q, answer: $a}]' <<< "$questions")
	turns=$((turns + 1))
	claude_turn $turns --resume "$sid" "$answer"
done
end=$(date +%s)

for f in "$out"/transcript-*.jsonl; do tail -n 1 "$f"; done | jq -s --arg s $((end - start)) --arg arm "$arm" --arg brief "$brief" \
	--arg model "$model" --argjson qa "$questions" --argjson delivered "$(delivered && echo true || echo false)" \
	'{brief: $brief, arm: $arm, model: $model, wall_s: ($s|tonumber), delivered: $delivered, client_rounds: ($qa|length), qa: $qa,
	  is_error: (map(.is_error) | any), num_turns: (map(.num_turns // 0) | add), total_cost_usd: (map(.total_cost_usd // 0) | add)}' \
	> "$out/result.json" || echo '{"error":"no result"}' > "$out/result.json"

if [[ -d "$fixture" ]]; then
	git -C "$site" add -A "$site" && git -C "$site" diff --cached "$(git -C "$site" rev-list --max-parents=0 HEAD)" -- . ':!package-lock.json' > "$out/changes.diff" || true
	# A project with a build step is built here, with its node_modules, so the renderer only needs dist/.
	if [[ -f "$site/package.json" ]] && jq -e '.scripts.build' "$site/package.json" > /dev/null; then
		(cd "$site" && npm run build > "$out/app-build.txt" 2>&1 && echo ok || echo failed) > "$out/app-build-status.txt"
	fi
fi
rm -rf "$out/site" && rsync -a --exclude node_modules --exclude .git "$site/" "$out/site/"
rm -rf "$run"
echo "done $id $((end - start))s turns=$turns"
