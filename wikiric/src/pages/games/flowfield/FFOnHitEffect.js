class FFOnHitEffect {
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {String} type
   * @param {any} content
   * @param {Number} ttl
   */
  constructor (x, y, type, content, ttl) {
    this.x = x
    this.y = y
    this.type = type
    this.content = content
    this.ttl = ttl
  }

  tick () {
    this.ttl -= 1
    if (this.type === 'text') {
      this.y -= 0.001
    }
    return this.ttl >= 0
  }
}

export default FFOnHitEffect
