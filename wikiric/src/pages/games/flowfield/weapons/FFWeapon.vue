<!--
  - Copyright (c) 2024.
  - Module FFWeapon.vue of wikiricQ or wikiric including wikiric and wikiricGo
  - themselves were, are and remain intellectual property of Luca Goldhausen.
  - You may use, edit and redistribute any of their parts as long as you give credit
  - in some visually accessible way.
  - (where one would expect it without having to be visible on a screen under heavy use by the viewer).
  -->

<template>
  <div>
    <q-tooltip style="padding: 0 !important;"
               max-height="90vh"
               class="bg-transparent hfull">
      <div class="flex items-end hfull">
        <FFWeaponDisplay :weapon="weapon" :small="small"/>
      </div>
    </q-tooltip>
    <template v-if="weapon._cd <= 0">
      <q-circular-progress
        instant-feedback
        :value="weapon._amount"
        :max="weapon.amount"
        size="28px"
        :thickness="1"
        color="primary"
        track-color="grey-3"
        class="fontbold">
      </q-circular-progress>
    </template>
    <template v-else>
      <q-circular-progress
        instant-feedback
        :value="weapon.cd - weapon._cd"
        :max="weapon.cd"
        size="28px"
        :thickness="1"
        color="negative"
        track-color="grey-3"
        class="fontbold">
      </q-circular-progress>
    </template>
  </div>
</template>

<script>
import FFWeapon from 'pages/games/flowfield/weapons/FFWeapon'
import FFWeaponDisplay from 'pages/games/flowfield/weapons/FFWeaponDisplay.vue'

export default {
  components: { FFWeaponDisplay },
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
  name: 'FFWeapon'
}
</script>

<style scoped>

</style>
