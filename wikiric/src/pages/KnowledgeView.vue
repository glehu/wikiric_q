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
          <div class="flex column wfull">
            <q-toolbar>
              <q-toolbar-title class="text-lg">
                New
              </q-toolbar-title>
            </q-toolbar>
            <q-btn icon="lightbulb" label="Lesson"
                   no-caps flat align="left"
                   @click="startCreatingWisdom('lesson')"/>
            <q-btn icon="question_mark" label="Question"
                   no-caps flat align="left"
                   @click="startCreatingWisdom('question')"/>
            <q-btn icon="sym_o_topic" label="Course"
                   no-caps flat align="left"
                   @click="startCreatingWisdom('course')"/>
          </div>
          <div class="flex column wfull">
            <q-toolbar>
              <q-toolbar-title class="text-lg">
                Query
              </q-toolbar-title>
            </q-toolbar>
            <q-btn icon="engineering" label="ToDo"
                   no-caps flat align="left"
                   @click="filterToDos"/>
            <q-btn icon="lightbulb" label="Lessons"
                   no-caps flat align="left"
                   @click="filterLessons"/>
            <q-btn icon="sym_o_topic" label="Courses"
                   no-caps flat align="left"
                   @click="filterCourses"/>
          </div>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page :style="{paddingTop: paddingTopDynamic}"
                class="background pb20">
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
                  <template v-if="knowledgeExists && knowledge">
                    <q-breadcrumbs-el :label="knowledge.t"/>
                  </template>
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
          <div v-if="knowledgeExists"
               ref="toolbar_top"
               class="wfull hfull px4 pb4
                      flex column gap-4">
            <div class="flex flex-col lg:flex-row gap-4 wfull">
              <div class="surface-variant rounded-1 p4 overflow-hidden flex-grow-2">
                <q-input
                  for="wisdomQuery"
                  label="Search..."
                  color="primary"
                  label-color="brand-p"
                  v-model="queryText"
                  @update:model-value="processQuery"
                  class="text-lg pb2 mb2">
                  <template v-slot:prepend>
                    <q-icon name="search"/>
                  </template>
                </q-input>
                <template v-if="noResults">
                  <div class="wfull flex items-center justify-center p8">
                    <p class="text-body2 fontbold">
                      No Results!
                    </p>
                  </div>
                </template>
                <template v-else>
                  <p v-if="results.length > 0"
                     class="text-body2 mt1 mb2">
                    {{ results.length }} results in {{ queryTime }} s
                  </p>
                  <template v-for="res in results" :key="res.uid">
                    <q-item clickable class="surface rounded mt2"
                            v-on:click="gotoWisdom(res.result.uid)">
                      <q-item-section>
                        <q-item-label class="flex row justify-between">
                          <p class="text-subtitle2 mb2">
                            {{ res.name }},
                            {{ res.result._ts }}:
                          </p>
                          <div class="flex row items-center text-xs fontbold opacity80">
                            <template v-if="res.type === 'lesson'">
                              <span>Lesson</span>
                              <q-icon name="lightbulb" size="1.3rem"
                                      class="ml2"/>
                            </template>
                            <template v-else-if="res.type === 'question'">
                              <span>Question</span>
                              <q-icon name="question_mark" size="1.3rem"
                                      class="ml2"/>
                            </template>
                            <template v-else-if="res.type === 'post'">
                              <span>Post</span>
                              <q-icon name="sym_o_web_stories" size="1.3rem"
                                      class="ml2"/>
                            </template>
                            <template v-else-if="res.type === 'course'">
                              <span>Course</span>
                              <q-icon name="sym_o_topic" size="1.3rem"
                                      class="ml2"/>
                            </template>
                            <template v-else-if="res.type === 'task'">
                              <span>Task</span>
                              <q-icon name="engineering" size="1.3rem"
                                      class="ml2"/>
                            </template>
                            <template v-else-if="res.type === 'reply'">
                              <span>Comment</span>
                              <q-icon name="sym_o_message" size="1.3rem"
                                      class="ml2"/>
                            </template>
                            <template v-else-if="res.type === 'answer'">
                              <span>Answer</span>
                              <q-icon name="check" size="1.3rem"
                                      class="ml2"/>
                            </template>
                          </div>
                        </q-item-label>
                        <p class="text-h6 fontbold">
                          {{ res.result.t }}
                        </p>
                        <div class="max-h-[9rem] overflow-hidden
                                    mb2 all_normal">
                          <div v-html="res.result.desc"
                               class="all_normal"></div>
                        </div>
                        <template v-if="res.result.views">
                          <div class="flex items-center gap-2 wfit">
                            <q-tooltip>
                              <span class="text-subtitle2">Views</span>
                            </q-tooltip>
                            <q-icon name="visibility"/>
                            <p class="text-subtitle2">
                              {{ res.result.views }}
                            </p>
                          </div>
                        </template>
                      </q-item-section>
                    </q-item>
                    <template v-if="res.result.chapters && res.result.chapters.length > 0">
                      <div class="relative pb3">
                        <q-expansion-item>
                          <template v-slot:header>
                            <div class="wfull flex items-center sticky top-0">
                              <p class="text-subtitle2 wfull fontbold">
                                Toggle Chapter List
                                <span>- {{ res.result.chapters.length }}</span>
                              </p>
                            </div>
                          </template>
                          <div class="max-h-sm overflow-y-auto">
                            <div class="p2 flex column gap-2 hfull">
                              <template v-for="chapter in res.result.chapters" :key="chapter">
                                <q-item v-if="!chapter._hidden"
                                        class="surface rounded px3 py2 wfull hfull
                                             column justify-center"
                                        clickable
                                        @click="gotoWisdom(chapter.uid, true, chapter.index)">
                                  <div class="flex items-center gap-3 sm:gap-4">
                                    <p class="text-5xl sm:text-7xl fontbold">
                                      {{ chapter.index + 1 }}
                                    </p>
                                    <div>
                                      <p class="text-h6 fontbold">
                                        {{ chapter.t }}
                                      </p>
                                      <div class="flex gap-x-2 pb1 text-subtitle2">
                                        <q-breadcrumbs active-color="brand-p">
                                          <q-breadcrumbs-el icon="person"
                                                            :label="chapter.usr"/>
                                          <q-breadcrumbs-el :label="getHumanReadableDateText(chapter.ts, false, true)"/>
                                        </q-breadcrumbs>
                                      </div>
                                      <div v-if="chapter.keys"
                                           class="flex items-center no-wrap text-subtitle2">
                                        <q-icon name="sym_o_tag" size="1.2rem" class="mr1.5"/>
                                        <p>{{ chapter.keys }}</p>
                                      </div>
                                    </div>
                                  </div>
                                </q-item>
                              </template>
                            </div>
                          </div>
                        </q-expansion-item>
                      </div>
                    </template>
                  </template>
                </template>
              </div>
              <template v-if="questions && questions.length > 0">
                <div class="surface-variant rounded-2 p4 max-h-lg
                            overflow-y-auto flex-grow-1">
                  <q-expansion-item default-opened>
                    <template v-slot:header>
                      <p class="text-h6 wfull">
                        Questions:
                        <span class="ml2">{{ questions.length }}</span>
                      </p>
                    </template>
                    <template v-for="res in questions" :key="res.uid">
                      <q-item clickable class="surface rounded mt2"
                              v-on:click="gotoWisdom(res.result.uid)">
                        <q-item-section>
                          <q-item-label class="flex row justify-between">
                            <p class="text-subtitle2 mb2">
                              {{ res.name }},
                              {{ res.result._ts }}:
                            </p>
                            <div class="flex row items-center">
                              <span>Question</span>
                              <q-icon name="question_mark" size="1rem"
                                      class="ml2"/>
                            </div>
                          </q-item-label>
                          <p class="text-h6 fontbold">
                            {{ res.result.t }}
                          </p>
                          <div class="max-h-[9rem] overflow-hidden
                                mb2 all_normal">
                            <div v-html="res.result.desc"
                                 class="all_normal"></div>
                          </div>
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-expansion-item>
                </div>
              </template>
            </div>
            <template v-if="topWriters && topWriters.length > 0">
              <div class="surface-variant rounded-2 p4
                          overflow-hidden">
                <q-expansion-item default-opened>
                  <template v-slot:header>
                    <p class="text-h6 wfull">
                      Top Contributors
                    </p>
                  </template>
                  <div class="flex gap-2">
                    <template v-for="writer in topWriters" :key="writer">
                      <q-item flat
                              class="wfit surface flex column rounded
                                   items-start pl2 pr3 pb2 mt2">
                        <div class="flex items-center gap-2">
                          <q-icon name="person" size="2rem"/>
                          <span class="text-body2 fontbold">
                        {{ writer.name }}
                      </span>
                        </div>
                        <div class="flex items-center gap-2 mt2">
                          <q-icon name="book" size="2rem"/>
                          <span class="text-h5 fontbold">
                            {{ writer.wisdomCount }}
                          </span>
                        </div>
                      </q-item>
                    </template>
                  </div>
                </q-expansion-item>
              </div>
            </template>
            <div class="surface-variant rounded-2 p4 flex-grow
                        overflow-hidden max-h-xs">
              <q-expansion-item default-opened>
                <template v-slot:header>
                  <p class="text-h6 wfull">
                    Keyword Cloud
                  </p>
                </template>
                <div id="d3wordcloud"></div>
              </q-expansion-item>
            </div>
          </div>
          <template v-else>
            <div class="surface-variant rounded-2 p4 m2
                        overflow-hidden">
              <p class="text-body2 fontbold">
                No Knowledge Found
              </p>
              <p class="text-subtitle2">
                Create a new Knowledge Hub for all your Wisdom!
              </p>
              <div class="surface p2 rounded mt4">
                <q-input
                  for="group_t"
                  label="Title"
                  color="brand-p"
                  label-color="brand-p"
                  v-model="newKnowledge.t"
                  class="p2 text-xl">
                  <template v-slot:prepend>
                    <q-icon name="school"/>
                  </template>
                </q-input>
                <q-input
                  for="group_desc"
                  label="Description"
                  color="brand-p"
                  label-color="brand-p"
                  v-model="newKnowledge.desc"
                  class="p2 text-xl">
                  <template v-slot:prepend>
                    <q-icon name="info"/>
                  </template>
                </q-input>
                <div class="flex wfull mt6 pr2 pb2">
                  <q-btn color="primary" no-caps
                         v-on:click="createKnowledge"
                         class="mlauto">
                    <div class="column py2 px4">
                      <p class="text-weight-bold q-ma-none">
                        Create Knowledge Hub
                      </p>
                    </div>
                  </q-btn>
                </div>
              </div>
            </div>
          </template>
          <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-fab
              v-model="fab"
              label=""
              vertical-actions-align="right"
              color="primary"
              icon="menu"
              direction="up">
              <q-fab-action color="primary" @click="startCreatingWisdom('lesson')"
                            icon="lightbulb" label="New Lesson" label-position="left"/>
              <q-fab-action color="primary" @click="startCreatingWisdom('question')"
                            icon="question_mark" label="Ask Question" label-position="left"/>
            </q-fab>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <wisdom-edit :is-open="isEditingWisdom"
               :knowledge-id="knowledge.uid"
               :type-preference="typePref"
               @update="handleWisdomUpdate"
               @create="handleWisdomCreate"/>
