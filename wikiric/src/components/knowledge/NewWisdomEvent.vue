<template>
  <q-dialog full-height full-width
            v-model="show" class="" @before-hide="handleClose">
    <div id="new_task_outside"
         class="wfull hfull flex gap-2 justify-center"
         @click="handleOutsideClick">
      <div id="new_task_container" class="background wfull rounded fmt_border
               overflow-x-hidden overflow-y-scroll"
           style="max-width: 700px !important; max-height: 93dvh !important;">
        <div class="background sticky top-0 z-fab px4 h-[60px]
                    fmt_border_bottom
                    flex items-center justify-between">
          <span class="text-h5 fontbold pointer-events-none">
            <template v-if="!isEdit">
              New {{ title }}
            </template>
            <template v-else>
              {{ title }}
            </template>
          </span>
          <div class="flex gap-4">
            <template v-if="isEdit">
              <q-btn color="brand-bg" text-color="brand-p"
                     icon="delete"
                     label="Delete" no-caps flat
                     class="px3 py2 fontbold"
                     @click="deleteDate"/>
              <q-btn color="brand-bg" text-color="brand-p"
                     icon="save"
                     label="Save" no-caps flat
                     class="px3 py2 fontbold"
                     @click="createDate"/>
            </template>
            <template v-else>
              <q-btn color="primary"
                     icon="add"
                     :label="'Create ' + title" no-caps
                     class="px3 py2 fontbold"
                     @click="createDate"/>
            </template>
            <q-btn color="brand-bg" text-color="brand-p"
                   icon="close"
                   label="Close" no-caps flat
                   class="px3 py2 fontbold"
                   @click="handleDiscard"/>
          </div>
        </div>
        <div class="flex row gap-6 wfull px3 py2
                    background items-start justify-between">
          <div class="flex column gap-1">
            <div class="flex row gap-2 items-center">
              <p class="text-subtitle2 fontbold pointer-events-none w12">
                From
              </p>
              <div class="flex row gap-2 items-center justify-between flex-grow">
                <q-btn icon="event" flat dense no-caps
                       class="wfit text-subtitle2 fontbold" :label="getHumanReadableDateText(date.due)">
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
                       class="wfit text-subtitle2 fontbold" :label="date._dueTimeFmt">
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
          </div>
          <div v-if="date._duration"
               class="flex row gap-2 items-center
                      mt2 surface p2 wfit
                      rounded-2">
            <q-icon name="watch" size="1rem"/>
            <span class="text-body2 fontbold">{{ date._duration }}</span>
          </div>
          <div class="flex column gap-4 items-start mt1">
            <template v-if="date.uid">
              <div class="flex column gap-2 items-center">
                <q-btn icon="north_east" dense no-caps
                       align="left"
                       label="View Task"
                       color="brand-bg"
                       text-color="brand-p"
                       class="text-md fontbold px4 py2 wfull"
                       @click="gotoWisdom"/>
                <q-btn icon="check" dense no-caps
                       align="left"
                       label="Finish Task"
                       color="primary"
                       class="text-md fontbold px4 py2 wfull"
                       @click="finishDate"/>
              </div>
            </template>
          </div>
        </div>
        <div class="wfull">
          <q-select
            v-if="date._keys"
            for="event_keys"
            label="Keywords"
            v-model="date._keys"
            :options="[]"
            label-color="brand-p"
            borderless
            use-input
            use-chips
            multiple dense
            input-debounce="50"
            new-value-mode="add-unique"
            class="wfull px3 background">
            <template v-slot:prepend>
              <q-icon name="sym_o_label"/>
            </template>
          </q-select>
          <q-select
            label="Collaborators"
            v-model="date.coll"
            :options="filterOptions"
            @filter="filterCollaboratorOptions"
            label-color="brand-p"
            use-input
            borderless
            use-chips
            multiple dense
            input-debounce="50"
            class="wfull px3 pb2 background">
            <template v-slot:prepend>
              <q-icon name="engineering"/>
            </template>
            <template v-slot:option="{ itemProps, opt, selected, toggleOption }">
              <q-item v-bind="itemProps">
                <q-item-section>
                  <p class="fontbold text-sm">{{ opt }}</p>
                </q-item-section>
                <q-item-section side>
                  <q-toggle :model-value="selected" @update:model-value="toggleOption(opt)"/>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="mt1 surface sticky top-0 wfull z-top fmt_border_bottom">
          <q-input
            for="event_t"
            ref="event_t"
            label="Title"
            color="brand-p"
            input-class="fontbold"
            borderless dense
            label-color="brand-p"
            v-model="date.t"
            class="pb2 text-xl px3 pt1 fmt_border_top">
            <template v-slot:prepend>
              <q-icon name="sym_o_event"/>
            </template>
          </q-input>
        </div>
        <div class="background p1 fmt_border_bottom">
          <editor v-model="date.desc" ref="ref_editor"
                  @autosave="noAutoSave = false"
                  placeholder="Describe this Task…"/>
        </div>
        <div v-if="related && related.tasks && related.tasks.length > 0"
             class="mx1 pb1 mt2">
          <p class="px4 text-sm fontbold">
            {{ taskProgress }} / {{ related.tasks.length }} Tasks completed
          </p>
          <div class="wfull flex justify-end pr2">
            <q-btn flat icon="sym_o_add"
                   align="left"
                   no-caps dense
                   @click="handleAddTask">
              <span class="ml4 text-body1">Add Task</span>
            </q-btn>
          </div>
          <q-slider v-model="taskProgress" :min="0" :max="related.tasks.length"
                    readonly
                    color="primary"
                    track-size="16px" thumb-size="0px"
                    class="w-full px4"/>
          <div class="wfull flex column gap-2 pl2">
            <div v-for="task in related.tasks" :key="task.uid"
                 class="wfull fmt_border_top fmt_border_left"
                 style="border-left-color: var(--md-sys-color-primary);
                        border-left-width: 6px">
              <div class="flex gap-2 items-center wfull">
                <q-checkbox :model-value="task.done"
                            @update:model-value="handleFinishWisdom(task.uid)"/>
                <div class="flex-grow">
                  <div class="flex gap-2 items-center wfull">
                    <p class="text-xs font-600 pt1 pl1 italic">
                      Added {{ getHumanReadableDateText(task.ts) }}
                    </p>
                    <div v-if="task.done"
                         class="flex gap-2 items-center">
                      <q-icon name="check"/>
                      <p class="text-xs font-600">
                        Completed {{ getHumanReadableDateText(task.tsd) }}
                      </p>
                    </div>
                    <q-btn icon="sym_o_delete" label="Delete"
                           size="0.7rem"
                           class="font-600 mlauto"
                           dense flat unelevated no-caps
                           @click="handleDeleteWisdom(task.uid)"/>
                  </div>
                  <div class="flex gap-2 items-center wfull">
                    <q-btn class="text-sm fontbold cursor-text"
                           unelevated flat dense no-caps>
                      {{ task.t }}
                      <q-popup-edit v-model="task.t" buttons v-slot="scope"
                                    @show="editingTask = task"
                                    @save="handleTaskEdit"
                                    color="brand-p"
                                    class="z-top">
                        <q-input v-model="scope.value"
                                 class="wfull min-w-[50dvw] <md:w-screen"
                                 dense autofocus counter
                                 @keyup.enter="scope.set"/>
                      </q-popup-edit>
                    </q-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="mx1 pb1 mt2">
          <div class="wfull flex justify-end pr2">
            <q-btn flat icon="sym_o_add"
                   align="left"
                   no-caps dense
                   @click="handleAddTask">
              <span class="ml4 text-body1">Add Task</span>
            </q-btn>
          </div>
        </div>
        <div v-if="related && related.replies && related.replies.length > 0"
             class="mx1 pb1">
          <p class="mt4 mb2 mx2 text-subtitle2">
            Comments:
            <span class="ml1">{{ related.replies.length }}</span>
          </p>
          <div class="mx1 my2 background">
            <editor v-model="comment" ref="ref_editor_comment" hide-menu
                    placeholder="Write a comment…"/>
          </div>
          <div class="flex row wfull my2 pr1">
            <q-btn icon="sym_o_send" label="Post Comment"
                   color="primary"
                   class="mlauto"
                   no-caps
                   @click="postComment"/>
          </div>
          <div class="wfull flex column gap-2">
            <template v-for="reply in related.replies" :key="reply.uid">
              <div class="surface px3 pt2 pb4 rounded">
                <div class="mb2 flex justify-between items-start gap-3">
                  <p>
                    <span class="fontbold">{{ reply.name }}</span>
                  </p>
                  <span class="text-subtitle2">
                    {{ reply._ts }}
                  </span>
                </div>
                <div v-html="reply.desc" class="markedView"></div>
              </div>
            </template>
          </div>
        </div>
        <div v-else>
          <template v-if="isEdit">
            <p class="text-subtitle2 p2">No Comments</p>
            <div class="mx1 my2 background">
              <editor v-model="comment" ref="ref_editor_comment" hide-menu
                      placeholder="Write a comment…"/>
            </div>
            <div class="flex row wfull mb2 pr1">
              <q-btn icon="sym_o_send" label="Post Comment"
                     color="primary"
                     class="mlauto"
                     no-caps
                     @click="postComment"/>
            </div>
          </template>
        </div>
      </div>
      <div class="wfit <lg:flex-grow max-w-[700px] flex column gap-2 hfit">
        <div class="background rounded fmt_border p2">
          <table style="margin: 0 !important;">
            <tr>
              <td class="text-sm pr1">Created:</td>
              <td class="text-sm">
                {{ getHumanReadableDateText(date.ts, true, true) }}
              </td>
            </tr>
            <tr>
              <td class="text-sm pr1">Author:</td>
              <td class="text-sm">
                <template v-if="date._author">
                  {{ date._author }}
                </template>
                <template v-else>
                  {{ date.usr }}
                </template>
              </td>
            </tr>
            <tr v-if="chatroom">
              <td class="text-sm pr1">Group:</td>
              <td class="text-sm">
                {{ chatroom.t }}
              </td>
            </tr>
            <tr v-if="knowledge">
              <td class="text-sm pr1">Knowledge:</td>
              <td class="text-sm">
                {{ knowledge.t }}
              </td>
            </tr>
          </table>
        </div>
        <div class="background rounded fmt_border p2">
          <q-btn label="Add Task"
                 icon="sym_o_add"
                 align="left"
                 class="wfull transparent"
                 no-caps unelevated flat
                 @click="handleAddTask"/>
        </div>
      </div>
    </div>
  </q-dialog>
