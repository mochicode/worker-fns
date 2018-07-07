// @flow

import createWorkerImpl from './Client/createWorker'
import onMessageImpl from './Client/onMessage'
import createFNClientImpl from './Client/createFNClient'
import { getId } from './Util'

import type { FunctionMap, WebWorker } from './Type'

let functionMap: FunctionMap  = new Map()

let createFNClient = createFNClientImpl({
  functionMap
})


let onMessage = onMessageImpl({
  functionMap,
  createFNClient
})

export default createWorkerImpl({
  onMessage
})


export function pipe (
  { worker }: {| worker: WebWorker |}, 
  ...fns: Array<{| type: 'cmd' | 'fn' |}>
) {
  return new Promise((resolve, reject) => {
    let id = getId()
    let pipeline = fns.map(elm => {
      if (typeof elm === 'function') {
        return { type: 'fn', name: elm.$name }
      } else if (typeof elm === 'object') {
        return { type: 'cmd', ...elm }
      }

      return {}
    })
    functionMap.set(id, { resolve, reject })
    worker.postMessage({ type: 'PIPE', pipeline, id })
  })
}

export function pick (prop:  string) {
  return { cmd: 'pick', prop }
}

export function args (...args_: Array<any>) {
  return { cmd: 'args', args: args_ }
}

type Mapper = 
  | Function
  | Object
;

export function map (mapper: Mapper) {
  if (typeof mapper === 'function') {
    return { cmd: 'map', ofType: 'fn', name: mapper.$name }
  } else if (typeof mapper === 'object') {
    return { cmd: 'map', mapper }
  }
}