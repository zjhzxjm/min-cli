import { Module } from '../src/module'

describe('Module CASE', () => {
  it('get state', () => {
    const module = new Module({
      state: {
        a: 1
      }
    })
    expect(module.state).toEqual({a: 1})
  })

  it('get state: should return object if state option is empty', () => {
    const module = new Module({})
    expect(module.state).toEqual({})
  })

  it('add child', () => {
    const module = new Module({})

    module.addChild('child1', new Module({}))
    module.addChild('child2', new Module({}))
    expect(Object.keys(module.children)).toEqual(['child1', 'child2'])
  })
})
