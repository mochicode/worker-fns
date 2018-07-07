import WorkerFN from './ajax.worker.js'
import createWorker, { pipe, pick, map } from 'worker-fns/Client'

async function main () {
  let fns = await createWorker(new WorkerFN())
  let { Post, Comment } = fns

  let commentsAll = await pipe(fns,
    Post.getAll,
    map(pick('id')),
    map(Comment.getByPost)
  )

  console.log(commentsAll)

  let posts = await Post.getAll()

  let comments = await Promise.all(
    posts.map(post => Comment.getByPost(post.id))
  )

  console.log(comments)

  console.log(await Post.get(1))
}

main()
