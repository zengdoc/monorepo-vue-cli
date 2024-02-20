const path = require('path')
const fs = require('fs-extra')
const { loadModule } = require('@vue/cli-shared-utils')
const mergeConfig = require('./util/mergeConfig')
const { deepReaddirSync } = require('./util/file')
const { templateConfigPath } = require('./options')
const { readFile } = require('./util/file')

module.exports = (options) => {
  const userConfig = loadUserConfig()
  const configPaths = deepReaddirSync(path.resolve(__dirname, './config'))
  return configPaths.reduce((acc, configPath) => {
    const configCode = loadModule(
      configPath,
      path.resolve(__dirname, '.')
    )(options)
    if (configCode) {
      acc = mergeConfig(acc, configCode)
    }
    return acc
  }, userConfig)
}

function loadUserConfig() {
  if (!fs.existsSync(templateConfigPath)) {
    return ''
  }
  return readFile(templateConfigPath)
}
