#!/usr/bin/env bash
# Usage: REPS=3 JOBS=4 BRIEFS="tandem kestrel" ARMS="none web-ui-design-0.3" ./run-all.sh
# Builds every brief x arm x rep, interleaved so no arm runs on a quieter machine than another.
# Builds that already have a result are skipped, so adding an arm builds only that arm.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
mkdir -p "${WORK_ROOT:-/tmp/client-sites}"
for rep in $(seq 1 "${REPS:-3}"); do
	for brief in ${BRIEFS:-slow-clay roastline backoff-kit}; do
		for arm in ${ARMS:-none frontend-design web-ui-design web-ui-design-0.2}; do
			echo "$brief $arm $rep"
		done
	done
done | xargs -P "${JOBS:-4}" -L 1 "$here/build.sh"
