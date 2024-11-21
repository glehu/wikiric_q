<template>
  <div :style="{ borderColor: getRarityColor(weapon.chance),
                 backgroundColor: getRarityColor(weapon.chance)}"
       class="wfull fmt_border
              surface border-[4px] rounded-xl
              overflow-hidden">
    <div class="overflow-x-hidden wfull p2
                backdrop-brightness-25 rounded-lg">
      <div class="flex items-start gap-x-2 pb1 no-wrap">
        <div class="min-w-10 min-h-10 background rounded fmt_border"></div>
        <p class="text-start line-height-tight">
          <span class="fontbold pr2">
            {{ weapon.name }}
          </span>
          <span>
            Lv.&nbsp;{{ weapon.level }}
          </span>
          <br>
          <span class="text-xs font-600">
            {{ weapon.desc }}
          </span>
        </p>
      </div>
      <div class="flex column text-start
                  fmt_border_bottom pb2
                  text-sm font-500 mt2 mb2">
        <p>
          Damage: {{ weapon.getCalculatedDamage().toLocaleString() }}
          <span class="italic">( +{{ weapon.dpsLevelUp }} <q-icon name="sym_o_military_tech" size="1rem"/>)</span>
        </p>
        <p>
          Scaling: {{ (weapon.getCalculatedStat(weapon.ratio, 'ratio') * 100).toFixed(0) }}%
        </p>
        <p>
          Cooldown: {{ weapon.getCalculatedStat(weapon.cd, 'cd').toLocaleString() }}
          <span class="italic">( -{{ weapon.cdLevelUp }} <q-icon name="sym_o_military_tech" size="1rem"/>)</span>
        </p>
        <p>
          Amount: {{ weapon.getCalculatedStat(weapon.amount, 'amount').toFixed(0) }}
        </p>
        <p>
          Hits: {{ weapon.getCalculatedStat(weapon.pHitCount, 'hitCount') }}
          <span class="italic">( +{{ weapon.pHitCountLevelUp }} <q-icon name="sym_o_military_tech" size="1rem"/>)</span>
        </p>
      </div>
      <FFPowerUpDisplay :power-ups="weapon.powerUps" hide-desc/>
    </div>
  </div>
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
    }
  },
  name: 'FFWeaponDisplayShiny',
  methods: {
    getRarityColor: function (value) {
      const h = (value / 100) * 240
      return `hsl(${h}, 100%, 25%)`
    }
  }
}
</script>

<style scoped>

</style>
