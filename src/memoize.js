export class SimpleMemoize {
  constructor(a, b, debug = false) {
    this.store = {}
    this.queue = [[a, b]]
    this.initial = [a, b]
    this.debug = debug
  }

  get tasks() {
    return this.queue.length
  }

  _hasher(a, b) {
    // http://szudzik.com/ElegantPairing.pdf
    if(a < 0) return -1
    return a >= b ? a * a + a + b : a + b * b
  }

  exists(a, b) {
    return this.retrieve(a, b) !== undefined
  }

  retrieve(a, b) {
    return this.store[this._hasher(a, b)]
  }

  update(a, b, value) {
    this.store[this._hasher(a, b)] = value
    return true
  }

  schedule(a, b) {
    this.queue.unshift([a,b])
    return false
  }

  process(task, context = null) {
    while(this.queue.length !== 0) {
      if(this.debug && this.queue.length > 50000) {
        console.log('SimpleMemoize has exceeded allowed queue length, task process probably entered an infinite loop.')
        console.log('Printing some debug information and killing process step.')

        console.log('Top of the queue:')
        this.queue.slice(0, 5).forEach((val) => console.log(val))
        console.log('Bottom of the queue:')
        this.queue.slice(-5).forEach((val) => console.log(val))

        return null
      }
      const params = this.queue.shift()

      if(this.exists.apply(this, params)) continue
      if(!task.apply(context, params)) this.queue.push(params)
    }

    return this.retrieve.apply(this, this.initial)
  }
}

export default SimpleMemoize
