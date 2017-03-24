#!/bin/sh
 PROJECTNAME="local"
 ZIPNAME="local.zip"
 currentTime=$(date +%s%3N)


 sudo mkdir /home/local
 cd /home/local
 sudo mkdir $currentTime
 sudo chmod 777 $currentTime
 cd $currentTime
 mongodump
 zip -r $ZIPNAME dump
