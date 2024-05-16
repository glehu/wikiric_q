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
                       @click="handleCalculation"
                       icon="sym_o_manufacturing"
                       label="Calculate"
                       align="left"
                       no-caps unelevated
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
                       @click="handleSimulation"
                       icon="sym_o_network_intelligence_history"
                       label="Simulate"
                       align="left"
                       no-caps unelevated
                       class="wfull mt2 fontbold text-body2"/>
              </template>
              <template v-else>
                <div class="p2 wfull flex items-center gap-2
                            justify-between">
                  <p class="fontbold text-body2">
                    Simulating...
                  </p>
                  <q-btn color="negative"
                         label="Stop"
                         dense
                         @click="cancelSimulation"/>
                </div>
              </template>
              <q-btn color="brand-bg"
                     @click="clearAll"
                     icon="sym_o_delete"
                     label="Clear All"
                     align="left"
                     no-caps unelevated
                     class="wfull mt2 fontbold text-body2"/>
            </div>
            <div class="p3 rounded surface mt2">
              <p class="text-body1 mb2">
                Stats
              </p>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2">
                <p>Performance:</p>
                <p>{{ timeDelta }} FPS</p>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2">
                <p>Enemies:</p>
                <p>{{ enemies.length.toLocaleString() }}</p>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2">
                <p>Total Checks:</p>
                <p>{{ totalCalculations.toLocaleString() }}</p>
              </div>
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
          <q-page-sticky position="bottom-right" :offset="[18, 18]">
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
</template>

