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
          <div class="flex gap-2">
            <div class="flex column items-center justify-center p4
                        flex-grow">
              <div class="grid wfull gap-4
                        grid-cols-1
                        sm:grid-cols-2
                        limit-screen">
                <q-item clickable
                        @click="newConfig"
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
                <q-expansion-item class="wfull limit-screen mt4" default-opened>
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
                <div class="wfull limit-screen mt4">
                  <p class="text-h5 ml4">
                    Get Started
                  </p>
                </div>
                <div class="grid wfull gap-4 mt4
                          grid-cols-1 px4
                          sm:grid-cols-2
                          limit-screen">
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
                      easy to understand data.
                    </p>
                  </div>
                  <div class="wfull px4 pt3 pb4 rounded
                            surface-variant">
                    <p class="text-body1 mb2 fontbold">
                      &lt;&lt;&lt;&nbsp;&nbsp;Getting Started
                    </p>
                    <p class="text-subtitle2 opacity-80">
                      Create configurations by clicking on "New Config" or
                      send requests directly with "Quickie".
                    </p>
                    <p class="text-body1 my2 fontbold">
                      &lt;&lt;&lt;&nbsp;&nbsp;Outgoing
                    </p>
                    <p class="text-subtitle2 opacity-80">
                      "Quickie" requests or configuration tests are considered
                      outgoing requests, as you send them yourself.
                      <br>Outgoing requests can be used to e.g. test the
                      availability and response time of your own endpoints,
                      whether they are Mockingbird test endpoints or ones of
                      your own server's API.
                    </p>
                    <p class="text-body1 my2 fontbold">
                      &lt;&lt;&lt;&nbsp;&nbsp;Incoming
                    </p>
                    <p class="text-subtitle2 opacity-80">
                      Requests made on endpoints created with the Mockingbird
                      are considered incoming requests as the endpoints are
                      available publicly and can receive requests by anybody.
                      <br>You will receive Mock Analytics for those requests
                      so you can analyze what you or others are sending and
                      receiving.
                    </p>
                  </div>
                </div>
              </template>
              <template v-else>
                <q-expansion-item class="wfull limit-screen mt4" default-opened>
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
                <q-expansion-item class="wfull limit-screen mt4" default-opened>
                  <template v-slot:header>
                    <p class="text-h5 wfull on-surface-text">
                      Mock Analysis - {{ mocks.length }}
                    </p>
                  </template>
                  <q-card class="background">
                    <q-card-section>
                      <div class="fmt_border rounded-2 p1 my2">
                        <canvas id="mock_call_chart"></canvas>
                      </div>
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
                          <q-expansion-item class="wfull limit-screen mt4
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
                          <q-expansion-item class="wfull limit-screen mt4
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
            <div class="p4 flex column gap-2">
              <div class="fmt_border rounded-2 p1">
                <canvas id="mock_method_chart"></canvas>
              </div>
              <div class="fmt_border rounded-2 p1">
                <canvas id="mock_endpoint_chart"></canvas>
              </div>
            </div>
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
                      @subconfig="handleSubmitConfig"
                      @delconfig="handleDeleteConfig"/>
  <q-dialog v-model="isShowingData">
    <div class="p4 wfull surface">
      <p class="text-body2 fontbold mb2">
        Response Payload:
      </p>
      <div class="mt4 p2 rounded-2 fmt_border">
        <p>
          {{ data }}
        </p>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import QuickieConfigAdder from 'components/mockingbird/QuickieConfigAdder.vue'
import { api } from 'boot/axios'
import axios from 'axios'
import MockConfigEditor from 'components/mockingbird/MockConfigEditor.vue'
import wikiricUtils from 'src/libs/wikiric-utils'
import Chart from 'chart.js/auto'
import { toRaw } from 'vue'

