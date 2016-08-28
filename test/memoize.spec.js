import { SimpleMemoize } from '../src/memoize'

describe('SimpleMemoize', () => {
  describe('_hasher', () => {
    let store

    beforeEach(() => {
      store = new SimpleMemoize(0, 0)
    })

    it('should return -1 if < 0', () => {
      store._hasher(0, -1).should.equal(-1)
      store._hasher(-1, 0).should.equal(-1)
      store._hasher(-1, -1).should.equal(-1)
    })
    it('should return correct value, based on Szudzik pairing', () => {
      store._hasher(0, 0).should.equal(0)
      store._hasher(1, 0).should.equal(2)
      store._hasher(0, 1).should.equal(1)
      store._hasher(150, 2).should.equal(150 * 151 + 2)
    })
  })

  describe('exists', () => {
    let store

    beforeEach(() => {
      store = new SimpleMemoize(0, 0)
    })

    it('should return false if values  don\'t exists', () => {
      store.exists(10, 8).should.be.false
    })
    it('should return true if values  does exists', () => {
      store.update(10, 8, 'SomeValue')
      store.exists(10, 8).should.be.true
    })
  })

  describe('update', () => {
    let store

    beforeEach(() => {
      store = new SimpleMemoize(0, 0)
    })

    it('should return true', () => {
      store.update(10, 8, 'SomeValue').should.be.true
    })
  })

  describe('schedule', () => {
    let store

    beforeEach(() => {
      store = new SimpleMemoize(0, 0)
    })

    it('should add values to queue', () => {
      expect(() => store.schedule(0, 8)).to.increase(store, 'tasks')
    })
  })

  describe('process', () => {
    describe('provided task halts', () => {
      const task = (a, b) => {
        a.should.not.equal(10)
        b.should.not.equal(10)

        if(store.exists(a+1, b+1)) return store.update(a, b, store.retrieve(a+1, b+1))
        else return store.schedule(a+1, b+1)
      }
      let store

      beforeEach(() => {
        store = new SimpleMemoize(0, 0)
        store.update(10, 10, 'SomeValue')
      })

      it('should resolve according to task', () => {
        store.process(task).should.equal('SomeValue')
        store.tasks.should.equal(0)
      })
    })
  })
})
