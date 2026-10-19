#!/usr/bin/env bash
# Usage: REPS=3 JOBS=4 ./run-all.sh
# Builds every brief x arm x rep, interleaved so no arm runs on a quieter machine than another.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
mkdir -p "${WORK_ROOT:-/tmp/client-sites}"
for rep in $(seq 1 "${REPS:-3}"); do
	for brief in slow-clay roastline backoff-kit; do
		for arm in none frontend-design web-ui-design; do
			echo "$brief $arm $rep"
		done
	done
done | xargs -P "${JOBS:-4}" -L 1 "$here/build.sh"
