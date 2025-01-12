/*
 * Copyright (c) 2024.
 * Module FFCalcWorker.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

'use strict'

import * as THREE from 'threejs-math'
import wikiricUtils from 'src/libs/wikiric-utils'
import 'pages/games/flowfield/wasm_exec.js'

{
  // ######################
  // ### VARIABLE STUFF ###
  // ######################

  // Can be set externally
  let gridSize = 50
  let width = 1000 // 1550
  let height = 1000 // 900
  // Internal
  let totalCells = 0
  let xCells = 0
  let yCells = 0
  let costField = undefined
  let integrationField = undefined
  let goalPosition = {
    x: -1,
    y: -1
  }
  let offsetVector = {
    x: 0,
    y: 0
  }
  let isCalculating = false
  let coPlayers = new Map()
  let calcTime = 0
  let calcLimit = -1
  let punishDiagonal = true

  // #########################
  // ### WebAssembly STUFF ###
  // #########################

  // TinyGo compiled TinyRic
  let go = null

  // WASM Module of TinyRic
  let wasm = null
  let prefWasm = false

  // #####################
  // ### MESSAGE STUFF ###
  // #####################

  onmessage = (e) => {
    if (!e.data.msg) return
    switch (e.data.msg) {
      case '[c:init]':
        width = Number(e.data.w)
        height = Number(e.data.h)
        gridSize = Number(e.data.g)
        if (Boolean(e.data.tiny)) {
          // WASM support!
          tinyRic().then(() => {
            prefWasm = true
            console.debug('[FFCalcWorker] Initialized TinyRic WASM Module')
          })
        } else {
          initializeGridValues()
          console.debug('[FFCalcWorker] Initialized')
        }
        break
      case '[c:cell]':
        xCells = Number(e.data.x)
        yCells = Number(e.data.y)
        break
      case '[c:calc]':
        handleCalculation()
        break
      case '[c:setp]':
        goalPosition.x = Number(e.data.x)
        goalPosition.y = Number(e.data.y)
        break
      case '[c:seto]':
        offsetVector.x = Number(e.data.x)
        offsetVector.y = Number(e.data.y)
        break
      case '[c:copo]':
        setCoPlayerPosition(e.data.usr, Number(e.data.x), Number(e.data.y))
        break
      case '[c:cost]':
        setCost(Number(e.data.pos), Number(e.data.val))
        break
      case '[c:mtrc]':
        console.log(calcTime)
        break
      case '[c:setlm]':
        calcLimit = Number(e.data.l)
        if (prefWasm) {
          wasm.instance.exports.setCalcLimit(calcLimit)
        }
        break
      case '[c:setdia]':
        punishDiagonal = Boolean(e.data.d)
        break
      default:
        console.debug('[FFCalcWorker] Unknown Command')
    }
  }

  // ###################
  // ### LOGIC STUFF ###
  // ###################

  /**
   * Initializes the integration and cost grid with the provided
   * ... values for width, height and grid size
   */
  function initializeGridValues () {
    if (prefWasm) {
      tinyInitializeGridValues()
      return
    }
    // Calculate amount of cells
    totalCells = xCells * yCells
    // Initialize grid arrays
    let init = false
    if (!costField || costField.length < 1) {
      costField = new Uint16Array(totalCells)
      init = true
    }
    integrationField = new Uint16Array(totalCells)
    // Fill with default values
    for (let i = 0; i < totalCells; i++) {
      if (init) {
        costField[i] = 1
      }
      integrationField[i] = 65535
    }
  }

  /**
   * Initializes the integration and cost grid with the provided
   * ... values for width, height and grid size
   */
  function tinyInitializeGridValues () {
    // Calculate amount of cells
    totalCells = 80 * 80
    // Initialize grid arrays
    let init = false
    if (!costField || costField.length < 1) {
      costField = new Uint16Array(6_400)
      init = true
    }
    integrationField = new Uint16Array(6_400)
    // Fill with default values
    for (let i = 0; i < totalCells; i++) {
      if (init) {
        costField[i] = 1
      }
      integrationField[i] = 65535
    }
  }

  /**
   * Recalculates the integration grid using the cost grid.
   *
   * This enables Flow Field pathfinding (for masses of units).
   *
   * @return {Promise<void>}
   */
  async function handleCalculation () {
    if (isCalculating) {
      return
    }
    // Check if there is a goal
    if (goalPosition.x === -1 || goalPosition.y === -1) {
      return
    }
    // Is there a WebAssembly module loaded?
    if (prefWasm) {
      // TinyRic (TinyGo compiled WASM Module) will calculate the
      // ...flow-field almost allocation-free!
      tinyHandleCalculation()
      return
    }
    // Lock this worker until completion
    isCalculating = true
    const tsStart = performance.now()
    // Integration grid always needs to be initialized
    initializeIntegrationGrid()
    /**
     * @type {THREE.Vector2[]}
     */
    const open = []
    let vec = new THREE.Vector2(Math.round(goalPosition.x - offsetVector.x), Math.round(goalPosition.y - offsetVector.y))
    // Set integration value of goal's position to zero
    let goalArrayPos = convertXYToArrayPos(vec.x, vec.y)
    integrationField[goalArrayPos] = 0
    // Add goal to open list
    open.unshift(vec)
    // Also add co-players
    if (coPlayers && coPlayers.size > 0) {
      coPlayers.forEach((val) => {
        vec = new THREE.Vector2(Math.round(val.x) - 1, Math.round(val.y) - 1)
        // Set integration value of goal's position to zero
        goalArrayPos = convertXYToArrayPos(vec.x, vec.y)
        integrationField[goalArrayPos] = 0
        // Add goal to open list
        open.unshift(vec)
      })
    }
    // Allocate memory for variables
    let current
    let neighbors
    // let x, y
    let value = -1
    let arrayPos, currentArrayPos
    // Enter calculation loop...
    let debugFirst = true
    let closed
    const limit = calcLimit > 0
    while (open.length > 0) {
      current = open.pop()
      currentArrayPos = convertXYToArrayPos(current.x, current.y)
      neighbors = getNeighbors(current.x, current.y, false)
      if (debugFirst) {
        debugFirst = false
      }
      closed = false
      for (let i = 0; i < neighbors.length; i++) {
        arrayPos = convertXYToArrayPos(neighbors[i].x, neighbors[i].y)
        // Ignore this neighbor if it is a wall (255)
        if (costField[arrayPos] >= 255) {
          continue
        }
        // Calculate the new value by first taking the current
        // ...element's value then adding the neighbor's cost
        value = integrationField[currentArrayPos] + costField[arrayPos]
        // ...and punishing diagonal movement
        if (punishDiagonal) {
          value += (current.manhattanDistanceTo(neighbors[i]) - 1)
        } else {
          value += (current.manhattanDistanceTo(neighbors[i]))
        }
        // Now we compare the value with its old one
        if (value < integrationField[arrayPos]) {
          // Add neighbor to open list
          if (!closed && !open.includes(neighbors[i])) {
            if (limit && value > calcLimit) {
              closed = true
            } else {
              open.unshift(neighbors[i])
            }
          }
          // Set new value
          integrationField[arrayPos] = value
        }
      }
    }
    // Free worker and send back integration field
    isCalculating = false
    calcTime = performance.now() - tsStart
    zeroCopyTransferIntegrationBuffer()
  }

  function tinyHandleCalculation () {
    if (isCalculating) {
      return
    }
    // Lock this worker
    isCalculating = true
    const tsStart = performance.now()
    // First, we need to add the player position to the
    // ...WASM's buffer
    wasm.instance.exports.setPlayerX(Math.round(goalPosition.x - offsetVector.x))
    wasm.instance.exports.setPlayerY(Math.round(goalPosition.y - offsetVector.y))
    // Set co-players, too
    if (coPlayers && coPlayers.size > 0) {
      let n = 0
      coPlayers.forEach((val) => {
        wasm.instance.exports.setCoPlayerX(n, Math.round(val.x) - 1)
        wasm.instance.exports.setCoPlayerY(n, Math.round(val.y) - 1)
        n += 1
      })
    }
    // Let the WASM module calculate for us
    wasm.instance.exports.calculate()
    integrationField = tinyGetGrid()
    // Free worker and send back integration field
    isCalculating = false
    calcTime = performance.now() - tsStart
    zeroCopyTransferIntegrationBuffer()
  }

  /**
   * Initializes the integration grid by setting every field to the highest value
   */
  function initializeIntegrationGrid () {
    for (let i = 0; i < totalCells; i++) {
      integrationField[i] = 65535
    }
  }

  /**
   *
   * @param x
   * @param y
   * @return {*}
   */
  function convertXYToArrayPos (x, y) {
    return xCells * y + x
  }

  /**
   * Returns all existing neighbors of a given cell.
   * If the provided cell lives on an edge or border,
   * fewer neighbors will be returned.
   *
   * There can be a maximum of 8 neighbors:
   *
   * ```
   *    N  N  N
   *    N  C  N
   *    N  N  N
   * ```
   *
   * Walls (out of bounds) can reduce this number, though.
   * In the following example, we will only have 3 neighbors
   *
   * ```
   *    /  —  —
   *    |  C  N
   *    |  N  N
   * ```
   *
   * We will read the neighbors in the following order:
   *
   * ```
   *    1  2  3
   *    4  5  6
   *    7  8  9
   * ```
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Boolean=false} includeSelf
   * @return {Array}
   */
  function getNeighbors (x, y, includeSelf = false) {
    // Guard
    if (x < 0 || y < 0 || x >= xCells || y >= yCells) {
      return []
    }
    const list = []
    for (let xi = x - 1; xi <= x + 1; xi++) {
      if (xi < 0 || xi >= xCells) {
        continue
      }
      for (let yi = y - 1; yi <= y + 1; yi++) {
        if (yi < 0 || yi >= yCells) {
          continue
        }
        if (!includeSelf && xi === x && yi === y) {
          continue
        }
        list.push(new THREE.Vector2(xi, yi))
      }
    }
    return list
  }

  /**
   * Transfers the integration grid's buffer back to the master.
   * By using the buffer itself we can do this by zero copy transfer.
   */
  function zeroCopyTransferIntegrationBuffer () {
    postMessage(integrationField.buffer)
    // We have to initialize the integration grid again since we
    // ...transferred ownership to the previous array buffer
    initializeGridValues()
  }

  /**
   *
   * @param usr
   * @param posX
   * @param posY
   */
  function setCoPlayerPosition (usr, posX, posY) {
    if (coPlayers.has(usr)) {
      const pl = coPlayers.get(usr)
      pl.x = posX
      pl.y = posY
      coPlayers.set(usr, pl)
      return
    }
    coPlayers.set(usr, {
      usr: usr,
      x: posX,
      y: posY
    })
  }

  /**
   *
   * @param pos
   * @param val
   */
  function setCost (pos, val) {
    if (pos > costField.length) {
      return
    }
    costField[pos] = val
    if (prefWasm) {
      tinySetCost(pos, val)
    }
  }

  /**
   *
   * @param pos
   * @param val
   */
  function tinySetCost (pos, val) {
    wasm.instance.exports.setCost(pos, val)
  }

  /**
   *
   * @return {Promise<unknown>}
   */
  async function tinyRic () {
    go = new global.Go()
    wasm = await wikiricUtils.wasmBrowserInstantiate('./main.wasm', go.importObject)
    initializeGridValues()
    return new Promise((resolve) => {
      go.run(wasm.instance)
      // Tell the host about the offset and length for the grid buffer!
      postMessage(wasm.instance.exports.getGridIx())
      postMessage(wasm.instance.exports.getGridLen())
      resolve()
    })
  }

  /**
   *
   * @return {Uint16Array}
   */
  function tinyGetGrid () {
    return new Uint16Array(
      wasm.instance.exports.memory.buffer,
      wasm.instance.exports.getGridIx(),
      wasm.instance.exports.getGridLen())
  }
}
