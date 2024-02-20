const {
  error,
  clearConsole,
} = require('@vue/cli-shared-utils')

const Upgrader = require('./Upgrader')
const { confirmIfGitDirty } = require('./util/gitDirty')

async function upgrade (packageName, options, context = process.cwd()) {
  if (!(await confirmIfGitDirty(context))) {
    return
  }

  clearConsole()

  const upgrader = new Upgrader(context)
  return upgrader.upgrade(packageName, options)
}

module.exports = (...args) => {
  return upgrade(...args).catch(err => {
    error(err)
    process.exit(1)
  })
}
