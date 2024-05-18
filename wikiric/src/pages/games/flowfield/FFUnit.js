import * as THREE from 'threejs-math'

class FFUnit {
  constructor (x, y) {
    this.pos = new THREE.Vector2(x, y)
    this.newPos = new THREE.Vector2(x, y)
  }
}

export default FFUnit
