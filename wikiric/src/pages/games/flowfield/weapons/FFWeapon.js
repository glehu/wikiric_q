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

const VisualTypes = {
  Bullet: 0,
  Fire: 1,
  Electricity: 2
}

const DebuffTypes = {
  Slow: 0,
  Stun: 1
}

const TrajectoryTypes = {
  Projectile: 0,
  Stream: 1,
  Circle: 2
}

/**
 * DamageCalc carries all values to be carried over to an FFProjectile
 */
class DamageCalc {
  /**
   * DamageCalc carries all values to be carried over to an FFProjectile
   */
  constructor () {
    this.visual = VisualTypes.Bullet
    this.trajectory = TrajectoryTypes.Projectile
    this.dmg = 0
    this.amt = 0
    this.speed = 0
    this.hits = 0
    this.hitRange = 0
    this.radius = 0
    this.ratio = 0
    this.cd = 0
    this.ttl = 0
    this.hadSpeed = false
    /**
     * @type {FFPowerUpEffect[] || null}
     */
    this.debuffs = null
    this.chain = 0
    this.backfire = 0
    this.split = 0
  }

  useEffects (effects) {
    if (effects.length < 1) {
      return
    }
    let ratioMul = 0
    for (const effect of effects) {
      switch (effect.type) {
        case 'dmg':
          this.dmg += effect.value
          break
        case 'amt':
          this.amt += effect.value
          break
        case 'speed':
          this.speed += effect.value
          break
        case 'hitCount':
          this.hits += effect.value
          break
        case 'hitRange':
          this.hitRange += effect.value
          break
        case 'radius':
          this.radius += effect.value
          break
        case 'cd':
          if (effect.onHit) {
            this._cd += effect.value
          } else {
            this.cd += effect.value
          }
          break
        case 'ratio':
          ratioMul += effect.value
          break
        case 'ttl':
          this.ttl += effect.value
          break
        case 'chain':
          this.chain += effect.value
          break
        case 'backfire':
          this.backfire += effect.value
          break
        case 'split':
          this.split += effect.value
          break
        case 'visual':
          switch (effect.value) {
            case VisualTypes.Bullet:
              this.visualType = 'bullet'
              break
            case VisualTypes.Fire:
              this.visualType = 'fire'
              break
            case VisualTypes.Electricity:
              this.visualType = 'spark'
              break
          }
          break
        case 'trajectory':
          switch (effect.value) {
            case TrajectoryTypes.Stream:
              this.trajectory = TrajectoryTypes.Stream
              break
            case TrajectoryTypes.Circle:
              this.trajectory = TrajectoryTypes.Circle
              break
          }
          break
        case 'debuff':
          if (!this.debuffs) {
            this.debuffs = []
          }
          switch (effect.value) {
            case DebuffTypes.Slow:
              this.debuffs.push(effect)
              break
            case DebuffTypes.Stun:
              this.debuffs.push(effect)
              break
          }
      }
    }
    if (ratioMul !== 0) {
      // E.g.: Ratio 1 with RatioMul 0.5 = 1 + (1 * 0.5) = 1.5
      this.ratio += this.ratio * ratioMul
    }
  }

  preChecks () {
    this.hadSpeed = (this.speed > 0)
  }

  sanitize () {
    if (this.dmg < 1) {
      this.dmg = 1
    }
    if (this.speed <= 0) {
      if (this.hadSpeed) {
        this.speed = 1
      } else {
        this.speed = 0
      }
    }
    if (this.hits < 1) {
      this.hits = 1
    }
    if (this.hitRange < 0.2) {
      this.hitRange = 0.2
    }
    if (this.radius < 0) {
      this.radius = 0
    }
    if (this.ratio < 0.1) {
      this.ratio = 0.1
    }
  }

  scale () {
    this.dmg = this.dmg * this.ratio
  }
}

/**
 * An FF Weapon
 * @param {String} name
 * @param {String} desc
 * @param {Number} range
 * @param {Number} dps
 * @param {Number} dpsLevelUp
 * @param {Number} ratio
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
 * @param {Number} cost
 * @param {Number} chance
 */
