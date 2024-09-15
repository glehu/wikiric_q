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
   */
  constructor (pos,
               vec,
               hitCount,
               dmg,
               hitRange,
               radius) {
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
    this.hitRange = hitRange
    this.radius = radius
  }
}

export default FFProjectile
