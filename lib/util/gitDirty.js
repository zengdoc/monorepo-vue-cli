const execa = require('execa')
const { hasProjectGit } = require('@vue/cli-shared-utils')

async function getGitDirtyStatus(context) {
  if (!hasProjectGit(context)) {
    return null
  }
  const { stdout } = await execa('git', ['status', '--porcelain'], { cwd: context })
  return stdout ? stdout.trim().split(/\r?\n/g) : null
}

async function confirmIfGitDirty(context) {
  if (!await getGitDirtyStatus(context)) {
    return true
  }

  throw new Error(`There are uncommited changes in the current repository, it's recommended to commit or stash them first.`)
}

async function getGitDirtyFilePaths(context) {
  const dirtyFileStatus = await getGitDirtyStatus(context)
  if (dirtyFileStatus) {
    return dirtyFileStatus.map(i => i.replace(/.*\s(\w*)/, '$1'))
  }
  return null
}

module.exports = {
  confirmIfGitDirty,
  getGitDirtyStatus,
  getGitDirtyFilePaths,
}
