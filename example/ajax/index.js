import WorkerFN from './ajax.worker.js'
import createWorker from 'worker-fns/Client'

async function main () {
  let { Post, Comment } = await createWorker(new WorkerFN())

  let posts = await Post.getAll()

  console.log(posts)

  let comments = await Promise.all(
    posts.map(post => Comment.getByPost(post.id))
  )

  console.log(comments)

  console.log(await Post.get(1))
}

main()
