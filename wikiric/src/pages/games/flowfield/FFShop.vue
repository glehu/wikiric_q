<template>
  <div v-if="show"
       class="flex gap-2 justify-center items-center
              wfull max-w-[100dvw] top-0 overflow-hidden
              max-h-[calc(100dvh-50px)]
              backdrop-blur-lg
              z-99 fixed hfull pt_nav overflow-y-scroll">
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
            inline-label
            class="wfit">
            <q-tab name="shop" icon="sym_o_shopping_cart" label="Shop"/>
            <q-tab name="skills" icon="sym_o_flare" label="Skills"/>
            <q-tab name="gear" icon="sym_o_person_play" label="Gear"/>
          </q-tabs>
          <q-btn label="Exit&nbsp;Shop" icon="close" flat dense
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
                                  text-xs font-600 mt2 mb2">
                          <p>
                            {{ offer.dps.toLocaleString() }} Base Dmg
                            <span class="italic">( +{{ offer.dpsLevelUp }} per Lv. )</span>
                          </p>
                          <p>
                            {{ offer.cd.toLocaleString() }} ms Cooldown
                            <span class="italic">( -{{ offer.cdLevelUp }} per Lv. )</span>
                          </p>
                          <p>
                            {{ offer.amount }} Amount
                          </p>
                          <p>
                            {{ offer.pHitCount }} Hits
                            <span class="italic">( +{{ offer.pHitCountLevelUp }} per Lv. )</span>
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
                          <div class="flex items-center gap-x-2 gap-y-1
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
                            <p class="text-xs font-600">
                              {{ eff.value.toLocaleString() }} {{ capitalizeFirstLetter(eff.type) }}
                              <template v-if="eff.autoLevelUp && eff.valueLevelBonus !== 0">
                                <span class="italic">( +{{ eff.valueLevelBonus }} / Lv.)</span>
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
                          <div class="flex items-center gap-x-2 gap-y-1
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
                            <p class="text-xs font-600">
                              {{ eff.value.toLocaleString() }} {{ capitalizeFirstLetter(eff.type) }}
                              <template v-if="eff.autoLevelUp && eff.valueLevelBonus !== 0">
                                <span class="italic">( +{{ eff.valueLevelBonus }} / Lv.)</span>
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
          <q-tab-panel name="gear">
            <div class="wfull hfull px2 flex no-wrap">
              <q-tabs
                v-model="tabs2"
                inline-label vertical
                class="wfit">
                <q-tab name="weapons" icon="sym_o_swords" label="Weapons"/>
                <q-tab name="trophies" icon="sym_o_trophy" label="Trophies"/>
              </q-tabs>
              <q-tab-panels v-model="tabs2"
                            vertical animated
                            class="flex-grow transparent">
                <q-tab-panel name="weapons">
                  <div class="background fmt_border rounded p2
                              hfull overflow-y-scroll
                              max-h-[calc(100dvh-176px)]">
                    <p class="text-body1 mb2 ml1">
                      Bonus Stats
                    </p>
                    <template v-if="playerStats && playerStats.size > 0">
                      <table>
                        <tr v-for="[type, value] in playerStats" :key="type">
                          <td>{{ capitalizeFirstLetter(type) }}:</td>
                          <td>{{ value }}</td>
                        </tr>
                      </table>
                    </template>
                    <template v-else>
                      <p class="ml4 text-subtitle2">(No Stat Boosts)</p>
                    </template>
                    <p class="text-body1 my2 ml1">
                      Equipment
                    </p>
                    <template v-if="playerWeapons && playerWeapons.length > 0">
                      <div v-for="wpn in playerWeapons" :key="wpn"
                           class="mb2">
                        <div :style="{ borderColor: getRarityColor(wpn.chance),
                                   backgroundColor: getRarityColor(wpn.chance)}"
                             class="wfull fmt_border
                                    surface border-[4px] rounded-xl
                                    overflow-hidden">
                          <div class="overflow-x-hidden wfull p2
                                      backdrop-brightness-25 rounded-lg">
                            <div class="flex items-start gap-x-2 pb1 no-wrap">
                              <div class="min-w-10 min-h-10 background rounded fmt_border"></div>
                              <p class="text-start line-height-tight">
                                <span class="fontbold pr2">
                                  {{ wpn.name }}
                                </span>
                                <span>
                                  Lv.&nbsp;{{ wpn.level }}
                                </span>
                                <br>
                                <span class="text-xs font-600">
                                  {{ wpn.desc }}
                                </span>
                              </p>
                            </div>
                            <div class="flex column text-start
                                        fmt_border_bottom pb2
                                        text-xs font-600 mt2 mb2">
                              <p>
                                {{ wpn.dps.toLocaleString() }} Base Dmg
                                <span class="italic">( +{{ wpn.dpsLevelUp }} per Lv. )</span>
                              </p>
                              <p>
                                {{ wpn.cd.toLocaleString() }} ms Cooldown
                                <span class="italic">( -{{ wpn.cdLevelUp }} per Lv. )</span>
                              </p>
                              <p>
                                {{ wpn.amount }} Amount
                              </p>
                              <p>
                                {{ wpn.pHitCount }} Hits
                                <span class="italic">( +{{ wpn.pHitCountLevelUp }} per Lv. )</span>
                              </p>
                            </div>
                            <FFPowerUpDisplay :power-ups="wpn.powerUps" hide-desc/>
                          </div>
                        </div>
                      </div>
                    </template>
                    <template v-else>
                      <p class="ml4 text-subtitle2">(No Equipment)</p>
                    </template>
                  </div>
                </q-tab-panel>
                <q-tab-panel name="trophies">
                  <div class="background fmt_border rounded p2
                              hfull overflow-y-scroll
                              max-h-[calc(100dvh-176px)]">
                    <div class="text-center mb4">
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

export default {
  components: {
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
      refreshAmount: 0
    }
  },
  computed: {
    refreshCost () {
      return 100 + (this.refreshAmount * 10)
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
    }
  }
}
</script>

<style scoped>

.tab_no_pad .q-tab-panel {
  padding: 0 !important;
}

</style>
