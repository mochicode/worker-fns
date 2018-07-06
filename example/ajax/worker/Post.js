
let posts = new Map()
let base = 'https://jsonplaceholder.typicode.com/posts/'

function get (id) {
  let url = `${base}${id}`

  let data = posts.get(id)

  if (data) {
    return data
  }

  return fetch(url)
    .then(response => response.json())
    .then(data => {
      posts.set(id, data)
      return data
    })
}

function getAll () {
  return fetch(base)
    .then(res => res.json())
    .then(data => {
      data.forEach(post => posts.set(post.id, post))
      return data
    })
}

export default {
  get,
  getAll
}
