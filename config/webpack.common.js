const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const package = require("../package.json");

module.exports = {
  entry: ["src/main.js"],
  output: {
    path: path.resolve(__dirname, "../dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: path.join(__dirname, ".."),
        loader: "ts-loader",
      },
      {
        test: /\.m?js$/,
        include: path.join(__dirname, ".."),
        use: {
          loader: "babel-loader",
          options: { presets: ["@babel/preset-env"] },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          filename: "[name].bundle.js",
        },
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      gameName: package.game.name,
      template: "src/index.html",
      inject: false,
    }),
    new CopyWebpackPlugin([
      { from: "public/assets", to: "assets" },
      { from: "config/pwa", to: "" },
      { from: "public/assets/icon.ico", to: "" },
      { from: "src/game/**/*", to: "" },
    ]),
    new InjectManifest({
      swSrc: path.resolve(__dirname, "pwa/sw.js"),
    }),
  ],
};
