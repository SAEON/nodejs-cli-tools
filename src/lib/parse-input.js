import parseArgs from './parse-args.js'
import buildHelpOutput from './build-help-output.js'

export default async function parseInput(config, args) {
  const command = args[0]

  // If CLI argument is invalid
  if (!config[command]) {
    console.info(await buildHelpOutput(`Unknown command "${command || ''}"`, config))
    process.exit(1)
  }

  // Resolve promised functions if necessary
  if (config[command].constructor === Promise) {
    config[command] = await config[command]
  }

  // If CLI argument is a sub-cli
  if (typeof config[command] === 'object') {
    return await parseInput(config[command], args.slice(1))
  }

  // If CLI argument is an operation
  if (typeof config[command] === 'function') {
    const result = await config[command](parseArgs(config[command].flags)(args.slice(1)))
    console.info('Complete!')
    return result
  }

  // If CLI configuration is not valid
  throw new Error(`Unexpected configuration value for ${command}: ${config[command]}`)
}
