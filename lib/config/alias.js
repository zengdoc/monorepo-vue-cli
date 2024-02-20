const path = require('path')
const fs = require('fs-extra')
const { templatePath } = require('../options')
const { deepReaddirSync } = require('../util/file')

module.exports = (options) => {
  if (!options.run) {
    return ''
  }

  const projectPath = path.join(templatePath, `/${options.project}`)
  // 无自定义文件，无需处理
  if (!fs.existsSync(projectPath)) {
    return ''
  }

  const projectAlias = transformAlias(deepReaddirSync(projectPath), projectPath)
  // 无自定义别名，无需处理
  if (Object.keys(projectAlias).length < 1) {
    return ''
  }

  return `
    module.export = {
      configureWebpack: (config) => {
        Object.assign(config.resolve, {
          alias: {
            ${alias2FieldStr(projectAlias)}
            ...config.resolve.alias
          }
        })
      }
    }
  `
}

function transformAlias(filePaths, context) {
  const alias = Object.create(null)
  function transform(relativePath, fullPath) {
    const fileAliasKeys = [relativePath]

    // 可忽略后缀名的文件
    const fileExtensions = ['.mjs', '.js', '.jsx', '.vue', '.json', '.wasm']
    const isExtensionFile =
      relativePath.indexOf('.') > -1 &&
      fileExtensions.some((extension) => relativePath.endsWith(extension))
    // 增加有后缀名的alias
    if (isExtensionFile) {
      fileAliasKeys.push(relativePath.replace(/\.\w+/, ''))
    }
    fileAliasKeys.forEach((key) => (alias[`${key}$`] = fullPath))
  }

  filePaths.forEach((filePath) => {
    const relativePath = filePath.replace(`${context}/src`, '@')
    if (['@', '@/views'].includes(relativePath)) {
      return
    }
    const fileStat = fs.statSync(filePath)
    if (!fileStat.isDirectory()) {
      // 有index文件
      const indexReg = /\/index(\.\w*)?$/
      if (indexReg.test(relativePath)) {
        const dirPath = relativePath.replace(indexReg, '')
        transform(dirPath, filePath)
      }
      transform(relativePath, filePath)
    }
  })
  return alias
}

function alias2FieldStr(alias) {
  const fieldStr = Object.entries(alias)
    .map(([key, value]) => `"${key}": "${value}"`)
    .join(',\n')
  return fieldStr ? `${fieldStr},` : ''
}
