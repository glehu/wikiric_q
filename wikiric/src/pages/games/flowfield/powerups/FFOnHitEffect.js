/*
 * Copyright (c) 2024.
 * Module FFOnHitEffect.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

/**
 *
 * @param {Number} x
 * @param {Number} y
 * @param {String} type
 * @param {any} content
 * @param {Number} ttl
 * @param {Number} reps
 * @param {Number} [dimW=-1]  The width dimension for this unit
 * @param {Number} [dimH=-1] The height dimension for this unit
 * @param {Number} [offX=-1] The x offset for rendering
 * @param {Number} [offY=-1] The y offset for rendering
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
   * @param {Number} [dimW=-1]  The width dimension for this unit
   * @param {Number} [dimH=-1] The height dimension for this unit
   * @param {Number} [offX=-1] The x offset for rendering
   * @param {Number} [offY=-1] The y offset for rendering
   */
  constructor (x,
               y,
               type,
               content,
               ttl,
               reps,
               dimW = -1,
               dimH = -1,
               offX = -1,
               offY = -1) {
    this.x = x
    this.y = y
    this.type = type
    this.content = content
    this.ttl = ttl
    this._ttl = ttl
    this.reps = reps
    this.count = 0
    this.dimW = dimW
    this.dimH = dimH
    this.offX = offX
    this.offY = offY
  }

  tick () {
    this.ttl -= 1
    if (this.type === 'text') {
      this.y -= 0.002
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
