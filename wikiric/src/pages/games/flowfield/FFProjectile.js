/*
 * Copyright (c) 2024.
 * Module FFProjectile.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

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
   * @param {Number} hitRange
   * @param {Number} radius
   * @param {String} visualType
   */
  constructor (pos,
               vec,
               hitCount,
               dmg,
               hitRange,
               radius,
               visualType) {
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
     * This FF Projectile's Hit Count determines how often
     * ...this projectile can hit before expiration
     * @type {Number}
     */
    this.hitCount = hitCount
    /**
     * This FF Projectile's Damage applied on hit
     * @type {Number}
     */
    this.dmg = dmg
    this.hitRange = hitRange
    /**
     * This FF Projectile's Radius determines the explosion radius
     * @type {Number}
     */
    this.radius = radius
    /**
     * This FF Projectile's Visual Type e.g. bullet or fire
     * @type {String}
     */
    this.visualType = visualType
  }
}

export default FFProjectile
