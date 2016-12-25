#!/usr/bin/env bash
# run this script before you setup the irext web console
echo "running script of bower install needed by irext..."

echo "npm install bower -g"
sudo npm install bower -g

echo "bower install toastr"
bower install toastr --allow-root

echo "bower install bootstrap-table"
bower install bootstrap-table --allow-root

echo "bower install bootstrap-multiselect"
bower install bootstrap-multiselect --allow-root

echo "bower install select2"
bower install select2 --allow-root

echo "bower install bootstrap-spinner"
bower install bootstrap-spinner --allow-root

echo "bower install highcharts"
bower install highcharts

echo "bower install done"
