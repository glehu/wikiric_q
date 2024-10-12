<template>
  <q-card class="text-sm fmt_border
                 flex items-center surface"
          style="box-shadow: none !important">
    <div class="lg:flex">
      <q-card-section>
        <p class="text-start mb1">
          <span class="fontbold text-body2">
            {{ item.name }}
          </span>
              <span class="px1">
            Lv. {{ item.level }}
          </span>
              <span class="italic text-start text-xs pl1">
            "{{ item.desc }}"
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
      </q-card-section>
    </div>
  </q-card>
</template>

<script>

import FFItem from 'pages/games/flowfield/items/FFItem'

export default {
  props: {
    item: {
      type: FFItem,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  name: 'FFItemDisplay',
  methods: {
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    }
  }
}
</script>

<style scoped>

</style>
