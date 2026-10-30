const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: path.resolve(__dirname, "src/main.js"),
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "assets/[name].[contenthash:8].js",
    clean: true,
  },
  devtool: "source-map",
  module: {
    rules: [{ test: /\.css$/i, use: ["style-loader", "css-loader"] }],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "index.html"),
      title: "Corn. Revolutionized.",
    }),
  ],
  devServer: {
    host: "127.0.0.1",
    port: 4178,
    hot: true,
    historyApiFallback: true,
    client: { overlay: true },
  },
  performance: { hints: false },
};
