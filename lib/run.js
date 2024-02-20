const Runner = require('./Runner')
const { error } = require('@vue/cli-shared-utils')

async function run(script, options) {
  const runner = new Runner(script)
  await runner.run(options)
}

module.exports = (...args) => {
  return run(...args).catch((err) => {
    error(err)
    process.exit(1)
  })
}
