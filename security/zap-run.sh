#!/usr/bin/env bash
set -euo pipefail

: "${ZAP_API_URL:?Set ZAP_API_URL, for example http://host.docker.internal:8080}"
: "${ZAP_WEBAPP_URL:?Set ZAP_WEBAPP_URL, for example http://host.docker.internal:3000}"
ZAP_BOOTSTRAP_API_URL="${ZAP_BOOTSTRAP_API_URL:-http://127.0.0.1:8080}"

mkdir -p zap-reports
ZAP_API_URL="$ZAP_BOOTSTRAP_API_URL" node security/zap-bootstrap.js > /tmp/zap-identities.json

docker_options=(--user zap --rm -v "$PWD:/zap/wrk:rw")
if [[ -n "${ZAP_DOCKER_NETWORK:-}" ]]; then
  docker_options+=(--network "$ZAP_DOCKER_NETWORK")
fi

pnpm -F api db:seed

run_scan() {
  local email="$1"
  local report_file="$2"
  ZAP_EMAIL="$email" ZAP_PASSWORD=Password123! ZAP_POLL_ID="$(jq -r .pollId /tmp/zap-identities.json)" ZAP_REPORT_FILE="$report_file" docker run "${docker_options[@]}" -e ZAP_API_URL -e ZAP_WEBAPP_URL -e ZAP_EMAIL -e ZAP_PASSWORD -e ZAP_POLL_ID -e ZAP_REPORT_FILE ghcr.io/zaproxy/zaproxy:stable zap.sh -cmd -autorun /zap/wrk/security/zap.yaml
}

if run_scan lex.luthor@gmail.com lex.sarif; then
  lex_status=0
else
  lex_status=$?
fi

ZAP_API_URL="$ZAP_BOOTSTRAP_API_URL" node security/zap-bootstrap.js vote "$(jq -r .pollId /tmp/zap-identities.json)" "$(jq -r .optionId /tmp/zap-identities.json)"

if run_scan clark.kent@gmail.com clark.sarif; then
  clark_status=0
else
  clark_status=$?
fi

jq -s '{version: "2.1.0", "$schema": "https://json.schemastore.org/sarif-2.1.0.json", runs: map(.runs[]) }' zap-reports/lex.sarif zap-reports/clark.sarif > zap-reports/combined.sarif

test "$lex_status" -eq 0 && test "$clark_status" -eq 0
