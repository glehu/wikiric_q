<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <div>
        <q-toolbar class="wfull">
          <q-toolbar-title class="wfull flex justify-between">
            <p class="text-h5 fontbold non-selectable">
              Add to Course
            </p>
            <q-btn icon="close" flat @click="show = false"/>
          </q-toolbar-title>
        </q-toolbar>
        <div class="mt2 flex column gap-2">
          <div>
            <div class="mb2">
              <p class="text-subtitle2 non-selectable">
                Current Lesson:
              </p>
            </div>
            <div class="wfit px4 pt2">
              <p class="fontbold text-body1">
                {{ wisdomProp.t }}
              </p>
              <div class="flex gap-x-2 text-sm">
                <q-breadcrumbs active-color="brand-p" class="mt1">
                  <q-breadcrumbs-el icon="person"
                                    :label="wisdomProp.usr"/>
                  <q-breadcrumbs-el :label="wisdomProp._ts"/>
                </q-breadcrumbs>
              </div>
              <div v-if="wisdomProp._keys"
                   class="flex items-center mt1 text-sm">
                <q-icon name="sym_o_tag" size="1.2rem" class="mr1.5"/>
                <p>{{ wisdomProp._keys }}</p>
              </div>
            </div>
          </div>
          <template v-if="results.length > 0">
            <div>
              <hr>
              <div class="mb2 markedView">
                <blockquote>
                  <p class="text-subtitle2">
                    Adding an entry to a course it's already in
                    will remove it from that course!
                    You will see a dash before the course when it's part of it.
                  </p>
                </blockquote>
              </div>
              <div class="mb2">
                <p class="text-subtitle2 non-selectable">
                  Choose from those Courses:
                </p>
              </div>
              <template v-for="result in results" :key="result">
                <template v-if="result.result.uid !== wisdomProp.uid">
                  <div class="mt2 px4 pt2 pb4 rounded-2 background wfit hoverPrimary"
                       @click="addToCourse(result.result.uid)">
                    <div class="flex items-center gap-3">
                      <template v-if="result.result._isCourseParent">
                        <q-icon name="remove" size="2rem"/>
                      </template>
                      <template v-else>
                        <q-icon name="add" size="2rem"/>
                      </template>
                      <div>
                        <p class="fontbold text-body1">
                          {{ result.result.t }}
                        </p>
                        <div class="flex gap-x-2 text-sm">
                          <q-breadcrumbs active-color="brand-p" class="mt1">
                            <q-breadcrumbs-el icon="person"
                                              :label="wisdomProp.usr"/>
                            <q-breadcrumbs-el :label="wisdomProp._ts"/>
                          </q-breadcrumbs>
                        </div>
                        <div v-if="result.result._keys"
                             class="flex items-center mt1 text-sm">
                          <q-icon name="sym_o_tag" size="1.2rem" class="mr1.5"/>
                          <p>{{ result.result._keys }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </template>
            </div>
          </template>
          <template v-else>
            <div>
              <div class="mt6 mb2">
                <p class="text-body1 fontbold non-selectable">
                  No Courses found.
                </p>
              </div>
            </div>
          </template>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { api } from 'boot/axios'
import { dbGetDisplayName } from 'src/libs/wikistore'
import { DateTime } from 'luxon'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    wisdomProp: {
      type: Object,
      required: true
    },
    knowledgeProp: {
      type: Object,
      required: true
    }
  },
  name: 'CourseAdder',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false,
      results: [],
      noResults: false
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.getCourses()
    },
    getCourses: async function () {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: `wisdom/private/query/${this.knowledgeProp.uid}`,
          data: {
            query: '.',
            type: 'course',
            state: 'any',
            fields: '',
            noSort: true,
            descLen: 999_999_999,
            withReply: true
          }
        })
        .then((response) => {
          const parsedData = response.data
          this.results = []
          let tmpNoResults = true
          // Prepare category color map
          const catColors = new Map()
          if (this.knowledgeProp.cats) {
            for (let i = 0; i < this.knowledgeProp.cats.length; i++) {
              catColors[this.knowledgeProp.cats[i].t] = this.knowledgeProp.cats[i].hex
            }
          }
          // Add results to list
          if (parsedData.courses && parsedData.courses.length > 0) {
            tmpNoResults = false
            this.addResults(parsedData.courses, 'course', false, catColors)
          }
          this.noResults = tmpNoResults
        }).catch((err) => {
          console.debug(err.message)
          this.results = []
          this.noResults = true
        }).finally(() => {
          // this.scrollToElement(this.$refs.toolbar_top)
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
        if (results[i].keys) {
          results[i]._keys = results[i].keys.split(',').join(', ')
        }
        // Process timestamp
        results[i]._time = DateTime.fromISO(results[i].ts)
        results[i]._ts = this.getHumanReadableDateText(results[i]._time, true, true)
        // Reactions
        if (results[i].reacts != null) {
          for (let j = results[i].reacts.length - 1; j >= 0; j--) {
            if (results[i].reacts[j].src.length === 0) {
              results[i].reacts.splice(j, 1)
            }
          }
        } else {
          results[i].reacts = []
        }
        if (results[i].replies) {
          for (let j = results[i].replies.length - 1; j >= 0; j--) {
            results[i].replies[j]._time = DateTime.fromISO(results[i].replies[j].ts)
            results[i].replies[j]._ts = this.getHumanReadableDateText(results[i].replies[j]._time, true, true)
          }
        }
        // Check if current wisdom entry is already part of the course
        if (results[i].chapters && results[i].chapters.length > 0) {
          for (let j = 0; j < results[i].chapters.length; j++) {
            if (results[i].chapters[j].uid === this.wisdomProp.uid) {
              results[i]._isCourseParent = true
              break
            }
          }
        }
        // Add entry to list
        entry = {
          priority: 'high',
          type,
          result: results[i],
          name: dName
        }
        this.results.push(entry)
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
    addToCourse: async function (uid) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: `wisdom/private/mod/${uid}`,
          data: {
            type: 'edit',
            field: 'chapters',
            new: this.wisdomProp.uid
          }
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Course Modified',
            caption: 'Thanks for contributing!',
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
          this.show = false
          resolve()
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
