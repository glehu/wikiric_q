/*
 * Copyright (c) 2024.
 * Module FFQuadTree.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

class FFQuadTree {
  constructor (x, y, w, h, cap) {
    // Boundaries

    /**
     * @type {Number}
     */
    this.x = x
    /**
     * @type {Number}
     */
    this.y = y
    /**
     * @type {Number}
     */
    this.w = w
    /**
     * @type {Number}
     */
    this.h = h

    // Children (Subdivisions)

    this.tl = null
    this.tr = null
    this.bl = null
    this.br = null

    // Contents

    /**
     * @type {Number}
     */
    this.capacity = cap
    /**
     * @type {FFUnit[]}
     */
    this.content = []
    /**
     * @type {Boolean}
     */
    this.isDivided = false
  }

  /**
   * Checks if a point is inside this quadtree.
   *
   * @param {Number} x
   * @param {Number} y
   * @return {boolean}
   */
  inBoundary (x, y) {
    return (x >= this.x - this.w && x <= this.x + this.w && y >= this.y - this.h && y <= this.y + this.h)
  }

  /**
   * Checks if an area intersects this quadtree.
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} x2
   * @param {Number} y2
   * @return {Boolean}
   */
  isIntersect (x, y, x2, y2) {
    // Checks if provided x coordinates are out of bounds
    if (x > this.x + this.w) return false
    if (x2 < this.x - this.w) return false
    // Checks if provided y coordinates are out of bounds
    if (y > this.y + this.h) return false
    if (y2 < this.y - this.h) return false
    // Provided area is in bounds
    return true
  }

  /**
   * Inserts a unit into this quadtree.
   *
   * @param {FFUnit} unit
   */
  insert (unit) {
    if (!this.inBoundary(unit.pos.x, unit.pos.y)) {
      return
    }
    if (this.content.length < this.capacity) {
      this.content.push(unit)
    } else {
      if (!this.isDivided) {
        this.subdivide()
      }
      this.tl.insert(unit)
      this.tr.insert(unit)
      this.bl.insert(unit)
      this.br.insert(unit)
    }
  }

  /**
   * Subdivides this quadtree into four equal parts.
   */
  subdivide () {
    this.isDivided = true
    this.tl = new FFQuadTree(this.x - this.w / 2, this.y - this.h / 2, this.w / 2, this.h / 2, this.capacity)
    this.tr = new FFQuadTree(this.x + this.w / 2, this.y - this.h / 2, this.w / 2, this.h / 2, this.capacity)
    this.bl = new FFQuadTree(this.x - this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, this.capacity)
    this.br = new FFQuadTree(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, this.capacity)
  }

  /**
   * Retrieves units of the provided area if they exist.
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} x2
   * @param {Number} y2
   */
  getContents (x, y, x2, y2) {
    const found = []
    this._getContents(x, y, x2, y2, found)
    return found
  }

  /**
   * @param {Number} x
   * @param {Number} y
   * @param {Number} x2
   * @param {Number} y2
   * @param {FFUnit[]} found
   */
  _getContents (x, y, x2, y2, found) {
    if (!this.isIntersect(x, y, x2, y2)) {
      return found
    }
    // Check own content
    for (const unit of this.content) {
      if (unit.pos.x >= x && unit.pos.x <= x2 && unit.pos.y >= y && unit.pos.y <= y2) {
        found.push(unit)
      }
    }
    // Check children
    if (this.isDivided) {
      this.tl._getContents(x, y, x2, y2, found)
      this.tr._getContents(x, y, x2, y2, found)
      this.bl._getContents(x, y, x2, y2, found)
      this.br._getContents(x, y, x2, y2, found)
    }
  }
}

export default FFQuadTree
