#!/bin/bash
# usage: gate.sh <repo-dir-name> <tag>   -> runs lint, tsc, vitest, build in order; status in logs/<tag>-gate-status.log
set +e
L=/c/Users/ftass/toolkit-online/reports/omni-07nov-2026/A/logs
REPO=/c/Users/ftass/$1
T=$2
cd "$REPO" || exit 1
S=$L/$T-gate-status.log
rm -f "$S"
echo "cwd=$(pwd) branch=$(git branch --show-current)" > "$S"
npm run lint > $L/$T-gate-lint.log 2>&1; echo "lint exit $?" >> "$S"
npx tsc --noEmit > $L/$T-gate-tsc.log 2>&1; echo "tsc exit $?" >> "$S"
npx vitest run > $L/$T-gate-test.log 2>&1; echo "vitest exit $?" >> "$S"
npm run build > $L/$T-gate-build.log 2>&1; echo "build exit $?" >> "$S"
echo GATE-DONE >> "$S"
