// @flow

type HashMap = {
  [string]: any
};

export function toObject (acc: HashMap, x: HashMap): HashMap {
  return Object.assign(acc, x)
}