<template>
  <q-page class="full-height full-width flex">
    <q-layout
      view="lhh LpR lff"
      container
      :style="{height: eHeight}"
      class="overflow-hidden no-scroll">
      <q-drawer
        side="left"
        v-model="sidebarLeft"
        :show-if-above="!isComponent"
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
          <template v-if="!isComponent">
            <q-btn flat icon="sym_o_arrow_left_alt"
                   align="left" class="wfull pl4 mt2"
                   no-caps
                   @click="clickedBack">
              <span class="ml4 text-body1">Back</span>
            </q-btn>
          </template>
          <q-toolbar>
            <q-toolbar-title class="text-lg">
              Apps
            </q-toolbar-title>
          </q-toolbar>
          <q-btn icon="sym_o_school" flat no-caps
                 align="left"
                 class="wfull"
                 @click="gotoKnowledge">
            <span class="ml4 text-body1">Knowledge</span>
          </q-btn>
          <q-btn icon="sym_o_calendar_clock" flat no-caps
                 align="left"
                 class="wfull"
                 @click="gotoProjectManagement">
            <span class="ml4 text-body1">Calendar</span>
          </q-btn>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page style="padding-top: 60px" class="background">
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
                  <q-breadcrumbs-el label="Planner"/>
                </q-breadcrumbs>
              </q-toolbar-title>
            </q-toolbar>
          </q-page-sticky>
          <template v-if="!isComponent">
            <q-btn flat
                   icon="sym_o_arrow_left_alt"
                   label="Back"
                   class="md:hidden fmt_border ml4 mb3 rounded-2
                        surface-variant"
                   @click="clickedBack">
            </q-btn>
          </template>
          <div id="board" ref="board"
               class="wfull h-[calc(100dvh-162px)] px4
                      overflow-x-auto overflow-y-hidden">
            <div class="wmax flex row gap-3 overflow-y-hidden pb10">
              <template v-for="boxEntry in boxes" :key="boxEntry.box">
                <div class="surface-variant hfit rounded-2
                            max-h-[calc(100dvh-175px)]
                            min-w-[200px] max-w-[300px]
                            overflow-h-auto overflow-x-hidden">
                  <div class="flex relative items-center p2 wfull
                              sticky top-0 z-2 surface-variant">
                    <p class="text-h6 fontbold pl1">
                      {{ boxEntry.box.t }}
                    </p>
                  </div>
                  <div class="px2 pb2">
                    <template v-if="!boxEntry.box._noEdit">
                      <q-btn icon="add" label="New Task" unelevated
                             align="left" dense no-caps
                             class="wfull mb4"
                             @click="writeTask(boxEntry.box.uid)"/>
                    </template>
                    <div v-if="boxEntry.tasks"
                         :id="'box_tasks_guid_' + boxEntry.box.uid"
                         :ref="'box_tasks_guid_' + boxEntry.box.uid"
                         class="relative z1">
                      <draggable
                        :list="boxEntry.tasks"
                        v-bind="dragOptions"
                        @start="drag=true"
                        @end="endDrag"
                        @change="handleDragChange"
                        @move="handleDragMove"
                        ghostClass="ghost"
                        tag="transition-group"
                        filter=".notagger"
                        fallbackTolerance="5"
                        forceFallback="true"
                        fallbackClass="chosen"
                        :component-data="{
                        tag: 'div',
                        type: 'transition-group',
                        name: !drag ? 'flip-list' : null
                      }"
                        item-key="order">
                        <template v-if="drag && boxEntry.tasks.length < 1" #header>
                          <div class="m-2 p-2 rounded-md primary-container text-center">
                            <span>Drag Here!</span>
                          </div>
                        </template>
                        <template #item="{element}">
                          <div :key="element.uid" class="p-1 task_container"
                               :ref="'taskcontainer_' + element.uid" :id="'taskcontainer_' + element.uid">
                            <div :ref="'task_' + element.uid" :id="'task_' + element.uid"
                                 class="p_task relative p2 min-w-[200px]
                                        surface wfull hfull"
                                 v-on:click="eventClicked(element.uid)">
                              <div class="text-sm wfull flex items-start
                                          justify-between pb1">
                                <p>
                                  {{ element.name }}
                                </p>
                                <p class="text-xs">
                                  {{ getHumanReadableDateText(element.ts, true) }}
                                </p>
                              </div>
                              <div>
                                <p class="text-lg fontbold">
                                  {{ element.t }}
                                </p>
                                <p>
                                  {{ element.keys }}
                                </p>
                              </div>
                              <div v-if="element.due"
                                   class="p1 rounded mt2 flex gap-1 items-center"
                                   style="border: 1px solid darkorange;
                                          background-color: rgba(255, 140, 0, 0.2)">
                                <q-icon name="event"/>
                                <p class="text-xs fontbold">
                                  {{ getHumanReadableDateText(element.due, true) }}
                                </p>
                              </div>
                            </div>
                          </div>
                        </template>
                      </draggable>
                    </div>
                  </div>
                </div>
              </template>
              <q-card id="new_box" flat class="hfit">
                <div class="flex relative items-center px2 min-w-[200px]
                            surface-variant">
                  <q-input label="New Box"
                           color="brand-p"
                           borderless
                           label-color="brand-p"
                           v-model="newBox.name"
                           v-on:keydown="newBoxKeyUp">
                    <template v-slot:prepend>
                      <q-icon name="add"/>
                    </template>
                  </q-input>
                </div>
              </q-card>
            </div>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <new-wisdom-event :is-open="isCreatingEvent"
                    :is-edit="isEditingEvent"
                    :new-event="newEvent"
                    title="Task"
                    @create="createNewEvent"
                    @delete="deleteEvent"
                    @update="updateEvent"
                    @finish="finishEvent"/>
