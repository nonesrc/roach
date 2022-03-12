import { pathToRegex, hasProperties, getPluginRecord, hashStr, pluginHash } from '../utils/helper'

// pathToRegex test util
describe('路径转正则', () => {
  it('全变量匹配', () => {
    expect('/user/20/tag/122').toMatch(pathToRegex('/user/:uid/tag/:tid'))
  })
  it('部分变量匹配', () => {
    expect('/user/20/tag/').toMatch(pathToRegex('/user/:uid/tag/:tid?'))
  })
  it('严格匹配-1', () => {
    expect('/user/tag').toMatch(pathToRegex('/user/tag', true))
  })
  it('严格匹配-2', () => {
    expect('/user/tag/').not.toMatch(pathToRegex('/user/tag', true))
  })
})

// hasProperties test util
describe('自身是否拥有属性', () => {
  it('包含属性（数组传参）', () => {
    expect(hasProperties({ name: 'nonesrc', passwd: 'none', key: 1 }, ['name', 'passwd'])).toBeTruthy()
  })
  it('包含属性（字符串传参）', () => {
    expect(hasProperties({ name: 'nonesrc', passwd: 'none', key: 1 }, 'name')).toBeTruthy()
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

// getPluginRecord test util
test('插件信息返回匹配', () => {
  expect(getPluginRecord({ name: 'jest-plugin', author: 'nonesrc', version: '1.0.0' } as any)).toMatchObject({
    name: expect.any(String),
    author: expect.any(String),
    version: expect.any(String)
  })
})

// hashStr test util
describe('哈希测试（md5）', () => {
  it('普通字符串', () => {
    expect(hashStr('nonesrc')).toBe('a34a55790f23246cca725ee99cbe4117')
  })
  it('空字符串', () => {
    expect(hashStr('')).toBe('')
  })
})

// pluginHash test util
test('插件哈希', () => {
  expect(pluginHash({ name: 'jest-plugin', version: '1.0.0' })).toBe('36f84cc94c4e50d0812cfeebf7e38672')
})
