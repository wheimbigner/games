'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: [
    path.join(__dirname, 'app/index.jsx')
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name]-[hash].min.js',
    publicPath: '/'
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'app/index.tpl.html',
      inject: 'body',
      filename: 'index.html'
    }),
    new StatsPlugin('webpack.stats.json', {
      source: true,
      modules: true
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
        "presets": [
          [ "@babel/preset-env",
            {
              "targets": {
                "chrome": "80",
                "firefox": "70"
              }
            }
          ], "@babel/preset-react"
        ]
      }
    }, {
      test: /\.json?$/,
      loader: 'json'
    }, {
      test: /\.css$/,
      use: ['style-loader', 'css-loader']
    }]
  }
};
