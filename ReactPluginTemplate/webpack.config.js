const HtmlInlineScriptPlugin = require('html-inline-script-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const path = require('path');

const webpack = require('webpack');

const Dotenv = require('dotenv-webpack');

module.exports = (env, argv) => ({

  externals: {
    jquery: 'jQuery',
    util: 'util',
    assert: 'assert',
    'recursive-diff':'recursive-diff',
  },

  mode: argv.mode === 'production' ? 'production' : 'development',
  // This is necessary because Figma's 'eval' works differently than normal eval
  //devtool: argv.mode === 'production' ? false : 'inline-source-map',
  
  // switch to source-map to reduce the output size (mostly because of react-dom)
  devtool: argv.mode === 'production' ? false : 'source-map',

  entry: {
    ui: './src/ui/ui.tsx', // The entry point for your UI code
    code: './src/ui/code.ts', // The entry point for your plugin code
  },

  optimization: {
    /*
    splitChunks: {
      // include all types of chunks
      chunks: 'all',
      maxSize: 20000,
      minSize: 10000
    },
    */
    minimize: true,
    minimizer: [
        new TerserPlugin({
          extractComments: false,
          terserOptions: {
            format: {
              comments: false,
            },
          },
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

      // Allows you to use "<%= require('./file.svg') %>" in your HTML code to get a data URI
      //{ test: /\.(png|jpg|gif|webp|svg|zip)$/, loader: [{ loader: 'url-loader' }] }
      {
        test: /\.svg/,
        type: 'asset/inline',
      },

      // Enables including CSS by doing "import './file.css'" in your TypeScript code

      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
     

    ],
  },

  // Webpack tries these extensions for you if you omit the extension like "import './file'"
  resolve: { 
    extensions: ['.tsx', '.ts', '.jsx', '.js','.css','.scss'],
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

    
/* Start plugin html files */

/*sec.html*/
new HtmlWebpackPlugin({
	inject: 'body',
	template: './src/html/build/sec.html',
	filename: 'sec.html',
	chunks: ['ui']
}),


new HtmlInlineScriptPlugin({
	htmlMatchPattern: [/sec.html/],
	scriptMatchPattern: [/.js$/]
}),

/*ui.html*/
new HtmlWebpackPlugin({
	inject: 'body',
	template: './src/html/build/ui.html',
	filename: 'ui.html',
	chunks: ['ui']
}),


new HtmlInlineScriptPlugin({
	htmlMatchPattern: [/ui.html/],
	scriptMatchPattern: [/.js$/]
}),
/* End plugin html files */

    
  ],

});