</template>

<script>
import { api } from 'boot/axios'
import { dbGetDisplayName } from 'src/libs/wikistore'
import draggable from 'vuedraggable'
import NewWisdomEvent from 'components/knowledge/NewWisdomEvent.vue'
import { DateTime } from 'luxon'

export default {
  props: {
    chatID: {
      type: String,
      default: ''
    },
    eHeight: {
      type: String,
      default: 'calc(100dvh - 52px)'
    }
  },
  name: 'PlannerView',
  components: {
    NewWisdomEvent,
    draggable
  },
  data () {
    return {
      isComponent: false,
      sidebarLeft: false,
      groupID: null,
      chatroom: null,
      knowledge: null,
      knowledgeExists: true,
      boxes: [],
      newBox: {
        name: ''
      },
      eventsBox: null,
      isLoading: false,
      isCreatingEvent: false,
      isEditingEvent: false,
      currentBoxID: null,
      newEvent: {
        t: '',
        desc: '',
        due: '',
        duet: ''
      },
      drag: false,
      lastDragMove: undefined
    }
  },
  created () {
    if (this.chatID) {
      this.groupID = this.chatID
      this.isComponent = true
    } else {
      const paramID = this.$route.query.id
      if (paramID) this.groupID = paramID
      this.isComponent = false
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
      await this.getBoxes()
    },
    getChatroom: function () {
      if (!this.groupID) {
        this.chatroom = null
        return
      }
      return new Promise((resolve) => {
        api({
          url: 'chat/private/get/' + this.groupID
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
    newBoxKeyUp: function (e) {
      if (e.key === 'Enter') {
        if (e.shiftKey) return
        if (this.newBox.name.trim() !== '') {
          this.createBox()
        }
      }
    },
    createBox: async function () {
      const categories = []
      const payload = {
        t: this.newBox.name,
        desc: '',
        pid: this.knowledge.uid,
        keys: '',
        copy: '',
        cats: categories,
        type: 'box',
        row: 0
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/create',
          data: payload
        })
        .then(() => {
          this.newBox.name = ''
          this.getBoxes()
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => {
          resolve()
        })
      })
    },
    getBoxes: async function (silent = false, showAll = false) {
      if (!silent) {
        this.isLoading = true
      }
      return new Promise((resolve) => {
        let suffix = ''
        // const checkbox = this.$refs.input_show_unfinished
        // if (checkbox) {
        //   if (showAll || checkbox.checked) {
        //     suffix = '?state=any'
        //     checkbox.checked = true
        //   } else {
        //     suffix = '?state=todo'
        //     checkbox.checked = false
        //   }
        // }
        suffix = '?state=todo'
        // Prepare category color map
        const catColors = new Map()
        if (this.knowledge.cats) {
          for (let i = 0; i < this.knowledge.cats.length; i++) {
            catColors[this.knowledge.cats[i].t] = this.knowledge.cats[i].hex
          }
        }
        api({
          url: 'wisdom/private/tasks/' + this.knowledge.uid + suffix
        })
        .then(async (response) => {
          // Retrieve all boxes and tasks from server response
          this.boxes = response.data.boxes.reverse()
          // Iterate over all boxes
          for (let i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].box.t === '%wikiric%Events%wkrg%') {
              this.boxes[i].box.t = 'Project Events'
              this.boxes[i].box._noEdit = true
              this.eventsBox = this.boxes[i].box
            }
            if (this.boxes[i].tasks) {
              // Iterate over all tasks of this box
              for (let j = 0; j < this.boxes[i].tasks.length; j++) {
                this.boxes[i].tasks[j].name =
                  await dbGetDisplayName(this.boxes[i].tasks[j].usr)
                // Replace category colors with knowledge category colors if present
                if (this.boxes[i].tasks[j].cats) {
                  let clr = ''
                  for (let k = 0; k < this.boxes[i].tasks[j].cats.length; k++) {
                    clr = catColors[this.boxes[i].tasks[j].cats[k].t]
                    if (clr && clr !== '') {
                      this.boxes[i].tasks[j].cats[k].hex = clr
                    }
                  }
                }
              }
            }
          }
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => {
          this.isLoading = false
          resolve()
        })
      })
    },
    endDrag: function () {
      setTimeout(() => (this.drag = false), 100)
    },
    handleDragChange: function (e) {
      const prefix = 'box_tasks_guid_'
      if (e.added) {
        // Moved to another box!
        console.log(e.added.element.uid, 'MOVED to index', e.added.newIndex,
          'for new box', this.lastDragMove.to.parentElement.id.substring(prefix.length))
        // Set new rowIndex and boxGUID for this task!
        this.moveTask(e.added.element.uid, e.added.newIndex,
          this.lastDragMove.to.parentElement.id.substring(prefix.length))
      } else if (e.moved) {
        // Moved inside current box.
        console.log(e.moved.element.uid, 'MOVED to index', e.moved.newIndex)
        // Set new rowIndex for this task!
        this.moveTask(e.moved.element.uid, e.moved.newIndex,
          this.lastDragMove.to.parentElement.id.substring(prefix.length))
      }
    },
    handleDragMove: function (e) {
      this.lastDragMove = e
    },
    moveTask: function (taskGUID, newRowIndex, boxGUID) {
      for (const i in this.boxes) {
        if (this.boxes[i].box.uid === boxGUID) {
          if (this.boxes[i].tasks && this.boxes[i].tasks.length > 1) {
            if (newRowIndex > 0) {
              // rowIndex != 0 so compare the tasks before and after
              const rowIndexTaskBefore = this.boxes[i].tasks[newRowIndex - 1].row
              if (this.boxes[i].tasks.length - 1 > newRowIndex) {
                const rowIndexTaskAfter = this.boxes[i].tasks[newRowIndex + 1].row
                newRowIndex = Math.floor((rowIndexTaskBefore + rowIndexTaskAfter) / 2)
              } else {
                newRowIndex = rowIndexTaskBefore + 20000
              }
            } else {
              // rowIndex = 0 so just look at the second task if it exists
              newRowIndex = Math.floor(this.boxes[i].tasks[1].row / 2)
            }
          } else {
            // First task => Set it to 0
            newRowIndex = 20000
          }
        }
      }
      if (newRowIndex <= 1) {
        newRowIndex = 0.5
      }
      console.log('New Row Index:', newRowIndex)
      const payload = {
        row: newRowIndex,
        toId: boxGUID
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/move/' + taskGUID,
          data: payload
        })
        .then(() => {
          this.getBoxes()
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => resolve())
      })
    },
    getTaskFromUID: function (uid) {
      // Iterate over all boxes
      for (let i = 0; i < this.boxes.length; i++) {
        if (this.boxes[i].tasks) {
          // Iterate over all tasks of this box
          for (let j = 0; j < this.boxes[i].tasks.length; j++) {
            if (this.boxes[i].tasks[j].uid === uid) {
              return this.boxes[i].tasks[j]
            }
          }
        }
      }
      return null
    },
    eventClicked: function (id) {
      const date = this.getTaskFromUID(id)
      if (!date) return
      this.newEvent = date
      this.isEditingEvent = true
      this.isCreatingEvent = !this.isCreatingEvent
    },
    writeTask: function (boxID) {
      this.newEvent = {
        t: '',
        desc: '',
        due: '',
        duet: ''
      }
      this.isEditingEvent = false
      this.isCreatingEvent = !this.isCreatingEvent
      this.currentBoxID = boxID
    },
    createNewEvent: function (date) {
      const payload = {
        t: date.t,
        desc: date.desc,
        keys: date.keys,
        pid: this.knowledge.uid,
        copy: '',
        cats: [],
        type: 'task',
        row: 0,
        ref: this.currentBoxID,
        due: date.due,
        duet: date.duet,
        coll: date.coll
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/create',
          data: payload
        }).then(() => {
          this.getBoxes()
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    updateEvent: function (date) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: `wisdom/private/edit/${date.uid}`,
          data: date
        }).then(() => {
          this.getBoxes()
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    finishEvent: function (uid) {
      return new Promise((resolve) => {
        api({
          url: `wisdom/private/finish/${uid}`
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Task Finished!',
            caption: 'Good job!',
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
          this.getBoxes()
        }).catch((err) => {
          console.debug(err.message)
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Operation Failed',
            caption: 'Maybe you\'re not a collaborator?',
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
        }).finally(() => {
          resolve()
        })
      })
    },
    deleteEvent: function (uid) {
      return new Promise((resolve) => {
        api({
          url: `wisdom/private/delete/${uid}`
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Task Deleted!',
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
          this.getBoxes()
        }).catch((err) => {
          console.debug(err.message)
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Operation Failed',
            caption: 'Maybe you\'re not a collaborator?',
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
        }).finally(() => {
          resolve()
        })
      })
    },
    /**
     *
     * @param {String} date
     * @param {Boolean=false} withTime
     * @param {Boolean=false} fullDate
     * @returns {string}
     */
    getHumanReadableDateText: function (date, withTime = false, fullDate = false) {
      if (!date || date === '') {
        return ''
      }
      const time = DateTime.fromISO(date).toLocaleString(DateTime.TIME_24_SIMPLE)
      const start = DateTime.fromISO(DateTime.fromISO(date).toISODate())
      const end = DateTime.fromISO(DateTime.now().toISODate())
      const diffDays = Math.ceil(end.diff(start) / (1000 * 60 * 60 * 24))
      let suffix = ''
      if (withTime) {
        suffix = ', ' + time
      }
      let returnString
      switch (diffDays) {
        case -5:
          returnString = 'In 5 days' + suffix
          break
        case -4:
          returnString = 'In 4 days' + suffix
          break
        case -3:
          returnString = 'In 3 days' + suffix
          break
        case -2:
          returnString = 'In 2 days' + suffix
          break
        case -1:
          returnString = 'Tomorrow' + suffix
          break
        case 0:
          returnString = 'Today' + suffix
          break
        case 1:
          returnString = 'Yesterday' + suffix
          break
        case 2:
          returnString = '2 days ago' + suffix
          break
        case 3:
          returnString = '3 days ago' + suffix
          break
        default:
          if (!fullDate) {
            returnString = start.toLocaleString(DateTime.DATE_MED) + suffix
          } else {
            returnString = start.toLocaleString(DateTime.DATE_HUGE) + suffix
          }
      }
      return returnString
    },
    gotoKnowledge: function () {
      if (!this.groupID) return
      this.$router.push(`/knowledge?id=${this.groupID}`)
    },
    gotoProjectManagement: function () {
      if (!this.groupID) return
      this.$router.push(`/projects?id=${this.groupID}`)
    }
  },
  computed: {
    dragOptions () {
      return {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      }
    }
  }
}
</script>

<style>

.ghost {
  margin: 0.5rem; /* 8.0px */
  background-color: var(--md-sys-color-primary);
  border: 2px solid var(--md-sys-color-outline-variant);
  border-radius: 0.25rem; /* 4.0px */
}

.ghost * {
  opacity: 0;
}

.chosen {
  opacity: 1;
  rotate: -3deg;
}

.p_task {
  border-radius: 4px;
}

.p_task:hover {
  background-color: var(--md-sys-color-background);
  box-shadow: 0 0 2px 2px var(--md-sys-color-primary);
  cursor: pointer;
}

</style>
