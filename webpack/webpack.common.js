const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const { loadWebConfig } = require('../scripts/web-config');

module.exports = {
  entry: ['./src/ts/core/game.ts'],
  output: {
    path: path.resolve(__dirname, '../dist'),
    filename: '[name].bundle.js',
    chunkFilename: '[name].chunk.js',
    // Asset paths must remain relative for GitHub Pages /<repository>/ hosting.
    publicPath: 'auto',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$|\.jsx?$/,
        include: path.join(__dirname, '../src'),
        loader: 'ts-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          filename: '[name].bundle.js',
        },
      },
    },
  },
  plugins: [
    new webpack.DefinePlugin({ __PIZZICATO_WEB_CONFIG__: JSON.stringify(loadWebConfig()) }),
    new HtmlWebpackPlugin({
      gameName: 'My Phaser Game',
      template: 'src/index.html',
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/assets', to: 'assets' },
        { from: 'src/data', to: 'data' },
        { from: 'src/levels', to: 'levels' },
        { from: 'src/models', to: 'models' },
        { from: 'src/css', to: 'css' },
        { from: 'pwa', to: '' },
        {
          from: './node_modules/@mediapipe/tasks-vision/wasm/',
          to: 'models/wasm',
        },
        { from: 'src/assets/icon.ico', to: '' },
      ],
    }),
  ],
};
