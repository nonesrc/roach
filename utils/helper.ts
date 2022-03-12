import { createHash } from 'crypto'
import type { Plugin, PluginInfo } from '../types/pluginTypes'

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

export function hasProperties(o: Object, p: string[] | string, only: boolean = false) {
  const props = typeof p === 'string' ? [p] : p
  if (only && props.length !== Object.keys(o).length) return false
  return props.every((P) => Object.prototype.hasOwnProperty.call(o, P))
}

export function getPluginRecord(plugin: Plugin): PluginInfo {
  return {
    name: plugin.name,
    author: plugin.author,
    version: plugin.version
  }
}

export function hashStr(str: string) {
  return str.length ? createHash('md5').update(str).digest('hex') : ''
}

// Get plugin hash
// TODO...
export function pluginHash<T>(plugin: T & { name: string; version: string }) {
  return hashStr(`${plugin.name}@${plugin.version}`)
}
