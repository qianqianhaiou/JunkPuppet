#!/bin/bash

# 打包puppteer插件
cd puppteer-plugin
npm run build

cd ..
# cp -r ./puppteer-plugin/puppteer-plugin/ ./public

# 打包前端
cd frontend
npm run build

cd ..

rm -rf ./dist
cp -r ./frontend/dist/ ./