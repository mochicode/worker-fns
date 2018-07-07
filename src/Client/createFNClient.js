// @flow

import type { 
  FunctionDefinition, 
  WebWorker,
  FunctionMap,
  FNClient
} from '../Type'

import { event } from '../Type'
import { toObject, getId } from '../Util'

export default function createFNClientImpl (
  { functionMap } : { functionMap: FunctionMap }
) {
  return function createFNClient (
    clientDefinition: FunctionDefinition, 
    worker: WebWorker
  ): FNClient {
    return Object.entries(clientDefinition)
      .map(([key, values]) => {

        if (!Array.isArray(values)) {
          values = []
        }

        let fns = values
          .map(fn => {
            if (typeof fn !== 'string') {
              fn = ''
            }

            let path = [key, fn]

            let fun = (...args) => new Promise((resolve, reject) => {
              let id = getId()
              functionMap.set(id, { resolve, reject })
              worker.postMessage({
                type: event.CALL, 
                payload: { path, args, id }
              })
            })

            fun.$name = path.join('.')
           
            return {
              [fn]: fun
            }
          })
          .reduce(toObject, {})

        return {
          [key]: fns        
        }
      })
      .reduce(toObject, {})
  }
}

