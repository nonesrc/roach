import { hasProperties } from '../utils/helper'

describe('自身是否拥有属性', () => {
  it('包含属性', () => {
    expect(hasProperties({ name: 'nonesrc', passwd: 'none', key: 1 }, ['name', 'passwd'])).toBeTruthy()
  })
  it('未包含属性', () => {
    expect(hasProperties({ name: 'nonesrc', passwd: 'none' }, ['key'])).toBeFalsy()
  })
  it('只含属性', () => {
    expect(hasProperties({ name: 'nonesrc', passwd: 'none' }, ['name', 'passwd'], true)).toBeTruthy()
  })
  it('未只含属性', () => {
    expect(hasProperties({ name: 'nonesrc', passwd: 'none', key: 1 }, ['name', 'passwd'], true)).toBeFalsy()
  })
})
