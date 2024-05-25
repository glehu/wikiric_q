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
   * @return {FFProjectile || null}
   */
  shoot (pos, vec, dist) {
    if (this._cd > 0) {
      return null
    }
    if (dist > this.range) {
      return null
    }
    // Shoot projectile
    this._amount -= 1
    if (this._amount === 0) {
      // Set weapon on cooldown if amount has reached zero
      this._cd = this.cd
    }
    return this.doShootProjectile(pos, vec)
  }

  /**
   * Create and returns a new FF Projectile
   * @param {THREE.Vector2} pos
   * @param {THREE.Vector2} vec
   * @return {FFProjectile}
   */
  doShootProjectile (pos, vec) {
    const vector = new THREE.Vector2(vec.x, vec.y)
    if (vector.lengthSq() === 0) {
      vector.x = Math.random()
      vector.y = Math.random()
    }
    vector.normalize()
    vector.multiplyScalar(this.pSpeed)
    vector.clampScalar(-this.pSpeed, this.pSpeed)
    return new FFProjectile(pos, vector, this.pHitCount, this.dps)
  }
}

export default FFWeapon
