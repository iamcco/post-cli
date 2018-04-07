import path from 'path'
import jsonfile from 'jsonfile'

const defaultConfig = {
  url: '/',
  source: './source',
  public: './public'
}

const cwd = process.cwd()

const configFilePath = path.join(cwd, './.startrc')

let config = {
  ...defaultConfig,
  ...jsonfile.readFileSync(configFilePath)
}

export default {
  ...config,
  source: path.join(cwd, config.source),
  public: path.join(cwd, config.public)
}
