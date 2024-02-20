const path = require('path')
const chalk = require('chalk')
const execa = require('execa')
const {
  log,
  logWithSpinner,
  stopSpinner,
  clearConsole
} = require('@vue/cli-shared-utils')
const {
  copyFileSync,
  copyFileSyncWithoutFile,
  writeFile
} = require('./util/file')
const resolveConfig = require('./resolveConfig')
const { getPackageJson, writePackageJson } = require('./util/packageJson')
const {
  ignoreFiles,
  templatePath,
  configFileName,
  huskyConfigName,
  huskyConfigPath
} = require('./options')
const promptOptions = require('./prompts')

module.exports = class Creator {
  constructor(name, context) {
    this.name = name
    this.context = context

    this.run = this.run.bind(this)
  }

  async create(options) {
    const { run, name, context } = this
    options = await promptOptions(options)

    clearConsole()

    // create
    logWithSpinner(
      `✨ `,
      `Creating project in ${chalk.yellow(
        options.project.toUpperCase()
      )}.`
    )

    // 将通用模版拷贝到目标文件
    copyFileSyncWithoutFile(templatePath, context, [
      ...ignoreFiles,
    ])

    // 将渲染模式对应的模版拷贝到目标文件
    copyFileSync(path.join(templatePath, options.project), context)

    // 将config写入到vue.config.js
    writeFile(path.join(context, configFileName), resolveConfig(options))

    // 写入 package.json
    const pkg = getPackageJson(context)
    pkg.name = name
    pkg.instanceConfig = options
    writePackageJson(context, pkg)

    // 配置husky
    copyFileSyncWithoutFile(
      huskyConfigPath,
      path.join(context, huskyConfigName),
      ['_']
    )

    // 初始化 git
    logWithSpinner(`🗃`, `Initializing git repository...`)
    await run('git init')
    await run('git add .')

    // 安装 node modules
    logWithSpinner(`⚙  Installing node modules. This might take a while...`)
    await run('pnpm install')

    stopSpinner()
    log()
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
    log(
      `👉  Get started with the following commands:\n\n` +
        (this.context === process.cwd()
          ? ``
          : chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`)) +
        chalk.cyan(` ${chalk.gray('$')} pnpm run serve`)
    )
    log()
  }

  run(command, args) {
    if (!args) {
      ;[command, ...args] = command.split(/\s+/)
    }
    return execa(command, args, { cwd: this.context })
  }
}
