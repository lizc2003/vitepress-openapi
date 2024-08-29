import { httpVerbs } from 'vitepress-theme-openapi'
import { generateMissingOperationIds } from '../utils/generateMissingOperationIds';
import { dereference } from '@scalar/openapi-parser'
import type { OpenAPI } from '@scalar/openapi-types'

let rawSpec: any = {}

let parsedSpec: OpenAPI = {}

export function useOpenapi({ spec } = { spec: null }) {
  if (spec !== null) {
    setSpec(spec)
  }

  async function setSpec(value: OpenAPISpec) {
    if (value?.openapi) {
      if (!value.openapi.startsWith('3.')) {
        throw new Error('Only OpenAPI 3.x is supported')
      }
    } else {
      console.warn('Invalid OpenAPI spec, missing `openapi` field, no version specified ')
    }
    if (value?.paths) {
      value = generateMissingOperationIds(value)
    }

    rawSpec = value

    const parsed = await dereference(value)

    parsedSpec = parsed.schema
  }

  function getOperation(operationId: string) {
    if (!parsedSpec.paths) {
      return null
    }

    for (const path of Object.values(parsedSpec.paths)) {
      for (const verb of httpVerbs) {
        if (path[verb]?.operationId === operationId) {
          return path[verb]
        }
      }
    }

    return null
  }

  function getOperationMethod(operationId: string) {
    if (!parsedSpec.paths) {
      return null
    }

    for (const path of Object.values(parsedSpec.paths)) {
      for (const verb of httpVerbs) {
        if (path[verb]?.operationId === operationId) {
          return verb
        }
      }
    }

    return null
  }

  function getOperationPath(operationId: string) {
    if (!parsedSpec.paths) return null

    for (const [path, methods] of Object.entries(parsedSpec.paths)) {
      for (const verb of httpVerbs) {
        if (methods[verb]?.operationId === operationId) {
          return path
        }
      }
    }

    return null
  }

  function getOperationParameters(operationId: string) {
    const operation = getOperation(operationId)
    if (!operation) {
      return []
    }
    return operation.parameters || []
  }

  function getBaseUrl() {
    if (!parsedSpec.servers || parsedSpec.servers.length === 0)
      return ''

    return parsedSpec.servers[0].url
  }

  function getSchemas() {
    if (!parsedSpec.components || !parsedSpec.components.schemas)
      return {}

    return parsedSpec.components.schemas
  }

  function getOperationCodeSamples(operationId: string) {
    const operation = getOperation(operationId)
    if (!operation) {
      return []
    }
    return operation['x-codeSamples'] || operation['x-code-samples'] || []
  }

  return {
    spec: parsedSpec,
    rawSpec,
    setSpec,
    getOperation,
    getOperationMethod,
    getOperationPath,
    getOperationParameters,
    getBaseUrl,
    getSchemas,
    getOperationCodeSamples,
  }
}
