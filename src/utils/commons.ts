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
