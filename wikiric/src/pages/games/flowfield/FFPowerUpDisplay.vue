<template>
  <template v-for="pup in powerUps" :key="pup">
    <p class="break-words text-start mb1">
      <span class="fontbold text-body2">
        {{ pup.name }}
      </span>
      <span class="px1">
        Lv. {{ pup.level }}
      </span>
      <span class="italic text-start text-xs pl1">
        "{{ pup.desc }}"
      </span>
    </p>
    <template v-if="!small">
      <template v-for="eff in pup.effects" :key="eff">
        <div class="flex items-center gap-2 mb2 fmt_border rounded p1">
          <div class="primary px1 py0.5 rounded text-xs w-fit
                      font-bold">
            <template v-if="eff.onHit">
              <p>On-Hit</p>
            </template>
            <template v-else>
              <p>Passive</p>
            </template>
          </div>
          <template v-if="eff.autoLevelUp">
            <div class="primary px1 py0.5 rounded text-xs w-fit
                        font-bold">
              <p>Auto Level-Up</p>
            </div>
          </template>
          <p>
            {{ eff.value.toLocaleString() }} {{ capitalizeFirstLetter(eff.type) }}
            <span class="italic">( +{{ eff.valueLevelBonus }} per Lv. )</span>
            <template v-if="eff.onHit">
              every {{ eff.hitCount }} hits.
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
