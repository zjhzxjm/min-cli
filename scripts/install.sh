#!/usr/bin/env bash

./node_modules/.bin/lerna bootstrap

chmod -R 0777 ./packages/min-cli/lib/bin/*
