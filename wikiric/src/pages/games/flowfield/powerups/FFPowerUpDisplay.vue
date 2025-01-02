<template>
  <template v-for="pup in powerUps" :key="pup">
    <div v-if="pup.isAbility"
         class="mb2 rounded-full px2 py1 wfit
                fmt_border primary flex no-wrap
                gap-2 items-center">
      <q-icon name="sym_o_offline_bolt" size="1rem"/>
      <p class="text-xs font-600">
        Ability
      </p>
    </div>
    <p v-if="pup.name && pup.name.trim() !== ''"
       class="text-start mb1 text-sm">
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
          <template v-else-if="eff.type === 'debuff'">
            <p class="text-sm font-500">
              Debuff: {{ getDebuffType(eff.value) }}
            </p>
          </template>
          <template v-else>
            <p class="text-sm font-500">
              {{ eff.value.toLocaleString() }} {{ capitalizeFirstLetter(eff.type) }}
              <template v-if="eff.autoLevelUp && eff.valueLevelBonus !== 0">
                <span class="italic">( +{{ eff.valueLevelBonus }} <q-icon name="sym_o_military_tech"
                                                                          size="1rem"/>)</span>
              </template>
              <template v-if="eff.hitCount > 1">
                every {{ eff.hitCount }} hits
              </template>
              <template v-else>
                every hit
              </template>
            </p>
          </template>
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
    }
  }
}
</script>

<style scoped>

</style>
