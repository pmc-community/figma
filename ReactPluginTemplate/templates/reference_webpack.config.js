const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');

const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => ({

  mode: argv.mode === 'production' ? 'production' : 'development',

  // This is necessary because Figma's 'eval' works differently than normal eval
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/ui/ui.tsx', // The entry point for your UI code
    code: './src/ui/code.ts', // The entry point for your plugin code
  },

  optimization: {
    minimize: true,
    minimizer: [
        new TerserPlugin({
          minify: TerserPlugin.uglifyJsMinify,
          // `terserOptions` options will be passed to `uglify-js`
          // Link to options - https://github.com/mishoo/UglifyJS#minify-options
          terserOptions: {},
        }),
    ],
  },
  
  module: {
    rules: [
      // Converts TypeScript code to JavaScript
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      // Enables including CSS by doing "import './file.css'" in your TypeScript code
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      //{ test: /\.(png|jpg|gif|webp|svg|zip)$/, loader: [{ loader: 'url-loader' }] }
      {
        test: /\.svg/,
        type: 'asset/inline',
      },
    ],
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { 
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    fallback: {
      "fs": false,
      "os": false,
      "path": false,
      "crypto": false
    } 
  },

  output: {
    filename: (pathData) => {
      return pathData.chunk.name === 'code'
        ? 'code.js'
        : '[name].[contenthash].js';
    },
    path: path.resolve(__dirname, 'dist'), // Compile into a folder called "dist"
    // Clean the output directory before emit.
    clean: true,
  },

  // Tells Webpack to generate "ui.html" and to inline "ui.ts" into it
  plugins: [
    new Dotenv(), // needed to use dotenv, otherwise .env is not loaded in process.env
    new webpack.DefinePlugin({
      global: {}, // Fix missing symbol error when running in developer VM
    }),

    new HtmlWebpackPlugin({
      inject: 'body',
      template: './src/html/ui.html',
      filename: 'ui.html',
      chunks: ['ui'],
    }),
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/ui.html/],
      scriptMatchPattern: [/.js$/],
    }),

    // the other html from UI must load the React app too
    // each html page from src/html must have the two blocks below
    new HtmlWebpackPlugin({
      inject: 'body',
      template: './src/html/sec.html',
      filename: 'sec.html',
      chunks: ['ui'],
    }),
    new HtmlInlineScriptPlugin({
      htmlMatchPattern: [/sec.html/],
      scriptMatchPattern: [/.js$/],
    }),
  ],
});