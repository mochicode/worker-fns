
let comments = new Map()
let base = 'https://jsonplaceholder.typicode.com/comments/'

function getByPost (id) {
  let url = `${base}?postId=${id}`
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      comments.set(id, data)
      return data
    })
}

function getAll () {
  return fetch(base)
    .then(res => res.json())
    .then(data => {
      data.forEach(comment => comments.set(comment.id, comment))
      return data
    })
}

export default {
  getByPost,
  getAll
}
