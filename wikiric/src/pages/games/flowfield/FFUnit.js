/*
 * Copyright (c) 2024.
 * Module FFUnit.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

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
   * @param {String} visualType
   */
  constructor (x, y, speed, id, dmg, hp, xp, visualType) {
    this.id = id
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
    this.maxSpeed = speed + Math.random()
    /**
     * This FF Unit's State
     * @type {Number}
     */
    this.state = 0
    /**
     * This FF Unit's Animation State
     * @type {Number}
     */
    this.animState = 0
    /**
     * This FF Unit's Animation Frame count. Basically determines the
     * amount of frames left to display the current animation state
     * @type {Number}
     */
    this.animFrames = 0
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
    this.visualType = visualType
  }
}

export default FFUnit
