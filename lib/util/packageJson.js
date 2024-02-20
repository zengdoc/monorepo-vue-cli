const path = require('path')
const fs = require('fs-extra')

const getPkgPath = (projectPath) => path.join(projectPath, 'package.json')

function getPackageJson(projectPath) {
  return fs.readJsonSync(getPkgPath(projectPath))
}

function writePackageJson(projectPath, packageJson) {
  return fs.outputJsonSync(getPkgPath(projectPath), packageJson, { spaces: 2 })
}

module.exports = {
  getPackageJson,
  writePackageJson,
}
