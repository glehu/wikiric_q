/*
 * Copyright (c) 2024.
 * Module FFItemEffect.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

/**
 * @param {String} type
 * @param {Number} value
 * @param {Number} valueLevelBonus
 * @param {Number} hitCount
 * @param {Boolean} floorValueOnProc
 * @param {Boolean} autoLevelUp
 */
class FFItemEffect {
  /**
   * @param {String} type
   * @param {Number} value
   * @param {Number} valueLevelBonus
   * @param {Number} hitCount
   * @param {Boolean} floorValueOnProc
   * @param {Boolean} autoLevelUp
   */
  constructor (type,
               value,
               valueLevelBonus,
               hitCount,
               floorValueOnProc,
               autoLevelUp) {
    this.onHit = hitCount > 0
    this.type = type
    this.value = value
    this.valueLevelBonus = valueLevelBonus
    this.hitCount = hitCount
    this.floorValueOnProc = floorValueOnProc
    this.autoLevelUp = autoLevelUp
    this._hitCount = hitCount
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

export default FFItemEffect
