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
                  <q-breadcrumbs-el label="API Mockingbird"/>
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
          <template v-if="isHomescreen">
            <div class="wfull flex items-center justify-center p4">
              <div class="grid wfull
                          grid-cols-1
                          sm:grid-cols-2">
                <q-item clickable
                        class="surface rounded p4">
                  <q-item-label>
                    <div class="flex items-center gap-2
                                px2 py1
                                mb2 background rounded">
                      <q-icon name="add" size="1.4rem"/>
                      <div>
                        <p class="fontbold text-body1">
                          New Config
                        </p>
                      </div>
                    </div>
                    <p class="text-subtitle2">
                      Create a new endpoint for HTTP requests.
                    </p>
                  </q-item-label>
                </q-item>
              </div>
            </div>
          </template>
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
export default {
  name: 'PageTemplate',
  data () {
    return {
      fab: false,
      sidebarLeft: false,
      isHomescreen: true
    }
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    }
  }
}
</script>

<style scoped>

</style>
