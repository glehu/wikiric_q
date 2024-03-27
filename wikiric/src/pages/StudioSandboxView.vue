<template>
  <q-page class="full-height full-width
                 flex items-center justify-center">
    <q-layout
      view="lhh LpR lff"
      container
      style="height: calc(100dvh - 52px)"
      class="overflow-hidden no-scroll">
      <q-drawer
        side="left"
        v-model="sidebarLeft"
        :width="300"
        class="surface-variant hfit">
        <q-scroll-area class="fit">
          <div ref="sidebar">
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
          </div>
        </q-scroll-area>
      </q-drawer>
      <q-page-container class="overflow-hidden">
        <q-page style="padding-top: 60px"
                class="background overflow-hidden">
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
                  <template v-if="chatroom">
                    <q-breadcrumbs-el :label="chatroom.t"/>
                  </template>
                  <q-breadcrumbs-el label="Studio"/>
                </q-breadcrumbs>
              </q-toolbar-title>
            </q-toolbar>
          </q-page-sticky>
          <div class="flex no-wrap items-center
                      h-10 gap-2 mx2 wfull
                      overflow-x-auto overflow-y-hidden">
            <q-btn flat
                   icon="sym_o_arrow_left_alt"
                   label="Back"
                   class="fmt_border_left fmt_border_top fmt_border_right
                          h-10 min-w-28
                          rounded-t-2 rounded-b-0
                          surface-variant"
                   @click="clickedBack">
            </q-btn>
            <div class="fmt_border_left fmt_border_top fmt_border_right
                        rounded-t-2 h-10
                        overflow-x-auto overflow-y-hidden
                        surface-variants
                        flex no-wrap items-center">
              <template v-if="noSandboxes">
                <q-btn icon="celebration" label="Get Started" no-caps
                       color="primary" class="h-10 min-w-40"
                       v-on:click="createSandbox"/>
                <p class="text-subtitle2 px4 text-no-wrap">
                  Nothing here, yet! Get started by creating a sandbox!
                </p>
              </template>
              <template v-else>
                <q-btn icon="sym_o_folder_open"
                       dense
                       no-caps
                       unelevated
                       class="h-10 px4">
                  <q-tooltip class="z-top text-subtitle2">
                    <p>Layouts</p>
                  </q-tooltip>
                  <q-menu ref="sandbox_open_menu"
                          class="z-top surface
                                 fmt_border rounded-t-0">
                    <div class="p2 flex column gap-2">
                      <q-btn icon="add" label="New Layout"
                             align="left"
                             no-caps
                             @click="createSandbox"/>
                      <q-input label="Filter"
                               v-model="sandboxFilter"
                               dense
                               color="brand-p"
                               class="px2 mb1">
                        <template v-slot:prepend>
                          <q-icon name="search"/>
                        </template>
                      </q-input>
                      <template v-for="layout in sandboxes"
                                :key="layout">
                        <template v-if="layout.uid && sandboxValid(layout)">
                          <q-item clickable dense
                                  @click="viewSandbox(layout)"
                                  class="flex items-center rounded
                                         background gap-2">
                            <q-icon name="sym_o_open_in_new_down"
                                    size="1.2rem"/>
                            <p class="text-subtitle2 fontbold">
                              {{ layout.t }}
                            </p>
                          </q-item>
                        </template>
                      </template>
                    </div>
                  </q-menu>
                </q-btn>
                <template v-if="currentSandbox">
                  <div class="fmt_border_left flex items-center">
                    <q-btn icon="sym_o_expand_more"
                           unelevated no-caps dense
                           :label="currentSandbox.t"
                           class="h-10 pl2 pr4"/>
                  </div>
                </template>
              </template>
            </div>
            <template v-if="currentSandbox">
              <div class="fmt_border_left fmt_border_top fmt_border_right
                          <lg:hidden
                          rounded-t-2 h-10
                          overflow-x-auto overflow-y-hidden
                          surface-variants
                          flex no-wrap items-center divide-solid">
                <div class="flex flex-row flex-grow no-wrap gap-4 px2">
                  <q-btn icon="sym_o_sticky_note"
                         label="Note"
                         unelevated no-caps dense
                         class="h-10"
                         @click="addElement('text')"/>
                  <q-btn icon="sym_o_school"
                         label="Knowledge"
                         unelevated no-caps dense
                         class="h-10"
                         @click="addElement('knowledge')"/>
                  <q-btn icon="sym_o_calendar_clock"
                         label="Calendar"
                         unelevated no-caps dense
                         class="h-10"
                         @click="addElement('calendar')"/>
                  <q-btn icon="sym_o_view_week"
                         label="Planner"
                         unelevated no-caps dense
                         class="h-10"
                         @click="addElement('planner')"/>
                </div>
              </div>
              <div class="fmt_border_left fmt_border_top fmt_border_right
                          lg:hidden
                          overflow-hidden h-10 rounded-t-2">
                <q-btn icon="add"
                       color="brand-bg"
                       text-color="brand-p"
                       class="h-10 rounded-b-0">
                  <q-tooltip class="z-top text-subtitle2">
                    <p>Add Element</p>
                  </q-tooltip>
                  <q-menu auto-close
                          class="z-top surface
                                 fmt_border rounded-t-0">
                    <div class="flex column gap-2 items-start">
                      <q-btn icon="sym_o_sticky_note"
                             label="Note"
                             align="left"
                             unelevated no-caps dense
                             class="wfull px2"
                             @click="addElement('text')"/>
                      <q-btn icon="sym_o_school"
                             label="Knowledge"
                             align="left"
                             unelevated no-caps dense
                             class="wfull px2"
                             @click="addElement('knowledge')"/>
                      <q-btn icon="sym_o_calendar_clock"
                             label="Calendar"
                             align="left"
                             unelevated no-caps dense
                             class="wfull px2"
                             @click="addElement('calendar')"/>
                      <q-btn icon="sym_o_view_week"
                             label="Planner"
                             align="left"
                             unelevated no-caps dense
                             class="wfull px2"
                             @click="addElement('planner')"/>
                    </div>
                  </q-menu>
                </q-btn>
              </div>
            </template>
          </div>
          <div ref="content_container"
               class="wfull h-[calc(100dvh-152px)] background
                      relative
                      overflow-auto fmt_border_top">
            <template v-if="isViewingHome">
              <div class="hfull wfull flex pb-[64px]
                          items-center justify-center">
                <div class="flex gap-x-2 gap-y-4 p4 fmt_border rounded-2">
                  <q-icon name="sym_o_dashboard_customize"
                          size="4.4rem"/>
                  <div class="fmt_border_left pl3">
                    <p class="text-h4 fontbold">
                      Studio
                    </p>
                    <p class="fontbold">Powered by wikiric</p>
                  </div>
                </div>
              </div>
            </template>
            <template v-else>
              <div ref="content"
                   class="w-[4000px] h-[4000px] absolute surface-variant">
                <template v-if="elements.size > 0">
                  <template v-for="[key, elem] in elements" :key="elem.uuid">
                    <div :id="key + '_div'"
                         class="absolute hover_field"
                         :style="{top: elem.y + 'px', left: elem.x + 'px'}">
                      <div class="w-full items-center justify-end absolute
                          hover_show_o flex gap-2 z-50 bottom-1 right-3">
                        <q-btn v-show="!elem.hide"
                               dense flat unelevated
                               icon="sym_o_collapse_content"
                               class="surface rounded-full
                                      fmt_button prevent-select"
                               @click="toggleElement(elem)">
                        </q-btn>
                        <q-btn v-show="elem.hide"
                               dense flat unelevated
                               icon="sym_o_expand_content"
                               class="surface rounded-full
                                      fmt_button prevent-select"
                               @click="toggleElement(elem)">
                        </q-btn>
                        <q-btn icon="sym_o_delete"
                               dense flat unelevated
                               class="surface rounded-full
                                      fmt_button prevent-select"
                               @click="deleteElement(elem)">
                        </q-btn>
                        <div :id="key + '_anchor'"
                             class="surface w-6 h-6 flex items-center
                                    justify-center rounded-full fmt_button
                                    cursor-move prevent-select"
                             style="font-family: Arial, sans-serif; text-shadow: none">
                          <q-icon name="sym_o_drag_pan" size="1.2rem"/>
                        </div>
                        <div v-show="!elem.hide"
                             :id="key + '_anchor_size'"
                             class="surface w-6 h-6 flex items-center
                                    justify-center rounded-full fmt_button
                                    cursor-nwse-resize prevent-select"
                             style="font-family: Arial, sans-serif; text-shadow: none">
                          <q-icon name="sym_o_open_in_full" size="1.2rem"/>
                        </div>
                      </div>
                      <div :id="elem.uuid + '_transition'"
                           class="surface fmt_border rounded
                                  p-0.5 relative overflow-hidden"
                           :style="{height: getDimension(elem.h, elem, 40) + 'px',
                                    width: getDimension(elem.w, elem, elem.w) + 'px',
                                    maxHeight: getDimension(elem.h, elem, 40) + 'px',
                                    maxWidth: getDimension(elem.w, elem, elem.w) + 'px'}">
                        <div v-show="!elem.hide" class="relative flex">
                          <template v-if="elem.type === 'text'">
                            <editor v-model="elem.desc" ref="ref_editor"
                                    :e-height="getDimension(elem.h, elem, 40) + 'px'"
                                    @autosave="updateElement(elem)"/>
                          </template>
                          <template v-else-if="elem.type === 'knowledge'">
                            <knowledge-view :chat-i-d="groupID"
                                            :e-height="getDimension(elem.h, elem, 40) + 'px'"/>
                          </template>
                          <template v-else-if="elem.type === 'calendar'">
                            <project-management :chat-i-d="groupID"/>
                          </template>
                          <template v-else-if="elem.type === 'planner'">
                            <planner-view :chat-i-d="groupID"
                                          :e-height="getDimension(elem.h, elem, 40) + 'px'"/>
                          </template>
                        </div>
                      </div>
                    </div>
                  </template>
                </template>
              </div>
            </template>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <new-studio :is-open="isCreatingSandbox"
              @create="submitSandbox"/>
