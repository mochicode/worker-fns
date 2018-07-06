// @flow

import { event } from './Type'
import { toObject } from './Util'

type WorkerConfig = {
  debug: boolean
};

type FunctionDefinition = {
  [string]: { [string]: any => any }
};

type Payload = {
  path: [string, string],
  args: any[],
  id: number
};

type Message =
  | { type: typeof event.INIT }
  | { type: typeof event.CALL, payload: Payload };


type OnMessage = { data: Message };

let NoOp = () => {}

export function createWorker ({ debug = false }: WorkerConfig) {
  let fnScope = new Map()

  function log (...msg) {
    if (debug) {
      console.log.apply(null, msg)
    }
  }

  return {
    use,
    start
  }

  function use (x: FunctionDefinition): void {
    Object.entries(x).forEach(([scope, fns]) => {
      let fn = new Map(Object.entries(fns))
      fnScope.set(scope, fn)
    })
  }

  function start (cb: void => void): void {
    self.addEventListener('message', ({ data }: OnMessage) => {
      switch (data.type) {
        case event.INIT:

          let functions = {}

          let iterScope = fnScope.entries()

          for (let [scope, fns] of iterScope) {
              functions[scope] = Array.from(fns.keys()) 
          }

          log('Functions: ', functions)

          self.postMessage({ type: event.SUCCESS, functions })
          break

        case event.CALL:
          let { path, args, id } = data.payload
          let fn = path.reduce(
            (map, x) => map.get(x) || NoOp,
            fnScope
          )

          Promise.resolve(fn.apply(null, args))
            .then(data => {
              self.postMessage({ type: event.VALUE, data, id })
            })
            .catch(error => {
              self.postMessage({ type: event.VALUE, id, error })
            })

          break

        default:
          console.log('Type mismatch', data)

      }
    })

    cb()
  }
}