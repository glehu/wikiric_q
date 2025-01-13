<template>
  <div v-if="show"
       class="flex gap-2 justify-center items-center
              wfull max-w-[100dvw] top-0 overflow-hidden
              max-h-[calc(100dvh-50px)]
              backdrop-blur-lg
              z-99 fixed hfull overflow-y-scroll">
    <q-card flat style="background: transparent"
            class="wfull hfull pt2 overflow-hidden">
      <div class="rounded-md wfull hfull px2 py1 tab_no_pad">
        <q-toolbar class="wfull flex justify-between items-center <md:flex-wrap">
          <div class="flex justify-between items-center mr6">
            <p class="text-lg mr6 fontbold">
              <template v-if="currentRound < 1">
                Preparation
              </template>
              <template v-else>
                Round {{ currentRound }}
              </template>
            </p>
          </div>
          <q-tabs
            v-model="tabs"
            inline-label no-caps
            active-bg-color="primary"
            class="wfit">
            <q-tab name="shop" icon="sym_o_shopping_cart" label="Shop" class="rounded-t-2"/>
            <q-tab name="skills" icon="sym_o_flare" label="Skills" class="rounded-t-2"/>
            <q-tab name="gear" icon="sym_o_person_play" label="Gear" class="rounded-t-2"/>
          </q-tabs>
          <q-btn label="Exit&nbsp;Shop" icon="close" flat dense
                 class="<md:ml-auto <md:mt-2"
                 @click="$emit('close')"/>
        </q-toolbar>
        <q-tab-panels v-model="tabs" animated
                      class="wfull hfull max-h-[calc(100dvh-160px)]
                             transparent">
          <q-tab-panel name="shop">
            <div class="px2">
              <q-toolbar class="justify-between surface rounded fmt_border">
                <div class="flex items-center gap-2 px1">
                  <q-icon name="sym_o_payments" size="1.2rem"/>
                  <p class="text-md fontbold">
                    {{ money }} Money
                  </p>
                </div>
                <q-btn :label="`Refresh (Costs ${refreshCost})`" flat dense no-caps
                       icon="sym_o_refresh"
                       @click="refreshOffers"/>
              </q-toolbar>
            </div>
            <div class="wfull h-[calc(100%-50px)] px2 pt4">
              <template v-if="weaponOffers && weaponOffers.length > 0">
                <div class="grid grid-cols-2 md:grid-cols-3
                            wfull gap-1 mb1">
                  <q-btn v-for="offer in weaponOffers" :key="offer"
                         @click="handleChoseWeapon(offer)"
                         flat no-caps
                         style="padding: 0 !important;
                                border-radius: 0.75rem !important">
                    <div :style="{ borderColor: getRarityColor(offer.chance),
                                   backgroundColor: getRarityColor(offer.chance)}"
                         class="wfull fmt_border h-[300px]
                                hover:pt1 transition-all
                                surface border-[4px] rounded-xl
                                overflow-hidden relative">
                      <div class="overflow-x-hidden h-[290px]
                                  backdrop-brightness-25 rounded-lg
                                  overflow-y-scroll wfull p2 relative">
                        <div class="absolute bottom-0 flex gap-2 items-center">
                          <div class="fmt_border_top fmt_border_left fmt_border_right
                                      surface rounded-t-lg px2 flex items-center gap-2">
                            <q-icon name="sym_o_payments" size="1rem"/>
                            <p>{{ offer.cost }}</p>
                          </div>
                          <template v-if="money < offer.cost">
                            <q-icon name="sym_o_lock" size="1rem"/>
                          </template>
                        </div>
                        <div class="flex items-start gap-x-2 pb1 no-wrap">
                          <div class="min-w-10 min-h-10 background rounded fmt_border"></div>
                          <p class="text-start line-height-tight">
                          <span class="fontbold pr2">
                            {{ offer.name }}
                          </span>
                            <span>
                            Lv.&nbsp;{{ offer.level }}
                          </span>
                            <br>
                            <span class="text-xs font-600">
                            {{ offer.desc }}
                          </span>
                          </p>
                        </div>
                        <div class="flex column text-start
                                    fmt_border_bottom pb2
                                    text-sm font-500 mt2 mb2">
                          <p>
                            Damage: {{ offer.getCalculatedDamage().toLocaleString() }}
                            <span class="italic">( +{{ offer.dpsLevelUp }} <q-icon name="sym_o_military_tech"
                                                                                   size="1rem"/>)</span>
                          </p>
                          <p>
                            Scaling: {{ offer.getCalculatedStat(offer.ratio, 'ratio') * 100 }}%
                          </p>
                          <p>
                            Cooldown: {{ offer.getCalculatedStat(offer.cd, 'cd').toLocaleString() }} ms
                            <span class="italic">( -{{ offer.cdLevelUp }} <q-icon name="sym_o_military_tech"
                                                                                  size="1rem"/>)</span>
                          </p>
                          <p>
                            Amount: {{ offer.getCalculatedStat(offer.amount, 'amount') }}
                          </p>
                          <p>
                            Hits: {{ offer.getCalculatedStat(offer.pHitCount, 'hitCount') }}
                            <span class="italic">( +{{ offer.pHitCountLevelUp }} <q-icon name="sym_o_military_tech"
                                                                                         size="1rem"/>)</span>
                          </p>
                        </div>
                        <FFPowerUpDisplay :power-ups="offer.powerUps" hide-desc/>
                      </div>
                    </div>
                  </q-btn>
                </div>
              </template>
              <template v-if="itemOffers && itemOffers.length > 0">
                <div class="grid grid-cols-2 md:grid-cols-3
                            wfull gap-1 mb4">
                  <q-btn v-for="offer in itemOffers" :key="offer"
                         @click="handleChoseItem(offer)"
                         flat no-caps
                         style="padding: 0 !important;
                                border-radius: 0.75rem !important">
                    <div :style="{ borderColor: getRarityColor(offer.chance),
                                   backgroundColor: getRarityColor(offer.chance)}"
                         class="wfull fmt_border h-[300px]
                                hover:pt1 transition-all
                                surface border-[4px] rounded-xl
                                overflow-hidden relative">
                      <div class="overflow-x-hidden h-[290px]
                                  backdrop-brightness-25 rounded-lg
                                  overflow-y-scroll wfull p2 relative">
                        <div class="absolute bottom-0 flex gap-2 items-center">
                          <div class="fmt_border_top fmt_border_left fmt_border_right
                                      surface rounded-t-lg px2 flex items-center gap-2">
                            <q-icon name="sym_o_payments" size="1rem"/>
                            <p>{{ offer.cost }}</p>
                          </div>
                          <template v-if="money < offer.cost">
                            <q-icon name="sym_o_lock" size="1rem"/>
                          </template>
                        </div>
                        <div class="flex items-start gap-x-2 pb1 no-wrap">
                          <div class="min-w-10 min-h-10 background rounded fmt_border"></div>
                          <p class="text-start line-height-tight">
                          <span class="fontbold pr2">
                            {{ offer.name }}
                          </span>
                            <span>
                            Lv.&nbsp;{{ offer.level }}
                          </span>
                            <br>
                            <span class="text-xs font-600">
                            {{ offer.desc }}
                          </span>
                          </p>
                        </div>
                        <template v-for="eff in offer.effects" :key="eff">
                          <div class="flex items-center gap-x-2 gap-y-1 ml2
                                      mb1 fmt_border rounded p1 text-start">
                            <div v-if="eff.onHit"
                                 class="primary px1 py0.5 rounded text-xs w-fit
                                        font-bold">
                              <q-icon name="sym_o_explosion" size="1rem"/>
                              <q-tooltip>
                                <p class="text-xs fontbold">
                                  On-Hit Effect
                                </p>
                              </q-tooltip>
                            </div>
                            <template v-if="eff.autoLevelUp">
                              <div class="primary px1 py0.5 rounded text-xs w-fit
                                        font-bold">
                                <q-icon name="sym_o_trending_up" size="1rem"/>
                                <q-tooltip>
                                  <p class="text-xs fontbold">
                                    Auto Level-Up
                                  </p>
                                </q-tooltip>
                              </div>
                            </template>
                            <p class="text-sm font-500">
                              {{ eff.value.toLocaleString() }} {{ capitalizeFirstLetter(eff.type) }}
                              <template v-if="eff.autoLevelUp && eff.valueLevelBonus !== 0">
                                <span class="italic">( +{{ eff.valueLevelBonus }} <q-icon name="sym_o_military_tech"
                                                                                          size="1rem"/>)</span>
                              </template>
                              <template v-if="eff.onHit">
                                every {{ eff.hitCount }} hits
                              </template>
                            </p>
                          </div>
                        </template>
                      </div>
                    </div>
                  </q-btn>
                </div>
              </template>
            </div>
          </q-tab-panel>
          <q-tab-panel name="skills">
            <div class="px2">
              <q-toolbar class="justify-between surface rounded fmt_border">
                <div class="flex items-center gap-1">
                  <q-icon name="sym_o_military_tech" size="1.2rem"/>
                  <p class="text-md fontbold">
                    {{ levelUps }} Level-Ups
                  </p>
                </div>
              </q-toolbar>
            </div>
            <div class="wfull h-[calc(100%-50px)] px2 flex items-center justify-center">
              <template v-if="powerUpOffers && powerUpOffers.length > 0">
                <div class="grid grid-cols-2 md:grid-cols-3
                            wfull gap-1 pt4 pb50">
                  <q-btn v-for="offer in powerUpOffers" :key="offer"
                         @click="handleChosePowerUp(offer)"
                         flat no-caps
                         style="padding: 0 !important;
                                border-radius: 0.75rem !important">
                    <div :style="{ borderColor: getRarityColor(offer.chance),
                                   backgroundColor: getRarityColor(offer.chance)}"
                         class="wfull fmt_border h-[300px]
                                hover:pt1 transition-all
                                surface border-[4px] rounded-xl
                                overflow-hidden">
                      <div class="overflow-x-hidden h-[290px]
                                  backdrop-brightness-25 rounded-lg
                                  overflow-y-scroll wfull p2">
                        <div v-if="offer.isAbility"
                             class="mb2 rounded-full px2 py1 wfit
                                    fmt_border primary flex no-wrap
                                    gap-2 items-center">
                          <q-icon name="sym_o_offline_bolt" size="1rem"/>
                          <p class="text-xs font-600">
                            Ability
                          </p>
                        </div>
                        <div class="flex items-start gap-x-2 pb2 no-wrap">
                          <p class="text-start line-height-tight">
                            <span class="fontbold pr2">
                              {{ offer.name }}
                            </span>
                            <span>
                              Lv.&nbsp;{{ offer.level }}
                            </span>
                            <br>
                            <span class="text-xs font-600">
                              {{ offer.desc }}
                            </span>
                          </p>
                        </div>
                        <template v-for="eff in offer.effects" :key="eff">
                          <div class="flex items-center gap-x-2 gap-y-1 ml2
                                      mb1 fmt_border rounded p1 text-start">
                            <div v-if="eff.onHit"
                                 class="primary px1 py0.5 rounded text-xs w-fit
                                        font-bold">
                              <q-icon name="sym_o_explosion" size="1rem"/>
                              <q-tooltip>
                                <p class="text-xs fontbold">
                                  On-Hit Effect
                                </p>
                              </q-tooltip>
                            </div>
                            <template v-if="eff.autoLevelUp">
                              <div class="primary px1 py0.5 rounded text-xs w-fit
                                          font-bold">
                                <q-icon name="sym_o_trending_up" size="1rem"/>
                                <q-tooltip>
                                  <p class="text-xs fontbold">
                                    Auto Level-Up
                                  </p>
                                </q-tooltip>
                              </div>
                            </template>
                            <template v-if="eff.type === 'visual'">
                              <p class="text-sm font-500">
                                Type: {{ getVisualType(eff.value) }}
                              </p>
                            </template>
                            <template v-else-if="eff.type === 'trajectory'">
                              <p class="text-sm font-500">
                                Trajectory: {{ getTrajectoryType(eff.value) }}
                              </p>
                            </template>
                            <template v-else-if="eff.type === 'ttl'">
                              <p class="text-sm font-500">
                                Duration: {{ eff.value }}
                              </p>
                            </template>
                            <template v-else-if="eff.type === 'debuff'">
                              <p class="text-sm font-500">
                                Debuff: {{ getDebuffType(eff.value) }}
                              </p>
                            </template>
                            <template v-else>
                              <p class="text-sm font-500">
                                {{ eff.value.toLocaleString() }} {{ capitalizeFirstLetter(eff.type) }}
                                <template v-if="eff.autoLevelUp && eff.valueLevelBonus !== 0">
                                  <span class="italic">( +{{ eff.valueLevelBonus }} / Lv.)</span>
                                </template>
                                <template v-if="eff.onHit">
                                  <template v-if="eff.hitCount > 1">
                                    every {{ eff.hitCount }} hits
                                  </template>
                                  <template v-else>
                                    every hit
                                  </template>
                                </template>
                              </p>
                            </template>
                          </div>
                        </template>
                      </div>
                    </div>
                  </q-btn>
                </div>
              </template>
            </div>
          </q-tab-panel>
          <q-tab-panel name="gear">
            <div class="wfull hfull flex no-wrap">
              <q-tabs
                v-model="tabs2"
                inline-label vertical dense
                active-bg-color="primary"
                class="wfit">
                <q-tab name="weapons" icon="sym_o_swords" class="mb2 rounded-l-2">
                  <q-tooltip>
                    <p class="text-xs fontbold">
                      Weapons
                    </p>
                  </q-tooltip>
                </q-tab>
                <q-tab name="trophies" icon="sym_o_trophy" class="rounded-l-2">
                  <q-tooltip>
                    <p class="text-xs fontbold">
                      Trophies
                    </p>
                  </q-tooltip>
                </q-tab>
              </q-tabs>
              <q-tab-panels v-model="tabs2"
                            vertical animated
                            class="flex-grow transparent">
                <q-tab-panel name="weapons">
                  <div class="background fmt_border rounded p2
                              hfull overflow-y-scroll
                              max-h-[calc(100dvh-160px)]">
                    <p class="text-body1 mb2 ml1">
                      Bonus Stats
                    </p>
                    <template v-if="playerStats && playerStats.size > 0">
                      <table class="ml3 surface p1 rounded-lg">
                        <tr v-for="[type, value] in playerStats" :key="type">
                          <td class="px1">{{ capitalizeFirstLetter(type) }}:</td>
                          <td class="px1">{{ (value).toFixed(1) }}</td>
                        </tr>
                      </table>
                    </template>
                    <template v-else>
                      <p class="ml4 text-subtitle2">(No Stat Boosts)</p>
                    </template>
                    <p class="text-body1 my2 ml1">
                      Weapons
                    </p>
                    <q-checkbox label="Hide Details" v-model="isViewingSmallWeapons"/>
                    <div v-if="playerWeapons && playerWeapons.length > 0"
                         class="masonry">
                      <div v-for="wpn in playerWeapons" :key="wpn"
                           class="mb-[10px] masonry_item">
                        <FFWeaponDisplayShiny :weapon="wpn"
                                              :player-stats="playerStats"
                                              :small-power-up="isViewingSmallWeapons"/>
                      </div>
                    </div>
                    <template v-else>
                      <p class="ml4 text-subtitle2">(No Weapons)</p>
                    </template>
                    <p class="text-body1 my2 ml1">
                      Abilities
                    </p>
                    <q-checkbox label="Hide Details" v-model="isViewingSmallAbilities"/>
                    <div v-if="playerAbilities && playerAbilities.length > 0"
                         class="masonry">
                      <div v-for="wpn in playerAbilities" :key="wpn"
                           class="mb-[10px] masonry_item">
                        <FFWeaponDisplayShiny :weapon="wpn.wpn"
                                              :player-stats="playerStats"
                                              :small-power-up="isViewingSmallAbilities"/>
                      </div>
                    </div>
                    <template v-else>
                      <p class="ml4 text-subtitle2">(No Abilities)</p>
                    </template>
                  </div>
                </q-tab-panel>
                <q-tab-panel name="trophies">
                  <div class="background fmt_border rounded p2
                              hfull overflow-y-scroll
                              max-h-[calc(100dvh-160px)]">
                    <div class="text-center mt1 mb4 font-500">
                      <p class="text-sm pointer-events-none">
                        Trophies empower you on top of your items and skills.
                      </p>
                      <p class="text-sm pointer-events-none">
                        Complete tasks to collect trophies.
                      </p>
                    </div>
                    <template v-if="trophies && trophies.categories.starter.length > 0">
                      <div class="grid gap-2 grid-cols-1 lg:grid-cols-2">
                        <div v-for="trophy in trophies.categories.starter" :key="trophy"
                             class="mb2 mx1">
                          <FFTrophyDisplay :trophy="trophy"/>
                        </div>
                      </div>
                    </template>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-card>
  </div>
