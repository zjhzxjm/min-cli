import { ModulePool } from '../src/module'

describe('ModulePool CASE', () => {
  it('install', () => {
    const pool = new ModulePool({})
    pool.install(['a'], {
      state: { value: 1 }
    })
    pool.install(['b'], {
      state: { value: 2 }
    })
    pool.install(['a', 'b'], {
      state: { value: 3 }
    })

    expect(pool.getModuleByPath(['a']).state.value).toBe(1)
    expect(pool.getModuleByPath(['b']).state.value).toBe(2)
    expect(pool.getModuleByPath(['a', 'b']).state.value).toBe(3)
  })

  it('get module by path', () => {
    const pool = new ModulePool({
      state: { value: 1 },
      modules: {
        a: {
          state: { value: 2 }
        },
        b: {
          state: { value: 3 },
          modules: {
            c: {
              state: { value: 4 }
            }
          }
        }
      }
    })

    expect(pool.getModuleByPath([]).state).toEqual({value: 1})
    expect(pool.getModuleByPath(['a']).state).toEqual({value: 2})
    expect(pool.getModuleByPath(['b', 'c']).state).toEqual({value: 4})
  })
})
