const path = require('path');

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    setting: './src/core/setting.ts',
    runner: './src/core/runner.ts',
    execute: './src/core/execute.ts',
  },
  output: {
    path: path.resolve(__dirname, 'puppteer-plugin'),
    filename: '[name].js',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    unknownContextCritical: false,
    exprContextCritical: false,
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
};
