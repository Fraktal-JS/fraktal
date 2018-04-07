command="npm run build"

if [ -z "$TRAVIS_TAG" ]; then
  echo -e "\e[36m\e[1m—————> BUILD: Building for branch ${TRAVIS_BRANCH}\n"
  command="$command -- -p never";
else
  echo -e "\e[36m\e[1m—————> BUILD: Publishing for tag ${TRAVIS_TAG}\n"
  command="$command -- -p always";
fi

if [ "$TRAVIS_OS_NAME" == "linux" ]; then
  docker run --rm \
    --env-file <(env | grep -iE 'DEBUG|NODE_|ELECTRON_|YARN_|NPM_|CI|CIRCLE|TRAVIS|APPVEYOR_|CSC_|_TOKEN|_KEY|AWS_|STRIP|BUILD_') \
    -v ${PWD}:/project \
    -v ~/.cache/electron:/root/.cache/electron \
    -v ~/.cache/electron-builder:/root/.cache/electron-builder \
    electronuserland/builder:wine \
    /bin/bash -c "$command --linux --win"
else
  $command
fi
