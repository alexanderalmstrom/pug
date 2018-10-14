const path = require('path')
const fs = require('fs')

function WebpackRev (options, assets) {
  this.options = options
  this.assets = assets

  this.defaults = {
    replaceIn: null,
    separator: '-'
  }
}

WebpackRev.prototype.apply = function (compiler) {
  const options = Object.assign(this.defaults, this.options)
  const assets = this.assets

  if (!options.replaceIn)
    throw new Error('Required replaceIn option not specified in WebpackRev plugin')

  compiler.plugin('done', function (stats) {
    const rev = function (path, from, to) {
      const replace = function (match) {
        return to
      }

      const str = fs.readFileSync(path, 'utf8'),
            out = str.replace(new RegExp(from, 'g'), replace)

      fs.writeFileSync(path, out)
    }

    assets.forEach(function (asset) {
      asset.separator = asset.separator ? asset.separator : options.separator
      asset.replaceIn = asset.replaceIn ? asset.replaceIn : options.replaceIn

      rev(
        path.resolve(process.cwd(), asset.replaceIn),
        path.join(asset.filePath + asset.extension),
        path.join(asset.filePath + asset.separator + stats.hash + asset.extension)
      )
    })
  })
}

module.exports = WebpackRev