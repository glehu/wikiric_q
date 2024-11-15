<template>
  <q-dialog v-model="show" class="z-top" @show="checkLinks">
    <q-card class="background w-[99dvw] max-w-xl hfull"
            flat bordered>
      <div class="flex column relative">
        <div class="sticky top-0 surface z-top p4 fmt_border_bottom">
          <q-btn flat
                 icon="sym_o_arrow_left_alt"
                 label="Back"
                 class="fmt_border mb2 rounded-2
                        surface-variant"
                 @click="show = false">
          </q-btn>
          <q-input ref="file_query_input"
                   clearable
                   label="Filter"
                   v-model="fileQuery"
                   text-color="brand-p"
                   label-color="brand-p">
            <template v-slot:prepend>
              <q-icon name="search" class=""/>
            </template>
          </q-input>
        </div>
        <div class="p4 my2 flex gap-x-4 gap-y-2">
          <q-circular-progress
            show-value
            font-size="14px"
            :value="storagePercentage"
            size="75px"
            :thickness="0.22"
            color="primary"
            track-color="grey-3"
            class="fontbold">
            {{ storagePercentage }}%
          </q-circular-progress>
          <div>
            <p class="text-subtitle2">
              <span class="fontbold">
                {{ snippets.length }} files
              </span>
              saved in this group
            </p>
            <p class="text-subtitle2">
              <span class="fontbold">
                {{ totalMBString }} MB
              </span>
              of {{ maxMB }} MB stored
            </p>
          </div>
        </div>
        <template v-if="snippets.length < 1">
          <div class="flex wfull hfull items-center justify-center
                      min-h-[200px]">
            <p class="text-subtitle2">No Files</p>
          </div>
        </template>
        <template v-else>
          <template v-for="file in snippets" :key="file">
            <div v-if="queryValid(file)"
                 class="wfull hauto px3 pb3 background flex gap-4">
              <div class="wfull">
                <div class="rounded-2 fmt_border p3
                            flex column surface">
                  <div class="flex wfull justify-center mb4">
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
                  <template v-if="file.type === 'emote'">
                    <div class="flex gap-2 items-center mb2
                                fmt_border rounded-2 p2 wfit">
                      <q-icon name="sym_o_emoji_emotions" size="1.5rem"/>
                      <p class="text-body1">Emote</p>
                    </div>
                  </template>
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
                       :download="file.t">
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
      fileQuery: '',
      totalMB: 0,
      totalMBString: '',
      storagePercentage: 0,
      maxMB: 2048
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
      this.totalMB = 0
      return new Promise((resolve) => {
        api({
          url: 'files/private/chat/' + this.groupId
        }).then((response) => {
          this.snippets = response.data.files
          for (let i = 0; i < this.snippets.length; i++) {
            this.totalMB += this.snippets[i].mb
            this.snippets[i].pth = this.store.serverIP + this.snippets[i].pth
            this.snippets[i].mb = this.snippets[i].mb.toFixed(2)
            if (this.snippets[i].type === 'emote') {
              this.snippets[i].emote = true
              this.snippets[i].ph = ':' + this.snippets[i].t.split('.')[0] + ':'
            }
          }
          this.storagePercentage = this.totalMB / this.maxMB
          this.storagePercentage = this.storagePercentage * 100
          this.storagePercentage = Math.round(this.storagePercentage)
          this.totalMBString = this.totalMB.toFixed(2)
        }).catch((e) => {
          if (e) {
            console.debug(e.message)
          }
        }).finally(() => resolve())
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
      if ((this.fileQuery === 'emote' || this.fileQuery === 'emotes') &&
        snippet.type === 'emote') return true
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
    },
    checkLinks: function () {
      const matches = document.querySelectorAll('a')
      if (matches && matches.length > 0) {
        matches.forEach(el => {
          if (el.href && el.href !== '') {
            if (el.href.startsWith('https://wikiric.xyz/')) {
              // Ignore download links
              if (!el.download) {
                el.classList.add('internalLink')
                el.addEventListener('click', this.interceptLink, false)
              } else {
                el.addEventListener('click', this.interceptDownload, false)
              }
            } else {
              el.addEventListener('click', this.interceptRegularLink, false)
            }
          }
        })
      }
    },
    interceptDownload: function (e) {
      const href = e.currentTarget.href
      const name = e.currentTarget.download
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      api.get(
        href,
        {
          responseType: 'blob'
        }
      ).then((response) => {
        console.log(response.data)
        let filename = name
        filename = decodeURI(filename)
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', filename)
        document.body.appendChild(link)
        link.click()
        window.URL.revokeObjectURL(url)
        link.remove()
      }).catch((err) => console.debug(err.message))
    },
    interceptLink: function (e) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      const url = `/redir?redirect=${e.currentTarget.href.substring(21)}` +
        `&backrefurl=${this.$router.currentRoute.value.fullPath}`
      this.$router.push(url)
    },
    interceptRegularLink: function (e) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      window.open(e.target.href, '_blank')
    }
  }
}
</script>

<style scoped>

</style>
