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
          <div class="wfull flex column items-center justify-center p4">
            <div class="grid wfull gap-4
                        grid-cols-1
                        sm:grid-cols-2
                        max-w-4xl">
              <q-item clickable
                      class="surface rounded p4">
                <q-item-label>
                  <div class="flex items-center gap-2
                                p2 mb2 background rounded">
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
              <q-item clickable
                      ref="openQuickie"
                      @click="openQuickie"
                      class="surface rounded p4">
                <q-item-label>
                  <div class="flex items-center gap-2
                                p2 mb2 background rounded">
                    <q-icon name="sym_o_travel_explore" size="1.4rem"/>
                    <div>
                      <p class="fontbold text-body1">
                        Quickie
                      </p>
                    </div>
                  </div>
                  <p class="text-subtitle2">
                    Quick GET or POST to a specific URL.
                  </p>
                </q-item-label>
              </q-item>
            </div>
            <template v-if="configs && configs.length > 0">
              <q-expansion-item class="wfull max-w-4xl mt4" default-opened>
                <template v-slot:header>
                  <p class="text-h5 wfull on-surface-text">
                    Configs - {{ configs.length }}
                  </p>
                </template>
                <q-card class="background">
                  <q-card-section>
                    <q-input ref="mock_config_query_input"
                             dense
                             type="search"
                             label="Filter"
                             v-model="configQuery"
                             text-color="brand-p"
                             label-color="brand-p">
                      <template v-slot:prepend>
                        <q-icon name="search"/>
                      </template>
                    </q-input>
                    <template v-for="config in configs" :key="config">
                      <div class="surface rounded p2 mt2"
                           v-if="validateConfigQuery(config)">
                        <div class="flex items-center gap-x-4 gap-y-1
                                    mb2 fmt_border_bottom">
                          <p class="fontbold surface-variant rounded
                                    px1 py0.5 text-body2">
                            {{ config.reqMethod }}
                          </p>
                          <p>
                            /{{ config.usr }}-<span class="fontbold">
                          {{ config.endpoint }}</span>
                          </p>
                          <p class="text-subtitle2">
                            {{ config.reqContentType }}
                          </p>
                          <q-btn dense label="Test" class="mlauto"
                                 icon="sym_o_public" flat
                                 @click="sendWebRequest(config)"/>
                          <q-btn dense label="Edit"
                                 icon="sym_o_edit" flat
                                 @click="editConfig(config)"/>
                        </div>
                        <div class="flex items-end gap-2">
                          <p class="text-subtitle2 fontbold">
                            {{ config.t }}
                          </p>
                          <p class="text-subtitle2">
                            {{ config.desc }}
                          </p>
                        </div>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </template>
            <template v-if="isHomescreen">
              <div class="wfull max-w-4xl mt4">
                <p class="text-h5 ml4">
                  Get Started
                </p>
              </div>
              <div class="grid wfull gap-4
                          grid-cols-1 px4
                          sm:grid-cols-2
                          max-w-4xl">
                <div class="wfull px4 pt3 pb4 rounded
                            surface-variant">
                  <p class="text-body1 mb2 fontbold">
                    &lt;&lt;&lt;&nbsp;&nbsp;Mockingbird
                  </p>
                  <p class="text-subtitle2 opacity-80">
                    With the Mockingbird API testing tool, it is easy to
                    analyse incoming and outgoing traffic of your servers.
                  </p>
                  <p class="text-body1 my2 fontbold">
                    &lt;&lt;&lt;&nbsp;&nbsp;Easy
                  </p>
                  <p class="text-subtitle2 opacity-80">
                    Different sets of tests can be organized by creating
                    individual configurations, making them reusable.
                  </p>
                  <p class="text-body1 my2 fontbold">
                    &lt;&lt;&lt;&nbsp;&nbsp;Readable
                  </p>
                  <p class="text-subtitle2 opacity-80">
                    Results are displayed with great detail and include
                    easy to understand graphs.
                  </p>
                </div>
              </div>
            </template>
            <template v-else>
              <q-expansion-item class="wfull max-w-4xl mt4" default-opened>
                <template v-slot:header>
                  <p class="text-h5 wfull on-surface-text">
                    Responses - {{ responses.length }}
                  </p>
                </template>
                <q-card class="background">
                  <q-card-section>
                    <q-input ref="mock_resp_query_input"
                             dense
                             type="search"
                             label="Filter"
                             v-model="respQuery"
                             text-color="brand-p"
                             label-color="brand-p"
                             class="p1 mb2">
                      <template v-slot:prepend>
                        <q-icon name="search"/>
                      </template>
                    </q-input>
                    <table class="wfull p1">
                      <tr class="wfull theader">
                        <th>#</th>
                        <th>Method</th>
                        <th>Target</th>
                        <th>Status</th>
                        <th>Time</th>
                        <th>Data</th>
                      </tr>
                      <template v-for="(resp, i) in responses" :key="resp">
                        <tr class="wfull surface trow mb1"
                            v-if="validateRespQuery(resp)">
                          <td>{{ responses.length - i }}</td>
                          <td class="fontbold">
                            {{ resp.config.method.toUpperCase() }}
                          </td>
                          <td>{{ resp.config.url }}</td>
                          <td>
                            <div class="fontbold flex items-center gap-2">
                              <template v-if="resp.status < 400">
                                <div class="w3 h3 rounded-full bg-green"/>
                              </template>
                              <template v-else>
                                <div class="w3 h3 rounded-full bg-red"/>
                              </template>
                              {{ resp.status }}
                            </div>
                          </td>
                          <td>
                            <div class="flex items-center gap-2">
                              <template v-if="resp._time < 100">
                                <q-icon name="electric_bolt">
                                  <q-tooltip class="fontbold text-subtitle2">
                                    Fast Response
                                  </q-tooltip>
                                </q-icon>
                              </template>
                              <template v-else>
                                <q-icon name="speed">
                                  <q-tooltip class="fontbold text-subtitle2">
                                    Slow Response
                                  </q-tooltip>
                                </q-icon>
                              </template>
                              {{ resp._time }} ms
                            </div>
                          </td>
                          <td>
                            <q-btn icon="sym_o_file_open" flat no-caps
                                   class="wfit"
                                   @click="showData(resp)"/>
                          </td>
                        </tr>
                      </template>
                    </table>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
            </template>
            <template v-if="mocks.length > 0">
              <q-expansion-item class="wfull max-w-4xl mt4" default-opened>
                <template v-slot:header>
                  <p class="text-h5 wfull on-surface-text">
                    Mock Analysis - {{ mocks.length }}
                  </p>
                </template>
                <q-card class="background">
                  <q-card-section>
                    <q-input ref="mock_ana_query_input"
                             dense
                             type="search"
                             label="Filter"
                             v-model="mockAnaQuery"
                             text-color="brand-p"
                             label-color="brand-p"
                             class="p1">
                      <template v-slot:prepend>
                        <q-icon name="search"/>
                      </template>
                    </q-input>
                    <template v-for="mock in mocks" :key="mock">
                      <div class="surface rounded-2 p2 mt2"
                           v-if="validateAnaQuery(mock)">
                        <div class="flex items-center gap-x-4 gap-y-1
                                    mb2 fmt_border_bottom pb1">
                          <p class="fontbold surface-variant rounded
                                    px1 py0.5 text-body2">
                            {{ mock.reqMethod }}
                          </p>
                          <p class="fontbold">
                            /{{ mock.endpoint }}
                          </p>
                          <p class="text-subtitle2">
                            {{ mock.reqContentType }}
                          </p>
                          <p class="mlauto text-subtitle2">
                            {{ mock.ts }}
                          </p>
                        </div>
                        <q-expansion-item class="wfull max-w-4xl mt4
                                                 background">
                          <template v-slot:header>
                            <p class="text-body1 wfull on-surface-text flex items-center">
                              Request Data
                            </p>
                          </template>
                          <q-card class="surface">
                            <q-card-section>
                              <template v-if="mock.authUser">
                                <p class="text-body2">
                                  Authorization:
                                </p>
                                <table>
                                  <tr>
                                    <td>Type</td>
                                    <td>User</td>
                                    <td>Pass</td>
                                  </tr>
                                  <tr>
                                    <td>{{ mock.authType }}</td>
                                    <td>{{ mock.authUser }}</td>
                                    <td>{{ mock.authPass }}</td>
                                  </tr>
                                </table>
                              </template>
                              <template v-if="mock.request">
                                <p class="text-body2 my2 fontbold">
                                  Payload:
                                </p>
                                <div class="fmt_border rounded-2 wfull p2 mt2">
                                  <p>
                                    {{ mock.request }}
                                  </p>
                                </div>
                              </template>
                              <table class="wfull gap-x-2 text-subtitle2 my2">
                                <tr class="wfull">
                                  <td class="fontbold fmt_border_bottom">Header</td>
                                  <td class="fontbold fmt_border_bottom">Value</td>
                                </tr>
                                <template v-for="header in mock.reqHeaders" :key="header">
                                  <tr class="wfull">
                                    <td class="w-1/3">{{ header.t }}:</td>
                                    <td class="break-words">{{ header.val }}</td>
                                  </tr>
                                </template>
                              </table>
                            </q-card-section>
                          </q-card>
                        </q-expansion-item>
                        <q-expansion-item class="wfull max-w-4xl mt4
                                                 background">
                          <template v-slot:header>
                            <p class="text-body1 wfull on-surface-text flex items-center">
                              Response Data
                            </p>
                          </template>
                          <q-card class="surface">
                            <q-card-section>
                              <p class="text-body2 fontbold">
                                Payload: ({{ mock.respType }})
                              </p>
                              <div class="fmt_border rounded-2 wfull p2 mt2">
                                <p>
                                  {{ mock.response }}
                                </p>
                              </div>
                            </q-card-section>
                          </q-card>
                        </q-expansion-item>
                      </div>
                    </template>
                  </q-card-section>
                </q-card>
              </q-expansion-item>
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
  <quickie-config-adder :is-open="isViewingQuickie"
                        @close="handleClose"
                        @response="handleResponse"/>
  <mock-config-editor :is-open="isShowingEditor"
                      :config="editingConfig"
                      @subconfig="handleSubmitConfig"/>
  <q-dialog v-model="isShowingData">
    <editor id="resp_data"
            ref="resp_data"
            e-id="resp_data_edit"
            hide-menu
            v-model="data"/>
  </q-dialog>
