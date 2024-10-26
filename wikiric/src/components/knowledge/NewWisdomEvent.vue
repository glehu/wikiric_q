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
          <span class="text-lg fontbold pointer-events-none">
            <template v-if="!isEdit">
              New {{ title }}
            </template>
            <template v-else>
              {{ title }}
            </template>
          </span>
          <div class="flex gap-2">
            <template v-if="isEdit">
              <template v-if="deleteCounter === 0">
                <q-btn color="brand-bg" text-color="brand-p"
                       icon="delete"
                       label="Delete" no-caps flat dense
                       class="fontbold"
                       @click="setDeleteCounter"/>
              </template>
              <template v-else-if="deleteCounter === 1">
                <q-btn icon="delete" label="Confirm Delete"
                       class="fontbold"
                       color="negative"
                       @click="deleteDate"/>
              </template>
              <q-btn color="brand-bg" text-color="brand-p"
                     icon="save"
                     label="Save" no-caps flat dense
                     class="fontbold"
                     @click="createDate"/>
            </template>
            <template v-else>
              <q-btn color="primary"
                     icon="add"
                     :label="'Create ' + title" no-caps dense
                     class="fontbold"
                     @click="createDate"/>
            </template>
            <q-btn color="brand-bg" text-color="brand-p"
                   icon="close"
                   label="Close" no-caps flat dense
                   class="fontbold"
                   @click="handleDiscard"/>
          </div>
        </div>
        <div class="flex row gap-6 wfull px3 py2
                    background items-start justify-between">
          <div class="flex column gap-1 px1">
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
          <div class="flex column gap-4 items-start mt1 <md:ml-auto">
            <template v-if="date.uid">
              <div class="flex md:flex-col gap-2 items-center">
                <q-btn icon="north_east" dense no-caps
                       align="left"
                       label="View Task"
                       color="brand-bg"
                       text-color="brand-p"
                       class="text-md fontbold px4 py2 md:wfull"
                       @click="gotoWisdom(date.uid)"/>
                <q-btn icon="check" dense no-caps
                       align="left"
                       label="Finish Task"
                       color="primary"
                       class="text-md fontbold px4 py2 md:wfull"
                       @click="finishDate"/>
              </div>
            </template>
          </div>
        </div>
        <div class="wfull flex mb2 px3 gap-1">
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
            class="background flex-grow">
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
            class="background flex-grow">
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
        </div>
        <div class="mt1 sticky top-0 wfull z-top">
          <div class="pb2 px3 pt1 mx1 surface rounded fmt_border">
            <q-input
              for="event_t"
              ref="event_t"
              label="Title"
              color="brand-p"
              input-class="fontbold"
              borderless dense
              label-color="brand-p"
              v-model="date.t"
              class="text-xl">
              <template v-slot:prepend>
                <q-icon name="sym_o_event"/>
              </template>
            </q-input>
          </div>
        </div>
        <div class="background p1">
          <editor v-model="date.desc" ref="ref_editor"
                  :chat-id="chatroom.uid"
                  @autosave="noAutoSave = false"
                  placeholder="Describe this Task…"/>
        </div>
        <q-toolbar class="wfull flex items-center justify-end gap-2">
          <q-btn v-if="related && related.replies && related.replies.length > 0"
                 no-caps dense
                 label="View Comments"
                 color="brand-bg"
                 text-color="brand-p"
                 class="px2"
                 @click="handleGoToComments"/>
          <q-btn icon="sym_o_assignment_add"
                 label="Add Proposal"
                 align="left"
                 color="brand-bg"
                 text-color="brand-p"
                 class="pr2"
                 no-caps dense
                 @click="handleAddProposal"/>
          <q-btn icon="sym_o_add"
                 label="Add Task"
                 align="left"
                 color="brand-bg"
                 text-color="brand-p"
                 class="pr2"
                 no-caps dense
                 @click="handleAddTask"/>
        </q-toolbar>
        <div v-if="related && related.proposals && related.proposals.length > 0"
             class="mx1 pb1 mt1">
          <q-expansion-item default-opened class="wfull">
            <template v-slot:header>
              <div class="wfull flex items-center gap-2">
                <p class="text-sm fontbold">
                  {{ related.proposals.length }} {{ proposalWord }}
                </p>
              </div>
            </template>
            <div class="wfull flex column gap-2 pl2">
              <div v-for="proposal in related.proposals" :key="proposal.uid"
                   class="wfull fmt_border_top fmt_border_left mb1"
                   style="border-left-color: var(--md-sys-color-primary);
                        border-left-width: 6px">
                <div class="flex gap-1 items-center wfull no-wrap">
                  <template v-if="canWrite">
                    <q-checkbox :model-value="proposal.done"
                                class="ml1"
                                @update:model-value="handleFinishWisdom(proposal.uid)"/>
                  </template>
                  <template v-else>
                    <div class="w-2"></div>
                  </template>
                  <div class="flex-grow">
                    <div class="flex gap-2 items-center wfull pt1 px1">
                      <q-icon name="person"/>
                      <p class="text-xs font-600">
                        {{ proposal.name }}
                      </p>
                      <q-icon name="schedule"/>
                      <p class="text-xs font-600">
                        {{ getHumanReadableDateText(proposal.ts) }}
                      </p>
                      <template v-if="proposal.done">
                        <q-icon name="check" class="font-900"/>
                        <p class="text-xs font-600">
                          {{ getHumanReadableDateText(proposal.tsd) }}
                        </p>
                      </template>
                      <q-btn-group class="mlauto pr1 gap-2"
                                   flat unelevated square>
                        <q-btn icon="sym_o_delete" label="Delete"
                               size="0.7rem"
                               class="font-600"
                               dense flat unelevated no-caps
                               @click="handleDeleteWisdom(proposal.uid)"/>
                        <q-btn icon="north_east" label="View"
                               size="0.7rem"
                               class="font-600"
                               dense flat unelevated no-caps
                               @click="gotoWisdom(proposal.uid)"/>
                        <template v-if="canWrite && !proposal.done">
                          <q-btn icon="sym_o_check"
                                 label="Accept Proposal"
                                 color="positive"
                                 size="0.7rem"
                                 class="font-700 pr2"
                                 no-caps dense unelevated
                                 @click="handleFinishWisdom(proposal.uid)"/>
                        </template>
                      </q-btn-group>
                    </div>
                    <div class="flex gap-2 items-center wfull">
                      <q-btn class="text-sm fontbold cursor-text wfit"
                             align="left"
                             unelevated flat dense no-caps>
                        <p class="text-start wfit">
                          {{ proposal.t }}
                        </p>
                        <q-popup-edit v-model="proposal.t" buttons v-slot="scope"
                                      @show="editingTask = proposal"
                                      @save="handleTaskEdit"
                                      color="brand-p"
                                      class="z-top">
                          <q-input v-model="scope.value"
                                   class="wfull min-w-[50dvw] <md:w-screen"
                                   dense autofocus counter
                                   @focus="(input) => input.target.select()"
                                   @keyup.enter="scope.set"/>
                        </q-popup-edit>
                      </q-btn>
                      <q-btn v-if="!proposal.desc || proposal.desc === ''"
                             class="text-sm fontbold cursor-pointer wfit"
                             align="left"
                             unelevated flat dense no-caps>
                        +
                        <q-icon name="sym_o_description" size="1.2rem"/>
                        <q-popup-edit v-model="proposal.desc" buttons v-slot="scope"
                                      @show="editingTask = proposal"
                                      @save="handleTaskEditDesc"
                                      color="brand-p"
                                      class="z-top wfull">
                          <editor v-model="scope.value"
                                  :chat-id="chatroom.uid"/>
                        </q-popup-edit>
                      </q-btn>
                    </div>
                    <q-expansion-item v-if="proposal.desc && proposal.desc !== ''"
                                      dense dense-toggle header-class="mx0 px1"
                                      class="wfull">
                      <template v-slot:header>
                        <div class="flex items-center
                                    justify-between gap-2 pr2">
                          <q-icon name="sym_o_description" size="1.2rem"/>
                        </div>
                      </template>
                      <q-btn class="text-sm font-500 cursor-text wfit"
                             align="left"
                             unelevated flat dense no-caps>
                        <div v-html="proposal.desc"
                             class="markedView text-start wfull"
                             style="word-break: break-word !important;"></div>
                        <q-popup-edit v-model="proposal.desc" buttons v-slot="scope"
                                      @show="editingTask = proposal"
                                      @save="handleTaskEditDesc"
                                      color="brand-p"
                                      class="z-top wfull">
                          <editor v-model="scope.value"
                                  :chat-id="chatroom.uid"/>
                        </q-popup-edit>
                      </q-btn>
                    </q-expansion-item>
                  </div>
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
        <div v-if="related && related.tasks && related.tasks.length > 0"
             class="mx1 pb1 mt1">
          <q-expansion-item default-opened class="wfull">
            <template v-slot:header>
              <div class="wfull flex items-center gap-2">
                <p class="text-sm fontbold">
                  {{ taskProgress }} / {{ related.tasks.length }} {{ taskWord }} completed
                </p>
              </div>
            </template>
            <q-slider v-model="taskProgress" :min="0" :max="related.tasks.length"
                      readonly
                      color="primary"
                      track-size="16px" thumb-size="0px"
                      class="w-full px4"/>
            <div class="wfull flex column gap-2 pl2">
              <div v-for="task in related.tasks" :key="task.uid"
                   class="wfull fmt_border_top fmt_border_left mb1"
                   style="border-left-color: var(--md-sys-color-primary);
                        border-left-width: 6px">
                <div class="flex gap-1 items-center wfull no-wrap">
                  <q-checkbox :model-value="task.done"
                              class="ml1"
                              @update:model-value="handleFinishWisdom(task.uid)"/>
                  <div class="flex-grow">
                    <div class="flex gap-2 items-center wfull pt1 px1">
                      <q-icon name="person"/>
                      <p class="text-xs font-600 italic">
                        {{ task.name }}
                      </p>
                      <q-icon name="schedule"/>
                      <p class="text-xs font-600">
                        {{ getHumanReadableDateText(task.ts) }}
                      </p>
                      <template v-if="task.done">
                        <q-icon name="check" class="font-900"/>
                        <p class="text-xs font-600">
                          {{ getHumanReadableDateText(task.tsd) }}
                        </p>
                      </template>
                      <q-btn-group class="mlauto pr1 gap-2" flat unelevated>
                        <q-btn icon="sym_o_delete" label="Delete"
                               size="0.7rem"
                               class="font-600"
                               dense flat unelevated no-caps
                               @click="handleDeleteWisdom(task.uid)"/>
                        <q-btn icon="north_east" label="View"
                               size="0.7rem"
                               class="font-600"
                               dense flat unelevated no-caps
                               @click="gotoWisdom(task.uid)"/>
                      </q-btn-group>
                    </div>
                    <div class="flex gap-2 items-center wfull">
                      <q-btn class="text-sm fontbold cursor-text wfit"
                             align="left"
                             unelevated flat dense no-caps>
                        <p class="text-start wfit">
                          {{ task.t }}
                        </p>
                        <q-popup-edit v-model="task.t" buttons v-slot="scope"
                                      @show="editingTask = task"
                                      @save="handleTaskEdit"
                                      color="brand-p"
                                      class="z-top">
                          <q-input v-model="scope.value"
                                   class="wfull min-w-[50dvw] <md:w-screen"
                                   dense autofocus counter
                                   @focus="(input) => input.target.select()"
                                   @keyup.enter="scope.set"/>
                        </q-popup-edit>
                      </q-btn>
                      <q-btn v-if="!task.desc || task.desc === ''"
                             class="text-sm fontbold cursor-pointer wfit"
                             align="left"
                             unelevated flat dense no-caps>
                        +
                        <q-icon name="sym_o_description" size="1.2rem"/>
                        <q-popup-edit v-model="task.desc" buttons v-slot="scope"
                                      @show="editingTask = task"
                                      @save="handleTaskEditDesc"
                                      color="brand-p"
                                      class="z-top">
                          <editor v-model="scope.value"
                                  :chat-id="chatroom.uid"/>
                        </q-popup-edit>
                      </q-btn>
                    </div>
                    <q-expansion-item v-if="task.desc && task.desc !== ''"
                                      dense dense-toggle header-class="mx0 px1"
                                      class="wfull">
                      <template v-slot:header>
                        <div class="flex items-center
                                    justify-between gap-2 pr2">
                          <q-icon name="sym_o_description" size="1.2rem"/>
                        </div>
                      </template>
                      <q-btn class="text-sm font-500 cursor-text wfit"
                             align="left"
                             unelevated flat dense no-caps>
                        <div v-html="task.desc"
                             class="markedView text-start wfull"
                             style="word-break: break-word !important;"></div>
                        <q-popup-edit v-model="task.desc" buttons v-slot="scope"
                                      @show="editingTask = task"
                                      @save="handleTaskEditDesc"
                                      color="brand-p"
                                      class="z-top">
                          <editor v-model="scope.value"
                                  :chat-id="chatroom.uid"/>
                        </q-popup-edit>
                      </q-btn>
                    </q-expansion-item>
                  </div>
                </div>
              </div>
            </div>
          </q-expansion-item>
        </div>
        <div id="new_wis_comments"
             v-if="related && related.replies && related.replies.length > 0"
             class="mx1 pb1">
          <p class="mt4 mb2 mx2 text-subtitle2">
            Comments:
            <span class="ml1">{{ related.replies.length }}</span>
          </p>
          <div class="mx1 my2 background">
            <editor v-model="comment" ref="ref_editor_comment" hide-menu
                    :chat-id="chatroom.uid"
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
                <div v-html="reply.desc" class="markedView"
                     style="word-break: break-word !important;"></div>
              </div>
            </template>
          </div>
        </div>
        <div v-else>
          <template v-if="isEdit">
            <p class="text-subtitle2 p2">No Comments</p>
            <div class="mx1 my2 background">
              <editor v-model="comment" ref="ref_editor_comment" hide-menu
                      :chat-id="chatroom.uid"
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
      <div class="wfit <lg:hidden max-w-[700px]
                  flex column gap-2 hfit">
        <div class="background rounded fmt_border p2">
          <table style="margin: 0 !important;">
            <tbody>
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
            </tbody>
          </table>
        </div>
        <div class="background rounded fmt_border pt2 px2 pb3">
          <q-btn label="Add Task"
                 icon="sym_o_add"
                 align="left"
                 class="wfull transparent"
                 no-caps unelevated flat
                 @click="handleAddTask"/>
          <q-btn icon="sym_o_assignment_add"
                 label="Add Proposal"
                 align="left"
                 class="wfull transparent"
                 no-caps unelevated flat
                 @click="handleAddProposal"/>
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
import { scroll } from 'quasar'
import { useStore } from 'stores/wikistate'