export default {
  name: 'PageTemplate',
  components: {
    MockConfigEditor,
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
  mounted () {
    this.initializeGraph()
    this.graphLoop()
  },
  data () {
    /**
     * @type {Chart}
     */
    this.graphMethods = null
    /**
     * @type {Chart}
     */
    this.graphEndpoints = null
    /**
     * @type {Chart}
     */
    this.graphCalls = null
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
      editingConfig: null,
      graphCallsInitialized: false,
      graphData: {
        methods: [],
        endpoints: [],
        requestsQueue: new Map(),
        endpointIx: new Map(),
        callsIteration: 0
      }
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
      this.data = resp.data
      this.isShowingData = true
    },
    getConfigs: async function () {
      this.configs = []
      const response = await api({
        url: 'mockingbird/private/configs'
      }).catch((e) => {
        console.debug(e.message)
      })
      if (response == null || response.data == null) return
      this.configs = response.data.configs
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
          }).catch((e) => {
            this.handleWebError(e, now)
          })
          break
        case 'POST':
          axios.post(url, payload).then((response) => {
            this.handleWebResponse(response, now)
          }).catch((e) => {
            this.handleWebError(e, now)
          })
          break
        case 'PUT':
          axios.put(url, payload).then((response) => {
            this.handleWebResponse(response, now)
          }).catch((e) => {
            this.handleWebError(e, now)
          })
          break
        case 'DELETE':
          axios.delete(url).then((response) => {
            this.handleWebResponse(response, now)
          }).catch((e) => {
            this.handleWebError(e, now)
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
      this.responses.unshift(response)
    },
    handleWebError: function (errorResponse, timestamp) {
      const time = performance.now() - timestamp
      const response = errorResponse.response
      response._time = time.toFixed(2)
      if (response.data && typeof response.data === 'object') {
        response.data = JSON.stringify(response.data)
      }
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
      if (!msg) return
      const resp = JSON.parse(msg.msg)
      if (!resp || !resp.endpoint) return
      // Save analytics
      this.mocks.unshift(resp)
      // Count methods
      this.addRequestMethod(resp)
      // Count endpoints
      this.graphData.endpoints = this.addRequestEndpoint(
        this.graphData.endpoints,
        resp,
        true)
      // Add endpoint to queue for time tracking calls
      if (this.graphData.requestsQueue.has(resp.endpoint)) {
        let tmp = this.graphData.requestsQueue.get(resp.endpoint)
        tmp += 1
        this.graphData.requestsQueue.set(resp.endpoint, tmp)
      } else {
        this.graphData.requestsQueue.set(resp.endpoint, 1)
      }
      if (!this.graphCallsInitialized) {
        this.graphCallsInitialized = true
        setTimeout(() => {
          this.initializeCallsGraph()
          this.startRecording()
        }, 1_000)
      }
    },
    addRequestMethod: function (resp) {
      // Add if array is empty
      if (this.graphData.methods.length < 1) {
        this.graphData.methods.push({
          method: resp.reqMethod,
          amount: 1
        })
        return
      }
      // Try to find method in array
      for (let i = 0; i < this.graphData.methods.length; i++) {
        if (this.graphData.methods[i].method === resp.reqMethod) {
          this.graphData.methods[i].amount += 1
          return
        }
      }
      // Add if it does not exist yet
      this.graphData.methods.push({
        method: resp.reqMethod,
        amount: 1
      })
    },
    /**
     *
     * @param {Array} arr
     * @param resp
     * @param setIx
     * @return {Array}
     */
    addRequestEndpoint: function (arr, resp) {
      // Add if array is empty
      if (arr.length < 1) {
        arr.push({
          endpoint: resp.endpoint,
          amount: 1
        })
        return arr
      }
      // Try to find method in array
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].endpoint === resp.endpoint) {
          arr[i].amount += 1
          return arr
        }
      }
      // Add if it does not exist yet
      arr.push({
        endpoint: resp.endpoint,
        amount: 1
      })
      return arr
    },
    handleSubmitConfig: function (config) {
      if (!config) {
        return
      }
      // Sanitize payload
      if (config.response) {
        config.response = wikiricUtils.htmlToString(config.response)
      }
      if (config.uid) {
        this.submitConfigEdit(config)
      } else {
        this.submitConfigCreation(config)
      }
    },
    submitConfigEdit: function (config) {
      api({
        method: 'POST',
        url: `mockingbird/private/edit/${config.uid}`,
        data: config
      }).then(() => {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Config Edited',
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
        this.getConfigs()
      }).catch((e) => {
        console.debug(e.message)
      })
    },
    submitConfigCreation: function (config) {
      api({
        method: 'POST',
        url: 'mockingbird/private/config',
        data: config
      }).then(() => {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Config Submitted',
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
        this.getConfigs()
      }).catch((e) => {
        console.debug(e.message)
      })
    },
    handleDeleteConfig: function (config) {
      if (!config) {
        return
      }
      api({
        url: `mockingbird/private/delete/${config.uid}`
      }).then(() => {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Config Deleted',
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
        this.getConfigs()
      }).catch((e) => {
        console.debug(e.message)
      })
    },
    newConfig: function () {
      this.editingConfig = null
      this.isShowingEditor = !this.isShowingEditor
    },
    initializeGraph: function () {
      const ctx = document.getElementById('mock_method_chart')
      this.graphMethods = new Chart(ctx, {
        type: 'polarArea',
        responsive: true,
        data: {
          datasets: [{
            labels: [],
            data: []
          }]
        },
        options: {
          plugins: {
            colors: {
              enabled: true,
              forceOverride: true
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
      const ctx2 = document.getElementById('mock_endpoint_chart')
      this.graphEndpoints = new Chart(ctx2, {
        type: 'polarArea',
        data: {
          datasets: [{
            labels: [],
            data: []
          }]
        },
        options: {
          responsive: true,
          plugins: {
            colors: {
              enabled: true,
              forceOverride: true
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    },
    initializeCallsGraph: function () {
      const ctx = document.getElementById('mock_call_chart')
      this.graphCalls = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: []
        },
        options: {
          animation: false,
          responsive: true,
          plugins: {
            tooltip: {
              intersect: false
            },
            colors: {
              enabled: true,
              forceOverride: true
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    },
    graphLoop: function () {
      if (this.graphMethods) {
        this.graphMethods.data.datasets[0].label = 'Requests'
        this.graphMethods.data.labels =
          this.graphData.methods.map((val) => val.method)
        this.graphMethods.data.datasets[0].data =
          this.graphData.methods.map((val) => val.amount)
        this.graphMethods.update()
      }
      if (this.graphEndpoints) {
        this.graphEndpoints.data.datasets[0].label = 'Requests'
        this.graphEndpoints.data.labels =
          this.graphData.endpoints.map((val) => val.endpoint)
        this.graphEndpoints.data.datasets[0].data =
          this.graphData.endpoints.map((val) => val.amount)
        this.graphEndpoints.update()
      }
      setTimeout(() => {
        this.graphLoop()
      }, 2_000)
    },
    startRecording: function () {
      setTimeout(() => {
        // Increment counter to keep track of what endpoints where actually used
        this.graphData.callsIteration += 1
        // Get current time and append it to the chart's labels
        const dateTmp = new Date()
        const dateTs = dateTmp.toLocaleTimeString('de-DE')
        this.graphCalls.data.labels.push(dateTs)
        // Are there new requests?
        this.processNewRequests(dateTs)
        // Now append empty values for all unused endpoints
        this.processUnusedRequests(dateTs)
        // Update charts
        this.graphCalls.update()
        // Recursive call
        this.startRecording()
      }, 1000)
    },
    processNewRequests: function (dateTs) {
      if (this.graphData.requestsQueue.size > 0) {
        this.graphData.requestsQueue.forEach((val, key) => {
          if (key) {
            // Do we know this dataset?
            if (this.graphData.endpointIx.has(key)) {
              // Update dataset index
              const index = this.graphData.endpointIx.get(key)
              index.d.push({
                ts: dateTs,
                count: val
              })
              index.c = this.graphData.callsIteration
              // Modify existing dataset
              this.graphCalls.data.datasets[index.i] =
                this.getChartData(index.d, key)
            } else {
              // Add new dataset to index
              // First, we need to add empty values to reach the current time
              const newData = []
              for (let i = 0; i < this.graphData.callsIteration; i++) {
                newData.push({
                  ts: dateTs,
                  count: 0
                })
              }
              // Now append actual data
              newData.push({
                ts: dateTs,
                count: val
              })
              this.graphData.endpointIx.set(key, {
                i: this.graphData.endpointIx.size,
                d: newData,
                c: this.graphData.callsIteration
              })
              // Append new dataset
              this.graphCalls.data.datasets.push(
                this.getChartData(newData, key))
            }
          }
        })
        // Reset queue
        this.graphData.requestsQueue = new Map()
      }
    },
    processUnusedRequests: function (dateTs) {
      this.graphData.endpointIx.forEach((val, key) => {
        if (val.c !== this.graphData.callsIteration) {
          // Update dataset index with empty value
          const index = this.graphData.endpointIx.get(key)
          index.d.push({
            ts: dateTs,
            count: 0
          })
          index.c = this.graphData.callsIteration
          // Modify existing dataset
          this.graphCalls.data.datasets[index.i] =
            this.getChartData(index.d, key)
        }
      })
    },
    getChartData: function (data, label) {
      const chartData = toRaw(data)
      return {
        label,
        data: chartData.map(row => row.count),
        fill: true
      }
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

.limit-screen {
  max-width: 64rem;
}

</style>
