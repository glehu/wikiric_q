/*
 * Copyright (c) 2024.
 * Module FFTile.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import * as THREE from 'threejs-math'

class FFTile {
  constructor (x, y, xNew, yNew, name) {
    /**
     * This FF Tile's Position
     * @type {THREE.Vector2}
     */
    this.pos = new THREE.Vector2(x, y)
    /**
     * This FF Tile's Visual Position
     * @type {THREE.Vector2}
     */
    this.posVisual = new THREE.Vector2(xNew, yNew)
    /**
     * This FF Tile's name (e.g. wall_bottom_left)
     */
    this.name = name
  }
}

export default FFTile
