<template>
  <q-dialog v-model="show" full-width full-height>
    <q-card class="wfull" flat bordered>
      <div class="surface p4">
        <q-card-actions class="p4 wfull flex row justify-between
                               background rounded fmt_border"
                        align="right">
          <q-btn flat label="Close" color="text-brand-p" v-close-popup/>
          <q-btn color="primary" no-caps
                 @click="handleSaveWisdom">
            <span>Save Wisdom</span>
          </q-btn>
        </q-card-actions>
        <div v-if="typeChangeable"
             class="my2 flex row gap-4">
          <q-option-group
            inline
            v-model="wisdomType"
            :options="wisTypes"
            color="primary">
            <template v-slot:label="opt">
              <q-icon :name="opt.icon" size="1.5rem" class="mr2"/>
              <span class="fontbold">{{ opt.label }}</span>
            </template>
          </q-option-group>
        </div>
        <div class="wfull flex gap-x-2 px2">
          <q-input
            for="wisdom_t"
            label="Title"
            color="brand-p"
            label-color="brand-p"
            v-model="wisdom.t"
            class="text-xl flex-grow <lg:w-full">
            <template v-slot:prepend>
              <q-icon name="info"/>
            </template>
          </q-input>
          <q-input
            for="wisdom_keys"
            label="Keywords"
            color="brand-p"
            label-color="brand-p"
            v-model="wisdom.keys"
            class="text-xl flex-grow <lg:w-full">
            <template v-slot:prepend>
              <q-icon name="sym_o_tag"/>
            </template>
          </q-input>
        </div>
        <div class="flex row gap-6 wfull px4 py2 items-start justify-between
                    fmt_border rounded mt4 mb1 background">
          <div class="flex column gap-4">
            <div class="flex row gap-2 items-center">
              <p class="text-subtitle2 fontbold pointer-events-none w12">
                From
              </p>
              <div class="flex row gap-2 items-center justify-between flex-grow">
                <q-btn icon="event" flat dense no-caps
                       class="wfit text-md fontbold" :label="getHumanReadableDateText(wisdom.due)">
                  <q-popup-proxy @before-show="updateProxyDueDate" cover transition-show="scale"
                                 transition-hide="scale">
                    <q-date v-model="proxyDate">
                      <div class="row items-center justify-end q-gutter-sm">
                        <q-btn label="Cancel" color="primary" flat v-close-popup/>
                        <q-btn label="OK" color="primary" flat @click="saveProxyDueDate" v-close-popup/>
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-btn>
                <q-btn icon="access_time" flat dense no-caps
                       class="wfit text-md fontbold" :label="wisdom._dueTimeFmt">
                  <q-popup-proxy @before-show="updateProxyDueTime" cover transition-show="scale"
                                 transition-hide="scale">
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
                       class="wfit text-subtitle2 fontbold" :label="getHumanReadableDateText(wisdom.duet)">
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
                       class="wfit text-subtitle2 fontbold" :label="wisdom._dueTimeUntilFmt">
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
          </div>
          <div class="flex column gap-4 items-start mt1">
            <div class="flex row gap-2 items-center">
              <q-icon name="watch" size="1rem"/>
              <span class="text-subtitle2 fontbold">{{ wisdom._duration }}</span>
            </div>
          </div>
        </div>
        <q-select
          label="Collaborators"
          color="brand-p"
          bg-color="brand-bg"
          filled
          v-model="wisdom.coll"
          :options="filterOptions"
          @filter="filterCollaboratorOptions"
          use-input
          use-chips
          multiple
          input-debounce="50"
          new-value-mode="add-unique"
          class="wfull"
        />
        <p class="text-body2 fontbold mt4 mb2">
          Content
        </p>
        <div class="wfull relative">
          <editor id="wisdom_desc"
                  ref="wisdom_desc"
                  v-model="wisdom.desc"/>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { useStore } from 'stores/wikistate'
import { ref, toRaw } from 'vue'
import { DateTime } from 'luxon'
import Editor from 'components/EditorComponent.vue'

