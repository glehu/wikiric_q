<template>
  <div>
    <q-tooltip style="padding: 0 !important;"
               max-height="90vh"
               class="background">
      <FFWeaponDisplay :weapon="weapon"/>
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
import FFWeapon from 'pages/games/flowfield/FFWeapon'
import FFWeaponDisplay from 'pages/games/flowfield/FFWeaponDisplay.vue'

export default {
  components: { FFWeaponDisplay },
  props: {
    weapon: {
      type: FFWeapon,
      required: true
    }
  },
  name: 'FFWeapon'
}
</script>

<style scoped>

</style>
