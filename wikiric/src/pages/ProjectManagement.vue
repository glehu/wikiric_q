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
                   @click="toggleSidebarLeft">
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
        <q-page style="padding-top: 60px" class="background">
          <q-page-sticky position="top" expand
                         class="background z-fab">
            <q-toolbar>
              <q-btn flat round dense icon="sym_o_dock_to_right"
                     @click="toggleSidebarLeft">
                <q-tooltip class="text-body2">
                  Toggle&nbsp;Sidebar
                </q-tooltip>
              </q-btn>
              <q-toolbar-title class="text-subtitle1">
                <q-breadcrumbs active-color="brand-p">
                  <template v-if="chatroom">
                    <q-breadcrumbs-el :label="chatroom.t"/>
                  </template>
                  <q-breadcrumbs-el label="Projects"/>
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
          <template v-if="!knowledgeExists">
            <div class="wfull hfull flex column items-center justify-center">
              <div class="p8 surface rounded-2">
                <p class="text-h6">
                  Project Management Redefined
                </p>
                <q-separator class="my4"/>
                <p>
                  Small ideas to big corporate projects.
                  <br>
                  Keep track of tasks and events in wikiric's tool made exactly for this.
                </p>
                <p class="mt3">
                  Go to the <span class="fontbold">Knowledge</span> app
                  to get started by creating a <span class="fontbold">Knowledge Hub</span>.
                </p>
                <q-separator class="my4"/>
                <div class="wfull flex justify-end">
                  <q-btn icon="sym_o_school" label="Get Started" no-caps
                         @click="gotoKnowledge"
                         color="primary"/>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="h-[calc(100dvh-162px)]
                        md:h-[calc(100dvh-112px)]
                        overflow-hidden relative">
              <FullCalendar ref="fullCalendar"
                            :options="calendarOptions"
                            class="wfull hfull background
                                   overflow-hidden"/>
            </div>
          </template>
          <q-page-sticky position="bottom-right" :offset="[18, 18]"
                         class="hidden">
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
    <new-wisdom-event :is-open="isCreatingEvent"
                      :is-edit="isEditingEvent"
                      :new-event="newEvent"
                      @create="createNewEvent"
                      @delete="deleteEvent"
                      @update="updateEvent"
                      @finish="finishEvent"/>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import FullCalendar from '@fullcalendar/vue3'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import multiMonthPlugin from '@fullcalendar/multimonth'
import interactionPlugin from '@fullcalendar/interaction'
import deLocale from '@fullcalendar/core/locales/de'
import { DateTime } from 'luxon'
import { dbGetDisplayName } from 'src/libs/wikistore'
import NewWisdomEvent from 'components/knowledge/NewWisdomEvent.vue'

