import { createWorker } from 'worker-fns/Worker'
import Post from './worker/Post'
import Comment from './worker/Comment'

let fns = createWorker({ debug: 2 })

fns.use({ Post, Comment })

fns.start(() => console.log('worker is running'))
