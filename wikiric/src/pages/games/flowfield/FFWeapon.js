import * as THREE from 'threejs-math'
import FFProjectile from 'pages/games/flowfield/FFProjectile'

/**
 * An FF Weapon
 */
class FFWeapon {
  /**
   * An FF Weapon's Constructor
   * @param {Number} range
   * @param {Number} dps
   * @param {Number} amount
   * @param {Number} cooldown
   * @param {Number} projectileSpeed
   * @param {Number} hitCount
   */
  constructor (range, dps, amount, cooldown, projectileSpeed, hitCount) {
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
    /**
     * This FF Weapon's PowerUps
     * PowerUps increase a weapon's power! Wow!
     * @type {FFPowerUp[]}
     */
    this.powerUps = []
  }

  /**
   * This function is to be called on every tick/frame.
   *
   * Returns `true` if the weapon is ready, `false` if not.
   *
   * @return {Boolean}
   */
  processTick () {
    // Do we need to reduce weapon cooldown?
    if (this._cd > 0) {
      this._cd -= 1
      // Reset amount if we are done waiting
      if (this._cd === 0) {
        this._amount = this.amount
      }
      return false
    }
    return true
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
          case 'hits':
            hits += effect.value
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
      projectiles.push(this.doShootProjectile(pos, vec, dmg, speed, hits, i))
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
   * @return {FFProjectile}
   */
  doShootProjectile (pos, vec, dmg, speed, hits, iteration) {
    // Calculate projectile vector
    const vector = new THREE.Vector2(vec.x, vec.y)
    if (vector.lengthSq() === 0) {
      vector.x = Math.random() - 0.5
      vector.y = Math.random() - 0.5
    }
    vector.normalize()
    vector.multiplyScalar(speed)
    vector.clampScalar(-speed, speed)
    // Add random vector to simulate some spray effect
    const spray = new THREE.Vector2()
    spray.x = Math.random() - 0.5
    spray.y = Math.random() - 0.5
    spray.normalize()
    const limit = 0.75 * iteration
    spray.multiplyScalar(limit)
    vector.add(spray)
    // Return projectile
    return new FFProjectile(pos, vector, hits, dmg)
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
