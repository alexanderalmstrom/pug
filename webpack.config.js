const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')
const WebpackRev = require('./plugins/webpack-rev.js')

const env = process.env.NODE_ENV
const config = require('./index.js')

const webpackConfig = {
  mode: env,

  entry: [
    './source/main.js'
  ],

  resolve: {
    extensions: ['.scss', '.js', '.css', '.json'],
    modules: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, 'source', 'css'),
      path.resolve(__dirname, 'source', 'js'),
      path.resolve(__dirname, 'source', 'icons')
    ]
  },

  output: {
    path: path.resolve(__dirname, config.buildDir),
    filename: 'js/[name].js',
    publicPath: '/'
  },

  module: {
    rules: [
      {
        test: /\.pug/,
        exclude: /node_modules/,
        use: {
          loader: 'file-loader'
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.svg(\?.*)?$/,
        use: [{
            loader: 'svg-sprite-loader',
            options: {
              extract: true
            }
          },
          'svg-transform-loader',
          'svgo-loader'
        ]
      }
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV)
      },
    }),
    new CleanWebpackPlugin([
      path.resolve(__dirname, config.buildDir)
    ]),
    new CopyWebpackPlugin([{
      from: 'source/html',
      to: ''
    }]),
    new SpriteLoaderPlugin({
      plainSprite: true
    })
  ]
}

// Development
if (env == 'development') {
  webpackConfig.entry.unshift(
    'webpack-hot-middleware/client'
  )

  webpackConfig.module.rules.push(
    {
      test: /\.scss$/,
      use: [
        {
          loader: 'style-loader'
        },
        {
          loader: 'css-loader',
          options: {
            sourceMap: true
          }
        },
        {
          loader: 'sass-loader',
          options: {
            sourceMap: true,
            includePaths: config.paths
          }
        }
      ]
    }
  )

  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new WriteFilePlugin({
      test: /\.svg|.js|.pug$/
    })
  )
}

// Production
if (env == 'production') {
  webpackConfig.output.filename = 'js/[name]-[hash].js',

  webpackConfig.module.rules.push(
    {
      test: /\.scss$/,
      use: ExtractTextPlugin.extract({
        fallback: 'style-loader',
        use: [
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
              options: {
              plugins: function () {
                return [
                  require('autoprefixer')
                ]
              }
            }
          },
          {
            loader: 'sass-loader',
            options: {
              includePaths: config.paths
            }
          }
        ]
      })
    }
  )

  webpackConfig.plugins.push(
    new ExtractTextPlugin('css/[name]-[hash].css'),
    new WebpackRev({
      replaceIn: path.join(config.buildDir , 'layout.pug')
    }, [
      {
        filePath: 'js/main',
        extension: '.js'
      },
      {
        filePath: '/css/main',
        extension: '.css'
      }
    ])
  )
}

module.exports = webpackConfig
