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
            <span class="fontbold">Submit</span>
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
              <span class="fontbold text-body2">{{ opt.label }}</span>
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
          <q-select
            v-if="wisdom._keys"
            for="event_keys"
            label="Keywords (Enter to add)"
            v-model="wisdom._keys"
            :options="[]"
            label-color="brand-p"
            borderless
            use-input
            use-chips
            multiple
            input-debounce="50"
            new-value-mode="add-unique"
            class="wfull">
            <template v-slot:prepend>
              <q-icon name="sym_o_label"/>
            </template>
          </q-select>
        </div>
        <template v-if="wisdomType === 'task'">
          <div class="flex row gap-6 wfull px4 py2
                      items-start justify-between
                      fmt_border rounded mt4 mb1 background">
            <div class="flex column gap-4">
              <div class="flex row gap-2 items-center">
                <p class="text-subtitle2 fontbold pointer-events-none w12">
                  From
                </p>
                <div class="flex row gap-2 items-center
                            justify-between flex-grow">
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
        </template>
        <template v-if="wisdomType !== 'post'">
          <q-select
            label="Collaborators"
            v-model="wisdom.coll"
            :options="filterOptions"
            @filter="filterCollaboratorOptions"
            label-color="brand-p"
            use-input
            borderless
            use-chips
            multiple
            input-debounce="50"
            class="wfull pl2">
            <template v-slot:prepend>
              <q-icon name="engineering"/>
            </template>
            <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
              <q-item v-bind="itemProps" class="surface">
                <q-item-section>
                  <p class="fontbold text-sm">{{ opt }}</p>
                </q-item-section>
                <q-item-section side>
                  <q-checkbox :model-value="selected"
                              @update:model-value="toggleOption(opt)"/>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </template>
      </div>
      <div class="wfull relative p4">
        <editor id="wisdom_desc"
                ref="wisdom_desc"
                e-id="wisdom_edit_desc"
                :chat-id="chatId"
                v-model="wisdom.desc"
                @fpaste="handleEditorPaste"/>
      </div>
    </q-card>
  </q-dialog>
  <q-dialog v-model="pickingFile">
    <div class="flex column reverse items-center
                relative surface rounded">
      <file-picker
        :uploading="isUploadingImage"
        :upload-progress="uploadingImageProgress"
        :file-ref="filePreference"
        @selected="handleGroupImageSelected"
        @upload="handleGroupImageUpload"/>
      <q-slide-transition :duration="pickDuration">
        <div v-show="selectedImage == null">
          <div class="surface p4 rounded-2 w84 min-h-42
                                  flex column mbauto
                                  items-center justify-center mt1">
            <q-toolbar-title
              class="flex column items-center justify-center
                                   gap-4">
              <q-icon name="interests" size="4rem"/>
              <span class="text-subtitle2">
                                  Select or drop a file to see a preview
                                </span>
            </q-toolbar-title>
          </div>
        </div>
      </q-slide-transition>
    </div>
  </q-dialog>
</template>

<script>

import { useStore } from 'stores/wikistate'
import { ref, toRaw } from 'vue'
import { DateTime } from 'luxon'
import Editor from 'components/EditorComponent.vue'
import FilePicker from 'components/FilePicker.vue'
import { api } from 'boot/axios'

