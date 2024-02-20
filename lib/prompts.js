const inquirer = require('inquirer')
const { clearConsole } = require('@vue/cli-shared-utils')

const prompts = {
  render: {
    name: 'render',
    type: 'list',
    message: `Please select project:`,
    choices: [
      {
        name: 'Project 1',
        value: 'project1',
      },
      {
        name: 'Project 2',
        value: 'project2',
      },
    ],
  },
}

/**
 * 补充参数
 * @param options
 * @return {Promise<{
 *   project: 'project1' | 'project2'
 * }>}
 */
async function promptOptions(options) {
  // 选择渲染模式
  if (!options.project) {
    clearConsole()
    const answers = await inquirer.prompt([prompts.render])
    options.project = answers.render
  }
  return options
}

module.exports = promptOptions
