import { _ } from 'underscore'
import { DynamicOptimize } from '../src/optimize'
import { SimpleMemoize } from '../src/memoize'

describe('DynamicOptimize', () => {
  describe('collection', () => {
    let resolver

    beforeEach(() => {
      resolver = new DynamicOptimize('control', 'target')
      resolver.collection = [
        {control: 6, target: 3},
        {control: 2, target: 1},
        {control: 4, target: 2}
      ]
    })

    it('should sort the collection by control parameter', () => {
      resolver.collection.should.deep.equal([
        {control: 2, target: 1},
        {control: 4, target: 2},
        {control: 6, target: 3}
      ])
    })
  })

  describe('_buildResult', () => {
    let resolver

    beforeEach(() => {
      resolver = new DynamicOptimize('control', 'target', true)
      resolver.collection = [
        {control: 2, target: 1},
        {control: 4, target: 2},
        {control: 6, target: 3}
      ]
    })

    it('should return correctly formatted result when cut off index is 0', () => {
      const result = resolver._buildResult(-1)
      result.should.be.an('object')
      result.should.have.property('collection').that.is.an('array')
      result.should.have.property('collection').that.is.empty
      result.should.have.property('accumulator').that.equals(0)
    })
    it('should return correctly formatted result when cut off index is passed', () => {
      const result = resolver._buildResult(1)
      result.should.be.an('object')
      result.should.have.property('collection').that.is.an('array')
      result.should.have.property('accumulator').that.equals(3)
    })
    it('should return correctly formatted result when cut off index is not passed', () => {
      const result = resolver._buildResult()
      result.should.be.an('object')
      result.should.have.property('collection').that.is.an('array')
      result.should.have.property('accumulator').that.equals(6)
    })
  })

  describe('_cloneResult', () => {
    let resolver
    let result
    let clonedResult

    beforeEach(() => {
      resolver = new DynamicOptimize('control', 'target', true)
      resolver.collection = [
        {control: 2, target: 1},
        {control: 4, target: 2},
        {control: 6, target: 3}
      ]
      result = resolver._buildResult()
      clonedResult = resolver._cloneResult(result)
      clonedResult.accumulator = 120
    })

    it('should return cloned result', () => {
      result.accumulator.should.not.equal(120)
      clonedResult.accumulator.should.equal(120)
    })
  })

  describe('_appendElement', () => {
    let resolver
    let result
    let appendedResult

    beforeEach(() => {
      resolver = new DynamicOptimize('control', 'target', true)
      resolver.collection = [
        {control: 2, target: 1},
        {control: 4, target: 2},
        {control: 6, target: 3}
      ]
      result = resolver._buildResult()
      appendedResult = resolver._appendElement(result, {
        control: 8,
        target: 4
      })
    })

    it('should return cloned result', () => {
      appendedResult.collection.pop().should.deep.equal({
        control: 8,
        target: 4
      })
      appendedResult.accumulator.should.equal(10)
    })
  })

  describe('_cutOffIndex', () => {
    let resolver

    beforeEach(() => {
      resolver = new DynamicOptimize('control', 'target', true)
      resolver.collection = [
        {control: 5, target: 1},
        {control: 15, target: 1},
        {control: 50, target: 10},
        {control: 40, target: 9},
        {control: 200, target: 50}
      ]
    })

    it('should return correct index of cut off', () => {
      resolver._cutOffIndex(150).should.equal(3)
    })
    it('should return an index higher if same control value exists', () => {
      resolver._cutOffIndex(15).should.equal(1)
    })
    it('should return largest index if the value is greater than max', () => {
      resolver._cutOffIndex(300).should.equal(4)
    })
    it('should return -1 if the value is smaller than min', () => {
      resolver._cutOffIndex(0).should.equal(-1)
    })
  })

  describe('optimize', () => {
    describe('when allowing repeats', () => {

      let resolver
      const sample = [
        {min: 5, max: 1},
        {min: 15, max: 1},
        {min: 50, max: 10},
        {min: 40, max: 9},
        {min: 200, max: 50}
      ]

      beforeEach(() => {
        resolver = new DynamicOptimize('min', 'max',
                                  true,
                                  _.sortedIndex,
                                  _.sortBy,
                                  true)
      })

      describe('using recursive solution', () => {
        it('should return correct for sample #1', () => {
          const result = resolver.optimize(sample, 150, SimpleMemoize)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(150)
          max.should.be.equal(33)
        })

        it('should return correct for sample #2', () => {
          const result = resolver.optimize(sample, 160, SimpleMemoize)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(160)
          max.should.be.equal(36)
        })

        it('should return correct for sample #3', () => {
          const result = resolver.optimize(sample, 170, SimpleMemoize)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(170)
          max.should.be.equal(38)
        })

        it('should return correct for sample #4', () => {
          const result = resolver.optimize(sample, 200, SimpleMemoize)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(200)
          max.should.be.equal(50)
        })
      })

      describe('using iterative solution', () => {
        it('should return correct for sample #1', () => {
          const result = resolver.optimize(sample, 150)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(150)
          max.should.be.equal(33)
        })

        it('should return correct for sample #2', () => {
          const result = resolver.optimize(sample, 160)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(160)
          max.should.be.equal(36)
        })

        it('should return correct for sample #3', () => {
          const result = resolver.optimize(sample, 170)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(170)
          max.should.be.equal(38)
        })

        it('should return correct for sample #4', () => {
          const result = resolver.optimize(sample, 200)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(200)
          max.should.be.equal(50)
        })
      })
    })
    describe('when not allowing repeats', () => {
      let resolver
      const sample = [
        {min: 5, max: 1},
        {min: 15, max: 1},
        {min: 50, max: 10},
        {min: 40, max: 9},
        {min: 200, max: 50}
      ]

      beforeEach(() => {
        resolver = new DynamicOptimize('min', 'max',
                                   false,
                                   _.sortedIndex,
                                   _.sortBy,
                                   true)
      })

      describe('using recursive solution', () => {
        it('should return correct for sample #1', () => {
          const result = resolver.optimize(sample, 150, SimpleMemoize)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(150)
          max.should.be.equal(21)
        })

        it('should return correct for sample #2', () => {
          const result = resolver.optimize(sample, 160, SimpleMemoize)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(160)
          max.should.be.equal(21)
        })

        it('should return correct for sample #3', () => {
          const result = resolver.optimize(sample, 170, SimpleMemoize)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(170)
          max.should.be.equal(21)
        })

        it('should return correct for sample #4', () => {
          const result = resolver.optimize(sample, 200, SimpleMemoize)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(200)
          max.should.be.equal(50)
        })
      })

      describe('using iterative solution', () => {
        it('should return correct for sample #1', () => {
          const result = resolver.optimize(sample, 150)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(150)
          max.should.be.equal(21)
        })

        it('should return correct for sample #2', () => {
          const result = resolver.optimize(sample, 160)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(160)
          max.should.be.equal(21)
        })

        it('should return correct for sample #3', () => {
          const result = resolver.optimize(sample, 170)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(170)
          max.should.be.equal(21)
        })

        it('should return correct for sample #4', () => {
          const result = resolver.optimize(sample, 200)
          result.should.not.be.null

          const min = result.reduce((p, c) => p + c.min, 0)
          const max = result.reduce((p, c) => p + c.max, 0)

          min.should.be.at.most(200)
          max.should.be.equal(50)
        })
      })
    })
  })
})
