<template>
  <q-stepper
    v-model="step"
    vertical
    header-class="fontbold"
    animated>
    <template v-if="journeyEntry && journeyEntry._journeys">
      <div class="pl5 mb2 pb3 fmt_border_bottom px4">
        <p class="font-800 text-body1">
          {{ journeyEntry.t }}
        </p>
        <p class="text-subtitle2">
          {{ journeyEntry.desc }}
        </p>
      </div>
      <template v-for="(journey, i) in journeyEntry._journeys" :key="journey">
        <q-step
          :name="i"
          :title="journey.t"
          icon="settings"
          :done="step > i">
          <p class="">
            {{ journey.desc }}
          </p>
          <q-stepper-navigation>
            <q-btn v-if="i < journeyEntry._journeys.length - 1"
                   @click="stepAhead" color="primary" label="Continue"/>
            <q-btn v-else
                   @click="finishJourney" color="primary" label="Finish"/>
            <q-btn v-if="i > 0"
                   @click="stepBack" label="Back" unelevated/>
          </q-stepper-navigation>
        </q-step>
      </template>
    </template>
  </q-stepper>
</template>

<script>
import axios from 'axios'
import { useStore } from 'stores/wikistate'

export default {
  props: {
    storeId: {
      type: String,
      required: true
    },
    journey: {
      type: Object,
      required: true
    },
    active: {
      type: Boolean,
      required: true
    }
  },
  name: 'StoreJourneyStepper',
  emits: ['search'],
  mounted () {
    if (this.journey) {
      this.journeyEntry = this.journey
      this.discoverJourney(this.journeyEntry)
    }
  },
  data () {
    return {
      store: useStore(),
      step: 0,
      journeyEntry: null
    }
  },
  methods: {
    discoverJourney: function (journey) {
      return new Promise((resolve) => {
        axios.get(
          `${this.store.serverIP}stores/public/journey/discover/${journey.uid}`)
        .then((response) => {
          if (response.data.journeys == null) {
            return
          }
          journey._journeys = response.data.journeys.slice(1)
          let elem
          for (let i = 0; i < journey._journeys.length; i++) {
            elem = journey._journeys[i]
            if (elem.cats == null) {
              elem.cats = []
            }
            if (i === 0) {
              this.$emit('search', elem)
            }
            journey._journeys[i] = elem
          }
        }).catch((e) => {
          console.debug(e.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    stepAhead: function () {
      this.step += 1
      this.searchItems()
    },
    stepBack: function () {
      this.step -= 1
      this.searchItems()
    },
    finishJourney: function () {
      this.step += 1
      this.$router.push('/checkout')
    },
    searchItems: function () {
      if (!this.journeyEntry || !this.journeyEntry._journeys) {
        return
      }
      if (this.step < 0 || this.step > this.journeyEntry._journeys.length - 1) {
        return
      }
      this.$emit('search', this.journeyEntry._journeys[this.step])
    }
  }
}
</script>

<style>
.q-stepper__title {
  color: var(--md-sys-color-on-surface) !important;
  font-weight: 800 !important;
  font-size: 1rem !important;
}
</style>
