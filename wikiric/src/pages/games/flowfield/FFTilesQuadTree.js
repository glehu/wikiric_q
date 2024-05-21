class FFTilesQuadTree {
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
     * @type {FFTile[]}
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

  exportJSON () {
    return JSON.stringify(this)
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
   * Inserts a tile into this quadtree.
   *
   * @param {FFTile} tile
   */
  insert (tile) {
    if (!this.inBoundary(tile.pos.x, tile.pos.y)) {
      return
    }
    if (this.content.length < this.capacity) {
      this.content.push(tile)
    } else {
      if (!this.isDivided) {
        this.subdivide()
      }
      this.tl.insert(tile)
      this.tr.insert(tile)
      this.bl.insert(tile)
      this.br.insert(tile)
    }
  }

  /**
   * Subdivides this quadtree into four equal parts.
   */
  subdivide () {
    this.isDivided = true
    this.tl = new FFTilesQuadTree(this.x - this.w / 2, this.y - this.h / 2, this.w / 2, this.h / 2, this.capacity)
    this.tr = new FFTilesQuadTree(this.x + this.w / 2, this.y - this.h / 2, this.w / 2, this.h / 2, this.capacity)
    this.bl = new FFTilesQuadTree(this.x - this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, this.capacity)
    this.br = new FFTilesQuadTree(this.x + this.w / 2, this.y + this.h / 2, this.w / 2, this.h / 2, this.capacity)
  }

  /**
   * Retrieves tiles of the provided area if they exist.
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
   * @param {FFTile[]} found
   */
  _getContents (x, y, x2, y2, found) {
    if (!this.isIntersect(x, y, x2, y2)) {
      return found
    }
    // Check own content
    for (const tile of this.content) {
      if (tile.pos.x >= x && tile.pos.x <= x2 && tile.pos.y >= y && tile.pos.y <= y2) {
        found.push(tile)
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

export default FFTilesQuadTree