</template>

<script>
import { api } from 'boot/axios'
import { dbGetDisplayName, dbGetSession } from 'src/libs/wikistore'
import { debounce, dom, scroll } from 'quasar'
import WisdomEdit from 'components/knowledge/WisdomEdit.vue'
import { DateTime } from 'luxon'
import * as d3 from 'd3'
import * as d3Cloud from 'd3-cloud'
import { useStore } from 'stores/wikistate'

const {
  getScrollTarget,
  setVerticalScrollPosition
} = scroll

export default {
  components: { WisdomEdit },
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
  name: 'KnowledgeView',
  data () {
    return {
      isComponent: false,
      paddingTopDynamic: '60px',
      store: useStore(),
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
      queryText: '',
      noResults: false,
      results: [],
      questions: [],
      processes: [],
      isEditingWisdom: false,
      queryTime: 0,
      topWriters: [],
      typePref: ''
    }
  },
  created () {
    this.processQuery = debounce(this.processQuery, 250)
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
  mounted () {
    if (!this.chatID) {
      setTimeout(() => {
        const elem = document.getElementById('wisdomQuery')
        if (elem) {
          elem.focus()
        }
      }, 0)
    }
  },
  methods: {
    initFunction: async function () {
      await this.getChatroom()
      await this.getKnowledge(this.groupID, true)
      this.getTopContributors()
      this.getRecentKeywords()
      this.getRecentQuestions()
    },
    clickedBack: async function () {
      const sesh = await dbGetSession(this.groupID)
      let url = `/chat?id=${this.groupID}`
      if (sesh.lastChannelID && sesh.lastChannelID !== '') {
        url += `&chan=${sesh.lastChannelID}`
      }
      this.$router.push(url)
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
    processQuery: function () {
      this.searchWisdom()
    },
    searchWisdom: function (queryOverride = '', fields = '', questionsOnly = false) {
      let query = this.queryText
      if (queryOverride) {
        query = queryOverride
        if (!questionsOnly) {
          this.queryText = queryOverride
        }
      }
      const type = this.extractEntryType(query)
      if (type !== '') {
        // Check if query only contains a type query
        if (query.replace(/type:\w*\s?/, '') === '') {
          // Add a dot to filter every entry of the given type
          // Otherwise, we might not see anything
          query += ' .'
        }
      }
      if (!query) {
        return
      }
      const state = this.extractEntryState(query)
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/query/' + this.knowledge.uid,
          data: {
            query,
            type,
            state,
            fields
          }
        })
        .then((response) => {
          const parsedData = response.data
          if (!questionsOnly) {
            this.results = []
            this.queryTime = parsedData.respTime.toFixed(4)
          } else {
            this.questions = []
          }
          let tmpNoResults = true
          // Prepare category color map
          const catColors = new Map()
          if (this.knowledge.cats) {
            for (let i = 0; i < this.knowledge.cats.length; i++) {
              catColors[this.knowledge.cats[i].t] = this.knowledge.cats[i].hex
            }
          }
          // Add results to list
          if (!questionsOnly) {
            if (parsedData.courses && parsedData.courses.length > 0) {
              tmpNoResults = false
              this.addResults(parsedData.courses, 'course', questionsOnly, catColors)
            }
            if (parsedData.lessons && parsedData.lessons.length > 0) {
              tmpNoResults = false
              this.addResults(parsedData.lessons, 'lesson', questionsOnly, catColors)
            }
            if (parsedData.tasks && parsedData.tasks.length > 0) {
              tmpNoResults = false
              this.addResults(parsedData.tasks, 'task', questionsOnly, catColors)
            }
            if (parsedData.answers && parsedData.answers.length > 0) {
              tmpNoResults = false
              this.addResults(parsedData.answers, 'answer', questionsOnly, catColors)
            }
            if (parsedData.posts && parsedData.posts.length > 0) {
              tmpNoResults = false
              this.addResults(parsedData.posts, 'post', questionsOnly, catColors)
            }
          }
          if (parsedData.questions && parsedData.questions.length > 0) {
            tmpNoResults = false
            this.addResults(parsedData.questions, 'question', questionsOnly, catColors)
          }
          if (!questionsOnly) {
            if (parsedData.replies && parsedData.replies.length > 0) {
              tmpNoResults = false
              this.addResults(parsedData.replies, 'reply', questionsOnly, catColors)
            }
            if (parsedData.boxes && parsedData.boxes.length > 0) {
              tmpNoResults = false
              this.addResults(parsedData.boxes, 'box', questionsOnly, catColors)
            }
            if (parsedData.misc && parsedData.misc.length > 0) {
              tmpNoResults = false
              this.addResults(parsedData.misc, 'misc', questionsOnly, catColors)
            }
          }
          this.noResults = tmpNoResults
        }).catch((err) => {
          console.debug(err.message)
          this.results = []
          this.noResults = true
        }).finally(() => {
          this.scrollToElement(this.$refs.toolbar_top)
          resolve()
        })
      })
    },
    addResults: async function (results, type, questionsOnly, catColors) {
      let entry
      for (let i = 0; i < results.length; i++) {
        // Ignore certain results
        if (results[i].t === '%wikiric%Events%wkrg%') continue
        // Further process result
        results[i].t = this.formatTitle(results[i].t)
        // Replace username with display name
        let dName = await dbGetDisplayName(results[i].usr)
        if (dName == null) {
          dName = results[i].usr
        }
        // Replace category colors with knowledge category colors if present
        if (results[i].cats) {
          let clr = ''
          for (let j = 0; j < results[i].cats.length; j++) {
            clr = catColors[results[i].cats[j].t]
            if (clr && clr !== '') {
              results[i].cats[j].hex = clr
            }
          }
        }
        // Process timestamp
        results[i]._time = DateTime.fromISO(results[i].ts)
        results[i]._ts = this.getHumanReadableDateText(results[i]._time, true, true)
        // Add entry to list
        entry = {
          priority: 'high',
          type,
          result: results[i],
          name: dName
        }
        if (type !== 'process') {
          if (questionsOnly) {
            this.questions.push(entry)
          } else {
            this.results.push(entry)
          }
        } else {
          this.processes.push(entry)
        }
      }
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
    createKnowledge: async function () {
      if (this.newKnowledge.t === '') {
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
      const payload = {
        pid: this.groupID,
        t: this.newKnowledge.t,
        desc: this.newKnowledge.desc,
        keys: ''
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'knowledge/private/create',
          data: payload
        }).then((response) => {
          this.knowledgeExists = true
          this.getKnowledge(response.data, false)
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Knowledge Created!',
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
          resolve()
        })
      })
    },
    startCreatingWisdom: function (forceType = '') {
      this.typePref = forceType
      this.isEditingWisdom = !this.isEditingWisdom
    },
    handleWisdomUpdate: function (wisdom) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/edit/' + wisdom.uid,
          data: wisdom
        }).then(() => {
          resolve()
        }).catch((err) => {
          console.debug(err.message)
        })
      })
    },
    handleWisdomCreate: function (wisdom) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/create',
          data: wisdom
        }).then(() => {
          resolve()
        }).catch((err) => {
          console.debug(err.message)
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
    gotoWisdom: function (uid) {
      const url = '/wisdom?id=' + uid
      this.$router.push(url)
    },
    getTopContributors: async function () {
      return new Promise((resolve) => {
        api({
          url: 'wisdom/private/contributors/' + this.knowledge.uid
        })
        .then(async (response) => {
          this.topWriters = response.data.contributors
          let dName
          for (let i = 0; i < this.topWriters.length; i++) {
            dName = await dbGetDisplayName(this.topWriters[i].usr)
            if (dName == null) {
              dName = this.topWriters[i].usr
            }
            this.topWriters[i].name = dName
          }
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => resolve())
      })
    },
    getRecentKeywords: async function () {
      return new Promise((resolve) => {
        api({
          url: 'wisdom/private/meta/' + this.knowledge.uid + '?type=keys'
        })
        .then((response) => {
          let keywords = []
          if (response.data.keys) keywords = response.data.keys
          const svg = this.wordCloud(keywords)
          const myNode = document.getElementById('d3wordcloud')
          while (myNode.lastElementChild) {
            myNode.removeChild(myNode.lastElementChild)
          }
          myNode.appendChild(svg)
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => resolve())
      })
    },
    wordCloud: function (text, {
      size = group => group.length, // Given a grouping of words, returns the size factor for that word
      word = d => d, // Given an item of the data array, returns the word
      marginTop = 4, // top margin, in pixels
      marginRight = 4, // right margin, in pixels
      marginBottom = 4, // bottom margin, in pixels
      marginLeft = 4, // left margin, in pixels
      width = 600, // outer width, in pixels
      height = 300, // outer height, in pixels
      maxWords = 100, // maximum number of words to extract from the text
      fontFamily = 'Open Sans', // font family
      fontScale = 16, // base font size
      padding = 4, // amount of padding between the words (in pixels)
      rotate = 0, // a constant or function to rotate the words
      invalidation // when this promise resolves, stop the simulation
    } = {}) {
      const words = typeof text === 'string' ? text.split(/\W+/g) : Array.from(text)
      const data = d3.rollups(words, size, w => w)
      .sort(([, a], [, b]) => d3.descending(a, b))
      .slice(0, maxWords)
      .map(([key, size]) => ({
        text: word(key),
        size
      }))
      const svg = d3.create('svg')
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width)
      .attr('font-family', fontFamily)
      .attr('text-anchor', 'middle')
      .attr('style', 'max-width: 100%; height: auto; height: intrinsic; font-weight: bold; font-style: italic;')
      const g = svg.append('g').attr('transform', `translate(${marginLeft},${marginTop})`)
      const vueInstance = this
      const cloud = d3Cloud()
      .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
      .words(data)
      .padding(padding)
      .rotate(rotate)
      .font(fontFamily)
      .fontSize(d => (Math.sqrt(d.size) * fontScale))
      .on('word', ({
                     size,
                     x,
                     y,
                     rotate,
                     text
                   }) => {
        g.append('text')
        .attr('font-size', size)
        .attr('fill', 'var(--md-sys-color-on-surface)')
        .attr('transform', `translate(${x},${y}) rotate(${rotate})`)
        .text(text)
        .on('click', function () {
          vueInstance.searchWisdom(text, 'keys')
        })
        .attr('class', 'cursor-pointer')
        .on('mouseover', function () {
          d3.select(this).transition()
          .duration('100')
          .attr('fill', 'var(--md-sys-color-primary)')
        })
        .on('mouseout', function () {
          d3.select(this).transition()
          .duration('200')
          .attr('fill', 'var(--md-sys-color-on-surface)')
        })
      })
      cloud.start()
      invalidation && invalidation.then(() => cloud.stop())
      return svg.node()
    },
    extractEntryType: function (text) {
      let entryType = ''
      // Are we looking for a specific wisdom type?
      // Extract the type using regex, looking for the pattern: "type:<userInput>"
      if (/type:\w+/g.test(text)) {
        // If found, extract the type by splitting away the prefix "type:"
        try {
          const entryTypeTmp = text.match(/type:\w+/g)[0].split(':')[1]
          entryType = entryTypeTmp
          if (entryTypeTmp === 'ask' || entryTypeTmp === 'q') entryType = 'question'
          if (entryTypeTmp === 'ans' || entryTypeTmp === 'a') entryType = 'answer'
          if (entryTypeTmp === 'teach' || entryTypeTmp === 'l') entryType = 'lesson'
          if (entryTypeTmp === 'todo' || entryTypeTmp === 't') entryType = 'task'
          if (entryTypeTmp === 'reply' || entryTypeTmp === 'c') entryType = 'reply'
          if (entryTypeTmp === 'box' || entryTypeTmp === 'b') entryType = 'box'
          if (entryTypeTmp === 'process' || entryTypeTmp === 'p') entryType = 'process'
        } catch (e) {
          console.debug(e.message)
        }
      }
      return entryType
    },
    extractEntryState: function (text) {
      let state = ''
      // Are we looking for a specific wisdom finished state?
      if (/state:\w+/g.test(text)) {
        try {
          const stateTmp = text.match(/state:\w+/g)[0].split(':')[1]
          state = stateTmp
          if (stateTmp === 'done' || stateTmp === 'finished' || stateTmp === 'closed') state = 'true'
          if (stateTmp === 'todo' || stateTmp === 'unfinished' || stateTmp === 'open') state = 'false'
        } catch (e) {
          console.debug(e.message)
        }
      }
      return state
    },
    getRecentQuestions: async function () {
      this.questions = []
      return new Promise((resolve) => {
        this.searchWisdom('type:question state:false question', '', true)
        .then(() => resolve())
      })
    },
    scrollToElement: function (el) {
      const target = getScrollTarget(el)
      const offset = 0 // el.offsetTop
      const duration = 200
      setVerticalScrollPosition(target, offset, duration)
    },
    filterToDos: function () {
      const query = `type:task state:todo ${this.store.user.username} `
      this.searchWisdom(query)
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Showing ToDo\'s!',
        caption: 'Check search query for more information',
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
      const { width } = dom
      if (width(this.$refs.toolbar_top) < 768 - 300) {
        this.sidebarLeft = false
      }
    },
    filterCourses: function () {
      const query = 'type:course '
      this.searchWisdom(query)
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Showing Courses!',
        caption: 'Check search query for more information',
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
      const { width } = dom
      if (width(this.$refs.toolbar_top) < 768 - 300) {
        this.sidebarLeft = false
      }
    },
    filterLessons: function () {
      const query = 'type:lesson '
      this.searchWisdom(query)
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Showing Lessons!',
        caption: 'Check search query for more information',
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
      const { width } = dom
      if (width(this.$refs.toolbar_top) < 768 - 300) {
        this.sidebarLeft = false
      }
    }
  }
}
</script>

<style>

.all_normal > * {
  font-size: medium !important;
  font-weight: normal !important;
  line-height: 1.3rem !important;
  letter-spacing: 0 !important;
}

</style>
