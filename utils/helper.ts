import { createHash } from 'crypto'

export function pathToRegex(path: string, exact = false) {
  return new RegExp(
    (exact ? '^' : '') +
      path
        .replace(/:(\w+)\?\//g, '((?<$1>.+)/)?')
        .replace(/:(\w+)/g, '(?<$1>.+)')
        .replace(/\/+/g, '\\/') +
      (exact ? '$' : '')
  )
}

// Check if obj own properties
export function hasProperties(
  o: Object,
  p: string[] | string,
  only: boolean = false
) {
  const props = typeof p === 'string' ? [p] : p
  if (only && props.length !== Object.keys(o).length) return false
  for (const _p of props) {
    if (!Object.prototype.hasOwnProperty.call(o, _p)) return false
  }
  return true
}

// hash
export function hashStr(str: string) {
  return createHash('md5').update(str).digest('hex')
}

// Get plugin hash // TODO...
export function pluginHash<T>(plugin: T & { name: string; version: string }) {
  return hashStr(`${plugin.name}@${plugin.version}`)
}
