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
        behavior="desktop"
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
              <template v-if="!isSimulating">
                <q-btn color="brand-bg"
                       text-color="brand-p"
                       @click="handleSimulation(false)"
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
                     @click="saveMap"
                     icon="sym_o_save"
                     label="Save Map"
                     align="left"
                     no-caps unelevated dense
                     class="wfull fontbold text-body2"/>
              <q-btn color="brand-bg"
                     text-color="brand-p"
                     @click="pickMap"
                     icon="sym_o_upload"
                     label="Load Map"
                     align="left"
                     no-caps unelevated dense
                     class="wfull mt2 fontbold text-body2"/>
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
            <div class="p3 rounded surface my2">
              <p class="text-body1 mb2">
                Stats
              </p>
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
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Server:</p>
                <p>{{ roomId }}</p>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Players:</p>
                <p>{{ sessions.size }}</p>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Latency:</p>
                <p>{{ latency }} ms</p>
              </div>
              <div class="flex justify-between items-center gap-2
                          text-subtitle2 px2">
                <p>Host:</p>
                <p>{{ isHost }}</p>
              </div>
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
                <q-btn @click="setBrush('wall_inner')">
                  <img id="wall_inner"
                       src="https://wikiric.xyz/files/public/get/018f9d2f-e5b6-738d-bf08-62f0e4fc3804"
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
                <q-btn @click="setBrush('tile_floor_top_left')">
                  <img id="tile_floor_top_left"
                       src="https://wikiric.xyz/files/public/get/018ff89b-2be3-726d-8f5b-3fd169bef028"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_top')">
                  <img id="tile_floor_top"
                       src="https://wikiric.xyz/files/public/get/018ff89b-3a8d-726d-8599-f136d6cf4f9f"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_top_right')">
                  <img id="tile_floor_top_right"
                       src="https://wikiric.xyz/files/public/get/018ff89b-334f-726d-8682-5e0349842350"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_col_top')">
                  <img id="tile_wall_col_top"
                       src="https://wikiric.xyz/files/public/get/018ff89a-ee17-726d-8b70-d8a4bb5fb0b0"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <div></div>
                <q-btn @click="setBrush('tile_floor_left')">
                  <img id="tile_floor_left"
                       src="https://wikiric.xyz/files/public/get/018ff89b-2365-726d-b1fd-e73cd5b94db5"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('floor')">
                  <img id="floor"
                       src="https://wikiric.xyz/files/public/get/018f9ca3-73c2-738d-8a28-03610cb178e5"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_right')">
                  <img id="tile_floor_right"
                       src="https://wikiric.xyz/files/public/get/018ff89b-1b17-726d-8cba-20fc99a2eb07"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_col_middle')">
                  <img id="tile_wall_col_middle"
                       src="https://wikiric.xyz/files/public/get/018ff89a-e3a5-726d-b8b0-86fca58347a7"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <div></div>
                <q-btn @click="setBrush('tile_floor_bottom_left')">
                  <img id="tile_floor_bottom_left"
                       src="https://wikiric.xyz/files/public/get/018ff89a-fe4f-726d-8cbe-c24a0bdbf554"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_bottom')">
                  <img id="tile_floor_bottom"
                       src="https://wikiric.xyz/files/public/get/018ff89b-05da-726d-b59f-ca5d553eb816"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_bottom_right')">
                  <img id="tile_floor_bottom_right"
                       src="https://wikiric.xyz/files/public/get/018ff89b-0c99-726d-9f39-d19440513f8d"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_col_bottom')">
                  <img id="tile_wall_col_bottom"
                       src="https://wikiric.xyz/files/public/get/018ff89a-dc3c-726d-8ad4-0952740cde0f"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <div></div>
                <q-btn @click="setBrush('tile_wall_left')">
                  <img id="tile_wall_left"
                       src="https://wikiric.xyz/files/public/get/018ff89a-b89e-726d-859f-12c7e353b742"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_middle')">
                  <img id="tile_wall_middle"
                       src="https://wikiric.xyz/files/public/get/018ff89a-c267-726d-8ed7-4ef504382a55"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_right')">
                  <img id="tile_wall_right"
                       src="https://wikiric.xyz/files/public/get/018ff89a-cdd6-726d-9f0a-386d6490eb86"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_col_base')">
                  <img id="tile_wall_col_base"
                       src="https://wikiric.xyz/files/public/get/018ff89a-d566-726d-8e82-17b39c29ede5"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <div></div>
                <q-btn @click="setBrush('tile_wall_base_left_2')">
                  <img id="tile_wall_base_left_2"
                       src="https://wikiric.xyz/files/public/get/018ff89a-982c-726d-9405-f555e6c1247a"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_base_middle_2')">
                  <img id="tile_wall_base_middle_2"
                       src="https://wikiric.xyz/files/public/get/018ff89a-a452-726d-aac1-46b39f8ef66a"
                       width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_base_right_2')">
                  <img id="tile_wall_base_right_2"
                       src="https://wikiric.xyz/files/public/get/018ff89a-b1b4-726d-9610-9d1c8d19defb"
                       width="50" height="50" alt="img"/>
                </q-btn>
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
              <q-checkbox label="Damage Numbers" v-model="drawDamageNumbers"/>
              <q-checkbox label="Heatmap" v-model="drawHeatmap"/>
              <q-checkbox label="Wall Collisions" v-model="drawWallCollision"/>
              <p class="text-body1 my2">
                Position Data
              </p>
              <template v-if="goalPosition">
                <div class="flex items-center justify-between
                            gap-2 px2 text-sm">
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
              <template v-if="coPlayers && coPlayers.size > 0">
                <template v-for="[key, val] of coPlayers.entries()" :key="key">
                  <div class="flex items-center justify-between
                              gap-2 px2">
                    <div class="text-sm">
                      <p>{{ key }}</p>
                      <p>X: {{ val.x.toFixed(2) }}</p>
                      <p>Y: {{ val.y.toFixed(2) }}</p>
                      <p>U: {{ val.up }}</p>
                      <p>R: {{ val.right }}</p>
                      <p>D: {{ val.down }}</p>
                      <p>L: {{ val.left }}</p>
                      <template v-if="val.weapons">
                        <div v-for="wpn in val.weapons" :key="wpn"
                             class="background p2 rounded mt2
                                    text-sm">
                          <p>
                            <span class="font-bold pr2">{{ wpn.name }}</span>
                            Lv. {{ wpn.level }}
                          </p>
                          <template v-if="wpn.powerUps">
                            <div v-for="pup in wpn.powerUps" :key="pup">
                              <p>{{ pup.name }}</p>
                            </div>
                          </template>
                        </div>
                      </template>
                    </div>
                  </div>
                  <hr>
                </template>
              </template>
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
            <div class="ffd_main" ref="ffd_main"></div>
          </div>
          <div id="ffd_size"
               class="min-w-[100dvw] max-w-[100dvw]
                      min-h-[100dvh] max-h-[100dvh]
                      fixed top-0 left-0 pointer-events-none"></div>
          <q-page-sticky position="top" :offset="[0, 38]">
            <div id="ffd_exp_gui"
                 class="flex wfull px2
                        min-w-[100dvw] max-w-[100dvw]
                        justify-center items-start">
              <div class="wfull
                          rounded-b-2 text-subtitle2
                          justify-center
                          flex items-start">
                <q-slider v-model="goalXP" :min="0" :max="goalMaxXP"
                          readonly
                          color="blue"
                          track-size="16px" thumb-size="18px"
                          class="w-full"/>
                <div class="flex wfull justify-end px2 fontbold
                            -translate-y-2">
                  <div class="text-right">
                    <p class="text-sm cursor-default">
                      {{ goalKills }} Kills
                    </p>
                    <div class="flex column gap-1 text-right">
                      <p class="text-sm cursor-default">
                        {{ roomId }}
                      </p>
                      <template v-for="[key, val] of sessions.entries()" :key="key.u">
                        <div class="flex items-center gap-1 text-right justify-end
                                    cursor-default">
                          <template v-if="val.o">
                            <q-icon name="cell_tower" size="1rem">
                              <q-tooltip>
                                <p class="text-sm fontbold">
                                  Host
                                </p>
                              </q-tooltip>
                            </q-icon>
                          </template>
                          <p class="text-xs">
                            {{ val.u }} ({{ val.l.toFixed(0) }} ms)
                          </p>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-page-sticky>
          <template v-if="isLevelUp">
            <div class="flex gap-2 justify-center items-center
                        wfull max-w-[100dvw] top-0
                        backdrop-blur-lg
                        z-99 fixed hfull pt_nav overflow-y-scroll">
              <q-card flat style="background: transparent"
                      class="wfull hfull">
                <q-card-section>
                  <p class="fontbold text-3xl text-center pt2">
                    Level Up Offers
                  </p>
                </q-card-section>
                <div class="flex gap-2 pb16">
                  <q-card-section class="flex-grow">
                    <p class="text-body1 fontbold mb2">
                      Choose a Weapon:
                    </p>
                    <template v-if="weaponOffers">
                      <div class="flex gap-2 wfull hfull">
                        <template v-for="offer in weaponOffers" :key="offer">
                          <q-btn unelevated dense no-caps flat
                                 @click="handleWeaponOffer(offer)"
                                 class="flex-grow">
                            <FFWeaponDisplay :weapon="offer" class="flex-grow"/>
                          </q-btn>
                        </template>
                      </div>
                    </template>
                  </q-card-section>
                  <q-card-section>
                    <p class="text-body1 fontbold mb2">
                      Choose a Power-Up:
                    </p>
                    <template v-if="powerUpOffers">
                      <div class="flex gap-2 wfull hfull">
                        <template v-for="offer in powerUpOffers" :key="offer">
                          <q-btn unelevated dense no-caps flat
                                 @click="handlePowerUpOffer(offer)"
                                 class="flex-grow">
                            <div class="fmt_border rounded p2
                                        wfull hfull surface">
                              <FFPowerUpDisplay :power-ups="[offer]" class="flex-grow"/>
                            </div>
                          </q-btn>
                        </template>
                      </div>
                    </template>
                  </q-card-section>
                </div>
              </q-card>
            </div>
          </template>
          <template v-if="modifyingWeapons">
            <div class="flex gap-2 justify-center items-center
                        wfull max-w-[100dvw] top-0
                        backdrop-blur-lg
                        z-99 fixed hfull pt_nav overflow-y-scroll">
              <q-card flat style="background: transparent"
                      class="wfull hfull">
                <q-card-section>
                  <p class="fontbold text-3xl text-center pt2">
                    Weapon Modification
                  </p>
                </q-card-section>
                <template v-if="chosenPowerup">
                  <div class="fmt_border rounded p2 m2">
                    <FFPowerUpDisplay :power-ups="[chosenPowerup]"/>
                  </div>
                </template>
                <q-card-section>
                  <p class="text-body1 fontbold mb2">
                    Choose a weapon to modify:
                  </p>
                  <template v-if="goalWeapons">
                    <div class="flex gap-2 wfull h-full">
                      <template v-for="weapon in goalWeapons" :key="weapon">
                        <q-btn unelevated dense no-caps flat
                               @click="handleWeaponModification(weapon)"
                               class="wfull hfull">
                          <FFWeaponDisplay :weapon="weapon" class="flex-grow"/>
                        </q-btn>
                      </template>
                    </div>
                  </template>
                </q-card-section>
              </q-card>
            </div>
          </template>
          <q-page-sticky position="bottom">
            <div class="flex gap-2 wfull min-w-[100dvw]
                        justify-center items-end">
              <div class="backdrop-brightness-50
                          h-18 px w-[40%]
                          rounded-tr text-subtitle2
                          justify-center
                          flex items-end">
                <q-slider v-model="goalHP" :min="0" :max="goalMaxHP"
                          :label-value="`${goalHP} / ${goalMaxHP} HP`"
                          readonly
                          color="red"
                          label-always
                          track-size="10px" thumb-size="14px"
                          class="w-full"/>
              </div>
              <div class="backdrop-brightness-50
                          h-18 py2 px4 flex-grow
                          rounded-tl text-subtitle2
                          flex gap-2 items-center">
                <div class="flex column gap-1">
                  <div class="flex gap-2 fontbold">
                    <p>
                      Lv: {{ goalLevel }}
                    </p>
                    <p>
                      XP: {{ goalXP }} / {{ goalMaxXP }}
                    </p>
                  </div>
                  <div class="flex gap-1">
                    <template v-if="goalWeapons && goalWeapons.length > 0">
                      <template v-for="weapon in goalWeapons" :key="weapon">
                        <FFWeaponComp :weapon="weapon" :small="true"/>
                      </template>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </q-page-sticky>
          <q-page-sticky position="bottom-right" :offset="[10, 80]"
                         class="">
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
                            @click="handleSimulation(false)"
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
  <q-slide-transition>
    <q-card v-show="isPickingMap" flat
            class="fixed bottom-0 wfull fmt_border_top">
      <q-card-section>
        <file-picker @selected="handleMapSelected"/>
      </q-card-section>
    </q-card>
  </q-slide-transition>