</template>

<script>

import FFPowerUpDisplay from 'pages/games/flowfield/powerups/FFPowerUpDisplay.vue'
import FFTrophyList from 'pages/games/flowfield/trophies/FFTrophyList'
import FFTrophyDisplay from 'pages/games/flowfield/trophies/FFTrophyDisplay.vue'
import FFWeaponDisplayShiny from 'pages/games/flowfield/weapons/FFWeaponDisplayShiny.vue'

export default {
  components: {
    FFWeaponDisplayShiny,
    FFTrophyDisplay,
    FFPowerUpDisplay
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    currentRound: {
      type: Number,
      required: true
    },
    levelUps: {
      type: Number,
      required: true
    },
    weaponOffers: {
      type: Array,
      required: true
    },
    powerUpOffers: {
      type: Array,
      required: true
    },
    itemOffers: {
      type: Array,
      required: true
    },
    tabPref: {
      type: String,
      default: 'shop',
      required: false
    },
    playerStats: {
      type: Map,
      required: true
    },
    playerItems: {
      type: Array,
      required: true
    },
    playerWeapons: {
      type: Array,
      required: true
    },
    playerAbilities: {
      type: Array,
      required: true
    },
    trophies: {
      type: FFTrophyList,
      required: true
    },
    money: {
      type: Number,
      required: true
    }
  },
  name: 'FFShop',
  emits: ['wpn', 'itm', 'pup', 'close', 'rewpn'],
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (this.show) {
        this.handleDialogOpen()
      }
    },
    tabPref (newVal) {
      this.tabs = newVal
    }
  },
  data () {
    return {
      tabs: 'shop',
      tabs2: 'weapons',
      show: false,
      refreshAmount: 0,
      isViewingSmallWeapons: false,
      isViewingSmallAbilities: false
    }
  },
  computed: {
    refreshCost () {
      return 10 + (this.refreshAmount * 5)
    }
  },
  methods: {
    handleDialogOpen: function () {
      if (this.tabPref) {
        this.tabs = this.tabPref
      }
    },
    handleChoseWeapon: function (offer) {
      if (this.money < offer.cost) {
        this.showNotEnoughMoney()
        return
      }
      this.$emit('wpn', offer)
    },
    handleChoseItem: function (offer) {
      if (this.money < offer.cost) {
        this.showNotEnoughMoney()
        return
      }
      this.$emit('itm', offer)
    },
    handleChosePowerUp: function (offer) {
      if (this.money < offer.cost) {
        this.showNotEnoughMoney()
        return
      }
      this.$emit('pup', offer)
    },
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    },
    refreshOffers: function () {
      if (this.money < this.refreshCost) {
        return
      }
      this.$emit('rewpn', this.refreshCost)
      this.refreshAmount += 1
    },
    getRarityColor: function (value) {
      const h = (value / 100) * 240
      return `hsl(${h}, 100%, 25%)`
    },
    showNotEnoughMoney: function () {
      this.$q.notify({
        color: 'negative',
        position: 'top-right',
        message: 'Not Enough Money!',
        caption: 'Eliminate more enemies to afford this.',
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            handler: () => { /* ... */
            }
          }
        ]
      })
    },
    getVisualType: function (type) {
      const VisualTypes = {
        Bullet: 0,
        Fire: 1,
        Electricity: 2
      }
      switch (type) {
        case VisualTypes.Bullet:
          return 'Bullet'
        case VisualTypes.Fire:
          return 'Fire'
        case VisualTypes.Electricity:
          return 'Electricity'
      }
    },
    getDebuffType: function (type) {
      const DebuffTypes = {
        Slow: 0,
        Stun: 1
      }
      switch (type) {
        case DebuffTypes.Slow:
          return 'Slow'
        case DebuffTypes.Stun:
          return 'Stun'
      }
    },
    getTrajectoryType: function (type) {
      const TrajectoryTypes = {
        Projectile: 0,
        Stream: 1,
        Circle: 2
      }
      switch (type) {
        case TrajectoryTypes.Projectile:
          return 'Projectile'
        case TrajectoryTypes.Stream:
          return 'Stream'
        case TrajectoryTypes.Circle:
          return 'Circle'
      }
    }
  }
}
</script>

<style scoped>

.tab_no_pad .q-tab-panel {
  padding: 0 !important;
}

.masonry {
  columns: 3;
  column-width: 300px;
  column-gap: 10px;
}

</style>
