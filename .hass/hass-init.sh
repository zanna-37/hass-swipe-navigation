#!/command/with-contenv bash
# with-contenv is a s6-overlay wrapper script that ensures the container environment is available

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
  echo "[+] Username: ${username}"
  echo "[+] Password: ${password}"
  hass --script auth -c /config add "${username}" "${password}"
}

function bypass_onboarding() {
  local onboarding_file="/config/.storage/onboarding"

  echo
  echo "[.] Bypassing Home Assistant onboarding..."

  if [ -f "${onboarding_file}" ]; then
    echo "[.] Onboarding already completed, skipping..."
    return 0
  fi

  mkdir -p /config/.storage

  cat > "${onboarding_file}" << EOF
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

  echo "[+] Onboarding bypassed successfully!"
}

function install_hacs() {
  local hacs_dir="/config/custom_components/hacs"

  echo
  echo "[.] Installing HACS..."

  if [ -d "${hacs_dir}" ]; then
    echo "[.] HACS already installed, skipping..."
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

function create_lovelace_resources() {
  local resources_file="/config/.storage/lovelace_resources"
  local swipe_nav_url="${SWIPE_NAVIGATION_JS_URL:-http://localhost:3000/swipe-navigation.js}"

  echo
  echo "[.] Creating Lovelace resources..."

  if [ -f "${resources_file}" ]; then
    echo "[.] Resources file already exists, skipping..."
    return 0
  fi

  mkdir -p /config/.storage

  cat > "${resources_file}" << EOF
{
  "version": 1,
  "minor_version": 1,
  "key": "lovelace_resources",
  "data": {
    "items": [
      {
        "id": "swipe_navigation",
        "type": "module",
        "url": "${swipe_nav_url}"
      },
      {
        "id": "touchpoints_visualizer",
        "type": "module",
        "url": "/local/touchpoints-visualizer.js"
      }
    ]
  }
}
EOF

  echo "[+] Lovelace resources created successfully!"
}

function create_storage_dashboard() {
  local dashboard_file="/config/.storage/lovelace.aa_tests"
  local dashboards_registry="/config/.storage/lovelace_dashboards"

  echo
  echo "[.] Creating storage mode dashboard 'aa_tests'..."

  mkdir -p /config/.storage

  # Create the dashboard config
  if [ -f "${dashboard_file}" ]; then
    echo "[.] Dashboard 'aa_tests' already exists, skipping dashboard creation..."
  else
    cat > "${dashboard_file}" << 'EOF'
{
  "version": 1,
  "minor_version": 1,
  "key": "lovelace.aa_tests",
  "data": {
    "config": {
      "swipe_nav": {
        "enable_mouse_swipe": true,
        "animate": "swipe",
        "logger_level": "verbose"
      },
      "views": [
        {
          "title": "Home",
          "path": "home",
          "icon": "mdi:home-assistant",
          "cards": [
            {
              "type": "markdown",
              "title": "Test instance",
              "content": "This is a test instance.\n\nAll the dashboards are meant to test different edge cases of the swipe navigation.\n\n⚠️ **Ensure you are serving the .js file! (See the `/scripts` folder)**"
            }
          ]
        },
        {
          "title": "Test View 1",
          "type": "sections",
          "sections": [
            {
              "type": "grid",
              "cards": [
                {
                  "type": "markdown",
                  "content": "# Test View 1\n\nThis is a storage mode test dashboard using sections."
                }
              ]
            }
          ]
        },
        {
          "title": "Test View 2",
          "type": "sections",
          "sections": [
            {
              "type": "grid",
              "cards": [
                {
                  "type": "markdown",
                  "content": "# Test View 2\n\nThis is a storage mode test dashboard using sections."
                }
              ]
            }
          ]
        }
      ]
    }
  }
}
EOF
    echo "[+] Dashboard 'aa_tests' created!"
  fi

  # Register the dashboard
  if [ -f "${dashboards_registry}" ]; then
    echo "[.] Dashboard registry already exists, skipping registry creation..."
  else
    cat > "${dashboards_registry}" << 'EOF'
{
  "version": 1,
  "minor_version": 1,
  "key": "lovelace_dashboards",
  "data": {
    "items": [
      {
        "id": "aa_tests",
        "mode": "storage",
        "icon": "mdi:test-tube",
        "require_admin": false,
        "show_in_sidebar": true,
        "title": "AA Tests",
        "url_path": "aa_tests"
      }
    ]
  }
}
EOF
    echo "[+] Dashboard registry created!"
  fi
}


function main() {
  print_home_assistant_version
  ensure_hass_config
  create_hass_user
  bypass_onboarding
  install_hacs
  create_lovelace_resources
  create_storage_dashboard

  echo
  echo "----------"
  echo
}

main
