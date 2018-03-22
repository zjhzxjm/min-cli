#!/usr/bin/env bash

# bootstrap
./node_modules/.bin/lerna bootstrap

chmod -R 0777 ./packages/min-cli/lib/bin/*

# install @mindev/min-compiler-postcss
lerna exec --scope min-example-compilers -- npm install @mindev/min-lint-postcss

# install @mindev/min-compiler-eslint
examples=(
  'min-example-async-await'
  'min-example-compilers'
  'min-example-mixins'
  'min-example-plugins'
)

for example in ${examples[*]};
do
{
  echo '>>>>>>>>>>' + $example
  lerna exec --scope $example -- npm install @mindev/min-lint-eslint
} &
done

wait
