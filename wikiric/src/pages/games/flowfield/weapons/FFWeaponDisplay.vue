<!--
  - Copyright (c) 2024.
  - Module FFWeaponDisplay.vue of wikiricQ or wikiric including wikiric and wikiricGo
  - themselves were, are and remain intellectual property of Luca Goldhausen.
  - You may use, edit and redistribute any of their parts as long as you give credit
  - in some visually accessible way.
  - (where one would expect it without having to be visible on a screen under heavy use by the viewer).
  -->

<template>
  <q-card class="text-subtitle2 fmt_border
                 flex items-center surface"
          style="box-shadow: none !important">
    <div class="lg:flex">
      <q-card-section>
        <div class="flex items-center gap-2 mb1">
          <p class="text-body1 fontbold">
            {{ weapon.name }}
          </p>
          <p>
            Lv. {{ weapon.level }}
          </p>
        </div>
        <div v-if="!small" class="flex column text-start">
          <p>
            {{ weapon.dps.toLocaleString() }} Base Dmg
            <span class="italic">( +{{ weapon.dpsLevelUp }} per Lv. )</span>
          </p>
          <p>
            {{ weapon.cd.toLocaleString() }} ms Cooldown
            <span class="italic">( -{{ weapon.cdLevelUp }} per Lv. )</span>
          </p>
          <p>
            {{ weapon.amount }} Amount
          </p>
          <p>
            {{ weapon.pHitCount }} Hits
            <span class="italic">( +{{ weapon.pHitCountLevelUp }} per Lv. )</span>
          </p>
        </div>
      </q-card-section>
      <q-card-section>
        <FFPowerUpDisplay :power-ups="weapon.powerUps" :small="small"/>
      </q-card-section>
    </div>
  </q-card>
</template>

<script>
import FFWeapon from 'pages/games/flowfield/weapons/FFWeapon'
import FFPowerUpDisplay from 'pages/games/flowfield/powerups/FFPowerUpDisplay.vue'

export default {
  components: { FFPowerUpDisplay },
  props: {
    weapon: {
      type: FFWeapon,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  name: 'FFWeaponDisplay'
}
</script>

<style scoped>

</style>
