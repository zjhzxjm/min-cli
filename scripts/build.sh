#!/bin/bash

lerna=./node_modules/.bin/lerna
packages=()
type='build'

base=(
  '@mindev/min-cli'
  '@mindev/min-core'
)

libs=(
  '@minlib/min'
  '@minlib/min-async-await'
  '@minlib/minx'
  '@minlib/min-wxapi'
)

lints=(
  '@mindev/min-lint-eslint'
)

compilers=(
  '@mindev/min-compiler-babel'
  '@mindev/min-compiler-less'
  '@mindev/min-compiler-postcss'
  '@mindev/min-compiler-pug'
  '@mindev/min-compiler-sass'
  '@mindev/min-compiler-stylus'
  '@mindev/min-compiler-typescript'
)

plugins=(
  '@mindev/min-plugin-autoprefixer'
  '@mindev/min-plugin-define'
  '@mindev/min-plugin-filemin'
  '@mindev/min-plugin-filesync'
  '@mindev/min-plugin-imagemin'
  '@mindev/min-plugin-uglifyjs'
  '@mindev/min-plugin-unit2rpx'
)

examples=(
  'min-example-async-await'
  'min-example-compiler'
  'min-example-lint'
  'min-example-mixin'
  'min-example-plugin'
)

if [ ! "$1" ] ;then  # npm run build
  packages=(${base[*]} ${libs[*]} ${lints[*]} ${compilers[*]} ${plugins[*]} ${examples[*]})
elif [ "$1" = "b" ] ;then # npm run build b
  packages=(${base[*]})
elif [ "$1" = "l" ] ;then # npm run build l
  packages=(${base[*]} ${libs[*]} ${lints[*]})
elif [ "$1" = "c" ] ;then # npm run build c
  packages=(${base[*]} ${compilers[*]})
elif [ "$1" = "p" ] ;then # npm run build p
  packages=(${base[*]} ${plugins[*]})
elif [ "$1" = "e" ] ;then # npm run build e
  packages=(${base[*]} ${examples[*]})
fi

if [ "$2" = "w" ] ;then
  type='watch'
fi

## Get length
# echo 'packages.length = '${#packages[@]}

for package in ${packages[*]};
do
{
  echo '>>>>>>>>>>' + $package
  lerna exec --scope $package -- npm run $type
} &
done

wait
