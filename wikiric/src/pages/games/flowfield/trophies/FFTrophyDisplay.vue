<template>
  <q-card class="text-sm fmt_border wfull hfull
                 flex items-start surface"
          :class="{ 'trophyDone': trophy.done }"
          style="box-shadow: none !important; border-width: 4px">
    <q-card-section class="wfull">
      <div class="flex gap-2 wfull justify-between">
        <div class="wfit flex gap-2 text-2xl
                    fontbold items-center <sm:wfull
                    background px2 py1 rounded fmt_border">
          <p>{{ trophy.goalProgress.toLocaleString() }}</p>
          <p>/</p>
          <p>{{ trophy.goalThreshold.toLocaleString() }}</p>
          <template v-if="!trophy.done">
            <q-icon name="sym_o_lock" size="1.5rem"/>
          </template>
          <template v-else>
            <q-icon name="sym_o_check" size="2rem" color="green"/>
          </template>
        </div>
        <div class="wfit">
          <div class="flex column md:items-end mb1">
            <p class="text-body1 fontbold wfit">
              {{ trophy.name }}
            </p>
            <p class="text-sm wfit">
              {{ trophy.desc }}
            </p>
          </div>
        </div>
      </div>
      <div v-if="trophy.statBoosts && trophy.statBoosts.size > 0">
        <table class="fmt_border rounded mt2 py1">
          <tr v-for="[key, val] of trophy.statBoosts.entries()" :key="key.u">
            <td class="px1">
              {{ capitalizeFirstLetter(key) }}:
            </td>
            <td class="px1">
              {{ val }}
            </td>
          </tr>
        </table>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import FFTrophy from 'pages/games/flowfield/trophies/FFTrophy'

export default {
  components: {},
  props: {
    trophy: {
      type: FFTrophy,
      required: true
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  name: 'FFTrophyDisplay',
  methods: {
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    }
  }
}
</script>

<style scoped>

.trophyDone {
  border-color: var(--md-sys-color-primary);
}

</style>
