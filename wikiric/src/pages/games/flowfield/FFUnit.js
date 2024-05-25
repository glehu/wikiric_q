import * as THREE from 'threejs-math'

/**
 * An FF Unit
 */
class FFUnit {
  /**
   * An FF Unit's Constructor
   * @param {Number} x
   * @param {Number} y
   * @param {Number} speed
   * @param id
   * @param {Number} dmg
   * @param {Number} hp
   * @param {Number} xp
   */
  constructor (x, y, speed, id, dmg, hp, xp) {
    this.id = id
    /**
     * This FF Unit's Position
     * @type {THREE.Vector2}¥
     */
    this.pos = new THREE.Vector2(x, y)
    /**
     * This FF Unit's Destination
     * @type {THREE.Vector2}
     */
    this.newPos = new THREE.Vector2(x, y)
    /**
     * This FF Unit's Maximum Speed
     * @type {Number}
     */
    this.maxSpeed = speed
    /**
     * This FF Unit's State
     * @type {Number}
     */
    this.state = 0
    /**
     * This FF Unit's Damage per Second
     * @type {Number}
     */
    this.dps = dmg
    /**
     * This FF Unit's Max Health
     * @type {Number}
     */
    this.maxHp = hp
    /**
     * This FF Unit's current Health
     * @type {Number}
     */
    this.hp = hp
    /**
     * This FF Unit's Experience Points upon death
     * @type {Number}
     */
    this.xp = xp
  }
}

export default FFUnit
