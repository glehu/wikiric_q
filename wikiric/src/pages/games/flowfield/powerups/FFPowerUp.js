/*
 * Copyright (c) 2024.
 * Module FFPowerUp.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

/**
 *
 * @param {Number} id
 * @param {Number} level
 * @param {String} name
 * @param {String} desc
 * @param {Number} chance
 */
class FFPowerUp {
  /**
   *
   * @param {Number} id
   * @param {Number} level
   * @param {String} name
   * @param {String} desc
   * @param {Number} chance
   */
  constructor (id, level, name, desc, chance) {
    this.id = id
    this.level = level
    this.name = name
    this.desc = desc
    /**
     *
     * @type {FFPowerUpEffect[]}
     */
    this.effects = []
    this.chance = chance
  }

  /**
   * Procs (activates) all available effects and returns them.
   * Optionally, effects can be proc'd ignoring cooldown etc.
   * when providing force=true
   * @param {Boolean} [force=false]
   * @return {FFPowerUpEffect[]}
   */
  proc (force = false) {
    if (this.effects.length < 1) {
      return []
    }
    /**
     * @type {FFPowerUpEffect[]}
     */
    const procs = []
    let copy
    for (const effect of this.effects) {
      if (force || effect.proc()) {
        if (effect.floorValueOnProc) {
          // Shallow copy and floor value
          copy = { ...effect }
          copy.value = Math.floor(copy.value)
          procs.push(copy)
        } else {
          procs.push(effect)
        }
      }
    }
    return procs
  }

  /**
   * This function is to be called upon player level up
   */
  autoLevelUp () {
    this.level += 1
    if (this.effects.length < 1) {
      return
    }
    for (const effect of this.effects) {
      if (effect.autoLevelUp) {
        effect.levelUp()
      }
    }
  }

  canOffer () {
    if (this.chance >= 99) {
      return true
    }
    const rand = Math.random() * 100 + 1
    return (rand <= this.chance)
  }
}

export default FFPowerUp
