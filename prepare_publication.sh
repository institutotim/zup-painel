#!/usr/bin/env bash
rm build_and_test.sh
sed -i '' -e '1,4d;27,29d' Dockerfile
