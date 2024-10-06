<!--
  - Copyright (c) 2024.
  - Module FFWeaponDisplay.vue of wikiricQ or wikiric including wikiric and wikiricGo
  - themselves were, are and remain intellectual property of Luca Goldhausen.
  - You may use, edit and redistribute any of their parts as long as you give credit
  - in some visually accessible way.
  - (where one would expect it without having to be visible on a screen under heavy use by the viewer).
  -->

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
        <q-toolbar class="wfull flex justify-between items-center pb2">
          <div class="flex justify-between items-center mr6">
            <p class="text-lg mr6 fontbold">
              <template v-if="currentRound < 1">
                Preparation
              </template>
              <template v-else>
                Round {{ currentRound }}
              </template>
            </p>
            <div class="flex items-center justify-center gap-1">
              <q-icon name="sym_o_military_tech" size="1.2rem"/>
              <p class="text-sm fontbold">
                Level-Ups: {{ levelUps }}
              </p>
            </div>
          </div>
          <q-tabs
            v-model="tabs"
            inline-label dense
            class="wfit">
            <q-tab name="shop" icon="sym_o_shopping_cart" label="Shop"/>
            <q-tab name="skills" icon="sym_o_flare" label="Skills"/>
          </q-tabs>
          <q-btn label="Exit&nbsp;Shop" icon="close" flat dense
                 @click="$emit('close')"/>
        </q-toolbar>
        <q-tab-panels v-model="tabs" animated
                      class="wfull hfull max-h-[calc(100dvh-160px)]
                             transparent">
          <q-tab-panel name="shop">
            <div class="wfull hfull px2">
              <template v-if="weaponOffers && weaponOffers.length > 0">
                <div class="grid grid-cols-2 wfull gap-4 mb4">
                  <q-btn v-for="offer in weaponOffers" :key="offer"
                         @click="handleChoseWeapon(offer)"
                         flat no-caps
                         class="wfull fmt_border h-[300px]
                                surface border-[4px]
                                px2 py1">
                    <div class="overflow-x-hidden
                                overflow-y-scroll hfull wfull">
                      <div class="flex items-center gap-x-2
                                  fmt_border_bottom pb2 mb2">
                        <p>
                        <span class="fontbold pr2">
                          {{ offer.name }}
                        </span>
                          <span>
                          Lv.&nbsp;{{ offer.level }}
                        </span>
                        </p>
                      </div>
                      <p class="text-xs font-600 fmt_border_bottom pb2 mb2">
                        {{ offer.desc }}
                      </p>
                      <div class="flex column text-start
                                  fmt_border_bottom pb4
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
                      <FFPowerUpDisplay :power-ups="offer.powerUps" :small="false"/>
                    </div>
                  </q-btn>
                </div>
              </template>
              <template v-if="itemOffers && itemOffers.length > 0">
                <div class="grid grid-cols-2 wfull gap-4">
                  <q-btn v-for="offer in itemOffers" :key="offer"
                         @click="handleChoseItem(offer)"
                         flat no-caps
                         class="wfull fmt_border h-[300px]
                                surface border-[4px]
                                px2 py1">
                    <div class="overflow-x-hidden
                                overflow-y-scroll hfull wfull">
                      <div class="flex items-center gap-x-2
                                  fmt_border_bottom pb2 mb2">
                        <p>
                        <span class="fontbold pr2">
                          {{ offer.name }}
                        </span>
                          <span>
                          Lv.&nbsp;{{ offer.level }}
                        </span>
                        </p>
                      </div>
                      <p class="text-xs font-600 fmt_border_bottom pb2 mb2">
                        {{ offer.desc }}
                      </p>
                    </div>
                  </q-btn>
                </div>
              </template>
            </div>
          </q-tab-panel>
          <q-tab-panel name="skills">
            <div class="wfull hfull px2">
              <template v-if="powerUpOffers && powerUpOffers.length > 0">
                <div class="grid grid-cols-2 wfull gap-4 mb4">
                  <q-btn v-for="offer in powerUpOffers" :key="offer"
                         @click="handleChosePowerUp(offer)"
                         flat no-caps
                         class="wfull fmt_border
                                overflow-hidden
                                surface border-[4px] px2 py1">
                    <div class="overflow-x-hidden
                                overflow-y-scroll h-[200px] wfull">
                      <FFPowerUpDisplay :power-ups="[offer]"
                                        class="flex-grow"/>
                    </div>
                  </q-btn>
                </div>
              </template>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-card>
  </div>
</template>

<script>

import FFPowerUpDisplay from 'pages/games/flowfield/powerups/FFPowerUpDisplay.vue'

export default {
  components: { FFPowerUpDisplay },
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
    }
  },
  name: 'FFShop',
  emits: ['wpn', 'itm', 'pup', 'close'],
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (this.show) {
        this.handleDialogOpen()
      }
    }
  },
  data () {
    return {
      tabs: 'shop',
      show: false
    }
  },
  methods: {
    handleDialogOpen: function () {
      if (this.tabPref) {
        this.tabs = this.tabPref
      }
    },
    handleChoseWeapon: function (offer) {
      this.show = false
      this.$emit('wpn', offer)
      this.$emit('close')
    },
    handleChoseItem: function (offer) {
      this.show = false
      this.$emit('itm', offer)
      this.$emit('close')
    },
    handleChosePowerUp: function (offer) {
      this.show = false
      this.$emit('pup', offer)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>

.tab_no_pad .q-tab-panel {
  padding: 0 !important;
}

</style>
