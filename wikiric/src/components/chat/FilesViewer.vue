<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface w-[99dvw] max-w-xl hfull"
            flat bordered>
      <div class="flex gap-4 column relative">
        <div class="sticky top-0 surface z-top p4">
          <q-input ref="file_query_input"
                   clearable
                   filled label="Filter"
                   v-model="fileQuery"
                   text-color="brand-p"
                   label-color="brand-p"/>
          <div class="px1 pt2">
            <span class="text-subtitle2 fontbold">
              {{ snippets.length }} files total
            </span>
          </div>
        </div>
        <template v-for="file in snippets" :key="file">
          <div v-if="queryValid(file)"
               class="wfull hauto p4 background flex gap-4">
            <div class="flex wfull justify-center">
              <template v-if="file.mime.startsWith('image')">
                <q-img :src="file.pth" size="200px"/>
              </template>
              <template v-else-if="file.mime.startsWith('audio')">
                <audio controls>
                  <source :src="file.pth" :type="file.mime">
                </audio>
              </template>
              <template v-else>
                <div class="h20 w20
                            flex items-center
                            justify-center">
                  <q-icon name="sym_o_attachment" size="4rem"></q-icon>
                </div>
              </template>
            </div>
            <div class="wfull">
              <div class="rounded-2 fmt_border p3
                          flex column surface">
                <p class="text-subtitle1 fontbold">{{ file.t }}</p>
                <p class="text-subtitle2">
                  {{ getHumanReadableDateText(file.ts, true, true) }}
                </p>
                <p class="text-subtitle2">
                  {{ file.mb }} MB
                </p>
                <div class="flex gap-2 mlauto mt2">
                  <q-btn icon="sym_o_delete"
                         flat
                         color="brand-bg"
                         text-color="brand-p"
                         class="wfit"
                         label="Delete"
                         @click="deleteFile(file)"/>
                  <a :href="file.pth"
                     class="rounded"
                     download>
                    <q-btn icon="sym_o_file_download"
                           color="primary"
                           class="wfit"
                           label="Download"/>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { api } from 'boot/axios'
import { useStore } from 'stores/wikistate'
import { DateTime } from 'luxon'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    groupId: {
      type: String,
      default: ''
    }
  },
  name: 'FilesViewer',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false,
      store: useStore(),
      snippets: [],
      fileQuery: ''
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.getSnippets()
      setTimeout(() => {
        if (this.$refs.file_query_input) {
          this.$refs.file_query_input.focus()
        }
      }, 0)
    },
    getSnippets: async function () {
      if (!this.groupId) return
      return new Promise((resolve) => {
        api({
          url: 'files/private/chat/' + this.groupId
        }).then((response) => {
          this.snippets = response.data.files
          for (let i = 0; i < this.snippets.length; i++) {
            this.snippets[i].pth = this.store.serverIP + this.snippets[i].pth
            if (this.snippets[i].type === 'emote') {
              this.snippets[i].emote = true
              this.snippets[i].ph = ':' + this.snippets[i].t.split('.')[0] + ':'
            }
          }
        })
        .then(() => resolve())
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
    queryValid (snippet) {
      if (!this.fileQuery || this.fileQuery === '') return true
      let valid = false
      valid = snippet.t.toLowerCase().includes(this.fileQuery)
      if (!valid && snippet.ph != null) {
        valid = snippet.ph.toLowerCase().includes(this.fileQuery)
      }
      return valid
    },
    deleteFile: function (file) {
      api({
        url: 'files/private/delete/' + file.uid
      })
      .then(() => {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'File Deleted!',
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
        this.getSnippets()
      })
    }
  }
}
</script>

<style scoped>

</style>
