// @flow

import type {
  MessageHandler,
  WebWorker,
} from '../Type'

import { event } from '../Type'

type Args = {
  worker: WebWorker,
  resolve: (any) => void,
  reject: (any) => void,
};

type Dependencies = {
  onMessage: (Args) => MessageHandler
};

export default function createWorkerImpl ({ onMessage }: Dependencies) {
  return function createWorker(worker: WebWorker) {
    return new Promise((resolve, reject) => {
      let args = { worker, resolve, reject }
      worker.addEventListener('message', onMessage(args))
      worker.postMessage({ type: event.INIT })
    })
  }
}