class FFWeapon {
  /**
   * An FF Weapon's Constructor
   * @param {String} name
   * @param {String} desc
   * @param {Number} range
   * @param {Number} dps
   * @param {Number} dpsLevelUp
   * @param {Number} ratio
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
   * @param {Number} cost
   * @param {Number} chance
   */
  constructor (name,
               desc,
               range,
               dps,
               dpsLevelUp,
               ratio,
               amount,
               cooldown,
               cooldownLevelUp,
               projectileSpeed,
               hitCount,
               hitCountLevelUp,
               hitRange,
               hitRangeLevelUp,
               visualType,
               ttl,
               cost,
               chance) {
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
    this._cdOri = cooldown
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
    this.cost = cost
    /**
     * The chance of this weapon appearing in offers.
     *
     * A chance of 50 would mean that 50% of the offers will
     * ...include the weapon.
     * A chance of 20 would mean that 20% of offers will
     * ...include the weapon.
     *
     * Calculation Examples:
     *
     * (1)
     *    * rand   = Math.rand()  * 100 +  1 = 23
     *    * chance = 50
     *    * offer  = rnd > chance =  23 <= 50 = true
     *
     * (2)
     *    * rand   = Math.rand()  * 100 +  1 = 47
     *    * chance = 20
     *    * offer  = rnd > chance =  47 <= 20 = false
     *
     * Lowest chance is 1 as the lowest number generated will be 1.
     * @type {Number}
     */
    this.chance = chance
    this.ratio = ratio
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
      if (override) {
        this._cd -= override
      } else {
        this._cd -= 1
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
   * @param {Number} [extraDmg=0]
   * @return {FFProjectile[] || null}
   */
  shoot (pos, vec, dist, extraDmg = 0) {
    if (this._cd > 0) {
      return null
    }
    if (dist > this.range) {
      return null
    }
    // Initialize projectile values
    const dmgCalc = new DamageCalc()
    dmgCalc.dmg = this.dps
    dmgCalc.amt = 1
    dmgCalc.speed = this.pSpeed
    dmgCalc.hits = this.pHitCount
    dmgCalc.hitRange = this.hitRange
    dmgCalc.ratio = this.ratio
    dmgCalc.cd = this.cd
    dmgCalc.ttl = this.ttl
    dmgCalc.visualType = this.visualType
    // We have to remember if the weapon originally had projectile speed
    // ...since we might reduce it to 0 or less.
    // When sanitizing, we have to avoid setting the minimum speed to
    // ...weapons that originally did not have a projectile speed.
    dmgCalc.preChecks()
    // Trigger weapon effects
    const effects = this.procEffects()
    dmgCalc.useEffects(effects)
    this._cd += dmgCalc._cd
    // More damage!
    if (extraDmg && extraDmg !== 0) {
      dmgCalc.dmg += extraDmg
    }
    dmgCalc.sanitize()
    dmgCalc.scale()
    this._cdOri = dmgCalc.cd
    if (this._cdOri < 10) {
      this._cdOri = 10
    }
    // Create projectiles
    this._amount -= 1
    if (this._amount === 0) {
      // Set weapon on cooldown if amount has reached zero
      this._cd = this._cdOri
    }
    /**
     * @type {FFProjectile[]}
     */
    const projectiles = []
    let pr
    for (let i = 1; i <= dmgCalc.amt; i++) {
      // Create projectile with provided vectors
      if (i > 4) {
        dmgCalc.ttl -= 10
        if (dmgCalc.ttl < 0) {
          dmgCalc.ttl = 10
        }
      }
      pr = this.doShootProjectile(pos, vec, i, dmgCalc)
      // Modify projectile before sending it back
      if (dmgCalc.debuffs) {
        pr.effects = dmgCalc.debuffs
      }
      if (dmgCalc.split !== 0) {
        pr.split = dmgCalc.split
      }
      if (dmgCalc.chain !== 0) {
        pr.chain = dmgCalc.chain
      }
      projectiles.push(pr)
      let cl
      if (dmgCalc.backfire > 0) {
        for (let j = 0; j < dmgCalc.backfire; j++) {
          cl = pr.clone()
          cl.dmg = cl.dmg / 2
          cl.vec.multiplyScalar(-1)
          projectiles.push(cl)
        }
      }
    }
    return projectiles
  }

  /**
   * Create and returns a new FF Projectile
   * @param {THREE.Vector2} pos
   * @param {THREE.Vector2} vec
   * @param {Number} iteration
   * @param {DamageCalc} dmgCalc
   * @return {FFProjectile}
   */
  doShootProjectile (pos,
                     vec,
                     iteration,
                     dmgCalc) {
    // Calculate projectile vector
    const vector = new THREE.Vector2(vec.x, vec.y)
    if (dmgCalc.speed > 0) {
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
    vector.multiplyScalar(dmgCalc.speed)
    if (dmgCalc.trajectory === TrajectoryTypes.Stream && iteration > 4) {
      // The first 4 projectiles will move with their original speed
      // If more projectiles are being fired, we will introduce
      // ...some fluctuation in speed to make things interesting!
      vector.multiplyScalar(Math.max(0.2, Math.random()))
    }
    // Return projectile
    return new FFProjectile(pos, vector,
      dmgCalc.hits,
      dmgCalc.dmg,
      dmgCalc.hitRange,
      dmgCalc.radius,
      dmgCalc.visualType,
      dmgCalc.ttl)
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
      effects = effects.concat(power.proc(false))
    }
    return effects
  }

  /**
   * Calculates the theoretical damage of this weapon.
   * @param {Map||null} [playerStats=null]
   * @return {Number}
   */
  getCalculatedDamage (playerStats = null) {
    if (this.powerUps.length < 1) {
      return this.dps
    }
    /**
     * @type {FFPowerUpEffect[]}
     */
    let effects = []
    for (const power of this.powerUps) {
      effects = effects.concat(power.proc(true))
    }
    if (effects.length < 1) {
      return this.dps
    }
    let dmg = this.dps
    let amt = 1
    let ratio = this.ratio
    let tmp = 0
    let ratioMul = 0
    if (playerStats != null) {
      if (playerStats.has('dmg')) {
        dmg += playerStats.get('dmg')
      }
    }
    for (const effect of effects) {
      if (effect.onHit && effect.hitCount > 1) {
        tmp = effect.value / effect.hitCount
      } else {
        tmp = effect.value
      }
      switch (effect.type) {
        case 'dmg':
          dmg += tmp
          break
        case 'amt':
          amt += tmp
          break
        case 'ratio':
          ratioMul += tmp
          break
      }
    }
    if (ratioMul !== 0) {
      ratio += ratio * ratioMul
    }
    // Apply scaling
    dmg = (dmg * ratio) * amt
    return dmg
  }

  /**
   *
   * @param {Number} baseStat
   * @param {String} statType
   * @return {Number}
   */
  getCalculatedStat (baseStat, statType) {
    if (this.powerUps.length < 1) {
      return baseStat
    }
    /**
     * @type {FFPowerUpEffect[]}
     */
    let effects = []
    for (const power of this.powerUps) {
      effects = effects.concat(power.proc(true))
    }
    if (effects.length < 1) {
      return baseStat
    }
    let calculated = baseStat
    let mul = 0
    let tmp = 0
    for (const effect of effects) {
      if (effect.type !== statType) {
        continue
      }
      if (effect.onHit && effect.hitCount > 1) {
        tmp = effect.value / effect.hitCount
      } else {
        tmp = effect.value
      }
      calculated += tmp
      mul += tmp
    }
    if (mul !== 0 && statType === 'ratio') {
      calculated = baseStat + (baseStat * mul)
    }
    return calculated
  }

  /**
   * Checks if this weapon can be offered (using its chance)
   * @return {boolean}
   */
  canOffer () {
    if (this.chance >= 99) {
      return true
    }
    const rand = Math.random() * 100 + 1
    return (rand <= this.chance)
  }

  /**
   * Checks if the weapon supports the provided FFPowerUp
   * @param {FFPowerUp} powerUp
   */
  canReceivePowerUp (powerUp) {
    if (this.pSpeed <= 0) {
      // We cannot accept speed upgrades if the weapon has no projectile speed
      // ...e.g. melee or fixed range beam type weapons
      for (let i = 0; i < powerUp.effects.length; i++) {
        if (powerUp.effects[i].type === 'speed') {
          return false
        }
      }
    }
    return true
  }
}

export default FFWeapon
