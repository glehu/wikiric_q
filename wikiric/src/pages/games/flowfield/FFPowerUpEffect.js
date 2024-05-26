class FFPowerUpEffect {
  /**
   * @param {Boolean} onHit
   * @param {String} type
   * @param {Number} value
   * @param {Number} valueLevelBonus
   * @param {Number} hitCount
   * @param {Boolean} floorValueOnProc
   * @param {Boolean} autoLevelUp
   */
  constructor (onHit,
               type,
               value,
               valueLevelBonus,
               hitCount,
               floorValueOnProc,
               autoLevelUp) {
    this.onHit = onHit
    this.type = type
    this.value = value
    this.valueLevelBonus = valueLevelBonus
    this.hitCount = hitCount
    this.floorValueOnProc = floorValueOnProc
    this.autoLevelUp = autoLevelUp
    this._hitCount = 0
  }

  proc () {
    // Return true if effect doesn't need hits
    if (!this.onHit || this.hitCount === 0) {
      return true
    }
    this._hitCount += 1
    // Did we reach the hit count yet?
    if (this._hitCount >= this.hitCount) {
      this._hitCount = 0
      return true
    }
    return false
  }

  levelUp () {
    this.value += this.valueLevelBonus
  }
}

export default FFPowerUpEffect
