#!/bin/bash

# 打包puppteer插件
cd puppteer-plugin
npm run build

cd ..
cp -r ./puppteer-plugin/puppteer-plugin/ ./public