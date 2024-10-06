/*
 * Copyright (c) 2024.
 * Module FFItem.js of wikiricQ or wikiric including wikiric and wikiricGo
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
 */
class FFItem {
  /**
   *
   * @param {Number} id
   * @param {Number} level
   * @param {String} name
   * @param {String} desc
   */
  constructor (id, level, name, desc) {
    this.id = id
    this.level = level
    this.name = name
    this.desc = desc
    /**
     *
     * @type {FFItemEffect[]}
     */
    this.effects = []
  }

  /**
   * Procs (activates) all available item effects and adds their effect to the stats map
   * @param {Map} playerStats
   */
  proc (playerStats) {
    if (this.effects.length < 1) {
      return playerStats
    }
    let copy
    let tmp
    for (const effect of this.effects) {
      if (effect.proc()) {
        if (effect.floorValueOnProc) {
          // Shallow copy and floor value
          copy = { ...effect }
          copy.value = Math.floor(copy.value)
          if (playerStats.has(copy.type)) {
            tmp = playerStats.get(copy.type)
            tmp += copy.value
            playerStats.set(copy.type, tmp)
          } else {
            playerStats.set(copy.type, copy.value)
          }
        } else {
          if (playerStats.has(effect.type)) {
            tmp = playerStats.get(effect.type)
            tmp += effect.value
            playerStats.set(effect.type, tmp)
          } else {
            playerStats.set(effect.type, effect.value)
          }
        }
      }
    }
    return playerStats
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
}

export default FFItem
