<template>
  <template v-for="pup in powerUps" :key="pup">
    <p class="text-start mb1 text-sm">
      <span class="fontbold">
        {{ pup.name }}
      </span>
      <span class="px1">
        Lv. {{ pup.level }}
      </span>
      <span v-if="!hideDesc"
            class="italic text-start text-xs pl1">
        "{{ pup.desc }}"
      </span>
    </p>
    <template v-if="!small">
      <template v-for="eff in pup.effects" :key="eff">
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
    </template>
  </template>
</template>

<script>

export default {
  props: {
    powerUps: {
      type: Array,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    },
    hideDesc: {
      type: Boolean,
      default: false
    }
  },
  name: 'FFPowerUpDisplay',
  methods: {
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    }
  }
}
</script>

<style scoped>

</style>
