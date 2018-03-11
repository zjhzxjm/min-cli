#!/usr/bin/env bash

lerna=./node_modules/.bin/lerna
list=()
packages=(
  '@mindev/min'
  '@mindev/min-async-await'
  '@mindev/min-cli'
  '@mindev/min-compiler-babel'
  '@mindev/min-compiler-less'
  '@mindev/min-compiler-postcss'
  '@mindev/min-compiler-pug'
  '@mindev/min-compiler-sass'
  '@mindev/min-compiler-stylus'
  '@mindev/min-compiler-typescript'
  '@mindev/min-eslint'
  '@mindev/min-plugin-autoprefixer'
  '@mindev/min-plugin-filemin'
  '@mindev/min-plugin-imagemin'
  '@mindev/min-plugin-uglifyjs'
  '@mindev/min-plugin-unit2rpx'
)
examples=(
  'min-example-async-await'
  'min-example-compilers'
  'min-example-mixins'
)

if [ ! "$1" ] ;then  # npm run watch
  list=(${packages[*]} ${examples[*]})
elif [ "$1" = "p" ] ;then # npm run watch p
  list=(${packages[*]})
elif [ "$1" = "e" ] ;then # npm run watch e
  list=(${examples[*]})
fi

## Get length
# echo 'list.length = '${#list[@]}

for item in ${list[*]};
do
{
  echo '>>>>>>>>>>' + $item
  lerna exec npm run watch --scope $item
} &
done

wait
