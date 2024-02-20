const chalk = require('chalk')
const shell = require('shelljs')
const { clearConsole } = require('@vue/cli-shared-utils')
const { writeFile } = require('./util/file')
const resolveConfig = require('./resolveConfig')
const { templatePath, runConfigPath } = require('./options')
const promptOptions = require('./prompts')

module.exports = class Runner {
  constructor(script) {
    this.script = script
  }

  async run(options) {
    options = await promptOptions({ ...options, run: true })

    clearConsole()
    console.log(
      `🚀`,
      ` Running project in ${chalk.yellow(
        options.project.toUpperCase()
      )}.`
    )
    // 将config写入到node_module
    writeFile(runConfigPath, resolveConfig(options))
    // 开始run
    return this.runScript()
  }

  runScript() {
    return new Promise((resolve, reject) => {
      shell.exec(
        `VUE_CLI_SERVICE_CONFIG_PATH=${runConfigPath} npm run ${this.script}`,
        { cwd: templatePath },
        (code, stdout, stderr) => {
          if (stderr) {
            reject(stderr)
          }
        }
      )
    })
  }
}
