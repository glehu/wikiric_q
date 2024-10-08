/*
 * Copyright (c) 2024.
 * Module FFWeapon.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import * as THREE from 'threejs-math'
import FFProjectile from 'pages/games/flowfield/weapons/FFProjectile'

/**
 * An FF Weapon
 * @param {String} name
 * @param {String} desc
 * @param {Number} range
 * @param {Number} dps
 * @param {Number} dpsLevelUp
 * @param {Number} amount
 * @param {Number} cooldown
 * @param {Number} cooldownLevelUp
 * @param {Number} projectileSpeed
 * @param {Number} hitCount
 * @param {Number} hitCountLevelUp
 * @param {Number} hitRange
 * @param {Number} hitRangeLevelUp
 * @param {String} visualType
 * @param {Number} ttl
 */
class FFWeapon {
  /**
   * An FF Weapon's Constructor
   * @param {String} name
   * @param {String} desc
   * @param {Number} range
   * @param {Number} dps
   * @param {Number} dpsLevelUp
   * @param {Number} amount
   * @param {Number} cooldown
   * @param {Number} cooldownLevelUp
   * @param {Number} projectileSpeed
   * @param {Number} hitCount
   * @param {Number} hitCountLevelUp
   * @param {Number} hitRange
   * @param {Number} hitRangeLevelUp
   * @param {String} visualType
   * @param {Number} ttl
   */
  constructor (name,
               desc,
               range,
               dps,
               dpsLevelUp,
               amount,
               cooldown,
               cooldownLevelUp,
               projectileSpeed,
               hitCount,
               hitCountLevelUp,
               hitRange,
               hitRangeLevelUp,
               visualType,
               ttl) {
    this.level = 1
    /**
     * This FF Weapon's Name
     * @type {String}
     */
    this.name = name
    /**
     * This FF Weapon's Description
     * @type {String}
     */
    this.desc = desc
    /**
     * This FF Weapon's Range
     * @type {Number}
     */
    this.range = range
    /**
     * This FF Weapon's Damage per Second
     * @type {Number}
     */
    this.dps = dps
    this.dpsLevelUp = dpsLevelUp
    /**
     * This FF Weapon's Amount of Projectiles
     * @type {Number}
     */
    this.amount = amount
    this._amount = amount
    /**
     * This FF Weapon's Cooldown
     * @type {Number}
     */
    this.cd = cooldown
    this.cdLevelUp = cooldownLevelUp
    this._cd = 0
    /**
     * This FF Weapon Projectile's Speed
     * Beam-type weapons with no delay will have a
     * speed of 0, since it will take no time to hit
     * @type {Number}
     */
    this.pSpeed = projectileSpeed
    /**
     * This FF Weapon Projectile's Hit Count
     * (The amount of hits before the projectile expires)
     * @type {Number}
     */
    this.pHitCount = hitCount
    this.pHitCountLevelUp = hitCountLevelUp
    /**
     * This FF Weapon's PowerUps
     * PowerUps increase a weapon's power! Wow!
     * @type {FFPowerUp[]}
     */
    this.powerUps = []
    /**
     * This FF Weapon's Hit Range
     * @type {Number}
     */
    this.hitRange = hitRange
    this.hitRangeLevelUp = hitRangeLevelUp
    this.visualType = visualType
    this.ttl = ttl
  }

  /**
   * This function is to be called on every tick/frame.
   *
   * Returns `true` if the weapon is ready, `false` if not.
   *
   * @param {Number} [override]
   * @return {Boolean}
   */
  processTick (override) {
    // Do we need to reduce weapon cooldown?
    if (this._cd > 0) {
      if (!override) {
        this._cd -= 1
      } else {
        this._cd -= override
      }
      // Reset amount if we are done waiting
      if (this._cd <= 0) {
        this._amount = this.amount
      }
      return false
    }
    return true
  }

