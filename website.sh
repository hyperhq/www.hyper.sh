#!/bin/sh

npm install
npm run build
cd dist
http-server -p 8000
