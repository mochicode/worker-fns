import WorkerFN from './counter.worker.js'
import createWorker from 'worker-fns/Client'

async function main () {
  let { Counter } = await createWorker(new WorkerFN())

  await Counter.increment()
  await Counter.increment()
  await Counter.increment()
  console.log(await Counter.show())
  await Counter.decrement()
  await Counter.decrement()
  await Counter.decrement()
  console.log(await Counter.show())
  let final = await Counter.incrementBy(10)
  console.log(final)
}

main()
