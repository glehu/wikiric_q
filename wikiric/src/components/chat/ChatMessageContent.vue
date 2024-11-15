<template>
  <div class="wfull relative max-w-[80dvw] lg:max-w-[60dvw] xl:max-w-[45dvw]">
    <template v-if="msg._decryptionFailed">
      <div class="mb2 error p1 rounded flex gap-2 items-center">
        <q-icon left name="error"/>
        <p class="text-sm fontbold"
           style="margin: 0 !important">
          Decryption Error
        </p>
      </div>
    </template>
    <div class="wfull relative">
      <q-menu v-if="!noInteraction && !fullscreen"
              touch-position auto-close cover
              class="flex"
              @show="checkLinks">
        <q-btn-group flat class="surface flex justify-center flex-grow">
          <q-btn icon="reply" dense
                 v-on:click="$emit('reply', msg.uid)">
            <q-tooltip class="text-subtitle2">Reply</q-tooltip>
          </q-btn>
          <q-btn v-if="sent" icon="edit" dense
                 v-on:click="$emit('edit', msg.uid)">
            <q-tooltip class="text-subtitle2">Edit</q-tooltip>
          </q-btn>
          <q-btn v-if="sent" icon="delete" dense
                 v-on:click="$emit('delete', msg.uid)">
            <q-tooltip class="text-subtitle2">Delete</q-tooltip>
          </q-btn>
          <q-separator vertical spaced color="transparent"
                       class=""/>
          <q-btn icon="thumb_up" dense
                 v-on:click="$emit('react', msg.uid, '+')">
            <q-tooltip class="text-subtitle2">Upvote</q-tooltip>
          </q-btn>
          <q-btn icon="thumb_down" dense
                 v-on:click="$emit('react', msg.uid, '-')">
            <q-tooltip class="text-subtitle2">Dislike</q-tooltip>
          </q-btn>
          <q-btn icon="star" dense
                 v-on:click="$emit('react', msg.uid, '⭐️')">
            <q-tooltip class="text-subtitle2">Wow!</q-tooltip>
          </q-btn>
          <q-separator vertical spaced color="transparent"
                       class=""/>
          <q-btn icon="content_copy" dense
                 v-on:click="handleCopyMessage">
            <q-tooltip class="text-subtitle2">Copy</q-tooltip>
          </q-btn>
          <template v-if="msg._isFile">
            <a :href="msg._msgURL"
               class="flex-grow"
               :download="msg._fileName">
              <q-btn icon="sym_o_file_download" dense unelevated size="1rem">
                <q-tooltip class="text-subtitle2">Download</q-tooltip>
              </q-btn>
            </a>
          </template>
        </q-btn-group>
      </q-menu>
      <div class="relative"
           :class="{'bg-primary': sent,
                      'surface': !sent}">
        <div v-if="msg._tagged"
             class="relative wfull hfull bg-orange
                      right-0 mb2 rounded p2 no-pointer-events
                      fontbold flex row items-center text-white">
          <q-icon name="sym_o_alternate_email"
                  class="mr2"
                  size="1.5rem"/>
        </div>
        <div v-if="replySrc"
             class="p1 rounded mb2"
             :class="{'bg-primary': !sent,
                        'background': sent}">
          <div class="flex row items-center gap-1 pl1 pr2">
            <q-icon name="reply" size="1rem"/>
            <div class="flex column fontbold">
                <span class="text-xs on-surface-text">
                  Reply to {{ replySrc.usr }}:
                </span>
            </div>
          </div>
          <div class="mt2 p2 fmt_border rounded text-white"
               :class="{'bg-primary': sent,
                          'surface': !sent}">
            <div class="markedView" v-html="replySrc.msg"></div>
            <span class="text-xs opacity-60 text-weight-medium">
                {{ replySrc._ts }}
              </span>
          </div>
        </div>
        <template v-if="msg._mType === 'GIF' || msg._mType === 'Image'">
          <div class="hfit">
            <div class="relative wfull hfull">
              <q-carousel
                class="wfull hfull surface"
                swipeable
                animated
                v-model="slide"
                v-model:fullscreen="fullscreen">
                <q-carousel-slide :name="1"
                                  class="flex column
                                           items-center
                                           justify-center
                                           min-w-[300px]">
                  <q-img :src="msg._msgURL" fit="contain" loading="eager"
                         style="max-height: calc(100% - 9rem)"/>
                </q-carousel-slide>
                <template v-slot:control>
                  <q-carousel-control
                    class="wfull"
                    v-if="fullscreen"
                    position="bottom-left"
                    :offset="[0, 0]">
                    <div class="flex row gap-2 items-center
                                  background wfull
                                  pl4 pr14 pt1 h-18
                                  fmt_border_top">
                      <div class="hfull">
                        <div>
                          <span class="text-subtitle2 mr2">{{ msg._ts }}:</span>
                          <template v-if="msg._fileName">
                            <span class="text-subtitle2">{{ msg._fileName }}</span>
                          </template>
                          <template v-else>
                            <span class="text-subtitle2 italic">(No Filename)</span>
                          </template>
                        </div>
                        <div v-if="msg.reacts && msg.reacts.length > 0"
                             class="flex relative pt1 pb2">
                          <div v-for="reaction in msg.reacts" :key="reaction.t"
                               style="padding: 1px 4px 1px 4px; margin-right: 4px; border-radius: 5px"
                               class="fmt_border cursor-pointer
                                        flex row items-center gap-1"
                               :title="reaction.src.toString() + ' reacted to this message.'"
                               v-on:click="$emit('react', msg.uid, reaction.t)"
                               :id="'react_' + msg.uid + '_' + reaction.t">
                            <q-icon v-if="reaction.t === '+'" name="thumb_up"
                                    class=""/>
                            <q-icon v-else-if="reaction.t === '-'" name="thumb_down"
                                    class=""/>
                            <span v-else>{{ reaction.t }}</span>
                            <span class="text-sm font-bold">
                                {{ reaction.src.length }}
                              </span>
                          </div>
                        </div>
                      </div>
                      <q-btn-group flat class="surface mlauto">
                        <q-btn icon="thumb_up" dense
                               v-on:click="$emit('react', msg.uid, '+')">
                          <q-tooltip class="text-subtitle2">Upvote</q-tooltip>
                        </q-btn>
                        <q-btn icon="thumb_down" dense
                               v-on:click="$emit('react', msg.uid, '-')">
                          <q-tooltip class="text-subtitle2">Dislike</q-tooltip>
                        </q-btn>
                        <q-btn icon="star" dense
                               v-on:click="$emit('react', msg.uid, '⭐️')">
                          <q-tooltip class="text-subtitle2">Wow!</q-tooltip>
                        </q-btn>
                        <q-separator vertical spaced color="transparent"
                                     class=""/>
                        <q-btn icon="content_copy" dense
                               v-on:click="$emit(
                                             'copy',
                                             utils.htmlToString(msg._msg))">
                          <q-tooltip class="text-subtitle2">Copy</q-tooltip>
                        </q-btn>
                        <template v-if="msg._isFile">
                          <a :href="msg._msgURL"
                             class="flex-grow"
                             :download="msg._fileName">
                            <q-btn icon="sym_o_file_download" dense unelevated size="1rem">
                              <q-tooltip class="text-subtitle2">Download</q-tooltip>
                            </q-btn>
                          </a>
                        </template>
                      </q-btn-group>
                    </div>
                  </q-carousel-control>
                  <q-carousel-control
                    v-if="!noInteraction"
                    position="bottom-right"
                    :offset="[0, 0]">
                    <template v-if="sent">
                      <q-btn
                        square dense color="primary"
                        class="rounded-tl"
                        :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                        @click="toggleFullScreenMode"
                      />
                    </template>
                    <template v-else>
                      <q-btn
                        square dense color="brand-bg"
                        text-color="brand-p"
                        class="rounded-tl"
                        :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                        @click="toggleFullScreenMode"
                      />
                    </template>
                  </q-carousel-control>
                </template>
              </q-carousel>
            </div>
          </div>
          <div class="pt2 markedView" v-html="msg._msg"></div>
        </template>
        <template v-else-if="msg._mType === 'Audio'">
          <div class="clientMessage">
            <p class="pointer-events-none text-subtitle2
                        font-bold">
              {{ msg._fileName }}
            </p>
            <audio controls preload="auto"
                   class="uploadFileSnippet">
              <source :src="msg._msgURL">
              Your browser does not support playing audio.
            </audio>
          </div>
          <div class="pt2 markedView" v-html="msg._msg"></div>
        </template>
        <template v-else-if="msg._isFile">
          <div class="clientMessage">
            <div class="flex gap-2 p2 rounded background items-center">
              <q-icon name="sym_o_attachment" size="2rem"/>
              <span class="pointer-events-none text-subtitle2
                             font-bold">
                  {{ msg._fileName }}
                </span>
            </div>
          </div>
          <div class="pt2 markedView" v-html="msg._msg"></div>
        </template>
        <template v-else-if="msg._mType === 'Task'">
          <template v-if="wisdom === null">
            <div class="flex items-center gap2 surface rounded px2">
              <q-spinner-dots color="primary" size="2rem" class=""/>
              <p class="text-body2">
                Loading...
              </p>
            </div>
          </template>
          <template v-else>
            <div class="surface rounded p2 markedView">
              <div class="flex row items-center text-subtitle2
                            fontbold background rounded wfit px2 py1">
                <template v-if="wisdom.type === 'lesson'">
                  <q-icon name="lightbulb" size="1.3rem"
                          class="mr2"/>
                  <span>Lesson</span>
                </template>
                <template v-else-if="wisdom.type === 'question'">
                  <q-icon name="question_mark" size="1.3rem"
                          class="mr2"/>
                  <span>Question</span>
                </template>
                <template v-else-if="wisdom.type === 'post'">
                  <q-icon name="sym_o_web_stories" size="1.3rem"
                          class="mr2"/>
                  <span>Post</span>
                </template>
                <template v-else-if="wisdom.type === 'course'">
                  <q-icon name="sym_o_topic" size="1.3rem"
                          class="mr2"/>
                  <span>Course</span>
                </template>
                <template v-else-if="wisdom.type === 'task'">
                  <q-icon name="engineering" size="1.3rem"
                          class="mr2"/>
                  <span>Task</span>
                </template>
                <template v-else-if="wisdom.type === 'reply'">
                  <q-icon name="sym_o_message" size="1.3rem"
                          class="mr2"/>
                  <span>Comment</span>
                </template>
                <template v-else-if="wisdom.type === 'answer'">
                  <q-icon name="check" size="1.3rem"
                          class="mr2"/>
                  <span>Answer</span>
                </template>
              </div>
              <p class="fontbold mb2">{{ wisdom.t }}</p>
              <div class="markedView" v-html="wisdom.desc"></div>
              <template v-if="wisdom.type === 'question'">
                <template v-if="wisdom.done">
                  <div class="flex items-center gap-2 mt4 px2 py1
                                rounded background text-subtitle2"
                       style="border-left: 8px solid green">
                    <q-icon name="check"/>
                    <span>Answered</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2 mt4 px2 py1
                                        rounded background text-subtitle2"
                       style="border-left: 8px solid darkorange">
                    <q-icon name="question_mark"/>
                    <span>Help Requested</span>
                  </div>
                </template>
              </template>
              <template v-else-if="wisdom.type === 'task'">
                <template v-if="wisdom.done">
                  <div class="flex items-center gap-2 mt4 px2 py1
                                        rounded background text-subtitle2"
                       style="border-left: 8px solid green">
                    <q-icon name="check"/>
                    <span>Done</span>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center gap-2 mt4 px2 py1
                                        rounded background text-subtitle2"
                       style="border-left: 8px solid darkorange">
                    <q-icon name="sym_o_manufacturing"/>
                    <span>ToDo</span>
                  </div>
                </template>
              </template>
            </div>
            <q-btn icon="north_east" dense no-caps unelevated
                   align="left"
                   label="View Entry"
                   class="text-md fontbold wfull mt4 mb2"
                   @click="gotoWisdom"/>
            <p class="text-xs text-center">
              (Auto-Generated Message)
            </p>
          </template>
        </template>
        <template v-else>
          <div class="markedView" v-html="msg._msg"></div>
        </template>
        <div v-if="msg.e"
             class="flex row gap-1 items-center
                    relative mt4">
          <q-icon name="edit"
                  class="fontbold"
                  size="1rem"/>
          <span class="text-xs">Edited</span>
        </div>
      </div>
    </div>
    <div v-if="msg.reacts && msg.reacts.length > 0"
         class="flex mt2 relative">
      <div v-for="reaction in msg.reacts" :key="reaction.t"
           style="padding: 1px 4px 1px 4px; margin-right: 4px; border-radius: 5px"
           class="fmt_border cursor-pointer
                  flex row items-center gap-1"
           :title="reaction.src.toString() + ' reacted to this message.'"
           v-on:click="$emit('react', msg.uid, reaction.t)"
           :id="'react_' + msg.uid + '_' + reaction.t">
        <q-icon v-if="reaction.t === '+'" name="thumb_up"
                class=""/>
        <q-icon v-else-if="reaction.t === '-'" name="thumb_down"
                class=""/>
        <span v-else>{{ reaction.t }}</span>
        <span class="text-sm font-bold">
          {{ reaction.src.length }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>

import wikiricUtils from 'src/libs/wikiric-utils'
import { api } from 'boot/axios'
import { DateTime } from 'luxon'

export default {
  name: 'ChatMessageContent',
  props: {
    msg: {
      type: Object,
      required: true
    },
    sent: {
      type: Boolean,
      required: true
    },
    replySrc: {
      type: Object,
      default: undefined
    },
    noInteraction: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reply', 'edit', 'delete', 'copy', 'react'],
  data () {
    return {
      fullscreen: false,
      slide: 1,
      utils: wikiricUtils,
      wisdom: null
    }
  },
  mounted () {
    document.addEventListener('keydown', this.cmcHandleKeydown, false)
    // Check if we need to load some external data
    this.checkExternalData()
  },
  beforeUnmount () {
    document.removeEventListener('keydown', this.cmcHandleKeydown, false)
  },
  methods: {
    onLeft ({ reset }) {
      this.$emit('reply', this.msg.uid)
      this.finalize(reset)
    },
    finalize: function (reset) {
      setTimeout(() => {
        reset()
      }, 100)
    },
    cmcHandleKeydown: function (e) {
      if (e.key === 'Escape' && this.fullscreen) {
        this.fullscreen = false
      }
    },
    checkExternalData: function () {
      if (this.msg._mType === 'Task') {
        this.getWisdom()
      }
    },
    getWisdom: function () {
      if (!this.msg || this.msg._msg === '') return
      const tmp = JSON.parse(this.msg._msg)
      if (!tmp || !tmp.guid) return
      const wisdomId = tmp.guid
      return new Promise((resolve) => {
        const url = 'wisdom/private/get/' + wisdomId
        api({
          url
        }).then((response) => {
          this.wisdom = response.data
          this.wisdom._time = DateTime.fromISO(this.wisdom.ts)
          this.wisdom._ts = this.getHumanReadableDateText(this.wisdom._time, true, true)
          if (this.wisdom.keys) {
            this.wisdom._keys = this.wisdom.keys.split(',').join(', ')
          }
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => {
          resolve()
        })
      })
    },
    gotoWisdom: function () {
      this.$router.push(`/wisdom?id=${this.wisdom.uid}`)
    },
    handleCopyMessage: function () {
      if (this.wisdom == null) {
        this.$emit('copy',
          wikiricUtils.htmlToString(this.msg._msg))
      } else {
        let str = `${this.wisdom.t}\n\n`
        str += wikiricUtils.htmlToString(this.wisdom.desc)
        this.$emit('copy', str)
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
    toggleFullScreenMode: function () {
      this.fullscreen = !this.fullscreen
      this.checkLinks()
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

.q-img__image {
  object-fit: contain !important;
}

</style>
