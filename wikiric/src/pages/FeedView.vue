<template>
  <q-page class="full-height full-width flex items-center justify-center">
    <q-layout
      view="lhh LpR lff"
      container
      style="height: calc(100dvh - 52px)"
      class="overflow-hidden no-scroll">
      <q-drawer
        side="left"
        v-model="sidebarLeft"
        show-if-above
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
          <q-btn flat icon="sym_o_arrow_left_alt"
                 align="left" class="wfull pl4 mt2"
                 no-caps
                 @click="clickedBack">
            <span class="ml4 text-body1">Back</span>
          </q-btn>
          <div class="flex column wfull">
            <q-toolbar>
              <q-toolbar-title class="text-lg">
                New
              </q-toolbar-title>
            </q-toolbar>
            <q-btn icon="add" label="Post"
                   no-caps flat align="left"
                   @click="startCreatingPost('post')"/>
          </div>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page style="padding-top: 60px" class="background pb20">
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
                  <q-breadcrumbs-el label="Feed View"/>
                  <template v-if="chatroom">
                    <q-breadcrumbs-el :label="chatroom.t"/>
                  </template>
                </q-breadcrumbs>
              </q-toolbar-title>
            </q-toolbar>
          </q-page-sticky>
          <q-btn flat
                 icon="sym_o_arrow_left_alt"
                 label="Back"
                 class="md:hidden fmt_border ml4 mb3 rounded-2
                        surface-variant"
                 @click="clickedBack">
          </q-btn>
          <div class="wfull hfull relative">
            <div class="overflow-x-hidden
                        feed_scroller
                        overflow-y-auto
                        column wfull
                        items-center absolute"
                 ref="feed_scroller"
                 v-on:scroll="checkScroll">
              <template v-if="isLoading">
                <div class="wfull flex justify-center">
                  <div class="wfull p2 max-w-lg">
                    <q-skeleton type="text" width="5rem" height="3rem"/>
                    <q-skeleton type="text" width="15rem" height="3rem"/>
                    <q-skeleton type="rect" height="400px" class="mt2"/>
                    <div class="w-1/2 mt4 min-w-[15rem]">
                      <q-skeleton type="text" class="mr6"/>
                      <q-skeleton type="text" class="mr18"/>
                      <q-skeleton type="text" class="mr6"/>
                      <q-skeleton type="text" class="mr6"/>
                      <q-skeleton type="text" class="mr18"/>
                      <q-skeleton type="text" class="mr24"/>
                    </div>
                    <q-skeleton type="rect" height="64px" class="mt2"/>
                    <q-skeleton type="rect" height="64px" class="mt2"/>
                  </div>
                </div>
              </template>
              <div v-if="noResults">
                <div class="p8 rounded-2 surface">
                  <p class="text-h4 mb4">
                    Nothing here, yet.
                  </p>
                  <p class="text-body1">
                    Be the first to contribute something,
                    or wait for something to happen.
                  </p>
                  <div class="flex column background wfull sm:rounded mt8 px2 pb2">
                    <q-toolbar>
                      <q-toolbar-title class="text-lg">
                        Get Started
                      </q-toolbar-title>
                    </q-toolbar>
                    <q-btn icon="add" label="Post something interesting!"
                           no-caps flat align="left"
                           @click="startCreatingPost('post')"/>
                  </div>
                </div>
              </div>
              <div v-else class="wfull hfull max-w-xl
                                 gap-8 column pb80
                                 items-center relative">
                <template v-for="post in results" :key="post.uid">
                  <div class="wfull surface sm:rounded" style="border: 4px solid var(--md-sys-color-surface)">
                    <div class="text-body2 py2 mb2 flex justify-between gap-2 px4">
                      <span class="fontbold">
                        {{ post.name }}
                      </span>
                      <span>{{ post.result._ts }}</span>
                    </div>
                    <div v-if="post.result._keys"
                         class="flex items-center background wfit rounded
                                px1 mx4 mb4">
                      <q-icon name="sym_o_tag" size="1.2rem" class="mr1.5"/>
                      <p>{{ post.result._keys }}</p>
                    </div>
                    <p class="fontbold text-h5 mb4 px4">
                      {{ post.result.t }}
                    </p>
                    <div class="markedView px4"
                         v-html="post.result.desc"></div>
                    <div class="mt8 p2 background rounded-b">
                      <div class="flex justify-between flex-grow items-center">
                        <div v-if="post.result.reacts && post.result.reacts.length > 0"
                             class="flex relative px2">
                          <div v-for="reaction in post.result.reacts" :key="reaction.t"
                               style="padding: 1px 4px 1px 4px; margin-right: 4px; border-radius: 5px"
                               class="fmt_border cursor-pointer
                                      flex row items-center gap-1"
                               :title="reaction.src.toString() + ' reacted to this message.'"
                               v-on:click="reactToPost(post.result.uid, reaction.t)"
                               :id="'react_' + post.result.uid + '_' + reaction.t">
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
                        <div v-else></div>
                        <q-btn-group flat class="flex justify-center">
                          <q-btn icon="thumb_up"
                                 v-on:click="reactToPost(post.result.uid, '+')">
                            <q-tooltip class="text-subtitle2">Upvote</q-tooltip>
                          </q-btn>
                          <q-btn icon="thumb_down"
                                 v-on:click="reactToPost(post.result.uid, '-')">
                            <q-tooltip class="text-subtitle2">Dislike</q-tooltip>
                          </q-btn>
                          <q-btn icon="star"
                                 v-on:click="reactToPost(post.result.uid, '⭐️')">
                            <q-tooltip class="text-subtitle2">Wow!</q-tooltip>
                          </q-btn>
                        </q-btn-group>
                      </div>
                      <div class="wfull">
                        <p class="text-xs px2 fontbold my2">
                          Comments
                        </p>
                        <template v-if="replyingUID === post.result.uid">
                          <editor :id="'post_comment_' + post.result.uid"
                                  v-model="newMessage"
                                  e-max-height="400px"/>
                          <div class="wfull flex mt2">
                            <q-btn label="Send"
                                   unelevated
                                   icon-right="send"
                                   class="mlauto fontbold"
                                   @click="sendReply"
                                   no-caps/>
                          </div>
                        </template>
                        <template v-else>
                          <q-btn label="Reply"
                                 icon="reply"
                                 unelevated dense
                                 @click="replyToPost(post.result.uid)"
                                 class="ml1 fontbold"
                                 no-caps/>
                        </template>
                        <template v-if="post.result.replies">
                          <div class="mt3 flex column gap2">
                            <template v-for="reply in post.result.replies" :key="reply">
                              <div style="border-left: 4px solid var(--md-sys-color-primary)"
                                   class="px2 mt1 rounded">
                                <div class="flex gap-2 justify-between items-center">
                                  <p class="fontbold text-body2 mb1">
                                    {{ reply.usr }}
                                  </p>
                                  <p class="text-xs">
                                    {{ reply._ts }}
                                  </p>
                                </div>
                                <div class="markedView" v-html="reply.desc"></div>
                              </div>
                            </template>
                          </div>
                        </template>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-fab
              v-model="fab"
              label=""
              vertical-actions-align="right"
              color="primary"
              icon="menu"
              direction="up">
              <q-fab-action @click="startCreatingPost('post')"
                            color="primary" icon="add" label="New Post" label-position="left"/>
            </q-fab>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <wisdom-edit :is-open="isEditingWisdom"
               :knowledge-id="knowledge.uid"
               :type-preference="typePref"
               :type-changeable="false"
               @update="handleWisdomUpdate"
               @create="handleWisdomCreate"/>
