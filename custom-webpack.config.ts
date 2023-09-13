import type {Configuration} from "webpack";

module.exports = {
  devtool: false,
  output: {
    library: {
      name: "[name]",
      type: "var"
    },
    libraryTarget: "umd",
  },
  entry: {
    background: {
      import: "src/plugins/background.ts",
      runtime: false,

    },
    content_scripts: {
      import: "src/plugins/content_scripts.ts",
      runtime: false,
    },
    content_scripts_login: {
      import: "src/plugins/content_scripts_login.ts",
      runtime: false,
    }
  },

} as Configuration;
