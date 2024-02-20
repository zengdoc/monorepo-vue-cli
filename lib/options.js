const path = require('path')
const isPlainObject = require('lodash/isPlainObject')
const isNull = require('lodash/isNull')

exports.ignoreFiles = [
  '.DS_Store',
  '.idea',
  '.vscode',
  '.git',
  'project1',
  'project2',
  'node_modules',
  'dist'
]

exports.templateName = 'template'
exports.templatePath = path.resolve(__dirname, '../', exports.templateName)

exports.configFileName = 'vue.config.js'
exports.templateConfigPath = path.join(
  exports.templatePath,
  `/${exports.configFileName}`
)

exports.runConfigPath = path.join(
  exports.templatePath,
  `node_modules/${exports.configFileName}`
)

exports.huskyConfigName = '.husky'
exports.huskyConfigPath = path.resolve(
  __dirname,
  '../',
  exports.huskyConfigName
)

exports.isDiffOptions = (originOptions, options) => {
  if (!isPlainObject(options)) {
    return false
  }
  if (!isPlainObject(originOptions)) {
    return true
  }
  for (let key in options) {
    if (Object.hasOwnProperty.call(options, key)) {
      if (!isNull(options[key]) && options[key] !== originOptions[key]) {
        return true
      }
    }
  }
}

exports.mergeOptions = (originOptions, options) => {
  if (!isPlainObject(originOptions)) {
    originOptions = {}
  }
  if (!isPlainObject(options)) {
    options = {}
  }
  const mergeOptionsResult = Object.assign({}, originOptions)
  for (let key in options) {
    if (Object.hasOwnProperty.call(options, key)) {
      if (!isNull(options[key])) {
        mergeOptionsResult[key] = options[key]
      }
    }
  }
  return mergeOptionsResult
}
