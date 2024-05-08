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
              class="flex">
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
               download>
              <q-btn icon="sym_o_file_download" dense unelevated size="1rem">
                <q-tooltip class="text-subtitle2">Download</q-tooltip>
              </q-btn>
            </a>
          </template>
        </q-btn-group>
      </q-menu>
      <q-slide-item @left="onLeft" @right="onLeft"
                    left-color="positive" right-color="positive"
                    class="relative"
                    :class="{'pointer-events-none': noInteraction}">
        <template v-slot:left>
          <q-icon name="reply"/>
        </template>
        <template v-slot:right>
          <q-icon name="reply"/>
        </template>
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
                <span class="text-xs">Reply to {{ replySrc.usr }}:</span>
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
                            <span class="text-subtitle2">{{ msg._ts }}:</span>
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
                               download>
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
                          @click="fullscreen = !fullscreen"
                        />
                      </template>
                      <template v-else>
                        <q-btn
                          square dense color="brand-bg"
                          text-color="brand-p"
                          class="rounded-tl"
                          :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                          @click="fullscreen = !fullscreen"
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
                <div class="rounded primary wfit px1">
                  <span class="text-body2 fontbold">
                    Shared Wisdom
                  </span>
                </div>
                <p class="fontbold mb2">{{ wisdom.t }}</p>
                <div class="markedView" v-html="wisdom.desc"></div>
              </div>
              <q-btn icon="north_east" dense no-caps unelevated
                     align="left"
                     label="View Entry"
                     class="text-md fontbold wfull my2"
                     @click="gotoWisdom"/>
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
      </q-slide-item>
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
    }
  }
}
</script>

<style scoped>

.q-img__image {
  object-fit: contain !important;
}

</style>
