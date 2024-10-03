/*
 * Copyright (c) 2024.
 * Module FFAssets.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

/**
 *
 * @param {Array} idle
 * @param {Array} walk
 * @param {Array} attack
 * @param {Array} death
 */
class FFAssets {
  /**
   *
   * @param {Array} idle
   * @param {Array} walk
   * @param {Array} attack
   * @param {Array} death
   */
  constructor (idle, walk, attack, death) {
    // Idle/Standing animation
    if (!idle) {
      idle = []
    }
    this.idle = idle
    // Walking animation
    if (!walk) {
      walk = []
    }
    this.walk = walk
    // Attacking animation
    if (!attack) {
      attack = []
    }
    this.attack = attack
    // Death animation
    if (!death) {
      death = []
    }
    this.death = death
  }
}

export default FFAssets
