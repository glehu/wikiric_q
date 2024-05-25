import * as THREE from 'threejs-math'

/**
 * An FF Weapon's Projectile
 */
class FFProjectile {
  /**
   * An FF Projectile's Constructor
   * @param {THREE.Vector2} pos
   * @param {THREE.Vector2} vec
   * @param {Number} hitCount
   * @param {Number} dmg
   */
  constructor (pos, vec, hitCount, dmg) {
    /**
     * This FF Projectile's Position
     * @type {THREE.Vector2}
     */
    this.pos = new THREE.Vector2(pos.x, pos.y)
    /**
     * This FF Projectile's Movement Vector
     * @type {THREE.Vector2}
     */
    this.vec = new THREE.Vector2(vec.x, vec.y)
    /**
     * This FF Projectile's Hit Count
     * @type {Number}
     */
    this.hitCount = hitCount
    /**
     * This FF Projectile's Damage
     * @type {Number}
     */
    this.dmg = dmg
  }
}

export default FFProjectile
