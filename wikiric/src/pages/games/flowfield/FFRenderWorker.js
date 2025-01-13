/*
 * Copyright (c) 2025.
 * Module FFRenderWorker.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

'use strict'

{
  // ######################
  // ### VARIABLE STUFF ###
  // ######################

  let integrationField = null
  let illuminationField = null
  let gridSize = 0
  let xCells = 0
  let yCells = 0
  let offX = 0
  let offY = 0
  let isDebug = false
  let dpr = 0
  let width = 0
  let height = 0
  const fow = new Map()

  // ### Canvas
  let canvas = null
  let ctx = null

  // #####################
  // ### MESSAGE STUFF ###
  // #####################

  onmessage = (e) => {
    if (!e.data.msg) return
    switch (e.data.msg) {
      case '[c:render]':
        drawLightsCtx(
          Number(e.data.x),
          Number(e.data.y),
          Number(e.data.d),
          Boolean(e.data.b))
        break
      case '[c:canvas]':
        canvas = e.data.c
        dpr = Number(e.data.d)
        ctx = canvas.getContext('2d')
        ctx.scale(dpr, dpr)
        console.debug('[FFRenderWorker] Initialized')
        break
      case '[c:integ]':
        integrationField = new Uint16Array(e.data.f)
        break
      case '[c:illum]':
        illuminationField = new Uint16Array(e.data.f)
        break
      case '[c:vals]':
        gridSize = Number(e.data.g)
        xCells = Number(e.data.x)
        yCells = Number(e.data.y)
        isDebug = Boolean(e.data.d)
        width = Number(e.data.w)
        height = Number(e.data.h)
        break
      case '[c:off]':
        offX = Number(e.data.x)
        offY = Number(e.data.y)
        break
    }
  }

  // ###################
  // ### LOGIC STUFF ###
  // ###################

  /**
   * drawLightsCtx draws all lights around the provided position.
   * The pathfinding flow field is used to determine the illumination.
   * @param {Number} xPos
   * @param {Number} yPos
   * @param {Number} dist
   * @param {Boolean} drawBackground
   */
  function drawLightsCtx (xPos, yPos, dist, drawBackground) {
    if (!illuminationField || dist === 0) {
      return
    }
    const grid = gridSize
    const halfGrid = grid / 2
    // We will round the coordinates since the regular grid only contains
    // ...integer values. Since the double precision grid can handle
    // ...double the coordinates, though, we will check if the rounded
    // ...coordinates got floor or ceil rounding.
    // This way we can basically tell in which quadrant of one coordinate
    // ...the double precision position needs to be.
    const xPosR = Math.round(xPos)
    const yPosR = Math.round(yPos)
    let xShift = 0
    let yShift = 0
    if (xPosR > xPos) {
      // We are on the right side
      xShift = 1
    } else {
      // We are on the left side (default)
    }
    if (yPosR > yPos) {
      // We are on the bottom side
      yShift = 1
    } else {
      // We are on the top side (default)
    }
    // We are going to retrieve all floor positions around the provided coordinates
    // Since the map could be huge we do not want to check all positions
    const indices = getNeighborPositions(
      xPosR, yPosR, dist, true)
    if (indices.length < 1) {
      return
    }
    ctx.clearRect(0, 0, width, height)
    let positions
    let value
    let x, y
    let nb
    let tmpArrayPos
    let tmp
    let hasVisible
    for (let i = 0; i < indices.length; i++) {
      positions = convertXYPosToDPositions(
        indices[i][0], indices[i][1])
      hasVisible = false

      // *** DEBUG
      if (isDebug) {
        const dbX = Math.floor((indices[i][0] + offX) * grid)
        const dbY = Math.floor((indices[i][1] + offY) * grid)
        ctx.beginPath()
        ctx.strokeStyle = '#db3cff'
        ctx.rect(dbX, dbY, grid, grid)
        ctx.stroke()
        ctx.fillStyle = '#ffff00'
        ctx.fillText(`${indices[i][0]}:${indices[i][1]}`,
          dbX, dbY + 10)
      }
      // *** DEBUG

      for (let j = 0; j < positions.length; j++) {
        // Add sub-grid shift
        positions[j][0] += xShift
        positions[j][1] += yShift
        x = (positions[j][0] + (offX * 2)) * halfGrid
        y = (positions[j][1] + (offY * 2)) * halfGrid
        // Retrieve double precision positions
        tmpArrayPos = convertXYToArrayDPos(
          positions[j][0], positions[j][1])
        value = illuminationField[tmpArrayPos]

        // *** DEBUG
        if (isDebug) {
          ctx.beginPath()
          ctx.strokeStyle = '#9923b3'
          ctx.rect(x, y, halfGrid, halfGrid)
          ctx.stroke()
          ctx.fillStyle = '#0dbf00'
          ctx.fillText(`${value}`,
            x, y + 20)
        }
        // *** DEBUG

        if (value >= 65535) {
          // We hit a wall!
          // Check if a neighbor is illuminated
          tmp = convertDPosToXYPos(positions[j][0], positions[j][1])
          nb = getNeighborIndices(
            tmp[0], tmp[1], 2, false)
          for (let j = 0; j < nb.length; j++) {
            value = integrationField[nb[j]]
            if (value < 6) {
              hasVisible = true
              break
            }
          }
          continue
        } else if (value < 30) {
          ctx.fillStyle = '#fff3c8'
          tmp = 0.3 - (0.0005 * (value * value))
          if (tmp < 0.01) {
            tmp = 0
          } else {
            tmp *= 0.8
          }
          ctx.globalAlpha = tmp
          hasVisible = true
        } else {
          if (!drawBackground) {
            continue
          }
          ctx.fillStyle = '#141412'
          ctx.globalAlpha = 0.3
        }
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.rect(x, y, halfGrid, halfGrid)
        ctx.fill()
        ctx.globalAlpha = 1
      }
      if (hasVisible) {
        // Mark spot as seen!
        markCellSeen(convertXYToArrayPos(
          indices[i][0], indices[i][1]))
      }
    }
  }

  function getNeighborIndices (x, y, dist, includeSelf = false) {
    // Guard
    if (x < 0 || y < 0 || x >= xCells || y >= yCells) {
      return []
    }
    const list = []
    for (let xi = x - dist; xi <= x + dist; xi++) {
      if (xi < 0 || xi >= xCells) {
        continue
      }
      for (let yi = y - dist; yi <= y + dist; yi++) {
        if (yi < 0 || yi >= yCells) {
          continue
        }
        if (!includeSelf && xi === x && yi === y) {
          continue
        }
        list.push(convertXYToArrayPos(xi, yi))
      }
    }
    return list
  }

  function getNeighborPositions (x, y, dist, includeSelf = false) {
    // Guard
    if (x < 0 || y < 0 || x >= xCells || y >= yCells) {
      return []
    }
    const list = []
    for (let xi = x - dist; xi <= x + dist; xi++) {
      if (xi < 0 || xi >= xCells) {
        continue
      }
      for (let yi = y - dist; yi <= y + dist; yi++) {
        if (yi < 0 || yi >= yCells) {
          continue
        }
        if (!includeSelf && xi === x && yi === y) {
          continue
        }
        list.push([xi, yi])
      }
    }
    return list
  }

  /**
   * For each position on the regular grid there are 4 positions
   * ...on the double precision grid.
   *
   * A regular position results in 4 coordinates.
   */
  function convertXYPosToDPositions (x, y) {
    x *= 2
    y *= 2
    return [
      [x, y], // TL
      [x + 1, y], // TR
      [x, y + 1], // BL
      [x + 1, y + 1] // BR
    ]
  }

  /**
   * For each position on the regular grid there are 4 positions
   * ...on the double precision grid.
   *
   * A double precision position gets reduced to its regular position.
   */
  function convertDPosToXYPos (x, y) {
    if (x < 0 && y < 0) {
      return [0, 0]
    }
    // Coordinate system of the double precision grid:
    //
    // 0,0 1,0 2,0
    // 0,1 1,1 2,1
    // 0,2 1,2 2,2
    //
    // If we convert e.g. 1,1, the regular position should be 0,0
    // ...since regular pos 0,0 results in the following double
    // ...precision coordinates:
    // 0,0 + 1,0 + 0,1 + 1,1
    x = Math.floor(x / 2)
    y = Math.floor(y / 2)
    return [x, y]
  }

  function convertXYToArrayDPos (x, y) {
    return (xCells * 2) * y + x
  }

  function convertXYToArrayPos (x, y) {
    return xCells * y + x
  }

  function markCellSeen (index) {
    if (fow.has(index)) {
      return
    }
    fow.set(index, true)
    postMessage({
      msg: '[c:vis]',
      i: index
    })
  }
}
