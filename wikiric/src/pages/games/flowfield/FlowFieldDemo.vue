<template>
  <q-page class="full-height full-width flex items-center justify-center">
    <q-layout
      view="lhh LpR lff"
      container
      style="height: calc(100dvh - 52px)"
      class="overflow-hidden no-scroll">
      <q-drawer
        v-if="keepSidebarOpen || !isSimulating"
        side="left"
        v-model="sidebarLeft"
        behavior="desktop"
        :width="300"
        :breakpoint="768"
        class="surface-variant hfit">
        <div class="fit scroll">
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
                       @click="scheduleSimulation(true, true, false)"
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
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9d2f-e5b6-738d-bf08-62f0e4fc3804"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('floor_alt_1')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-27c6-738d-a085-ad40d23e4898"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('floor_alt_2')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-1f37-738d-b736-60ff4775b7a8"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('floor_bloody')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-3b5f-738d-a45d-f14cb45cee5a"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9609-53c7-7af1-b199-8bb89b9a1a95"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_top_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-727d-738d-8372-7b061a335c5b"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_top_middle')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-79dd-738d-bcd9-b6f6253f98fe"
                    width="50" height="50" alt="img"/></q-btn>
                <q-btn @click="setBrush('wall_top_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-814e-738d-a22a-288999cac241"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_left_middle')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd8-7aa5-738d-b17d-877c475c266d"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_right_middle')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd8-8274-738d-bbde-3004d1b69105"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_bottom_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-60b5-738d-9f79-cfea517dd2cf"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_bottom_middle')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-6b4a-738d-8a06-c66fc7e7f795"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_bottom_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd8-738d-738d-b480-33e50482adce"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner_top_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9d30-0ece-738d-89d0-59b65270c4e5"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner_top_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9d30-15dd-738d-a8bb-0d3bc66a2e2a"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_base_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-92b3-738d-afd2-1479727a4698"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_base_middle')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-8ab8-738d-a7f7-940fa063c34c"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_base_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9cd4-ad47-738d-8918-211e3a416ca9"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner_bottom_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9d2f-f7e4-738d-874b-d1ff530bbb7f"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('wall_inner_bottom_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9d30-0121-738d-9e2f-69ef1577ee75"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_top_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89b-2be3-726d-8f5b-3fd169bef028"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_top')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89b-3a8d-726d-8599-f136d6cf4f9f"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_top_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89b-334f-726d-8682-5e0349842350"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_col_top')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-ee17-726d-8b70-d8a4bb5fb0b0"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <div></div>
                <q-btn @click="setBrush('tile_floor_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89b-2365-726d-b1fd-e73cd5b94db5"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('floor')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018f9ca3-73c2-738d-8a28-03610cb178e5"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89b-1b17-726d-8cba-20fc99a2eb07"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_col_middle')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-e3a5-726d-b8b0-86fca58347a7"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <div></div>
                <q-btn @click="setBrush('tile_floor_bottom_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-fe4f-726d-8cbe-c24a0bdbf554"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_bottom')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89b-05da-726d-b59f-ca5d553eb816"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_floor_bottom_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89b-0c99-726d-9f39-d19440513f8d"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_col_bottom')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-dc3c-726d-8ad4-0952740cde0f"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <div></div>
                <q-btn @click="setBrush('tile_wall_left')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-b89e-726d-859f-12c7e353b742"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_middle')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-c267-726d-8ed7-4ef504382a55"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_right')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-cdd6-726d-9f0a-386d6490eb86"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_col_base')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-d566-726d-8e82-17b39c29ede5"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <div></div>
                <q-btn @click="setBrush('tile_wall_base_left_2')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-982c-726d-9405-f555e6c1247a"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_base_middle_2')">
                  <img
                    src="https://wikiric.xyz/files/public/get/018ff89a-a452-726d-aac1-46b39f8ef66a"
                    width="50" height="50" alt="img"/>
                </q-btn>
                <q-btn @click="setBrush('tile_wall_base_right_2')">
                  <img
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
              <q-checkbox label="Enemies" v-model="spawnEnemies"/>
              <q-checkbox label="Damage Numbers" v-model="drawDamageNumbers"/>
              <q-checkbox label="God Mode" v-model="godMode"
                          @update:modelValue="triggerRenderStep"/>
              <q-checkbox label="Keep Sidebar" v-model="keepSidebarOpen"/>
              <q-checkbox label="Heatmap" v-model="drawHeatmap"/>
              <q-checkbox label="Heatmap (Light)" v-model="drawIlluminationHeatmap"/>
              <q-checkbox label="Wall Collisions" v-model="drawWallCollision"/>
            </div>
          </div>
        </div>
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
              <q-toolbar-title class="text-subtitle1 hidden">
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
                      {{ gameMetaText }}
                    </p>
                    <div class="flex column gap-1 text-right mt1">
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
          <FFShop :is-open="isLevelUp"
                  :current-round="currentRound"
                  :level-ups="goalLevelUpsOpen"
                  :weapon-offers="weaponOffers"
                  :power-up-offers="powerUpOffers"
                  :item-offers="itemOffers"
                  :tab-pref="shopTab"
                  :player-stats="goalStats"
                  :player-items="goalItems"
                  :player-weapons="goalWeapons"
                  :player-abilities="goalAbilities"
                  :trophies="trophyList"
                  :money="goalMoney"
                  @close="isLevelUp = false"
                  @wpn="handleShopWeaponOffer"
                  @itm="handleShopItemOffer"
                  @pup="handleShopPowerUpOffer"
                  @rewpn="refreshOffers"/>
          <template v-if="modifyingWeapons">
            <div class="flex gap-2 justify-center items-center
                        wfull max-w-[100dvw] top-0
                        backdrop-blur-lg
                        z-99 fixed hfull pt_nav overflow-y-scroll">
              <q-card flat style="background: transparent"
                      class="wfull hfull">
                <q-card-section>
                  <p class="fontbold text-3xl text-center pt2">
                    Weapon/Ability Modification
                  </p>
                </q-card-section>
                <template v-if="chosenPowerup">
                  <div class="wfull flex justify-center mb2 px2">
                    <div class="fmt_border rounded p2 max-w-xl surface">
                      <FFPowerUpDisplay :power-ups="[chosenPowerup]"/>
                    </div>
                  </div>
                </template>
                <q-card-section>
                  <template v-if="goalWeapons && goalWeapons.length > 0">
                    <p class="text-body1 fontbold mb2">
                      Choose a weapon to modify:
                    </p>
                    <div class="flex gap-2 wfull h-full">
                      <template v-for="weapon in goalWeapons" :key="weapon">
                        <q-btn v-if="weapon.canReceivePowerUp(chosenPowerup)"
                               unelevated dense no-caps flat
                               @click="handleWeaponModification(weapon, false)"
                               class="wfull hfull">
                          <FFWeaponDisplay :weapon="weapon" class="flex-grow" small/>
                        </q-btn>
                      </template>
                    </div>
                  </template>
                  <template v-if="goalAbilities && goalAbilities.length > 0">
                    <p class="text-body1 fontbold my2">
                      Choose an ability to modify:
                    </p>
                    <div class="flex gap-2 wfull h-full">
                      <template v-for="ability in goalAbilities" :key="ability">
                        <q-btn v-if="ability.wpn.canReceivePowerUp(chosenPowerup)"
                               unelevated dense no-caps flat
                               @click="handleWeaponModification(ability.wpn, true, ability.name)"
                               class="wfull hfull">
                          <FFWeaponDisplay :weapon="ability.wpn" class="flex-grow" small/>
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
                  <div class="flex gap-1 items-center">
                    <template v-if="goalWeapons && goalWeapons.length > 0">
                      <q-icon name="sym_o_swords" size="1.2rem" class=""/>
                      <template v-for="weapon in goalWeapons" :key="weapon">
                        <FFWeaponComp :weapon="weapon" :small="true"/>
                      </template>
                    </template>
                    <template v-if="goalAbilities && goalAbilities.length > 0">
                      <q-icon name="sym_o_offline_bolt" size="1.5rem" class="ml1"/>
                      <template v-for="ability in goalAbilities" :key="ability">
                        <FFAbilityComp :ability="ability" :small="true"/>
                      </template>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </q-page-sticky>
          <q-page-sticky position="bottom-right" :offset="[10, 80]">
            <div class="flex gap-2 items-center justify-center">
              <q-btn v-if="!isSimulating"
                     icon="sym_o_military_tech"
                     size="1.2rem" round glossy
                     @click="useLevelUp">
                <q-badge floating rounded
                         color="primary">
                  {{ goalLevelUpsOpen }}
                </q-badge>
                <q-tooltip>
                  <p class="text-sm fontbold">
                    <template v-if="goalLevelUpsOpen > 0">
                      Level Up!
                    </template>
                    <template v-else>
                      Shop
                    </template>
                  </p>
                </q-tooltip>
              </q-btn>
              <template v-if="isScheduling">
                <div class="flex items-center gap-2 rounded-full p4 primary">
                  <q-spinner-gears size="2rem" color="brand-p"/>
                  <p class="text-lg fontbold">
                    Syncing...
                  </p>
                </div>
              </template>
              <template v-else>
                <template v-if="!isSimulating">
                  <template v-if="isHost">
                    <q-btn color="primary" no-caps rounded size="1.5rem"
                           @click="scheduleSimulation(true, true, false)"
                           icon="sym_o_network_intelligence_history"
                           :label="`Start Round ${currentRound + 1}`"/>
                  </template>
                  <template v-else>
                    <div class="px2">
                      <p class="fontbold">
                        Waiting for Host...
                      </p>
                    </div>
                  </template>
                </template>
              </template>
            </div>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <div id="assets_container" class="hidden">
    <!-- Slime Model -->
    <img id="slime"
         src="https://wikiric.xyz/files/public/get/018f866a-4182-7aef-b1a4-1a75a7e7c21f"
         width="24" height="24" alt="img"/>
    <!-- Slime Jump Animation -->
    <img id="slime_jump_0"
         src="https://wikiric.xyz/files/public/get/0192188b-1e6b-713e-83b1-d47237892d54"
         width="256" height="256" alt="img"/>
    <img id="slime_jump_1"
         src="https://wikiric.xyz/files/public/get/0192188c-69fa-713e-af19-957f213ee40e"
         width="256" height="256" alt="img"/>
    <img id="slime_jump_2"
         src="https://wikiric.xyz/files/public/get/0192188c-df01-713e-90f5-682efdb9db70"
         width="256" height="256" alt="img"/>
    <img id="slime_jump_3"
         src="https://wikiric.xyz/files/public/get/0192188d-2ee9-713e-994f-db6a6c9feb98"
         width="256" height="256" alt="img"/>
    <img id="slime_jump_4"
         src="https://wikiric.xyz/files/public/get/0192188d-73eb-713e-8c6f-c9ddd21bcf11"
         width="256" height="256" alt="img"/>
    <img id="slime_jump_5"
         src="https://wikiric.xyz/files/public/get/0192188d-c1f9-713e-84af-fe067815c7aa"
         width="256" height="256" alt="img"/>
    <!-- Slime Death Animation -->
    <img id="slime_death_0"
         src="https://wikiric.xyz/files/public/get/01921a47-19f5-713e-8782-c1f7bbbd2d96"
         width="256" height="256" alt="img"/>
    <img id="slime_death_1"
         src="https://wikiric.xyz/files/public/get/01921a47-6f20-713e-982a-23ce6f4e1c0d"
         width="256" height="256" alt="img"/>
    <img id="slime_death_2"
         src="https://wikiric.xyz/files/public/get/01921a47-ba74-713e-9ab3-02a5d9aa0027"
         width="256" height="256" alt="img"/>
    <img id="slime_death_3"
         src="https://wikiric.xyz/files/public/get/01921a48-28f1-713e-bb94-bb1b9167b6e9"
         width="256" height="256" alt="img"/>
    <img id="slime_death_4"
         src="https://wikiric.xyz/files/public/get/01921a48-5ed9-713e-8068-209666df5e86"
         width="256" height="256" alt="img"/>
    <img id="slime_death_5"
         src="https://wikiric.xyz/files/public/get/01921a48-89d8-713e-b767-5de07ece95d2"
         width="256" height="256" alt="img"/>
    <img id="slime_death_6"
         src="https://wikiric.xyz/files/public/get/01921a48-b528-713e-8575-bf6437dae6a9"
         width="256" height="256" alt="img"/>
    <img id="slime_death_7"
         src="https://wikiric.xyz/files/public/get/01921a48-e034-713e-bb0c-188584dbfa77"
         width="256" height="256" alt="img"/>
    <img id="slime_death_8"
         src="https://wikiric.xyz/files/public/get/01921a49-0797-713e-a977-6e88f56acd06"
         width="256" height="256" alt="img"/>
    <!-- Skeleton Model -->
    <img id="skeleton_0"
         src="https://wikiric.xyz/files/public/get/01921b46-63ba-713e-8211-cbdd4b46f529"
         width="256" height="256" alt="img"/>
    <img id="skeleton_1"
         src="https://wikiric.xyz/files/public/get/01921b46-f48a-713e-b5e7-37ec8341349b"
         width="256" height="256" alt="img"/>
    <img id="skeleton_2"
         src="https://wikiric.xyz/files/public/get/01921b47-35eb-713e-a24b-ba15ac208320"
         width="256" height="256" alt="img"/>
    <img id="skeleton_3"
         src="https://wikiric.xyz/files/public/get/01921b47-61ec-713e-902a-eff2141f5bc1"
         width="256" height="256" alt="img"/>
    <img id="skeleton_4"
         src="https://wikiric.xyz/files/public/get/01921b47-8f06-713e-b3ee-90de9eec8bbe"
         width="256" height="256" alt="img"/>
    <img id="skeleton_5"
         src="https://wikiric.xyz/files/public/get/01921b48-2732-713e-b68b-71fa0c75b5ae"
         width="256" height="256" alt="img"/>
    <img id="skeleton_6"
         src="https://wikiric.xyz/files/public/get/01921b48-5257-713e-a70c-c89ffe4d29b8"
         width="256" height="256" alt="img"/>
    <img id="skeleton_7"
         src="https://wikiric.xyz/files/public/get/01921b48-8099-713e-8993-0a13e8208324"
         width="256" height="256" alt="img"/>
    <img id="skeleton_8"
         src="https://wikiric.xyz/files/public/get/01921b48-abb8-713e-980a-18c991268aa2"
         width="256" height="256" alt="img"/>
    <img id="skeleton_9"
         src="https://wikiric.xyz/files/public/get/01921b48-da8f-713e-bbf5-f4298897d924"
         width="256" height="256" alt="img"/>
    <img id="skeleton_10"
         src="https://wikiric.xyz/files/public/get/01921b49-088c-713e-9f8e-45fc1a9ef706"
         width="256" height="256" alt="img"/>
    <img id="skeleton_11"
         src="https://wikiric.xyz/files/public/get/01921b49-345b-713e-90c4-810b6ea3b7a9"
         width="256" height="256" alt="img"/>
    <!-- Skeleton Death Animation -->
    <img id="skeleton_death_0"
         src="https://wikiric.xyz/files/public/get/01921b4b-3f6e-713e-90f7-2e6f8b26d777"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_1"
         src="https://wikiric.xyz/files/public/get/01921b4b-dd6a-713e-a7c5-431b27c54095"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_2"
         src="https://wikiric.xyz/files/public/get/01921b4c-0b36-713e-986a-a147f4b1a2b4"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_3"
         src="https://wikiric.xyz/files/public/get/01921b4c-2fb2-713e-b470-ab59d5c6a95d"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_4"
         src="https://wikiric.xyz/files/public/get/01921b4c-5d5d-713e-9bdb-b8dfdb25fe67"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_5"
         src="https://wikiric.xyz/files/public/get/01921b4c-9627-713e-a118-b1c48569ecfd"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_6"
         src="https://wikiric.xyz/files/public/get/01921b4c-c0f0-713e-a131-215fbb55da63"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_7"
         src="https://wikiric.xyz/files/public/get/01921b4d-4ea6-713e-a6eb-a53a23e8d76e"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_8"
         src="https://wikiric.xyz/files/public/get/01921b4d-93f3-713e-8757-eb68d755f509"
         width="256" height="256" alt="img"/>
    <img id="skeleton_death_9"
         src="https://wikiric.xyz/files/public/get/01921b4d-bf68-713e-a0e8-ee9ff9b234e9"
         width="256" height="256" alt="img"/>
    <!-- Player Model -->
    <img id="wizzard"
         src="https://wikiric.xyz/files/public/get/018f9cfd-e044-738d-8df8-199c73d55585"
         width="48" height="48" alt="img"/>
    <!-- Tile Models -->
    <img id="wall_inner"
         src="https://wikiric.xyz/files/public/get/018f9d2f-e5b6-738d-bf08-62f0e4fc3804"
         width="50" height="50" alt="img"/>
    <img id="floor_alt_1"
         src="https://wikiric.xyz/files/public/get/018f9cd4-27c6-738d-a085-ad40d23e4898"
         width="50" height="50" alt="img"/>
    <img id="floor_alt_2"
         src="https://wikiric.xyz/files/public/get/018f9cd4-1f37-738d-b736-60ff4775b7a8"
         width="50" height="50" alt="img"/>
    <img id="floor_bloody"
         src="https://wikiric.xyz/files/public/get/018f9cd4-3b5f-738d-a45d-f14cb45cee5a"
         width="50" height="50" alt="img"/>
    <img id="wall"
         src="https://wikiric.xyz/files/public/get/018f9609-53c7-7af1-b199-8bb89b9a1a95"
         width="50" height="50" alt="img"/>
    <img id="wall_top_left"
         src="https://wikiric.xyz/files/public/get/018f9cd4-727d-738d-8372-7b061a335c5b"
         width="50" height="50" alt="img"/>
    <img id="wall_top_middle"
         src="https://wikiric.xyz/files/public/get/018f9cd4-79dd-738d-bcd9-b6f6253f98fe"
         width="50" height="50" alt="img"/>
    <img id="wall_top_right"
         src="https://wikiric.xyz/files/public/get/018f9cd4-814e-738d-a22a-288999cac241"
         width="50" height="50" alt="img"/>
    <img id="wall_left_middle"
         src="https://wikiric.xyz/files/public/get/018f9cd8-7aa5-738d-b17d-877c475c266d"
         width="50" height="50" alt="img"/>
    <img id="wall_right_middle"
         src="https://wikiric.xyz/files/public/get/018f9cd8-8274-738d-bbde-3004d1b69105"
         width="50" height="50" alt="img"/>
    <img id="wall_bottom_left"
         src="https://wikiric.xyz/files/public/get/018f9cd4-60b5-738d-9f79-cfea517dd2cf"
         width="50" height="50" alt="img"/>
    <img id="wall_bottom_middle"
         src="https://wikiric.xyz/files/public/get/018f9cd4-6b4a-738d-8a06-c66fc7e7f795"
         width="50" height="50" alt="img"/>
    <img id="wall_bottom_right"
         src="https://wikiric.xyz/files/public/get/018f9cd8-738d-738d-b480-33e50482adce"
         width="50" height="50" alt="img"/>
    <img id="wall_inner_top_left"
         src="https://wikiric.xyz/files/public/get/018f9d30-0ece-738d-89d0-59b65270c4e5"
         width="50" height="50" alt="img"/>
    <img id="wall_inner_top_right"
         src="https://wikiric.xyz/files/public/get/018f9d30-15dd-738d-a8bb-0d3bc66a2e2a"
         width="50" height="50" alt="img"/>
    <img id="wall_base_left"
         src="https://wikiric.xyz/files/public/get/018f9cd4-92b3-738d-afd2-1479727a4698"
         width="50" height="50" alt="img"/>
    <img id="wall_base_middle"
         src="https://wikiric.xyz/files/public/get/018f9cd4-8ab8-738d-a7f7-940fa063c34c"
         width="50" height="50" alt="img"/>
    <img id="wall_base_right"
         src="https://wikiric.xyz/files/public/get/018f9cd4-ad47-738d-8918-211e3a416ca9"
         width="50" height="50" alt="img"/>
    <img id="wall_inner_bottom_left"
         src="https://wikiric.xyz/files/public/get/018f9d2f-f7e4-738d-874b-d1ff530bbb7f"
         width="50" height="50" alt="img"/>
    <img id="wall_inner_bottom_right"
         src="https://wikiric.xyz/files/public/get/018f9d30-0121-738d-9e2f-69ef1577ee75"
         width="50" height="50" alt="img"/>
    <img id="tile_floor_top_left"
         src="https://wikiric.xyz/files/public/get/018ff89b-2be3-726d-8f5b-3fd169bef028"
         width="50" height="50" alt="img"/>
    <img id="tile_floor_top"
         src="https://wikiric.xyz/files/public/get/018ff89b-3a8d-726d-8599-f136d6cf4f9f"
         width="50" height="50" alt="img"/>
    <img id="tile_floor_top_right"
         src="https://wikiric.xyz/files/public/get/018ff89b-334f-726d-8682-5e0349842350"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_col_top"
         src="https://wikiric.xyz/files/public/get/018ff89a-ee17-726d-8b70-d8a4bb5fb0b0"
         width="50" height="50" alt="img"/>
    <img id="tile_floor_left"
         src="https://wikiric.xyz/files/public/get/018ff89b-2365-726d-b1fd-e73cd5b94db5"
         width="50" height="50" alt="img"/>
    <img id="floor"
         src="https://wikiric.xyz/files/public/get/018f9ca3-73c2-738d-8a28-03610cb178e5"
         width="50" height="50" alt="img"/>
    <img id="tile_floor_right"
         src="https://wikiric.xyz/files/public/get/018ff89b-1b17-726d-8cba-20fc99a2eb07"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_col_middle"
         src="https://wikiric.xyz/files/public/get/018ff89a-e3a5-726d-b8b0-86fca58347a7"
         width="50" height="50" alt="img"/>
    <img id="tile_floor_bottom_left"
         src="https://wikiric.xyz/files/public/get/018ff89a-fe4f-726d-8cbe-c24a0bdbf554"
         width="50" height="50" alt="img"/>
    <img id="tile_floor_bottom"
         src="https://wikiric.xyz/files/public/get/018ff89b-05da-726d-b59f-ca5d553eb816"
         width="50" height="50" alt="img"/>
    <img id="tile_floor_bottom_right"
         src="https://wikiric.xyz/files/public/get/018ff89b-0c99-726d-9f39-d19440513f8d"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_col_bottom"
         src="https://wikiric.xyz/files/public/get/018ff89a-dc3c-726d-8ad4-0952740cde0f"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_left"
         src="https://wikiric.xyz/files/public/get/018ff89a-b89e-726d-859f-12c7e353b742"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_middle"
         src="https://wikiric.xyz/files/public/get/018ff89a-c267-726d-8ed7-4ef504382a55"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_right"
         src="https://wikiric.xyz/files/public/get/018ff89a-cdd6-726d-9f0a-386d6490eb86"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_col_base"
         src="https://wikiric.xyz/files/public/get/018ff89a-d566-726d-8e82-17b39c29ede5"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_base_left_2"
         src="https://wikiric.xyz/files/public/get/018ff89a-982c-726d-9405-f555e6c1247a"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_base_middle_2"
         src="https://wikiric.xyz/files/public/get/018ff89a-a452-726d-aac1-46b39f8ef66a"
         width="50" height="50" alt="img"/>
    <img id="tile_wall_base_right_2"
         src="https://wikiric.xyz/files/public/get/018ff89a-b1b4-726d-9610-9d1c8d19defb"
         width="50" height="50" alt="img"/>
  </div>
  <q-slide-transition v-if="!isSimulating">
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
import FFUnit from 'pages/games/flowfield/units/FFUnit'
import FFQuadTree from 'pages/games/flowfield/structure/FFQuadTree'
import FFTilesQuadTree from 'pages/games/flowfield/structure/FFTilesQuadTree'
import FFTile from 'pages/games/flowfield/structure/FFTile'
import FFOnHitEffect from 'pages/games/flowfield/powerups/FFOnHitEffect'
import FFWeaponComp from 'pages/games/flowfield/weapons/FFWeapon.vue'
import FFWeaponList from 'pages/games/flowfield/weapons/FFWeaponList'
import FFPowerUpList from 'pages/games/flowfield/powerups/FFPowerUpList'
import FFWeaponDisplay from 'pages/games/flowfield/weapons/FFWeaponDisplay.vue'
import FFPowerUpDisplay from 'pages/games/flowfield/powerups/FFPowerUpDisplay.vue'
import FilePicker from 'components/FilePicker.vue'
import { useStore } from 'stores/wikistate'
import FFWeapon from 'pages/games/flowfield/weapons/FFWeapon'
import FFPowerUp from 'pages/games/flowfield/powerups/FFPowerUp'
import FFPowerUpEffect from 'pages/games/flowfield/powerups/FFPowerUpEffect'
import WRTC from 'src/libs/wRTC'
import FFUnitAssets from 'pages/games/flowfield/units/FFUnitAssets'
import { DateTime } from 'luxon'
import FFItemList from 'pages/games/flowfield/items/FFItemList'
import FFShop from 'pages/games/flowfield/FFShop.vue'
import FFItem from 'pages/games/flowfield/items/FFItem'
import FFItemEffect from 'pages/games/flowfield/items/FFItemEffect'
import FFTrophyList from 'pages/games/flowfield/trophies/FFTrophyList'
import FFAbilityComp from 'pages/games/flowfield/powerups/FFAbility.vue'
import wikiricUtils from 'src/libs/wikiric-utils'
import axios from 'axios'

