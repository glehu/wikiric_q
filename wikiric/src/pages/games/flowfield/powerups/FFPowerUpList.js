/*
 * Copyright (c) 2024.
 * Module FFPowerUpList.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import FFPowerUp from 'pages/games/flowfield/powerups/FFPowerUp'
import FFPowerUpEffect from 'pages/games/flowfield/powerups/FFPowerUpEffect'

class FFPowerUpList {
  constructor () {
    this.version = 1
    this.categories = {
      /**
       * @type FFPowerUp[]
       */
      starter: []
    }
  }

  initiateStarterPowerUps () {
    let powerUp
    let effect
    /**
     * STARTER POWERUP: Critical Hit
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Critical Hit',
      'Deals more damage sometimes.',
      100)
    effect = new FFPowerUpEffect(
      true,
      'dmg',
      5,
      1,
      4,
      false,
      true)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
    /**
     * STARTER POWERUP: Spam
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Spam',
      'More projectiles!',
      30)
    effect = new FFPowerUpEffect(
      false,
      'amt',
      1,
      0.1,
      0,
      true,
      true)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
    /**
     * STARTER POWERUP: Multi-Hit
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Multi-Hit',
      'Can hit more enemies.',
      90)
    effect = new FFPowerUpEffect(
      false,
      'hitCount',
      1,
      1,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
    /**
     * STARTER POWERUP: Area
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Area',
      'Hits enemies further away.',
      100)
    effect = new FFPowerUpEffect(
      false,
      'hitRange',
      0.5,
      0.1,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
    /**
     * STARTER POWERUP: Speed
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Speed',
      'Projectiles are faster.',
      100)
    effect = new FFPowerUpEffect(
      false,
      'speed',
      1,
      0.2,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
    /**
     * STARTER POWERUP: Explosion
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Explosion',
      'Projectiles explode. Radius scales with Area.',
      70)
    effect = new FFPowerUpEffect(
      true,
      'radius',
      1,
      0.5,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
    /**
     * STARTER POWERUP: Damage
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Damage',
      'Raw damage boost for anything that damages.',
      80)
    effect = new FFPowerUpEffect(
      true,
      'dmg',
      5,
      5,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
    /**
     * STARTER POWERUP: Berserk Tonic
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Berserk Tonic',
      'More power for the wild!',
      40)
    effect = new FFPowerUpEffect(
      true,
      'dmg',
      10,
      5,
      2,
      false,
      true)
    powerUp.effects.push(effect)
    effect = new FFPowerUpEffect(
      false,
      'hitCount',
      1,
      1,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    effect = new FFPowerUpEffect(
      false,
      'speed',
      1,
      0.2,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
    /**
     * STARTER POWERUP: Last Resort
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Last Resort',
      'Highly increased damage with slower firing rate.',
      30)
    effect = new FFPowerUpEffect(
      true,
      'dmg',
      50,
      5,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    effect = new FFPowerUpEffect(
      false,
      'cd',
      100,
      2,
      0,
      false,
      true)
    powerUp.effects.push(effect)
    effect = new FFPowerUpEffect(
      false,
      'hitCount',
      1,
      0,
      0,
      false,
      false)
    powerUp.effects.push(effect)
    this.categories.starter.push(powerUp)
  }
}

export default FFPowerUpList
