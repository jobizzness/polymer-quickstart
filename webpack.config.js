'use strict';

const {resolve, join} = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const {GenerateSW} = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const pkg = require('./package.json');

const moduleConf = require('./webpack-module.config');
const nomoduleConf = require('./webpack-nomodule.config');

const ENV = process.argv.find(arg => arg.includes('NODE_ENV=production')) ? 'production' : 'development';
const IS_DEV_SERVER = process.argv.find(arg => arg.includes('webpack-dev-server'));
const OUTPUT_PATH = IS_DEV_SERVER ? resolve('src') : resolve('dist');

const processEnv = {
  NODE_ENV: JSON.stringify(ENV),
  appVersion: JSON.stringify(pkg.version)
};

/**
 * === Copy static files configuration
 */
const copyStatics = {
  copyWebcomponents: [{
    from: resolve('./node_modules/@webcomponents'),
    to: join(OUTPUT_PATH, 'vendor/@webcomponents'),
    flatten: false
  }
 ],
  copyOthers: [{
    from: 'assets/**',
    context: resolve('./src'),
    to: OUTPUT_PATH
  }, {
    from: resolve('./src/index.html'),
    to: OUTPUT_PATH,
    flatten: true
  }, {
    from: resolve('./src/manifest.json'),
    to: OUTPUT_PATH,
    flatten: true
  }]
};

/**
 * Plugin configuration
 */
const sharedPlugins = [new webpack.DefinePlugin({'process.env': processEnv})];
const devPlugins = [new CopyWebpackPlugin(copyStatics.copyWebcomponents)];
const buildPlugins = [
  new CopyWebpackPlugin(
    [].concat(copyStatics.copyWebcomponents, copyStatics.copyOthers)
  ),
  new GenerateSW({
    globDirectory: OUTPUT_PATH,
    globPatterns: ['**/!(*map*)'],
    globIgnores: ['**/sw.js'],
    swDest: join(OUTPUT_PATH, 'sw.js')
  })
];

const plugins = sharedPlugins.concat(IS_DEV_SERVER ? devPlugins : buildPlugins);

const shared = env => {
  const IS_MODULE_BUILD = env.BROWSERS === 'module';

  return {
    mode: ENV,
    entry: './src/index.js',
    output: {
      path: OUTPUT_PATH,
      filename: IS_MODULE_BUILD ? 'module.bundle.js' : 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: ['text-loader']
        },
        {
          test: /\.pcss$/,
          use: ['text-loader', 'postcss-loader']
        }
      ]
    },
    plugins,
    devServer: {
      contentBase: OUTPUT_PATH,
      compress: true,
      overlay: {
        errors: true
      },
      historyApiFallback: true,
      port: 3000,
      host: '0.0.0.0',
      disableHostCheck: true
    }
  };
};

module.exports = (env = {}) => merge(env.BROWSERS === 'module' ? moduleConf() : nomoduleConf(), shared(env));
