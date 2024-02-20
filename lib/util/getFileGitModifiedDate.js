const execa = require('execa')
const { hasProjectGit } = require('@vue/cli-shared-utils')

module.exports = async function getFileGitModifiedDate(path, context) {
  if (!hasProjectGit(context)) {
    return 0
  }

  const { stdout } = await execa('git', ['log', '-1', '--pretty="%ci"', path], {
    cwd: context
  })

  if (stdout.trim()) {
    return new Date(stdout).valueOf()
  }
  return 0
}
