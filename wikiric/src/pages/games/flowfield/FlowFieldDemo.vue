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
            <div class="p3 rounded surface mb2">
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
            <div class="surface mt2 overflow-hidden">
              <div class="p3">
                <p class="text-body1">
                  Tiles
                </p>
                <template v-if="tile !== ''">
                  <p class="mt2 text-subtitle2">
                    Selected: {{ tile }}
                  </p>
                </template>
              </div>
              <div class="grid grid-cols-5">
                <q-btn @click="setBrush('floor')">
                  <img id="floor"
                       src="https://wikiric.xyz/files/public/get/018f9ca3-73c2-738d-8a28-03610cb178e5"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('floor_alt_1')">
                  <img id="floor_alt_1"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-27c6-738d-a085-ad40d23e4898"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('floor_alt_2')">
                  <img id="floor_alt_2"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-1f37-738d-b736-60ff4775b7a8"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('floor_bloody')">
                  <img id="floor_bloody"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-3b5f-738d-a45d-f14cb45cee5a"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall')">
                  <img id="wall"
                       src="https://wikiric.xyz/files/public/get/018f9609-53c7-7af1-b199-8bb89b9a1a95"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_top_left')">
                  <img id="wall_top_left"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-727d-738d-8372-7b061a335c5b"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_top_middle')">
                  <img id="wall_top_middle"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-79dd-738d-bcd9-b6f6253f98fe"
                       width="50" height="50" alt="img"/></q-btn>
                <q-btn @click="setBrush('wall_top_right')">
                  <img id="wall_top_right"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-814e-738d-a22a-288999cac241"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_left_middle')">
                  <img id="wall_left_middle"
                       src="https://wikiric.xyz/files/public/get/018f9cd8-7aa5-738d-b17d-877c475c266d"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_right_middle')">
                  <img id="wall_right_middle"
                       src="https://wikiric.xyz/files/public/get/018f9cd8-8274-738d-bbde-3004d1b69105"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_bottom_left')">
                  <img id="wall_bottom_left"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-60b5-738d-9f79-cfea517dd2cf"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_bottom_middle')">
                  <img id="wall_bottom_middle"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-6b4a-738d-8a06-c66fc7e7f795"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_bottom_right')">
                  <img id="wall_bottom_right"
                       src="https://wikiric.xyz/files/public/get/018f9cd8-738d-738d-b480-33e50482adce"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner_top_left')">
                  <img id="wall_inner_top_left"
                       src="https://wikiric.xyz/files/public/get/018f9d30-0ece-738d-89d0-59b65270c4e5"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner_top_right')">
                  <img id="wall_inner_top_right"
                       src="https://wikiric.xyz/files/public/get/018f9d30-15dd-738d-a8bb-0d3bc66a2e2a"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_base_left')">
                  <img id="wall_base_left"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-92b3-738d-afd2-1479727a4698"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_base_middle')">
                  <img id="wall_base_middle"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-8ab8-738d-a7f7-940fa063c34c"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_base_right')">
                  <img id="wall_base_right"
                       src="https://wikiric.xyz/files/public/get/018f9cd4-ad47-738d-8918-211e3a416ca9"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner_bottom_left')">
                  <img id="wall_inner_bottom_left"
                       src="https://wikiric.xyz/files/public/get/018f9d2f-f7e4-738d-874b-d1ff530bbb7f"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner_bottom_right')">
                  <img id="wall_inner_bottom_right"
                       src="https://wikiric.xyz/files/public/get/018f9d30-0121-738d-9e2f-69ef1577ee75"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner')">
                  <img id="wall_inner"
                       src="https://wikiric.xyz/files/public/get/018f9d2f-e5b6-738d-bf08-62f0e4fc3804"
                       width="50" height="50" alt="img"/>
                </q-btn>
              </div>
            </div>
            <div class="p3 rounded surface mt2">
              <p class="text-body1 mb2">
                Stats
              </p>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2 mb8">
                <p>Player HP:</p>
                <q-slider v-model="goalHP" :min="0" :max="goalMaxHP"
                          readonly
                          color="red"
                          label-always
                          switch-label-side
                          track-size="10px" thumb-size="18px"/>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2 mb8">
                <p>Player XP (Level {{ goalLevel }}):</p>
                <q-slider v-model="goalXP" :min="0" :max="goalMaxXP"
                          readonly
                          color="blue"
                          label-always
                          switch-label-side
                          track-size="10px" thumb-size="18px"/>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Enemies:</p>
                <p>{{ enemies.size.toLocaleString() }}</p>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Projectiles:</p>
                <p>{{ goalWeaponProjectiles.length.toLocaleString() }}</p>
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
            <div class="p3 rounded surface mt2">
              <p class="text-body1 mb2">
                Debugging
              </p>
              <template v-if="goalPosition">
                <div class="flex items-center justify-between
                            gap-2 px2">
                  <div>
                    <p>X: {{ goalPosition.x.toFixed(2) }}</p>
                    <p>Y: {{ goalPosition.y.toFixed(2) }}</p>
                  </div>
                  <template v-if="offsetVector">
                    <div>
                      <p>Offset: {{ offsetVector.x.toFixed(2) }}</p>
                      <p>Offset: {{ offsetVector.y.toFixed(2) }}</p>
                    </div>
                  </template>
                </div>
                <hr>
              </template>
              <q-checkbox label="Heatmap" v-model="drawHeatmap"/>
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
            <canvas id="ffd_canvas_player" ref="ffd_canvas_player"
                    class="ffd_canvas"></canvas>
            <canvas id="ffd_canvas_enemy" ref="ffd_canvas_enemy"
                    class="ffd_canvas"></canvas>
            <canvas id="ffd_canvas_cursor" ref="ffd_canvas_cursor"
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
    <img id="wizzard"
         src="https://wikiric.xyz/files/public/get/018f9cfd-e044-738d-8df8-199c73d55585"
         width="48" height="48" alt="img"/>
  </div>
