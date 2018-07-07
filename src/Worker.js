// @flow

import { event } from './Type'
import { toObject } from './Util'

type WorkerConfig = {
  debug: 0 | 1 | 2 | 3 | 4 | 5
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

let settings = {
  debug: 0
}

export function createWorker ({ debug = 0 }: WorkerConfig) {
  let fnScope = new Map()

  settings.debug = debug

  return {
    use,
    start
  }

  function use (x: FunctionDefinition): void {
    Object.entries(x).forEach(([scope, fns]) => {
      let fn = new Map(Object.entries(fns))
      log(3, 'use: ', fn)
      fnScope.set(scope, fn)
    })
  }

  function start (cb: void => void): void {
    self.addEventListener('message', ({ data }: OnMessage) => {
      log(3, 'message: ', data)
      switch (data.type) {
        case event.INIT:

          let functions = {}

          let iterScope = fnScope.entries()

          for (let [scope, fns] of iterScope) {
              functions[scope] = Array.from(fns.keys()) 
          }

          log(2, 'Functions: ', functions)

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

        case 'PIPE':

          runPipeline(data.pipeline, fnScope)
            .then(result => {
              self.postMessage({
                type: event.VALUE,
                data: result, 
                id: data.id
              })
            })
            .catch(error => {
              self.postMessage({
                type: event.VALUE, 
                id: data.id,
                error
              })
            })

          break
        default:
          console.log('Type mismatch', data)

      }
    })

    cb()
  }
}


function runPipeline (pipeline, fns) {
  let [head, ...tail] = pipeline

  async function run (action, pipeline, acc) {
    log(5, 'runPipeline', action, pipeline, acc)
    if (undefined === action) return acc
    let [head, ...tail] = pipeline

    if (action.type === 'fn') {
      let path = action.name.split('.')
      let fn = getFn(path, fns)
      let result = await fn.apply(null, acc)

      return await run(head, tail, result)
    }

    if (action.type === 'cmd') {
      let result = await runCmd(action, acc, fns)

      return await run(head, tail, result)
    }


    console.log('Pipeline error: ', action, pipeline, acc)
  }


  return run(head, tail, null)
}


async function runCmd (action, acc, fns) {
  log(5, 'runCmd: ', action, acc, fns)
  switch (action.cmd) {
    case 'pick':
      return acc[action.prop]

    case 'args':
      return action.args

    case 'map':
      if (action.ofType === 'fn') {
        let path = action.name.split('.')
        let fn = getFn(path, fns)

        return Promise.all(
          acc.map(elm => fn.call(null, elm))
        )
      } else {
        return Promise.all(
          acc.map(elm => runCmd(action.mapper, elm, fns))
        )
      }

    default:
      console.log('Type mismatch: ', action, acc, fns)
  }
}

function getFn (path, fns) {
  return path.reduce(
    (map, x) => map.get(x) || NoOp,
    fns
  )
}


function log (verbose, ...msg) {
  if (settings.debug && verbose <= settings.debug) {
    console.log.apply(null, msg)
  }
}