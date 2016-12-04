#!/usr/bin/env bash
# run this script before you setup the irext web console
echo "running script of npm install needed by irext..."

echo "npm install express"
npm install express

echo "npm install body-parser"
npm install body-parser

echo "npm install method-override"
npm install method-override

echo "npm install platform"
npm install platform

echo "npm install ua-parser-js"
npm install ua-parser-js

echo "npm install log4js"
npm install log4js

echo "npm install formidable"
npm install formidable

echo "npm install mysql"
npm install mysql

echo "npm install redis"
npm install redis

echo "npm install orm"
npm install orm

echo "npm install python-shell"
npm install python-shell

echo "npm install request"
npm install request

echo "npm install form-data"
npm install form-data

echo "npm install async"
npm install async

echo "npm install nodemailer"
npm install nodemailer@0.7

echo "npm install done"

echo "create logging directory"
mkdir -p logs
mkdir -p logs/production
mkdir -p logs/dev
mkdir -p logs/user_debug

