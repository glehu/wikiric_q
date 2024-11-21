<template>
  <div>
    <q-tooltip style="padding: 0 !important;"
               max-height="90vh"
               class="">
      <div class="flex items-center gap-2 p4 surface rounded fmt_border">
        <p class="text-body1 fontbold">
          {{ ability.name }}
        </p>
        <p class="text-body1">
          Lv. {{ ability.level }}
        </p>
      </div>
    </q-tooltip>
    <template v-if="ability._cd <= 0">
      <q-circular-progress
        instant-feedback
        :value="1"
        :max="1"
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
        :value="cooldown - ability._cd"
        :max="cooldown"
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

import FFPowerUp from 'pages/games/flowfield/powerups/FFPowerUp'

export default {
  props: {
    ability: {
      type: FFPowerUp,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  name: 'FFAbility',
  computed: {
    cooldown () {
      return this.ability.cd
    }
  }
}
</script>

<style scoped>

</style>
