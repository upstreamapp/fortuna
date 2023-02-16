import { readFileSync, writeFileSync } from 'fs'
import { join, resolve } from 'path'
import moment from 'moment'
import prettier, { Options } from 'prettier'

const prettierConfig: Options = {
  singleQuote: true,
  semi: false,
  tabWidth: 2,
  trailingComma: 'none',
  arrowParens: 'avoid',
  parser: 'typescript'
}

function generateMigrationFile() {
  const name = process.argv[2].trim()
  if (!name) {
    console.warn(`Missing migration name.`)
    return process.exit(1)
  }

  const filename = `${moment().format('YYYYMMDDHHmmss')}-${name}`
  console.log({ filename })
  let template = readFileSync(join(resolve(__dirname), './_index.ts'), 'utf8')
  template = prettier.format(template, prettierConfig)
  writeFileSync(
    join(resolve(__dirname), `../../src/migrations/${filename}.ts`),
    template
  )
}

generateMigrationFile()

console.log('Done')
