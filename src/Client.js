// @flow

import createWorkerImpl from './Client/createWorker'
import onMessageImpl from './Client/onMessage'
import createFNClientImpl from './Client/createFNClient'
import type { FunctionMap } from './Type'

let functionMap: FunctionMap  = {
  _functions: {},
  push (id, fns) {
    this._functions[id] = fns
  },
  get (id) {
    this._functions[id]
  },
  remove (id) {
    delete this._functions[id]
  }
}

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
