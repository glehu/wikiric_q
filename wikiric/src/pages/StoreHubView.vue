<template>
  <q-page class="full-height full-width flex items-center justify-center">
    <q-layout
      view="lhh LpR lff"
      container
      style="height: calc(100dvh - 52px)"
      class="overflow-hidden no-scroll">
      <q-drawer
        side="left"
        v-model="sidebarLeft"
        show-if-above
        :width="300"
        :breakpoint="768"
        class="surface-variant hfit">
        <q-scroll-area class="fit">
          <q-toolbar class="fmt_border_bottom md:hidden">
            <q-btn flat dense icon="sym_o_left_panel_close"
                   align="left" class="wfull"
                   no-caps label="Hide Sidebar"
                   @click="sidebarLeft = !sidebarLeft">
            </q-btn>
          </q-toolbar>
          <q-btn flat icon="sym_o_arrow_left_alt"
                 align="left" class="wfull pl4 mt2"
                 no-caps
                 @click="clickedBack">
            <span class="ml4 text-body1">Back</span>
          </q-btn>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page style="padding-top: 60px" class="background pb20">
          <q-page-sticky position="top" expand
                         class="background z-fab">
            <q-toolbar>
              <q-btn flat round dense icon="sym_o_dock_to_right"
                     @click="sidebarLeft = !sidebarLeft">
                <q-tooltip class="text-body2">
                  Toggle&nbsp;Sidebar
                </q-tooltip>
              </q-btn>
              <q-toolbar-title class="text-subtitle1">
                <q-breadcrumbs active-color="brand-p">
                  <q-breadcrumbs-el label="Store Hub"/>
                </q-breadcrumbs>
              </q-toolbar-title>
            </q-toolbar>
          </q-page-sticky>
          <q-btn flat
                 icon="sym_o_arrow_left_alt"
                 label="Back"
                 class="md:hidden fmt_border ml4 mb3 rounded-2
                        surface-variant"
                 @click="clickedBack">
          </q-btn>
          <div class="p4">
            <template v-if="ownStore">
              <div class="rounded-2 p2 surface">
                <div class="flex gap-4">
                  <div class="relative w-40 h-40">
                    <template v-if="ownStore.iurl">
                      <q-img :src="getImg(ownStore.iurl, true)" alt="Store"
                             fit="cover" class="hfull wfull relative rounded"/>
                    </template>
                  </div>
                  <div>
                    <p class="text-3xl <sm:text-[5vw] fontbold">
                      {{ ownStore.t }}
                    </p>
                    <p class="text-subtitle2">
                      {{ ownStore.desc }}
                    </p>
                    <q-btn label="View Store" flat
                           icon="search"
                           class="fmt_border rounded mt4"
                           @click="viewStore(ownStore)"/>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-fab
              v-model="fab"
              label=""
              vertical-actions-align="right"
              color="primary"
              icon="menu"
              direction="up">
              <q-fab-action color="primary" icon="add" label="FabAction" label-position="left"/>
            </q-fab>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import { useStore } from 'stores/wikistate'

export default {
  name: 'StoreHubView',
  data () {
    return {
      store: useStore(),
      fab: false,
      sidebarLeft: false,
      ownStore: null
    }
  },
  created () {
    this.getOwnStore()
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    getOwnStore: async function () {
      return new Promise((resolve) => {
        api({
          url: 'stores/private/get'
        }).then((response) => {
          this.ownStore = response.data
        }).catch((e) => {
          console.debug(e.message)
        }).then(() => {
          resolve()
        })
      })
    },
    getImg: function (imgGUID, get = false) {
      if (imgGUID == null || imgGUID === '') {
        return ''
      } else {
        let ret = imgGUID
        if (get) ret = this.store.serverIP + imgGUID
        return ret
      }
    },
    viewStore: function (store) {
      this.$router.push(`/shop?id=${store.uid}`)
    }
  }
}
</script>

<style scoped>

</style>
