#!/usr/bin/env bash

set -eEuo pipefail
# set -e          Exit immediately if any command has a non-zero exit status.
# set -E          The ERR trap is inherited by shell functions.
# set -u          Every non-declared variable will rise an error.
# set -o pipefail If any command in a pipeline fails, that return code will be used as the return
#                 code of the whole pipeline. By default, the pipeline's return code is that of the
#                 last command.
#
# Use `help set` in a bash shell to get information.


function ensure_hass_config() {
  hass --script ensure_config -c /config
}

function create_hass_user() {
  local username=${HASS_USERNAME:-user}
  local password=${HASS_PASSWORD:-pass}
  echo
  echo "[.] Creating Home Assistant user..."
  hass --script auth -c /config add "${username}" "${password}"
  echo "[+] Username: ${username}"
  echo "[+] Password: ${password}"
}

function bypass_onboarding() {
  cat > /config/.storage/onboarding << EOF
{
  "data": {
    "done": [
      "user",
      "core_config",
      "integration"
    ]
  },
  "key": "onboarding",
  "version": 3
}
EOF
}


function main() {
  ensure_hass_config
  create_hass_user
  bypass_onboarding
}

main