</template>

<script>
import * as THREE from 'threejs-math'
import FFUnit from 'pages/games/flowfield/FFUnit'
import FFQuadTree from 'pages/games/flowfield/FFQuadTree'
import FFTilesQuadTree from 'pages/games/flowfield/FFTilesQuadTree'
import FFTile from 'pages/games/flowfield/FFTile'
import FFWeapon from 'pages/games/flowfield/FFWeapon'

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
          label: 'Tile',
          value: 'tile',
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
      tile: '',

      // TILE REFERENCES

      wizzard: '',
      tile_floor: '',
      tile_alt_1: '',
      tile_alt_2: '',
      tile_bloody: '',
      tile_box: '',
      tile_wall_top_left: '',
      tile_wall_top_middle: '',
      tile_wall_top_right: '',
      tile_wall_bottom_left: '',
      tile_wall_bottom_middle: '',
      tile_wall_bottom_right: '',
      tile_wall_left_middle: '',
      tile_wall_right_middle: '',
      tile_wall_base_left: '',
      tile_wall_base_middle: '',
      tile_wall_base_right: '',
      tile_wall_inner: '',
      tile_wall_inner_top_left: '',
      tile_wall_inner_top_right: '',
      tile_wall_inner_bottom_left: '',
      tile_wall_inner_bottom_right: '',

      // GAME DATA

      ctxPlayer: null,
      ctx: null,
      ctx2: null,
      ctx3: null,
      gridSize: 50,
      width: 1550,
      height: 900,
      totalCells: 0,
      xCells: 0,
      yCells: 0,
      costField: undefined,
      integrationField: undefined,
      enemies: new Map(),
      tileTree: null,
      offsetVector: new THREE.Vector2(0, 0),

      // PLAYABLE CHARACTER DATA

      goalPosition: new THREE.Vector2(0, 0),
      goalHP: 1000,
      goalMaxHP: 1000,
      goalXP: 0,
      goalMaxXP: 500,
      goalLevel: 1,
      goalInvincibilityFrames: 0,
      goalAlive: true,
      /**
       * @type {FFWeapon[]}
       */
      goalWeapons: [],
      /**
       * @type {FFProjectile[]}
       */
      goalWeaponProjectiles: [],
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
      timeDelta: 0,

      // DEBUG DATA

      drawHeatmap: false
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
      this.initializePlayerCanvas()
      this.initializeTileReferences()
      this.tileTree = new FFTilesQuadTree(
        this.xCells / 2,
        this.yCells / 2,
        this.xCells / 2,
        this.yCells / 2,
        50)
      this.manageKeyListeners(false)
      // Give the player something to... play with!
      this.goalWeapons.push(
        new FFWeapon(
          40,
          2,
          2,
          60,
          0.05,
          2))
      this.goalMaxRange = 10
    },
    manageKeyListeners: function (forceRemove = false) {
      document.removeEventListener('keydown', this.handleFFKeyDown, false)
      document.removeEventListener('keyup', this.handleFFKeyUp, false)
      if (forceRemove) return
      document.addEventListener('keydown', this.handleFFKeyDown, false)
      document.addEventListener('keyup', this.handleFFKeyUp, false)
    },
    initializeTileReferences: function () {
      this.wizzard = document.getElementById('wizzard')
      this.tile_floor = document.getElementById('floor')
      this.tile_alt_1 = document.getElementById('floor_alt_1')
      this.tile_alt_2 = document.getElementById('floor_alt_2')
      this.tile_bloody = document.getElementById('floor_bloody')
      this.tile_box = document.getElementById('wall')
      this.tile_wall_top_left = document.getElementById('wall_top_left')
      this.tile_wall_top_middle = document.getElementById('wall_top_middle')
      this.tile_wall_top_right = document.getElementById('wall_top_right')
      this.tile_wall_bottom_left = document.getElementById('wall_bottom_left')
      this.tile_wall_bottom_middle = document.getElementById('wall_bottom_middle')
      this.tile_wall_bottom_right = document.getElementById('wall_bottom_right')
      this.tile_wall_left_middle = document.getElementById('wall_left_middle')
      this.tile_wall_right_middle = document.getElementById('wall_right_middle')
      this.tile_wall_base_left = document.getElementById('wall_base_left')
      this.tile_wall_base_middle = document.getElementById('wall_base_middle')
      this.tile_wall_base_right = document.getElementById('wall_base_right')
      this.tile_wall_inner_top_left = document.getElementById('wall_inner_top_left')
      this.tile_wall_inner_top_right = document.getElementById('wall_inner_top_right')
      this.tile_wall_inner_bottom_left = document.getElementById('wall_inner_bottom_left')
      this.tile_wall_inner_bottom_right = document.getElementById('wall_inner_bottom_right')
      this.tile_wall_inner = document.getElementById('wall_inner')
    },
    getTile: function (override = '') {
      let val
      if (override && override !== '') {
        val = override
      } else {
        val = this.tile
      }
      switch (val) {
        case 'floor':
          return this.tile_floor
        case 'floor_alt_1':
          return this.tile_alt_1
        case 'floor_alt_2':
          return this.tile_alt_2
        case 'floor_bloody':
          return this.tile_bloody
        case 'wall':
          return this.tile_box
        case 'wall_top_left':
          return this.tile_wall_top_left
        case 'wall_top_middle':
          return this.tile_wall_top_middle
        case 'wall_top_right':
          return this.tile_wall_top_right
        case 'wall_bottom_left':
          return this.tile_wall_bottom_left
        case 'wall_bottom_middle':
          return this.tile_wall_bottom_middle
        case 'wall_bottom_right':
          return this.tile_wall_bottom_right
        case 'wall_left_middle':
          return this.tile_wall_left_middle
        case 'wall_right_middle':
          return this.tile_wall_right_middle
        case 'wall_base_left':
          return this.tile_wall_base_left
        case 'wall_base_middle':
          return this.tile_wall_base_middle
        case 'wall_base_right':
          return this.tile_wall_base_right
        case 'wall_inner_top_left':
          return this.tile_wall_inner_top_left
        case 'wall_inner_top_right':
          return this.tile_wall_inner_top_right
        case 'wall_inner_bottom_left':
          return this.tile_wall_inner_bottom_left
        case 'wall_inner_bottom_right':
          return this.tile_wall_inner_bottom_right
        case 'wall_inner':
          return this.tile_wall_inner
      }
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
    initializePlayerCanvas: function () {
      const canvas = this.$refs.ffd_canvas_player
      this.ctxPlayer = canvas.getContext('2d')
      this.ctxPlayer.lineWidth = 1
      this.ctxPlayer.lineHeight = 1
      canvas.style.minWidth = this.width + 'px'
      canvas.style.maxWidth = canvas.style.minWidth
      canvas.style.minHeight = this.height + 'px'
      canvas.style.maxHeight = canvas.style.minHeight
      canvas.width = this.width
      canvas.height = this.height
      this.ctxPlayer.clearRect(0, 0, this.width, this.height)
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
      const xCells = (this.width / this.gridSize) * 2
      const yCells = (this.height / this.gridSize) * 2
      const totalCells = xCells * yCells
      this.xCells = xCells
      this.yCells = yCells
      this.totalCells = totalCells
      console.log(`\tX(${this.xCells}) * Y(${this.yCells}) = ${this.totalCells} Cells`)
      // Initialize grid arrays
      this.costField = new Uint16Array(totalCells)
      this.integrationField = new Uint16Array(totalCells)
      // Fill with default values
      for (let i = 0; i < this.totalCells; i++) {
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
      // Only draw the area around the player to avoid having
      // ...to render unnecessarily
      const vDist = 30
      let xStart = Math.round(this.goalPosition.x - this.offsetVector.x - vDist)
      if (xStart < 0) xStart = 0
      let xEnd = Math.round(this.goalPosition.x - this.offsetVector.x + vDist)
      if (xEnd > this.xCells) xEnd = 0
      let yStart = Math.round(this.goalPosition.y - this.offsetVector.y - vDist)
      if (yStart < 0) yStart = 0
      let yEnd = Math.round(this.goalPosition.y - this.offsetVector.y + vDist)
      if (yEnd > this.yCells) yEnd = this.yCells
      // Clear field
      this.ctx.clearRect(0, 0, this.width, this.height)
      // Draw grid
      let xNew, yNew, arrayPos
      for (let x = xStart; x < xEnd; x++) {
        for (let y = yStart; y < yEnd; y++) {
          xNew = (x + this.offsetVector.x) * this.gridSize
          yNew = (y + this.offsetVector.y) * this.gridSize
          arrayPos = this.convertXYToArrayPos(x, y)
          if (this.costField[arrayPos] !== 255) {
            this.ctx.drawImage(floor, xNew, yNew, this.gridSize, this.gridSize)
          }
        }
      }
    },
    handleDrawing: function (x, y) {
      // Consider offset
      let xNew, yNew
      xNew = x
      yNew = y
      if (this.offsetVector) {
        xNew -= (this.offsetVector.x * this.gridSize)
        yNew -= (this.offsetVector.y * this.gridSize)
      }
      xNew = Math.round(xNew / this.gridSize)
      yNew = Math.round(yNew / this.gridSize)
      const position = new THREE.Vector2(xNew, yNew)
      // Process input type
      switch (this.brush) {
        case 'wall':
          this.addWall(position)
          // Re-calculate flow field
          this.handleCalculation()
          break
        case 'tile':
          this.addTile(position)
          break
        case 'goal':
          this.addGoal(position)
          break
        case 'enemy':
          this.addEnemy(position)
          break
        case 'eraser':
          this.removeWall(position)
          break
      }
    },
    addWall: function (position) {
      const arrayPos = this.convertXYToArrayPos(position.x, position.y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Calculate positions
      const xNew = position.x * this.gridSize
      const yNew = position.y * this.gridSize
      // Check if we'd overwrite the goal
      if (this.goalPosition) {
        if (xNew === this.goalPosition.x && yNew === this.goalPosition.y) {
          return
        }
      }
      const tile = new FFTile(position.x, position.y, xNew, yNew, this.tile)
      this.tileTree.insert(tile)
      // Set highest cost value
      this.costField[arrayPos] = 255
      this.renderTiles(this.offsetVector)
    },
    addTile: function (position) {
      const arrayPos = this.convertXYToArrayPos(position.x, position.y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Calculate positions
      const xNew = position.x * this.gridSize
      const yNew = position.y * this.gridSize
      // Check if we'd overwrite the goal
      if (this.goalPosition) {
        if (xNew === this.goalPosition.x && yNew === this.goalPosition.y) {
          return
        }
      }
      const tile = new FFTile(position.x, position.y, xNew, yNew, this.tile)
      this.tileTree.insert(tile)
      this.renderTiles(this.offsetVector)
    },
    /**
     *
     * @param {THREE.Vector2} offset
     */
    renderTiles: function (offset) {
      // Culling! Don't render what's too far away
      const vDist = 30
      const xx = this.goalPosition.x - offset.x
      const yy = this.goalPosition.y - offset.y
      const tiles = this.tileTree.getContents(
        xx - vDist, yy - vDist, xx + vDist, yy + vDist
      )
      let image
      const gSize = this.gridSize
      let x, y
      for (const tile of tiles) {
        image = this.getTile(tile.name)
        x = tile.posVisual.x
        y = tile.posVisual.y
        if (offset) {
          x += offset.x * this.gridSize
          y += offset.y * this.gridSize
        }
        this.ctx.drawImage(
          image,
          x,
          y,
          gSize,
          gSize)
      }
    },
    removeWall: function (position) {
    },
    addGoal: function (position) {
      const arrayPos = this.convertXYToArrayPos(position.x, position.y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Remember values
      this.goalPosition = position
      // Draw goal
      this.renderGoal()
      // Calculate integration field
      this.handleCalculation()
    },
    renderGoal: function () {
      const xNew = this.goalPosition.x * this.gridSize
      const yNew = this.goalPosition.y * this.gridSize
      this.ctxPlayer.clearRect(0, 0, this.width, this.height)
      this.ctxPlayer.drawImage(this.wizzard, xNew + 5, yNew + 5)
    },
    addEnemy: function (position) {
      const arrayPos = this.convertXYToArrayPos(position.x, position.y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Calculate positions
      const xNew = position.x * this.gridSize
      const yNew = position.y * this.gridSize
      // Add enemy to list
      const id = this.getUUID()
      const unit = new FFUnit(
        position.x,
        position.y,
        1,
        id,
        10,
        20,
        50)
      this.enemies.set(id, unit)
      const image = document.getElementById('slime')
      // Draw enemy
      if (image) {
        this.ctx3.drawImage(image, xNew, yNew, 32, 32)
      }
    },
    handleCalculation: async function () {
      // this.ctx.clearRect(0, 0, this.width, this.height)
      // Integration grid always needs to be initialized
      this.initializeIntegrationGrid()
      // Check if there is a goal
      if (this.goalPosition.x === -1 || this.goalPosition.y === -1) {
        return
      }
      this.isCalculating = true
      const vec = new THREE.Vector2(
        Math.round(this.goalPosition.x - this.offsetVector.x),
        Math.round(this.goalPosition.y - this.offsetVector.y))
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
      let arrayPos, currentArrayPos
      let dist
      // Enter calculation loop...
      let debugFirst = true
      while (open.length > 0) {
        current = open.pop()
        currentArrayPos = this.convertXYToArrayPos(current.x, current.y)
        neighbors = this.getNeighbors(current.x, current.y)
        if (debugFirst) {
          debugFirst = false
        }
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
            // Draw heatmap
            if (this.drawHeatmap) {
              const x = (neighbors[i].x + this.offsetVector.x) * this.gridSize
              const y = (neighbors[i].y + this.offsetVector.y) * this.gridSize
              if (value < 32) {
                this.ctx.fillStyle = this.heatMapColorForValue((value / 32))
              } else {
                this.ctx.fillStyle = this.heatMapColorForValue(1)
              }
              this.ctx.beginPath()
              this.ctx.moveTo(x, y)
              this.ctx.rect(x, y, this.gridSize, this.gridSize)
              this.ctx.fill()
            }
          }
        }
      }
      this.isCalculating = false
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
      let lastPos
      let shootResult
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
          this.applyGoalMovement(endVector, timeDelta)
          // Draw environment
          this.drawGrid()
          lastPos = this.applyGoalCalculation(lastPos)
          // Display player
          this.renderGoal()
          this.renderTiles(this.offsetVector)
        } else {
          this.isSimulating = false
          console.log('Simulation has ended!')
        }
        // Frame-Resets
        qtree = new FFQuadTree(this.xCells / 2, this.yCells / 2, this.xCells / 2, this.yCells / 2, 4)
        cacheMap.clear()
        stepCount += 1
        this.ctx3.clearRect(0, 0, this.width, this.height)
        // Reduce invincibility frames
        if (this.goalInvincibilityFrames > 0) {
          this.goalInvincibilityFrames -= 1
        }
        // Reduce weapon cooldown
        for (let i = 0; i < this.goalWeapons.length; i++) {
          this.goalWeapons[i].processTick()
        }
        // #### ENEMY ACTIONS ####
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
              xNew = (current.pos.x + this.offsetVector.x) * this.gridSize
              yNew = (current.pos.y + this.offsetVector.y) * this.gridSize
              this.ctx3.drawImage(image, xNew, yNew, 32, 32)
            }
          }
          // #### WEAPON ACTIONS ####
          // Render projectiles
          if (this.goalWeaponProjectiles.length > 0) {
            let projectile
            for (let i = this.goalWeaponProjectiles.length - 1; i > 0; i--) {
              projectile = this.goalWeaponProjectiles[i]
              // Move projectile
              projectile.pos.add(projectile.vec)
              // Is the projectile still inside bounds?
              if (projectile.pos.x < 0 || projectile.pos.x > this.width ||
                projectile.pos.y < 0 || projectile.pos.y > this.height) {
                this.goalWeaponProjectiles.splice(i, 1)
                continue
              }
              // Render projectile
              this.ctx3.beginPath()
              this.ctx3.fillStyle = '#F00'
              this.ctx3.lineHeight = 4
              this.ctx3.lineWidth = 4
              this.ctx3.rect(
                ((projectile.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2,
                ((projectile.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2,
                4, 4
              )
              this.ctx3.fill()
              // Did the projectile hit something?
              const enemies = qtree.getContents(
                projectile.pos.x - 2,
                projectile.pos.y - 2,
                projectile.pos.x + 2,
                projectile.pos.y + 2)
              if (enemies && enemies.length > 0) {
                tmp = new THREE.Vector2()
                tmp.copy(projectile.pos)
                this.ctx3.beginPath()
                this.ctx3.strokeStyle = '#fff400'
                this.ctx3.lineHeight = 2
                this.ctx3.lineWidth = 2
                for (const enemy of enemies) {
                  if (projectile.hitCount === 0) {
                    break
                  }
                  dist = tmp.distanceToSquared(enemy.pos)
                  if (dist <= 0.5) {
                    projectile.hitCount -= 1
                    enemy.hp -= projectile.dmg
                    if (enemy.hp <= 0) {
                      this.goalXP += enemy.xp
                      this.checkXP()
                      this.enemies.delete(enemy.id)
                    } else {
                      this.enemies.set(enemy.id, enemy)
                    }
                    // Draw weapon effect
                    this.ctx3.moveTo(
                      ((projectile.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2,
                      ((projectile.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2
                    )
                    this.ctx3.lineTo(
                      ((enemy.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2,
                      ((enemy.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2
                    )
                  }
                }
                if (projectile.hitCount === 0) {
                  this.goalWeaponProjectiles.splice(i, 1)
                  continue
                }
                this.ctx3.stroke()
              }
              this.goalWeaponProjectiles[i] = projectile
            }
          }
          // Now check if any enemy has come close to the player
          const others = qtree.getContents(
            this.goalPosition.x - this.offsetVector.x - this.goalMaxRange,
            this.goalPosition.y - this.offsetVector.y - this.goalMaxRange,
            this.goalPosition.x - this.offsetVector.x + this.goalMaxRange,
            this.goalPosition.y - this.offsetVector.y + this.goalMaxRange)
          if (others && others.length > 0) {
            tmp = new THREE.Vector2()
            tmp.copy(this.goalPosition)
            tmp.sub(this.offsetVector)
            this.ctx3.beginPath()
            this.ctx3.strokeStyle = '#F00'
            this.ctx3.lineHeight = 4
            this.ctx3.lineWidth = 4
            const position = new THREE.Vector2()
            position.copy(this.goalPosition)
            position.sub(this.offsetVector)
            let direction
            for (const other of others) {
              dist = tmp.distanceToSquared(other.pos)
              for (let k = 0; k < this.goalWeapons.length; k++) {
                direction = new THREE.Vector2()
                direction.copy(other.pos)
                direction.sub(position)
                shootResult = this.goalWeapons[k].shoot(
                  position,
                  direction,
                  dist
                )
                if (shootResult) {
                  if (shootResult.speed === 0) {
                    // Beam - Directly damage enemy
                    other.hp -= shootResult.dmg
                    if (other.hp <= 0) {
                      this.goalXP += other.xp
                      this.checkXP()
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
                      ((other.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2,
                      ((other.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2
                    )
                  } else {
                    // Projectile - Add to projectiles
                    this.goalWeaponProjectiles.push(shootResult)
                  }
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
    applyGoalCalculation: function (lastPos) {
      if (this.drawHeatmap) {
        this.handleCalculation()
      } else {
        if (!lastPos) {
          lastPos = new THREE.Vector2(
            Math.round(this.goalPosition.x - this.offsetVector.x),
            Math.round(this.goalPosition.y - this.offsetVector.y))
          this.handleCalculation()
        } else {
          if (Math.round(this.goalPosition.x - this.offsetVector.x) !== lastPos.x ||
            Math.round(this.goalPosition.y - this.offsetVector.y) !== lastPos.y) {
            lastPos = new THREE.Vector2(
              Math.round(this.goalPosition.x - this.offsetVector.x),
              Math.round(this.goalPosition.y - this.offsetVector.y))
            // Calculate new paths
            setTimeout(() => {
              this.handleCalculation()
            }, 0)
          }
        }
      }
      return lastPos
    },
    /**
     * Moves the player (goal)
     *
     * @param {THREE.Vector2} endVector
     * @param {Number} timeDelta
     */
    applyGoalMovement: function (endVector, timeDelta) {
      // If the player moved half the screen's distance
      // ...in any direction, we will translate the movement
      // ...that would further exceed this to the environment.
      this.goalMovementVector = new THREE.Vector2()
      endVector = new THREE.Vector2()
      if (this.goalUp) {
        if (this.goalPosition.y >= (this.yCells / 4)) {
          endVector.add(this.goalSouth)
        } else {
          this.goalMovementVector.add(this.goalNorth)
        }
      }
      if (this.goalLeft) {
        if (this.goalPosition.x >= (this.xCells / 4)) {
          endVector.add(this.goalEast)
        } else {
          this.goalMovementVector.add(this.goalWest)
        }
      }
      if (this.goalDown) {
        if (this.goalPosition.y >= (this.yCells / 4)) {
          endVector.add(this.goalNorth)
        } else {
          this.goalMovementVector.add(this.goalSouth)
        }
      }
      if (this.goalRight) {
        if (this.goalPosition.x >= (this.xCells / 4)) {
          endVector.add(this.goalWest)
        } else {
          this.goalMovementVector.add(this.goalEast)
        }
      }
      // // Don't forget to free the player!
      if (this.offsetVector.x > 0) {
        this.offsetVector.x = 0
        this.goalMovementVector.add(this.goalWest)
      }
      if (this.offsetVector.y > 0) {
        this.offsetVector.y = 0
        this.goalMovementVector.add(this.goalNorth)
      }
      endVector.multiplyScalar(this.goalSpeed)
      endVector.multiplyScalar(timeDelta)
      this.offsetVector.add(endVector)
      // Apply movement to player position
      this.goalMovementVector.multiplyScalar(this.goalSpeed)
      this.goalMovementVector.multiplyScalar(timeDelta)
      this.goalPosition.add(this.goalMovementVector)
    },
    cancelSimulation: function () {
      this.goalAlive = false
    },
    clearAll: function () {
      // Cancel game loop
      this.goalAlive = false
      // Set defaults
      this.initFunction()
      this.isCalculating = false
      this.isSimulating = false
      this.goalHP = 1000
      this.goalXP = 0
      this.goalPosition = new THREE.Vector2(-1, -1)
      this.offsetVector = new THREE.Vector2()
      this.goalWeaponProjectiles = []
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
    },
    setBrush: function (tile) {
      this.tile = tile
    },
    checkXP: function () {
      if (this.goalXP >= this.goalMaxXP) {
        this.goalXP = 0
        this.goalLevel += 1
        this.goalMaxXP = this.goalMaxXP * 1.5
      }
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
