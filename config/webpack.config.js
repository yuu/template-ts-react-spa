const path = require("path");
const HTMLPlugin = require("html-webpack-plugin");
const WorkerPlugin = require("worker-plugin");

const PROJ_DIR = __dirname + "/../";
const SRC_DIR = PROJ_DIR + "/src/";

module.exports = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts", ".tsx", ".json", ".mjs", ".wasm"],
    alias: {
      "@project": path.resolve(PROJ_DIR),
      "@root": path.resolve(SRC_DIR),
    },
  },
  plugins: [
    new HTMLPlugin({
      template: path.join(__dirname + "/../", "src/index.html"),
    }),
    new WorkerPlugin()
  ],
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {},
  }
};
