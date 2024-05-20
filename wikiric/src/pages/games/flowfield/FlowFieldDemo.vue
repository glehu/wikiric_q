<template>
  <q-page class="full-height full-width flex items-center justify-center">
    <q-layout
      view="lhh LpR lff"
      container
      style="height: calc(100dvh - 52px)"
      class="overflow-hidden no-scroll">
      <q-drawer
        side="left"
        v-model="sidebarLeft"
        show-if-above
        :width="300"
        :breakpoint="768"
        class="surface-variant hfit">
        <q-scroll-area class="fit">
          <q-toolbar class="fmt_border_bottom md:hidden">
            <q-btn flat dense icon="sym_o_left_panel_close"
                   align="left" class="wfull"
                   no-caps label="Hide Sidebar"
                   @click="sidebarLeft = !sidebarLeft">
            </q-btn>
          </q-toolbar>
          <q-btn flat icon="sym_o_arrow_left_alt"
                 align="left" class="wfull pl4 mt2"
                 no-caps
                 @click="clickedBack">
            <span class="ml4 text-body1">Back</span>
          </q-btn>
          <div class="p2">
            <div class="p3 rounded surface">
              <p class="text-body1 mb2">
                Brushes
              </p>
              <q-option-group
                v-model="brush"
                :options="brushTypes"
                color="primary">
                <template v-slot:label="opt">
                  <q-icon :name="opt.icon" size="1.5rem" class="mr2"/>
                  <span class="fontbold text-body2">
                    {{ opt.label }}
                  </span>
                </template>
              </q-option-group>
            </div>
            <div class="p3 rounded surface mt2">
              <p class="text-body1 mb2">
                Actions
              </p>
              <template v-if="!isCalculating">
                <q-btn color="brand-bg"
                       text-color="brand-p"
                       @click="handleCalculation"
                       icon="sym_o_manufacturing"
                       label="Calculate"
                       align="left"
                       no-caps unelevated dense
                       class="wfull fontbold text-body2"/>
              </template>
              <template v-else>
                <div class="p2 wfull">
                  <p class="fontbold text-body2">
                    Calculating...
                  </p>
                </div>
              </template>
              <template v-if="!isSimulating">
                <q-btn color="brand-bg"
                       text-color="brand-p"
                       @click="handleSimulation"
                       icon="sym_o_network_intelligence_history"
                       label="Simulate"
                       align="left"
                       no-caps unelevated dense
                       class="wfull mt2 fontbold text-body2"/>
              </template>
              <template v-else>
                <div class="pl2 wfull flex items-center gap-2
                            justify-between py2">
                  <p class="fontbold text-body2">
                    Simulating...
                  </p>
                  <q-btn color="negative"
                         label="Stop"
                         dense
                         @click="cancelSimulation"/>
                </div>
              </template>
              <hr>
              <q-btn color="brand-bg"
                     text-color="brand-p"
                     @click="clearAll"
                     icon="sym_o_delete"
                     label="Clear All"
                     align="left"
                     no-caps unelevated dense
                     class="wfull fontbold text-body2"/>
            </div>
            <div class="p3 rounded surface mt2">
              <p class="text-body1 mb2">
                Stats
              </p>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Goal HP:</p>
                <p>{{ goalHP }}</p>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Enemies:</p>
                <p>{{ enemies.size.toLocaleString() }}</p>
              </div>
              <hr>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Performance:</p>
                <p>{{ timeDelta }} FPS</p>
              </div>
            </div>
            <div class="p3 mt2 rounded surface">
              <p class="text-body1 mb2">
                Info
              </p>
              <p class="text-subtitle2 px2">
                1. Control the goal with
                <span class="fontbold text-xs">W A S D</span>.
              </p>
              <p class="text-subtitle2 px2">
                2. Enemies damage the goal.
              </p>
              <p class="text-subtitle2 px2">
                3. Walls hinder enemy movement.
              </p>
            </div>
          </div>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page style="padding-top: 60px" class="background pb20">
          <q-page-sticky position="top" expand
                         class="background z-fab">
            <q-toolbar>
              <q-btn flat round dense icon="sym_o_dock_to_right"
                     @click="sidebarLeft = !sidebarLeft">
                <q-tooltip class="text-body2">
                  Toggle&nbsp;Sidebar
                </q-tooltip>
              </q-btn>
              <q-toolbar-title class="text-subtitle1">
                <q-breadcrumbs active-color="brand-p">
                  <q-breadcrumbs-el label="Flow Field Demo"/>
                </q-breadcrumbs>
              </q-toolbar-title>
            </q-toolbar>
          </q-page-sticky>
          <div class="ffd_container" ref="ffd_container">
            <canvas id="ffd_canvas" ref="ffd_canvas"
                    class="ffd_canvas"></canvas>
            <canvas id="ffd_canvas_cursor" ref="ffd_canvas_cursor"
                    class="ffd_canvas"></canvas>
            <canvas id="ffd_canvas_enemy" ref="ffd_canvas_enemy"
                    class="ffd_canvas"></canvas>
            <div class="ffd_main" ref="ffd_main">
            </div>
          </div>
          <q-page-sticky position="bottom-right" :offset="[18, 18]"
                         class="md:hidden">
            <q-fab
              v-model="fab"
              label=""
              vertical-actions-align="right"
              color="primary"
              icon="menu"
              direction="up">
              <q-fab-action color="primary"
                            @click="handleCalculation"
                            icon="sym_o_manufacturing"
                            label="Calculate"
                            label-position="left"/>
              <q-fab-action color="primary"
                            @click="handleSimulation"
                            icon="sym_o_network_intelligence_history"
                            label="Simulate"
                            label-position="left"/>
            </q-fab>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <div class="hidden">
    <img id="slime"
         src="https://wikiric.xyz/files/public/get/018f866a-4182-7aef-b1a4-1a75a7e7c21f"
         width="24" height="24" alt="img"/>
    <img id="floor"
         src="https://wikiric.xyz/files/public/get/018f9609-74b4-7af1-818a-dcc485456fd8"
         width="50" height="50" alt="img"/>
    <img id="wall"
         src="https://wikiric.xyz/files/public/get/018f9609-53c7-7af1-b199-8bb89b9a1a95"
         width="50" height="50" alt="img"/>
  </div>
