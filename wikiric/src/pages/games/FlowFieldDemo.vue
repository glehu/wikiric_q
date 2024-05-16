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
              <p class="text-body1">
                Brushes
              </p>
              <q-option-group
                v-model="brush"
                :options="brushTypes"
                color="primary">
                <template v-slot:label="opt">
                  <q-icon :name="opt.icon" size="1.5rem" class="mr2"/>
                  <span class="fontbold text-body2">{{ opt.label }}</span>
                </template>
              </q-option-group>
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
                            icon="sym_o_network_intelligence_history"
                            label="Calculate"
                            label-position="left"/>
            </q-fab>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
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
          label: 'Eraser',
          value: 'eraser',
          icon: 'sym_o_ink_eraser'
        }
      ],
      brush: 'cursor',
      ctx: null,
      ctx2: null,
      gridSize: 25,
      width: 2000,
      height: 1000,
      totalCells: 0,
      xCells: 0,
      yCells: 0,
      costField: undefined,
      integrationField: undefined,
      flowField: undefined,
      goalX: -1,
      goalY: -1
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
      this.initializeGridValues()
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
      this.drawGrid()
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
    initializeGridValues: function () {
      // Calculate amount of cells
      const xCells = this.width / this.gridSize
      const yCells = this.height / this.gridSize
      const totalCells = xCells * yCells
      this.xCells = xCells
      this.yCells = yCells
      this.totalCells = totalCells
      console.log(`X(${xCells}) * Y(${yCells}) = ${totalCells} Cells`)
      // Initialize grid arrays
      this.costField = new Uint16Array(totalCells)
      this.integrationField = new Uint16Array(totalCells)
      // Fill with default values
      for (let i = 0; i < totalCells; i++) {
        this.costField[i] = 1
        this.integrationField[i] = 65535
      }
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
      // Draw wall
      this.ctx.fillStyle = '#0F0'
      this.ctx.beginPath()
      this.ctx.moveTo(xNew, yNew)
      this.ctx.rect(xNew, yNew, this.gridSize, this.gridSize)
      this.ctx.fill()
    },
    handleCalculation: async function () {
      // Integration grid always needs to be initialized
      this.initializeIntegrationGrid()
      // Check if there is a goal
      if (this.goalX === -1 || this.goalY === -1) {
        return
      }
      // Set integration value of goal's position to zero
      const goalArrayPos = this.convertXYToArrayPos(this.goalX, this.goalY)
      this.integrationField[goalArrayPos] = 0
      // Add goal to open list
      const open = []
      open.unshift(goalArrayPos)
      // Enter calculation loop...
      let current
      let neighbors
      let x
      let y
      let tmpXY
      let value
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
            this.ctx.font = '10px sans-serif'
            if (value < 30) {
              this.ctx.fillStyle = this.heatMapColorForValue((value / 30))
            } else {
              this.ctx.fillStyle = this.heatMapColorForValue(1)
            }
            this.ctx.fillText(`${value}`, x, y)
          }
        }
        await this.timer(1)
      }
    },
    timer: function (delay) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, delay)
      })
    },
    heatMapColorForValue: function (value) {
      const h = (1.0 - value) * 240
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
