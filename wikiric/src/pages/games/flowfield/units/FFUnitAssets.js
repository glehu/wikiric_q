/*
 * Copyright (c) 2024.
 * Module FFUnitAssets.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import FFAssets from 'pages/games/flowfield/units/FFAssets'

class FFUnitAssets {
  constructor () {
    /**
     *
     * @type {Map<String, FFAssets>}
     */
    this.assets = new Map()
  }

  /**
   * Adds a new named asset with the provided image arrays:
   * * idle
   * * walking
   * * attacking
   * * death
   * @param {String} name
   * @param {Array} idle
   * @param {Array} walking
   * @param {Array} attacking
   * @param {Array} death
   */
  addAsset (name, idle, walking, attacking, death) {
    this.assets.set(name, new FFAssets(idle, walking, attacking, death))
  }

  getAsset (name) {
    if (!this.assets.has(name)) {
      return null
    }
    return this.assets.get(name)
  }
}

export default FFUnitAssets
