#!/usr/bin/env bash

# bootstrap
./node_modules/.bin/lerna bootstrap

chmod -R 0777 ./packages/min-cli/lib/bin/*

# install @mindev/min-compiler-postcss
lerna exec --scope min-example-compiler -- npm install @mindev/min-compiler-postcss

# install @mindev/min-lint-eslint
lerna exec --scope min-example-lint -- npm install @mindev/min-lint-eslint
