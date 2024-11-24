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
 * An FF Projectile
 * @param {THREE.Vector2} pos
 * @param {THREE.Vector2} vec
 * @param {Number} hitCount
 * @param {Number} dmg
 * @param {Number} hitRange
 * @param {Number} radius
 * @param {String} visualType
 * @param {Number} ttl
 * @param {FFPowerUpEffect[] || null} [effects=null]
 */
class FFProjectile {
  /**
   * An FF Projectile
   * @param {THREE.Vector2} pos
   * @param {THREE.Vector2} vec
   * @param {Number} hitCount
   * @param {Number} dmg
   * @param {Number} hitRange
   * @param {Number} radius
   * @param {String} visualType
   * @param {Number} ttl
   * @param {FFPowerUpEffect[] || null} [effects=null]
   */
  constructor (pos,
               vec,
               hitCount,
               dmg,
               hitRange,
               radius,
               visualType,
               ttl,
               effects = null) {
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
     * This FF Projectile's Visual Type e.g. bullet/fire/melee
     * @type {String}
     */
    this.visualType = visualType
    let hasExpiration = true
    // Set expiration if desired
    // Prevents projectiles of travelling too far (or too long)
    if (!ttl) {
      ttl = -1
      hasExpiration = false
    }
    this.ttl = ttl
    this.expires = hasExpiration
    /**
     * @type {FFPowerUpEffect[] || null}
     */
    this.effects = effects
    /**
     * This FFUnit's hit cache. Enemies cannot be hit twice!
     * For boomerang-like projectiles, the hit cache should be cleared
     * ...at some point
     *
     * @type {Map<String, Boolean>}
     */
    this.hitcache = new Map()
  }

  /**
   * Checks if a unit can be hit.
   * If it has not been hit yet, we can mark it as hit.
   * Duplicate hits will not work.
   *
   * @param {String} id
   */
  tryHitAndMarkEnemy (id) {
    if (this.hitcache.has(id)) {
      return false
    }
    this.hitcache.set(id, true)
    return true
  }
}

export default FFProjectile
