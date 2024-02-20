function isMVCProject(pkg) {
  return !!pkg.instanceConfig
}

module.exports = {
  isMVCProject,
}
