const path = require('path')
const fs = require('fs')
const chalk = require('chalk')
const inquirer = require('inquirer')
const execa = require('execa')
const {
  log,
  logWithSpinner,
  stopSpinner,
  clearConsole,
  warn,
  done
} = require('@vue/cli-shared-utils')
const {
  copyFile,
  removeSync,
  deepReaddirSync,
  writeFile
} = require('./util/file')
const { getGitDirtyStatus, getGitDirtyFilePaths } = require('./util/gitDirty')
const getFileGitModifiedDate = require('./util/getFileGitModifiedDate')
const { getPackageJson, writePackageJson } = require('./util/packageJson')
const { isMVCProject } = require('./util/shared')
const {
  ignoreFiles,
  templateName,
  templatePath,
  configFileName,
  isDiffOptions,
  mergeOptions
} = require('./options')
const promptOptions = require('./prompts')
const resolveConfig = require('./resolveConfig')

module.exports = class Upgrader {
  constructor(context) {
    this.context = context
    this.pkg = getPackageJson(context)
    this.dirtyOptionsFlag = false

    this.run = this.run.bind(this)
  }

  async upgrade(options) {
    const { run, pkg } = this

    if (!isMVCProject(pkg)) {
      throw new Error(`It is not mvc project, Please check`)
    }

    if (isDiffOptions(pkg.instanceConfig, options)) {
      warn(`It is different options, This will overwrite the project`)
      const { ok } = await inquirer.prompt([
        {
          name: 'ok',
          type: 'confirm',
          message: 'Still proceed?',
          default: false
        }
      ])

      if (ok) {
        this.dirtyOptionsFlag = true
      } else {
        return
      }
    }

    options = await promptOptions(mergeOptions(pkg.instanceConfig, options))

    clearConsole()

    // instanceConfig发生变化，清除多余文件
    let hadRemoveFile
    if (this.dirtyOptionsFlag) {
      hadRemoveFile = this.updatedOptions(options)
    }

    // upgrade
    logWithSpinner(
      `🔧`,
      `Upgrading project in ${chalk.yellow(
        options.project.toUpperCase()
      )}.`
    )

    const hadUpgradedFile = await this.upgradeFile(options)

    stopSpinner()
    if (hadRemoveFile || hadUpgradedFile) {
      logWithSpinner(`🗃`, `Adding a change to git repository...`)
      stopSpinner()
      await run('git add .')
      log(`${chalk.green('✔')}  Successfully upgrade project`)
      const dirtyStatus = await getGitDirtyStatus(this.context)
      log()
      log(`   The following files have been updated / added:\n`)
      log(
        dirtyStatus
          .map((i) => {
            const chalkMap = {
              A: chalk.green,
              M: chalk.blue,
              D: chalk.red
            }
            return chalkMap[/^\w+/.exec(i)[0]](i)
          })
          .map((line) => `     ${line}`)
          .join('\n')
      )
      log()
      log(
        `   You should review these changes with ${chalk.cyan(
          `git diff`
        )} and commit them.`
      )
      log()
      /*log(`${chalk.green('✔')}  Successfully upgrade project`)
      log()
      log(`   The following files have been updated / added:\n`)
      log(
        this.hadUpgradeFile
          .map(line => `     ${line}`)
          .join('\n')
      )
      log()
      log(
        `   You should review these changes with ${chalk.cyan(
          `git diff`
        )} and commit them.`
      )
      log()*/
    } else {
      done('Seems all files are up to date. Good work!')
    }
  }

  updatedOptions(options) {
    // 修改 package.json
    this.pkg.instanceConfig = options
    return this.removeOriginOptionsFile(options)
  }

  removeOriginOptionsFile(options) {
    let hadRemoveFile = []
    const originOptions = this.pkg.instanceConfig
    let needRemoveFile = []
    // 渲染模式
    needRemoveFile.push(
      ...deepReaddirSync(path.join(templatePath, originOptions.project), {
        dir: false
      })
    )
    // vue.config.js
    needRemoveFile.push(path.join(this.context, configFileName))

    removeSync(this.context, {
      filter: (src) => {
        const srcEndPath = src.replace(this.context, '')
        if (
          needRemoveFile.some((originPath) => originPath.endsWith(srcEndPath))
        ) {
          hadRemoveFile.push(srcEndPath)
          return true
        }
        return false
      }
    })
    return hadRemoveFile.length > 0 ? hadRemoveFile : null
  }

  async upgradeFile(options) {
    let hadUpgradeFile = []
    let templateGitDirtyFilePath = await getGitDirtyFilePaths(templatePath)
    if (templateGitDirtyFilePath) {
      templateGitDirtyFilePath = templateGitDirtyFilePath.filter((p) =>
        p.startsWith(templateName)
      )
    }
    const commonFilter = async (src, prefixPath, force = false) => {
      const fileRelativePath = src.replace(prefixPath, '')
      const contextSrc = path.join(this.context, fileRelativePath)
      if (!fileRelativePath) {
        return true
      }
      // 文件夹不做比较
      const srcStat = fs.statSync(src)
      if (srcStat.isDirectory()) {
        return true
      }
      // 强制更新
      if (force) {
        hadUpgradeFile.push(fileRelativePath)
        return true
      }
      // 比较文件是否存在
      // 若不存在，则更新
      if (!fs.existsSync(contextSrc)) {
        hadUpgradeFile.push(fileRelativePath)
        return true
      }
      // 比较文件修改时间
      // 若模版文件更新（修改时间更大），则更新
      const isGitDirty = () =>
        templateGitDirtyFilePath
          ? templateGitDirtyFilePath.some((p) => src.endsWith(p))
          : false
      const srcMtime = isGitDirty(src)
        ? srcStat.mtimeMs
        : await getFileGitModifiedDate(src, templatePath)
      const contextSrcMtime = await getFileGitModifiedDate(
        contextSrc,
        this.context
      )
      if (srcMtime > contextSrcMtime) {
        hadUpgradeFile.push(fileRelativePath)
        return true
      }
      return false
    }
    // 通用模版
    await copyFile(templatePath, this.context, {
      filter: (src) => {
        // 忽略文件
        return (
          ![
            ...ignoreFiles,
            'package.json'
          ].some((ignoreFile) => src.endsWith(ignoreFile)) &&
          commonFilter(src, templatePath)
        )
      }
    })
    // 渲染模式
    const projectTemPath = path.join(templatePath, options.project)
    await copyFile(projectTemPath, this.context, {
      filter: (src) => commonFilter(src, projectTemPath)
    })
    // 将config写入到vue.config.js
    writeFile(path.join(this.context, configFileName), resolveConfig(options))
    // package.json
    const pkgTemPath = path.join(templatePath, 'package.json')
    if (commonFilter(pkgTemPath, templatePath, this.dirtyOptionsFlag)) {
      const templatePkg = getPackageJson(templatePath)
      for (const field in templatePkg) {
        if (!Object.hasOwnProperty.call(templatePkg, field)) {
          continue
        }
        if (field === 'name') {
          continue
        }
        this.pkg[field] = templatePkg[field]
      }
      writePackageJson(this.context, this.pkg)
    }
    return hadUpgradeFile.length > 0 ? hadUpgradeFile : null
  }

  run(command, args) {
    if (!args) {
      ;[command, ...args] = command.split(/\s+/)
    }
    return execa(command, args, { cwd: this.context })
  }
}
