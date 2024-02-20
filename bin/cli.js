#!/usr/bin/env node

// Check node version before requiring/doing anything else
// The user may be on a very old node version

const chalk = require('chalk')
const semver = require('semver')
const requiredVersion = require('../package.json').engines.node
const didYouMean = require('didyoumean')

// Setting edit distance to 60% of the input string's length
didYouMean.threshold = 0.6

function checkNodeVersion(wanted, id) {
  if (!semver.satisfies(process.version, wanted)) {
    console.log(
      chalk.red(
        'You are using Node ' +
          process.version +
          ', but this version of ' +
          id +
          ' requires Node ' +
          wanted +
          '.\nPlease upgrade your Node version.'
      )
    )
    process.exit(1)
  }
}

checkNodeVersion(requiredVersion, 'cli')

const minimist = require('minimist')
const program = require('commander')

const projectOptions = ['project1', 'project2']

program
  .version(`monorepo-vue-cli ${require('../package').version}`)
  .usage('<command> [options]')

program
  .command('create <app-name>')
  .description('create a new project powered by cli')
  .option(
    '-p, --project <project>',
    `Render project (${projectOptions.join('|')})`,
    new RegExp(`^(${projectOptions.join('|')})$`),
    null
  )
  .action((name, cmd) => {
    const options = cleanArgs(cmd)

    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(
        chalk.yellow(
          "\n Info: You provided more than one argument. The first one will be used as the app's name, the rest are ignored."
        )
      )
    }
    require('../lib/create')(name, options)
  })

program
  .command('run <script>')
  .description('run project by script')
  .option(
    '-p, --project <project>',
    `Render project (${projectOptions.join('|')})`,
    new RegExp(`^(${projectOptions.join('|')})$`),
    null
  )
  .action((script, cmd) => {
    require('../lib/run')(script, cleanArgs(cmd))
  })

program
  .command('upgrade')
  .description('upgrade project')
  .option(
    '-p, --project <project>',
    `Render project (${projectOptions.join('|')})`,
    new RegExp(`^(${projectOptions.join('|')})$`),
    null
  )
  .action((cmd) => {
    require('../lib/upgrade')(cleanArgs(cmd))
  })

// output help information on unknown commands
program.arguments('<command>').action((cmd) => {
  program.outputHelp()
  console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`))
  console.log()
  suggestCommands(cmd)
})

// enhance common error messages
const enhanceErrorMessages = require('../lib/util/enhanceErrorMessages')

enhanceErrorMessages('missingArgument', (argName) => {
  return `Missing required argument ${chalk.yellow(`<${argName}>`)}.`
})

enhanceErrorMessages('unknownOption', (optionName) => {
  return `Unknown option ${chalk.yellow(optionName)}.`
})

enhanceErrorMessages('optionMissingArgument', (option, flag) => {
  return (
    `Missing required argument for option ${chalk.yellow(option.flags)}` +
    (flag ? `, got ${chalk.yellow(flag)}` : ``)
  )
})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
  program.outputHelp()
}

function suggestCommands(unknownCommand) {
  const availableCommands = program.commands.map((cmd) => {
    return cmd._name
  })

  const suggestion = didYouMean(unknownCommand, availableCommands)
  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`))
  }
}

function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {}
  cmd.options.forEach((o) => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}
