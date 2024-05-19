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
   */
  constructor (x, y, speed) {
    /**
     * This FF Unit's Position
     * @type {THREE.Vector2}
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
  }
}

export default FFUnit
