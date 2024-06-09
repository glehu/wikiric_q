import FFWeapon from 'pages/games/flowfield/FFWeapon'
import FFPowerUp from 'pages/games/flowfield/FFPowerUp'
import FFPowerUpEffect from 'pages/games/flowfield/FFPowerUpEffect'

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
      40,
      5,
      1,
      1,
      60,
      2,
      4,
      1,
      0,
      0.2,
      0)
    powerUp = new FFPowerUp(
      0,
      1,
      'Critical Hit',
      'Deals more damage sometimes.')
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
      40,
      1,
      0.5,
      1,
      10,
      0,
      10,
      5,
      1,
      0.2,
      0)
    powerUp = new FFPowerUp(
      0,
      1,
      'Spam',
      'More projectiles!')
    effect = new FFPowerUpEffect(
      false,
      'amt',
      2,
      1,
      0,
      false,
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
      0.1)
    powerUp = new FFPowerUp(
      0,
      1,
      'Explosion',
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
      40,
      15,
      1,
      2,
      120,
      4,
      6,
      2,
      0,
      0.2,
      0)
    this.categories.starter.push(weapon)
    /**
     * STARTER WEAPON: SNIPER
     * @type {FFWeapon}
     */
    weapon = new FFWeapon(
      'Sniper',
      40,
      40,
      1,
      1,
      200,
      10,
      10,
      3,
      0,
      0.4,
      0)
    this.categories.starter.push(weapon)
  }
}

export default FFWeaponList
