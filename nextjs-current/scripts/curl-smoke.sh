#!/usr/bin/env bash
set -euo pipefail
BASE=${1:-http://localhost:3000}

for p in "/" "/services" "/move-in-out" "/deep-clean" "/post-construction"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$p")
  echo "$p -> $code"
  if [ "$code" != "200" ]; then echo "FAIL $p" && exit 1; fi
done

echo "OK"


