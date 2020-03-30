'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'eval-source-map',
  entry: [
    path.join(__dirname, 'app/index.jsx')
  ],
  output: {
    path: path.join(__dirname, '/dist/'),
    filename: '[name].js',
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
      'process.env.NODE_ENV': JSON.stringify('development')
    })
  ],
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      options: {
//      "presets": ["react", "es2015", "stage-0", "react-hmre"]
//      "presets": ["es2015", "stage-0", "react"]
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
