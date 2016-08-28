import { _ } from 'underscore'

export class DynamicOptimize {
  constructor(minControl, maxTarget,
              allowRepeats = true,
              findIndex = _.sortedIndex,
              sortIndex = _.sortBy,
              debug = false) {
    this.control = minControl
    this.response = maxTarget
    this.allowRepeats = allowRepeats
    this.findIndex = findIndex
    this.sortIndex = sortIndex
    this.debug = debug
  }

  optimize(input, target, memoize = false) {
    this.collection = input

    if(memoize === false) {
      var result = this._reduceRecursively(target, this.collection.length-1)
      return result.collection
    } else {
      const resolver = this
      const store = new memoize(target, this.collection.length, this.debug)

      return store.process((target, maxIndex) => {
        return resolver._reduceIteratively(target, maxIndex, store)
      }).collection
    }
  }

  get collection() {
    return this.sortedCollection
  }

  set collection(newCollection) {
    this.sortedCollection = this.sortIndex(newCollection, this.control)
  }

  _buildResult(cutOffIndex = this.collection.length-1) {
    const collection = this.collection.slice(0, cutOffIndex+1)
    const resolver = this
    return {
      collection,
      accumulator: collection.reduce((p, c) => p + c[resolver.response], 0)
    }
  }

  _cloneResult(result) {
    return {
      collection: result.collection.slice(),
      accumulator: result.accumulator
    }
  }

  _appendElement(result, element) {
    var result = this._cloneResult(result)
    result.collection.push(element)
    result.accumulator += element[this.response]
    return result
  }

  _cutOffIndex(target, maxIndex = this.collection.length-1) {
    var sort = {}
    sort[this.control] = target

    var cutOffIndex = this.findIndex(this.collection, sort, this.control)-1

    if(cutOffIndex < this.collection.length-1 &&
       this.collection[cutOffIndex+1][this.control] === target) cutOffIndex++

    return Math.min(cutOffIndex, maxIndex)
  }

  _reduceRecursively(target, maxIndex = this.collection.length) {
    var cutOffIndex = this._cutOffIndex(target, maxIndex)
    if(cutOffIndex < 0) return this._buildResult(-1)

    var lastElement = this.collection[cutOffIndex]

    var prevResult = this._reduceRecursively(target, cutOffIndex-1)
    var currResult =  this._reduceRecursively(target - lastElement[this.control],
                                              this.allowRepeats ? cutOffIndex : cutOffIndex-1)
    currResult = this._appendElement(currResult, lastElement)

    if(currResult.accumulator > prevResult.accumulator) return currResult
    else return prevResult
  }

  _reduceIteratively(target, maxIndex, memoize) {
    var cutOffIndex = this._cutOffIndex(target, maxIndex)
    if(cutOffIndex < 0) {
      return memoize.update(target, maxIndex, this._buildResult(-1))
    }

    var lastElement = this.collection[cutOffIndex]

    if(!memoize.exists(target, cutOffIndex-1))
      return memoize.schedule(target, cutOffIndex-1)
    var prevResult = memoize.retrieve(target, cutOffIndex-1)
    var currentTarget = target-lastElement[this.control],
        currentIndex = this.allowRepeats ? cutOffIndex : cutOffIndex-1
    if(!memoize.exists(currentTarget, currentIndex))
      return memoize.schedule(currentTarget, currentIndex)
    var currResult = this._cloneResult(
      memoize.retrieve(currentTarget,
                       currentIndex)
    )
    currResult = this._appendElement(currResult, lastElement)

    var finalResult =
      currResult.accumulator > prevResult.accumulator ? currResult : prevResult

    return memoize.update(target, maxIndex, finalResult)
  }
}

export default DynamicOptimize
