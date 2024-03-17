<template>
  <q-dialog v-model="show" class="">
    <q-card class="background w-[75dvw] max-w-2xl" flat bordered>
      <div class="background sticky top-0 z-fab p4
                  fmt_border_bottom
                  flex items-center justify-between">
        <span class="text-h5 fontbold pointer-events-none">
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
                   class="px3 py2 fontbold"
                   @click="deleteDate"/>
          </template>
          <q-btn color="brand-bg" text-color="brand-p"
                 icon="save"
                 label="Save Changes" no-caps flat
                 class="px3 py2 fontbold"
                 @click="createDate"/>
        </div>
      </div>
      <div class="flex row gap-6 wfull px4 py2 surface items-start justify-between">
        <div class="flex column gap-1">
          <div class="flex row gap-2 items-center">
            <p class="text-subtitle2 fontbold pointer-events-none w12">
              From
            </p>
            <div class="flex row gap-2 items-center justify-between flex-grow">
              <q-btn icon="event" flat dense no-caps
                     class="wfit text-subtitle2 fontbold" :label="getHumanReadableDateText(date.due)">
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
                     class="wfit text-subtitle2 fontbold" :label="date._dueTimeFmt">
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
          </div>
          <div class="flex row gap-2 items-center">
            <p class="text-subtitle2 fontbold pointer-events-none w12">
              Until
            </p>
            <div class="flex row gap-2 items-center justify-between flex-grow">
              <q-btn icon="event" flat dense no-caps
                     class="wfit text-subtitle2 fontbold" :label="getHumanReadableDateText(date.duet)">
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
                     class="wfit text-subtitle2 fontbold" :label="date._dueTimeUntilFmt">
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
          </div>
          <div class="flex row gap-2 items-center
                      mt2 background p2 wfull
                      rounded-2">
            <q-icon name="watch" size="1rem"/>
            <span class="text-body2 fontbold">{{ date._duration }}</span>
          </div>
        </div>
        <div class="flex column gap-4 items-start mt1">
          <template v-if="date.uid">
            <div class="flex column gap-2 items-center">
              <q-btn icon="check" dense no-caps
                     align="left"
                     label="Finish Task"
                     color="primary"
                     class="text-md fontbold px4 py2 wfull"
                     @click="finishDate"/>
              <q-btn icon="north_east" dense no-caps
                     align="left"
                     label="View Task"
                     color="brand-bg"
                     text-color="brand-p"
                     class="text-md fontbold px4 py2 wfull"
                     @click="gotoWisdom"/>
            </div>
          </template>
        </div>
      </div>
      <div class="pb4 px3 surface">
        <q-input
          for="event_t"
          ref="event_t"
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
          v-model="date.keys"
          class="p2 text-xl">
          <template v-slot:prepend>
            <q-icon name="info"/>
          </template>
        </q-input>
      </div>
      <q-select
        label="Collaborators"
        color="brand-p"
        bg-color="brand-bg"
        filled
        v-model="date.coll"
        :options="filterOptions"
        @filter="filterCollaboratorOptions"
        use-input
        use-chips
        multiple
        input-debounce="50"
        new-value-mode="add-unique"
        class="wfull"
      />
      <div class="mt2">
        <editor v-model="date.desc" ref="ref_editor"/>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { DateTime } from 'luxon'
import Editor from 'components/EditorComponent.vue'

export default {
  components: { Editor },
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
  emits: ['create', 'delete', 'update', 'finish'],
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
      duration: '',
      contributorOptions: [],
      filterOptions: [],
      toolbarConfig: [
        ['bold', 'italic', 'strike', 'underline'],
        ['token', 'hr', 'link'],
        [
          {
            label: this.$q.lang.editor.formatting,
            icon: this.$q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'p',
              'code'
            ]
          },
          {
            label: this.$q.lang.editor.fontSize,
            icon: this.$q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          }
        ]
      ],
      toolbarFonts: {
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
      }
    }
  },
  methods: {
    handleDialogOpen: function () {
      if (this.date.t === '') {
        setTimeout(() => {
          const elem = this.$refs.event_t
          if (elem) {
            elem.focus()
          }
        }, 0)
      }
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
      let dur = luxt.diff(lux).as('minutes')
      if (dur >= 120) {
        dur = dur / 60
        date._duration = dur.toString() + ' hour'
      } else {
        date._duration = dur.toString() + ' minute'
      }
      if (dur > 1) date._duration += 's'
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
          keys: this.date.keys,
          due: this.date.due.toJSDate().toISOString(),
          duet: this.date.duet,
          coll: this.date.coll
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
    finishDate: function () {
      this.$emit('finish', this.date.uid)
      this.show = false
    },
    gotoWisdom: function () {
      this.$router.push(`/wisdom?id=${this.date.uid}`)
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
    },
    filterCollaboratorOptions (val, update) {
      update(() => {
        if (val === '') {
          this.filterOptions = this.contributorOptions
        } else {
          const needle = val.toLowerCase()
          this.filterOptions = this.contributorOptions.filter(
            v => v.toLowerCase().indexOf(needle) > -1
          )
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
