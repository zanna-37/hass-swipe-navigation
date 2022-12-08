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


"${DIR}/install-node-dependencies.sh"

echo
echo "Install playwright tools..."
npx playwright install --with-deps
