<template>
  <q-card class="text-sm fmt_border
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
            Damage: {{ weapon.getCalculatedDamage().toLocaleString() }}
            <span class="italic">( +{{ weapon.dpsLevelUp }} <q-icon name="sym_o_military_tech" size="1rem"/>)</span>
          </p>
          <p>
            Scaling: {{ weapon.ratio * 100 }}%
          </p>
          <p>
            Cooldown: {{ weapon.cd.toLocaleString() }} ms
            <span class="italic">( -{{ weapon.cdLevelUp }} <q-icon name="sym_o_military_tech" size="1rem"/>)</span>
          </p>
          <p>
            Amount: {{ weapon.amount }}
          </p>
          <p>
            Hits: {{ weapon.pHitCount }}
            <span class="italic">( +{{ weapon.pHitCountLevelUp }} <q-icon name="sym_o_military_tech" size="1rem"/>)</span>
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
