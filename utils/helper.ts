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
