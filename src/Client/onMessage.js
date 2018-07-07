// @flow

import type {
  CreateFunctionClient,
  FunctionDefinition,
  WebWorker,
  Message,
  FunctionMap,
  MessageBody
} from '../Type'

import { event } from '../Type'


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
    return function onMessage ({ data }: MessageBody) {
      switch (data.type) {
        case event.SUCCESS:
          let fnClient = createFNClient(data.functions, worker)
          resolve({ ...fnClient, worker })
          return

        case event.VALUE:
          let promiseFns = functionMap.get(data.id)

          if (!promiseFns) {
            console.log(
              'Missing Functions',
              data.id,
              functionMap
            )
            return
          }

          let { resolve: resolveFn, reject: rejectFn } = promiseFns

          if (data.error !== undefined) {
            return rejectFn(data.error)
          }

          resolveFn(data.data)
          functionMap.delete(data.id)
          return

        case event.ERROR:
          if (data.error !== undefined) {
            reject(data.error)
          }
          return

        default:
          console.log('Type Mismatch: ', data)
      }
    }
  }
}
