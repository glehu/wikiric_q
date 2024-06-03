<template>
  <q-card class="text-subtitle2 hfull fmt_border
                 flex items-center bg-transparent"
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
        <div class="flex column text-start">
          <p>
            {{ weapon.dps.toLocaleString() }} Base Dmg
            <span class="italic">( +{{ weapon.dpsLevelUp }} per Lv. )</span>
          </p>
          <p>
            {{ weapon.cd.toLocaleString() }} ms Cooldown
            <span class="italic">( -{{ weapon.cdLevelUp }} per Lv. )</span>
          </p>
          <p>
            {{ weapon.amount }} Amount
          </p>
          <p>
            {{ weapon.pHitCount }} Hits
            <span class="italic">( +{{ weapon.pHitCountLevelUp }} per Lv. )</span>
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
import FFWeapon from 'pages/games/flowfield/FFWeapon'
import FFPowerUpDisplay from 'pages/games/flowfield/FFPowerUpDisplay.vue'

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
