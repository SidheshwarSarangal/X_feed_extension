const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "production",
  entry: {
    background: "./src/background.js",
    content: "./src/content.js",
    main: "./src/main.js",
  },
  output: {
    filename: "[name].js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "main.html",
      template: "./src/main.html",
      chunks: ["main"],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "public/manifest.json", to: "." },
        { from: "public/icon.png", to: "." },
        { from: "src/main.css", to: "." }, // ✅ this line
      ],
    }),
  ],
};
