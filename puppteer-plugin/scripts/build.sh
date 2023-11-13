#!/bin/bash

echo '开始清理输出文件夹'
rm -rf ./dist

echo '开始打包puppteer脚本'
npx webpack
echo 'puppteer脚本打包完成'

cd setter-extension
echo '开始打包setter插件'
npm run build
echo 'setter插件打包完成'

echo '复制setter插件至puppteer脚本文件夹'
cd ..

cp -r ./setter-extension/setter-dist/ ./puppteer-plugin