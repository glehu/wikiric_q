<template>
  <q-dialog v-model="show" class="">
    <q-card class="surface p4 w-[75dvw] max-w-2xl" flat bordered>
      <div class="surface sticky top-0 z-fab px4 pt4
                  flex items-start justify-between">
        <span class="text-h5 fontbold pl2">
          <template v-if="!isEdit">
            New Event
          </template>
          <template v-else>
            Event
          </template>
        </span>
        <div class="flex gap-4">
          <template v-if="isEdit">
            <q-btn color="brand-bg" text-color="brand-p"
                   icon="delete"
                   label="Delete Event" no-caps flat
                   class="px6 py4 fontbold"
                   @click="deleteDate"/>
          </template>
          <q-btn color="primary"
                 icon="save"
                 label="Save Changes" no-caps
                 class="px6 py4 fontbold"
                 @click="createDate"/>
        </div>
      </div>
      <div class="px4 pb4">
        <q-input
          for="event_t"
          label="Title"
          color="brand-p"
          label-color="brand-p"
          v-model="date.t"
          class="p2 text-xl">
          <template v-slot:prepend>
            <q-icon name="sym_o_event"/>
          </template>
        </q-input>
        <q-input
          for="event_desc"
          label="Description"
          color="brand-p"
          label-color="brand-p"
          v-model="date.desc"
          class="p2 text-xl">
          <template v-slot:prepend>
            <q-icon name="info"/>
          </template>
        </q-input>
        <div class="flex row gap-4 wfull mt2">
          <div class="flex column p2">
            <p class="text-body1 fontbold mb2">From</p>
            <q-btn icon="event" flat dense no-caps
                   class="wfit text-lg" :label="getHumanReadableDateText(date.due)">
              <q-popup-proxy @before-show="updateProxyDueDate" cover transition-show="scale" transition-hide="scale">
                <q-date v-model="proxyDate">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Cancel" color="primary" flat v-close-popup/>
                    <q-btn label="OK" color="primary" flat @click="saveProxyDueDate" v-close-popup/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn icon="access_time" flat dense no-caps
                   class="wfit text-lg" :label="date._dueTimeFmt">
              <q-popup-proxy @before-show="updateProxyDueTime" cover transition-show="scale" transition-hide="scale">
                <q-time v-model="proxyTime">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Cancel" color="primary" flat v-close-popup/>
                    <q-btn label="OK" color="primary" flat @click="saveProxyDueTime" v-close-popup/>
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-btn>
          </div>
          <div class="flex column p2">
            <p class="text-body1 fontbold mb2">Until</p>
            <q-btn icon="event" flat dense no-caps
                   class="wfit text-lg" :label="getHumanReadableDateText(date.duet)">
              <q-popup-proxy @before-show="updateProxyDueDateUntil" cover transition-show="scale"
                             transition-hide="scale">
                <q-date v-model="proxyDateUntil">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Cancel" color="primary" flat v-close-popup/>
                    <q-btn label="OK" color="primary" flat @click="saveProxyDueDateUntil" v-close-popup/>
                  </div>
                </q-date>
              </q-popup-proxy>
            </q-btn>
            <q-btn icon="access_time" flat dense no-caps
                   class="wfit text-lg" :label="date._dueTimeUntilFmt">
              <q-popup-proxy @before-show="updateProxyDueTimeUntil" cover transition-show="scale"
                             transition-hide="scale">
                <q-time v-model="proxyTimeUntil">
                  <div class="row items-center justify-end q-gutter-sm">
                    <q-btn label="Cancel" color="primary" flat v-close-popup/>
                    <q-btn label="OK" color="primary" flat @click="saveProxyDueTimeUntil" v-close-popup/>
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-btn>
          </div>
          <div class="flex column p2">
            <p class="text-body1 fontbold mb2">Duration</p>
            <div class="flex row gap-2 items-center p1">
              <q-icon name="watch" size="1.5rem"/>
              <span class="text-lg">{{ date._duration }} minutes</span>
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { DateTime } from 'luxon'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    newEvent: {
      type: Object,
      required: true
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  name: 'NewWisdomEvent',
  emits: ['create', 'delete', 'update'],
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    },
    newEvent (newDate) {
      this.date = newDate
      this.date = this.jsDateToQDate(this.date)
    }
  },
  data () {
    return {
      show: false,
      date: {
        t: '',
        desc: '',
        due: '',
        duet: ''
      },
      proxyDate: '',
      proxyTime: '',
      proxyDateUntil: '',
      proxyTimeUntil: '',
      duration: ''
    }
  },
  methods: {
    handleDialogOpen: function () {
    },
    jsDateToQDate: function (date) {
      const lux = DateTime.fromISO(date.due)
      date._dueDate = lux.toISODate().replaceAll('-', '/')
      date._dueTime = lux.toISOTime()
      date._dueTimeFmt = lux.toLocaleString(DateTime.TIME_24_SIMPLE)
      const luxt = DateTime.fromISO(date.duet)
      date._dueDateUntil = luxt.toISODate().replaceAll('-', '/')
      date._dueTimeUntil = luxt.toISOTime()
      date._dueTimeUntilFmt = luxt.toLocaleString(DateTime.TIME_24_SIMPLE)
      date._duration = luxt.diff(lux).as('minutes').toString()
      return date
    },
    qDateToJSDate: function (date) {
      let dateTmp = date._dueDate.replaceAll('/', '-')
      let timeTmp = date._dueTime
      date.due = DateTime.fromISO(`${dateTmp}T${timeTmp}`)
      dateTmp = date._dueDateUntil.replaceAll('/', '-')
      timeTmp = date._dueTimeUntil
      date.duet = DateTime.fromISO(`${dateTmp}T${timeTmp}`)
      return date
    },
    createDate: function () {
      this.date = this.qDateToJSDate(this.date)
      if (!this.isEdit) {
        this.$emit('create', {
          t: this.date.t,
          desc: this.date.desc,
          due: this.date.due.toJSDate().toISOString(),
          duet: this.date.duet
        })
      } else {
        delete this.date._dueTime
        delete this.date._dueDate
        delete this.date._dueTimeUntil
        delete this.date._dueDateUntil
        this.$emit('update', this.date)
      }
      this.show = false
    },
    deleteDate: function () {
      this.$emit('delete', this.date.uid)
      this.show = false
    },
    updateProxyDueDate () {
      this.proxyDate = this.date._dueDate
    },
    saveProxyDueDate () {
      this.date._dueDate = this.proxyDate
      this.date = this.qDateToJSDate(this.date)
      this.date = this.jsDateToQDate(this.date)
    },
    updateProxyDueTime () {
      this.proxyTime = this.date._dueTime
    },
    saveProxyDueTime () {
      this.date._dueTime = this.proxyTime
      this.date = this.qDateToJSDate(this.date)
      this.date = this.jsDateToQDate(this.date)
    },
    updateProxyDueDateUntil () {
      this.proxyDateUntil = this.date._dueDateUntil
    },
    saveProxyDueDateUntil () {
      this.date._dueDateUntil = this.proxyDateUntil
      this.date = this.qDateToJSDate(this.date)
      this.date = this.jsDateToQDate(this.date)
    },
    updateProxyDueTimeUntil () {
      this.proxyTimeUntil = this.date._dueTimeUntil
    },
    saveProxyDueTimeUntil () {
      this.date._dueTimeUntil = this.proxyTimeUntil
      this.date = this.qDateToJSDate(this.date)
      this.date = this.jsDateToQDate(this.date)
    },
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
    }
  }
}
</script>

<style scoped>

</style>
