/*
 * Copyright (c) 2024.
 * Module FFPowerUp.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import FFWeapon from 'pages/games/flowfield/weapons/FFWeapon'

/**
 *
 * @param {Number} id
 * @param {Number} level
 * @param {String} name
 * @param {String} desc
 * @param {Number} chance
 * @param {Boolean} [isAbility=false]
 * @param {Number} [cooldown=0]
 * @param {Number} [cooldownLevelUp=0]
 */
class FFPowerUp {
  /**
   *
   * @param {Number} id
   * @param {Number} level
   * @param {String} name
   * @param {String} desc
   * @param {Number} chance
   * @param {Boolean} [isAbility=false]
   * @param {Number} [cooldown=0]
   * @param {Number} [cooldownLevelUp=0]
   */
  constructor (id,
               level,
               name,
               desc,
               chance,
               isAbility = false,
               cooldown = 0,
               cooldownLevelUp = 0) {
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
    this.isAbility = isAbility
    /**
     * This FF PowerUp's Cooldown
     * @type {Number}
     */
    this.cd = cooldown
    this.cdLevelUp = cooldownLevelUp
    this._cd = 0
    // If we are creating an ability, we need a helper FFWeapon instance to shoot projectiles
    // The duplicate code warnings are getting out of control! #Recycle #DontCopy
    this.wpn = null
    if (isAbility) {
      this.checkHelper()
    }
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

  /**
   * This function is to be called on every tick/frame.
   *
   * Returns `true` if the PowerUp is ready, `false` if not.
   *
   * @param {Number} [override]
   * @return {Boolean}
   */
  processTick (override) {
    // Do we need to reduce power up cooldown?
    if (!this.isReady()) {
      if (override) {
        this._cd -= override
      } else {
        this._cd -= 1
      }
      return false
    }
    return true
  }

  isReady () {
    return this._cd <= 0
  }

  /**
   *
   * @param pos
   * @param vec
   * @return {FFProjectile[] || null}
   */
  activateAbility (pos, vec) {
    if (!this.isAbility || !this.isReady()) {
      return null
    }
    // Retrieve effects to put into our helper FFWeapon instance
    const effects = this.proc(true)
    // Put ability on cooldown
    this._cd = this.cd
    // Prepare weapon
    this.checkHelper()
    this.wpn.powerUps[0].effects = effects
    // Now that we're equipped, we can trigger the ability!
    // Dist is only used for range check, so we can ignore it
    this.wpn._cd = 0
    return this.wpn.shoot(pos, vec, -1)
  }

  checkHelper () {
    if (!this.wpn) {
      this.wpn = new FFWeapon('',
        '',
        999,
        0,
        0,
        1,
        1,
        0,
        0,
        10,
        0,
        0,
        1,
        0,
        '',
        400,
        0,
        0)
    }
    if (!this.wpn.powerUps || this.wpn.powerUps.length < 1) {
      if (!Array.isArray(this.wpn.powerUps)) {
        this.wpn.powerUps = []
      }
      const powerUp = new FFPowerUp(
        0,
        this.level,
        '',
        '',
        100)
      this.wpn.powerUps = [powerUp]
    }
  }
}

export default FFPowerUp
