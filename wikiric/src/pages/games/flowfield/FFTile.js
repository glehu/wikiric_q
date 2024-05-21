import * as THREE from 'threejs-math'

class FFTile {
  constructor (x, y, xNew, yNew, name) {
    /**
     * This FF Tile's Position
     * @type {THREE.Vector2}¥
     */
    this.pos = new THREE.Vector2(x, y)
    /**
     * This FF Tile's Visual Position
     * @type {THREE.Vector2}¥
     */
    this.posVisual = new THREE.Vector2(xNew, yNew)
    /**
     * This FF Tile's name (e.g. wall_bottom_left)
     */
    this.name = name
  }
}

export default FFTile
