<template>
  <q-dialog v-model="show" class="z-top" full-width full-height
            style="padding: 0 !important; margin: 0 !important;">
    <div id="msg_img_outside"
         @click="toggleFullScreenMode"
         class="w-screen h-screen transparent absolute flex justify-center">
      <div id="msg_img_outside2"
           class="flex column fmt_border relative
                  w-[90dvw] h-[90dvh]
                  <md:w-[99dvw] <md:h-[90dvh]
                  transition-all
                  items-center rounded-b-lg
                  justify-center overflow-hidden"
           @click="toggleFullScreenMode">
        <div class="wfull hfull background absolute rounded-b-lg opacity-50"></div>
        <q-img :src="msg._msgURL" fit="contain" loading="eager"
               style="max-height: calc(100% - 9rem)"/>
      </div>
      <div class="wfull fixed bottom-0">
        <div class="flex row gap-2 items-center
                    background wfull no-wrap
                    pl4 pr14 pt1 min-h-18
                    fmt_border_top">
          <div class="hfull">
            <p class="line-height-tight text-subtitle2">
              <span class="mr2">{{ msg._ts }}:</span>
              <template v-if="msg._fileName">
                <span class="">{{ msg._fileName }}</span>
              </template>
              <template v-else>
                <span class="italic">(No Filename)</span>
              </template>
            </p>
            <div v-if="msg.reacts && msg.reacts.length > 0"
                 class="flex relative pt1 pb2 mt1">
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
                   v-on:click="$emit('copy',
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
      </div>
    </div>
  </q-dialog>
</template>

<script>

import wikiricUtils from 'src/libs/wikiric-utils'
import { api } from 'boot/axios'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    msg: {
      type: Object,
      required: true
    }
  },
  emits: ['reply', 'edit', 'delete', 'copy', 'react', 'close'],
  name: 'ChatImageViewer',
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
      utils: wikiricUtils
    }
  },
  methods: {
    handleDialogOpen: function () {
    },
    toggleFullScreenMode: function (e) {
      if (e.target.id !== 'msg_img_outside' && e.target.id !== 'msg_img_outside2') {
        return
      }
      this.show = false
      this.$emit('close')
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