const {
  setVerticalScrollPosition
} = scroll

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
      this.related = null
      this.gotRelated = false
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
    },
    canWrite () {
      if (this.date.usr === this.store.user.username) {
        return true
      }
      return !!(this.date.coll && this.date.coll.includes(this.store.user.username))
    },
    proposalWord () {
      if (this.related && this.related.proposals && this.related.proposals.length > 1) {
        return 'Proposals'
      } else {
        return 'Proposal'
      }
    },
    taskWord () {
      if (this.related && this.related.tasks && this.related.tasks.length > 1) {
        return 'Tasks'
      } else {
        return 'Task'
      }
    }
  },
  data () {
    return {
      show: false,
      store: useStore(),
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
      gotRelated: false,
      deleteCounter: 0
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
    /**
     *
     * @param {String} [uid=null]
     */
    gotoWisdom: function (uid = null) {
      let url = '/wisdom?id='
      if (uid) {
        url += uid
      } else {
        url += this.date.uid
      }
      if (this.backRefUrl) {
        url += '&backrefurl=' + this.backRefUrl.trim()
      } else {
        url += '&backrefurl=/planner?id=' + this.chatroom.uid.trim()
      }
      this.$router.push(url)
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
    getRelated: async function () {
      if (!this.date.uid) return
      return new Promise((resolve) => {
        const guid = this.date.uid
        api({
          url: 'wisdom/private/investigate/' + guid
        })
        .then(async (response) => {
          const related = response.data
          let dName
          if (related.replies) {
            for (let i = 0; i < related.replies.length; i++) {
              related.replies[i]._time = DateTime.fromISO(related.replies[i].ts)
              related.replies[i]._ts = this.getHumanReadableDateText(related.replies[i]._time, true, true)
              dName = await dbGetDisplayName(related.replies[i].usr)
              if (dName == null) {
                dName = related.replies[i].usr
              }
              related.replies[i].name = dName
            }
          }
          if (related.answers) {
            for (let i = 0; i < related.answers.length; i++) {
              related.answers[i]._time = DateTime.fromISO(related.answers[i].ts)
              related.answers[i]._ts = this.getHumanReadableDateText(related.answers[i]._time, true, true)
              dName = await dbGetDisplayName(related.answers[i].usr)
              if (dName == null) {
                dName = related.answers[i].usr
              }
              related.answers[i].name = dName
            }
          }
          if (related.ref) {
            related.ref.ts = DateTime.fromISO(related.ref.ts)
            dName = await dbGetDisplayName(related.ref.usr)
            if (dName == null) {
              dName = related.ref.usr
            }
            related.ref.name = dName
          }
          if (related.tasks) {
            let dName
            for (let i = 0; i < related.tasks.length; i++) {
              related.tasks[i].t = this.formatTitle(related.tasks[i].t)
              related.tasks[i].ts = DateTime.fromISO(related.tasks[i].ts)
              dName = await dbGetDisplayName(related.tasks[i].usr)
              if (dName == null) {
                dName = related.tasks[i].usr
              }
              related.tasks[i].name = dName
            }
            related.tasks.sort(
              (a, b) => new Date(b.ts).valueOf() - new Date(a.ts).valueOf())
          }
          if (related.proposals) {
            let dName
            for (let i = 0; i < related.proposals.length; i++) {
              related.proposals[i].t = this.formatTitle(related.proposals[i].t)
              related.proposals[i].ts = DateTime.fromISO(related.proposals[i].ts)
              dName = await dbGetDisplayName(related.proposals[i].usr)
              if (dName == null) {
                dName = related.proposals[i].usr
              }
              related.proposals[i].name = dName
            }
            related.proposals.sort(
              (a, b) => new Date(b.ts).valueOf() - new Date(a.ts).valueOf())
          }
          this.related = { ...related }
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
    handleAddProposal: function () {
      let collT = []
      if (this.date.coll) {
        collT = this.date.coll
      }
      if (!collT.includes(this.date.usr)) {
        collT.push(this.date.usr)
      }
      const payload = {
        t: 'New Proposal',
        desc: '',
        keys: '',
        pid: this.knowledge.uid,
        copy: '',
        cats: [],
        coll: collT,
        type: 'proposal',
        row: 0,
        ref: this.date.uid
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/create',
          data: payload
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          this.getRelated()
          resolve()
        })
      })
    },
    handleAddTask: function () {
      let collT = []
      if (this.date.coll) {
        collT = this.date.coll
      }
      const payload = {
        t: 'New Task',
        desc: '',
        keys: '',
        pid: this.knowledge.uid,
        copy: '',
        cats: [],
        coll: collT,
        type: 'task',
        row: 0,
        ref: this.date.uid
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/create',
          data: payload
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
            message: 'Progress set!',
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
    handleTaskEdit: function (val) {
      if (!this.editingTask) {
        return
      }
      this.editingTask.t = val
      this.handleWisdomUpdate(this.editingTask)
      this.editingTask = null
    },
    handleTaskEditDesc: function (val) {
      if (!this.editingTask) {
        return
      }
      this.editingTask.desc = val
      this.handleWisdomUpdate(this.editingTask)
      this.editingTask = null
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
    },
    setDeleteCounter: function () {
      this.deleteCounter = 1
      setTimeout(() => {
        this.deleteCounter = 0
      }, 5000)
    },
    formatTitle: function (title) {
      if (!title || title.length < 1) return ''
      if (title.startsWith('#')) {
        let cutUntil = 0
        for (let i = 0; i < title.length; i++) {
          if (title.substring(i, i + 1) === '#') {
            cutUntil++
          }
        }
        return title.substring(cutUntil).trim()
      } else {
        return title
      }
    },
    scrollToElement: function (el) {
      const target = document.getElementById('new_task_container')
      let offset = el.offsetTop - 64
      if (offset < 0) {
        offset = 0
      }
      const duration = 200
      setVerticalScrollPosition(target, offset, duration)
    },
    handleGoToComments: function () {
      const elem = document.getElementById('new_wis_comments')
      if (!elem) {
        return
      }
      this.scrollToElement(elem)
    }
  }
}
</script>

<style scoped>

</style>
