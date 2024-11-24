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
 * @param {Number} x The x position
 * @param {Number} y The y position
 * @param {Number} speed Determines the speed the unit moves with
 * @param id The unit's unique id
 * @param {Number} dmg The dmg per second for proxy damage
 * @param {Number} hp The unit's health points
 * @param {Number} xp The amount of XP this unit gives on death
 * @param {String} visualType E.G. slime or skeleton
 * @param {Number} dimW The width dimension for this unit
 * @param {Number} dimH The height dimension for this unit
 * @param {Number} offX The x offset for rendering
 * @param {Number} offY The y offset for rendering
 * @param {Number} armor The armor of this unit
 * @param {Number} money The amount of money this unit gives on death
 */
class FFUnit {
  /**
   * An FF Unit
   * @param {Number} x The x position
   * @param {Number} y The y position
   * @param {Number} speed Determines the speed the unit moves with
   * @param id The unit's unique id
   * @param {Number} dmg The dmg per second for proxy damage
   * @param {Number} hp The unit's health points
   * @param {Number} xp The amount of XP this unit gives on death
   * @param {String} visualType E.G. slime or skeleton
   * @param {Number} dimW The width dimension for this unit
   * @param {Number} dimH The height dimension for this unit
   * @param {Number} offX The x offset for rendering
   * @param {Number} offY The y offset for rendering
   * @param {Number} armor The armor of this unit
   * @param {Number} money The amount of money this unit gives on death
   */
  constructor (
    x,
    y,
    speed,
    id,
    dmg,
    hp,
    xp,
    visualType,
    dimW,
    dimH,
    offX,
    offY,
    armor,
    money
  ) {
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
    this.maxSpeed = speed
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
    this.dimW = dimW
    this.dimH = dimH
    this.offX = offX
    this.offY = offY
    this.armor = armor
    this.money = money
    /**
     *
     * @type {FFPowerUpEffect[]}
     */
    this.effects = []
  }

  /**
   * Returns movement debuffs as their types or null
   * @return {Number[] || null}
   */
  procMovementDebuffs () {
    if (this.effects.length < 1) {
      return null
    }
    /**
     *
     * @type {Number[]}
     */
    const debuffs = []
    for (let i = this.effects.length - 1; i >= 0; i--) {
      if (this.effects[i].type !== 'debuff') {
        continue
      }
      this.effects[i].hitCount -= 1
      if (this.effects[i].hitCount <= 0) {
        this.effects.splice(i, 1)
      } else {
        debuffs.push(this.effects[i].value)
      }
      if (i === 0) {
        break
      }
    }
    return debuffs
  }
}

export default FFUnit