</template>

<script>
import { api } from 'boot/axios'
import NewStudio from 'components/studio/NewStudio.vue'
import Editor from 'components/EditorComponent.vue'
import { dbGetData, dbSetData } from 'src/libs/wikistore'
import KnowledgeView from 'pages/KnowledgeView.vue'
import ProjectManagement from 'pages/ProjectManagement.vue'
import PlannerView from 'pages/PlannerView.vue'

export default {
  components: {
    PlannerView,
    ProjectManagement,
    KnowledgeView,
    Editor,
    NewStudio
  },
  props: {
    chatID: {
      type: String,
      default: ''
    }
  },
  name: 'StudioSandboxView',
  data () {
    return {
      gridSize: 128,
      width: 0,
      height: 0,
      sidebarLeft: false,
      groupID: null,
      chatroom: null,
      knowledge: null,
      knowledgeExists: true,
      noSandboxes: false,
      isViewingHome: true,
      isCreatingSandbox: false,
      currentSandboxID: null,
      currentSandbox: null,
      currentElemID: null,
      elements: new Map(),
      sandboxes: [],
      sandboxFilter: ''
    }
  },
  created () {
    if (this.chatID) {
      this.groupID = this.chatID
    } else {
      const paramID = this.$route.query.id
      if (paramID) this.groupID = paramID
    }
    this.initFunction()
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    initFunction: async function () {
      await this.getChatroom()
      await this.getKnowledge(this.groupID, true)
      await this.getSandboxes()
      // Open previously active layout
      const meta = await dbGetData(`studio_meta_${this.groupID}`)
      if (meta && meta.lastLayout) {
        this.currentSandbox = meta.lastLayout
        this.currentSandboxID = meta.lastLayout.uid
        await this.getElements()
        this.isViewingHome = false
      }
    },
    prepareDimensions: function () {
      this.width = 4000
      this.height = 4000
    },
    getChatroom: function () {
      if (!this.groupID) {
        this.chatroom = null
        return
      }
      return new Promise((resolve) => {
        api({
          url: `chat/private/get/${this.groupID}`
        }).then(async (response) => {
          this.chatroom = response.data
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    getKnowledge: async function (guid, fromChat = false) {
      if (!guid) return
      return new Promise((resolve) => {
        let url
        if (fromChat) {
          url = 'knowledge/private/chat/' + guid
        } else {
          url = 'knowledge/private/get/' + guid
        }
        api({
          url
        }).then((response) => {
          this.knowledgeExists = true
          this.knowledge = response.data
        })
        .catch((err) => {
          console.debug(err.message)
          this.knowledgeExists = false
        })
        .finally(() => {
          resolve()
        })
      })
    },
    getSandboxes: async function () {
      return new Promise((resolve) => {
        api({
          url: `sandbox/private/get/${this.knowledge.uid}`
        })
        .then(async (response) => {
          this.noSandboxes = false
          this.sandboxes = response.data.sandboxes
        })
        .catch((e) => {
          this.noSandboxes = true
          console.debug(e.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    createSandbox: function () {
      this.isCreatingSandbox = !this.isCreatingSandbox
      const elem = this.$refs.sandbox_open_menu
      if (elem) {
        elem.hide()
      }
    },
    submitSandbox: function (name) {
      if (!name || !this.knowledge || !this.knowledge.uid) return
      const payload = {
        t: name,
        pid: this.knowledge.uid
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'sandbox/private/create',
          data: payload
        })
        .then((response) => {
          this.currentSandbox = {
            t: name
          }
          this.currentSandboxID = response.data
          this.getSandboxes()
          this.getElements()
        })
        .catch((err) => console.debug(err.message))
        .finally(() => {
          resolve()
        })
      })
    },
    viewSandbox: async function (layout) {
      this.currentSandbox = layout
      this.currentSandboxID = layout.uid
      this.isViewingHome = false
      await this.getElements()
      const elem = this.$refs.sandbox_open_menu
      if (elem) {
        elem.hide()
      }
      // Remember studio metadata for this group
      const key = `studio_meta_${this.groupID}`
      await dbSetData(key, {
        lastLayout: {
          t: layout.t,
          uid: layout.uid
        }
      })
    },
    getElements: function () {
      if (this.currentSandboxID === '') {
        return
      }
      return new Promise((resolve) => {
        api({
          url: `sandbox/private/view/${this.currentSandboxID}`
        })
        .then(async (response) => {
          this.prepareDimensions()
          this.elements = new Map()
          for (let i = 0; i < response.data.elements.length; i++) {
            if (!response.data.elements[i].uuid || !response.data.elements[i].type) {
              continue
            }
            this.elements.set(response.data.elements[i].uuid, response.data.elements[i])
            setTimeout(() => {
              const elem = document.getElementById(response.data.elements[i].uuid + '_div')
              if (elem) {
                this.makeElementDraggable(elem, response.data.elements[i])
                this.makeElementDraggable(elem, response.data.elements[i], true)
              }
            }, 500)
          }
        })
        .catch((e) => {
          this.elements = new Map()
          console.debug(e.message)
        })
        .finally(() => {
          resolve()
        })
      })
    },
    makeElementDraggable: function (element, obj, resize = false) {
      let pos1 = 0
      let pos2 = 0
      let pos3 = 0
      let pos4 = 0
      let _obj = null
      const _vue = this
      const _this = this.elements
      const _container = this.$refs.content_container
      const gridSize = this.gridSize
      const cellWidth = this.width / gridSize
      const cellHeight = this.height / gridSize
      const updateFun = this.updateCurrentElement
      let scrollX
      let scrollY
      let elem
      if (!resize) {
        elem = document.getElementById(obj.uuid + '_anchor')
      } else {
        elem = document.getElementById(obj.uuid + '_anchor_size')
      }
      if (elem) {
        elem.onmousedown = dragMouseDown
      } else {
        element.onmousedown = dragMouseDown
      }

      function dragMouseDown (e) {
        scrollX = _container.scrollLeft
        scrollY = _container.scrollTop
        e = (e || window.event)
        e.preventDefault()
        pos3 = e.clientX
        pos4 = e.clientY
        document.onmouseup = closeDragElement
        document.onmousemove = elementDrag
        _obj = _this.get(obj.uuid)
        _obj._drag = true
        _vue.currentElemID = obj.uuid
      }

      function elementDrag (e) {
        e = e || window.event
        _container.scrollTo(scrollX, scrollY)
        e.preventDefault()
        pos1 = (pos3 - e.clientX)
        pos2 = (pos4 - e.clientY)
        pos3 = e.clientX
        pos4 = e.clientY
        // Set objects positional values
        if (!resize) {
          _obj.y = (element.offsetTop - pos2)
          _obj.x = (element.offsetLeft - pos1)
          if (_obj.y < 0) {
            _obj.y = 0
          }
          if (_obj.x < 0) {
            _obj.x = 0
          }
        } else {
          _obj.h = (pos4 - element.offsetTop - 132 + _container.scrollTop)
          _obj.w = (pos3 - element.offsetLeft + 16 + _container.scrollLeft)
          if (_obj.h < 40) {
            _obj.h = 40
          }
          if (_obj.w < 200) {
            _obj.w = 200
          }
        }
      }

      function closeDragElement () {
        document.onmouseup = null
        document.onmousemove = null
        _obj._drag = false
        // Snap element's position to the grid
        _obj.x = Math.round(_obj.x / cellWidth) * cellWidth
        _obj.y = Math.round(_obj.y / cellHeight) * cellHeight
        // Snap element's width and height
        _obj.w = (Math.round(_obj.w / cellWidth)) * cellWidth
        _obj.h = (Math.round(_obj.h / cellHeight)) * cellHeight
        // Update element
        _this.set(obj.uuid, _obj)
        updateFun()
      }
    },
    updateCurrentElement: function () {
      if (this.currentElemID === '') {
        return
      }
      return new Promise((resolve) => {
        const elem = this.elements.get(this.currentElemID)
        api({
          method: 'post',
          url: `sandbox/private/edit/${elem.uid}`,
          data: elem
        })
        .catch((err) => console.debug(err.message))
        .finally(() => resolve())
      })
    },
    updateElement: function (elem) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: `sandbox/private/edit/${elem.uid}`,
          data: elem
        })
        .then(() => {
          elem._edit = false
        })
        .catch((err) => console.debug(err.message))
        .finally(() => resolve())
      })
    },
    addElement: function (type) {
      const container = this.$refs.content_container
      const newElem = {
        uid: '',
        uuid: '',
        t: '',
        desc: '',
        type: '',
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        ref: '',
        hide: false,
        _edit: false,
        _drag: false
      }
      newElem.type = type
      newElem.uuid = this.getUUID()
      newElem.pid = this.currentSandboxID
      newElem.x = 200 + container.scrollLeft
      newElem.y = 100 + container.scrollTop
      newElem.w = 300
      newElem.h = 200
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: `sandbox/private/add/${this.currentSandboxID}`,
          data: newElem
        })
        .then(() => {
          this.getElements()
        })
        .catch((err) => console.debug(err.message))
        .finally(() => resolve())
      })
    },
    getUUID: function () {
      return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      )
    },
    deleteElement: function (elem) {
      this.elements.delete(elem.uuid)
      return new Promise((resolve) => {
        api({
          url: `sandbox/private/remove/${elem.uid}`
        })
        .then(() => {
          resolve()
        })
        .catch((e) => {
          console.debug(e.message)
        })
      })
    },
    toggleElement: function (elem) {
      const _elem = this.elements.get(elem.uuid)
      const htmlElem = document.getElementById(elem.uuid + '_transition')
      htmlElem.classList.add('transition-all')
      _elem.hide = !_elem.hide
      this.elements.set(elem.uuid, _elem)
      this.updateElement(_elem)
      setTimeout(() => {
        htmlElem.classList.remove('transition-all')
      }, 100)
    },
    getDimension: function (value, elem, min = 0) {
      if (elem.hide) {
        return min
      } else {
        return value
      }
    },
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    },
    sandboxValid: function (elem) {
      if (this.sandboxFilter.trim() === '') {
        return true
      }
      return elem.t.toLowerCase().includes(this.sandboxFilter.toLowerCase())
    }
  }
}
</script>

<style scoped>

</style>
