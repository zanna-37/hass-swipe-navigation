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


SCRIPT_NAME="build.sh";


# ---- help() -----

function printHelp() {
  echo "Usage:"
  echo "    ${SCRIPT_NAME} [ARGS]"
  echo
  echo "Example:"
  echo "    ${SCRIPT_NAME} --serve"
  echo
  echo "Args:"
  echo "    -s, --serve"
  echo "        Serve the files via a web server and watch for code changes"
  echo
  echo "    --help"
  echo "        Print this help page and exit"
  echo
  echo "    --"
  echo "        This option can be used to separate command-line options from the list of files"
  echo "        (useful when filenames might be mistaken for command-line options)"
}

# ---- Flags -----

FLAG_SERVE=0

# ---- Get arguments -----

while [[ "$#" -gt 0 && "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
  -s | --serve )
    FLAG_SERVE=1
    ;;
  --help )
    printHelp
    exit 0
    ;;
  *)
    echo "[-] Invalid Argument ${1}"
    printHelp
    exit 1
    ;;
esac; shift; done
if [[ "$#" -gt 0 && "$1" == '--' ]]; then shift; fi

if [ "$#" -gt 0 ]; then
  echo "[!] Too many parameters! Ignoring:"
  for par in "$@"; do
    echo "[!]   - ${par}"
  done
fi


# ---- main() -----

"${DIR}/install-node-dependencies.sh"

echo
echo "Checking files..."
npx eslint "${ROOT}/src/swipe-navigation.ts"

if [ "${FLAG_SERVE}" -eq 0 ]; then
  echo
  echo "Building..."
  npx rollup --config
else
  echo
  echo "Building and serving..."
  npx rollup --config --watch
fi
