/*
 * Copyright (c) 2024.
 * Module FFTrophyList.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import FFTrophy from 'pages/games/flowfield/trophies/FFTrophy'

class FFTrophyList {
  constructor () {
    this.version = 1
    this.categories = {
      /**
       * @type FFTrophy[]
       */
      starter: []
    }
    /**
     * Progress is being tracked here e.g. [flawless_rounds] = 2
     * @type {Map<String, Number>}
     */
    this.trophyStats = new Map()
  }

  /**
   *
   * @param {String} type
   * @param {Number} value
   * @return {FFTrophy[]}
   */
  setProgress (type, value) {
    if (this.categories.starter.length < 1) {
      return []
    }
    // Remember progress
    this.trophyStats.set(type, value)
    // Notify trophies and return finished ones
    const finished = []
    for (let i = 0; i < this.categories.starter.length; i++) {
      if (this.categories.starter[i].setProgress(type, value)) {
        finished.push(this.categories.starter[i])
      }
    }
    return finished
  }

  /**
   *
   * @param {String} type
   * @param {Number} value
   * @return {FFTrophy[]}
   */
  addProgress (type, value) {
    if (this.categories.starter.length < 1) {
      return []
    }
    // Remember progress
    let prg = this.trophyStats.get(type)
    if (prg) {
      prg += value
    } else {
      prg = value
    }
    this.trophyStats.set(type, prg)
    // Notify trophies and return finished ones
    const finished = []
    for (let i = 0; i < this.categories.starter.length; i++) {
      if (this.categories.starter[i].addProgress(type, value)) {
        finished.push(this.categories.starter[i])
      }
    }
    return finished
  }

  initiateStarterTrophies () {
    /**
     * @type FFTrophy
     */
    let trophy
    trophy = new FFTrophy(0, 'Hello World', 'Does absolutely nothing. Just like a hello world program.', 'round', 1)
    this.categories.starter.push(trophy)
    trophy = new FFTrophy(0, 'IT\'S OVER 9... uh...LEVELS!?', 'Reach level 10.', 'level', 10)
    trophy.addBoost('hp', 200)
    trophy.addBoost('dmg', 10)
    this.categories.starter.push(trophy)
    trophy = new FFTrophy(0, 'Rampage!', 'Eliminate 100 enemies.', 'kill', 100)
    trophy.addBoost('dmg', 10)
    this.categories.starter.push(trophy)
    trophy = new FFTrophy(0, 'Masochistic Traits', 'Receive 1000 damage.', 'self_damage', 1000)
    trophy.addBoost('hp', 100)
    trophy.addBoost('hp+', 5)
    this.categories.starter.push(trophy)
    trophy = new FFTrophy(0, 'Master Dodger', 'Survive 2 rounds without being hurt.', 'flawless_round', 2)
    trophy.addBoost('dmg', 10)
    this.categories.starter.push(trophy)
    trophy = new FFTrophy(0, 'That\'s a lot of damage!', 'Deal 10k damage.', 'dmg', 10_000)
    trophy.addBoost('dmg', 30)
    this.categories.starter.push(trophy)
  }
}

export default FFTrophyList
