import type { Configuration } from 'webpack';
const config = require('./custom-webpack.config');

module.exports = {
  ...config,
  mode: 'development',
  plugins: [

  ]
} as Configuration;
