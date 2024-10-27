<template>
  <q-dialog v-model="show" class="z-top"
            @before-hide="$emit('close')">
    <q-card class="surface px4 pb4" flat bordered>
      <p class="text-sm fontbold pt2">
        Link Wizard
      </p>
      <q-input
        for="linkWisdomQuery"
        label="Search..."
        color="primary"
        label-color="brand-p"
        v-model="query"
        @update:model-value="getWisdomEntries"
        class="text-lg pb2 mb2 sticky top-0 surface z-top">
        <template v-slot:prepend>
          <q-icon name="search"/>
        </template>
      </q-input>
      <template v-if="results.length > 0">
        <div>
          <div class="mb4">
            <p class="text-subtitle2 non-selectable">
              Wisdom entries to link to:
            </p>
          </div>
          <template v-for="result in results" :key="result">
            <div class="mt2 pl2 rounded-2 background wfull hoverPrimary"
                 @click="linkWisdom(result.result.uid)">
              <div class="flex items-center gap-2 wfull no-wrap">
                <template v-if="result.result._isCourseParent">
                  <q-icon name="remove" size="2rem"/>
                </template>
                <template v-else>
                  <q-icon name="add" size="2rem"/>
                </template>
                <div class="flex-grow overflow-hidden">
                  <p class="text-xs font-600 surface rounded-bl px2 py1 wfull"
                     style="color: var(--md-sys-color-on-surface) !important;">
                    {{ capitalizeFirstLetter(result.result.type) }}
                    from {{ result.name }}, {{ result.result._ts }}
                  </p>
                  <p class="text-sm fontbold pr2 pt2 break-words">
                    {{ result.result.t }}
                  </p>
                  <p class="text-sm pr2 py2 break-words">
                    {{ wikiricUtils.htmlToString(result.result.desc) }}
                  </p>
                  <div v-if="result.result._keys"
                       class="flex items-center pb2 pr2 text-sm">
                    <q-icon name="sym_o_tag" size="1.2rem" class="mr1.5"/>
                    <p>{{ result.result._keys }}</p>
                  </div>
                </div>
              </div>
            </div>
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
    </q-card>
  </q-dialog>
</template>

<script>

import { api } from 'boot/axios'
import { dbGetDisplayName } from 'src/libs/wikistore'
import { DateTime } from 'luxon'
import { debounce } from 'quasar'
import wikiricUtils from '../libs/wikiric-utils'

export default {
  computed: {
    wikiricUtils () {
      return wikiricUtils
    }
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    chatId: {
      type: String,
      default: null,
      required: false
    }
  },
  name: 'EditorLinkWizard',
  emits: ['close', 'wisdom'],
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (this.show) {
        this.handleDialogOpen()
      }
    }
  },
  data () {
    return {
      show: false,
      knowledge: null,
      knowledgeExists: false,
      results: [],
      noResults: false,
      query: ''
    }
  },
  created () {
    this.getWisdomEntries = debounce(this.getWisdomEntries, 250)
  },
  methods: {
    handleDialogOpen: async function () {
      await this.getKnowledge(this.chatId, true)
      setTimeout(() => {
        const elem = document.getElementById('linkWisdomQuery')
        if (elem) {
          elem.focus()
        }
      }, 100)
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
    getWisdomEntries: async function () {
      if (this.query.trim() === '') {
        return
      }
      if (!this.knowledgeExists) {
        this.results = []
        this.noResults = true
        return
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: `wisdom/private/query/${this.knowledge.uid}`,
          data: {
            query: this.query.trim(),
            type: '',
            state: 'any',
            fields: '',
            noSort: true,
            descLen: 100,
            withReply: false
          }
        })
        .then((response) => {
          const parsedData = response.data
          this.results = []
          let tmpNoResults = true
          // Prepare category color map
          const catColors = new Map()
          if (this.knowledge.cats) {
            for (let i = 0; i < this.knowledge.cats.length; i++) {
              catColors[this.knowledge.cats[i].t] = this.knowledge.cats[i].hex
            }
          }
          // Add results to list
          if (parsedData.lessons && parsedData.lessons.length > 0) {
            tmpNoResults = false
            this.addResults(parsedData.lessons, 'lesson', false, catColors)
          }
          if (parsedData.tasks && parsedData.tasks.length > 0) {
            tmpNoResults = false
            this.addResults(parsedData.tasks, 'task', false, catColors)
          }
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
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    },
    linkWisdom: function (uid) {
      this.$emit('wisdom', uid)
      this.$emit('close')
    }
  }
}
</script>

<style scoped>

</style>
