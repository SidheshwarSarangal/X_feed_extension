const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    background: "./src/background.js",
    content: "./src/content.js",
    main: "./src/main.js", // optional if main.js is used in HTML
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "main.html", // emits to dist/main.html
      template: "./src/main.html",
      chunks: ["main"], // optional, depends if main.js is included
    }),
    new HtmlWebpackPlugin({
      filename: "allow-access.html",
      template: "./src/allow-access.html",
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      filename: "search-feed.html",
      template: "./src/search-feed.html",
      chunks: [],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/manifest.json", to: "." },
        { from: "public/icon.png", to: "." }, // ⚠️ fix your earlier error
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};
