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

const VisualTypes = {
  Bullet: 0,
  Fire: 1,
  Electricity: 2
}

const DebuffTypes = {
  Slow: 0,
  Stun: 1
}

const TrajectoryTypes = {
  Projectile: 0,
  Stream: 1,
  Circle: 2
}

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

  initiatePowerUps () {
    // PowerUps
    this.initiateStarterPowerUps()
    this.initiateExpansionPowerUps()
    this.initiateRedirectionPowerUps()
    // Abilities
    this.initiateStarterAbilities()
  }

  initiateStarterPowerUps () {
    let powerUp
    /**
     * STARTER POWERUP: Critical Hit
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Critical Hit',
      'Deals more damage sometimes.',
      100,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      10,
      0,
      4,
      false,
      false))
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
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'amt',
      1,
      0,
      0,
      true,
      false))
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
      90,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitCount',
      1,
      0,
      0,
      false,
      false))
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
      100,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitRange',
      0.5,
      0,
      0,
      false,
      false))
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
      100,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'speed',
      1,
      0,
      0,
      false,
      false))
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
      70,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'radius',
      1,
      0,
      0,
      false,
      false))
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
      80,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      5,
      0,
      0,
      false,
      false))
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
      40,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      10,
      0,
      2,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitCount',
      1,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'speed',
      1,
      0,
      0,
      false,
      false))
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
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      50,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'cd',
      100,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitCount',
      1,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
  }

  initiateExpansionPowerUps () {
    let powerUp
    /**
     * EXPANSION POWERUP: Damage 2
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      2,
      'Damage 2',
      'More damage.',
      50,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      10,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
    /**
     * EXPANSION POWERUP: Spam 2
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      2,
      'Spam 2',
      'Even more projectiles at the cost of lower damage.',
      50,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'amt',
      2,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'ratio',
      -0.2,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
    /**
     * EXPANSION POWERUP: Scaling Damage
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      2,
      'Scaling Damage',
      'More damage every level-up!',
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      5,
      1,
      0,
      false,
      true))
    this.categories.starter.push(powerUp)
    /**
     * EXPANSION POWERUP: Ratio Plus
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      2,
      'Ratio Plus',
      'Increases the weapon\'s damage scaling.',
      50,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'ratio',
      0.2,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
    /**
     * EXPANSION POWERUP: Ratio Plus 2
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      2,
      'Ratio Plus 2',
      'Increases the weapon\'s damage scaling even more.',
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'ratio',
      0.3,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
    /**
     * EXPANSION POWERUP: HE Rounds
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      2,
      'HE Rounds',
      'Slower shooting explosive rounds with high damage.',
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'radius',
      2,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'ratio',
      0.5,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitCount',
      -999,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'speed',
      -5,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
    /**
     * EXPANSION POWERUP: Overdrive
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      2,
      'Overdrive',
      'Heavily decreases weapon cooldown.',
      20,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'cd',
      -30,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'ratio',
      -0.5,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
    /**
     * EXPANSION POWERUP: Powerful Shots
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      2,
      'Powerful Shots',
      'Stronger projectiles that pierce units and split upon impact.',
      50,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      20,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'speed',
      4,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitCount',
      4,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'split',
      2,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
  }

  initiateRedirectionPowerUps () {
    let powerUp
    /**
     * REDIRECTION POWERUP: Chain
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      3,
      'Chain',
      'Projectiles chain to nearby enemies. Scales with area.',
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'chain',
      2,
      0.1,
      0,
      true,
      true))
    this.categories.starter.push(powerUp)
    /**
     * REDIRECTION POWERUP: Chain
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      3,
      'Virus',
      'Projectiles spread to a lot of enemies but does way less damage.',
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'chain',
      20,
      0,
      0,
      false,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'ratio',
      -0.7,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
    /**
     * REDIRECTION POWERUP: Split
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      3,
      'Split',
      'Projectiles split into smaller ones upon impact. Scales with amount.',
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'split',
      2,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
    /**
     * REDIRECTION POWERUP: Backfire
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      3,
      'Backfire',
      'Shoots an extra but weaker projectile backwards.',
      30,
      false)
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'backfire',
      1,
      0,
      0,
      false,
      false))
    this.categories.starter.push(powerUp)
  }

  initiateStarterAbilities () {
    /**
     * STARTER ABILITY: Spark
     * @type {FFPowerUp}
     */
    let powerUp = new FFPowerUp(
      0,
      1,
      'Spark',
      'Spawns an electric orb that can stun enemies.',
      100,
      true,
      1_000,
      5)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      50,
      25,
      0,
      false,
      true))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'visual',
      VisualTypes.Electricity))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'debuff',
      DebuffTypes.Stun,
      0,
      1000))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitCount',
      20,
      2,
      0,
      false,
      true))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitRange',
      3,
      0.5,
      0,
      false,
      true))
    this.categories.starter.push(powerUp)
    /**
     * STARTER ABILITY: Flame Nova
     * @type {FFPowerUp}
     */
    powerUp = new FFPowerUp(
      0,
      1,
      'Flame Nova',
      'Unleash the wrath of a thousand dragons.',
      100,
      true,
      1_500,
      5)
    powerUp.effects.push(new FFPowerUpEffect(
      true,
      'dmg',
      5,
      10,
      0,
      false,
      true))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'visual',
      VisualTypes.Fire))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'trajectory',
      TrajectoryTypes.Stream))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'amt',
      75,
      5,
      0,
      true,
      true))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'ttl',
      400,
      0,
      0,
      true,
      false))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitCount',
      10,
      4,
      0,
      false,
      true))
    powerUp.effects.push(new FFPowerUpEffect(
      false,
      'hitRange',
      1,
      0.2,
      0,
      false,
      true))
    this.categories.starter.push(powerUp)
  }
}

export default FFPowerUpList
