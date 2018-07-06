// @flow

import type { 
  FunctionDefinition, 
  WebWorker,
  FunctionMap,
  FNClient
} from '../Type'

import { event } from '../Type'
import { toObject } from '../Util'

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
              functionMap.push(id, { resolve, reject })
              worker.postMessage({
                type: event.CALL, 
                payload: { path, args, id }
              })
            })
           
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

var getId = (function() {
  let id = 0
  return function () {
    let tmp = id
    id = id + 1
    return tmp
  }
})()