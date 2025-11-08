import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(process.cwd(), 'public', 'data')
const CONTRACTS_DIR = path.join(process.cwd(), 'specs', '001-map-line-filter', 'contracts')

async function loadJson(filePath: string) {
  const contents = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(contents)
}

async function validateFile(ajv: Ajv, schemaPath: string, dataPath: string) {
  const schema = await loadJson(schemaPath)
  const data = await loadJson(dataPath)
  
  const validate = ajv.compile(schema)
  const valid = validate(data)
  
  return { valid, errors: validate.errors }
}

async function main() {
  try {
    const ajv = new Ajv({ allErrors: true, strict: false })
    addFormats(ajv)
    
    const validations = [
      {
  schema: path.join(CONTRACTS_DIR, 'lines.schema.json'),
  data: path.join(DATA_DIR, 'lines.json'),
  name: 'lines.json',
      },
      {
  schema: path.join(CONTRACTS_DIR, 'stations.schema.json'),
  data: path.join(DATA_DIR, 'stations.json'),
  name: 'stations.json',
      },
    ]
    
    let hasErrors = false
    
    for (const validation of validations) {
      console.log(`Validating ${validation.name}...`)
      const { valid, errors } = await validateFile(ajv, validation.schema, validation.data)
      
      if (valid) {
        console.log(`✅ ${validation.name} is valid`)
      } else {
        hasErrors = true
        console.error(`❌ ${validation.name} failed validation:`)
        console.error(errors)
      }
    }
    
    if (hasErrors) {
      process.exit(1)
    } else {
      console.log('✅ All GeoJSON files are valid')
    }
    
  } catch (error) {
    console.error('Validation error:', error)
    process.exit(1)
  }
}

main()
