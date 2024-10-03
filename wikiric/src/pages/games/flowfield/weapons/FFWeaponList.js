/*
 * Copyright (c) 2024.
 * Module FFWeaponList.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import FFWeapon from 'pages/games/flowfield/weapons/FFWeapon'
import FFPowerUp from 'pages/games/flowfield/powerups/FFPowerUp'
import FFPowerUpEffect from 'pages/games/flowfield/powerups/FFPowerUpEffect'

class FFWeaponList {
  constructor () {
    this.version = 1
    this.categories = {
      /**
       * @type FFWeapon[]
       */
      starter: []
    }
  }

  initiateStarterWeapons () {
    let weapon
    let powerUp
    let effect
    /**
     * STARTER WEAPON: GUN
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Gun',
      'Shoots projectiles. That\'s what guns do!',
      40,
      5,
      1,
      1,
      60,
      2,
      10,
      1,
      0,
      0.2,
      0,
      'bullet',
      200)
    powerUp = new FFPowerUp(
      0,
      1,
      'Critical Hit (Starter)',
      '4th shot deals more damage.')
    effect = new FFPowerUpEffect(
      true,
      'dmg',
      5,
      1,
      4,
      false,
      true)
    powerUp.effects.push(effect)
    weapon.powerUps.push(powerUp)
    this.categories.starter.push(weapon)
    /**
     * STARTER WEAPON: FLAMETHROWER
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Flamethrower',
      'Covers the screen with flames.',
      40,
      1,
      0.5,
      1,
      10,
      0,
      8,
      5,
      1,
      0.2,
      0,
      'fire',
      200)
    powerUp = new FFPowerUp(
      0,
      1,
      'Spam (Starter)',
      'More projectiles!')
    effect = new FFPowerUpEffect(
      false,
      'amt',
      2,
      0.5,
      0,
      true,
      true)
    powerUp.effects.push(effect)
    weapon.powerUps.push(powerUp)
    this.categories.starter.push(weapon)
    /**
     * STARTER WEAPON: ROCKET LAUNCHER
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Rocket Launcher',
      'Explosive rockets dealing AoE damage.',
      40,
      10,
      5,
      1,
      120,
      1,
      20,
      1,
      0,
      2,
      0.1,
      'rocket',
      200)
    powerUp = new FFPowerUp(
      0,
      1,
      'Explosion (Starter)',
      'Projectiles explode when hitting enemies. Radius scales with Area.')
    effect = new FFPowerUpEffect(
      true,
      'radius',
      4,
      0.5,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    weapon.powerUps.push(powerUp)
    this.categories.starter.push(weapon)
    /**
     * STARTER WEAPON: SHOTGUN
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Shotgun',
      'Double barrel action! Can\'t get cooler than that! At least for now.',
      40,
      15,
      2,
      2,
      120,
      4,
      10,
      2,
      0,
      0.2,
      0,
      'bullet',
      200)
    this.categories.starter.push(weapon)
    /**
     * STARTER WEAPON: SNIPER
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Sniper',
      'Lots of damage with high reload times.',
      40,
      40,
      5,
      1,
      200,
      10,
      10,
      3,
      0,
      0.4,
      0,
      'bullet',
      200)
    this.categories.starter.push(weapon)
    /**
     * STARTER WEAPON: SNIPER
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Laser Suit',
      'Hurts enemies that are too close. Needs to recharge after some time.',
      5,
      1,
      10,
      100,
      300,
      10,
      0,
      3,
      0,
      0.4,
      0,
      'melee',
      0)
    this.categories.starter.push(weapon)
    /**
     * STARTER WEAPON: ASSAULT RIFLE
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Assault Rifle',
      'Shoots faster than a regular gun.',
      40,
      8,
      4,
      1,
      30,
      1,
      12,
      2,
      0,
      0.3,
      0,
      'bullet',
      200)
    powerUp = new FFPowerUp(
      0,
      1,
      'Critical Hit (Starter)',
      '4th shot deals more damage.')
    effect = new FFPowerUpEffect(
      true,
      'dmg',
      5,
      1,
      4,
      false,
      true)
    powerUp.effects.push(effect)
    weapon.powerUps.push(powerUp)
    this.categories.starter.push(weapon)
    /**
     * STARTER WEAPON: MINI GUN
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Minigun',
      'NEED MORE AMMO!',
      40,
      6,
      2,
      2,
      10,
      0,
      12,
      2,
      0,
      0.3,
      0,
      'bullet',
      200)
    this.categories.starter.push(weapon)
  }
}

export default FFWeaponList
