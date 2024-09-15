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
   */
  constructor (x,
               y,
               type,
               content,
               ttl) {
    this.x = x
    this.y = y
    this.type = type
    this.content = content
    this.ttl = ttl
  }

  tick () {
    this.ttl -= 1
    if (this.type === 'text') {
      this.y -= 0.001
    }
    return this.ttl >= 0
  }
}

export default FFOnHitEffect
