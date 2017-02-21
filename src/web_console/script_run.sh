#!/usr/bin/env bash
filepath=$(cd "$(dirname "$0")"; pwd)
cd $filepath
NODE_ENV=${1} nohup forever irext_console.js &