</template>

<script>
import { api } from 'boot/axios'
import { dbGetDisplayName } from 'src/libs/wikistore'
import { DateTime } from 'luxon'
import WisdomEdit from 'components/knowledge/WisdomEdit.vue'
import { scroll } from 'quasar'
import { useStore } from 'stores/wikistate'
import Editor from 'components/EditorComponent.vue'

export default {
  components: {
    Editor,
    WisdomEdit
  },
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
  name: 'FeedView',
  data () {
    return {
      store: useStore(),
      internal: new BroadcastChannel('wikiric_internal'),
      isComponent: false,
      fab: false,
      sidebarLeft: false,
      groupID: undefined,
      chatroom: null,
      knowledge: { uid: '' },
      knowledgeExists: true,
      queryTime: 0,
      results: [],
      noResults: false,
      typePref: 'post',
      isEditingWisdom: false,
      lazyLoadingStatus: 'idle',
      currentPage: 0,
      pageSize: '10',
      extraSkipCount: 0,
      newMessage: '',
      replyingUID: '',
      isLoading: false
    }
  },
  created () {
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
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    initFunction: async function () {
      this.isLoading = true
      await this.getChatroom()
      await this.getKnowledge(this.groupID, true)
      await this.getFeed(false)
      this.isLoading = false
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
          // Is this a DM group? Beautify title then
          if (this.chatroom.type === 'dm') {
            const names = [...this.chatroom.t.matchAll(
              /\|([^|]+)\|/g)]
            let title = ''
            for (let i = 0; i < names.length; i++) {
              if (title !== '') {
                title += ' & '
              }
              title += names[i][1]
            }
            this.chatroom.t = title
          }
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
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
    getFeed: async function (lazyLoad = false) {
      return new Promise((resolve) => {
        let pageIndex = this.currentPage
        if (lazyLoad === true) {
          this.lazyLoadingStatus = 'request'
          pageIndex += 1
        }
        const parameters =
          '?page=' + pageIndex +
          '&results=' + this.pageSize +
          '&skip=' + this.extraSkipCount
        api({
          method: 'post',
          url: `wisdom/private/query/${this.knowledge.uid}${parameters}`,
          data: {
            query: '.',
            type: 'post',
            state: 'any',
            fields: '',
            noSort: true,
            descLen: 999_999_999,
            withReply: true
          }
        })
        .then((response) => {
          const parsedData = response.data
          if (!lazyLoad) {
            this.results = []
          }
          this.queryTime = parsedData.respTime
          let tmpNoResults = true
          // Prepare category color map
          const catColors = new Map()
          if (this.knowledge.cats) {
            for (let i = 0; i < this.knowledge.cats.length; i++) {
              catColors[this.knowledge.cats[i].t] = this.knowledge.cats[i].hex
            }
          }
          // Add results to list
          if (parsedData.posts && parsedData.posts.length > 0) {
            tmpNoResults = false
            this.addResults(parsedData.posts, 'misc', false, catColors)
          }
          if (!lazyLoad) {
            this.noResults = tmpNoResults
          }
        }).catch((err) => {
          console.debug(err.message)
          if (!lazyLoad) {
            this.results = []
            this.noResults = true
          }
        }).finally(() => {
          // this.scrollToElement(this.$refs.toolbar_top)
          if (lazyLoad) {
            this.currentPage++
            this.lazyLoadingStatus = 'idle'
          }
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
    startCreatingPost: function (forceType = 'post') {
      this.typePref = forceType
      this.isEditingWisdom = !this.isEditingWisdom
    },
    handleWisdomUpdate: function () {
    },
    handleWisdomCreate: function (wisdom) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/create',
          data: wisdom
        }).then(() => {
          this.extraSkipCount = 0
          this.currentPage = 0
          this.getFeed(false)
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
    reactToPost: async function (uid, text) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: `wisdom/private/react/${uid}`,
          data: {
            reaction: text
          }
        }).then(() => {
          for (let j = 0; j < this.results.length; j++) {
            if (this.results[j].result.uid === uid) {
              // Edit message
              try {
                // Check if message already contains a reaction of this type
                if (this.results[j].result.reacts && this.results[j].result.reacts.length > 0) {
                  for (let k = 0; k < this.results[j].result.reacts.length; k++) {
                    if (this.results[j].result.reacts[k].t === text) {
                      // We found the reaction... do we need to add or remove it?
                      // Check if user has reacted already
                      let doRemove = false
                      for (let i = 0; i < this.results[j].result.reacts[k].src.length; i++) {
                        if (this.results[j].result.reacts[k].src[i] === this.store.user.username) {
                          doRemove = true
                          break
                        }
                      }
                      if (doRemove === false) {
                        // Add reaction
                        this.results[j].result.reacts[k].src.push(this.store.user.username)
                      } else {
                        // Remove reaction
                        this.results[j].result.reacts[k].src = this.removeValuesFromArray(
                          this.results[j].result.reacts[k].src, this.store.user.username
                        )
                        if (this.results[j].result.reacts[k].src.length < 1) {
                          this.results[j].result.reacts.splice(k, 1)
                        }
                      }
                      return
                    }
                  }
                }
                this.results[j].result.reacts.push({
                  src: [this.store.user.username],
                  t: text,
                  _t: text
                })
              } catch (e) {
                console.debug(e.message)
              }
              break
            }
          }
          resolve()
        }).catch((err) => {
          console.debug(err.message)
        })
      })
    },
    checkScroll: function () {
      const { getVerticalScrollPosition } = scroll
      const y = getVerticalScrollPosition(this.$refs.feed_scroller)
      if (!y) {
        return
      }
      // Calculate distance to top
      const scrollHeight = this.$refs.feed_scroller.scrollHeight
      const clientHeight = this.$refs.feed_scroller.clientHeight
      const distance = scrollHeight - clientHeight - Math.abs(y)
      // Lazily retrieve new messages as we're approaching the top
      if (distance < 400 && this.lazyLoadingStatus === 'idle') {
        this.getFeed(true)
      }
    },
    /**
     *
     * @param array
     * @param value
     * @returns {*}
     */
    removeValuesFromArray: function (array, value) {
      let i = 0
      while (i < array.length) {
        if (array[i] === value) {
          array.splice(i, 1)
        } else {
          ++i
        }
      }
      return array
    },
    replyToPost: function (uid) {
      this.newMessage = ''
      this.replyingUID = uid
      setTimeout(() => {
        this.internal.postMessage({
          app: 'editor',
          type: 'focus'
        })
      }, 100)
    },
    sendReply: async function () {
      if (this.newMessage.trim() === '') return
      const payload = {
        t: '',
        desc: this.newMessage.trim(),
        ref: this.replyingUID,
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
          this.newMessage = ''
          this.replyingUID = ''
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    }
  }
}
</script>

<style scoped>

.feed_scroller {
  max-height: calc(100dvh - 180px)
}

@media (min-width: 769px) {
  .feed_scroller {
    max-height: calc(100dvh - 130px)
  }
}

</style>

<style lang="scss">

.markedView pre {
  background: #0D0D0D;
  color: #FFF;
  font-family: 'JetBrains Mono', monospace;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;

  code {
    color: inherit;
    padding: 0;
    background: none;
    font-size: 0.8rem;
  }

  .hljs-comment,
  .hljs-quote {
    color: #616161;
  }

  .hljs-variable,
  .hljs-template-variable,
  .hljs-attribute,
  .hljs-tag,
  .hljs-name,
  .hljs-regexp,
  .hljs-link,
  .hljs-name,
  .hljs-selector-id,
  .hljs-selector-class {
    color: #F98181;
  }

  .hljs-number,
  .hljs-meta,
  .hljs-built_in,
  .hljs-builtin-name,
  .hljs-literal,
  .hljs-type,
  .hljs-params {
    color: #FBBC88;
  }

  .hljs-string,
  .hljs-symbol,
  .hljs-bullet {
    color: #B9F18D;
  }

  .hljs-title,
  .hljs-section {
    color: #FAF594;
  }

  .hljs-keyword,
  .hljs-selector-tag {
    color: #70CFF8;
  }

  .hljs-emphasis {
    font-style: italic;
  }

  .hljs-strong {
    font-weight: 700;
  }
}

</style>
