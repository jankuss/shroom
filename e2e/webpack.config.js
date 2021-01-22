const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: "./src/index.tsx",
    output: {
      filename: "[name].[fullhash].js",
      path: path.resolve(__dirname, "dist/webpack"),
    },
    devtool: "source-map",
    resolve: {
      extensions: [".tsx", ".ts", ".js", ".mjs"],
      fallback: { "buffer": false, "timers": false }
    },
    optimization: { splitChunks: { chunks: 'all' }, runtimeChunk: true, minimizer: [] },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          use: [
            {
              loader: "babel-loader",
              options: {
                /* Use `babel.config.js` in root folder */
                rootMode: "upward",
              },
            },
          ],
          exclude: /node_modules/,
        },
        {
          test: /\.(png|svg|bmp)$/,
          loader: "file-loader",
        },
      ],
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin({}),
      new HtmlWebpackPlugin({
        template: "./src/index.ejs",
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.EnvironmentPlugin({
        NODE_ENV: "development",
      }),
    ],
    devServer: {
      contentBase: [path.join(__dirname, 'public')]
    }
  };