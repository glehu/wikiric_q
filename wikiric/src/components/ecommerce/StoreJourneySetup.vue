<template>
  <q-dialog v-model="show" class="z-top" @before-hide="$emit('close')">
    <q-card class="surface p4" flat bordered>
      <p class="fontbold text-h5">
        Store Journeys
      </p>
      <p class="text-subtitle2">
        Easily guide your customers through the different steps it may take
        to configure the best basket possible!
      </p>
      <hr>
      <div class="mb4">
        <div v-if="!isCreatingJourney"
             class="flex gap-2">
          <q-btn label="Create Journey"
                 no-caps color="primary"
                 @click="startCreatingJourney"/>
          <q-btn v-if="journeys.length > 0"
                 label="Index Offers"
                 no-caps
                 @click="createOfferIndex"/>
        </div>
        <div v-else>
          <div class="flex gap-2 mb2">
            <q-btn label="Cancel" no-caps
                   @click="cancelJourney"/>
            <q-btn v-if="expandingJourney == null"
                   label="Submit Journey"
                   no-caps color="primary"
                   @click="submitJourney"/>
            <q-btn v-else
                   label="Expand Journey"
                   no-caps color="primary"
                   @click="submitJourney"/>
          </div>
          <div class="fmt_border p1 rounded-lg">
            <q-input id="new_journey_title"
                     v-model="nj.t" autofocus label="Title"
                     input-class="fontbold"
                     filled
                     label-color="brand-p"/>
            <q-input v-model="nj.desc" autogrow label="Description"
                     input-class="fontbold"
                     filled
                     label-color="brand-p"/>
          </div>
        </div>
      </div>
      <div v-if="journeys.length > 0"
           class="my2">
        <div v-for="journey in journeys" :key="journey"
             class="px3 py2 rounded surface fmt_border mb6">
          <p class="font-900 text-body1">
            {{ journey.t }}
          </p>
          <p class="text-subtitle2">
            {{ journey.desc }}
          </p>
          <div class="p2">
            <div v-if="journey.next && journey.next !== ''">
              <template v-if="journey._journeys">
                <div v-for="(jny, count) in journey._journeys" :key="jny"
                     class="px3 py2 rounded surface fmt_border mt2"
                     style="border-left: 12px solid var(--md-sys-color-primary) !important;">
                  <p class="fontbold text-body1">
                    Chapter {{ count + 1 }}: {{ jny.t }}
                  </p>
                  <p class="text-subtitle2">
                    {{ jny.desc }}
                  </p>
                  <q-expansion-item class="overflow-hidden mt2"
                                    dense>
                    <template v-slot:header>
                      <div class="flex items-center justify-between wfull">
                        <p class="fontbold text-subtitle2">
                          <q-icon name="sym_o_edit" size="1.4rem" class="mr2"/>
                          Configuration
                        </p>
                      </div>
                    </template>
                    <div class="fmt_border p1 rounded-lg mt2">
                      <q-input id="new_journey_title"
                               v-model="jny.query" label="Query"
                               input-class="fontbold"
                               filled
                               label-color="brand-p"/>
                      <q-input id="new_journey_title"
                               v-model="jny.brand" label="Brand"
                               input-class="fontbold"
                               filled
                               label-color="brand-p"/>
                    </div>
                    <div>
                      <table class="table_start border-spacing-none
                                    text-subtitle2 mt2
                                    background rounded-2 wfull px2 pt2 pb6">
                        <thead>
                        <tr>
                          <th>Category (e.g. Clothing)</th>
                          <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <template v-for="(cat, i) in jny._cats" :key="cat">
                          <tr>
                            <td class="fontbold wfull">
                              <q-input v-model="cat.t" input-class="fontbold"/>
                            </td>
                            <td>
                              <div class="wfull hfull flex pt4
                                      items-center justify-end">
                                <q-btn icon="delete"
                                       class="px2 wfit" dense flat
                                       @click="jny._cats.splice(i,1)"/>
                              </div>
                            </td>
                          </tr>
                        </template>
                        <tr>
                          <td>
                            <div class="wfull hfull flex pt4
                                  items-center justify-start">
                              <q-btn label="Add Row" icon="add"
                                     class="surface px2" dense
                                     @click="jny._cats.push({t:''})"/>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        </tbody>
                      </table>
                    </div>
                    <div class="pb2">
                      <q-btn label="Save Configuration"
                             @click="saveJourney(jny)"
                             icon="save"
                             no-caps color="primary"/>
                    </div>
                  </q-expansion-item>
                  <div class="wfull flex justify-end">
                    <q-btn label="Delete" no-caps
                           icon="remove"
                           class="mt4"
                           @click="deleteJourney(jny)"/>
                    <q-btn v-if="count === journey._journeys.length - 1"
                           label="Expand Journey" no-caps
                           icon="add"
                           class="mt4"
                           @click="startExpandingJourney(jny)"/>
                  </div>
                </div>
              </template>
              <template v-else>
                <div class="wfull flex justify-end">
                  <q-btn label="View Details" no-caps
                         @click="discoverJourney(journey)"/>
                </div>
              </template>
            </div>
            <div v-else class="wfull flex justify-end">
              <q-btn label="Delete" no-caps unelevated
                     icon="remove"
                     @click="deleteJourney(journey)"/>
              <q-btn label="Expand Journey" no-caps
                     icon="add"
                     @click="startExpandingJourney(journey)"/>
            </div>
          </div>
        </div>
      </div>
      <template v-else>
        <div class="wfull text-center">
          <p class="text-subtitle2 italic">
            No journeys exist, yet!
          </p>
        </div>
      </template>
    </q-card>
  </q-dialog>
  <store-console :is-open="isViewingStoreConsole"
                 @close="isViewingStoreConsole = false"/>
