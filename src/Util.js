// @flow

type HashMap = {
  [string]: any
};

export function toObject (acc: HashMap, x: HashMap): HashMap {
  return Object.assign(acc, x)
}

export let getId = (function() {
  let id = 0
  return function () {
    let tmp = id
    id = id + 1
    return tmp
  }
})()