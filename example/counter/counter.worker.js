import { createWorker } from 'worker-fns/Worker'

let fns = createWorker({ debug: true })

let counter = 0
let Counter = {
  show () {
    return counter
  },
  increment () {
    return counter = counter + 1
  },
  decrement () {
    return counter = counter - 1
  },
  incrementBy (n) {
    return counter = counter + n
  }
}

fns.use({ Counter })

fns.start(() => console.log('worker is running'))