  /**
   * This function is to be called upon player level-up.
   */
  levelUp () {
    this.level += 1
    this.dps += this.dpsLevelUp
    this.cd -= this.cdLevelUp
    if (this.cd < 10) {
      this.cd = 10
    }
    this.pHitCount -= this.pHitCountLevelUp
    if (this.pHitCount < 1) {
      this.pHitCount = 1
    }
    this.hitRange += this.hitRangeLevelUp
    if (this.powerUps.length < 1) {
      return
    }
    for (const powerUp of this.powerUps) {
      powerUp.autoLevelUp()
    }
  }

  /**
   * This function is to be called for all enemies nearby.
   *
   * @param {THREE.Vector2} pos
   * @param {THREE.Vector2} vec
   * @param {Number} dist
   * @return {FFProjectile[] || null}
   */
  shoot (pos, vec, dist) {
    if (this._cd > 0) {
      return null
    }
    if (dist > this.range) {
      return null
    }
    this._amount -= 1
    if (this._amount === 0) {
      // Set weapon on cooldown if amount has reached zero
      this._cd = this.cd
    }
    // Initialize projectile values
    let dmg = this.dps
    let amt = 1
    let speed = this.pSpeed
    let hits = this.pHitCount
    let hitRange = this.hitRange
    let radius = 0
    // Trigger weapon effects
    const effects = this.procEffects()
    if (effects.length > 0) {
      for (const effect of effects) {
        switch (effect.type) {
          case 'dmg':
            dmg += effect.value
            break
          case 'amt':
            amt += effect.value
            break
          case 'speed':
            speed += effect.value
            break
          case 'hitCount':
            hits += effect.value
            break
          case 'hitRange':
            hitRange += effect.value
            break
          case 'radius':
            radius += effect.value
            break
        }
      }
    }
    // Create projectiles
    /**
     * @type {FFProjectile[]}
     */
    const projectiles = []
    for (let i = 1; i <= amt; i++) {
      projectiles.push(this.doShootProjectile(
        pos,
        vec,
        dmg,
        speed,
        hits,
        i,
        hitRange,
        radius))
    }
    return projectiles
  }

  /**
   * Create and returns a new FF Projectile
   * @param {THREE.Vector2} pos
   * @param {THREE.Vector2} vec
   * @param {Number} dmg
   * @param {Number} speed
   * @param {Number} hits
   * @param {Number} iteration
   * @param {Number} hitRange
   * @param {Number} radius
   * @return {FFProjectile}
   */
  doShootProjectile (pos,
                     vec,
                     dmg,
                     speed,
                     hits,
                     iteration,
                     hitRange,
                     radius) {
    // Calculate projectile vector
    const vector = new THREE.Vector2(vec.x, vec.y)
    if (speed > 0) {
      if (vector.lengthSq() === 0) {
        vector.x = Math.random() - 0.5
        vector.y = Math.random() - 0.5
      }
      // Add random vector to simulate some spray effect
      const spray = new THREE.Vector2()
      spray.x = Math.random() - 0.5
      spray.y = Math.random() - 0.5
      spray.normalize()
      if (iteration > 1) {
        const limit = Math.sin(iteration)
        spray.multiplyScalar(limit)
      } else {
        spray.multiplyScalar(0.2)
      }
      vector.add(spray)
    }
    vector.normalize()
    vector.multiplyScalar(speed)
    // Return projectile
    return new FFProjectile(
      pos,
      vector,
      hits,
      dmg,
      hitRange,
      radius,
      this.visualType,
      120)
  }

  /**
   * @return {FFPowerUpEffect[]}
   */
  procEffects () {
    if (this.powerUps.length < 1) {
      return []
    }
    /**
     * @type {FFPowerUpEffect[]}
     */
    let effects = []
    for (const power of this.powerUps) {
      effects = effects.concat(power.proc())
    }
    return effects
  }
}

export default FFWeapon