</template>

<script>

import { DateTime } from 'luxon'
import Editor from 'components/EditorComponent.vue'
import { api } from 'boot/axios'
import { dbGetDisplayName } from 'src/libs/wikistore'

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
    },
    title: {
      type: String,
      default: 'Event'
    },
    chatroom: {
      type: Object,
      default: null
    },
    knowledge: {
      type: Object,
      default: null
    },
    backRefUrl: {
      type: String,
      default: null
    }
  },
  name: 'NewWisdomEvent',
  emits: ['create', 'delete', 'update', 'finish', 'close'],
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (this.show) {
        this.handleDialogOpen()
      }
    },
    newEvent (newDate) {
      this.date = newDate
      this.date = this.jsDateToQDate(this.date)
      if (this.date.keys && this.date.keys.length > 0) {
        this.date._keys = this.date.keys.split(',')
      } else {
        this.date._keys = []
      }
      dbGetDisplayName(this.date.usr).then((name) => {
        if (!name) return
        this.date._author = name
      })
      if (!this.gotRelated || !this.related) {
        this.getRelated()
      }
    }
  },
  computed: {
    taskProgress () {
      if (!this.related || !this.related.tasks || this.related.tasks.length < 1) {
        return 0
      }
      let done = 0
      for (let i = 0; i < this.related.tasks.length; i++) {
        if (this.related.tasks[i].done) {
          done += 1
        }
      }
      return done
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
      dateCopy: null,
      proxyDate: '',
      proxyTime: '',
      proxyDateUntil: '',
      proxyTimeUntil: '',
      duration: '',
      contributorOptions: [],
      filterOptions: [],
      members: new Map(),
      related: null,
      comment: '',
      noAutoSave: true,
      editingTask: null,
      gotRelated: false
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.gotRelated = false
      if (this.date.t === '') {
        setTimeout(() => {
          const elem = this.$refs.event_t
          if (elem) {
            elem.focus()
          }
        }, 0)
      }
      this.getMainMembers()
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
    createDate: function () {
      this.date = this.qDateToJSDate(this.date)
      if (!this.isEdit) {
        let dueString
        if (this.date.due) {
          dueString = this.date.due.toJSDate().toISOString()
        }
        let keysT = ''
        if (this.date._keys) {
          keysT = this.date._keys.join(',')
        }
        this.$emit('create', {
          t: this.date.t,
          desc: this.date.desc,
          keys: keysT,
          due: dueString,
          duet: this.date.duet,
          coll: this.date.coll
        })
      } else {
        if (this.date._keys) {
          this.date.keys = this.date._keys.join(',')
        }
        delete this.date._dueTime
        delete this.date._dueDate
        delete this.date._dueTimeUntil
        delete this.date._dueDateUntil
        delete this.date._keys
        delete this.date._author
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
      if (this.backRefUrl) {
        this.$router.push(`/wisdom?id=${this.date.uid}&backrefurl=${this.backRefUrl.trim()}`)
      } else {
        this.$router.push(`/wisdom?id=${this.date.uid}&backrefurl=/planner?id=${this.chatroom.uid.trim()}`)
      }
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
      if (!date) return ''
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
    /**
     *
     * @returns {Promise<void>}
     */
    getMainMembers: async function () {
      api({
        url: 'chat/private/users/members/' + this.chatroom.uid
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
    },
    handleClose: function () {
      if (this.isEdit && !this.noAutoSave) {
        // Auto-Save
        if (this.date._keys) {
          this.date.keys = this.date._keys.join(',')
        }
        delete this.date._dueTime
        delete this.date._dueDate
        delete this.date._dueTimeUntil
        delete this.date._dueDateUntil
        delete this.date._keys
        this.$emit('update', this.date)
      }
      this.$emit('close')
      this.show = false
    },
    getRelated: async function (onlyTasks = false) {
      if (!this.date.uid) return
      return new Promise((resolve) => {
        const guid = this.date.uid
        api({
          url: 'wisdom/private/investigate/' + guid
        })
        .then(async (response) => {
          if (!onlyTasks) {
            this.related = response.data
            let dName
            if (this.related.replies) {
              for (let i = 0; i < this.related.replies.length; i++) {
                this.related.replies[i]._time = DateTime.fromISO(this.related.replies[i].ts)
                this.related.replies[i]._ts = this.getHumanReadableDateText(this.related.replies[i]._time, true, true)
                dName = await dbGetDisplayName(this.related.replies[i].usr)
                if (dName == null) {
                  dName = this.related.replies[i].usr
                }
                this.related.replies[i].name = dName
              }
            }
            if (this.related.answers) {
              for (let i = 0; i < this.related.answers.length; i++) {
                this.related.answers[i]._time = DateTime.fromISO(this.related.answers[i].ts)
                this.related.answers[i]._ts = this.getHumanReadableDateText(this.related.answers[i]._time, true, true)
                dName = await dbGetDisplayName(this.related.answers[i].usr)
                if (dName == null) {
                  dName = this.related.answers[i].usr
                }
                this.related.answers[i].name = dName
              }
            }
            if (this.related.ref) {
              this.related.ref.ts = DateTime.fromISO(this.related.ref.ts)
              dName = await dbGetDisplayName(this.related.ref.usr)
              if (dName == null) {
                dName = this.related.ref.usr
              }
              this.related.ref.name = dName
            }
          } else {
            if (response.data.tasks) {
              this.related.tasks = []
              let dName
              for (let i = 0; i < response.data.tasks.length; i++) {
                if (response.data.tasks[i].uid !== this.wisdom.uid) {
                  response.data.tasks[i].t = this.formatTitle(response.data.tasks[i].t)
                  response.data.tasks[i].ts = DateTime.fromISO(response.data.tasks[i].ts)
                  dName = await dbGetDisplayName(response.data.tasks[i].usr)
                  if (dName == null) {
                    dName = response.data.tasks[i].usr
                  }
                  response.data.tasks[i].name = dName
                  this.related.tasks.push(response.data.tasks[i])
                }
              }
            }
          }
          this.gotRelated = true
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    postComment: async function () {
      if (this.comment.trim() === '') return
      const payload = {
        t: '',
        desc: this.comment.trim(),
        ref: this.date.uid,
        keys: '',
        type: 'reply',
        pid: this.knowledge.uid
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/reply',
          data: payload
        }).then(() => {
          this.comment = ''
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Comment sent!',
            caption: 'Thanks for contributing.',
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
        }).then(() => {
          this.getRelated()
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    handleDiscard: function () {
      this.noAutoSave = true
      this.$emit('close')
    },
    handleAddTask: function () {
      const payload = {
        t: 'New Task',
        desc: '',
        keys: '',
        pid: this.knowledge.uid,
        copy: '',
        cats: [],
        type: 'task',
        row: 0,
        ref: this.date.uid
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
          this.getRelated()
          resolve()
        })
      })
    },
    handleFinishWisdom: function (uid) {
      if (uid == null || uid === '') return
      return new Promise((resolve) => {
        api({
          url: 'wisdom/private/finish/' + uid
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Task Finished!',
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
          this.getRelated()
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner or collaborator of this task.',
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
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    handleTaskEdit: function () {
      if (!this.editingTask) {
        return
      }
      setTimeout(() => {
        this.handleWisdomUpdate(this.editingTask)
        this.editingTask = null
      }, 100)
    },
    handleWisdomUpdate: function (wisdom) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/edit/' + wisdom.uid,
          data: wisdom
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Wisdom Updated!',
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
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Wisdom.',
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
          console.debug(err.message)
        }).finally(() => {
          this.getRelated()
          resolve()
        })
      })
    },
    handleDeleteWisdom: function (uid) {
      if (!uid || uid === '') {
        return
      }
      return new Promise((resolve) => {
        api({
          url: 'wisdom/private/delete/' + uid
        })
        .then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Wisdom Deleted!',
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
        })
        .catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Wisdom.',
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
          console.debug(err.message)
        }).finally(() => {
          this.getRelated()
          resolve()
        })
      })
    },
    handleOutsideClick: function (e) {
      if (!e.target) {
        return
      }
      if (e.target.id === 'new_task_outside') {
        this.handleClose()
      }
    }
  }
}
</script>

<style scoped>

</style>