export default {
  name: 'FlowFieldDemo',
  components: {
    FFShop,
    FilePicker,
    FFPowerUpDisplay,
    FFWeaponDisplay,
    FFWeaponComp,
    FFAbilityComp
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
          label: 'Slime',
          value: 'enemy_slime',
          icon: 'sym_o_bug_report'
        },
        {
          label: 'Skeleton',
          value: 'enemy_skeleton',
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
      width: 2000, // 1550,
      height: 2000, // 1550,
      sWidth: 0,
      sHeight: 0,
      totalCells: 0,
      xCells: 0,
      yCells: 0,
      costField: undefined,
      integrationField: undefined,
      illuminationField: undefined,
      /**
       * @type {Map<String, FFUnit>}
       */
      enemies: new Map(),
      /**
       * @type FFTilesQuadTree
       */
      tileTree: null,
      offsetVector: new THREE.Vector2(0, 0),
      onHitEffects: [],
      isLevelUp: false,
      shopTab: 'shop',
      cursorX: 0,
      cursorY: 0,
      fow: new Map(),
      godMode: false,
      spawnEnemies: true,
      keepSidebarOpen: false,

      // TOYS

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
      itemList: new FFItemList(),
      /**
       * @type FFItem[]
       */
      itemOffers: [],
      trophyList: new FFTrophyList(),
      modifyingWeapons: false,
      /**
       * @type FFPowerUp
       */
      chosenPowerup: undefined,
      isPickingMap: false,

      // PLAYABLE CHARACTER DATA

      canMove: false,
      goalPosition: new THREE.Vector2(-1, -1),
      goalHP: 100,
      goalMaxHP: 0,
      goalMaxHPOriginal: 100,
      goalXP: 0,
      goalMoney: 0,
      goalMaxXP: 500,
      goalLevel: 1,
      goalLevelUps: 0,
      goalLevelUpsOpen: 0,
      goalInvincibilityFrames: 0,
      goalAlive: true,
      goalKills: 0,
      /**
       * @type {FFWeapon[]}
       */
      goalWeapons: [],
      /**
       * @type {FFPowerUp[]}
       */
      goalAbilities: [],
      /**
       * @type {FFItem[]}
       */
      goalItems: [],
      goalStats: new Map(),
      /**
       * @type {FFProjectile[]}
       */
      goalWeaponProjectiles: [],
      goalMaxRange: 0,
      goalMovementVector: new THREE.Vector2(0, 0),
      goalSpeed: 2,
      goalSpeedOriginal: 2,
      goalNorth: new THREE.Vector2(0, -1),
      goalWest: new THREE.Vector2(-1, 0),
      goalSouth: new THREE.Vector2(0, 1),
      goalEast: new THREE.Vector2(1, 0),
      goalUp: false,
      goalLeft: false,
      goalDown: false,
      goalRight: false,
      goalDamaged: false,

      // SIMULATION DATA

      isCalculating: false,
      isSimulating: false,
      isScheduling: false,
      timeDelta: 0,
      theta: 0,
      secondInterval: null,
      secondsPassed: 0,
      secondsMax: 40,
      currentRound: 0,

      // DEBUG DATA

      drawHeatmap: false,
      drawIlluminationHeatmap: false,
      drawDamageNumbers: true,
      drawWallCollision: false,

      // MULTIPLAYER DATA

      roomId: 'wkrg_ffa_dev2',
      currentSRLatency: -1,
      getQueue: new Map(),
      lastPos: null,
      isHost: false,
      dataMap: new Map(),
      playerData: new Map(),
      sessions: new Map(),
      coPlayers: new Map(),
      peerCons: new Map(),
      wrtc: WRTC,
      // Calculation Worker
      cWorker: null,
      // Illumination Worker
      iWorker: null,
      isSyncing: false,
      syncCount: 0,
      syncMaxCount: 999999,
      syncRound: -1,
      syncCache: new Map(),
      failSafe: 0,
      tcpQueue: []
    }
  },
  mounted () {
    setTimeout(() => {
      this.initFunction()
      this.useLevelUp()
      this.tinyRic()
    }, 0)
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
    },
    timePassed () {
      if (this.secondsPassed < 10) {
        return `00:0${this.secondsPassed}`
      } else {
        let seconds = (this.secondsPassed % 60).toString()
        if (seconds.length < 2) {
          seconds = '0' + seconds
        }
        let minutes = Math.floor(this.secondsPassed / 60).toString()
        if (minutes.length < 2) {
          minutes = '0' + minutes
        }
        return `${minutes}:${seconds}`
      }
    },
    gameMetaText () {
      let round
      if (this.currentRound < 1) {
        round = 'Preparation'
      } else {
        round = `Round ${this.currentRound}`
      }
      return `${round} | ${this.timePassed} | ${this.goalKills} Kills | ${this.roomId}`
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
      this.setUpCalcWorker()
      this.setUpIlluminationWorker()
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
      this.powerUpList.initiatePowerUps()
      this.itemList = new FFItemList()
      this.itemList.initiateStarterItems()
      this.trophyList = new FFTrophyList()
      this.trophyList.initiateStarterTrophies()
      this.setUpPlayer()
      this.setUpSyncRoom()
      // QoL
      this.addGoal(new THREE.Vector2(3, 4))
      this.goalLevelUps = 1
      this.goalLevelUpsOpen = 1
      setTimeout(() => {
        this.addBorderWalls()
      }, 3000)
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
      this.scaleCanvas(canvas, this.ctx)
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
      this.scaleCanvas(canvas2, this.ctx2)
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
        // Set cursor position for e.g. abilities
        vueInst.cursorX = posX
        vueInst.cursorY = posY
        if (vueInst.brush === 'cursor') {
          return
        }
        // Calculate position on grid
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
      this.scaleCanvas(canvas, this.ctx3)
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
      this.scaleCanvas(canvas, this.ctxPlayer)
      this.ctxPlayer.clearRect(0, 0, this.width, this.height)
    },
    scaleCanvas: function (canvas, ctx) {
      const dpr = window.devicePixelRatio
      const exaggeration = 20
      const width = Math.ceil(this.width * dpr + exaggeration)
      const height = Math.ceil(this.height * dpr + exaggeration)
      canvas.width = width
      canvas.height = height
      canvas.style.width = `${width / dpr}px`
      canvas.style.height = `${height / dpr}px`
      ctx.scale(dpr, dpr)
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
      const xCells = Math.ceil((this.width / this.gridSize))
      const yCells = Math.ceil((this.height / this.gridSize))
      const xCellsI = xCells * 2
      const yCellsI = yCells * 2
      // Notify FFCalcWorker
      if (this.cWorker) {
        this.cWorker.postMessage({
          msg: '[c:cell]',
          x: xCells,
          y: yCells
        })
        this.iWorker.postMessage({
          msg: '[c:cell]',
          x: xCellsI,
          y: yCellsI
        })
      }
      const totalCells = xCells * yCells
      this.xCells = xCells
      this.yCells = yCells
      this.totalCells = totalCells
      // Initialize grid arrays
      this.costField = new Uint16Array(totalCells)
      this.integrationField = new Uint16Array(totalCells)
      this.illuminationField = new Uint16Array(totalCells * 2)
      // Fill with default values
      for (let i = 0; i < totalCells; i++) {
        this.costField[i] = 1
        this.integrationField[i] = 65535
      }
      for (let i = 0; i < totalCells * 2; i++) {
        this.illuminationField[i] = 65535
      }
      console.log('> Grid initialized!')
      console.log(`\tX(${xCells}) * Y(${yCells}) = ${totalCells} Cells`)
      console.log(`\tXI(${xCellsI}) * YI(${yCellsI}) = ${totalCells * 2} Cells`)
    },
    initializeIntegrationGrid: function () {
      for (let i = 0; i < this.totalCells; i++) {
        this.integrationField[i] = 65535
      }
    },
    initializeIlluminationGrid: function () {
      for (let i = 0; i < this.totalCells * 2; i++) {
        this.illuminationField[i] = 65535
      }
    },
    /**
     *
     * @param {Boolean} initial
     */
    drawGrid: function (initial) {
      /**
       * @type {HTMLImageElement}
       */
      const floor = document.getElementById('floor')
      if (floor == null) return
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
          if (!this.godMode) {
            arrayPos = this.convertXYToArrayPos(x, y)
            if (!this.fow.has(arrayPos)) {
              this.ctx.fillStyle = '#141412'
              this.ctx.fillRect(xNew, yNew, this.gridSize, this.gridSize)
              continue
            }
          }
          // if (this.costField[arrayPos] !== 255) {
          this.ctx.drawImage(floor, xNew, yNew, this.gridSize, this.gridSize)
          // }
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
          this.addWall(position, true)
          // Re-calculate flow field
          this.handleCalculation()
          break
        case 'tile':
          this.addTile(position, true)
          break
        case 'goal':
          this.addGoal(position)
          break
        case 'enemy_slime':
          this.addEnemy(position, 'slime', false)
          break
        case 'enemy_skeleton':
          this.addEnemy(position, 'skeleton', false)
          break
        case 'eraser':
          this.removeWall(position)
          break
      }
    },
    addWall: function (position, notifyOthers) {
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
      // Notify FFCalcWorker
      if (this.cWorker) {
        this.cWorker.postMessage({
          msg: '[c:cost]',
          pos: arrayPos,
          val: 255
        })
        // We will need to add 4 positions as the illumination field
        // ...has double precision.
        // Basically, it retrieves 3 more coordinates.
        const positions = this.convertXYPosToDPositions(
          position.x, position.y)
        let tmpArrayPos
        for (let i = 0; i < positions.length; i++) {
          tmpArrayPos = this.convertXYToArrayDPos(
            positions[i][0], positions[i][1])
          this.iWorker.postMessage({
            msg: '[c:cost]',
            pos: tmpArrayPos,
            val: 255
          })
        }
      }
      // Check if there is the same tile present already
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
      // Notify co-players
      if (notifyOthers) {
        this.$connector.sendSyncRoomMessage(
          `scost;${position.x};${position.y};${xNew};${yNew};${this.tile}`)
      }
      // Insert and render tile
      this.tileTree.insert(tile)
      this.renderTiles(this.offsetVector)
    },
    addTile: function (position, notifyOthers) {
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
      // Notify co-players
      if (notifyOthers) {
        this.$connector.sendSyncRoomMessage(
          `stile;${position.x};${position.y};${xNew};${yNew};${this.tile}`)
      }
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
      let ix
      for (const tile of tiles) {
        if (!this.godMode) {
          ix = this.convertXYToArrayPos(tile.pos.x, tile.pos.y)
          if (!this.fow.has(ix)) {
            continue
          }
        }
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
      this.ctxPlayer.font = '12px "Open Sans"'
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
        this.ctxPlayer.font = '12px "Open Sans"'
        this.ctxPlayer.fillText(val.usr, xNew, yNew)
      })
    },
    addEnemy: function (position, enemyType, skipSend) {
      const ix = this.convertXYToArrayPos(position.x, position.y)
      // Prevent out of bounds or adding on top of a wall
      if (ix < 0 || ix > this.costField.length || this.costField[ix] === 255) {
        return
      }
      // Add enemy to list
      const id = this.getUUID()
      // Scale HP with Level
      let hp = 1
      let xp = 1
      let armor = 0
      let money = 5
      let dmg
      /**
       * @type {HTMLImageElement}
       */
      let image
      let dim, off
      let xNew, yNew
      if (enemyType === 'slime') {
        hp = 20
        dmg = 5
        xp = 100
        armor = 0
        money = 5
        image = document.getElementById('slime_jump_0')
        dim = 32
        off = 8
        xNew = position.x * this.gridSize + off
        yNew = position.y * this.gridSize + off
      } else if (enemyType === 'skeleton') {
        hp = 150
        dmg = 30
        xp = 1000
        armor = 5
        money = 10
        image = document.getElementById('skeleton_0')
        dim = 100
        off = -20
        xNew = position.x * this.gridSize + off
        yNew = position.y * this.gridSize + off
      }
      hp += ((this.goalLevel * hp) - (this.goalLevel * 1.5))
      const unit = new FFUnit(
        position.x,
        position.y,
        1 + Math.random(),
        id,
        dmg,
        hp,
        xp,
        enemyType,
        dim, // We're using dim and off twice on purpose! Do not worry
        dim,
        off,
        off,
        armor,
        money)
      this.enemies.set(id, unit)
      if (!skipSend) {
        // Transmit new unit to co-players
        this.srSendEnemy(unit)
      }
      // Draw enemy
      if (image) {
        this.ctx3.drawImage(image, xNew, yNew, dim, dim)
      }
    },
    /**
     *
     * @param {FFUnit} u
     * @param {String} [prefix='E0-']
     */
    srSendEnemy: function (u, prefix = 'E0-') {
      const msg = `${prefix}${u.pos.x};${u.pos.y};${u.maxSpeed};${u.id};${u.dps};${u.maxHp};${u.xp};${u.visualType};${u.dimW};${u.dimH};${u.offX};${u.offY};${u.armor};${u.money}`
      this.$connector.sendSyncRoomMessage(msg)
    },
    handleCalculation: async function () {
      // Do we have to calculate on our own?
      // If a dedicated worker is available we will utilize
      // ...the calculation worker to free the UI thread
      let calcSelf = true
      if (this.cWorker) {
        calcSelf = false
        this.triggerFlowFieldCalculation()
        this.triggerIlluminationCalculation()
        if (this.drawHeatmap) {
          this.drawHeatmapCtx()
        }
      }
      if (!calcSelf) {
        return
      }
      // this.ctx.clearRect(0, 0, this.width, this.height)
      // Integration grid always needs to be initialized
      this.initializeIntegrationGrid()
      this.initializeIlluminationGrid()
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
    triggerFlowFieldCalculation: function () {
      this.cWorker.postMessage({
        msg: '[c:setp]',
        x: this.goalPosition.x,
        y: this.goalPosition.y
      })
      this.cWorker.postMessage({
        msg: '[c:seto]',
        x: this.offsetVector.x,
        y: this.offsetVector.y
      })
      this.cWorker.postMessage({
        msg: '[c:calc]'
      })
    },
    triggerIlluminationCalculation: function () {
      this.iWorker.postMessage({
        msg: '[c:setp]',
        x: this.goalPosition.x * 2,
        y: this.goalPosition.y * 2
      })
      this.iWorker.postMessage({
        msg: '[c:seto]',
        x: this.offsetVector.x * 2,
        y: this.offsetVector.y * 2
      })
      this.iWorker.postMessage({
        msg: '[c:calc]'
      })
    },
    heatMapColorForValue: function (value) {
      const h = value * 240
      return `hsl(${h}, 100%, 25%)`
    },
    convertXYToArrayPos: function (x, y) {
      return this.xCells * y + x
    },
    convertXYToArrayDPos: function (x, y) {
      return (this.xCells * 2) * y + x
    },
    convertArrayPosToXY: function (pos) {
      const x = Math.floor(pos % this.xCells)
      const y = Math.floor(pos / this.xCells)
      return [x, y]
    },
    convertArrayDPosToXY: function (pos) {
      const x = Math.floor(pos % (this.xCells * 2))
      const y = Math.floor(pos / (this.xCells * 2))
      return [x, y]
    },
    /**
     * For each position on the regular grid there are 4 positions
     * ...on the double precision grid.
     *
     * A regular position results in 4 coordinates.
     */
    convertXYPosToDPositions: function (x, y) {
      x *= 2
      y *= 2
      return [
        [x, y], // TL
        [x + 1, y], // TR
        [x, y + 1], // BL
        [x + 1, y + 1] // BR
      ]
    },
    /**
     * For each position on the regular grid there are 4 positions
     * ...on the double precision grid.
     *
     * A double precision position gets reduced to its regular position.
     */
    convertDPosToXYPos: function (x, y) {
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
    getNeighborIndices: function (x, y, dist, includeSelf = false) {
      // Guard
      if (x < 0 || y < 0 || x >= this.xCells || y >= this.yCells) {
        return []
      }
      const list = []
      for (let xi = x - dist; xi <= x + dist; xi++) {
        if (xi < 0 || xi >= this.xCells) {
          continue
        }
        for (let yi = y - dist; yi <= y + dist; yi++) {
          if (yi < 0 || yi >= this.yCells) {
            continue
          }
          if (!includeSelf && xi === x && yi === y) {
            continue
          }
          list.push(this.convertXYToArrayPos(xi, yi))
        }
      }
      return list
    },
    getNeighborPositions: function (x, y, dist, includeSelf = false) {
      // Guard
      if (x < 0 || y < 0 || x >= this.xCells || y >= this.yCells) {
        return []
      }
      const list = []
      for (let xi = x - dist; xi <= x + dist; xi++) {
        if (xi < 0 || xi >= this.xCells) {
          continue
        }
        for (let yi = y - dist; yi <= y + dist; yi++) {
          if (yi < 0 || yi >= this.yCells) {
            continue
          }
          if (!includeSelf && xi === x && yi === y) {
            continue
          }
          list.push([xi, yi])
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
    /**
     * Schedules the start of the simulation.
     * We want to provide a desync-free environment
     * ...to the players, so we have to consider any
     * ...network lag or unprocessed messages.
     *
     * If there is a time provided, it will be used.
     *
     * If there is no time, one will be determined
     * ...and distributed if there are co-players.
     *
     * To show the shop (e.g. at the end of the round)
     * ...simply provide doShowOffers=true
     *
     * @param {Boolean} isRunning
     * @param {Boolean} doSync
     * @param {Boolean} doShowOffers
     * @param [timeWhen=null]
     */
    scheduleSimulation: function (isRunning, doSync, doShowOffers, timeWhen = null) {
      let delay
      if (timeWhen) {
        delay = timeWhen - DateTime.now().toMillis()
        if (isRunning) {
          console.log('(REMOTE) Scheduling start...')
          this.isScheduling = true
          setTimeout(() => {
            this.handleSimulation(true)
          }, delay)
        } else {
          console.log('(REMOTE) Scheduling stop...')
          setTimeout(() => {
            this.cancelSimulation(doShowOffers)
          }, delay)
        }
        return
      }
      // We are scheduling it for others, too.
      if (doSync) {
        this.synchronizeEnemies()
        if (this.isSyncing) {
          return
        }
      }
      // 2 seconds delay
      delay = 1_000 + DateTime.now().toMillis()
      this.$connector.sendSyncRoomMessage(
        `SCSIM-${isRunning};${delay};${doShowOffers}`
      )
      delay = 1_000 + this.currentSRLatency
      if (isRunning) {
        console.log('(LOCAL) Scheduling start...')
        this.isScheduling = true
        setTimeout(() => {
          this.handleSimulation(true)
        }, delay)
      } else {
        console.log('(LOCAL) Scheduling stop...')
        setTimeout(() => {
          this.cancelSimulation(doShowOffers)
        }, delay)
      }
    },
    handleSimulation: function (srSilent) {
      if (this.isSimulating) return
      console.log('Starting Simulation...')
      // Wall of Init
      this.secondsPassed = 0
      this.currentRound += 1
      this.trophyList.addProgress('round', 1)
      this.isSimulating = true
      this.isScheduling = false
      this.canMove = false
      this.theta = 0
      this.weaponOffers = []
      this.itemOffers = []
      this.goalDamaged = false
      // Count the time passed (rounds!)
      this.secondInterval = setInterval(() => {
        this.secondsPassed += 1
        if (this.isHost && this.secondsPassed >= this.secondsMax) {
          // Round has ended!
          this.handleEndOfRound()
          clearInterval(this.secondInterval)
        }
      }, 1_000)
      // Calculate integration grid (Flow Field)
      this.handleCalculation()
      // Proc item effects like HP and Speed
      this.applyGoalItems(true)
      this.applyCoPlayersItems(true)
      // Transmit weapon data
      this.distributeGoalWeapons()
      this.distributeGoalItems()
      this.distributeGoalAbilities()
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
      // Enable player movement
      if (this.currentSRLatency < 0) {
        setTimeout(() => {
          this.canMove = true
        }, 100)
      } else {
        setTimeout(() => {
          this.canMove = true
        }, this.currentSRLatency * 2)
      }
      // Add unit media
      let tmp
      const assets = new FFUnitAssets()
      assets.addAsset('slime',
        [],
        [
          document.getElementById('slime_jump_0'),
          document.getElementById('slime_jump_1'),
          document.getElementById('slime_jump_2'),
          document.getElementById('slime_jump_3'),
          document.getElementById('slime_jump_4'),
          document.getElementById('slime_jump_5')
        ],
        [],
        [
          document.getElementById('slime_death_0'),
          document.getElementById('slime_death_1'),
          document.getElementById('slime_death_2'),
          document.getElementById('slime_death_3'),
          document.getElementById('slime_death_4'),
          document.getElementById('slime_death_5'),
          document.getElementById('slime_death_6'),
          document.getElementById('slime_death_7'),
          document.getElementById('slime_death_8')
        ])
      assets.addAsset('skeleton',
        [],
        [
          document.getElementById('skeleton_0'),
          document.getElementById('skeleton_1'),
          document.getElementById('skeleton_2'),
          document.getElementById('skeleton_3'),
          document.getElementById('skeleton_4'),
          document.getElementById('skeleton_5'),
          document.getElementById('skeleton_6'),
          document.getElementById('skeleton_7'),
          document.getElementById('skeleton_8'),
          document.getElementById('skeleton_9'),
          document.getElementById('skeleton_10'),
          document.getElementById('skeleton_11')
        ],
        [],
        [
          document.getElementById('skeleton_death_0'),
          document.getElementById('skeleton_death_1'),
          document.getElementById('skeleton_death_2'),
          document.getElementById('skeleton_death_3'),
          document.getElementById('skeleton_death_4'),
          document.getElementById('skeleton_death_5'),
          document.getElementById('skeleton_death_6'),
          document.getElementById('skeleton_death_7'),
          document.getElementById('skeleton_death_8'),
          document.getElementById('skeleton_death_9')
        ])
      /**
       * @type {THREE.Vector2}
       */
      let endVector
      let qtree
      const cacheMap = new Map()
      let cacheDiff
      // Step Function to be called repeatedly
      let stepCount = 0
      let lastFiveSecond = performance.now()
      let lastSecond = performance.now()
      let lastHalfSecond = performance.now()
      let lastTime = performance.now()
      let timeDelta
      let lastPos
      /*
      Here lies the game logic! step() will be called over and over again.
       */
      const step = () => {
        if (!this.goalAlive) {
          this.srNotifySimulation(false)
          this.isSimulating = false
          console.log('Simulation has ended!')
          return
        }
        // Did half a second pass?
        tmp = performance.now()
        if ((tmp - lastHalfSecond) / 500 >= 1) {
          lastHalfSecond = tmp
          this.procPerHalfSecondTriggers()
        }
        // Calculate FPS
        // Did a second pass?
        if ((tmp - lastSecond) / 1000 >= 1) {
          lastSecond = tmp
          this.timeDelta = stepCount
          stepCount = 0
          this.procPerSecondTriggers()
        }
        // Did five seconds pass?
        if ((tmp - lastFiveSecond) / 5000 >= 1) {
          lastFiveSecond = tmp
          this.procPerFiveSecondTriggers()
        }
        // How many seconds passed?
        timeDelta = (tmp - lastTime) / 1000
        lastTime = tmp
        // Schedule next step
        // MDN Docs say it's best practice to put this here
        // ...so I guess we will just do it.
        requestAnimationFrame(step)
        // Send queued requests until they are confirmed!
        this.executeTCP()
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
        this.renderIllumination()
        // Frame-Resets
        qtree = new FFQuadTree(this.xCells / 2, this.yCells / 2, this.xCells / 2, this.yCells / 2, 4)
        cacheMap.clear()
        stepCount += 1
        this.ctx3.clearRect(0, 0, this.width, this.height)
        // Reduce invincibility frames
        if (this.goalInvincibilityFrames > 0) {
          this.goalInvincibilityFrames -= 1
        }
        // Reduce weapon and ability cooldown
        for (let i = 0; i < this.goalWeapons.length; i++) {
          this.goalWeapons[i].processTick(120 * timeDelta)
        }
        for (let i = 0; i < this.goalAbilities.length; i++) {
          this.goalAbilities[i].processTick(120 * timeDelta)
        }
        this.reduceCoPlayerWeaponCooldown(timeDelta)
        // #### ENEMY ACTIONS ####
        if (this.enemies && this.enemies.size > 0) {
          // Add all enemies to the quadtree
          for (const [id, unit] of this.enemies) {
            if (id) qtree.insert(unit)
          }
          this.applyEnemyMovement(assets, cacheMap, cacheDiff, qtree, timeDelta)
          // Now check if any enemy has come close to the players
          this.checkProximityDamage(qtree, assets)
          this.checkCoPlayersProximityDamage(qtree, assets)
        }
        // #### WEAPON ACTIONS ####
        // Render projectiles
        if (this.goalWeaponProjectiles.length > 0) {
          this.handleProjectiles(qtree, timeDelta, assets)
        }
        // #### ON HIT EFFECTS ####
        if (this.onHitEffects.length > 0) {
          this.handleOnHitEffects(qtree, assets)
        }
      }
      // Start first simulation step
      requestAnimationFrame(step)
    },
    handleEndOfRound: function () {
      this.scheduleSimulation(false, false, true)
    },
    applyGoalCalculation: function (lastPos) {
      if (this.drawHeatmap) {
        this.handleCalculation()
        return lastPos
      }
      const x = Math.round(((this.goalPosition.x + this.offsetVector.x) * 2))
      const y = Math.round(((this.goalPosition.y + this.offsetVector.y) * 2))
      if (!lastPos) {
        lastPos = new THREE.Vector2(x, y)
        this.handleCalculation()
        return lastPos
      }
      // Recalculate if player has reached a new cell
      // We save tons of CPU load because the cells are relatively big
      if (x !== lastPos.x || y !== lastPos.y) {
        lastPos = new THREE.Vector2(x, y)
        // Calculate new paths
        this.handleCalculation()
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
      const offsetY = this.goalPosition.y * this.gridSize >= ((this.sHeight / 2) - 100)
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
              if (!this.drawWallCollision) {
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
        // Notify FFCalcWorker
        if (this.cWorker) {
          this.cWorker.postMessage({
            msg: '[c:setp]',
            x: this.goalPosition.x,
            y: this.goalPosition.y
          })
          this.cWorker.postMessage({
            msg: '[c:seto]',
            x: this.offsetVector.x,
            y: this.offsetVector.y
          })
          this.iWorker.postMessage({
            msg: '[c:setp]',
            x: this.goalPosition.x * 2,
            y: this.goalPosition.y * 2
          })
          this.iWorker.postMessage({
            msg: '[c:seto]',
            x: this.offsetVector.x * 2,
            y: this.offsetVector.y * 2
          })
        }
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
        if (this.cWorker) {
          this.cWorker.postMessage({
            msg: '[c:copo]',
            usr: key,
            x: posObj.x - posObj.xo,
            y: posObj.y - posObj.yo
          })
          this.iWorker.postMessage({
            msg: '[c:copo]',
            usr: key,
            x: (posObj.x - posObj.xo) * 2,
            y: (posObj.y - posObj.yo) * 2
          })
        }
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
              if (!this.drawWallCollision) {
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
    applyEnemyMovement: function (assets, cacheMap, cacheDiff, qtree, timeDelta) {
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
      let tmpX, tmpY
      let tmp
      /**
       * @type {Number[]}
       */
      let debuffs
      const DebuffTypes = {
        Slow: 0,
        Stun: 1
      }
      let movementDebuff
      // Calculate new position vectors for all enemies
      for (const [id, current] of this.enemies) {
        if (!id) continue
        // Are we stunned or slowed?
        movementDebuff = -1
        debuffs = current.procMovementDebuffs()
        if (debuffs) {
          for (let i = 0; i < debuffs.length; i++) {
            switch (debuffs[i]) {
              case DebuffTypes.Slow:
              case DebuffTypes.Stun:
                if (movementDebuff > debuffs[i]) {
                  continue
                }
                movementDebuff = debuffs[i]
                break
            }
          }
          if (movementDebuff === DebuffTypes.Stun) {
            // Draw enemy
            if (assets) {
              this.renderEnemy(current, assets)
            }
            // Write back enemy
            this.enemies.set(id, current)
            continue
          }
        }
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
        if (movementDebuff === DebuffTypes.Slow) {
          endVector.multiplyScalar(0.5)
        }
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
        // Draw enemy
        if (assets) {
          this.renderEnemy(current, assets)
        }
        // Write back enemy
        this.enemies.set(id, current)
      }
    },
    checkProximityDamage: function (qtree, assets) {
      const others = qtree.getContents(
        this.goalPosition.x - this.offsetVector.x - (this.goalMaxRange / 2),
        this.goalPosition.y - this.offsetVector.y - (this.goalMaxRange / 2),
        this.goalPosition.x - this.offsetVector.x + (this.goalMaxRange / 2),
        this.goalPosition.y - this.offsetVector.y + (this.goalMaxRange / 2))
      if (!others || others.length < 1) {
        return
      }
      let armor = 0
      if (this.goalStats.has('armor')) {
        armor += Number(this.goalStats.get('armor'))
      }
      let extraDmg = 0
      if (this.goalStats.has('dmg')) {
        extraDmg += Number(this.goalStats.get('dmg'))
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
            this.goalHP -= (other.dps - armor)
            this.trophyList.addProgress('self_damage', (other.dps - armor))
            this.goalInvincibilityFrames = 20
            this.goalDamaged = true
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
            dist,
            extraDmg
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
            this.trophyList.addProgress('dmg', projectiles[j].dmg)
            if (other.hp <= 0) {
              this.handleEnemyDeath(other, assets)
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
    checkCoPlayersProximityDamage: function (qtree, assets) {
      if (!this.coPlayers || this.coPlayers.size < 1) {
        return
      }
      let posObj
      for (const [key, val] of this.coPlayers.entries()) {
        posObj = val
        posObj = this.checkCoPlayerProximityDamage(qtree, posObj, assets)
        this.coPlayers.set(key, posObj)
      }
    },
    checkCoPlayerProximityDamage: function (qtree, coPlayer, assets) {
      if (!coPlayer.weapons) return coPlayer
      const others = qtree.getContents(
        coPlayer.x - (this.goalMaxRange / 2),
        coPlayer.y - (this.goalMaxRange / 2),
        coPlayer.x + (this.goalMaxRange / 2),
        coPlayer.y + (this.goalMaxRange / 2))
      if (!others || others.length < 1) {
        return coPlayer
      }
      let extraDmg = 0
      if (this.goalStats.has('dmg')) {
        extraDmg += Number(this.goalStats.get('dmg'))
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
            dist,
            extraDmg
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
              this.addDeathAnimation(other, assets)
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
    /**
     *
     * @param {Number} timeDelta
     */
    reduceCoPlayerWeaponCooldown: function (timeDelta) {
      if (!this.coPlayers || this.coPlayers.size < 1) {
        return
      }
      for (const [key, val] of this.coPlayers.entries()) {
        if (val.weapons && val.weapons.length > 0) {
          for (let i = 0; i < val.weapons.length; i++) {
            val.weapons[i].processTick(120 * timeDelta)
          }
        }
        if (val.abilities && val.abilities.length > 0) {
          for (let i = 0; i < val.abilities.length; i++) {
            val.abilities[i].processTick(120 * timeDelta)
          }
        }
        this.coPlayers.set(key, val)
      }
    },
    handleProjectiles: function (qtree, timeDelta, assets) {
      let dist
      let tmp, tmp2, tmp3
      let projectile
      let newVec
      const DebuffTypes = {
        Slow: 0,
        Stun: 1
      }
      for (let i = this.goalWeaponProjectiles.length - 1; i >= 0; i--) {
        projectile = this.goalWeaponProjectiles[i]
        // Does this projectile expire?
        if (projectile.expires) {
          projectile.ttl -= 1
          if (projectile.ttl <= 0) {
            this.goalWeaponProjectiles.splice(i, 1)
            continue
          }
        }
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
        if (projectile.visualType === 'bullet') {
          this.ctx3.fillStyle = '#fff400'
          this.ctx3.arc(
            ((projectile.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2,
            ((projectile.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2,
            2,
            0,
            2 * Math.PI)
          this.ctx3.fill()
        } else if (projectile.visualType === 'rocket') {
          this.ctx3.fillStyle = '#fff400'
          this.ctx3.arc(
            ((projectile.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2,
            ((projectile.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2,
            2,
            0,
            2 * Math.PI)
          this.ctx3.fill()
        } else if (projectile.visualType === 'fire') {
          this.renderProjectileFire(projectile)
        } else if (projectile.visualType === 'spark') {
          this.renderProjectileElectricity(projectile)
        }
        // Did the projectile hit something?
        if (this.enemies.size > 0) {
          dist = projectile.hitRange * 2
          /**
           * @type FFUnit[]
           */
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
              // Can we hit the enemy?
              if (dist <= projectile.hitRange && projectile.tryHitAndMarkEnemy(enemy.id)) {
                // If the projectile chains, we will decrement chain before hitCount
                if (projectile.chain && projectile.chain > 0) {
                  projectile.chain -= 1
                  // We will find the nearest enemy to steer this projectile to
                  tmp = this.findNearestEnemyVector(qtree, projectile, enemy.id)
                  if (tmp) {
                    projectile.vec = tmp
                    projectile.dmg *= 0.9
                    projectile.ttl += 50
                  }
                } else {
                  projectile.hitCount -= 1
                }
                enemy.hp -= projectile.dmg
                this.trophyList.addProgress('dmg', projectile.dmg)
                // Does the projectile come with effects e.g. debuffs?
                if (projectile.effects && projectile.effects.length > 0) {
                  let txt
                  for (let j = 0; j < projectile.effects.length; j++) {
                    switch (projectile.effects[j].type) {
                      case 'debuff':
                        enemy.effects.push(new FFPowerUpEffect(
                          false,
                          'debuff',
                          projectile.effects[j].value,
                          0,
                          projectile.effects[j].hitCount))
                        switch (projectile.effects[j].value) {
                          case DebuffTypes.Slow:
                            txt = 'Slowed'
                            break
                          case DebuffTypes.Stun:
                            txt = 'Stunned'
                            break
                        }
                        this.onHitEffects.push(new FFOnHitEffect(
                          enemy.pos.x,
                          enemy.pos.y,
                          'text',
                          txt,
                          60, 0))
                        break
                    }
                  }
                }
                // Did the enemy survive?
                if (enemy.hp <= 0) {
                  this.handleEnemyDeath(enemy, assets)
                  if (projectile.split > 0) {
                    this.splitProjectile(projectile)
                  }
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
                  this.onHitEffects.push(new FFOnHitEffect(
                    enemy.pos.x,
                    enemy.pos.y,
                    'explosion',
                    projectile.clone(),
                    5, 0))
                  for (let j = 0; j < 4; j++) {
                    this.onHitEffects.push(new FFOnHitEffect(
                      projectile.pos.x,
                      projectile.pos.y,
                      'fire',
                      '',
                      5,
                      8))
                  }
                }
                // Add floating damage number
                if (this.drawDamageNumbers) {
                  this.onHitEffects.push(new FFOnHitEffect(
                    enemy.pos.x,
                    enemy.pos.y,
                    'text',
                    `${projectile.dmg.toFixed(0)}`,
                    40, 0))
                }
                if (projectile.visualType === 'fire') {
                  // Add fire on the ground!
                  this.onHitEffects.push(new FFOnHitEffect(
                    projectile.pos.x,
                    projectile.pos.y,
                    'fire',
                    '',
                    5,
                    10))
                }
              }
            }
            if (projectile.hitCount <= 0) {
              // Before destroying this projectile, we may split it
              if (projectile.split > 0) {
                this.splitProjectile(projectile)
              }
              this.goalWeaponProjectiles.splice(i, 1)
              continue
            }
            this.ctx3.stroke()
          }
        }
        this.goalWeaponProjectiles[i] = projectile
        if (i === 0) {
          break
        }
      }
    },
    renderProjectileFire: function (projectile) {
      let xx = ((projectile.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2
      let yy = ((projectile.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2
      const twoPi = 2 * Math.PI
      this.ctx3.fillStyle = '#f00'
      this.ctx3.globalAlpha = 0.2
      this.ctx3.arc(
        xx,
        yy,
        20,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 0.3
      this.ctx3.fillStyle = '#ff9100'
      xx += (Math.random() - Math.random()) * 10
      yy += (Math.random() - Math.random()) * 10
      this.ctx3.arc(
        xx,
        yy,
        14,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 0.4
      this.ctx3.fillStyle = '#fff400'
      xx += (Math.random() - Math.random()) * 7
      yy += (Math.random() - Math.random()) * 7
      this.ctx3.arc(
        xx,
        yy,
        10,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 0.7
      this.ctx3.fillStyle = '#fffcb0'
      xx += (Math.random() - Math.random()) * 5
      yy += (Math.random() - Math.random()) * 5
      this.ctx3.arc(
        xx,
        yy,
        2,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 1
    },
    renderProjectileElectricity: function (projectile) {
      let xx = ((projectile.pos.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2
      let yy = ((projectile.pos.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2
      const twoPi = 2 * Math.PI
      this.ctx3.fillStyle = '#f7ff00'
      this.ctx3.globalAlpha = 0.2
      this.ctx3.arc(
        xx,
        yy,
        20,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 0.3
      this.ctx3.fillStyle = '#0051ff'
      xx += (Math.random() - Math.random()) * 10
      yy += (Math.random() - Math.random()) * 10
      this.ctx3.arc(
        xx,
        yy,
        14,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 0.4
      this.ctx3.fillStyle = '#00eaff'
      xx += (Math.random() - Math.random()) * 7
      yy += (Math.random() - Math.random()) * 7
      this.ctx3.arc(
        xx,
        yy,
        10,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 0.7
      this.ctx3.fillStyle = '#c9e8ff'
      xx += (Math.random() - Math.random()) * 5
      yy += (Math.random() - Math.random()) * 5
      this.ctx3.arc(
        xx,
        yy,
        2,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 1
    },
    handleOnHitEffects: function (qtree, images) {
      /**
       * @type FFOnHitEffect
       */
      let effect
      let tmpX, tmpY
      for (let i = this.onHitEffects.length - 1; i >= 0; i--) {
        effect = this.onHitEffects[i]
        if (effect.tick()) {
          if (effect.type === 'text') {
            tmpX = (effect.x + this.offsetVector.x) * this.gridSize
            tmpY = (effect.y + this.offsetVector.y) * this.gridSize
            this.ctx3.font = '1rem "Open Sans"'
            this.ctx3.strokeStyle = '#000'
            this.ctx3.lineWidth = 6
            this.ctx3.lineJoin = 'miter'
            this.ctx3.miterLimit = 2
            this.ctx3.strokeText(
              effect.content,
              tmpX,
              tmpY
            )
            this.ctx3.font = '1rem "Open Sans"'
            this.ctx3.fillStyle = '#ffc800'
            this.ctx3.fillText(
              effect.content,
              tmpX,
              tmpY
            )
          } else if (effect.type === 'explosion') {
            this.drawOnHitExplosion(effect, qtree, images)
          } else if (effect.type === 'death') {
            // Draws each death animation frame... basically a GIF engine!
            if (effect.content) {
              this.ctx3.drawImage(
                effect.content[effect.count],
                ((effect.x + this.offsetVector.x) * this.gridSize) + effect.offX,
                ((effect.y + this.offsetVector.y) * this.gridSize) + effect.offY,
                effect.dimW,
                effect.dimH)
            }
          } else if (effect.type === 'fire') {
            this.drawOnHitFire(effect)
          }
        } else {
          this.onHitEffects.splice(i, 1)
        }
      }
    },
    drawOnHitExplosion: function (effect, qtree, images) {
      const projectile = effect.content
      let dist = projectile.radius
      const radius = (dist * this.gridSize) / 4
      projectile.radius += 0.2
      // Draw weapon effect
      this.ctx3.globalAlpha = 0.5
      this.ctx3.fillStyle = '#ff1100'
      this.ctx3.arc(
        ((effect.x + this.offsetVector.x) * this.gridSize) + 20,
        ((effect.y + this.offsetVector.y) * this.gridSize) + 20,
        radius * 2.5,
        0,
        2 * Math.PI)
      this.ctx3.fill()
      this.ctx3.globalAlpha = 0.7
      this.ctx3.strokeStyle = '#ff8000'
      this.ctx3.arc(
        ((effect.x + this.offsetVector.x) * this.gridSize) + 20,
        ((effect.y + this.offsetVector.y) * this.gridSize) + 20,
        radius - 0.2,
        0,
        2 * Math.PI)
      this.ctx3.stroke()
      this.ctx3.globalAlpha = 0.6
      this.ctx3.fillStyle = '#fff400'
      this.ctx3.arc(
        ((effect.x + this.offsetVector.x) * this.gridSize) + 20,
        ((effect.y + this.offsetVector.y) * this.gridSize) + 20,
        radius,
        0,
        2 * Math.PI)
      this.ctx3.fill()
      this.ctx3.globalAlpha = 1
      // Find enemies nearby to damage
      let tmp, tmp2
      if (this.enemies.size > 0) {
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
              // Trigger hit
              enemy.hp -= projectile.dmg
              this.trophyList.addProgress('dmg', projectile.dmg)
              if (enemy.hp <= 0) {
                this.handleEnemyDeath(enemy, images)
              } else {
                this.enemies.set(enemy.id, enemy)
              }
              // Add floating damage number
              if (this.drawDamageNumbers) {
                tmp2 = new FFOnHitEffect(
                  enemy.pos.x,
                  enemy.pos.y,
                  'text',
                  `${projectile.dmg.toFixed(0)}`,
                  40,
                  0)
                this.onHitEffects.push(tmp2)
              }
            }
          }
        }
      }
    },
    drawOnHitFire: function (effect) {
      const x = ((effect.x + this.offsetVector.x) * this.gridSize) + this.gridSize / 2
      const y = ((effect.y + this.offsetVector.y) * this.gridSize) + this.gridSize / 2
      const twoPi = 2 * Math.PI
      this.ctx3.fillStyle = '#f00'
      this.ctx3.globalAlpha = 0.1
      this.ctx3.beginPath()
      effect.x += (Math.random() - Math.random()) * 0.1
      effect.y += (Math.random() - Math.random()) * 0.1
      this.ctx3.arc(
        x,
        y,
        10,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.fillStyle = '#fff400'
      this.ctx3.globalAlpha = 0.5
      this.ctx3.beginPath()
      effect.x += (Math.random() - Math.random()) * 0.1
      effect.y += (Math.random() - Math.random()) * 0.1
      this.ctx3.arc(
        x,
        y,
        2,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.fillStyle = '#fffbc5'
      this.ctx3.globalAlpha = 0.7
      this.ctx3.beginPath()
      effect.x += (Math.random() - Math.random()) * 0.1
      effect.y += (Math.random() - Math.random()) * 0.1
      this.ctx3.arc(
        x,
        y,
        1,
        0,
        twoPi)
      this.ctx3.fill()
      this.ctx3.beginPath()
      this.ctx3.globalAlpha = 1
    },
    /**
     *
     * @param {Boolean} [showOffers=false]
     */
    cancelSimulation: function (showOffers = false) {
      // Remove enemies
      this.enemies = new Map()
      // Cancel movement
      this.goalUp = false
      this.goalLeft = false
      this.goalDown = false
      this.goalRight = false
      this.srNotifyMove(true)
      // Pause simulation
      this.srNotifySimulation(false)
      this.goalAlive = false
      // Did we survive this round without getting damaged?
      if (!this.goalDamaged) {
        this.trophyList.addProgress('flawless_round', 1)
      }
      // Show the shop if desired
      if (showOffers) {
        this.showEndOfRoundShop()
      }
      this.collectTrophies(true)
      if (this.secondInterval) {
        clearInterval(this.secondInterval)
        this.secondsPassed = 0
      }
    },
    showEndOfRoundShop: function () {
      // If there are no Power-Ups ready, but we have a level up
      // ...we can conveniently add offers, too
      if (this.powerUpOffers.length < 1 && this.goalLevelUps > 0) {
        const pup = this.showLevelUpOffers(
          0,
          3,
          0)
        if (pup) {
          this.goalLevelUps -= 1
        }
      }
      // Add Weapon and Item offers
      let offers = null
      if (this.weaponOffers.length < 1 || this.itemOffers.length < 1) {
        offers = this.showLevelUpOffers(
          3,
          0,
          3)
      }
      if (offers) {
        this.shopTab = 'shop'
      } else if (this.powerUpOffers.length > 0) {
        this.shopTab = 'skills'
      } else {
        this.shopTab = 'gear'
      }
      // Show level up screen
      this.isLevelUp = true
    },
    /**
     *
     * @param {Boolean} [newOnly=true]
     */
    collectTrophies: function (newOnly) {
      if (!this.trophyList || !this.trophyList.categories || !this.trophyList.categories.starter) {
        return
      }
      let boost
      for (let i = 0; i < this.trophyList.categories.starter.length; i++) {
        if (newOnly) {
          boost = this.trophyList.categories.starter[i].collect()
        } else {
          boost = this.trophyList.categories.starter[i].getCollected()
        }
        if (boost.size < 1) {
          continue
        }
        let tmp
        for (const [key, value] of boost.entries()) {
          if (!this.goalStats.has(key)) {
            this.goalStats.set(key, value)
          } else {
            tmp = Number(this.goalStats.get(key))
            tmp += Number(value)
            this.goalStats.set(key, tmp)
          }
        }
      }
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
          // Why are we sending two messages you may ask.
          // Since we're using a partially reliable protocol, we're sending two messages just to make sure.
          // Since the keydown event will re-trigger anyway (at least as for 17.11.2024) we do not need more than that.
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
        case 'q':
          this.handleAbilityProc('q')
          break
      }
    },
    srNotifyMove: function (force) {
      const v = `${this.goalUp};${this.goalRight};${this.goalDown};${this.goalLeft}`
      if (this.lastPos === v && !force) {
        return
      }
      const k = `MOV-${this.store.user.username}`
      // Send message to others
      this.wrtc.broadcastDataChannelMessage(
        `${k};${v}`)
      this.lastPos = v
      this.dataMap.set(k, v)
    },
    srNotifyMoveStop: function () {
      const k = `MOV-${this.store.user.username}`
      const v = 'false;false;false;false'
      // Send message to others
      this.$connector.sendSyncRoomMessage(
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
      if (this.cWorker) {
        this.cWorker.postMessage({
          msg: '[c:setp]',
          x: this.goalPosition.x,
          y: this.goalPosition.y
        })
        this.cWorker.postMessage({
          msg: '[c:seto]',
          x: this.offsetVector.x,
          y: this.offsetVector.y
        })
        this.iWorker.postMessage({
          msg: '[c:setp]',
          x: this.goalPosition.x * 2,
          y: this.goalPosition.y * 2
        })
        this.iWorker.postMessage({
          msg: '[c:seto]',
          x: this.offsetVector.x * 2,
          y: this.offsetVector.y * 2
        })
      }
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
        `${k}-${v}`)
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
        case 'q':
          this.handleAbilityProc('q')
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
     * Levels up the player if he reached the XP threshold
     */
    checkXP: function () {
      if (this.goalXP >= this.goalMaxXP) {
        this.handleLevelUp()
      }
    },
    /**
     * Resets player XP whilst rising XP threshold
     */
    handleLevelUp: function () {
      this.goalXP = 0
      this.goalLevel += 1
      this.trophyList.addProgress('level', 1)
      // The player can use level-ups to get upgrades
      this.goalLevelUps += 1
      this.goalLevelUpsOpen += 1
      this.goalMaxXP += 1000
      if (this.goalAbilities && this.goalAbilities.length > 0) {
        for (const ability of this.goalAbilities) {
          ability.autoLevelUp()
        }
      }
      if (this.goalWeapons && this.goalWeapons.length > 0) {
        for (const weapon of this.goalWeapons) {
          weapon.levelUp()
        }
      }
      if (this.goalItems && this.goalItems.length > 0) {
        for (const item of this.goalItems) {
          item.autoLevelUp()
        }
        this.applyGoalItems(false)
      }
      // Distribute to the others!
      this.distributeGoalWeapons()
      this.distributeGoalItems()
      this.distributeGoalAbilities()
    },
    /**
     *
     */
    dismissLevelUp: function () {
      this.distributeGoalWeapons()
      this.distributeGoalItems()
      this.distributeGoalAbilities()
      this.modifyingWeapons = false
      if (this.goalLevelUps > 0 && this.powerUpOffers.length < 1) {
        const offers = this.showLevelUpOffers(
          0,
          3,
          0)
        if (offers) {
          this.goalLevelUps -= 1
          this.shopTab = 'skills'
          this.isLevelUp = true
          return
        }
      }
      if (this.goalLevelUpsOpen > 0 && this.powerUpOffers.length > 0) {
        this.shopTab = 'skills'
        this.isLevelUp = true
        return
      }
      if (this.weaponOffers.length > 0 || this.itemOffers.length > 0) {
        this.shopTab = 'shop'
        this.isLevelUp = true
        return
      }
      this.isLevelUp = false
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
    useLevelUp: function () {
      // Looks weird but works
      this.isLevelUp = false
      this.isLevelUp = true
      if (this.goalLevelUps < 1) {
        // Show level up screen
        this.shopTab = 'skills'
        if (this.goalLevelUpsOpen < 1) {
          // this.weaponOffers = []
          // this.itemOffers = []
          this.powerUpOffers = []
          this.shopTab = 'gear'
        } else {
          if (this.powerUpOffers.length < 1) {
            this.showLevelUpOffers(
              0,
              3,
              0)
          }
        }
        return
      }
      if (this.powerUpOffers.length < 1) {
        const offers = this.showLevelUpOffers(
          0,
          3,
          0)
        if (offers) {
          this.goalLevelUps -= 1
        }
      }
      // Show level up screen
      this.shopTab = 'skills'
    },
    /**
     * Shows the level up screen
     * @param {Number} [amountWeapons=3]
     * @param {Number} [amountPowerUps=3]
     * @param {Number} [amountItems=3]
     */
    showLevelUpOffers: function (amountWeapons = 3, amountPowerUps = 3, amountItems = 3) {
      let offers
      let hasOffer = false
      let hasEnough = false
      let tmp
      // Get unowned weapons as offers
      if (amountWeapons > 0) {
        this.weaponOffers = []
        if (this.weaponList.categories.starter.length > 0) {
          hasOffer = true
          hasEnough = false
          offers = []
          tmp = 0
          while (!hasEnough) {
            for (const entry of this.weaponList.categories.starter) {
              if (entry.canOffer()) {
                offers.push(entry)
                tmp += 1
                if (tmp >= amountWeapons) {
                  hasEnough = true
                }
              }
            }
            if (tmp < amountWeapons && this.weaponList.categories.starter.length < amountWeapons) {
              hasEnough = true
            }
          }
          this.weaponOffers = this.selectRandomFromArray(amountWeapons, offers)
        }
      }
      // Get unowned power-ups as offers
      if (amountPowerUps > 0) {
        this.powerUpOffers = []
        if (this.goalWeapons.length > 0 &&
          this.powerUpList.categories.starter.length > 0
        ) {
          hasOffer = true
          hasEnough = false
          offers = []
          tmp = 0
          while (!hasEnough) {
            for (const entry of this.powerUpList.categories.starter) {
              if (entry.canOffer()) {
                offers.push(entry)
                tmp += 1
                if (tmp >= amountPowerUps) {
                  hasEnough = true
                }
              }
            }
            if (tmp < amountPowerUps && this.powerUpList.categories.starter.length < amountPowerUps) {
              hasEnough = true
            }
          }
          this.powerUpOffers = this.selectRandomFromArray(amountPowerUps, offers)
          hasOffer = this.powerUpOffers.length > 0
        }
      }
      // Get unowned items as offers
      if (amountItems > 0) {
        this.itemOffers = []
        if (this.itemList.categories.starter.length > 0) {
          hasOffer = true
          hasEnough = false
          offers = []
          tmp = 0
          while (!hasEnough) {
            for (const entry of this.itemList.categories.starter) {
              if (entry.canOffer()) {
                offers.push(entry)
                tmp += 1
                if (tmp >= amountItems) {
                  hasEnough = true
                }
              }
            }
            if (tmp < amountItems && this.itemList.categories.starter.length < amountItems) {
              hasEnough = true
            }
          }
          this.itemOffers = this.selectRandomFromArray(amountItems, offers)
          hasOffer = this.itemOffers.length > 0
        }
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
      const randomResults = []
      // If there are less than or n power ups,
      // ...we cannot select n random ones -> use all
      if (offers.length <= n) {
        /**
         * @type {Object[]}
         */
        const cache = []
        for (let i = 0; i < offers.length; i++) {
          // Did we select this already?
          if (cache.length > 0 && cache.includes(offers[i])) {
            i -= 1
            continue
          }
          randomResults.push(offers[i])
          cache.push(i)
        }
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
        // Did we select this already?
        if (cache.length > 0 && cache.includes(ix)) {
          i -= 1
          continue
        }
        randomResults.push(offers[ix])
        cache.push(ix)
      }
      return randomResults
    },
    handleShopWeaponOffer: function (offer) {
      this.weaponOffers = []
      this.itemOffers = []
      this.goalMoney -= Number(offer.cost)
      this.handleWeaponOffer(offer)
    },
    handleShopItemOffer: function (offer) {
      this.weaponOffers = []
      this.itemOffers = []
      this.goalMoney -= Number(offer.cost)
      this.handleItemOffer(offer)
    },
    handleShopPowerUpOffer: function (offer) {
      this.powerUpOffers = []
      this.goalLevelUpsOpen -= 1
      this.handlePowerUpOffer(offer)
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
      this.trophyList.addProgress('weapons', 1)
      this.dismissLevelUp()
    },
    /**
     * @param {FFPowerUp} offer
     */
    handlePowerUpOffer: function (offer) {
      // Is the received FFPowerUp an ability? If so, we will not modify a weapon
      if (offer.isAbility) {
        offer.checkHelper()
        this.goalAbilities.push(offer)
        const ix = this.powerUpList.categories.starter.indexOf(offer)
        if (ix >= 0) {
          this.powerUpList.categories.starter.splice(ix, 1)
        }
        this.powerUpOffers = []
        this.dismissLevelUp()
        return
      }
      this.chosenPowerup = offer
      this.modifyingWeapons = true
    },
    /**
     * @param {FFItem} offer
     */
    handleItemOffer: function (offer) {
      this.goalStats = offer.proc(this.goalStats)
      this.goalItems.push(offer)
      const ix = this.itemList.categories.starter.indexOf(offer)
      if (ix >= 0) {
        this.itemList.categories.starter.splice(ix, 1)
      }
      this.trophyList.addProgress('items', 1)
      this.dismissLevelUp()
    },
    /**
     *
     * @param weapon
     * @param {Boolean} isAbility
     * @param {String} [abilityName='']
     */
    handleWeaponModification: function (weapon, isAbility, abilityName = '') {
      /**
       * @type {FFPowerUp}
       */
      const powerUp = this.chosenPowerup
      if (!isAbility) {
        for (let i = 0; i < this.goalWeapons.length; i++) {
          if (this.goalWeapons[i].name === weapon.name) {
            this.goalWeapons[i].powerUps.push(powerUp)
            break
          }
        }
      } else {
        for (let i = 0; i < this.goalAbilities.length; i++) {
          if (this.goalAbilities[i].name === abilityName) {
            this.goalAbilities[i].wpn.powerUps.push(powerUp)
            break
          }
        }
      }
      const ix = this.powerUpList.categories.starter.indexOf(powerUp)
      if (ix >= 0) {
        this.powerUpList.categories.starter.splice(ix, 1)
      }
      this.powerUpOffers = []
      this.trophyList.addProgress('powerups', 1)
      this.dismissLevelUp()
    },
    refreshOffers: function (cost) {
      this.goalMoney -= Number(cost)
      this.weaponOffers = []
      this.itemOffers = []
      this.showEndOfRoundShop()
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
          this.addTile(tiles[i].pos, false)
        }
      }
      /**
       * @type []
       */
      const costField = saveState.costField
      if (costField) {
        this.costField = []
        let i = 0
        let tmpPos
        let tmpArrayPos
        let positions
        for (const value of Object.values(costField)) {
          this.costField.push(value)
          // Notify FFCalcWorker
          if (this.cWorker) {
            this.cWorker.postMessage({
              msg: '[c:cost]',
              pos: i,
              val: value
            })
            tmpPos = this.convertArrayPosToXY(i)
            positions = this.convertXYPosToDPositions(
              tmpPos[0], tmpPos[1])
            for (let i = 0; i < positions.length; i++) {
              tmpArrayPos = this.convertXYToArrayDPos(
                positions[i][0], positions[i][1])
              this.iWorker.postMessage({
                msg: '[c:cost]',
                pos: tmpArrayPos,
                val: value
              })
            }
          }
          i += 1
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
      // Apply HP+
      if (this.goalStats && this.goalStats.has('hp+')) {
        this.goalHP += Number(this.goalStats.get('hp+'))
        if (this.goalHP > this.goalMaxHP) {
          this.goalHP = this.goalMaxHP
        }
      }
      // Populate map
      if (this.isHost || !this.coPlayers || this.coPlayers.size < 1) {
        this.checkAndSpawnEnemies('slime', this.getEnemyAmount())
      }
      this.srNotifyPosition(true)
    },
    /**
     * Actions happening or being checked every five seconds
     * ...are placed here.
     */
    procPerFiveSecondTriggers: function () {
      // Populate map
      if (this.isHost || !this.coPlayers || this.coPlayers.size < 1) {
        this.checkAndSpawnEnemies('skeleton', this.getEnemySkeletonAmount())
      }
      this.healthCheck()
    },
    /**
     * Actions happening or being checked every half second
     * ...are placed here.
     */
    procPerHalfSecondTriggers: function () {
      // Send real position to avoid de-sync
      this.srNotifyMove(true)
    },
    /**
     *
     * @return {Number}
     */
    getEnemyAmount: function () {
      switch (this.currentRound) {
        case 5:
          // Spam Round #1
          return 10
        case 10:
          // Spam Round #2
          return 20
        default:
          return 1 + this.currentRound
      }
    },
    getEnemySkeletonAmount: function () {
      if (this.currentRound < 3) {
        return 0
      }
      switch (this.currentRound) {
        case 4:
          // Cooldown Round #1
          return 1
        case 5:
          // Spam Round #1
          return 10
        case 10:
          // Spam Round #2
          return 20
        default:
          return 1 + this.currentRound + Math.floor(this.currentRound / 3)
      }
    },
    /**
     * Spawns enemies around the map
     * @param {String} [type='slime']
     * @param {Number} [amount=1]
     */
    checkAndSpawnEnemies: function (type = 'slime', amount = 2) {
      if (!this.spawnEnemies) {
        return
      }
      if (amount < 1) {
        return
      }
      // Circle-Spawner rotating around the screen
      const w = (this.width / 2) - 50
      const h = (this.height / 2) - 50
      const offX = this.offsetVector.x * this.gridSize
      const offY = this.offsetVector.y * this.gridSize
      let skip
      for (let i = 0; i < amount; i++) {
        const x = (w * Math.cos(this.theta)) + w - offX
        const y = (h * Math.sin(this.theta)) + h - offY
        this.theta += 0.2
        const pos = new THREE.Vector2(
          Math.round(x / this.gridSize),
          Math.round(y / this.gridSize))
        // Do not spawn enemies close to players
        skip = this.checkPlayersNearby(pos, 50)
        if (skip) {
          amount -= 1
          continue
        }
        // Spawn regular enemies
        this.addEnemy(pos, type, false)
      }
    },
    /**
     *
     * @param {THREE.Vector2} pos
     * @param {Number} threshold
     */
    checkPlayersNearby: function (pos, threshold) {
      if (pos == null) {
        return false
      }
      // Check local player first
      const vec = new THREE.Vector2()
      vec.copy(this.goalPosition)
      vec.sub(this.offsetVector)
      let dist = vec.distanceToSquared(pos)
      if (dist < threshold) {
        return true
      }
      // Now check remote players
      if (this.coPlayers && this.coPlayers.size > 0) {
        this.coPlayers.forEach((val) => {
          if (val.pos != null) {
            vec.copy(val.pos)
            dist = vec.distanceToSquared(pos)
            if (dist < threshold) {
              return true
            }
          }
        })
      }
      return false
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
              // // We did not encounter this co-player yet
              // // Create peer to peer connection to this player
              // // To figure out who's impolite and who's not...
              // // ...the peers need to battle it out!
              // const rnd = Math.random()
              // this.$connector.sendSyncRoomMessage(
              //   `PEFI-${sesh.u};${this.store.user.username};${rnd}`)

              // Set new player
              this.coPlayers.set(sesh.u, {
                usr: sesh.u,
                x: -1,
                y: -1,
                xo: -1,
                yo: -1,
                pefi: -1
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
        } else if (event.data.t.startsWith('DOSIM-')) {
          const data = event.data.t.substring(6)
          if (data[0].toUpperCase() === 'TRUE') {
            // if (this.isSimulating) return
            // this.handleSimulation(true)
          } else {
            if (!this.isSimulating) return
            this.cancelSimulation()
          }
        } else if (event.data.t.startsWith('SCSIM-')) {
          // Some player wants to schedule simulation start/cancel
          const data = event.data.t.substring(6).split(';')
          const doStart = data[0] === 'true'
          const showOffers = data[2] === 'true'
          this.scheduleSimulation(doStart, false, showOffers, Number(data[1]))
        } else if (event.data.t.startsWith('WP-')) {
          // Some player sent a weapon part
          // Format:
          //    PlayerName;WeaponName;PowerUpName;Type;JsonPayload
          const data = event.data.t.substring(3).split(';')
          this.setCoPlayerWeaponPart(data)
        } else if (event.data.t.startsWith('IP-')) {
          // Some player sent an item part
          // Format:
          //    PlayerName;ItemName;Type;JsonPayload
          const data = event.data.t.substring(3).split(';')
          this.setCoPlayerItemPart(data)
        } else if (event.data.t.startsWith('AP-')) {
          // Some player sent an ability part
          // Format:
          //    PlayerName;Ability;Type;JsonPayload
          const data = event.data.t.substring(3).split(';')
          this.setCoPlayerAbilityPart(data)
        } else if (event.data.t.startsWith('scost')) {
          // A wall (tile with collision-detection) was placed
          this.handleSetCost(event.data.t)
        } else if (event.data.t.startsWith('stile')) {
          // A collision-less tile was placed
          this.handleSetTile(event.data.t)
        } else if (event.data.t.startsWith('E0-')) {
          // A new enemy!
          // Format:
          //    Field1;Field2;Field3;...
          const data = event.data.t.substring(3).split(';')
          this.setCoPlayerEnemy(data, false)
        } else if (event.data.t.startsWith('E1-')) {
          // We're about to receive enemies in synchronization mode
          // Since we do not want to mix different requests
          // ...we will remember the sync-round number
          // Format:
          //    E1-SyncRound
          if (!this.isSyncing) {
            // Initialize sync values if we weren't already syncing
            this.enemies = new Map()
            this.isSyncing = true
            this.syncCount = 0
          }
          this.syncRound = Number(event.data.t.substring(3))
        } else if (event.data.t.startsWith('E2-')) {
          // An enemy! We are synchronizing all enemies
          // ...possibly due to the start of a new round
          // Format:
          //    SyncRound;Field1;Field2;Field3;...
          const data = event.data.t.substring(3).split(';')
          const sr = Number(data[0])
          if (sr > this.syncRound) {
            // We haven't encountered this sync round, yet
            // Proactively we will accept it and prepare
            this.enemies = new Map()
            this.isSyncing = true
            this.syncRound = sr
            this.syncCount = 1
            this.syncMaxCount = 999999
            this.setCoPlayerEnemy(data, true)
          } else if (sr === this.syncRound) {
            this.syncCount += 1
            if (this.isSyncing && this.syncCount === this.syncMaxCount) {
              // We're done collecting!
              this.isSyncing = false
              // We will report back to the host
              this.$connector.sendSyncRoomMessage(
                `SYOK-${this.store.user.username}`
              )
            }
            this.setCoPlayerEnemy(data, true)
          }
        } else if (event.data.t.startsWith('E3-')) {
          // We're done collecting enemies as soon as we reached
          // ...the count that was just being sent to us
          // Format:
          //    E3-Count
          const data = event.data.t.substring(3)
          this.syncMaxCount = Number(data)
          if (this.isSyncing && this.syncCount >= this.syncMaxCount) {
            // We're done collecting!
            this.isSyncing = false
            // We will report back to the host
            this.$connector.sendSyncRoomMessage(
              `SYOK-${this.store.user.username}`
            )
          }
        } else if (event.data.t.startsWith('qSYEN')) {
          if (!this.isHost || this.isSyncing) return
          // We (the host) were asked to synchronize enemies
          // ...possibly due to the start of a new round
          this.synchronizeEnemies()
        } else if (event.data.t.startsWith('SYOK-')) {
          if (!this.isHost || !this.isSyncing) return
          // Some co-player has reported back he's done collecting
          const data = event.data.t.substring(5)
          // We will check if we have reached the expected amount of reports
          if (this.syncCache.has(data)) {
            return
          }
          this.syncCache.set(data, true)
          this.syncCount += 1
          if (this.syncCount >= this.syncMaxCount) {
            // All players reported back!
            this.isSyncing = false
            this.scheduleSimulation(true, false, false)
          }
        }
      }
      // Connect to the SyncRoom
      console.log('Connecting to wikiric sync room:', this.roomId)
      await this.$connector.doJoinSyncRoom(this.roomId)
      await this.getRooms()
      console.log('> Connected')
      // Calculate latency in ms (performance check)
      console.log('Periodically checking latency...')
      this.$connector.calculateSyncRoomLatency()
      setInterval(() => {
        this.$connector.calculateSyncRoomLatency()
      }, 1_000)
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
      }, delay * 2 + 1)
    },
    setCoPlayerPosition: function (data) {
      const player = JSON.parse(data[1])
      let pl
      if (this.coPlayers.has(data[0])) {
        pl = this.coPlayers.get(data[0])
        pl.x = player.x - player.xo
        pl.y = player.y - player.yo
        this.coPlayers.set(data[0], pl)
        if (this.cWorker) {
          this.cWorker.postMessage({
            msg: '[c:copo]',
            usr: data[0],
            x: pl.x,
            y: pl.y
          })
          this.iWorker.postMessage({
            msg: '[c:copo]',
            usr: data[0],
            x: pl.x * 2,
            y: pl.y * 2
          })
        }
        return
      }
      pl = {
        usr: data[0],
        x: player.x - player.xo,
        y: player.y - player.yo
      }
      this.coPlayers.set(data[0], pl)
      if (this.cWorker) {
        this.cWorker.postMessage({
          msg: '[c:copo]',
          usr: data[0],
          x: pl.x,
          y: pl.y
        })
        this.iWorker.postMessage({
          msg: '[c:copo]',
          usr: data[0],
          x: pl.x * 2,
          y: pl.y * 2
        })
      }
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
      let level
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
        level = obj.level
        obj = new FFWeapon(
          obj.name,
          obj.desc,
          Number(obj.range),
          Number(obj.dps),
          Number(obj.dpsLevelUp),
          Number(obj.ratio),
          Number(obj.amount),
          Number(obj.cd),
          Number(obj.cdLevelUp),
          Number(obj.pSpeed),
          Number(obj.pHitCount),
          Number(obj.pHitCountLevelUp),
          Number(obj.hitRange),
          Number(obj.hitRangeLevelUp),
          obj.visualType,
          Number(obj.ttl),
          Number(obj.cost),
          Number(obj.chance))
        obj.level = level
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
          Number(obj.id),
          Number(obj.level),
          obj.name,
          obj.desc,
          Number(obj.chance)
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
          Boolean(obj.onHit),
          obj.type,
          Number(obj.value),
          Number(obj.valueLevelBonus),
          Number(obj.hitCount),
          Boolean(obj.floorValueOnProc),
          Boolean(obj.autoLevelUp)
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
      this.coPlayers.set(data[0], pl)
    },
    setCoPlayerItemPart: function (data) {
      let level
      let pl = {
        items: []
      }
      if (this.coPlayers.has(data[0])) {
        pl = this.coPlayers.get(data[0])
        if (!pl.items) {
          pl.items = []
        }
      }
      // Data Format:
      //    0          1        2    3
      //    PlayerName;ItemName;Type;JsonPayload
      // Find item
      let ix = -1
      if (pl.items.length > 0) {
        for (let i = 0; i < pl.items.length; i++) {
          if (pl.items[i].name === data[1]) {
            ix = i
            break
          }
        }
      }
      let obj = JSON.parse(data[3])
      if (data[2] === '1') {
        // Item
        level = obj.level
        obj = new FFItem(
          Number(obj.id),
          Number(obj.level),
          obj.name,
          obj.desc,
          obj.cost,
          obj.chance
        )
        obj.level = level
        if (ix !== -1) {
          // Update weapon (but not power-ups)
          const effTmp = pl.items[ix].effects
          pl.items[ix] = obj
          pl.items[ix].effects = effTmp
        } else {
          pl.items.push(obj)
        }
      } else if (data[2] === '2') {
        // Effect
        obj = new FFItemEffect(
          obj.type,
          Number(obj.value),
          Number(obj.valueLevelBonus),
          Number(obj.hitCount),
          Boolean(obj.floorValueOnProc),
          Boolean(obj.autoLevelUp)
        )
        if (ix !== -1) {
          let eix = -1
          for (let i = 0; i < pl.items[ix].effects.length; i++) {
            if (pl.items[ix].effects[i].type === obj.type) {
              eix = i
              break
            }
          }
          if (eix !== -1) {
            pl.items[ix].effects[eix] = obj
          } else {
            pl.items[ix].effects.push(obj)
          }
        } else {
          if (!pl._queue) {
            pl._queue = []
          }
          pl._queue.push({
            typ: 2,
            itm: data[1],
            eff: obj
          })
        }
      }
      // Update co-player data
      this.coPlayers.set(data[0], pl)
    },
    setCoPlayerAbilityPart: function (data) {
      let pl = {
        abilities: []
      }
      if (this.coPlayers.has(data[0])) {
        pl = this.coPlayers.get(data[0])
        if (!pl.abilities) {
          pl.abilities = []
        }
      }
      // Data Format:
      //    0          1           2    3
      //    PlayerName;AbilityName;Type;JsonPayload
      // Find item
      let ix = -1
      if (pl.abilities.length > 0) {
        for (let i = 0; i < pl.abilities.length; i++) {
          if (pl.abilities[i].name === data[1]) {
            ix = i
            break
          }
        }
      }
      let obj = JSON.parse(data[3])
      if (data[2] === '1') {
        // Power-Up
        obj = new FFPowerUp(
          Number(obj.id),
          Number(obj.level),
          obj.name,
          obj.desc,
          Number(obj.chance),
          Boolean(obj.isAbility),
          Number(obj.cd),
          Number(obj.cdLevelUp)
        )
        if (ix !== -1) {
          // Update power-up (but not effects)
          const effects = pl.abilities[ix].effects
          pl.abilities[ix] = obj
          pl.abilities[ix].effects = effects
        } else {
          pl.abilities.push(obj)
        }
      } else if (data[2] === '2') {
        // Effect
        obj = new FFPowerUpEffect(
          Boolean(obj.onHit),
          obj.type,
          Number(obj.value),
          Number(obj.valueLevelBonus),
          Number(obj.hitCount),
          Boolean(obj.floorValueOnProc),
          Boolean(obj.autoLevelUp)
        )
        if (ix !== -1) {
          let eix = -1
          for (let i = 0; i < pl.abilities[ix].effects.length; i++) {
            if (pl.abilities[ix].effects[i].type === obj.type) {
              eix = i
              break
            }
          }
          if (eix !== -1) {
            pl.abilities[ix].effects[eix] = obj
          } else {
            pl.abilities[ix].effects.push(obj)
          }
        } else {
          if (!pl._queue) {
            pl._queue = []
          }
          pl._queue.push({
            typ: 2,
            pup: data[1],
            eff: obj
          })
        }
      }
      // Update co-player data
      this.coPlayers.set(data[0], pl)
    },
    /**
     *
     * @param {Array<String>} data
     * @param {Boolean} syncMode
     */
    setCoPlayerEnemy: function (data, syncMode) {
      if (syncMode) {
        // Splice away the SyncRound at the beginning
        data.splice(0, 1)
      }
      // This is some exceptionally beautiful code.
      // Never ever have I seen less hardcoded numbers!
      // Wow! Readability is maxed out here!
      const unit = new FFUnit(
        Number(data[0]),
        Number(data[1]),
        Number(data[2]),
        data[3],
        Number(data[4]),
        Number(data[5]),
        Number(data[6]),
        data[7],
        Number(data[8]),
        Number(data[9]),
        Number(data[10]),
        Number(data[11]),
        Number(data[12]),
        Number(data[13]))
      this.enemies.set(unit.id, unit)
      let image
      if (unit.visualType === 'slime') {
        image = document.getElementById('slime_jump_0')
      } else if (unit.visualType === 'skeleton') {
        image = document.getElementById('skeleton_0')
      }
      // Draw enemy
      if (image) {
        /**
         * @type {HTMLImageElement}
         */
        let image
        let dim, off
        let xNew, yNew
        if (unit.visualType === 'slime') {
          image = document.getElementById('slime_jump_0')
          dim = 32
          off = 8
          xNew = unit.pos.x * this.gridSize + off
          yNew = unit.pos.y * this.gridSize + off
        } else if (unit.visualType === 'skeleton') {
          image = document.getElementById('skeleton_0')
          dim = 100
          off = -20
          xNew = unit.pos.x * this.gridSize + off
          yNew = unit.pos.y * this.gridSize + off
        }
        this.ctx3.drawImage(image, xNew, yNew, dim, dim)
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
      const goalWeapons = [].concat(this.goalWeapons)
      for (let i = 0; i < goalWeapons.length; i++) {
        // Since we want to keep all messages as small as possible
        // ...we will deconstruct all weapons into their parts
        //    1. Weapon
        //    2. Power-Ups
        //    3. Effects
        weapon = { ...goalWeapons[i] }
        powers = weapon.powerUps
        weapon.powerUps = []
        this.srSendWeaponPart(
          weapon.name, '-', '1', JSON.stringify(weapon))
        if (powers.length > 0) {
          for (let j = 0; j < powers.length; j++) {
            power = { ...powers[j] }
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
    distributeGoalItems: function () {
      if (!this.goalItems || this.goalItems.length < 1) {
        return
      }
      let item, effects, effect
      const goalItems = [].concat(this.goalItems)
      for (let j = 0; j < goalItems.length; j++) {
        item = { ...goalItems[j] }
        effects = item.effects
        item.effects = []
        this.srSendItemPart(
          item.name, '1', JSON.stringify(item))
        if (effects.length > 0) {
          for (let k = 0; k < effects.length; k++) {
            effect = effects[k]
            this.srSendItemPart(
              item.name, '2', JSON.stringify(effect))
          }
        }
      }
    },
    distributeGoalAbilities: function () {
      if (!this.goalAbilities || this.goalAbilities.length < 1) {
        return
      }
      let item, effects, effect
      const goalAbilities = [].concat(this.goalAbilities)
      for (let j = 0; j < goalAbilities.length; j++) {
        item = { ...goalAbilities[j] }
        effects = item.effects
        item.effects = []
        this.srSendAbilityPart(
          item.name, '1', JSON.stringify(item))
        if (effects.length > 0) {
          for (let k = 0; k < effects.length; k++) {
            effect = effects[k]
            this.srSendAbilityPart(
              item.name, '2', JSON.stringify(effect))
          }
        }
      }
    },
    srSendWeaponPart: function (id, pId, type, payload) {
      this.$connector.sendSyncRoomMessage(
        `WP-${this.store.user.username};${id};${pId};${type};${payload}`)
    },
    srSendItemPart: function (pId, type, payload) {
      this.$connector.sendSyncRoomMessage(
        `IP-${this.store.user.username};${pId};${type};${payload}`)
    },
    srSendAbilityPart: function (pId, type, payload) {
      this.$connector.sendSyncRoomMessage(
        `AP-${this.store.user.username};${pId};${type};${payload}`)
    },
    initWRTC: function () {
      this.wrtc.initialize(this.$connector, this.store.user.username, true, true)
      // Create BroadcastChannel to listen to wRTC events!
      const eventChannel = new BroadcastChannel('wrtcevents')
      eventChannel.onmessage = event => {
        this.handleWRTCEvent(event)
      }
      // Connect to the backend via WebRTC
      setTimeout(() => {
        this.wrtc.initiatePeerConnection(null, '_server', true, false)
      }, 1_000)
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
        } else if (event.data.message.startsWith('ABL-')) {
          // Format:
          //    Username;X1;Y1;X2;Y2
          const data = event.data.message.substring(4).split(';')
          this.handleCoPlayerAbilityProc(data)
        } else if (event.data.message.startsWith('TCP-')) {
          // TCP like UDP request received. We need to confirm this one.
          // Format:
          //    UUID;Username?payload
          const txt = event.data.message.substring(4).split('?', 2)
          const data = txt[0].split(';', 2)
          this.confirmTCP(data[0], data[1])
          this.processTCP(data[1], txt[1])
        } else if (event.data.message.startsWith('CMF-')) {
          // TCP like UDP confirmation received
          // Format:
          //    UUID;Username;RemoteUsername
          const txt = event.data.message.substring(4)
          const data = txt.split(';', 3)
          this.handleConfirmTCP(data[0], data[2])
        }
        // else {
        //   console.debug('DataChannel Message:', event.data.message)
        // }
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
      if (userId === 'server') {
        this.wrtc.initiatePeerConnection(null, '_server', true, false)
        return
      }
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
    },
    setUpCalcWorker: function () {
      this.cWorker = new Worker(
        new URL('FFCalcWorker.js', import.meta.url),
        { type: 'module' })
      this.cWorker.onmessage = e => {
        this.integrationField = new Uint16Array(e.data)
      }
      this.cWorker.postMessage({
        msg: '[c:init]',
        w: this.width,
        h: this.height,
        g: this.gridSize
      })
    },
    setUpIlluminationWorker: function () {
      this.iWorker = new Worker(
        new URL('FFCalcWorker.js', import.meta.url),
        { type: 'module' })
      this.iWorker.onmessage = e => {
        this.illuminationField = new Uint16Array(e.data)
      }
      // We will be working in double precision!
      // Later, we might convert both the "real" and double precisions
      // ...to fit each other
      //
      // E.g.: Real Positions
      //
      //    |x| | | | |         | | | | | |
      //    | | | | | |         | | |x| | |
      //    | | | | | |         | | | | | |
      //
      // ...would result in the DOUBLE Positions
      //    |x| |x| | |         | | | | | |
      //    |x| |x| | |         | | |x| |x|
      //    | | | | | |         | | |x| |x|
      //
      // The players move on the regular grid since pathfinding
      // ...gets interpolated anyway. The illumination however
      // ...should be on double precision to avoid having the lights
      // ...look like big boxes.
      // Effects may also use the double precision grid to allow for
      // ...fine-tuning.
      //
      this.iWorker.postMessage({
        msg: '[c:init]',
        w: this.width,
        h: this.height,
        g: Math.floor(this.gridSize / 2)
      })
      // We set a calculation limit to avoid calculating too much
      this.iWorker.postMessage({
        msg: '[c:setlm]',
        l: 50
      })
    },
    handleSetCost: function (data) {
      // scost;${position.x};${position.y};${xNew};${yNew};${this.tile}
      const dat = data.split(';')
      const position = {
        x: Math.round(Number(dat[1])),
        y: Math.round(Number(dat[2]))
      }
      const arrayPos = this.convertXYToArrayPos(position.x, position.y)
      if (arrayPos > this.costField.length) {
        return
      }
      this.costField[arrayPos] = 255 // TODO: Dynamic
      // Notify FFCalcWorker
      if (this.cWorker) {
        this.cWorker.postMessage({
          msg: '[c:cost]',
          pos: arrayPos,
          val: 255
        })
        const positions = this.convertXYPosToDPositions(
          position.x, position.y)
        let tmpArrayPos
        for (let i = 0; i < positions.length; i++) {
          tmpArrayPos = this.convertXYToArrayDPos(
            positions[i][0], positions[i][1])
          this.iWorker.postMessage({
            msg: '[c:cost]',
            pos: tmpArrayPos,
            val: 255
          })
        }
      }
      const tile = new FFTile(
        position.x, position.y,
        Math.round(Number(dat[3])),
        Math.round(Number(dat[4])),
        dat[5])
      // Insert and render tile
      this.tileTree.insert(tile)
      this.renderTiles(this.offsetVector)
    },
    handleSetTile: function (data) {
      // stile;${position.x};${position.y};${xNew};${yNew};${this.tile}
      const dat = data.split(';')
      const position = {
        x: Math.round(Number(dat[1])),
        y: Math.round(Number(dat[2]))
      }
      const arrayPos = this.convertXYToArrayPos(position.x, position.y)
      if (arrayPos > this.costField.length) {
        return
      }
      const tile = new FFTile(
        position.x, position.y,
        Math.round(Number(dat[3])),
        Math.round(Number(dat[4])),
        dat[5])
      // Insert and render tile
      this.tileTree.insert(tile)
      this.renderTiles(this.offsetVector)
    },
    /**
     *
     * @param {FFUnit} enemy
     * @param {FFUnitAssets} assets
     */
    addDeathAnimation: function (enemy, assets) {
      const asset = assets.getAsset(enemy.visualType)
      if (!asset) return
      // Add death animation as an effect with expiration
      this.onHitEffects.push(new FFOnHitEffect(
        enemy.pos.x,
        enemy.pos.y,
        'death',
        asset.death,
        10,
        asset.death.length - 1,
        enemy.dimW,
        enemy.dimH,
        enemy.offX,
        enemy.offY))
    },
    drawHeatmapCtx: function () {
      if (!this.integrationField) {
        return
      }
      let pos
      let value
      let x, y
      for (let i = 0; i < this.integrationField.length; i++) {
        pos = this.convertArrayPosToXY(i)
        value = this.integrationField[i]
        x = (pos[0] + this.offsetVector.x) * this.gridSize
        y = (pos[1] + this.offsetVector.y) * this.gridSize
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
    },
    drawHeatmapCtxIllumination: function () {
      if (!this.illuminationField) {
        return
      }
      let pos
      let value
      let x, y
      const halfGrid = this.gridSize / 2
      for (let i = 0; i < this.illuminationField.length; i++) {
        pos = this.convertArrayDPosToXY(i)
        value = this.illuminationField[i]
        x = (pos[0] + this.offsetVector.x * 2) * halfGrid
        y = (pos[1] + this.offsetVector.y * 2) * halfGrid
        if (value < 32) {
          this.ctx.fillStyle = this.heatMapColorForValue((value / 32))
        } else {
          this.ctx.fillStyle = this.heatMapColorForValue(1)
        }
        this.ctx.beginPath()
        this.ctx.moveTo(x, y)
        this.ctx.rect(x, y, halfGrid, halfGrid)
        this.ctx.fill()
      }
    },
    renderIllumination: function () {
      if (this.goalAlive) {
        this.drawLightsCtx(
          this.goalPosition.x - this.offsetVector.x,
          this.goalPosition.y - this.offsetVector.y,
          40, false)
      }
      if (this.coPlayers && this.coPlayers.size > 0) {
        this.coPlayers.forEach((val) => {
          this.drawLightsCtx(val.x, val.y, 40, false)
        })
      }
      if (this.drawIlluminationHeatmap) {
        this.drawHeatmapCtxIllumination()
      }
    },
    /**
     * drawLightsCtx draws all lights around the provided position.
     * The pathfinding flow field is used to determine the illumination.
     * @param {Number} xPos
     * @param {Number} yPos
     * @param {Number} dist
     * @param {Boolean} drawBackground
     */
    drawLightsCtx: function (xPos, yPos, dist, drawBackground) {
      if (!this.illuminationField || dist === 0) {
        return
      }
      const grid = this.gridSize
      const halfGrid = grid / 2
      const offX = this.offsetVector.x
      const offY = this.offsetVector.y
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
      const indices = this.getNeighborPositions(
        xPosR, yPosR, dist, true)
      if (indices.length < 1) {
        return
      }
      let positions
      let value
      let x, y
      let nb
      let tmpArrayPos
      let tmp
      let hasVisible
      for (let i = 0; i < indices.length; i++) {
        positions = this.convertXYPosToDPositions(
          indices[i][0], indices[i][1])
        hasVisible = false

        // // *** DEBUG
        // const dbX = Math.floor((indices[i][0] + offX) * grid)
        // const dbY = Math.floor((indices[i][1] + offY) * grid)
        // this.ctx.beginPath()
        // this.ctx.strokeStyle = '#db3cff'
        // this.ctx.rect(dbX, dbY, grid, grid)
        // this.ctx.stroke()
        // this.ctx.fillStyle = '#ffff00'
        // this.ctx.fillText(`${indices[i][0]}:${indices[i][1]}`,
        //   dbX, dbY + 10)
        // // *** DEBUG

        for (let j = 0; j < positions.length; j++) {
          // Add sub-grid shift
          positions[j][0] += xShift
          positions[j][1] += yShift
          x = (positions[j][0] + (offX * 2)) * halfGrid
          y = (positions[j][1] + (offY * 2)) * halfGrid
          // Retrieve double precision positions
          tmpArrayPos = this.convertXYToArrayDPos(
            positions[j][0], positions[j][1])
          value = this.illuminationField[tmpArrayPos]

          // // *** DEBUG
          // this.ctx.beginPath()
          // this.ctx.strokeStyle = '#9923b3'
          // this.ctx.rect(x, y, halfGrid, halfGrid)
          // this.ctx.stroke()
          // this.ctx.fillStyle = '#0dbf00'
          // this.ctx.fillText(`${value}`,
          //   x, y + 20)
          // // *** DEBUG

          if (value >= 65535) {
            // We hit a wall!
            // Check if a neighbor is illuminated
            tmp = this.convertDPosToXYPos(positions[j][0], positions[j][1])
            nb = this.getNeighborIndices(
              tmp[0], tmp[1], 2, false)
            for (let j = 0; j < nb.length; j++) {
              value = this.integrationField[nb[j]]
              if (value < 6) {
                hasVisible = true
                break
              }
            }
            continue
          } else if (value < 16) {
            this.ctx.fillStyle = '#fffec3'
            tmp = 0.3 - (0.02 * value)
            this.ctx.globalAlpha = tmp
            hasVisible = true
          } else {
            if (!drawBackground) {
              continue
            }
            this.ctx.fillStyle = '#141412'
            this.ctx.globalAlpha = 0.3
          }
          this.ctx.beginPath()
          this.ctx.moveTo(x, y)
          this.ctx.rect(x, y, halfGrid, halfGrid)
          this.ctx.fill()
          this.ctx.globalAlpha = 1
        }
        if (hasVisible) {
          // Mark spot as seen!
          this.markCellSeen(this.convertXYToArrayPos(
            indices[i][0], indices[i][1]))
        }
      }
    },
    /**
     * drawLightCtx draws a single light for the provided position.
     * The pathfinding flow field is used to determine the illumination.
     * @param {Number} xPos
     * @param {Number} yPos
     */
    drawLightCtx: function (xPos, yPos) {
      if (!this.integrationField) {
        return
      }
      const i = this.convertXYToArrayPos(xPos, yPos)
      const value = this.integrationField[i]
      if (value >= 65535) {
        // We ignore walls since we will never be able to illuminate them
        // Explanation: Since we are using the pathfinding to generate the illumination
        // we cannot illuminate walls since walls are excluded from the pathfinding itself!
        return
      }
      if (value < 8) {
        this.ctx.fillStyle = '#fffc73'
        this.ctx.globalAlpha = 0.02
      } else {
        this.ctx.fillStyle = '#000'
        this.ctx.globalAlpha = 0.3
      }
      const pos = this.convertArrayPosToXY(i)
      const x = (pos[0] + this.offsetVector.x) * this.gridSize
      const y = (pos[1] + this.offsetVector.y) * this.gridSize
      this.ctx.beginPath()
      this.ctx.moveTo(x, y)
      this.ctx.rect(x, y, this.gridSize, this.gridSize)
      this.ctx.fill()
      this.ctx.globalAlpha = 1
    },
    /**
     *
     * @param {FFUnit} current
     * @param {FFUnitAssets} assets
     */
    renderEnemy: function (current, assets) {
      // What image are we going to use for this enemy?
      const asset = assets.getAsset(current.visualType)
      if (!asset) return
      current.animFrames -= 1
      if (current.animFrames <= 0) {
        // After 10 frames we move to the next frame
        current.animFrames = 10
        current.animState += 1
      }
      if (current.animState >= asset.walk.length) {
        current.animState = 0
      }
      this.ctx3.drawImage(
        asset.walk[current.animState],
        (current.pos.x + this.offsetVector.x) * this.gridSize + current.offX,
        (current.pos.y + this.offsetVector.y) * this.gridSize + current.offY,
        current.dimW,
        current.dimH)
    },
    /**
     * When new rounds start, there is danger of enemies being
     * ...out of sync. We synchronize all enemies by sending
     * ...every enemy to all co-players if we are the host.
     * If we are not the host, a request will be sent.
     */
    synchronizeEnemies: function () {
      // Only the host should really synchronize the enemies
      // If we're not the host, we simply ask him to do it
      if (!this.isHost) {
        this.$connector.sendSyncRoomMessage(
          'qSYEN'
        )
        return
      }
      // Tell the co-players we're about to send some enemies
      // ...in synchronization mode
      this.isSyncing = true
      // What kind of number magic is this? This code has been here for
      // ...ages so we better not touch it, right? Right???
      this.syncRound = Math.floor(this.syncRound + 1)
      this.syncCount = 0
      this.syncMaxCount = this.coPlayers.size
      if (this.syncMaxCount < 1) {
        // If there are no co-players we will return
        this.isSyncing = false
        return
      }
      this.syncCache = new Map()
      // 1st notify others of a new sync process
      this.$connector.sendSyncRoomMessage(
        `E1-${this.syncRound}`
      )
      // 2nd send all units to the other peers
      const prefix = `E2-${this.syncRound};`
      let count = 0
      for (const [id, unit] of this.enemies) {
        if (!id) continue
        this.srSendEnemy(unit, prefix)
        count += 1
      }
      // 3rd tell the co-players when they're done collecting
      // Since this message could theoretically arrive out of order
      // ...in case we switch the protocols, we also send the number
      // ...of units to be expected for others to be able to send a
      // ...desync message in case not all units arrived.
      this.$connector.sendSyncRoomMessage(
        `E3-${count}`
      )
    },
    /**
     *
     * @param {Boolean} start
     */
    applyGoalItems: function (start) {
      this.goalAlive = true
      this.goalMaxHP = this.goalMaxHPOriginal
      this.goalStats = new Map()
      // Apply trophy effects
      this.collectTrophies(false)
      // Apply item effects
      if (this.goalItems && this.goalItems.length > 0) {
        for (let i = 0; i < this.goalItems.length; i++) {
          this.goalItems[i].proc(this.goalStats)
        }
        if (this.goalStats.has('hp')) {
          this.goalMaxHP += Number(this.goalStats.get('hp'))
        }
      }
      if (!start) {
        return
      }
      this.goalHP = this.goalMaxHP
      this.goalSpeed = this.goalSpeedOriginal
      if (this.goalStats.has('speed')) {
        this.goalSpeed += Number(this.goalStats.get('speed'))
      }
    },
    /**
     *
     * @param {Boolean} start
     */
    applyCoPlayersItems: function (start) {
      if (!this.coPlayers || this.coPlayers.size < 1) {
        return
      }
      let player
      for (const [key, val] of this.coPlayers.entries()) {
        player = val
        player = this.applyCoPlayerItems(player, start)
        this.coPlayers.set(key, player)
      }
    },
    /**
     *
     * @param {Object} player
     * @param {Boolean} start
     * @return {Object}
     */
    applyCoPlayerItems: function (player, start) {
      player.stats = new Map()
      // Apply item effects
      if (player.items && player.items.length > 0) {
        for (let i = 0; i < player.items.length; i++) {
          player.items[i].proc(player.stats)
        }
      }
      if (!start) {
        return player
      }
      player.speed = this.goalSpeedOriginal
      if (player.stats.has('speed')) {
        player.speed += Number(player.stats.get('speed'))
      }
      return player
    },
    /**
     *
     * @param {FFUnit} other
     * @param {FFUnitAssets} assets
     */
    handleEnemyDeath: function (other, assets) {
      // Retrieve resources from enemy
      this.goalMoney += Number(other.money)
      this.goalXP += Number(other.xp)
      this.checkXP()
      // Replace enemy with death animation
      this.enemies.delete(other.id)
      this.goalKills += 1
      this.addDeathAnimation(other, assets)
      // Track trophy progress
      this.trophyList.addProgress('kill', 1)
    },
    /**
     * Checks all co-player data for missing data, possibly attempting to retrieve them
     * ...from either the peers directly or from previous SyncRoom data commits
     * Genius fail-safe system!
     */
    healthCheck: function () {
      // We do not need multiple running requests
      let noRequest = false
      if (this.failSafe > 0) {
        noRequest = true
      }
      // 1. Check if we have seen players so far
      if (!this.coPlayers || this.coPlayers.size < 1) {
        if (noRequest) return
        // Possibly missing players? Check if there is player data via SyncRoom
        // We will enter FailSafeMode=1 meaning MissingPlayerData
        this.failSafe = 1
        this.handleLatencyLag(this.currentSRLatency)
        return false
      }
      // 2. Check if we have positions for all players
      // Having no position means that player will not get rendered + unable to receive MOV commands
      this.coPlayers.forEach((player) => {
        if (!player.x || !player.y) {
          if (noRequest) return
          // Player is missing positional data
          // We will enter FailSafeMode=2 meaning MissingPlayerPosition
          this.failSafe = 2
          this.handleLatencyLag(this.currentSRLatency)
          return false
        }
      })
      this.failSafe = 0
      return true
    },
    /**
     * Activates the targeted ability if it exists
     * @param {String} key
     */
    handleAbilityProc: function (key) {
      if (key == null || key === '') {
        return false
      }
      if (!this.goalAbilities || this.goalAbilities.length < 1) {
        return false
      }
      // Calculate player position
      const goalPos = new THREE.Vector2()
      goalPos.copy(this.goalPosition)
      goalPos.sub(this.offsetVector)
      // Get current cursor position to calculate angle and distance
      const cursorPos = new THREE.Vector2(this.cursorX / this.gridSize, this.cursorY / this.gridSize)
      cursorPos.sub(this.offsetVector)
      const direction = new THREE.Vector2()
      direction.copy(cursorPos)
      direction.sub(goalPos)
      // Send data to other players, so they trigger the ability, too
      // Since we're using a partially reliable protocol for our p2p data transmission,
      // ...we are going to simulate TCP over UDP by "spamming" the message
      // ...until we receive a confirmation by each peer!
      // Obviously there will be a limit on how long the message is getting sent
      // ...to avoid unnecessary CPU and network load
      const msg = `${goalPos.x};${goalPos.y};${direction.x};${direction.y}`
      const vThis = this
      const func = function () {
        // Trigger abilities
        let projectiles
        for (let i = 0; i < vThis.goalAbilities.length; i++) {
          projectiles = vThis.goalAbilities[i].activateAbility(goalPos, direction)
          if (projectiles) {
            for (let j = 0; j < projectiles.length; j++) {
              vThis.goalWeaponProjectiles.push(projectiles[j])
            }
          }
        }
      }
      // Our ability will be triggered as soon as the others confirmed!
      this.queueTCP('ABL-', msg, func)
      return true
    },
    /**
     * @param {String} username
     * @param {String[]} data
     */
    handleCoPlayerAbilityProc: function (username, data) {
      if (data.length < 4) {
        return false
      }
      // Those ain't magic numbers! Those are numerical constants!!
      // Format: X1;Y1;X2;Y2
      const goalPos = new THREE.Vector2(Number(data[0]), Number(data[1]))
      const direction = new THREE.Vector2(Number(data[2]), Number(data[3]))
      // Trigger abilities
      this.coPlayers.forEach((val) => {
        if (val.usr === username) {
          let projectiles
          for (let i = 0; i < val.abilities.length; i++) {
            projectiles = val.abilities[i].activateAbility(goalPos, direction)
            if (projectiles) {
              for (let j = 0; j < projectiles.length; j++) {
                this.goalWeaponProjectiles.push(projectiles[j])
              }
            }
          }
          return true
        }
      })
      return true
    },
    /**
     * queueTCP queues a UDP request that needs to be confirmed by others.
     * A function can be provided that will be called when done.
     *
     * Every request will receive a UUID that will be returned by others.
     *
     * If there are no peers available, this function returns after executing
     * the provided function if there is one.
     *
     * @param {String} prefix
     * @param {String} msg
     * @param {Function || null} [func=null]
     */
    queueTCP: function (prefix, msg, func = null) {
      // Retrieve all peer names that will get removed upon confirmation
      // All peer names remaining will receive the queued request until
      // ...they have sent back the UUID generated for this request
      const peer = []
      this.coPlayers.forEach((val) => {
        peer.push(val.usr)
      })
      if (peer.length < 1) {
        if (func) {
          func()
        }
        return
      }
      const uuid = wikiricUtils.getUUID()
      if (func) {
        this.tcpQueue.push({
          i: uuid,
          m: `TCP-${uuid};${this.store.user.username}?${prefix}${msg}`,
          p: peer,
          f: func
        })
      } else {
        this.tcpQueue.push({
          i: uuid,
          m: `TCP-${uuid};${this.store.user.username}?${prefix}${msg}`,
          p: peer
        })
      }
    },
    /**
     * executeTCP iterates over the TCP queue and distributes all messages
     * ...to all peers left for each queued request
     * Upon confirmation by the peers, they will get removed from the queue
     */
    executeTCP: function () {
      if (this.tcpQueue.length < 1) {
        return
      }
      for (let i = this.tcpQueue.length - 1; i > 0; i--) {
        if (this.tcpQueue[i].p.length > 0) {
          this.wrtc.broadcastDataChannelMessage(this.tcpQueue[i].m)
        } else {
          this.tcpQueue.splice(i, 1)
        }
      }
    },
    /**
     * confirmTCP sends back the UUID provided in the
     * ...TCP-like UDP request received
     *
     * @param {String} uuid
     * @param {String} username
     */
    confirmTCP: function (uuid, username) {
      const txt = `CMF-${uuid};${username};${this.store.user.username}`
      // Life-Hack! Just send it a dozen times! Literally!
      for (let i = 0; i < 12; i++) {
        this.wrtc.broadcastDataChannelMessage(txt)
      }
    },
    /**
     * handleConfirmTCP checks off a queued TCP-like UDP request
     * ...for a specific peer.
     *
     * If all peers confirmed, the provided function (optional) gets executed.
     *
     * @param {String} uuid
     * @param {String} username
     */
    handleConfirmTCP: function (uuid, username) {
      if (this.tcpQueue.length < 1) {
        return
      }
      for (let i = 0; i < this.tcpQueue.length; i++) {
        if (this.tcpQueue[i].i === uuid) {
          if (!this.tcpQueue[i].p || this.tcpQueue[i].p.length < 1) {
            // No peers left -> Remove
            if (this.tcpQueue[i].f) {
              this.tcpQueue[i].f()
            }
            this.tcpQueue.splice(i, 1)
            return
          }
          const ix = this.tcpQueue[i].p.indexOf(username)
          if (ix > -1) {
            // Remove user from queue, so they won't receive more requests
            this.tcpQueue[i].p.splice(ix, 1)
          }
          // Ugly repetition!
          if (this.tcpQueue[i].p.length < 1) {
            // No peers left -> Remove
            if (this.tcpQueue[i].f) {
              this.tcpQueue[i].f()
            }
            this.tcpQueue.splice(i, 1)
            return
          }
        }
      }
    },
    /**
     * @param {String} username
     * @param {String} data
     */
    processTCP: function (username, data) {
      if (data.startsWith('ABL-')) {
        // Format:
        //    X1;Y1;X2;Y2
        const payload = data.substring(4).split(';')
        this.handleCoPlayerAbilityProc(username, payload)
      } else if (data.startsWith('VIS-')) {
        this.fow.set(Number(data.substring(4)), true)
      }
    },
    getRooms: function () {
      return new Promise((resolve) => {
        axios.get(
          `${this.store.serverIP}synced/public/rooms`
        ).then((response) => {
          console.log(response.data)
        }).finally(() => {
          resolve()
        })
      })
    },
    triggerRenderStep: function () {
      // Draw environment
      this.drawGrid(false)
      // Display players
      this.renderGoal()
      this.renderCoPlayers()
      // Display walls/tiles etc.
      this.renderTiles(this.offsetVector)
      this.renderIllumination()
    },
    findNearestEnemyVector: function (qtree, pr, ignoreId) {
      /**
       * @type FFUnit[]
       */
      const enemies = qtree.getContents(
        pr.pos.x - 100,
        pr.pos.y - 100,
        pr.pos.x + 100,
        pr.pos.y + 100)
      // Figure out the min dist of all enemies close
      if (enemies == null || enemies.length <= 0) {
        return null
      }
      let minDist = 999_999
      let dist
      /**
       * @type THREE.Vector2
       */
      const ePos = new THREE.Vector2()
      for (const enemy of enemies) {
        if (enemy.hp < 0 || enemy.id === ignoreId || pr.hitcache.has(enemy.id)) {
          continue
        }
        dist = pr.pos.distanceToSquared(enemy.pos)
        if (dist < minDist) {
          minDist = dist
          ePos.copy(enemy.pos)
        }
      }
      if (minDist === 999_999 || ePos == null) {
        return null
      }
      const direction = new THREE.Vector2()
      direction.copy(ePos)
      direction.sub(pr.pos)
      direction.normalize()
      direction.multiplyScalar(12)
      return direction
    },
    splitProjectile: function (projectile) {
      let pr
      let cl
      for (let j = 0; j < projectile.split; j++) {
        pr = new THREE.Vector2()
        pr.x = Math.random() - 0.5
        pr.y = Math.random() - 0.5
        pr.normalize()
        cl = projectile.clone()
        cl.split = 0
        cl.ttl = 1000
        cl.hitCount = 1
        cl.hitcache = projectile.hitcache
        cl.vec.add(pr)
        this.goalWeaponProjectiles.push(cl)
      }
      projectile.split = 0
    },
    /**
     *
     * @param cell
     * @param [transmit=true]
     */
    markCellSeen: function (cell, transmit = true) {
      if (this.fow.has(cell)) {
        return
      }
      this.fow.set(cell, true)
      if (!transmit) {
        return
      }
      // Transmit the visited cell to others
      this.queueTCP('VIS-', cell)
    },
    addBorderWalls: function () {
      this.tile = 'wall_inner'
      for (let yP = 0; yP < this.yCells; yP++) {
        for (let xP = 0; xP < this.xCells; xP++) {
          if ((yP === 0 || yP === this.yCells - 1) ||
            (xP === 0 || xP === this.xCells - 1)) {
            this.addWall({
              x: xP,
              y: yP
            }, false)
          }
        }
      }
    },
    tinyRic: function () {
      const go = new global.Go()
      const runWasm = async () => {
        const importObject = go.importObject
        const wasmModule = await wikiricUtils.wasmBrowserInstantiate('./main.wasm', importObject)
        go.run(wasmModule.instance)
      }
      runWasm()
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