</template>

<script>
import QuickieConfigAdder from 'components/mockingbird/QuickieConfigAdder.vue'
import Editor from 'components/EditorComponent.vue'
import { api } from 'boot/axios'
import axios from 'axios'
import MockConfigEditor from 'components/mockingbird/MockConfigEditor.vue'

export default {
  name: 'PageTemplate',
  components: {
    MockConfigEditor,
    Editor,
    QuickieConfigAdder
  },
  created () {
    this.getConfigs()
    // Listen for backend messages
    const connector = new BroadcastChannel('wikiric_connector')
    connector.onmessage = event => {
      this.handleIncomingConnectorMessages(event.data)
    }
  },
  data () {
    return {
      fab: false,
      sidebarLeft: false,
      isHomescreen: true,
      isViewingQuickie: false,
      tmp: false,
      responses: [],
      mocks: [],
      configs: [],
      data: null,
      isShowingData: false,
      configQuery: '',
      respQuery: '',
      mockAnaQuery: '',
      isShowingEditor: false,
      isEditing: false,
      editingConfig: {}
    }
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    openQuickie: function () {
      if (this.tmp) return
      this.isViewingQuickie = true
      this.tmp = true
    },
    handleClose: function () {
      window.blur()
      this.isViewingQuickie = false
      setTimeout(() => {
        this.tmp = false
      }, 200)
    },
    handleResponse: function (response) {
      this.isHomescreen = false
      this.responses.unshift(response)
    },
    showData: function (resp) {
      console.log(resp)
      this.data = resp.data
      this.isShowingData = true
    },
    getConfigs: async function () {
      const response = await api({
        url: 'mockingbird/private/configs'
      }).catch((e) => {
        console.debug(e.message)
      })
      if (response == null || response.data == null) return
      this.configs = response.data.configs
      console.log(this.configs)
    },
    sendWebRequest: function (config) {
      this.isHomescreen = false
      const url = `https://wikiric.xyz/mock/u/${config.usr}-${config.endpoint}`
      let payload = {
        sample: 'request'
      }
      if (config.reqMethod === 'POST' || config.reqMethod === 'PUT') {
        payload = JSON.stringify(payload)
      }
      const now = performance.now()
      switch (config.reqMethod) {
        case 'GET':
          axios.get(url).then((response) => {
            this.handleWebResponse(response, now)
          })
          break
        case 'POST':
          axios.post(url, payload).then((response) => {
            this.handleWebResponse(response, now)
          })
          break
        case 'PUT':
          axios.put(url, payload).then((response) => {
            this.handleWebResponse(response, now)
          })
          break
        case 'DELETE':
          axios.delete(url).then((response) => {
            this.handleWebResponse(response, now)
          })
          break
      }
    },
    handleWebResponse: function (response, timestamp) {
      const time = performance.now() - timestamp
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Request Sent',
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
      response._time = time.toFixed(2)
      if (response.data && typeof response.data === 'object') {
        response.data = JSON.stringify(response.data)
      }
      console.log(response)
      this.responses.unshift(response)
    },
    editConfig: function (config) {
      this.editingConfig = config
      this.isEditing = true
      this.isShowingEditor = !this.isShowingEditor
    },
    validateConfigQuery: function (config) {
      if (this.configQuery.trim() === '') {
        return true
      }
      const query = this.configQuery.toLowerCase()
      if (config.endpoint.toLowerCase().includes(query)) {
        return true
      } else if (config.t.toLowerCase().includes(query)) {
        return true
      } else if (config.desc.toLowerCase().includes(query)) {
        return true
      } else if (config.reqMethod.toLowerCase().includes(query)) {
        return true
      }
      return false
    },
    validateRespQuery: function (resp) {
      if (this.respQuery.trim() === '') {
        return true
      }
      const query = this.respQuery.toLowerCase()
      if (resp.config.url.toLowerCase().includes(query)) {
        return true
      } else if (resp.status.toString().includes(query)) {
        return true
      } else if (resp.config.method.includes(query)) {
        return true
      }
      return false
    },
    validateAnaQuery: function (mock) {
      if (this.mockAnaQuery.trim() === '') {
        return true
      }
      const query = this.mockAnaQuery.toLowerCase()
      if (mock.endpoint.toLowerCase().includes(query)) {
        return true
      }
      return false
    },
    handleIncomingConnectorMessages: function (msg) {
      if (!msg) return
      if (msg.typ === '[s:MOCKINGBIRD]') {
        if (msg.act === 'inc_request') {
          this.handleRequestAnalysis(msg)
        }
      }
    },
    handleRequestAnalysis: function (msg) {
      const resp = JSON.parse(msg.msg)
      this.mocks.unshift(resp)
      console.log(resp)
    },
    handleSubmitConfig: function (config) {
      if (!config) {
        return
      }
      if (config.uid) {
        this.submitConfigEdit(config)
      } else {
        this.submitConfigCreation(config)
      }
    },
    submitConfigEdit: function (config) {
    },
    submitConfigCreation: function (config) {
    }
  }
}
</script>

<style scoped>

.theader th {
  text-align: start;
  padding-bottom: 0.4rem;
}

.trow td {
  padding: 0.4rem 0.8rem 0.4rem 0.8rem;
  font-size: 1rem;
}

</style>