</template>

<script>

import axios from 'axios'
import { api } from 'boot/axios'
import { useStore } from 'stores/wikistate'
import StoreConsole from 'components/ecommerce/StoreConsole.vue'

export default {
  components: { StoreConsole },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    storeId: {
      type: String,
      required: true
    }
  },
  name: 'StoreJourneySetup',
  emits: ['close'],
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (this.show) {
        this.handleDialogOpen()
      }
    }
  },
  data () {
    return {
      show: false,
      store: useStore(),
      journeys: [],
      isCreatingJourney: false,
      isViewingStoreConsole: false,
      expandingJourney: null,
      nj: {
        t: '',
        desc: ''
      }
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.getStoreJourneys()
    },
    getStoreJourneys: function () {
      return new Promise((resolve) => {
        axios.get(
          `${this.store.serverIP}stores/public/journey/get/${this.storeId}`)
        .then((response) => {
          if (response.data.journeys == null) {
            this.journeys = []
            return
          }
          this.journeys = response.data.journeys
        }).catch((e) => {
          console.debug(e.message)
        }).finally(() => {
          this.viewAllJourneys()
          resolve()
        })
      })
    },
    viewAllJourneys: function () {
      if (this.journeys.length < 1) {
        return
      }
      for (let i = 0; i < this.journeys.length; i++) {
        this.discoverJourney(this.journeys[i])
      }
    },
    submitJourney: function () {
      if (this.nj.t === '') {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Missing Title',
          caption: 'Please enter a title.',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {
              }
            }
          ]
        })
        return
      }
      if (this.nj.desc === '') {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Missing Description',
          caption: 'Please enter a description.',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {
              }
            }
          ]
        })
        return
      }
      if (this.expandingJourney !== null) {
        this.expandJourney()
        return
      }
      return new Promise((resolve) => {
        this.nj.pid = this.storeId
        api({
          method: 'post',
          url: `stores/private/journey/create/${this.storeId}`,
          data: this.nj
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Journey Created!',
            caption: '',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
          this.getStoreJourneys()
          this.nj = {
            t: '',
            desc: ''
          }
          this.isCreatingJourney = false
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Store.',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    createOfferIndex: function () {
      this.isViewingStoreConsole = true
      return new Promise((resolve) => {
        api({
          url: `stores/private/journey/index/${this.storeId}`
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Journey Deleted!',
            caption: '',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
          this.getStoreJourneys()
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Store.',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    startExpandingJourney: function (journey) {
      this.expandingJourney = journey
      this.isCreatingJourney = true
      setTimeout(() => {
        const elem = document.getElementById('new_journey_title')
        if (elem) {
          elem.focus()
          elem.select()
        }
      }, 100)
    },
    deleteJourney: function (journey) {
      return new Promise((resolve) => {
        api({
          url: `stores/private/journey/delete/${journey.uid}`
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Journey Deleted!',
            caption: '',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
          this.getStoreJourneys()
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Store.',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    expandJourney: function () {
      return new Promise((resolve) => {
        this.nj.pid = this.storeId
        api({
          method: 'post',
          url: `stores/private/journey/mod/${this.expandingJourney.uid}?modtype=link&dirtype=next`,
          data: this.nj
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Journey Created!',
            caption: '',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
          this.getStoreJourneys()
          this.nj = {
            t: '',
            desc: ''
          }
          this.isCreatingJourney = false
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Store.',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    cancelJourney: function () {
      this.isCreatingJourney = false
      this.expandingJourney = null
    },
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
              elem._cats = []
            } else {
              elem._cats = []
              for (let j = 0; j < elem.cats.length; j++) {
                elem._cats.push({
                  t: elem.cats[j]
                })
              }
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
    startCreatingJourney: function () {
      this.isCreatingJourney = true
      setTimeout(() => {
        const elem = document.getElementById('new_journey_title')
        if (elem) {
          elem.focus()
          elem.select()
        }
      }, 100)
    },
    saveJourney: function (journey) {
      if (journey._cats) {
        journey.cats = []
        for (let i = 0; i < journey._cats.length; i++) {
          journey.cats.push(journey._cats[i].t)
        }
      }
      const jny = { ...journey }
      delete jny._journeys
      delete jny._cats
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: `stores/private/journey/edit/${journey.uid}`,
          data: jny
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Journey Modified',
            caption: '',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
