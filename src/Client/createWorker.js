// @flow

export default function createWorkerImpl ({ onMessage }) {
  return function createWorker(worker: WebWorker) {
    return new Promise((resolve, reject) => {
      let args = { worker, resolve, reject }
      worker.addEventListener('message', onMessage(args))
      worker.postMessage({ type: event.INIT })
    })
  }
}