export default {
  props: {
    chatID: {
      type: String,
      default: ''
    }
  },
  name: 'ProjectManagement',
  components: {
    NewWisdomEvent,
    FullCalendar
  },
  data () {
    return {
      fab: false,
      sidebarLeft: false,
      groupID: undefined,
      chatroom: null,
      knowledge: { uid: '' },
      knowledgeExists: true,
      newKnowledge: {
        t: '',
        desc: ''
      },
      calendarOptions: null,
      isLoading: false,
      isCreatingEvent: false,
      isEditingEvent: false,
      newEvent: {
        t: '',
        desc: '',
        due: '',
        duet: ''
      },
      boxes: [],
      eventsBox: null
    }
  },
  created () {
    if (this.chatID) {
      this.groupID = this.chatID
    } else {
      const paramID = this.$route.query.id
      if (paramID) this.groupID = paramID
    }
    const eventUpdater = this.eventUpdated
    const eventOpener = this.eventClicked
    const dateClicker = this.dateClicked
    this.calendarOptions = {
      plugins: [timeGridPlugin, listPlugin, multiMonthPlugin, interactionPlugin],
      initialView: 'timeGridWeek',
      multiMonthMaxColumns: 1,
      nowIndicator: true,
      editable: true,
      events: [],
      scrollTime: DateTime.now().toISOTime(),
      locales: [deLocale],
      locale: 'en-de',
      slotDuration: '00:15:00',
      slotLabelInterval: '00:15:00',
      slotLabelFormat: {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: 'short'
      },
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5, 6, 0],
        startTime: '01:00',
        endTime: '24:00'
      },
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'timeGridWeek,listWeek,multiMonthYear'
      },
      eventDrop: function (info) {
        // alert(info.event.title + ' was dropped on ' + info.event.start.toISOString())
        // if (!confirm('is this okay?')) { info.revert() }
        eventUpdater(info.event.id, info.event.start, info.event.end)
      },
      eventResize: function (info) {
        // alert(info.event.title + ' end is now ' + info.event.end.toISOString())
        // if (!confirm('is this okay?')) { info.revert() }
        eventUpdater(info.event.id, info.event.start, info.event.end)
      },
      eventClick: function (info) {
        eventOpener(info.event.id)
      },
      dateClick: function (info) {
        dateClicker(info.date)
      }
    }
    this.initFunction()
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    gotoKnowledge: function () {
      if (!this.groupID) {
        return
      }
      this.$router.push(`/knowledge?id=${this.groupID}`)
    },
    initFunction: async function () {
      await this.getChatroom()
      await this.getKnowledge(this.groupID, true)
      await this.getBoxes()
      if (this.boxes.length < 1) {
        await this.createEventsBox()
      }
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
    eventUpdated: function (id, start, end) {
      const task = this.getTaskFromUID(id)
      if (!task) return
      task.due = start
      task.duet = end
      this.updateEvent(task)
    },
    eventClicked: function (id) {
      const date = this.getTaskFromUID(id)
      if (!date) return
      this.newEvent = date
      this.isEditingEvent = true
      this.isCreatingEvent = !this.isCreatingEvent
    },
    /**
     *
     * @param {Date} date
     */
    dateClicked: function (date) {
      this.isEditingEvent = false
      this.newEvent = {
        t: '',
        desc: '',
        due: date.toISOString(),
        duet: DateTime.fromISO(
          date.toISOString()).plus(
          { minutes: 15 }).toJSDate().toISOString()
      }
      this.isCreatingEvent = !this.isCreatingEvent
    },
    /**
     *
     * @param {String} date
     * @param {Boolean=false} withTime
     * @param {Boolean=false} fullDate
     * @returns {string}
     */
    getHumanReadableDateText: function (date, withTime = false, fullDate = false) {
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
    getBoxes: async function (silent = false, showAll = false) {
      if (!silent) {
        this.isLoading = true
      }
      return new Promise((resolve) => {
        const suffix = '?state=todo'
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
          this.calendarOptions.events = []
          // Iterate over all boxes
          for (let i = 0; i < this.boxes.length; i++) {
            if (this.boxes[i].box.t === '%wikiric%Events%wkrg%') {
              this.eventsBox = this.boxes[i].box
            }
            if (this.boxes[i].tasks) {
              // Iterate over all tasks of this box
              for (let j = 0; j < this.boxes[i].tasks.length; j++) {
                this.boxes[i].tasks[j].name = await dbGetDisplayName(this.boxes[i].tasks[j].usr)
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
                if (this.boxes[i].tasks[j].due) {
                  // Add entry to calendar if there's a due date
                  if (!this.boxes[i].tasks[j].duet) {
                    // 15 minutes if no end time was provided
                    this.boxes[i].tasks[j].duet = DateTime.fromISO(
                      this.boxes[i].tasks[j].due).plus(
                      { minutes: 15 }).toJSDate().toISOString()
                  }
                  this.calendarOptions.events.push({
                    id: this.boxes[i].tasks[j].uid,
                    title: this.boxes[i].tasks[j].t + ' - ' + this.boxes[i].tasks[j].keys,
                    start: this.boxes[i].tasks[j].due,
                    end: this.boxes[i].tasks[j].duet,
                    color: 'var(--md-sys-color-primary)',
                    textColor: 'var(--md-sys-color-on-primary)'
                  })
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
        ref: this.eventsBox.uid,
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
          this.getBoxes()
        }).catch((err) => {
          console.debug(err.message)
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
          this.getBoxes()
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    createEventsBox: async function () {
      const payload = {
        t: '%wikiric%Events%wkrg%',
        desc: '',
        pid: this.knowledge.uid,
        keys: '',
        copy: '',
        cats: [],
        type: 'box',
        row: 0
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
    toggleSidebarLeft: function () {
      this.sidebarLeft = !this.sidebarLeft
      setTimeout(() => {
        this.$refs.fullCalendar.getApi().updateSize()
      }, 200)
    }
  }
}
</script>

<style>

:root {
  --fc-border-color: var(--md-sys-color-outline-variant) !important;
  --fc-neutral-bg-color: var(--md-sys-color-surface-variant) !important;
  --fc-list-event-hover-bg-color: var(--md-sys-color-surface) !important;
  --fc-page-bg-color: var(--md-sys-color-background) !important;
}

.fc .fc-timegrid-slot {
  height: 3rem !important;
}

.fc-header-toolbar {
  padding: 0 1rem 0 1rem;
}

.fc-toolbar-title {
  font-size: 1rem !important;
  font-weight: bold !important;
}

</style>

<style scoped>
</style>
