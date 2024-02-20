const path = require('path')
const { templatePath } = require('../options')

module.exports = (options) => {
  if (!options.run) {
    return ''
  }
  return `
    module.export = {
      chainWebpack: (config) => {
        config
          .plugin('html')
          .tap(args => [...args, { 
            template: '${path.join(templatePath, 'public/index.html')}'
          }])
      }
    }
  `
}