export default {
  components: {
    FilePicker,
    Editor
  },
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
    },
    chatId: {
      type: String,
      default: null
    }
  },
  name: 'WisdomEdit',
  emits: ['update', 'create'],
  watch: {
    isOpen () {
      if (this.wisdomProp) {
        this.wisdom = structuredClone(toRaw(this.wisdomProp))
        if (this.wisdom.type) {
          this.wisdomType = this.wisdom.type
        }
        this.wisdom = this.jsDateToQDate(this.wisdom)
        if (this.wisdom.keys && this.wisdom.keys.length > 0) {
          this.wisdom._keys = this.wisdom.keys.split(',')
        } else {
          this.wisdom._keys = []
        }
      }
      if (!this.wisdomProp ||
        this.wisdom.uid !== this.wisdomProp.uid) {
        this.wisdom = {
          uid: '',
          t: '',
          desc: '',
          keys: '',
          _keys: []
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
      if (this.wisdom.keys && this.wisdom.keys.length > 0) {
        this.wisdom._keys = this.wisdom.keys.split(',')
      } else {
        this.wisdom._keys = []
      }
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
      pickDuration: 0,
      selectedImage: undefined,
      pickingFile: false,
      uploadingImageProgress: 0,
      isUploadingImage: false,
      filePreference: null,
      wisdomType: ref('lesson'),
      internal: new BroadcastChannel('wikiric_internal'),
      members: new Map(),
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
        },
        {
          label: 'Post',
          value: 'post',
          icon: 'sym_o_web_stories'
        },
        {
          label: 'Course',
          value: 'course',
          icon: 'sym_o_topic'
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
        this.getMainMembers()
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
      if (this.wisdom._keys) {
        this.wisdom.keys = this.wisdom._keys.join(',')
        delete this.wisdom._keys
      }
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
      let lux
      let luxt
      if (date.due) {
        lux = DateTime.fromISO(date.due)
        date._dueDate = lux.toISODate().replaceAll('-', '/')
        date._dueTime = lux.toISOTime()
        date._dueTimeFmt = lux.toLocaleString(DateTime.TIME_24_SIMPLE)
      }
      if (date.duet) {
        luxt = DateTime.fromISO(date.duet)
        date._dueDateUntil = luxt.toISODate().replaceAll('-', '/')
        date._dueTimeUntil = luxt.toISOTime()
        date._dueTimeUntilFmt = luxt.toLocaleString(DateTime.TIME_24_SIMPLE)
        let dur = luxt.diff(lux).as('minutes')
        if (dur >= 120) {
          dur = dur / 60
          date._duration = dur.toFixed(2) + ' hour'
        } else {
          date._duration = dur.toFixed(2) + ' minute'
        }
        if (dur > 1) date._duration += 's'
      }
      return date
    },
    qDateToJSDate: function (date) {
      let dateTmp
      let timeTmp
      if (date._dueTime && !date._dueDate) {
        const now = DateTime.now()
        date._dueDate = `${now.year}-${now.month}-${now.day}`
      }
      if (date._dueDate) {
        dateTmp = date._dueDate.replaceAll('/', '-')
        if (!date._dueTime) {
          date._dueTime = '00:00'
        }
        timeTmp = date._dueTime
        date.due = DateTime.fromISO(`${dateTmp}T${timeTmp}`)
      }
      if (date._dueTimeUntil && !date._dueDateUntil) {
        const now = DateTime.now()
        date._dueDateUntil = `${now.year}-${now.month}-${now.day}`
      }
      if (date._dueDateUntil) {
        dateTmp = date._dueDateUntil.replaceAll('/', '-')
        if (!date._dueTimeUntil) {
          date._dueTimeUntil = '23:59'
        }
        timeTmp = date._dueTimeUntil
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
    },
    handleGroupImageSelected: function (resp) {
      this.selectedImage = resp
      if (resp != null) {
        this.pickDuration = 0
      }
      setTimeout(() => {
        this.pickDuration = 300
      }, 300)
    },
    handleGroupImageUpload: function () {
      this.uploadImage()
    },
    uploadImage: function () {
      this.isUploadingImage = true
      const vThis = this
      const config = {
        onUploadProgress: function (progressEvent) {
          vThis.uploadingImageProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total)
        }
      }
      const payload = {
        base64: this.selectedImage.base64,
        name: this.selectedImage.name
      }
      api.post(
        'files/private/create',
        payload,
        config
      ).then((response) => {
        this.processUploadSnippetResponse(response.data)
      }).catch((err) => console.debug(err.message))
    },
    processUploadSnippetResponse: async function (response) {
      const contentURL = this.store.serverIP + 'files/public/get/' + response.trim()
      this.internal.postMessage({
        app: 'editor',
        id: 'wisdom_edit_desc',
        type: 'add',
        payload: {
          type: 'node',
          tag: 'img',
          src: contentURL
        }
      })
      this.isUploadingImage = false
      this.pickingFile = false
    },
    handleEditorPaste: function (e) {
      const items = (e.clipboardData ?? e.originalEvent.clipboardData).items
      for (const item of items) {
        if (item.kind === 'file') {
          e.preventDefault()
          e.stopPropagation()
          const blob = item.getAsFile()
          const reader = new FileReader()
          reader.onload = () => {
            this.pickingFile = true
            setTimeout(() => {
              this.filePreference = blob
              // this.$refs.ref_editor.focus()
              this.inputResize()
            }, 200)
          }
          reader.readAsDataURL(blob)
        }
      }
    },
    /**
     *
     * @returns {Promise<void>}
     */
    getMainMembers: async function () {
      api({
        url: 'chat/private/users/members/' + this.chatId
      })
      .then((response) => {
        this.members = new Map()
        this.contributorOptions = []
        if (response.data.members && response.data.members.length > 0) {
          // Parse JSON serialized users for performance
          let member
          for (let i = 0; i < response.data.members.length; i++) {
            // Main Members
            member = response.data.members[i]
            // Set keys for easy searching
            member._keys = member.usr + ' ' + member.name
            member._hint = member.name
            this.members.set(member.usr, member)
            this.contributorOptions.push(member.usr)
          }
        }
      })
      .catch(() => {
        this.members = new Map()
        this.contributorOptions = []
      })
    }
  }
}
</script>

<style scoped>

</style>
