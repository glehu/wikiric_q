/*
 * Copyright (c) 2024.
 * Module FFTrophy.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

class FFTrophy {
  /**
   *
   * @param {Number} id
   * @param {String} name
   * @param {String} desc
   * @param {String} goalType
   * @param {Number} goalThreshold
   */
  constructor (id, name, desc, goalType, goalThreshold) {
    this.id = id
    this.name = name
    this.desc = desc
    this.goalType = goalType
    this.goalThreshold = goalThreshold
    this.goalProgress = 0
    this.statBoosts = new Map()
    this.done = false
    this.collected = false
  }

  /**
   * Adds a stat boost.
   *
   * @param {String} type
   * @param {Number} value
   */
  addBoost (type, value) {
    this.statBoosts.set(type, value)
  }

  /**
   * Sets the current progress.
   * Cannot exceed the threshold.
   *
   * Returns true if the threshold has been reached.
   *
   * @param {String} type
   * @param {Number} value
   * @return {Boolean}
   */
  setProgress (type, value) {
    if (this.done || type !== this.goalType) {
      return false
    }
    if (value < this.goalThreshold) {
      this.goalProgress = value
      return false
    } else {
      this.goalProgress = this.goalThreshold
      this.done = true
      return true
    }
  }

  /**
   * Adds to the current progress.
   * Cannot exceed the threshold.
   *
   * Returns true if the threshold has been reached.
   *
   * @param {String} type
   * @param {Number} value
   * @return {Boolean}
   */
  addProgress (type, value) {
    if (this.done || type !== this.goalType) {
      return false
    }
    if (this.goalProgress + value < this.goalThreshold) {
      this.goalProgress += value
      return false
    } else {
      this.goalProgress = this.goalThreshold
      this.done = true
      return true
    }
  }

  collect () {
    if (!this.done || this.collected) {
      return new Map()
    }
    this.collected = true
    return this.statBoosts
  }

  getCollected () {
    if (!this.collected) {
      return new Map()
    }
    return this.statBoosts
  }
}

export default FFTrophy