</template>

<script>
import * as THREE from 'threejs-math'
import FFUnit from 'pages/games/flowfield/FFUnit'
import FFQuadTree from 'pages/games/flowfield/FFQuadTree'

export default {
  name: 'FlowFieldDemo',
  data () {
    return {
      fab: false,
      sidebarLeft: false,
      isDrawing: false,
      brushTypes: [
        {
          label: 'Cursor',
          value: 'cursor',
          icon: 'sym_o_web_traffic'
        },
        {
          label: 'Wall',
          value: 'wall',
          icon: 'sym_o_stop'
        },
        {
          label: 'Goal',
          value: 'goal',
          icon: 'sym_o_flag'
        },
        {
          label: 'Enemy',
          value: 'enemy',
          icon: 'sym_o_bug_report'
        },
        {
          label: 'Eraser',
          value: 'eraser',
          icon: 'sym_o_ink_eraser'
        }
      ],
      brush: 'cursor',
      ctx: null,
      ctx2: null,
      ctx3: null,
      gridSize: 50,
      width: 1550,
      height: 1000,
      totalCells: 0,
      xCells: 0,
      yCells: 0,
      costField: undefined,
      integrationField: undefined,
      enemies: new Map(),

      // PLAYABLE CHARACTER DATA

      goalPosition: undefined,
      goalHP: 1000,
      goalInvincibilityFrames: 0,
      goalAlive: true,
      goalWeapons: [],
      goalMaxRange: 0,
      goalMovementVector: new THREE.Vector2(0, 0),
      goalSpeed: 2,

      goalNorth: new THREE.Vector2(0, -1),
      goalWest: new THREE.Vector2(-1, 0),
      goalSouth: new THREE.Vector2(0, 1),
      goalEast: new THREE.Vector2(1, 0),

      goalUp: false,
      goalLeft: false,
      goalDown: false,
      goalRight: false,

      // SIMULATION DATA

      isCalculating: false,
      isSimulating: false,
      timeDelta: 0
    }
  },
  mounted () {
    this.initFunction()
  },
  beforeUnmount () {
    this.manageKeyListeners(true)
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    initFunction: function () {
      this.initializeGridValues()
      this.initializeEnemies()
      this.initializeCanvas()
      this.initializeEnemyCanvas()
      this.manageKeyListeners(false)
      this.goalWeapons.push({
        range: 40,
        dps: 5,
        amount: 2,
        cd: 50,
        _wait: 0,
        _amt: 0
      })
      this.goalMaxRange = 20
    },
    manageKeyListeners: function (forceRemove = false) {
      document.removeEventListener('keydown', this.handleFFKeyDown, false)
      document.removeEventListener('keyup', this.handleFFKeyUp, false)
      if (forceRemove) return
      document.addEventListener('keydown', this.handleFFKeyDown, false)
      document.addEventListener('keyup', this.handleFFKeyUp, false)
    },
    initializeCanvas: function () {
      // Initialize Canvas (Field)
      const canvas = this.$refs.ffd_canvas
      this.ctx = canvas.getContext('2d')
      this.ctx.lineWidth = 1
      this.ctx.lineHeight = 1
      canvas.style.minWidth = this.width + 'px'
      canvas.style.maxWidth = canvas.style.minWidth
      canvas.style.minHeight = this.height + 'px'
      canvas.style.maxHeight = canvas.style.minHeight
      canvas.width = this.width
      canvas.height = this.height
      this.initializeCursorCanvas()
      this.drawGrid()
    },
    initializeCursorCanvas: function () {
      // Initialize Canvas (Cursor)
      const canvas2 = this.$refs.ffd_canvas_cursor
      this.ctx2 = canvas2.getContext('2d')
      canvas2.style.minWidth = this.width + 'px'
      canvas2.style.maxWidth = canvas2.style.minWidth
      canvas2.style.minHeight = this.height + 'px'
      canvas2.style.maxHeight = canvas2.style.minHeight
      canvas2.width = this.width
      canvas2.height = this.height
      this.ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
      const vueInst = this
      const container = this.$refs.ffd_container
      let sidebarOffset
      this.$refs.ffd_main.onmousemove = (e) => {
        vueInst.ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
        // subtract sidebar add scroll offset
        sidebarOffset = 0
        if (vueInst.sidebarLeft) {
          sidebarOffset = 300
        }
        const posX = e.clientX - sidebarOffset + container.scrollLeft
        // subtract navbar add scroll offset
        const posY = e.clientY - 50 + container.scrollTop
        const flatX = Math.floor(posX / this.gridSize) * this.gridSize
        const flatY = Math.floor(posY / this.gridSize) * this.gridSize
        if (vueInst.isDrawing) {
          vueInst.ctx2.strokeStyle = '#F00'
          vueInst.handleDrawing(flatX, flatY)
        } else {
          vueInst.ctx2.strokeStyle = '#6451a5'
        }
        vueInst.ctx2.lineWidth = 4
        vueInst.ctx2.lineHeight = 4
        vueInst.ctx2.beginPath()
        vueInst.ctx2.rect(flatX, flatY, this.gridSize, this.gridSize)
        vueInst.ctx2.stroke()
      }
      this.$refs.ffd_main.onmousedown = (e) => {
        vueInst.isDrawing = true
        vueInst.ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
        // subtract sidebar add scroll offset
        sidebarOffset = 0
        if (vueInst.sidebarLeft) {
          sidebarOffset = 300
        }
        const posX = e.clientX - sidebarOffset + container.scrollLeft
        // subtract navbar add scroll offset
        const posY = e.clientY - 50 + container.scrollTop
        const flatX = Math.floor(posX / this.gridSize) * this.gridSize
        const flatY = Math.floor(posY / this.gridSize) * this.gridSize
        vueInst.ctx2.strokeStyle = '#F00'
        vueInst.ctx2.lineWidth = 4
        vueInst.ctx2.lineHeight = 4
        vueInst.ctx2.beginPath()
        vueInst.ctx2.rect(flatX, flatY, this.gridSize, this.gridSize)
        vueInst.ctx2.stroke()
        vueInst.handleDrawing(flatX, flatY)
      }
      this.$refs.ffd_main.onmouseup = (e) => {
        vueInst.isDrawing = false
        vueInst.ctx2.clearRect(0, 0, canvas2.width, canvas2.height)
        // subtract sidebar add scroll offset
        sidebarOffset = 0
        if (vueInst.sidebarLeft) {
          sidebarOffset = 300
        }
        const posX = e.clientX - sidebarOffset + container.scrollLeft
        // subtract navbar add scroll offset
        const posY = e.clientY - 50 + container.scrollTop
        const flatX = Math.floor(posX / this.gridSize) * this.gridSize
        const flatY = Math.floor(posY / this.gridSize) * this.gridSize
        vueInst.ctx2.strokeStyle = '#6451a5'
        vueInst.ctx2.lineWidth = 4
        vueInst.ctx2.lineHeight = 4
        vueInst.ctx2.beginPath()
        vueInst.ctx2.rect(flatX, flatY, this.gridSize, this.gridSize)
        vueInst.ctx2.stroke()
      }
    },
    initializeEnemyCanvas: function () {
      const canvas = this.$refs.ffd_canvas_enemy
      this.ctx3 = canvas.getContext('2d')
      this.ctx3.lineWidth = 1
      this.ctx3.lineHeight = 1
      canvas.style.minWidth = this.width + 'px'
      canvas.style.maxWidth = canvas.style.minWidth
      canvas.style.minHeight = this.height + 'px'
      canvas.style.maxHeight = canvas.style.minHeight
      canvas.width = this.width
      canvas.height = this.height
      this.ctx3.clearRect(0, 0, this.width, this.height)
    },
    initializeGridValues: function () {
      console.log('Initializing Grid...')
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height)
      }
      if (this.ctx2) {
        this.ctx2.clearRect(0, 0, this.width, this.height)
      }
      // Calculate amount of cells
      const xCells = this.width / this.gridSize
      const yCells = this.height / this.gridSize
      const totalCells = xCells * yCells
      this.xCells = xCells
      this.yCells = yCells
      this.totalCells = totalCells
      console.log(`\tX(${xCells}) * Y(${yCells}) = ${totalCells} Cells`)
      // Initialize grid arrays
      this.costField = new Uint16Array(totalCells)
      this.integrationField = new Uint16Array(totalCells)
      // Fill with default values
      for (let i = 0; i < totalCells; i++) {
        this.costField[i] = 1
        this.integrationField[i] = 65535
      }
      console.log('Grid initialized!')
    },
    initializeIntegrationGrid: function () {
      for (let i = 0; i < this.totalCells; i++) {
        this.integrationField[i] = 65535
      }
    },
    drawGrid: function () {
      const floor = document.getElementById('floor')
      const wall = document.getElementById('wall')
      this.ctx.clearRect(0, 0, this.width, this.height)
      // Draw grid
      let xNew, yNew, arrayPos
      for (let x = 0; x < this.xCells; x++) {
        for (let y = 0; y < this.yCells; y++) {
          xNew = x * this.gridSize
          yNew = y * this.gridSize
          arrayPos = this.convertXYToArrayPos(x, y)
          if (this.costField[arrayPos] === 255) {
            this.ctx.drawImage(wall, xNew, yNew, this.gridSize, this.gridSize)
          } else {
            this.ctx.drawImage(floor, xNew, yNew, this.gridSize, this.gridSize)
          }
        }
      }
    },
    handleDrawing: function (x, y) {
      // Normalize values
      const xNew = x / this.gridSize
      const yNew = y / this.gridSize
      // Process input type
      switch (this.brush) {
        case 'wall':
          this.addWall(xNew, yNew)
          break
        case 'goal':
          this.addGoal(xNew, yNew)
          break
        case 'enemy':
          this.addEnemy(xNew, yNew)
          break
        case 'eraser':
          this.removeWall(xNew, yNew)
          break
      }
    },
    addWall: function (x, y) {
      const arrayPos = this.convertXYToArrayPos(x, y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Calculate positions
      const xNew = x * this.gridSize
      const yNew = y * this.gridSize
      // Check if we'd overwrite the goal
      if (this.goalPosition) {
        if (xNew === this.goalPosition.x && yNew === this.goalPosition.y) {
          return
        }
      }
      const image = document.getElementById('wall')
      // Set highest cost value
      this.costField[arrayPos] = 255
      // Draw wall
      this.ctx.drawImage(image, xNew, yNew, this.gridSize, this.gridSize)
    },
    removeWall: function (x, y) {
    },
    addGoal: function (x, y) {
      const arrayPos = this.convertXYToArrayPos(x, y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Remember values
      this.goalPosition = new THREE.Vector2(x, y)
      // Draw goal
      this.renderGoal()
      // Calculate integration field
      this.handleCalculation()
    },
    renderGoal: function () {
      const xNew = this.goalPosition.x * this.gridSize
      const yNew = this.goalPosition.y * this.gridSize
      this.drawGrid()
      this.ctx.fillStyle = '#0F0'
      this.ctx.beginPath()
      this.ctx.moveTo(xNew, yNew)
      this.ctx.rect(xNew + (
        this.gridSize / 4),
        yNew + (this.gridSize / 4),
        this.gridSize / 2,
        this.gridSize / 2)
      this.ctx.fill()
    },
    addEnemy: function (x, y) {
      const arrayPos = this.convertXYToArrayPos(x, y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Calculate positions
      const xNew = x * this.gridSize
      const yNew = y * this.gridSize
      // Add enemy to list
      const id = this.getUUID()
      const unit = new FFUnit(x, y, 1, id, 10, 20)
      this.enemies.set(id, unit)
      const image = document.getElementById('slime')
      // Draw enemy
      if (image) {
        this.ctx3.drawImage(image, xNew, yNew, 32, 32)
      }
    },
    handleCalculation: async function () {
      console.log('Starting Calculation...')
      // Integration grid always needs to be initialized
      this.initializeIntegrationGrid()
      // Check if there is a goal
      if (this.goalPosition.x === -1 || this.goalPosition.y === -1) {
        return
      }
      this.isCalculating = true
      const vec = new THREE.Vector2(
        Math.round(this.goalPosition.x),
        Math.round(this.goalPosition.y))
      // Set integration value of goal's position to zero
      const goalArrayPos = this.convertXYToArrayPos(vec.x, vec.y)
      this.integrationField[goalArrayPos] = 0
      // Add goal to open list
      const open = []
      open.unshift(vec)
      // Allocate memory for variables
      let current
      let neighbors
      // let x, y
      let value
      let calculations = 0
      let totalCalculations = 0
      let arrayPos, currentArrayPos
      let dist
      // Enter calculation loop...
      while (open.length > 0) {
        current = open.pop()
        currentArrayPos = this.convertXYToArrayPos(current.x, current.y)
        neighbors = this.getNeighbors(current.x, current.y)
        for (let i = 0; i < neighbors.length; i++) {
          arrayPos = this.convertXYToArrayPos(
            neighbors[i].x, neighbors[i].y)
          // Ignore this neighbor if it is a wall (255)
          if (this.costField[arrayPos] >= 255) {
            continue
          }
          // Calculate the new value by first taking the current
          // ...element's value...
          value = this.integrationField[currentArrayPos]
          // ...and then adding the neighbor's cost
          value += this.costField[arrayPos]
          // ...punish diagonal movement
          dist = current.manhattanDistanceTo(neighbors[i])
          value += dist - 1
          // Now we compare the value with its old one
          if (value < this.integrationField[arrayPos]) {
            // Add neighbor to open list
            if (!open.includes(neighbors[i])) {
              open.unshift(neighbors[i])
            }
            // Set new value
            this.integrationField[arrayPos] = value
            // // Draw heatmap
            // x = neighbors[i].x * this.gridSize
            // y = neighbors[i].y * this.gridSize
            // if (value < 32) {
            //   this.ctx.fillStyle = this.heatMapColorForValue((value / 32))
            // } else {
            //   this.ctx.fillStyle = this.heatMapColorForValue(1)
            // }
            // this.ctx.beginPath()
            // this.ctx.moveTo(x, y)
            // this.ctx.rect(x, y, this.gridSize, this.gridSize)
            // this.ctx.fill()
          }
          totalCalculations += 1
        }
        calculations += 1
      }
      this.isCalculating = false
      console.log(
        'Calculation Finished!',
        `\n*\tMain Steps:  ${calculations}`,
        `\n*\tTotal Steps: ${totalCalculations}`)
    },
    heatMapColorForValue: function (value) {
      const h = value * 240
      return `hsl(${h}, 100%, 25%)`
    },
    convertXYToArrayPos: function (x, y) {
      return this.xCells * y + x
    },
    convertArrayPosToXY: function (pos) {
      const x = Math.floor(pos % this.xCells)
      const y = Math.floor(pos / this.xCells)
      return [x, y]
    },
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
     * @return {Array}
     */
    getNeighbors: function (x, y) {
      // Guard
      if (x < 0 || y < 0 || x >= this.xCells || y >= this.yCells) {
        return []
      }
      const list = []
      for (let xi = x - 1; xi <= x + 1; xi++) {
        if (xi < 0 || xi >= this.xCells) {
          continue
        }
        for (let yi = y - 1; yi <= y + 1; yi++) {
          if (yi < 0 || yi >= this.yCells) {
            continue
          }
          if (xi === x && yi === y) {
            continue
          }
          list.push(new THREE.Vector2(xi, yi))
        }
      }
      return list
    },
    initializeEnemies: function () {
      /**
       *
       * @type {FFUnit[]}
       */
      this.enemies.clear()
    },
    handleSimulation: function () {
      console.log('Starting Simulation...')
      this.isSimulating = true
      this.goalAlive = true
      this.goalHP = 1000
      // Allocate memory for variables
      let dist, diff
      let min, minXY
      let tmp, arrayPos
      let tmpX, tmpY
      let xy
      let xNew, yNew
      /**
       * @type {THREE.Vector2[]}
       */
      let neighbors
      /**
       * @type {THREE.Vector2}
       */
      let endVector
      const image = document.getElementById('slime')
      let qtree
      const cacheMap = new Map()
      let cacheDiff
      // Step Function to be called repeatedly
      let stepCount = 0
      let timestamp = performance.now()
      let lastTime = performance.now()
      let timeDelta
      const step = () => {
        if (this.goalAlive) {
          // Calculate FPS
          tmp = performance.now()
          if (((tmp - timestamp) / 1000) >= 1) {
            timestamp = tmp
            this.timeDelta = stepCount
            stepCount = 0
          }
          // How many seconds passed?
          tmp = performance.now()
          timeDelta = (tmp - lastTime) / 1000
          lastTime = tmp
          // Schedule next step
          // MDN Docs say it's best practice to put this here
          // ...so I guess we will just do it.
          requestAnimationFrame(step)
          // Move the player!
          this.goalMovementVector = new THREE.Vector2()
          if (this.goalUp) {
            this.goalMovementVector.add(this.goalNorth)
          }
          if (this.goalLeft) {
            this.goalMovementVector.add(this.goalWest)
          }
          if (this.goalDown) {
            this.goalMovementVector.add(this.goalSouth)
          }
          if (this.goalRight) {
            this.goalMovementVector.add(this.goalEast)
          }
          this.goalMovementVector.multiplyScalar(this.goalSpeed)
          this.goalMovementVector.multiplyScalar(timeDelta)
          this.goalPosition.add(this.goalMovementVector)
          this.handleCalculation()
          this.renderGoal()
        } else {
          this.isSimulating = false
          console.log('Simulation has ended!')
        }
        // Frame-Resets
        qtree = new FFQuadTree(this.xCells / 2, this.yCells / 2, this.xCells / 2, this.yCells / 2, 4)
        cacheMap.clear()
        stepCount += 1
        this.ctx3.clearRect(0, 0, this.width, this.height)
        if (this.goalInvincibilityFrames > 0) {
          this.goalInvincibilityFrames -= 1
        }
        for (let i = 0; i < this.goalWeapons.length; i++) {
          if (this.goalWeapons[i]._wait > 0) {
            this.goalWeapons[i]._wait -= 1
            if (this.goalWeapons[i]._wait === 0) {
              this.goalWeapons[i]._amt = this.goalWeapons[i].amount
            }
          }
        }
        // Enemy actions
        if (this.enemies && this.enemies.size > 0) {
          // Add all enemies to the quadtree
          for (const [id, unit] of this.enemies) {
            if (id) qtree.insert(unit)
          }
          // Calculate new position vectors for all enemies
          for (const [id, current] of this.enemies) {
            if (!id) continue
            // Get current position
            tmpX = Math.round(current.pos.x)
            tmpY = Math.round(current.pos.y)
            tmp = this.convertXYToArrayPos(tmpX, tmpY)
            if (this.costField[tmp] === 255) {
              // We cannot move on a wall
              // In this case, we simply continue with nextPos
              xy[0] = current.newPos.x
              xy[1] = current.newPos.y
              neighbors = this.getNeighbors(current.pos.x, current.pos.y)
              if (neighbors.length < 1) {
                continue
              }
            } else {
              neighbors = this.getNeighbors(tmpX, tmpY)
              if (neighbors.length < 1) {
                continue
              }
              // Calculate the new direction
              // Figure out what neighbor has the lowest cost
              min = 65535
              minXY = undefined
              for (let j = 0; j < neighbors.length; j++) {
                arrayPos = this.convertXYToArrayPos(
                  neighbors[j].x,
                  neighbors[j].y)
                tmp = this.integrationField[arrayPos]
                if (tmp < min) {
                  min = tmp
                  minXY = neighbors[j]
                }
              }
              if (!minXY) {
                continue
              }
              xy = [minXY.x, minXY.y]
            }
            // Calculate new position vector
            endVector = new THREE.Vector2(xy[0], xy[1])
            current.newPos.copy(endVector)
            endVector.sub(current.pos)
            endVector.multiplyScalar(current.maxSpeed)
            endVector.clampScalar(-current.maxSpeed, current.maxSpeed)
            endVector.multiplyScalar(timeDelta)
            current.pos.add(endVector)
            // Calculate distance vector to avoid crowding
            tmp = 0
            endVector = null
            const others = qtree.getContents(
              tmpX - 1,
              tmpY - 1,
              tmpX + 1,
              tmpY + 1)
            for (const other of others) {
              // Ignore self
              if (other === current) {
                continue
              }
              // Did we check this yet?
              // A-B will cache A:B
              // When B wants to check B-A it can simply check,
              // If the other has already checked this combination
              cacheDiff = cacheMap.get(`${other.id}:${current.id}`)
              if (!cacheDiff) {
                // Calculate distance vector
                dist = current.pos.distanceToSquared(other.pos)
                if (dist < 0.5) {
                  tmp += 1
                  diff = new THREE.Vector2(current.pos.x, current.pos.y)
                  diff.sub(other.pos)
                  diff.divideScalar(Math.pow(dist, 2))
                  if (!endVector) {
                    endVector = new THREE.Vector2()
                  }
                  endVector.add(diff)
                  // Cache the difference for the other unit
                  diff.multiplyScalar(-1)
                  cacheMap.set(`${current.id}:${other.id}`, diff)
                }
              } else {
                tmp += 1
                // Use cached vector
                if (!endVector) {
                  endVector = new THREE.Vector2()
                }
                endVector.add(cacheDiff)
              }
            }
            if (tmp > 0) {
              // Get average
              endVector.divideScalar(tmp)
              endVector.multiplyScalar(current.maxSpeed)
              endVector.clampScalar(-current.maxSpeed, current.maxSpeed)
              endVector.multiplyScalar(timeDelta)
              current.pos.add(endVector)
            }
            // Write back enemy
            this.enemies.set(id, current)
            // Draw enemy
            if (image) {
              xNew = current.pos.x * this.gridSize
              yNew = current.pos.y * this.gridSize
              this.ctx3.drawImage(image, xNew, yNew, 32, 32)
            }
          }
          // Now check if any enemy has come close to the player
          const others = qtree.getContents(
            this.goalPosition.x - this.goalMaxRange,
            this.goalPosition.y - this.goalMaxRange,
            this.goalPosition.x + this.goalMaxRange,
            this.goalPosition.y + this.goalMaxRange)
          if (others && others.length > 0) {
            tmp = this.goalPosition
            this.ctx3.beginPath()
            this.ctx3.strokeStyle = '#F00'
            this.ctx3.lineHeight = 4
            this.ctx3.lineWidth = 4
            for (const other of others) {
              dist = tmp.distanceToSquared(other.pos)
              // Can we target this enemy?
              for (let k = 0; k < this.goalWeapons.length; k++) {
                if (this.goalWeapons[k]._wait > 0) continue
                if (dist <= this.goalWeapons[k].range) {
                  this.goalWeapons[k]._amt -= 1
                  if (this.goalWeapons[k]._amt <= 0) {
                    this.goalWeapons[k]._wait = this.goalWeapons[k].cd
                  }
                  other.hp -= this.goalWeapons[k].dps
                  if (other.hp <= 0) {
                    this.enemies.delete(other.id)
                  } else {
                    this.enemies.set(other.id, other)
                  }
                  // Draw weapon effect
                  this.ctx3.moveTo(
                    (this.goalPosition.x * this.gridSize) + this.gridSize / 2,
                    (this.goalPosition.y * this.gridSize) + this.gridSize / 2
                  )
                  this.ctx3.lineTo(
                    (other.pos.x * this.gridSize) + this.gridSize / 2,
                    (other.pos.y * this.gridSize) + this.gridSize / 2
                  )
                }
              }
              // Respect invincibility frames before damage
              if (this.goalInvincibilityFrames === 0) {
                if (dist <= 0.5) {
                  this.goalHP -= other.dps
                  this.goalInvincibilityFrames = 20
                  if (this.goalHP <= 0) {
                    this.goalHP = 0
                    this.goalAlive = false
                  }
                  break
                }
              }
            }
            this.ctx3.stroke()
          }
        }
      }
      // Start first simulation step
      requestAnimationFrame(step)
    },
    cancelSimulation: function () {
      this.goalAlive = false
    },
    clearAll: function () {
      this.initFunction()
      this.isCalculating = false
      this.isSimulating = false
      this.goalAlive = true
      this.goalPosition = new THREE.Vector2(-1, -1)
    },
    handleFFKeyDown: function (e) {
      switch (e.key) {
        case 'w':
          this.goalUp = true
          break
        case 'a':
          this.goalLeft = true
          break
        case 's':
          this.goalDown = true
          break
        case 'd':
          this.goalRight = true
          break
      }
    },
    handleFFKeyUp: function (e) {
      switch (e.key) {
        case 'w':
          this.goalUp = false
          break
        case 'a':
          this.goalLeft = false
          break
        case 's':
          this.goalDown = false
          break
        case 'd':
          this.goalRight = false
          break
      }
    },
    getUUID: function () {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      )
    }
  }
}
</script>

<style scoped>

.ffd_container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.ffd_main {
  position: absolute;
  top: 0;
  left: 0;
  width: 2000px;
  height: 1000px;
  cursor: crosshair;
}

.ffd_canvas {
  position: absolute;
}

</style>
