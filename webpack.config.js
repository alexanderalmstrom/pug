const path = require('path')
const fs = require('fs')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin')

const config = require('./index.js')
const env = process.env.NODE_ENV

const webpackConfig = {
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
    path: path.resolve(__dirname, 'build'),
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
      path.resolve(__dirname, 'build')
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
  webpackConfig.mode = 'development'

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
  webpackConfig.mode = 'production'

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
    function () {
      this.plugin('done', function (stats) {
        let replaceInFile = function (filePath, toReplace, replacement) {
          let replacer = function (match) {
            console.log('Replacing in %s: %s => %s', filePath, match, replacement)
            return replacement
          }

          let str = fs.readFileSync(filePath, 'utf8')
          let out = str.replace(new RegExp(toReplace, 'g'), replacer)

          fs.writeFileSync(filePath, out)
        }

        let hash = stats.hash

        replaceInFile(
          path.resolve(__dirname, 'build', 'layout.pug'),
          '/js/main.js',
          '/js/main-' + hash + '.js'
        )

        replaceInFile(
          path.resolve(__dirname, 'build', 'layout.pug'),
          '/css/main.css',
          '/css/main-' + hash + '.css'
        )
      })
    }
  )
}

module.exports = webpackConfig