export default {
  components: { Editor },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    knowledgeId: {
      type: String,
      required: true
    },
    typePreference: {
      type: String,
      default: ''
    },
    typeChangeable: {
      type: Boolean,
      default: true
    },
    wisdomProp: {
      type: Object
    }
  },
  name: 'WisdomEdit',
  emits: ['update', 'create'],
  watch: {
    isOpen () {
      if (!this.wisdomProp ||
        this.wisdom.uid !== this.wisdomProp.uid) {
        this.wisdom = {
          uid: '',
          t: '',
          desc: '',
          keys: ''
        }
      }
      this.show = true
      this.handleDialogOpen()
    },
    wisdomProp () {
      this.wisdom = structuredClone(toRaw(this.wisdomProp))
      if (this.wisdom.type) {
        this.wisdomType = this.wisdom.type
      }
      this.wisdom = this.jsDateToQDate(this.wisdom)
    }
  },
  data () {
    return {
      store: useStore(),
      show: false,
      wisdom: {
        t: '',
        desc: '',
        keys: ''
      },
      proxyTime: '',
      proxyDate: '',
      proxyDateUntil: '',
      proxyTimeUntil: '',
      wisdomBackup: {},
      contributorOptions: [],
      filterOptions: [],
      wisdomType: ref('lesson'),
      wisTypes: [
        {
          label: 'Lesson',
          value: 'lesson',
          icon: 'lightbulb'
        },
        {
          label: 'Question',
          value: 'question',
          icon: 'question_mark'
        },
        {
          label: 'Task',
          value: 'task',
          icon: 'sym_o_calendar_clock'
        }
      ]
    }
  },
  created () {
    this.wisdomBackup = {
      uid: '',
      t: '',
      desc: '',
      keys: ''
    }
  },
  beforeUnmount () {
    this.wisdom = {
      uid: '',
      t: '',
      desc: '',
      keys: ''
    }
  },
  methods: {
    handleDialogOpen: function () {
      if (this.typePreference && this.typePreference !== '') {
        this.wisdomType = this.typePreference
      }
      setTimeout(() => {
        const elem = document.getElementById('wisdom_t')
        if (elem) {
          elem.focus()
        }
      }, 0)
    },
    handleSaveWisdom: function () {
      // Standardize
      this.checkWisdom()
      if (!this.wisdom.t) {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'No Title!',
          caption: 'A title is mandatory.',
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
      // Emit event
      if (this.wisdom.uid) {
        this.$emit('update', this.wisdom)
      } else {
        this.$emit('create', this.wisdom)
      }
      this.wisdom = this.wisdomBackup
      this.show = false
    },
    checkWisdom: function () {
      if (!this.wisdom.pid) {
        this.wisdom.pid = this.knowledgeId
      }
      this.wisdom.type = this.wisdomType
      if (!this.wisdom.type) {
        this.wisdom.type = 'lesson'
      }
      if (!this.wisdom.usr) {
        this.wisdom.usr = this.store.user.username
      }
      this.wisdom.t = this.wisdom.t.trim()
      this.wisdom.keys = this.wisdom.keys.trim()
      this.wisdom.desc = this.wisdom.desc.trim()
    },
    jsDateToQDate: function (date) {
      if (!date.due) return date
      const lux = DateTime.fromISO(date.due)
      date._dueDate = lux.toISODate().replaceAll('-', '/')
      date._dueTime = lux.toISOTime()
      date._dueTimeFmt = lux.toLocaleString(DateTime.TIME_24_SIMPLE)
      if (!date.duet) return date
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
      if (date._dueDate) {
        const dateTmp = date._dueDate.replaceAll('/', '-')
        let timeTmp = date._dueTime
        if (!timeTmp || timeTmp === '') {
          timeTmp = '00:00'
        }
        date.due = DateTime.fromISO(`${dateTmp}T${timeTmp}`)
      }
      if (date._dueDateUntil) {
        const dateTmp = date._dueDateUntil.replaceAll('/', '-')
        let timeTmp = date._dueTimeUntil
        if (!timeTmp || timeTmp === '') {
          timeTmp = '00:00'
        }
        date.duet = DateTime.fromISO(`${dateTmp}T${timeTmp}`)
      }
      return date
    },
    updateProxyDueDate () {
      this.proxyDate = this.wisdom._dueDate
    },
    saveProxyDueDate () {
      this.wisdom._dueDate = this.proxyDate
      this.wisdom = this.qDateToJSDate(this.wisdom)
      this.wisdom = this.jsDateToQDate(this.wisdom)
    },
    updateProxyDueTime () {
      this.proxyTime = this.wisdom._dueTime
    },
    saveProxyDueTime () {
      this.wisdom._dueTime = this.proxyTime
      this.wisdom = this.qDateToJSDate(this.wisdom)
      this.wisdom = this.jsDateToQDate(this.wisdom)
    },
    updateProxyDueDateUntil () {
      this.proxyDateUntil = this.wisdom._dueDateUntil
    },
    saveProxyDueDateUntil () {
      this.wisdom._dueDateUntil = this.proxyDateUntil
      this.wisdom = this.qDateToJSDate(this.wisdom)
      this.wisdom = this.jsDateToQDate(this.wisdom)
    },
    updateProxyDueTimeUntil () {
      this.proxyTimeUntil = this.wisdom._dueTimeUntil
    },
    saveProxyDueTimeUntil () {
      this.wisdom._dueTimeUntil = this.proxyTimeUntil
      this.wisdom = this.qDateToJSDate(this.wisdom)
      this.wisdom = this.jsDateToQDate(this.wisdom)
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
