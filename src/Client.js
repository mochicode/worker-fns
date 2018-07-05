// @flow

type WebWorker = {
  postMessage (any): void,
  addEventListener (string, ({ data: Message }) => void): void
};

let event = {
  INIT: 'INIT',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  VALUE: 'VALUE'
}

type Event = $Keys<typeof event>;

type Message = 
  | { type: typeof event.SUCCESS, functions: FunctionDefinition }
  | { type: typeof event.ERROR, error: string }
  | { type: typeof event.VALUE, data: any, id: number, error: string }
;

type FunctionDefinition = {
  [string]: [string]
};


type PromiseFns = { 
  resolve: (any) => void, 
  reject: (any) => void 
};

type FunctionMap = {
  _functions: {
    [number]: PromiseFns
  },
  push(number, PromiseFns): void,
  remove(number): void,
  get(number): ?PromiseFns
};

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

export default function createWorker(worker: WebWorker) {
  return new Promise((resolve, reject) => {
    worker.addEventListener('message', onMessage)

    worker.postMessage({ type: event.INIT })

    function onMessage ({ data }) {
      switch (data.type) {
          case event.SUCCESS:
            let fnClient = createFNClient(data.functions, worker)
            resolve(fnClient)
            return

          case event.VALUE:
            let promiseFns = functionMap.get(data.id)

            if (!promiseFns) {
              console.log('Missing Functions')
              return
            }

            let { resolve: resolveFn, reject: rejectFn } = promiseFns

            if ('' !== data.error) {
              return rejectFn(data.error)
            }


            resolveFn(data.data)
            return functionMap.remove(data.id)


          case event.ERROR:
            reject(data.error)
            return

          default:
            console.log('Type Mismatch: ', data)
      }
    }
  })
}

type FNClient = {
  [string]: {
    [string]: (any) => any
  }
};

function createFNClient (clientDefinition: FunctionDefinition, worker: WebWorker): FNClient {
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
            worker.postMessage({ type: 'CALL', payload: { path, args, id } })
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

type HashMap = {
  [string]: any
};

function toObject (acc: HashMap, x: HashMap): HashMap {
  return Object.assign(acc, x)
}

var getId = (function() {
  let id = 0
  return function () {
    let tmp = id
    id = id + 1
    return tmp
  }
})()