<script>
import * as THREE from 'threejs-math'

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
      gridSize: 10,
      width: 1500,
      height: 1000,
      totalCells: 0,
      xCells: 0,
      yCells: 0,
      costField: undefined,
      integrationField: undefined,
      enemies: [],
      goalX: -1,
      goalY: -1,
      goalAlive: true,
      isCalculating: false,
      isSimulating: false,
      timeDelta: 0,
      totalCalculations: 0
    }
  },
  mounted () {
    this.initFunction()
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    initFunction: function () {
      this.totalCalculations = 0
      this.initializeGridValues()
      this.initializeEnemies()
      this.initializeCanvas()
      this.initializeEnemyCanvas()
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
      // this.drawGrid()
      this.initializeCursorCanvas()
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
      this.ctx.clearRect(0, 0, this.width, this.height)
      // Draw grid
      this.ctx.strokeStyle = '#444'
      for (let x = 0; x < this.width; x += this.gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.height)
        this.ctx.stroke()
      }
      for (let y = 0; y < this.height; y += this.gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.width, y)
        this.ctx.stroke()
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
      if (xNew === this.goalX && yNew === this.goalY) {
        return
      }
      // Set highest cost value
      this.costField[arrayPos] = 255
      // Draw wall
      this.ctx.fillStyle = '#000'
      this.ctx.beginPath()
      this.ctx.moveTo(xNew, yNew)
      this.ctx.rect(xNew, yNew, this.gridSize, this.gridSize)
      this.ctx.fill()
    },
    removeWall: function (x, y) {
    },
    addGoal: function (x, y) {
      if (this.goalX !== -1 || this.goalY !== -1) {
        return
      }
      const arrayPos = this.convertXYToArrayPos(x, y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Calculate positions
      const xNew = x * this.gridSize
      const yNew = y * this.gridSize
      // Remember values
      this.goalX = x
      this.goalY = y
      // Draw goal
      this.ctx.fillStyle = '#0F0'
      this.ctx.beginPath()
      this.ctx.moveTo(xNew, yNew)
      this.ctx.rect(xNew, yNew, this.gridSize, this.gridSize)
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
      this.enemies.push(new THREE.Vector2(x, y))
      // Draw enemy
      this.ctx3.fillStyle = '#ff0000'
      this.ctx3.beginPath()
      this.ctx3.moveTo(xNew, yNew)
      this.ctx3.rect(xNew, yNew, this.gridSize, this.gridSize)
      this.ctx3.fill()
    },
    handleCalculation: async function () {
      // Integration grid always needs to be initialized
      this.initializeIntegrationGrid()
      // Check if there is a goal
      if (this.goalX === -1 || this.goalY === -1) {
        return
      }
      this.isCalculating = true
      console.log('Starting Calculation...')
      // Set integration value of goal's position to zero
      const goalArrayPos = this.convertXYToArrayPos(this.goalX, this.goalY)
      this.integrationField[goalArrayPos] = 0
      // Add goal to open list
      const open = []
      open.unshift(goalArrayPos)
      // Allocate memory for variables
      let current
      let neighbors
      let x
      let y
      let tmpXY
      let value
      let calculations = 0
      let totalCalculations = 0
      // Enter calculation loop...
      while (open.length > 0) {
        current = open.pop()
        tmpXY = this.convertArrayPosToXY(current)
        x = tmpXY[0]
        y = tmpXY[1]
        neighbors = this.getNeighbors(x, y)
        for (let i = 0; i < neighbors.length; i++) {
          // Ignore this neighbor if it is a wall (255)
          if (this.costField[neighbors[i]] >= 255) {
            continue
          }
          // Calculate the new value by first taking the current
          // ...element's value...
          value = this.integrationField[current]
          // ...and then adding the neighbor's cost
          value += this.costField[neighbors[i]]
          // Now we compare the value with its old one
          if (value < this.integrationField[neighbors[i]]) {
            // Add neighbor to open list
            if (!open.includes(neighbors[i])) {
              open.unshift(neighbors[i])
            }
            // Set new value
            this.integrationField[neighbors[i]] = value
            // Draw text
            tmpXY = this.convertArrayPosToXY(neighbors[i])
            x = tmpXY[0] * this.gridSize + 4
            y = tmpXY[1] * this.gridSize + 16
            this.ctx.font = '8px sans-serif'
            if (value < 100) {
              this.ctx.fillStyle = this.heatMapColorForValue((value / 100))
            } else {
              this.ctx.fillStyle = this.heatMapColorForValue(1)
            }
            this.ctx.fillText(`${value}`, x, y)
          }
          totalCalculations += 1
        }
        calculations += 1
        if (calculations % 100 === 0) {
          await this.timer(1)
        }
      }
      this.isCalculating = false
      console.log(
        'Calculation Finished!',
        `\n*\tMain Steps:  ${calculations}`,
        `\n*\tTotal Steps: ${totalCalculations}`)
    },
    timer: function (delay) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, delay)
      })
    },
    heatMapColorForValue: function (value) {
      const h = value * 240
      return `hsl(${h}, 100%, 50%)`
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
          list.push(this.convertXYToArrayPos(xi, yi))
        }
      }
      return list
    },
    initializeEnemies: function () {
      this.enemies = []
    },
    handleSimulation: function () {
      if (this.enemies == null || this.enemies.length < 1) {
        return
      }
      this.isSimulating = true
      console.log('Starting Simulation...')
      this.goalAlive = true
      // Allocate memory for variables
      let current
      let neighbors
      let min
      let minId
      let tmp
      let xy
      let xNew
      let yNew
      /**
       * @type {THREE.Vector2}
       */
      let endVector
      /**
       * @type {THREE.Vector2}
       */
      let newVector = new THREE.Vector2()
      let timestamp = performance.now()
      const step = () => {
        this.ctx3.clearRect(0, 0, this.width, this.height)
        this.ctx3.beginPath()
        for (let i = 0; i < this.enemies.length; i++) {
          // Get current position and neighbors
          current = this.enemies[i]
          neighbors = this.getNeighbors(
            Math.round(current.x), Math.round(current.y))
          if (neighbors.length < 1) {
            continue
          }
          // Figure out what neighbor has the lowest cost
          min = 65535
          minId = -1
          for (let j = 0; j < neighbors.length; j++) {
            tmp = this.integrationField[neighbors[j]]
            this.totalCalculations += 1
            if (tmp < min) {
              min = tmp
              minId = neighbors[j]
            }
          }
          if (minId === -1) {
            continue
          }
          // Move enemy to new coordinates
          xy = this.convertArrayPosToXY(minId)
          // Interpolate position vectors
          endVector = new THREE.Vector2(
            xy[0], xy[1]
          )
          newVector = newVector.lerpVectors(
            current, endVector, 0.1)
          // Write back interpolated value
          this.enemies[i].copy(newVector)
          // Draw enemy
          xNew = newVector.x * this.gridSize
          yNew = newVector.y * this.gridSize
          this.ctx3.fillStyle = '#ff0000'
          this.ctx3.moveTo(xNew, yNew)
          this.ctx3.rect(xNew, yNew, this.gridSize, this.gridSize)
        }
        this.ctx3.fill()
        if (this.goalAlive) {
          this.timeDelta = Math.floor(
            (16 / (performance.now() - timestamp)) * 60)
          timestamp = performance.now()
          requestAnimationFrame(step)
        } else {
          this.isSimulating = false
          console.log('Simulation has ended!')
        }
      }
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
      this.goalX = -1
      this.goalY = -1
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
