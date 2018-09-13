const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ManifestPlugin = require("webpack-manifest-plugin");
const SWPrecacheWebpackPlugin = require("sw-precache-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const UglifyJSPlugin = require("uglifyjs-webpack-plugin");
const CircularDependencyPlugin = require("circular-dependency-plugin");

module.exports = {
  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js",
    publicPath: "./",
  },

  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader?cacheDirectory",
        query: {
          presets: ["env"],
        },
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "style-loader",
          },
          {
            loader: "css-loader",
          },
          {
            loader: "sass-loader",
          },
        ],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: ["url-loader?limit=10000", "img-loader"],
      },
    ],
  },

  watch: true,

  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      favicon: "./assets/images/favicon.ico",
    }),

    new ManifestPlugin({
      fileName: "asset-manifest.json",
    }),

    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: "service-worker.js",
      logger(message) {
        if (message.indexOf("Total precache size is") === 0) {
          return;
        }
        console.log(message);
      },
      minify: true,
      navigateFallback: "/index.html",
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),

    new CopyWebpackPlugin([
      {
        from: "src/pwa",
      },
    ]),

    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // add errors to webpack instead of warnings
      failOnError: true,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
  ],

  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        cache: true,
        parallel: true,
      }),
    ],
  },
};
