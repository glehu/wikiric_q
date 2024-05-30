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
  }
}

export default FFWeaponList