</template>

<script>
import * as THREE from 'threejs-math'
import FFUnit from 'pages/games/flowfield/FFUnit'
import FFQuadTree from 'pages/games/flowfield/FFQuadTree'
import FFTilesQuadTree from 'pages/games/flowfield/FFTilesQuadTree'
import FFTile from 'pages/games/flowfield/FFTile'
import FFOnHitEffect from 'pages/games/flowfield/FFOnHitEffect'
import FFWeaponComp from 'pages/games/flowfield/FFWeapon.vue'
import FFWeaponList from 'pages/games/flowfield/weapons/FFWeaponList'
import FFPowerUpList from 'pages/games/flowfield/powerups/FFPowerUpList'
import FFWeaponDisplay from 'pages/games/flowfield/FFWeaponDisplay.vue'
import FFPowerUpDisplay from 'pages/games/flowfield/FFPowerUpDisplay.vue'
import FilePicker from 'components/FilePicker.vue'
import { useStore } from 'stores/wikistate'
import FFWeapon from 'pages/games/flowfield/FFWeapon'
import FFPowerUp from 'pages/games/flowfield/FFPowerUp'
import FFPowerUpEffect from 'pages/games/flowfield/FFPowerUpEffect'
import WRTC from 'src/libs/wRTC'

export default {
  name: 'FlowFieldDemo',
  components: {
    FilePicker,
    FFPowerUpDisplay,
    FFWeaponDisplay,
    FFWeaponComp
  },
  data () {
    return {
      store: useStore(),
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
      tile_floor_top_left: '',
      tile_floor_top_right: '',
      tile_floor_bottom_left: '',
      tile_floor_bottom_right: '',
      tile_floor_top: '',
      tile_floor_bottom: '',
      tile_floor_left: '',
      tile_floor_right: '',
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
      tile_wall_base_left_2: '',
      tile_wall_base_middle_2: '',
      tile_wall_base_right_2: '',
      tile_wall_inner: '',
      tile_wall_inner_top_left: '',
      tile_wall_inner_top_right: '',
      tile_wall_inner_bottom_left: '',
      tile_wall_inner_bottom_right: '',
      tile_wall_col_base: '',
      tile_wall_col_bottom: '',
      tile_wall_col_middle: '',
      tile_wall_col_top: '',
      tile_wall_left: '',
      tile_wall_middle: '',
      tile_wall_right: '',

      // GAME DATA

      /**
       * @type CanvasRenderingContext2D
       */
      ctxPlayer: null,
      /**
       * @type CanvasRenderingContext2D
       */
      ctx: null,
      /**
       * @type CanvasRenderingContext2D
       */
      ctx2: null,
      /**
       * @type CanvasRenderingContext2D
       */
      ctx3: null,
      gridSize: 50,
      width: 1500, // 1550,
      height: 1500, // 900,
      sWidth: 0,
      sHeight: 0,
      totalCells: 0,
      xCells: 0,
      yCells: 0,
      costField: undefined,
      integrationField: undefined,
      enemies: new Map(),
      /**
       * @type FFTilesQuadTree
       */
      tileTree: null,
      offsetVector: new THREE.Vector2(0, 0),
      onHitEffects: [],
      isLevelUp: false,
      weaponList: new FFWeaponList(),
      /**
       * @type FFWeapon[]
       */
      weaponOffers: [],
      powerUpList: new FFPowerUpList(),
      /**
       * @type FFPowerUp[]
       */
      powerUpOffers: [],
      modifyingWeapons: false,
      /**
       * @type FFPowerUp
       */
      chosenPowerup: undefined,
      isPickingMap: false,

      // PLAYABLE CHARACTER DATA

      canMove: false,
      goalPosition: new THREE.Vector2(-1, -1),
      goalHP: 1000,
      goalMaxHP: 1000,
      goalXP: 0,
      goalMaxXP: 500,
      goalLevel: 1,
      goalInvincibilityFrames: 0,
      goalAlive: true,
      goalKills: 0,
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
      theta: 0,

      // DEBUG DATA

      drawHeatmap: false,
      drawDamageNumbers: true,
      drawWallCollision: false,

      // MULTIPLAYER DATA

      roomId: 'wkrg_sync_ffa_dev',
      currentSRLatency: -1,
      getQueue: new Map(),
      lastPos: null,
      isHost: false,
      dataMap: new Map(),
      playerData: new Map(),
      sessions: new Map(),
      coPlayers: new Map(),
      peerCons: new Map(),
      wrtc: WRTC
    }
  },
  mounted () {
    this.initFunction()
  },
  beforeUnmount () {
    this.manageKeyListeners(true)
  },
  computed: {
    latency () {
      if (!this.currentSRLatency || this.currentSRLatency === -1) {
        return ''
      }
      return this.currentSRLatency.toFixed(1)
    }
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    initFunction: function () {
      this.isCalculating = false
      this.isSimulating = false
      this.goalHP = 1000
      this.goalXP = 0
      this.goalMaxXP = 500
      this.goalLevel = 1
      this.goalPosition = new THREE.Vector2(-1, -1)
      this.offsetVector = new THREE.Vector2()
      this.goalWeapons = []
      this.goalWeaponProjectiles = []
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
      this.weaponList = new FFWeaponList()
      this.weaponList.initiateStarterWeapons()
      this.powerUpList = new FFPowerUpList()
      this.powerUpList.initiateStarterPowerUps()
      this.setUpPlayer()
      this.setUpSyncRoom()
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
      this.tile_floor_top_left = document.getElementById('tile_floor_top_left')
      this.tile_floor_top_right = document.getElementById('tile_floor_top_right')
      this.tile_floor_bottom_left = document.getElementById('tile_floor_bottom_left')
      this.tile_floor_bottom_right = document.getElementById('tile_floor_bottom_right')
      this.tile_floor_top = document.getElementById('tile_floor_top')
      this.tile_floor_bottom = document.getElementById('tile_floor_bottom')
      this.tile_floor_left = document.getElementById('tile_floor_left')
      this.tile_floor_right = document.getElementById('tile_floor_right')
      this.tile_wall_base_left_2 = document.getElementById('tile_wall_base_left_2')
      this.tile_wall_base_middle_2 = document.getElementById('tile_wall_base_middle_2')
      this.tile_wall_base_right_2 = document.getElementById('tile_wall_base_right_2')
      this.tile_wall_col_base = document.getElementById('tile_wall_col_base')
      this.tile_wall_col_bottom = document.getElementById('tile_wall_col_bottom')
      this.tile_wall_col_middle = document.getElementById('tile_wall_col_middle')
      this.tile_wall_col_top = document.getElementById('tile_wall_col_top')
      this.tile_wall_left = document.getElementById('tile_wall_left')
      this.tile_wall_middle = document.getElementById('tile_wall_middle')
      this.tile_wall_right = document.getElementById('tile_wall_right')
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
        case 'tile_floor_top_left':
          return this.tile_floor_top_left
        case 'tile_floor_top_right':
          return this.tile_floor_top_right
        case 'tile_floor_bottom_left':
          return this.tile_floor_bottom_left
        case 'tile_floor_bottom_right':
          return this.tile_floor_bottom_right
        case 'tile_floor_top':
          return this.tile_floor_top
        case 'tile_floor_bottom':
          return this.tile_floor_bottom
        case 'tile_floor_left':
          return this.tile_floor_left
        case 'tile_floor_right':
          return this.tile_floor_right
        case 'tile_wall_base_left_2':
          return this.tile_wall_base_left_2
        case 'tile_wall_base_middle_2':
          return this.tile_wall_base_middle_2
        case 'tile_wall_base_right_2':
          return this.tile_wall_base_right_2
        case 'tile_wall_col_base':
          return this.tile_wall_col_base
        case 'tile_wall_col_bottom':
          return this.tile_wall_col_bottom
        case 'tile_wall_col_middle':
          return this.tile_wall_col_middle
        case 'tile_wall_col_top':
          return this.tile_wall_col_top
        case 'tile_wall_left':
          return this.tile_wall_left
        case 'tile_wall_middle':
          return this.tile_wall_middle
        case 'tile_wall_right':
          return this.tile_wall_right
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
      this.drawGrid(true)
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
        if (vueInst.brush === 'cursor') {
          return
        }
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
      const elem = document.getElementById('ffd_size')
      if (elem) {
        this.sWidth = elem.clientWidth
        this.sHeight = elem.clientHeight
      }
      console.log('Initializing Grid...')
      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.width, this.height)
      }
      if (this.ctx2) {
        this.ctx2.clearRect(0, 0, this.width, this.height)
      }
      // Calculate amount of cells
      const xCells = Math.ceil((this.width / this.gridSize) * 2)
      const yCells = Math.ceil((this.height / this.gridSize) * 2)
      const totalCells = xCells * yCells
      this.xCells = xCells
      this.yCells = yCells
      this.totalCells = totalCells
      // Initialize grid arrays
      this.costField = new Uint16Array(totalCells)
      this.integrationField = new Uint16Array(totalCells)
      // Fill with default values
      for (let i = 0; i < this.totalCells; i++) {
        this.costField[i] = 1
        this.integrationField[i] = 65535
      }
      console.log('> Grid initialized!')
      console.log(`\tX(${this.xCells}) * Y(${this.yCells}) = ${this.totalCells} Cells`)
    },
    initializeIntegrationGrid: function () {
      for (let i = 0; i < this.totalCells; i++) {
        this.integrationField[i] = 65535
      }
    },
    /**
     *
     * @param {Boolean} initial
     */
    drawGrid: function (initial) {
      const floor = document.getElementById('floor')
      // Only draw the area around the player to avoid having
      // ...to render unnecessarily
      const vDist = 30
      // X
      let xStart = Math.round(this.goalPosition.x - this.offsetVector.x - vDist)
      if (xStart < 0) xStart = 0
      let xEnd = Math.round(this.goalPosition.x - this.offsetVector.x + vDist)
      if (xEnd > this.xCells) xEnd = this.xCells
      // Y
      let yStart = Math.round(this.goalPosition.y - this.offsetVector.y - vDist)
      if (yStart < 0) yStart = 0
      let yEnd = Math.round(this.goalPosition.y - this.offsetVector.y + vDist)
      if (yEnd > this.yCells) yEnd = this.yCells
      if (initial) {
        xEnd = this.xCells
        yEnd = this.yCells
      }
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
      // Set highest cost value
      this.costField[arrayPos] = 255
      // Check if there is already the same tile present
      const contents = this.tileTree.getContents(
        position.x - 1,
        position.y - 1,
        position.x + 1,
        position.y + 1)
      for (const elem of contents) {
        if (elem.pos.x === position.x && elem.pos.y === position.y) {
          if (elem.name === this.tile) {
            return
          }
        }
      }
      const tile = new FFTile(position.x, position.y, xNew, yNew, this.tile)
      this.tileTree.insert(tile)
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
      // Check if there is already the same tile present
      const contents = this.tileTree.getContents(
        position.x - 1,
        position.y - 1,
        position.x + 1,
        position.y + 1)
      for (const elem of contents) {
        if (elem.pos.x === position.x && elem.pos.y === position.y) {
          if (elem.name === this.tile) {
            return
          }
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
      let xx = this.goalPosition.x - offset.x
      let yy = this.goalPosition.y - offset.y
      if (xx > this.xCells) {
        xx = this.xCells
      }
      if (yy > this.yCells) {
        yy = this.yCells
      }
      const tiles = this.tileTree.getContents(
        xx - vDist, yy - vDist, xx + vDist, yy + vDist
      )
      if (tiles.length < 1) {
        return
      }
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
      if (this.goalPosition.x !== -1 && this.goalPosition.y !== -1) {
        return
      }
      const arrayPos = this.convertXYToArrayPos(position.x, position.y)
      if (arrayPos > this.costField.length) {
        return
      }
      // Remember values
      const x = position.x
      const y = position.y
      this.goalPosition = position
      if (x * this.gridSize > this.sWidth / 2) {
        const tmp = Math.round((this.sWidth / 2) / this.gridSize)
        this.goalPosition.x = tmp + 1
        this.offsetVector.x = (x - tmp) * -1
      }
      if (y * this.gridSize > this.sHeight / 2) {
        const tmp = Math.round((this.sHeight / 2) / this.gridSize)
        this.goalPosition.y = tmp + 1
        this.offsetVector.y = (y - tmp) * -1
      }
      this.srNotifyPosition(false)
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
      this.ctxPlayer.fillStyle = '#FF0'
      this.ctxPlayer.fillText(this.store.user.username, xNew, yNew)
    },
    renderCoPlayers: function () {
      if (!this.coPlayers || this.coPlayers.size < 1) {
        return
      }
      let xNew, yNew
      this.coPlayers.forEach((val) => {
        xNew = (val.x + this.offsetVector.x) * this.gridSize
        yNew = (val.y + this.offsetVector.y) * this.gridSize
        this.ctxPlayer.drawImage(this.wizzard, xNew + 5, yNew + 5)
        this.ctxPlayer.fillStyle = '#FF0'
        this.ctxPlayer.fillText(val.usr, xNew, yNew)
      })
    },
    addEnemy: function (position) {
      const arrayPos = this.convertXYToArrayPos(position.x, position.y)
      if (arrayPos < 0 || arrayPos > this.costField.length) {
        return
      }
      // Calculate positions
      const xNew = position.x * this.gridSize
      const yNew = position.y * this.gridSize
      // Add enemy to list
      const id = this.getUUID()
      // Scale HP with Level
      let hp = 20
      hp += ((this.goalLevel * hp) - (this.goalLevel * 1.5))
      const unit = new FFUnit(
        position.x,
        position.y,
        1,
        id,
        10,
        hp,
        100)
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
      const open = []
      let vec = new THREE.Vector2(
        Math.round(this.goalPosition.x - this.offsetVector.x),
        Math.round(this.goalPosition.y - this.offsetVector.y))
      // Set integration value of goal's position to zero
      let goalArrayPos = this.convertXYToArrayPos(vec.x, vec.y)
      this.integrationField[goalArrayPos] = 0
      // Add goal to open list
      open.unshift(vec)
      // Also add co-players
      if (this.coPlayers && this.coPlayers.size > 0) {
        this.coPlayers.forEach((val) => {
          vec = new THREE.Vector2(
            Math.round(val.x),
            Math.round(val.y))
          // Set integration value of goal's position to zero
          goalArrayPos = this.convertXYToArrayPos(vec.x, vec.y)
          this.integrationField[goalArrayPos] = 0
          // Add goal to open list
          open.unshift(vec)
        })
      }
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
        neighbors = this.getNeighbors(current.x, current.y, false)
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
     * @param {Boolean=false} includeSelf
     * @return {Array}
     */
    getNeighbors: function (x, y, includeSelf = false) {
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
          if (!includeSelf && xi === x && yi === y) {
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
    handleSimulation: function (srSilent) {
      console.log('Starting Simulation...')
      this.isSimulating = true
      this.goalAlive = true
      this.goalHP = 1000
      this.canMove = false
      this.theta = 0
      // Transmit weapon data
      this.distributeGoalWeapons()
      // Notify simulation start
      if (!srSilent) {
        this.srNotifySimulation(true)
      }
      // Notify users we exist
      this.srNotifyAlive(true)
      // Retrieve current sessions and their data
      this.$connector.sendSyncRoomMessage(
        this.buildDataCommand('GET', 'SESH', 'DIST'))
      this.$connector.sendSyncRoomMessage(
        this.buildDataCommand('GET', 'UDAT'))
      if (this.currentSRLatency < 0) {
        setTimeout(() => {
          this.canMove = true
        }, 100)
      } else {
        setTimeout(() => {
          this.canMove = true
        }, this.currentSRLatency * 2)
      }
      // Allocate memory for variables
      let tmp
      const image = document.getElementById('slime')
      /**
       * @type {THREE.Vector2}
       */
      let endVector
      let qtree
      const cacheMap = new Map()
      let cacheDiff
      // Step Function to be called repeatedly
      let stepCount = 0
      let lastSecond = performance.now()
      let lastHalfSecond = performance.now()
      let lastTime = performance.now()
      let timeDelta
      let lastPos
      const step = () => {
        if (this.goalAlive) {
          // Did half a second pass?
          tmp = performance.now()
          if ((tmp - lastHalfSecond) / 1000 >= 1) {
            lastHalfSecond = tmp
            this.procPerHalfSecondTriggers()
          }
          // Calculate FPS
          // Did a second pass?
          tmp = performance.now()
          if ((tmp - lastSecond) / 1000 >= 1) {
            lastSecond = tmp
            this.timeDelta = stepCount
            stepCount = 0
            this.procPerSecondTriggers()
          }
          // How many seconds passed?
          tmp = performance.now()
          timeDelta = (tmp - lastTime) / 1000
          lastTime = tmp
          // Schedule next step
          // MDN Docs say it's best practice to put this here
          // ...so I guess we will just do it.
          requestAnimationFrame(step)
          // Move the players!
          this.applyGoalMovement(endVector, timeDelta)
          this.applyCoPlayersMovement(timeDelta)
          // Draw environment
          this.drawGrid(false)
          lastPos = this.applyGoalCalculation(lastPos)
          // Display players
          this.renderGoal()
          this.renderCoPlayers()
          // Display walls/tiles etc.
          this.renderTiles(this.offsetVector)
        } else {
          this.srNotifySimulation(false)
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
        this.reduceCoPlayerWeaponCooldown()
        // #### ENEMY ACTIONS ####
        if (this.enemies && this.enemies.size > 0) {
          // Add all enemies to the quadtree
          for (const [id, unit] of this.enemies) {
            if (id) qtree.insert(unit)
          }
          this.applyEnemyMovement(image, cacheMap, cacheDiff, qtree, timeDelta)
          // Now check if any enemy has come close to the players
          this.checkProximityDamage(qtree)
          this.checkCoPlayersProximityDamage(qtree)
        }
        // #### WEAPON ACTIONS ####
        // Render projectiles
        if (this.goalWeaponProjectiles.length > 0) {
          this.handleProjectiles(qtree, timeDelta)
        }
        // #### ON HIT EFFECTS ####
        if (this.onHitEffects.length > 0) {
          this.handleOnHitEffects(qtree)
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
      const offsetX = this.goalPosition.x * this.gridSize >= (this.sWidth / 2)
      const offsetY = this.goalPosition.y * this.gridSize >= (this.sHeight / 2)
      // If the player moved half the screen's distance
      // ...in any direction, we will translate the movement
      // ...that would further exceed this to the environment.
      this.goalMovementVector = new THREE.Vector2()
      endVector = new THREE.Vector2()
      // *** ***    X-Axis    *** ***
      if (this.goalLeft) {
        if (offsetX) {
          endVector.add(this.goalEast)
        } else {
          this.goalMovementVector.add(this.goalWest)
        }
      }
      if (this.goalRight) {
        if (offsetX) {
          endVector.add(this.goalWest)
        } else {
          this.goalMovementVector.add(this.goalEast)
        }
      }
      // *** ***    Y-Axis    *** ***
      if (this.goalUp) {
        if (offsetY) {
          endVector.add(this.goalSouth)
        } else {
          this.goalMovementVector.add(this.goalNorth)
        }
      }
      if (this.goalDown) {
        if (offsetY) {
          endVector.add(this.goalNorth)
        } else {
          this.goalMovementVector.add(this.goalSouth)
        }
      }
      // Don't forget to free the player!
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
      this.goalMovementVector.multiplyScalar(this.goalSpeed)
      this.goalMovementVector.multiplyScalar(timeDelta)
      // Apply movement vectors
      this.offsetVector.add(endVector)
      this.goalPosition.add(this.goalMovementVector)
      // Wall Collision
      const goalPosX = this.goalPosition.x - this.offsetVector.x
      const goalX = Math.round(goalPosX)
      const goalPosY = this.goalPosition.y - this.offsetVector.y
      const goalY = Math.round(goalPosY)
      const neighbors = this.getNeighbors(goalX, goalY, true)
      let diff
      let dist
      let count = 0
      let pos
      let tmpX, tmpY
      let tVec
      const wallVec = new THREE.Vector2()
      if (this.drawWallCollision) {
        this.ctx2.clearRect(0, 0, this.width, this.height)
      }
      for (const cell of neighbors) {
        tmpX = Math.round(cell.x)
        tmpY = Math.round(cell.y)
        pos = this.convertXYToArrayPos(tmpX, tmpY)
        if (this.costField[pos] === 255) {
          // Calculate distance vector
          if (goalPosX >= tmpX - 0.7 && goalPosY >= tmpY - 0.7) {
            if (goalPosX <= tmpX + 0.7 && goalPosY <= tmpY + 0.7) {
              count += 1
              tVec = new THREE.Vector2(cell.x, cell.y)
              diff = new THREE.Vector2(goalPosX, goalPosY)
              dist = diff.distanceToSquared(tVec)
              diff.sub(tVec)
              diff.divideScalar(Math.pow(dist, 2))
              wallVec.add(diff)
              if (this.drawWallCollision) {
                continue
              }
              this.ctx2.strokeStyle = '#F00'
              this.ctx2.lineWidth = 4
              this.ctx2.lineHeight = 4
              this.ctx2.beginPath()
              this.ctx2.moveTo(
                (goalPosX + 0.5 + this.offsetVector.x) * this.gridSize,
                (goalPosY + 0.5 + this.offsetVector.y) * this.gridSize)
              this.ctx2.lineTo(
                (cell.x + 0.5 + this.offsetVector.x) * this.gridSize,
                (cell.y + 0.5 + this.offsetVector.y) * this.gridSize)
              this.ctx2.stroke()
            }
          }
        }
      }
      // Add anti wall collision vector
      if (count > 0) {
        this.goalMovementVector = new THREE.Vector2()
        endVector = new THREE.Vector2()
        wallVec.normalize()
        wallVec.multiplyScalar(this.goalSpeed)
        wallVec.multiplyScalar(timeDelta)
        if (offsetX) {
          endVector.x -= wallVec.x
        } else {
          this.goalMovementVector.x += wallVec.x
        }
        if (offsetY) {
          endVector.y -= wallVec.y
        } else {
          this.goalMovementVector.y += wallVec.y
        }
        // Apply movement vectors
        this.offsetVector.add(endVector)
        this.goalPosition.add(this.goalMovementVector)
      }
    },
    applyCoPlayersMovement: function (timeDelta) {
      if (!this.coPlayers || this.coPlayers.size < 1) {
        return
      }
      let posObj
      for (const [key, val] of this.coPlayers.entries()) {
        posObj = val
        posObj = this.applyCoPlayerMovement(timeDelta, posObj)
        this.coPlayers.set(key, posObj)
      }
    },
    /**
     * Moves the player (goal)
     *
     * @param {Number} timeDelta
     * @param {Object} posObj
     */
    applyCoPlayerMovement: function (timeDelta, posObj) {
      const goalPosition = new THREE.Vector2()
      goalPosition.x = posObj.x
      goalPosition.y = posObj.y
      const ori = { ...goalPosition }
      let goalMovementVector = new THREE.Vector2()
      let didMove = false
      // *** ***    X-Axis    *** ***
      if (posObj.left) {
        goalMovementVector.add(this.goalWest)
        didMove = true
      }
      if (posObj.right) {
        goalMovementVector.add(this.goalEast)
        didMove = true
      }
      // *** ***    Y-Axis    *** ***
      if (posObj.up) {
        goalMovementVector.add(this.goalNorth)
        didMove = true
      }
      if (posObj.down) {
        goalMovementVector.add(this.goalSouth)
        didMove = true
      }
      if (didMove) {
        goalMovementVector.multiplyScalar(this.goalSpeed)
        goalMovementVector.multiplyScalar(timeDelta)
        // Apply movement vectors
        goalPosition.add(goalMovementVector)
      } else {
        return posObj
      }
      // Wall Collision
      const goalPosX = goalPosition.x
      const goalX = Math.round(goalPosX)
      const goalPosY = goalPosition.y
      const goalY = Math.round(goalPosY)
      const neighbors = this.getNeighbors(goalX, goalY, true)
      let diff
      let dist
      let count = 0
      let pos
      let tmpX, tmpY
      let tVec
      const wallVec = new THREE.Vector2()
      for (const cell of neighbors) {
        tmpX = Math.round(cell.x)
        tmpY = Math.round(cell.y)
        pos = this.convertXYToArrayPos(tmpX, tmpY)
        if (this.costField[pos] === 255) {
          // Calculate distance vector
          if (goalPosX >= tmpX - 0.7 && goalPosY >= tmpY - 0.7) {
            if (goalPosX <= tmpX + 0.7 && goalPosY <= tmpY + 0.7) {
              count += 1
              tVec = new THREE.Vector2(cell.x, cell.y)
              diff = new THREE.Vector2(goalPosX, goalPosY)
              dist = diff.distanceToSquared(tVec)
              diff.sub(tVec)
              diff.divideScalar(Math.pow(dist, 2))
              wallVec.add(diff)
              if (this.drawWallCollision) {
                continue
              }
              this.ctx2.strokeStyle = '#F00'
              this.ctx2.lineWidth = 4
              this.ctx2.lineHeight = 4
              this.ctx2.beginPath()
              this.ctx2.moveTo(
                (goalPosX + 0.5) * this.gridSize,
                (goalPosY + 0.5) * this.gridSize)
              this.ctx2.lineTo(
                (cell.x + 0.5) * this.gridSize,
                (cell.y + 0.5) * this.gridSize)
              this.ctx2.stroke()
            }
          }
        }
      }
      // Add anti wall collision vector
      if (count > 0) {
        goalMovementVector = new THREE.Vector2()
        wallVec.normalize()
        wallVec.multiplyScalar(this.goalSpeed)
        wallVec.multiplyScalar(timeDelta)
        goalMovementVector.x += wallVec.x
        goalMovementVector.y += wallVec.y
        // Apply movement vectors
        goalPosition.add(goalMovementVector)
      }
      posObj.x = goalPosition.x
      posObj.y = goalPosition.y
      if (!didMove) {
        posObj.x = ori.x
        posObj.y = ori.y
      }
      return posObj
    },
    applyEnemyMovement: function (image, cacheMap, cacheDiff, qtree, timeDelta) {
      /**
       * @type {THREE.Vector2[]}
       */
      let neighbors
      /**
       * @type {THREE.Vector2}
       */
      let endVector
      let dist, diff
      let min, minXY
      let arrayPos
      let xy = []
      let xNew, yNew, tmpX, tmpY
      let tmp
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
          neighbors = this.getNeighbors(current.pos.x, current.pos.y, false)
          if (neighbors.length < 1) {
            continue
          }
        } else {
          neighbors = this.getNeighbors(tmpX, tmpY, false)
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
    },
    checkProximityDamage: function (qtree) {
      const others = qtree.getContents(
        this.goalPosition.x - this.offsetVector.x - (this.goalMaxRange / 2),
        this.goalPosition.y - this.offsetVector.y - (this.goalMaxRange / 2),
        this.goalPosition.x - this.offsetVector.x + (this.goalMaxRange / 2),
        this.goalPosition.y - this.offsetVector.y + (this.goalMaxRange / 2))
      if (!others || others.length < 1) {
        return
      }
      const goalVec = new THREE.Vector2()
      goalVec.copy(this.goalPosition)
      goalVec.sub(this.offsetVector)
      this.ctx3.beginPath()
      this.ctx3.strokeStyle = '#F00'
      this.ctx3.lineHeight = 4
      this.ctx3.lineWidth = 4
      const position = new THREE.Vector2()
      position.copy(this.goalPosition)
      position.sub(this.offsetVector)
      let direction
      /**
       * @type number
       */
      let dist
      let projectiles
      const targets = []
      for (const other of others) {
        dist = goalVec.distanceToSquared(other.pos)
        // Add to targets
        targets.push({
          d: dist,
          o: other
        })
        // Respect invincibility frames before damage
        if (this.goalInvincibilityFrames === 0) {
          if (dist <= 0.5) {
            this.goalHP -= other.dps
            this.goalInvincibilityFrames = 20
            if (this.goalHP <= 0) {
              this.goalHP = 0
              this.goalAlive = false
              this.canMove = false
              this.srNotifyAlive(false)
              this.srNotifyMoveStop()
              break
            }
          }
        }
      }
      // Sort targets by distance
      targets.sort((a, b) => a.d - b.d)
      // Shoot weapons
      let other
      for (let i = 0; i < targets.length; i++) {
        other = targets[i].o
        dist = targets[i].d
        for (let k = 0; k < this.goalWeapons.length; k++) {
          // Calculate aim vector
          direction = new THREE.Vector2()
          direction.copy(other.pos)
          direction.sub(position)
          // Trigger weapon
          projectiles = this.goalWeapons[k].shoot(
            position,
            direction,
            dist
          )
          if (!projectiles) {
            continue
          }
          for (let j = 0; j < projectiles.length; j++) {
            if (projectiles[j].vec.lengthSq() > 0) {
              // Projectile - Add to projectiles
              this.goalWeaponProjectiles.push(projectiles[j])
              continue
            }
            // Beam - Directly damage enemy
            other.hp -= projectiles[j].dmg
            if (other.hp <= 0) {
              this.goalXP += other.xp
              this.checkXP()
              this.enemies.delete(other.id)
              this.goalKills += 1
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
          }
        }
      }
      this.ctx3.stroke()
    },
    checkCoPlayersProximityDamage: function (qtree) {
      if (!this.coPlayers || this.coPlayers.size < 1) {
        return
      }
      let posObj
      for (const [key, val] of this.coPlayers.entries()) {
        posObj = val
        posObj = this.checkCoPlayerProximityDamage(qtree, posObj)
        this.coPlayers.set(key, posObj)
      }
    },
    checkCoPlayerProximityDamage: function (qtree, coPlayer) {
      const others = qtree.getContents(
        coPlayer.x - (this.goalMaxRange / 2),
        coPlayer.y - (this.goalMaxRange / 2),
        coPlayer.x + (this.goalMaxRange / 2),
        coPlayer.y + (this.goalMaxRange / 2))
      if (!others || others.length < 1) {
        return coPlayer
      }
      const goalVec = new THREE.Vector2()
      goalVec.x = coPlayer.x
      goalVec.y = coPlayer.y
      this.ctx3.beginPath()
      this.ctx3.strokeStyle = '#F00'
      this.ctx3.lineHeight = 4
      this.ctx3.lineWidth = 4
      const position = new THREE.Vector2()
      position.x = coPlayer.x
      position.y = coPlayer.y
      let direction
      /**
       * @type number
       */
      let dist
      let projectiles
      const targets = []
      for (const other of others) {
        dist = goalVec.distanceToSquared(other.pos)
        // Add to targets
        targets.push({
          d: dist,
          o: other
        })
      }
      // Sort targets by distance
      targets.sort((a, b) => a.d - b.d)
      // Shoot weapons
      let other
      for (let i = 0; i < targets.length; i++) {
        other = targets[i].o
        dist = targets[i].d
        for (let k = 0; k < coPlayer.weapons.length; k++) {
          // Calculate aim vector
          direction = new THREE.Vector2()
          direction.copy(other.pos)
          direction.sub(position)
          // Trigger weapon
          projectiles = coPlayer.weapons[k].shoot(
            position,
            direction,
            dist
          )
          if (!projectiles) {
            continue
          }
          for (let j = 0; j < projectiles.length; j++) {
            if (projectiles[j].vec.lengthSq() > 0) {
              // Projectile - Add to projectiles
              this.goalWeaponProjectiles.push(projectiles[j])
              continue
            }
            // Beam - Directly damage enemy
            other.hp -= projectiles[j].dmg
            if (other.hp <= 0) {
              this.enemies.delete(other.id)
            } else {
              this.enemies.set(other.id, other)
            }
            // Draw weapon effect
            this.ctx3.moveTo(
              (coPlayer.x * this.gridSize) + this.gridSize / 2,
              (coPlayer.y * this.gridSize) + this.gridSize / 2
            )
            this.ctx3.lineTo(
              ((other.pos.x) * this.gridSize) + this.gridSize / 2,
              ((other.pos.y) * this.gridSize) + this.gridSize / 2
            )
          }
        }
      }
      this.ctx3.stroke()
      return coPlayer
    },
    reduceCoPlayerWeaponCooldown: function () {
      if (!this.coPlayers || this.coPlayers.size < 1) {
        return
      }
      for (const [key, val] of this.coPlayers.entries()) {
        if (!val.weapons || val.weapons.length < 1) {
          continue
        }
        for (let i = 0; i < val.weapons.length; i++) {
          val.weapons[i].processTick()
        }
        this.coPlayers.set(key, val)
      }
    },
    handleProjectiles: function (qtree, timeDelta) {
      let dist
      let tmp, tmp2, tmp3
      let projectile
      let newVec
      for (let i = this.goalWeaponProjectiles.length - 1; i > 0; i--) {
        projectile = this.goalWeaponProjectiles[i]
        // Move projectile
        newVec = new THREE.Vector2(projectile.vec.x, projectile.vec.y)
        newVec.multiplyScalar(timeDelta)
        projectile.pos.add(newVec)
        // Is the projectile still inside bounds?
        if (projectile.pos.x < 0 || projectile.pos.x > this.xCells ||
          projectile.pos.y < 0 || projectile.pos.y > this.yCells) {
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
        if (this.enemies.size > 0) {
          dist = projectile.hitRange * 2
          const enemies = qtree.getContents(
            projectile.pos.x - dist,
            projectile.pos.y - dist,
            projectile.pos.x + dist,
            projectile.pos.y + dist)
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
              if (enemy.hp < 0) {
                continue
              }
              dist = tmp.distanceToSquared(enemy.pos)
              if (dist <= projectile.hitRange) {
                // Trigger hit
                projectile.hitCount -= 1
                enemy.hp -= projectile.dmg
                if (enemy.hp <= 0) {
                  this.goalXP += enemy.xp
                  this.checkXP()
                  this.enemies.delete(enemy.id)
                  this.goalKills += 1
                } else {
                  this.enemies.set(enemy.id, enemy)
                }
                // Draw weapon effect
                tmp2 = ((projectile.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2
                tmp3 = ((projectile.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2
                this.ctx3.moveTo(tmp2, tmp3)
                tmp2 = ((enemy.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2
                tmp3 = ((enemy.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2
                this.ctx3.lineTo(tmp2, tmp3)
                // Does the projectile explode?
                if (projectile.radius > 0) {
                  tmp2 = new FFOnHitEffect(
                    enemy.pos.x,
                    enemy.pos.y,
                    'explosion',
                    projectile,
                    1)
                  this.onHitEffects.push(tmp2)
                }
                // Add floating damage number
                if (this.drawDamageNumbers) {
                  tmp2 = new FFOnHitEffect(
                    enemy.pos.x,
                    enemy.pos.y,
                    'text',
                    `${projectile.dmg}`,
                    60)
                  this.onHitEffects.push(tmp2)
                }
              }
            }
            if (projectile.hitCount <= 0) {
              this.goalWeaponProjectiles.splice(i, 1)
              continue
            }
            this.ctx3.stroke()
          }
        }
        this.goalWeaponProjectiles[i] = projectile
      }
    },
    handleOnHitEffects: function (qtree) {
      /**
       * @type FFOnHitEffect
       */
      let effect
      let tmp, tmp2
      let dist
      for (let i = this.onHitEffects.length - 1; i >= 0; i--) {
        effect = this.onHitEffects[i]
        if (effect.tick()) {
          if (effect.type === 'text') {
            this.ctx3.font = '1rem serif'
            this.ctx3.fillStyle = '#ffc800'
            this.ctx3.fillText(
              effect.content,
              (effect.x + this.offsetVector.x) * this.gridSize,
              (effect.y + this.offsetVector.y) * this.gridSize
            )
          } else if (effect.type === 'explosion') {
            if (this.enemies.size > 0) {
              const projectile = effect.content
              dist = projectile.radius
              const enemies = qtree.getContents(
                projectile.pos.x - dist,
                projectile.pos.y - dist,
                projectile.pos.x + dist,
                projectile.pos.y + dist)
              if (enemies && enemies.length > 0) {
                tmp = new THREE.Vector2()
                tmp.copy(projectile.pos)
                this.ctx3.beginPath()
                for (const enemy of enemies) {
                  if (enemy.hp < 0) {
                    continue
                  }
                  dist = tmp.distanceToSquared(enemy.pos)
                  if (dist <= projectile.radius) {
                    this.ctx3.fillStyle = '#fff400'
                    // Draw weapon effect
                    this.ctx3.arc(
                      (effect.x + this.offsetVector.x) * this.gridSize,
                      (effect.y + this.offsetVector.y) * this.gridSize,
                      (dist * this.gridSize) / 4,
                      0,
                      2 * Math.PI)
                    // Trigger hit
                    enemy.hp -= projectile.dmg
                    if (enemy.hp <= 0) {
                      this.goalXP += enemy.xp
                      this.checkXP()
                      this.enemies.delete(enemy.id)
                      this.goalKills += 1
                    } else {
                      this.enemies.set(enemy.id, enemy)
                    }
                    // Add floating damage number
                    if (this.drawDamageNumbers) {
                      tmp2 = new FFOnHitEffect(
                        enemy.pos.x,
                        enemy.pos.y,
                        'text',
                        `${projectile.dmg}`,
                        60)
                      this.onHitEffects.push(tmp2)
                    }
                  }
                }
                this.ctx3.fill()
              }
            }
          }
        } else {
          this.onHitEffects.splice(i, 1)
        }
      }
    },
    cancelSimulation: function () {
      this.srNotifySimulation(false)
      this.goalAlive = false
    },
    clearAll: function () {
      // Cancel game loop
      this.goalAlive = false
      // Set defaults
      this.initFunction()
    },
    handleFFKeyDown: function (e) {
      if (!this.canMove) return
      switch (e.key) {
        case 'w':
          this.goalUp = true
          this.srNotifyMove(true)
          this.srNotifyMove(true)
          break
        case 'a':
          this.goalLeft = true
          this.srNotifyMove(true)
          this.srNotifyMove(true)
          break
        case 's':
          this.goalDown = true
          this.srNotifyMove(true)
          this.srNotifyMove(true)
          break
        case 'd':
          this.goalRight = true
          this.srNotifyMove(true)
          this.srNotifyMove(true)
          break
      }
    },
    srNotifyMove: function (force) {
      const v = `${this.goalUp};${this.goalRight};${this.goalDown};${this.goalLeft}`
      let noSet = false
      if (this.lastPos === v && !force) {
        return
      } else {
        noSet = true
      }
      console.log('MOVEMENT')
      const k = `MOV-${this.store.user.username}`
      // Send message to others
      this.wrtc.broadcastDataChannelMessage(
        `${k};${v}`)
      this.lastPos = v
      this.dataMap.set(k, v)
      if (!noSet) {
        return
      }
      // Let server process data
      this.$connector.sendSyncRoomMessage(
        this.buildDataCommand('SET', 'DATA', k, v))
    },
    srNotifyMoveStop: function () {
      const k = `MOV-${this.store.user.username}`
      const v = 'false;false;false;false'
      // Send message to others
      this.wrtc.broadcastDataChannelMessage(
        `${k};${v}`)
      this.lastPos = v
      this.dataMap.set(k, v)
      // Let server process data
      this.$connector.sendSyncRoomMessage(
        this.buildDataCommand('SET', 'DATA', k, v))
    },
    srNotifyAlive: function (isAlive) {
      let v
      if (isAlive) {
        v = 'TRUE'
      } else {
        v = 'FALSE'
      }
      const k = `ALIVE-${this.store.user.username}`
      // Notify users
      this.$connector.sendSyncRoomMessage(
        `${k};${v}`)
      this.dataMap.set(k, v)
      // Let server process the data
      this.$connector.sendSyncRoomMessage(
        this.buildDataCommand('SET', 'DATA', k, v))
    },
    srNotifyPosition: function (sendOnly) {
      const v = JSON.stringify({
        x: this.goalPosition.x,
        y: this.goalPosition.y,
        xo: this.offsetVector.x,
        yo: this.offsetVector.y
      })
      const k = `POS-${this.store.user.username}`
      // Notify users
      this.wrtc.broadcastDataChannelMessage(
        `${k};${v}`)
      this.dataMap.set(k, v)
      // Let server process the data
      if (sendOnly) {
        return
      }
      this.$connector.sendSyncRoomMessage(
        this.buildDataCommand('SET', 'DATA', k, v))
    },
    srNotifySimulation: function (isRunning) {
      // if (!this.isHost) {
      //   return
      // }
      let v
      if (isRunning) {
        v = 'TRUE'
      } else {
        v = 'FALSE'
      }
      const k = 'DOSIM'
      this.dataMap.set(k, v)
      // Notify users
      this.$connector.sendSyncRoomMessage(
        `${k};${v}`)
      // Let server process the data
      this.$connector.sendSyncRoomMessage(
        this.buildDataCommand('SET', 'DATA', k, v))
    },
    /**
     *
     * @param e
     */
    handleFFKeyUp: function (e) {
      if (!this.canMove) return
      switch (e.key) {
        case 'w':
          this.goalUp = false
          this.srNotifyMove(true)
          this.srNotifyMove(true)
          break
        case 'a':
          this.goalLeft = false
          this.srNotifyMove(true)
          this.srNotifyMove(true)
          break
        case 's':
          this.goalDown = false
          this.srNotifyMove(true)
          this.srNotifyMove(true)
          break
        case 'd':
          this.goalRight = false
          this.srNotifyMove(true)
          this.srNotifyMove(true)
          break
      }
    },
    /**
     *
     * @return {*}
     */
    getUUID: function () {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      )
    },
    /**
     *
     * @param tile
     */
    setBrush: function (tile) {
      this.tile = tile
    },
    /**
     *
     */
    checkXP: function () {
      if (this.goalXP >= this.goalMaxXP) {
        this.handleLevelUp()
        const offers = this.showLevelUpOffers()
        if (offers) {
          // Show level up screen
          this.isLevelUp = true
          // This actually just pauses the simulation
          this.cancelSimulation()
          // Cancel movement
          // (sometimes it can get stuck upon level up,
          // as keyboard inputs are stopped)
          this.goalUp = false
          this.goalLeft = false
          this.goalDown = false
          this.goalRight = false
          this.srNotifyMove(true)
        }
      }
    },
    /**
     *
     */
    handleLevelUp: function () {
      this.goalXP = 0
      this.goalLevel += 1
      this.goalMaxXP = Math.ceil(this.goalMaxXP * 2.5)
      if (this.goalWeapons.length < 1) {
        return
      }
      for (const weapon of this.goalWeapons) {
        weapon.levelUp()
      }
    },
    /**
     *
     */
    dismissLevelUp: function () {
      this.distributeGoalWeapons()
      this.isLevelUp = false
      this.modifyingWeapons = false
      this.handleSimulation(false)
    },
    /**
     *
     */
    setUpPlayer: function () {
      this.goalWeapons = []
      const starterWeapon = this.getStarterWeapon()
      this.goalWeapons.push(starterWeapon)
      this.goalMaxRange = 10
    },
    /**
     *
     * @return {FFWeapon}
     */
    getStarterWeapon: function () {
      const weapon = this.weaponList.categories.starter[0]
      this.weaponList.categories.starter.splice(0, 1)
      return weapon
    },
    /**
     *
     */
    showLevelUpOffers: function () {
      let offers
      let hasOffer = false
      // Get unowned weapons as offers
      this.weaponOffers = []
      if (this.weaponList.categories.starter.length > 0) {
        hasOffer = true
        offers = []
        for (const entry of this.weaponList.categories.starter) {
          offers.push(entry)
        }
        this.weaponOffers = this.selectRandomFromArray(3, offers)
      }
      // Get unowned power ups as offers
      this.powerUpOffers = []
      if (this.goalWeapons.length > 0 &&
        this.powerUpList.categories.starter.length > 0
      ) {
        hasOffer = true
        offers = []
        for (const entry of this.powerUpList.categories.starter) {
          offers.push(entry)
        }
        this.powerUpOffers = this.selectRandomFromArray(3, offers)
        hasOffer = this.powerUpOffers.length > 0
      }
      // Did we get offers?
      return hasOffer
    },
    /**
     * Returns an array with n random results from offers
     * @param {Number} n
     * @param {Array} offers
     */
    selectRandomFromArray: function (n, offers) {
      let randomResults = []
      // If there are less than or n power ups,
      // ...we cannot select n random ones -> use all
      if (offers.length <= n) {
        randomResults = [].concat(offers)
        return randomResults
      }
      // Select n random power ups
      // Example of random index with 3 offers:
      //    0.9 * 3 = 2.97 => Math.floor() => 2
      // Index will never go out of bounds as seen above
      let ix
      /**
       * @type {Number[]}
       */
      const cache = []
      for (let i = 0; i < n; i++) {
        ix = Math.floor(Math.random() * offers.length)
        if (cache.length > 0 && cache.includes(ix)) {
          i -= 1
          continue
        }
        randomResults.push(offers[ix])
        cache.push(ix)
      }
      return randomResults
    },
    /**
     *
     * @param offer
     */
    handleWeaponOffer: function (offer) {
      this.goalWeapons.push(offer)
      const ix = this.weaponList.categories.starter.indexOf(offer)
      if (ix >= 0) {
        this.weaponList.categories.starter.splice(ix, 1)
      }
      this.dismissLevelUp()
    },
    /**
     * @param {FFPowerUp} offer
     */
    handlePowerUpOffer: function (offer) {
      this.chosenPowerup = offer
      this.modifyingWeapons = true
    },
    /**
     *
     * @param weapon
     */
    handleWeaponModification: function (weapon) {
      /**
       * @type {FFPowerUp}
       */
      const powerUp = this.chosenPowerup
      for (let i = 0; i < this.goalWeapons.length; i++) {
        if (this.goalWeapons[i].name === weapon.name) {
          this.goalWeapons[i].powerUps.push(powerUp)
          break
        }
      }
      const ix = this.powerUpList.categories.starter.indexOf(powerUp)
      if (ix >= 0) {
        this.powerUpList.categories.starter.splice(ix, 1)
      }
      this.dismissLevelUp()
    },
    /**
     *
     */
    saveMap: function () {
      const tiles = this.tileTree.getContents(
        0, 0, this.xCells, this.yCells)
      const costSaveState = this.costField
      const saveState = {
        tiles,
        costField: costSaveState
      }
      const saveStr = 'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(saveState))
      const tmpNode = document.createElement('a')
      tmpNode.setAttribute('href', saveStr)
      tmpNode.setAttribute('download', 'map.json')
      document.body.appendChild(tmpNode)
      tmpNode.click()
      tmpNode.remove()
    },
    /**
     * @param saveState
     */
    loadMap: function (saveState) {
      this.clearAll()
      /**
       * @type FFTile[]
       */
      const tiles = saveState.tiles
      if (tiles) {
        this.tileTree = new FFTilesQuadTree(
          this.xCells / 2,
          this.yCells / 2,
          this.xCells / 2,
          this.yCells / 2,
          50)
        for (let i = 0; i < tiles.length; i++) {
          this.tile = tiles[i].name
          this.addTile(tiles[i].pos)
        }
      }
      /**
       * @type []
       */
      const costField = saveState.costField
      if (costField) {
        this.costField = []
        for (const value of Object.values(costField)) {
          this.costField.push(value)
        }
      }
      // Render
      this.drawGrid(true)
      this.renderTiles(this.offsetVector)
    },
    pickMap: function () {
      this.isPickingMap = true
    },
    handleMapSelected: function (data) {
      const base64 = data.base64.split(',')[1]
      const str = window.atob(base64)
      const obj = JSON.parse(str)
      this.loadMap(obj)
      this.isPickingMap = false
    },
    /**
     * Actions happening or being checked every second
     * ...are placed here.
     */
    procPerSecondTriggers: function () {
      // Populate map
      this.checkAndSpawnEnemies()
      // Retrieve and distribute current sessions
      this.srNotifyPosition(true)
      // if (this.isHost) {
      //   this.$connector.sendSyncRoomMessage(
      //     this.buildDataCommand('GET', 'SESH', 'DIST'))
      // }
    },
    /**
     * Actions happening or being checked every half second
     * ...are placed here.
     */
    procPerHalfSecondTriggers: function () {
      this.srNotifyMove(true)
    },
    /**
     * Spawns enemies around the map
     */
    checkAndSpawnEnemies: function () {
      // Circle-Spawner rotating around the screen
      for (let i = 0; i < 2; i++) {
        const x = (this.width * Math.cos(this.theta)) +
          this.width / 2 - (this.offsetVector.x * this.gridSize)
        const y = (this.height * Math.sin(this.theta)) +
          this.height / 2 - (this.offsetVector.y * this.gridSize)
        this.theta += 0.1
        const pos = new THREE.Vector2(
          Math.round(x / this.gridSize),
          Math.round(y / this.gridSize))
        // Spawn regular enemies
        this.addEnemy(pos)
      }
    },
    setUpSyncRoom: async function () {
      // Listen for SyncRoom messages
      const events = new BroadcastChannel('wikiric_sync')
      events.onmessage = event => {
        // Sanitize
        if (!event.data || (!event.data.a && !event.data.t)) {
          return
        }
        event.data.a = event.data.a.trim()
        event.data.t = event.data.t.trim()
        if (event.data.a.startsWith('[s:ANS]')) {
          // Answer
        } else if (event.data.a.startsWith('[s:SESH]')) {
          // Session Result
          const sesh = JSON.parse(event.data.a.substring(8))
          this.sessions.set(sesh.u, sesh)
          if (sesh.u === this.store.user.username) {
            if (sesh.o) {
              this.isHost = true
            }
          } else {
            if (!this.coPlayers.has(sesh.u)) {
              // We did not encounter this co-player yet
              // Create peer to peer connection to this player
              // To figure out who's impolite and who's not...
              // ...the peers need to battle it out!
              const rnd = Math.random()
              this.$connector.sendSyncRoomMessage(
                `PEFI-${sesh.u};${this.store.user.username};${rnd}`)
              // Set new player
              this.coPlayers.set(sesh.u, {
                usr: sesh.u,
                x: -1,
                y: -1,
                xo: -1,
                yo: -1,
                pefi: rnd
              })
              // Request position data
              // ...simple hack: we just re-use the lag function
              this.handleLatencyLag(this.currentSRLatency)
            }
          }
        } else if (event.data.a.startsWith('[s:DAT]')) {
          // Data Result
          const data = event.data.a.substring(7).split(';')
          if (data.length < 2) {
            return
          }
          this.dataMap.set(data[0], JSON.parse(data[1]))
        } else if (event.data.a.startsWith('[LAT]')) {
          // Latency Result
          this.currentSRLatency = parseFloat(event.data.a.substring(5))
          console.log(`> ${this.currentSRLatency} ms latency`)
          if (this.currentSRLatency > 100) {
            this.handleLatencyLag(this.currentSRLatency)
          }
        } else if (event.data.a.startsWith('[s:UDAT]')) {
          // User Data
          const data = JSON.parse(event.data.a.substring(8))
          if (data.u === this.store.user.username) {
            this.dataMap.set(data.k, data.v)
          } else {
            if (!this.playerData.has(data.u)) {
              this.playerData.set(data.u, new Map())
            }
            const plyD = this.playerData.get(data.u)
            plyD.set(data.k, data.v)
            this.playerData.set(data.u, plyD)
          }
        } else if (event.data.t.startsWith('qPOS')) {
          // Some player requested our position
          this.srNotifyPosition(false)
        } else if (event.data.t.startsWith('PEFI-')) {
          // Some player sent a peer fight random number!
          // Format:
          //    Username;RemoteName;RndInt
          const data = event.data.t.substring(5).split(';')
          this.handlePeerFightRnd(data)
        } else if (event.data.t.startsWith('DOSIM')) {
          const data = event.data.t.split(';')
          if (data[1].toUpperCase() === 'TRUE') {
            if (this.isSimulating) return
            this.handleSimulation(true)
          } else {
            if (!this.isSimulating) return
            this.cancelSimulation()
          }
        } else if (event.data.t.startsWith('WP-')) {
          // Some player sent a weapon part
          // Format:
          //    PlayerName;WeaponName;PowerUpName;Type;JsonPayload
          const data = event.data.t.substring(3).split(';')
          this.setCoPlayerWeaponPart(data)
        }
      }
      // Connect to the SyncRoom
      console.log('Connecting to wikiric sync room:', this.roomId)
      await this.$connector.doJoinSyncRoom(this.roomId)
      console.log('> Connected')
      // Calculate latency in ms (performance check)
      console.log('Periodically checking latency...')
      this.$connector.calculateSyncRoomLatency()
      setInterval(() => {
        this.$connector.calculateSyncRoomLatency()
      }, 10_000)
      // Are there any other users here, yet?
      this.$connector.sendSyncRoomMessage(
        this.buildDataCommand('GET', 'SESH', 'DIST'))
      setTimeout(() => {
        this.$connector.sendSyncRoomMessage(
          this.buildDataCommand('GET', 'SESH', 'DIST'))
      }, 2_000)
      // Start WRTC setup routine
      this.initWRTC()
    },
    handleLatencyLag: function (delay) {
      // Retrieve player positions since lag could cause de-sync
      this.$connector.sendSyncRoomMessage('qPOS')
      setTimeout(() => {
        this.$connector.sendSyncRoomMessage(
          this.buildDataCommand('GET', 'UDAT', 'POS'))
      }, delay * 2)
    },
    setCoPlayerPosition: function (data) {
      const player = JSON.parse(data[1])
      if (this.coPlayers.has(data[0])) {
        const pl = this.coPlayers.get(data[0])
        pl.x = player.x - player.xo
        pl.y = player.y - player.yo
        this.coPlayers.set(data[0], pl)
        return
      }
      this.coPlayers.set(data[0], {
        usr: data[0],
        x: player.x - player.xo,
        y: player.y - player.yo
      })
    },
    setCoPlayerMovement: function (data) {
      if (this.coPlayers.has(data[0])) {
        const pl = this.coPlayers.get(data[0])
        pl.up = data[1].toUpperCase() === 'TRUE'
        pl.right = data[2].toUpperCase() === 'TRUE'
        pl.down = data[3].toUpperCase() === 'TRUE'
        pl.left = data[4].toUpperCase() === 'TRUE'
        this.coPlayers.set(data[0], pl)
        return
      }
      this.coPlayers.set(data[0], {
        usr: data[0],
        up: data[1].toUpperCase() === 'TRUE',
        right: data[2].toUpperCase() === 'TRUE',
        down: data[3].toUpperCase() === 'TRUE',
        left: data[4].toUpperCase() === 'TRUE'
      })
    },
    setCoPlayerWeaponPart: function (data) {
      let pl = {
        weapons: []
      }
      if (this.coPlayers.has(data[0])) {
        pl = this.coPlayers.get(data[0])
        if (!pl.weapons) {
          pl.weapons = []
        }
      }
      // Data Format:
      //    0          1          2           3    4
      //    PlayerName;WeaponName;PowerUpName;Type;JsonPayload
      // Find weapon
      let ix = -1
      if (data[1] !== '-') {
        if (pl.weapons.length > 0) {
          for (let i = 0; i < pl.weapons.length; i++) {
            if (pl.weapons[i].name === data[1]) {
              ix = i
              break
            }
          }
        }
      }
      // Find power-up
      let pId = -1
      if (data[2] !== '-') {
        if (ix >= 0 && pl.weapons[ix].powerUps) {
          if (pl.weapons[ix].powerUps.length > 0) {
            for (let i = 0; i < pl.weapons[ix].powerUps.length; i++) {
              if (pl.weapons[ix].powerUps[i].name === data[2]) {
                pId = i
                break
              }
            }
          }
        }
      }
      let obj = JSON.parse(data[4])
      if (data[3] === '1') {
        // Weapon
        obj = new FFWeapon(
          obj.name,
          obj.range,
          obj.dps,
          obj.dpsLevelUp,
          obj.amount,
          obj.cd,
          obj.cdLevelUp,
          obj.pSpeed,
          obj.hitCount,
          obj.pHitCount,
          obj.hitRange,
          obj.hitRangeLevelUp
        )
        if (ix !== -1) {
          // Update weapon (but not power-ups)
          const powerUps = pl.weapons[ix].powerUps
          pl.weapons[ix] = obj
          pl.weapons[ix].powerUps = powerUps
        } else {
          pl.weapons.push(obj)
        }
      } else if (data[3] === '2') {
        // Power-Up
        obj = new FFPowerUp(
          obj.id,
          obj.level,
          obj.name,
          obj.desc
        )
        if (ix !== -1) {
          if (pId !== -1) {
            // Update power-up (but not effects)
            const effects = pl.weapons[ix].powerUps[pId].effects
            pl.weapons[ix].powerUps[pId] = obj
            pl.weapons[ix].powerUps[pId].effects = effects
          } else {
            pl.weapons[ix].powerUps.push(obj)
          }
        } else {
          if (!pl._queue) {
            pl._queue = []
          }
          pl._queue.push({
            typ: 2,
            wpn: data[1],
            pup: obj
          })
        }
      } else if (data[3] === '3') {
        // Effect
        obj = new FFPowerUpEffect(
          obj.onHit,
          obj.type,
          obj.value,
          obj.valueLevelBonus,
          obj.hitCount,
          obj.floorValueOnProc,
          obj.autoLevelUp
        )
        if (pId !== -1 && ix !== -1) {
          let eix = -1
          for (let i = 0; i < pl.weapons[ix].powerUps[pId].effects.length; i++) {
            if (pl.weapons[ix].powerUps[pId].effects[i].type === obj.type) {
              eix = i
              break
            }
          }
          if (eix !== -1) {
            pl.weapons[ix].powerUps[pId].effects[eix] = obj
          } else {
            pl.weapons[ix].powerUps[pId].effects.push(obj)
          }
        } else {
          if (!pl._queue) {
            pl._queue = []
          }
          pl._queue.push({
            typ: 3,
            wpn: data[1],
            pup: data[2],
            eff: obj
          })
        }
      }
      // Update co-player data
      if (this.coPlayers.has(data[0])) {
        this.coPlayers.set(data[0], pl)
      }
    },
    buildDataCommand: function (cmd, mod, key, value) {
      if (!key) {
        key = ''
      }
      let str = `[c:${cmd};${mod}]${key}`
      if (value) {
        str += `;${value}`
      }
      return str
    },
    distributeGoalWeapons: function () {
      if (!this.goalWeapons || this.goalWeapons.length < 1) {
        return
      }
      let weapon, powers, power, effects, effect
      for (let i = 0; i < this.goalWeapons.length; i++) {
        // Since we want to keep all messages as small as possible
        // ...we will deconstruct all weapons into their parts
        //    1. Weapon
        //    2. Power-Ups
        //    3. Effects
        weapon = this.goalWeapons.slice(i, i + 1)[0]
        powers = weapon.powerUps
        weapon.powerUps = []
        this.srSendWeaponPart(
          weapon.name, '-', '1', JSON.stringify(weapon))
        if (powers.length > 0) {
          for (let j = 0; j < powers.length; j++) {
            power = powers.slice(j, j + 1)[0]
            effects = power.effects
            power.effects = []
            this.srSendWeaponPart(
              weapon.name, power.name, '2', JSON.stringify(power))
            if (effects.length > 0) {
              for (let k = 0; k < effects.length; k++) {
                effect = effects[k]
                this.srSendWeaponPart(
                  weapon.name, power.name, '3', JSON.stringify(effect))
              }
            }
          }
        }
      }
    },
    srSendWeaponPart: function (id, pId, type, payload) {
      // Send message to others
      this.$connector.sendSyncRoomMessage(
        `WP-${this.store.user.username};${id};${pId};${type};${payload}`)
    },
    initWRTC: function () {
      this.wrtc.initialize(this.$connector, this.store.user.username, true, true)
      // Create BroadcastChannel to listen to wRTC events!
      const eventChannel = new BroadcastChannel('wrtcevents')
      eventChannel.onmessage = event => {
        this.handleWRTCEvent(event)
      }
    },
    handleWRTCEvent: async function (event) {
      if (!event || !event.data) return
      if (event.data.event === 'peer_init') {
        this.peerCons.set(event.data.remoteName, {
          connected: false,
          dataReady: false
        })
      } else if (event.data.event === 'connection_change') {
        if (event.data.status.toLowerCase() === 'connected') {
          const peer = this.peerCons.get(event.data.remoteName)
          peer.connected = true
          this.peerCons.set(event.data.remoteName, peer)
        }
      } else if (event.data.event === 'datachannel_message') {
        // console.log('WRTC MESSAGE:', event.data.message)
        if (event.data.message.startsWith('POS-')) {
          // Some player sent their position
          // We can simply use this to counteract de-sync
          const data = event.data.message.substring(4).split(';')
          if (data.length < 2 || data[0] === this.store.user.username) {
            return
          }
          this.setCoPlayerPosition(data)
        } else if (event.data.message.startsWith('MOV-')) {
          // Some player sent movement data
          // Format: (Bool)
          //    UP;RIGHT;DOWN;LEFT
          const data = event.data.message.substring(4).split(';')
          this.setCoPlayerMovement(data)
        }
      } else if (event.data.event === 'datachannel_open') {
        this.wrtc.sendDataChannelMessage(event.data.remoteName, 'N;DR')
        const peer = this.peerCons.get(event.data.remoteName)
        peer.dataReady = true
        this.peerCons.set(event.data.remoteName, peer)
      }
    },
    handlePeerFightRnd: function (data) {
      // The peers need to battle out who's impolite and who's polite.
      // If the other peer's random number is the same as ours, we simply send another number.
      if (data.length < 3 || data[0] !== this.store.user.username) {
        return
      }
      const rnd = parseFloat(data[2])
      let peer = null
      if (this.coPlayers.has(data[1])) {
        peer = this.coPlayers.get(data[1])
        if (peer.pefi === rnd) {
          const newRnd = Math.random()
          this.$connector.sendSyncRoomMessage(
            `PEFI-${data[1]};${this.store.user.username};${newRnd}`)
          return
        }
        if (peer.pefi > rnd) {
          // We have won!
          this.createOutgoingPeerConnections(data[1], false)
        } else {
          // The other peer has won!
          // We simply do nothing and watch as they send us their WRTC offer...
        }
      }
    },
    createOutgoingPeerConnections: async function (userId, polite) {
      const calleeList = []
      if (userId) {
        calleeList.push(userId)
      } else {
        this.coPlayers.forEach((val) => {
          calleeList.push(val.usr)
        })
      }
      // Create a WebRTC Peer to Peer Connection for each callee
      for (let i = 0; i < calleeList.length; i++) {
        this.wrtc.initiatePeerConnection(null, calleeList[i], true, polite)
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
  width: 100vw;
  height: 100vh;
  cursor: crosshair;
}

.ffd_canvas {
  position: absolute;
}

</style>
