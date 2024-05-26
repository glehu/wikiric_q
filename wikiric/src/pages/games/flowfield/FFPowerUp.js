class FFPowerUp {
  /**
   *
   * @param {Number} id
   * @param {Number} level
   * @param {String} name
   * @param {String} desc
   */
  constructor (id, level, name, desc) {
    this.id = id
    this.level = level
    this.name = name
    this.desc = desc
    /**
     *
     * @type {FFPowerUpEffect[]}
     */
    this.effects = []
  }

  /**
   * Procs (activates) all available effects and returns them
   * @return {FFPowerUpEffect[]}
   */
  proc () {
    if (this.effects.length < 1) {
      return []
    }
    /**
     * @type {FFPowerUpEffect[]}
     */
    const procs = []
    let copy
    for (const effect of this.effects) {
      if (effect.proc()) {
        if (effect.floorValueOnProc) {
          // Shallow copy and floor value
          copy = { ...effect }
          copy.value = Math.floor(copy.value)
          procs.push(copy)
        } else {
          procs.push(effect)
        }
      }
    }
    return procs
  }

  /**
   * This function is to be called upon player level up
   */
  autoLevelUp () {
    this.level += 1
    if (this.effects.length < 1) {
      return
    }
    for (const effect of this.effects) {
      if (effect.autoLevelUp) {
        effect.levelUp()
      }
    }
  }
}

export default FFPowerUp
