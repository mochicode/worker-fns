// @flow
import type {
  CreateFunctionClient,
  FunctionDefinition,
  WebWorker,
  Message
} from '../Type'


type Dependencies = {
  createFNClient: CreateFunctionClient,
  functionMap: FunctionMap
};


type Init = {
  worker: WebWorker,
  resolve(any): void,
  reject(any): void
};

export default function onMessageImpl (
  { createFNClient, functionMap }: Dependencies
) {
  return function ({ worker, resolve, reject }: Init) {
    return function onMessage ({ data }: { data: Message }) {
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

          if (data.error !== '') {
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
  }
}
