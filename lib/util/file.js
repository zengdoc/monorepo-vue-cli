const fs = require('fs-extra')
const isArray = require("lodash/isArray")
const isPlainObject = require("lodash/isPlainObject")
const isFunction = require("lodash/isFunction")

function copyFile(copiedPath, resultPath, options = {}) {
  return fs.copy(copiedPath, resultPath, options)
}

function copyFileSyncWithoutFile(copiedPath, resultPath, ignoreFiles) {
  if (!isArray(ignoreFiles)) {
    throw new Error('ignoreFiles must be array')
  }

  fs.copySync(copiedPath, resultPath, {
    filter: (src) => {
      return !ignoreFiles.some((ignoreFile) => src.endsWith(ignoreFile))
    },
  })
}

function copyFileSync(copiedPath, resultPath, options = {}) {
  fs.copySync(copiedPath, resultPath, options)
}

function readFile(filePath, options) {
  return fs.readFileSync(filePath, options)
}

function writeFile(filPath, content) {
  fs.outputFileSync(filPath, content)
}

/**
 * 删除文件
 * @param path
 * @param options <{
 *   filter?: <() => boolean> // default () => true
 * }>
 * @param deletedDirectoryPathMap <Object>
 */
function removeSync(path, options, deletedDirectoryPathMap = {}) {
  if (isPlainObject(options)) {
    if (!options.filter) {
      options.filter = () => true
    } else if (!isFunction(options.filter)) {
      throw new Error('removeSync filter options must be function')
    }

    const files = fs.readdirSync(path, { withFileTypes: true })

    files.reduce((acc, file) => {
      const filePath = `${path}/${file.name}`

      if (file.isDirectory()) {
        if (acc[filePath]) {
          return acc
        }
      }
      // need remove
      if (options.filter(filePath)) {
        if (file.isDirectory()) {
          acc[filePath] = true
        }
        fs.removeSync(filePath)
      } else {
        if (file.isDirectory()) {
          removeSync(filePath, options, acc)
        }
      }
      return acc
    }, deletedDirectoryPathMap)
  } else {
    fs.removeSync(path)
  }
}

/**
 * 深度获取文件名
 * @param path
 * @param options <{
 *   dir?: boolean, // default true
 * }>
 * @param results
 * @return {Array}
 */
function deepReaddirSync(path, options = {}, results = []) {
  options.dir = Object.hasOwnProperty.call(options, 'dir')
    ? !!options.dir
    : true

  const files = fs.readdirSync(path, { withFileTypes: true })
  files.reduce((acc, file) => {
    const filePath = `${path}/${file.name}`
    if (file.isDirectory()) {
      if (options.dir) {
        acc.push(filePath)
      }
      return deepReaddirSync(filePath, options, acc)
    }
    acc.push(filePath)
    return acc
  }, results)
  return results
}

module.exports = {
  copyFile,
  copyFileSync,
  copyFileSyncWithoutFile,
  readFile,
  writeFile,
  deepReaddirSync,
  removeSync,
}
