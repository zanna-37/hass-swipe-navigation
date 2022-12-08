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

DIR="${BASH_SOURCE%/*}" # https://stackoverflow.com/a/6659698/9258025
if [[ ! -d "$DIR" ]]; then
  echo "Cannot determine the location of this script."
  echo "BASH_SOURCE cannot be read."
  echo "Please, call this script directly."
  exit 1
fi
ROOT="${DIR}/.."


"${DIR}/install-playwright-dependencies.sh"

HOMEASSISTANT_URL=${HOMEASSISTANT_URL:-"http://localhost:8123"}
SWIPE_NAVIGATION_JS_URL=${SWIPE_NAVIGATION_JS_URL:-"http://localhost:3000/swipe-navigation.js"}

echo
echo "Home Assistant URL is ${HOMEASSISTANT_URL}"

counter=0
echo "Waiting for Home Assistant to be ready..."
while ! curl -s -o /dev/null -w "%{http_code}" ${HOMEASSISTANT_URL} | grep -q 200; do
  sleep 1
  counter=$((counter+1))
  if [ $counter -eq 30 ]; then
    echo "Home Assistant is still not ready, are you sure it is running?"
  fi
  if [ $counter -gt 300 ]; then
    echo "Home Assistant is still not ready, aborting."
    exit 1
  fi
done

echo
echo "swipe-navigation.js URL is ${SWIPE_NAVIGATION_JS_URL}"
counter=0
echo "Waiting for swipe-navigation.js to be ready..."
while ! curl -s -o /dev/null -w "%{http_code}" ${SWIPE_NAVIGATION_JS_URL} | grep -q 200; do
  sleep 1
  counter=$((counter+1))
  if [ $counter -eq 30 ]; then
    echo "swipe-navigation.js is still not ready, are you sure you're serving it?"
  fi
  if [ $counter -gt 300 ]; then
    echo "swipe-navigation.js is still not ready, aborting."
    exit 1
  fi
done


echo
echo "Run playwright tests..."
npx playwright test
