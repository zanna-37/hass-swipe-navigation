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


function print_home_assistant_version() {
  echo
  echo "[.] Home Assistant version:"
  hass --version
}

function ensure_hass_config() {
  echo
  echo "[.] Creating Home Assistant config if not present..."
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
  echo
  echo "[.] Bypassing Home Assistant onboarding..."
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

function install_hacs() {
  local hacs_dir="/config/custom_components/hacs"

  echo
  echo "[.] Installing HACS..."

  if [ -d "${hacs_dir}" ]; then
    echo "[+] HACS already installed, skipping..."
    return 0
  fi

  echo "[.] Downloading latest HACS release..."
  mkdir -p /config/custom_components
  cd /config/custom_components

  # Download latest HACS release
  wget -q -O hacs.zip https://github.com/hacs/integration/releases/latest/download/hacs.zip

  echo "[.] Extracting HACS..."
  unzip -q hacs.zip -d hacs

  echo "[.] Cleaning up..."
  rm hacs.zip

  echo "[+] HACS installed successfully!"
}


function main() {
  print_home_assistant_version
  ensure_hass_config
  create_hass_user
  bypass_onboarding
  install_hacs
}

main
