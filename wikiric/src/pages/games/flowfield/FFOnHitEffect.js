/*
 * Copyright (c) 2024.
 * Module FFOnHitEffect.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

class FFOnHitEffect {
  /**
   *
   * @param {Number} x
   * @param {Number} y
   * @param {String} type
   * @param {any} content
   * @param {Number} ttl
   * @param {Number} reps
   */
  constructor (x,
               y,
               type,
               content,
               ttl,
               reps) {
    this.x = x
    this.y = y
    this.type = type
    this.content = content
    this.ttl = ttl
    this._ttl = ttl
    this.reps = reps
    this.count = 0
  }

  tick () {
    this.ttl -= 1
    if (this.type === 'text') {
      this.y -= 0.001
    }
    // If there are repetitions left, we will reset the ttl
    if (this.ttl <= 0 && this.reps > 0) {
      this.ttl = this._ttl
      this.reps -= 1
      this.count += 1
    }
    return this.ttl >= 0
  }
}

export default FFOnHitEffect
