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
          <template v-if="chatroom.burl">
            <div class="p2">
              <div class="wfull h-[10rem] rounded-2 overflow-hidden">
                <q-img :src="getImg(chatroom.burl, true)" alt="Banner"
                       fit="cover"/>
              </div>
            </div>
          </template>
          <q-toolbar class="fmt_border_bottom md:hidden">
            <q-btn flat dense icon="sym_o_left_panel_close"
                   align="left" class="wfull"
                   no-caps label="Hide Channels"
                   @click="sidebarLeft = !sidebarLeft">
            </q-btn>
          </q-toolbar>
          <q-btn flat icon="sym_o_arrow_left_alt"
                 align="left" class="wfull pl4 mt2"
                 no-caps
                 @click="$router.push('/q/groups')">
            <span class="ml4 text-body1">Groups</span>
          </q-btn>
          <q-btn flat icon="sym_o_settings"
                 align="left" class="wfull pl4"
                 no-caps
                 @click="showGroupSettings">
            <span class="ml4 text-body1">Settings</span>
          </q-btn>
          <q-toolbar>
            <q-toolbar-title class="text-lg">
              <span v-if="this.chatroom.subc">
                Apps
              </span>
            </q-toolbar-title>
          </q-toolbar>
          <q-btn icon="sym_o_school" flat no-caps
                 align="left"
                 class="wfull"
                 @click="gotoKnowledge">
            <span class="ml4 text-body1">Knowledge</span>
          </q-btn>
          <q-btn icon="sym_o_calendar_clock" flat no-caps
                 align="left"
                 class="wfull"
                 @click="gotoProjectManagement">
            <span class="ml4 text-body1">Projects</span>
          </q-btn>
          <q-toolbar>
            <q-toolbar-title class="text-lg">
              <span v-if="this.chatroom.subc">
                Channels - {{ this.chatroom.subc.length }}
              </span>
            </q-toolbar-title>
            <q-btn flat round dense icon="add"
                   v-on:click="addChannel()"/>
          </q-toolbar>
          <template v-if="chatroom.subc">
            <q-item v-for="chat in chatroom.subc" :key="chat"
                    clickable
                    dense
                    v-on:click="gotoChannel(chat)">
              <template v-if="chat._hasUnread">
                <div class="w[6px] h-[90%] bg-orange rounded-r absolute left-0"></div>
              </template>
              <q-item-section class="rounded"
                              :class="{'background': chat.uid === channel.id}">
                <q-item-label class="fontbold text-lg flex items-center">
                  <template v-if="chat.type === 'text'">
                    <q-icon name="tag" size="1.5rem"/>
                  </template>
                  <template v-else-if="chat.type === 'audio'">
                    <q-icon name="mic" size="1.5rem"/>
                  </template>
                  <template v-else-if="chat.type === 'video'">
                    <q-icon name="videocam" size="1.5rem"/>
                  </template>
                  <span class="ml4 text-body1"
                        :class="{'fontbold': chat.uid === channel.id}">
                    {{ chat.t }}
                  </span>
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-scroll-area>
      </q-drawer>
      <q-drawer
        side="right"
        v-model="sidebarRight"
        :width="256"
        class="background">
        <q-scroll-area class="fit">
          <q-toolbar class="fmt_border_bottom md:hidden">
            <q-btn flat dense icon="sym_o_right_panel_close"
                   align="left" class="wfull"
                   no-caps label="Hide Members"
                   @click="sidebarRight = !sidebarRight">
            </q-btn>
          </q-toolbar>
          <q-toolbar>
            <q-toolbar-title class="text-lg">
              Members - {{ members.size }}
            </q-toolbar-title>
            <q-btn flat round dense icon="person_add"
                   v-on:click="inviteToGroup"/>
          </q-toolbar>
          <q-item v-for="[key, member] of members.entries()" :key="member.id"
                  clickable>
            <q-menu touch-position>
              <member-card :member="member"/>
            </q-menu>
            <q-item-section v-if="key">
              <q-item-label class="fontbold text-lg">
                <member-icon :iurl="member.iurl"
                             :iurla="member.iurla"
                             :online="member.online"/>
                <span>{{ member.name }}</span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page style="padding-top: 60px" class="background">
          <q-page-sticky position="top" expand class="">
            <q-toolbar>
              <q-btn flat round dense icon="speaker_notes"
                     @click="sidebarLeft = !sidebarLeft">
                <q-tooltip class="text-body2">
                  Toggle&nbsp;Channels
                </q-tooltip>
              </q-btn>
              <q-toolbar-title class="text-subtitle1 sm:text-lg">
                <q-breadcrumbs active-color="brand-p">
                  <q-breadcrumbs-el :label="chatroom.t"/>
                  <template v-if="channel.t">
                    <template v-if="channel.type === 'text'">
                      <q-breadcrumbs-el :label="channel.t" icon="tag"/>
                    </template>
                    <template v-else-if="channel.type === 'audio'">
                      <q-breadcrumbs-el :label="channel.t" icon="mic"/>
                    </template>
                    <template v-else-if="channel.type === 'video'">
                      <q-breadcrumbs-el :label="channel.t" icon="videocam"/>
                    </template>
                  </template>
                </q-breadcrumbs>
              </q-toolbar-title>
              <q-btn flat round dense icon="people"
                     @click="sidebarRight = !sidebarRight">
                <q-tooltip class="text-body2">
                  Toggle&nbsp;Members
                </q-tooltip>
              </q-btn>
            </q-toolbar>
          </q-page-sticky>
          <div class="wfull hfull">
            <div ref="ref_messages"
                 class="hfull wfull p4 column reverse items-center scroll"
                 v-on:scroll="checkScroll">
              <div class="wfull max-w-3xl pr12 column reverse no-wrap">
                <div v-for="msg in messages" :key="msg"
                     class="relative wfull">
                  <p v-if="msg._separator"
                     class="headerline text-xs my4">
                    {{ msg._ts }}
                  </p>
                  <template v-if="msg._editable">
                    <q-chat-message
                      sent
                      :stamp="msg._ts"
                      bg-color="primary"
                      text-color="white"
                      class="markedView wfull">
                      <template v-for="txt in msg._msgs" :key="txt">
                        <chat-message-content :msg="txt"
                                              :sent="true"
                                              :reply-src="txt._source"
                                              class="wfull"
                                              @reply="handleReplyMessage"
                                              @edit="handleEditMessage"
                                              @delete="handleDeleteMessage"
                                              @copy="handleCopyMessage"
                                              @react="handleReactMessage"/>
                      </template>
                    </q-chat-message>
                  </template>
                  <template v-else>
                    <q-chat-message
                      :name="msg._name"
                      :stamp="msg._ts"
                      bg-color="brand-bg"
                      text-color="brand-p"
                      class="markedView">
                      <template v-slot:avatar>
                        <member-icon :iurl="msg._iurl"
                                     :iurla="msg._iurla"
                                     :online="false"
                                     :hide-status="true"/>
                      </template>
                      <template v-for="txt in msg._msgs" :key="txt">
                        <chat-message-content :msg="txt"
                                              :sent="false"
                                              :reply-src="txt._source"
                                              class="wfull"
                                              @reply="handleReplyMessage"
                                              @edit="handleEditMessage"
                                              @delete="handleDeleteMessage"
                                              @copy="handleCopyMessage"
                                              @react="handleReactMessage"/>
                      </template>
                    </q-chat-message>
                  </template>
                </div>
              </div>
            </div>
            <q-page-sticky id="ref_editor_container"
                           ref="ref_editor_container"
                           position="bottom"
                           expand
                           class="p4">
              <div class="flex row justify-start items-center
                          wfull max-w-3xl py1 gap-4 h-[2.2rem]">
                <div v-if="activeMembers.size > 0"
                     class="flex row justify-start items-center h-[2rem] gap2">
                  <q-spinner-dots color="primary" size="2rem" class=""/>
                  <template v-for="(usr, ix) of activeMembers" :key="usr">
                    <template v-if="ix > 0">
                      <span>|</span>
                    </template>
                    <p class="text-subtitle2">{{ usr[0] }}</p>
                  </template>
                </div>
                <div v-if="idleMembers.size > 0"
                     class="flex row justify-start items-center h-[2rem] gap2">
                  <q-icon name="visibility" size="1rem" class=""/>
                  <template v-for="(usr, ix) of idleMembers" :key="usr">
                    <template v-if="ix > 0">
                      <span>|</span>
                    </template>
                    <p class="text-subtitle2">{{ usr[0] }}</p>
                  </template>
                </div>
              </div>
              <div class="flex column items-center wfull max-w-3xl">
                <template v-if="emoteList.length > 0">
                  <list-picker class=""
                               :list="emoteList"
                               :query="newMessage"
                               :prefix="':'"
                               :key-name="'t'"
                               :headline="'Send a custom emote (Tab to complete)'"/>
                </template>
                <template v-if="replyingMessage">
                  <div class="flex wfull px4 py2 mt2
                            relative surface-variant">
                    <p class="text-body2 fontbold mb2">
                      Replying to message:
                    </p>
                    <q-chat-message
                      :name="replyingMessage._name"
                      :stamp="replyingMessage._ts"
                      bg-color="primary"
                      text-color="white"
                      class="markedView wfull">
                      <chat-message-content :msg="replyingMessage"
                                            no-interaction
                                            :sent="true"
                                            class="wfull"/>
                    </q-chat-message>
                  </div>
                </template>
                <template v-if="editingMessage">
                  <div class="flex wfull px4 py2 mt2
                            relative surface-variant">
                    <p class="text-body2 fontbold mb2">
                      Editing message:
                    </p>
                    <q-chat-message
                      :name="editingMessage._name"
                      :stamp="editingMessage._ts"
                      bg-color="primary"
                      text-color="white"
                      class="markedView wfull">
                      <chat-message-content :msg="editingMessage"
                                            no-interaction
                                            :sent="true"
                                            class="wfull"/>
                    </q-chat-message>
                  </div>
                </template>
              </div>
              <q-editor id="ref_editor"
                        ref="ref_editor"
                        v-model="newMessage"
                        @update:model-value="transmitActivity"
                        min-height="3rem"
                        class="wfull max-w-3xl"
                        content-class="markedView"
                        dense
                        :toolbar="toolbarConfig"
                        :fonts="toolbarFonts">
                <template v-slot:tag>
                  <q-btn-dropdown
                    dense no-caps
                    ref="tokenRef"
                    no-wrap
                    unelevated
                    label="Tag Member"
                    size="sm"
                  >
                    <q-list dense>
                      <q-item tag="label"
                              clickable
                              @click="addToEditor('everyone')">
                        <q-item-section side>
                          <q-icon name="sym_o_alternate_email" size="1rem"/>
                        </q-item-section>
                        <q-item-section>everyone</q-item-section>
                      </q-item>
                      <q-item tag="label"
                              clickable
                              @click="addToEditor('here')">
                        <q-item-section side>
                          <q-icon name="sym_o_alternate_email" size="1rem"/>
                        </q-item-section>
                        <q-item-section>here</q-item-section>
                      </q-item>
                      <template v-for="[key, member] of members.entries()" :key="member.id">
                        <q-item v-if="key"
                                tag="label"
                                clickable
                                @click="addToEditor(member.usr)">
                          <q-item-section side>
                            <q-icon name="sym_o_alternate_email" size="1rem"/>
                          </q-item-section>
                          <q-item-section>{{ member.usr }}</q-item-section>
                        </q-item>
                      </template>
                    </q-list>
                  </q-btn-dropdown>
                </template>
                <template v-slot:uploader>
                  <q-btn label="Upload" icon="upload" dense flat no-caps size="0.74em">
                    <q-menu ref="uploader"
                            touch-position
                            class="flex column reverse h100">
                      <file-picker
                        :uploading="isUploadingImage"
                        :upload-progress="uploadingImageProgress"
                        @selected="handleGroupImageSelected"
                        @upload="handleGroupImageUpload"/>
                    </q-menu>
                  </q-btn>
                </template>
              </q-editor>
            </q-page-sticky>
          </div>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <new-group-view :is-open="isAddingChannel"
                  :is-channel="true"
                  :group-id="chatroom.uid"
                  @refresh="handleChannelCreation"/>
  <invite-to-group :is-open="isInvitingToGroup"
                   :group-id="chatroom.uid"
                   :group-title="chatroom.t"/>
  <group-settings :is-open="isViewingSettings"
                  :group="chatroom"
                  @refresh="getChatroom"/>
</template>

<script>

import WikiricSdk from 'src/libs/wikiric-sdk'
import { api } from 'boot/axios'
import {
  dbGetDisplayName,
  dbGetSession,
  dbGetTimestamp,
  dbSetDisplayName,
  dbSetSession,
  dbSetTimestamp
} from '../libs/wikistore'
import { useStore } from 'stores/wikistate'
import { DateTime } from 'luxon'
import ChatMessageContent from 'components/chat/ChatMessageContent.vue'
import MemberIcon from 'components/chat/MemberIcon.vue'
import NewGroupView from 'components/chat/NewGroup.vue'
import { copyToClipboard, scroll } from 'quasar'
import InviteToGroup from 'components/chat/InviteToGroup.vue'
import MemberCard from 'components/chat/MemberCard.vue'
import ListPicker from 'components/ListPicker.vue'
import GroupSettings from 'components/chat/GroupSettings.vue'
import FilePicker from 'components/FilePicker.vue'

export default {
  name: 'ChatView',
  components: {
    FilePicker,
    GroupSettings,
    ListPicker,
    MemberCard,
    InviteToGroup,
    NewGroupView,
    MemberIcon,
    ChatMessageContent
  },
  data () {
    return {
      sdk: WikiricSdk,
      store: useStore(),
      sidebarLeft: false,
      sidebarRight: false,
      chatID: '',
      chatPW: '',
      chatroom: {
        uid: '',
        t: '',
        desc: ''
      },
      channel: {
        id: '',
        t: '',
        type: 'text'
      },
      members: new Map(),
      messages: [],
      // Custom Emote-Map
      emotes: null,
      // Custom Emote-Array
      emoteList: [],
      newMessage: '',
      last_message: {
        usr: ''
      },
      currentPage: 0,
      pageSize: 50,
      extraSkipCount: 0,
      lazyLoadingStatus: 'idle',
      isAddingChannel: false,
      isInvitingToGroup: false,
      isViewingSettings: false,
      lastActivity: undefined,
      activeMembers: new Map(),
      idleMembers: new Map(),
      replyingMessage: null,
      editingMessage: null,
      selectedImage: undefined,
      isUploadingImage: false,
      uploadingImageProgress: 0,
      toolbarConfig: [
        ['tag', 'uploader'],
        ['bold', 'italic', 'strike', 'underline'],
        ['token', 'hr', 'link'],
        [
          {
            label: this.$q.lang.editor.formatting,
            icon: this.$q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'p',
              'code'
            ]
          },
          {
            label: this.$q.lang.editor.fontSize,
            icon: this.$q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          }
        ]
      ],
      toolbarFonts: {
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
      }
    }
  },
  mounted () {
    this.initFunction()
  },
  beforeUnmount () {
    this.manageKeyListeners(true)
  },
  methods: {
    /**
     *
     * @returns {Promise<void>}
     */
    initFunction: async function () {
      // What chat are we connecting to?
      const chatID = this.$route.query.id
      const subchatID = this.$route.query.chan
      const password = this.$route.query.pw
      // Set values
      this.chatID = chatID.trim()
      if (subchatID) {
        this.channel.id = subchatID.trim()
      } else {
        this.channel.id = chatID.trim()
      }
      this.chatPW = password
      // Listen for new messages
      const events = new BroadcastChannel('wikiric_msg')
      events.onmessage = event => {
        this.handleIncomingMessage(event.data)
      }
      // Listen for backend messages
      const connector = new BroadcastChannel('wikiric_connector')
      connector.onmessage = event => {
        this.handleIncomingConnectorMessages(event.data)
      }
      // Prepare to connect to chat
      await this.getChatroom()
      await this.generateRSAKeyPair()
      // Connect to chat
      await this.connectToChat()
      // API Calls
      await this.getMainMembers()
      await this.getCustomEmotes()
    },
    /**
     *
     * @returns {Promise<unknown>}
     */
    getChatroom: function () {
      return new Promise((resolve) => {
        api({
          url: 'chat/private/get/' + this.chatID
        }).then(async (response) => {
          this.chatroom = response.data
          // Add general chat (main chat) to subchat list
          if (!this.chatroom.subc) {
            this.chatroom.subc = []
          }
          this.chatroom.subc.unshift({
            t: 'General',
            uid: this.chatroom.uid,
            type: 'text'
          })
          // Check unread messages
          for (let i = 0; i < this.chatroom.subc.length; i++) {
            await this.hasUnread(this.chatroom.subc[i].uid)
          }
          // Update store entry
          let chatEntry = await dbGetSession(this.chatID)
          if (chatEntry == null) {
            chatEntry = {
              id: this.chatID,
              t: this.chatroom.t,
              desc: this.chatroom.desc,
              iurl: this.chatroom.iurl,
              burl: this.chatroom.burl,
              type: this.chatroom.type
            }
          } else {
            chatEntry.iurl = this.chatroom.iurl
            chatEntry.burl = this.chatroom.burl
            chatEntry.t = this.chatroom.t
            chatEntry.desc = this.chatroom.desc
          }
          await dbSetSession(this.chatID, chatEntry)
          // Return
          resolve()
        }).catch((e) => {
          console.debug(e.message)
        })
      })
    },
    /**
     *
     * @returns {Promise<void>}
     */
    getMainMembers: async function () {
      api({
        url: 'chat/private/users/members/' + this.chatID
      })
      .then((response) => {
        this.members = new Map()
        if (response.data.members && response.data.members.length > 0) {
          // Parse JSON serialized users for performance
          let member
          for (let i = 0; i < response.data.members.length; i++) {
            // Main Members
            member = response.data.members[i]
            member.taggable = true
            if (member.usr === this.store.user.username) {
              member.online = true
              member.active = true
            } else {
              member.online = false
              member.active = false
            }
            // Set username
            dbSetDisplayName(member.usr, member.name)
            // Set keys for easy searching
            member._keys = member.usr + ' ' + member.name
            member._hint = member.name
            this.members.set(member.usr, member)
          }
        }
        this.sdk._wcrypt.setMembers(this.members)
      })
      .catch(() => {
        this.members = []
      })
    },
    /**
     *
     * @param {Boolean=false} lazyLoad
     * @returns {Promise<void>}
     */
    getMessages: async function (lazyLoad = false) {
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
        url: 'msg/private/chat/get/' + this.channel.id + parameters
      }).then((response) => {
        this.processGetMessagesResult(response.data, lazyLoad)
      }).catch((e) => {
        console.debug(e.message)
      })
    },
    /**
     *
     * @param {Object} data
     * @param {Boolean=false} lazyLoad
     * @returns {Promise<void>}
     */
    processGetMessagesResult: async function (data, lazyLoad = false) {
      if (data.messages == null) {
        if (lazyLoad) this.lazyLoadingStatus = 'idle'
        return
      }
      let pageIndex = this.currentPage
      if (data.messages.length === 0) {
        // No more messages can be loaded
        if (lazyLoad) this.lazyLoadingStatus = 'done'
        return
      }
      if (lazyLoad) pageIndex++
      // Add messages to stack
      if (pageIndex === 0) {
        // Initial loading
        this.messages = []
      }
      const tmpMsgArray = []
      let tmpMessage
      let tmpMessageLast
      let clone
      for (const element of data.messages.reverse()) {
        // Process raw message, converting into a usable chat message object
        tmpMessage = await this.processRawMessage(element)
        if (!tmpMessage.msg) continue
        clone = structuredClone(tmpMessage)
        tmpMessage._msgs = [clone]
        // Check if message has a header
        // If it does not have a header, we will append its text to the previous message
        if (!tmpMessage._header && tmpMessageLast) {
          tmpMessageLast._ts = tmpMessage._ts
          tmpMessageLast._msgs.push(clone)
        } else {
          if (tmpMessageLast) tmpMsgArray.unshift(tmpMessageLast)
          tmpMessageLast = structuredClone(tmpMessage)
        }
      }
      if (tmpMessageLast) tmpMsgArray.unshift(tmpMessageLast)
      tmpMsgArray.forEach(element => this.messages.push(element))
      if (lazyLoad) {
        this.currentPage++
        this.lazyLoadingStatus = 'idle'
      }
    },
    /**
     *
     * @param {Object|String} msg
     * @param {Boolean=false} draft
     * @param skipKeywords
     * @returns {Promise<unknown>}
     */
    processRawMessage: async function (msg, draft = false, skipKeywords = false) {
      // Deserialize
      let message
      if (typeof msg === 'string') {
        message = JSON.parse(msg)
      } else {
        message = msg
      }
      // Catch SC (former ScreenShare) messages here
      if (message.msg.substring(0, 6) === '[c:SC]') {
        return new Promise((resolve) => {
          this.handleSCMessage(message)
          resolve('')
        })
      }
      // Initialize message
      if (!skipKeywords) {
        message._mType = 'Text'
        message._isApi = false
        // Process reserved keywords
        message = this.processMessageKeywords(message)
      }
      // Process timestamp
      message._time = DateTime.fromISO(message.ts)
      message._ts = this.getHumanReadableDateText(message._time, true, true)
      // Reactions
      if (message.reacts != null) {
        for (let i = message.reacts.length - 1; i >= 0; i--) {
          if (message.reacts[i].src.length === 0) {
            message.reacts.splice(i, 1)
          } else {
            message.reacts[i]._t = this.replaceEmotePlaceholders(message.reacts[i].t)
          }
        }
      } else {
        message.reacts = []
      }
      /* Do we have to add a message header?
      Don't add a header (avatar, name) if the last message came from the same source and similar time
       */
      message._header = true
      if (message.usr === '_server' || message._isApi !== true) {
        if (this.last_message.usr === message.usr) {
          // If the sources are identical, check if the time was similar
          let timeDiff
          if (this.last_message._time) {
            timeDiff = message._time.toMillis() - this.last_message._time.toMillis()
          } else {
            timeDiff = 999999
          }
          timeDiff = (Math.abs((timeDiff) / 1000) / 60)
          // If the message is 1 minutes or older put the message header
          message._header = timeDiff >= 1
        }
      }
      if (message._header === true) {
        message._iurl = ''
        message._iurla = ''
        // Check for profile picture
        if (this.members.has(message.usr)) {
          const mbr = this.members.get(message.usr)
          message._name = mbr.name
          if (mbr.iurl != null) {
            message._iurl = mbr.iurl
            // Animated pictures!!!
            if (mbr.iurla != null) {
              message._iurla = mbr.iurla
            }
          }
        } else {
          message._name = await dbGetDisplayName(message.usr)
        }
      }
      // Do we need to add a separator since a new day began?
      message._seperator = false
      const msgDay = message._time.day
      const msgMonth = message._time.month
      const msgYear = message._time.year
      if (this.last_message) {
        if (msgYear > this.last_message.msgYear ||
          msgMonth > this.last_message.msgMonth ||
          msgDay > this.last_message.msgDay) {
          // Put the separator!
          message._separator = true
        }
      }
      /* Are we allowed to edit this message?
      Only allow the user to edit his own messages, not the ones of others
       */
      message._editable = (message.usr === this.store.user.username)
      // Is the message encrypted?
      const encryptionPrefix = '[c:MSG<ENCR]'
      if (message.msg.startsWith(encryptionPrefix)) {
        message._isEncrypted = true
        try {
          message = await this.sdk.decryptMessage(message)
          if (message.msg == null) {
            message.msg = 'The message could not be decrypted.'
            message._mType = 'CryptError'
            message._isApi = false
            message._decryptionFailed = true
            message.reacts = []
          }
          message._decryptionFailed = false
        } catch (e) {
          console.debug('ENCRYPTION ERROR', e.message)
          message.msg = 'The message could not be decrypted.'
          message._mType = 'CryptError'
          message._isApi = false
          message._decryptionFailed = true
          message.reacts = []
        }
      }
      if (message._isFile || message._mType === 'GIF') {
        try {
          const tmp = JSON.parse(message.msg)
          message.msg = tmp.msg
          message._msgURL = tmp.url
          message._fileName = tmp.fileName
        } catch (e) {
          console.debug('File Message Parsing Error')
        }
      } else if (message._mType === 'Reply') {
        try {
          const tmp = JSON.parse(message.msg)
          tmp.src.time = DateTime.fromISO(tmp.src.ts)
          message.msg = tmp.reply
          message._source = tmp.src
          message._source._time = DateTime.fromISO(message._source.ts)
          message._source._ts = this.getHumanReadableDateText(message._source._time, true, true)
        } catch (e) {
          console.debug('Reply Message Parsing Error')
        }
      }
      if (message.msg) {
        message._tagged = message.msg.includes('@' + this.store.user.username)
        if (!message._tagged) {
          message._tagged = message.msg.includes('@everyone') || message.msg.includes('@here')
        }
      }
      if (!draft) {
        // Set this message as the last that was processed
        this.last_message = message
        this.last_message.msgDay = msgDay
        this.last_message.msgMonth = msgMonth
        this.last_message.msgYear = msgYear
      }
      // Save original message content
      message._msg = message.msg
      if (message.msg) {
        // Replace emote placeholders
        if (message._mType !== 'ReactNotification') {
          message.msg = this.replaceEmotePlaceholders(message.msg)
        }
        // Check if msg only consists of an emote
        const rgx = /^!\[:.+:]\(.+\)$/
        const results = message.msg.match(rgx)
        if (results != null && results.length > 0) {
          message._enlarge = true
        }
      }
      return new Promise((resolve) => {
        resolve(message)
      })
    },
    /**
     *
     * @param {String} msg
     * @returns {*}
     */
    replaceEmotePlaceholders: function (msg) {
      if (this.emotes == null) return msg
      const escape = s => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      const pattern = new RegExp(
        Object.keys(this.emotes).map(escape).join('|'), 'g'
      )
      return msg.replace(pattern, match => this.emotes[match])
    },
    /**
     *
     */
    inputResize: function () {
      setTimeout(() => {
        if (!this.$refs.ref_messages || !this.$refs.ref_messages.style) return
        const editor = document.getElementById('ref_editor_container')
        this.$refs.ref_messages.style.maxHeight =
          `calc(100dvh - ${editor.clientHeight + 104}px)`
      }, 0)
    },
    /**
     *
     */
    manageKeyListeners: function (forceRemove = false) {
      document.removeEventListener('keydown', this.handleChatKeyDown, false)
      if (forceRemove) return
      document.addEventListener('keydown', this.handleChatKeyDown, false)
    },
    /**
     *
     * @param {KeyboardEvent} e
     */
    handleChatKeyDown: function (e) {
      if (e.key === 'Enter') {
        if (e.shiftKey) return
        e.preventDefault()
        e.stopImmediatePropagation()
        this.sendMessage().then(() => {
          this.inputResize()
        })
      } else if (e.key === 'ArrowUp') {
        this.editLastMessage()
      } else if (e.key === 'Escape') {
        this.cancelActions()
      }
    },
    /**
     *
     * @param {Object} message
     * @returns {Promise<void>}
     */
    handleSCMessage: async function (message) {
      const tmp = message.msg.substring(6)
      if (tmp.startsWith('[activity]')) {
        this.receiveActivity(tmp.substring(10))
      } else if (tmp.startsWith('[online]')) {
        this.setMemberOnlineStatus([tmp.substring(8)], true)
      } else if (tmp.substring(0, 9) === '[offline]') {
        // Set offline user status and remove him from all activity
        const username = tmp.substring(9)
        this.setMemberOnlineStatus([username], false)
        this.clearActivity(username, false, true)
        this.clearActivity(username, true, true)
        // if ((this.currentSubchat.type === 'webcam' || this.params) && this.wRTC.selfId != null) {
        //   const remoteId = this.getIdFromUser(username)
        //   if (remoteId) {
        //     this.wRTC.hangup(remoteId)
        //     const videoElem = document.getElementById('screenshare_video_' + remoteId)
        //     const audioElem = document.getElementById('screenshare_audio_' + remoteId)
        //     const container = document.getElementById('screenshare_container_' + remoteId)
        //     if (videoElem) videoElem.srcObject = null
        //     if (audioElem) audioElem.srcObject = null
        //     if (container) container.style.display = 'none'
        //   }
        // }
      }
    },
    /**
     *
     * @param {Object} message
     * @returns {*}
     */
    processMessageKeywords: function (message) {
      if (message.action === 'edit') {
        message._mType = 'EditNotification'
      } else if (message.action === 'react') {
        message._mType = 'ReactNotification'
      } else if (message.msg.includes('[s:RegistrationNotification]') === true && message.usr === '_server') {
        message._mType = 'RegistrationNotification'
        message.msg = message.msg.substring(28)
      } else if (message.msg.includes('[s:Leaderboard]') === true && message.usr === '_server') {
        message._mType = 'Leaderboard'
        message.msg = message.msg.substring(15)
      } else if (message.msg.includes('[c:GIF]') === true) {
        message._mType = 'GIF'
        message._isApi = true
        message.msg = message.msg.substring(7)
      } else if (message.msg.includes('[c:JOKE]') === true) {
        message._mType = 'Joke'
        message._isApi = true
        message.msg = message.msg.substring(8)
      } else if (message.msg.includes('[c:IMG]') === true) {
        message._mType = 'Image'
        message._isApi = true
        message._isFile = true
        message.msg = message.msg.substring(7)
      } else if (message.msg.includes('[c:AUD]') === true) {
        message._mType = 'Audio'
        message._isApi = true
        message._isFile = true
        message.msg = message.msg.substring(7)
      } else if (message.msg.includes('[c:TASK]') === true) {
        message._mType = 'Task'
        message._isApi = true
        message.msg = message.msg.substring(8)
      } else if (message.msg.includes('[c:REPLY]') === true) {
        message._mType = 'Reply'
        message.msg = message.msg.substring(9)
      } else if (message.msg.includes('[c:TXT]') === true) {
        message._mType = 'TextFile'
        message._isApi = true
        message._isFile = true
        message.msg = message.msg.substring(7)
      } else if (message.msg.includes('[c:ZIP]') === true) {
        message._mType = 'ZipFile'
        message._isApi = true
        message._isFile = true
        message.msg = message.msg.substring(7)
      } else if (message.msg.includes('[c:FIL]') === true) {
        message._mType = 'File'
        message._isApi = true
        message._isFile = true
        message.msg = message.msg.substring(7)
      }
      return message
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
    /**
     *
     * @param {Boolean=false} force
     * @returns {Promise<unknown>}
     */
    generateRSAKeyPair: async function (force = false) {
      if (this.chatID == null || this.chatID === '') return
      // Check if we already have a PrivKey for this chat GUID
      const clarifierKeyPair = await dbGetSession(this.chatID)
      if (clarifierKeyPair && clarifierKeyPair.priv) {
        // We already have a private key
        if (!force) return
      }
      // Generate key pair
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-384'
        },
        true,
        ['encrypt', 'decrypt']
      )
      await dbSetSession(this.chatID, {
        id: this.chatID,
        t: this.chatroom.t,
        desc: this.chatroom.desc,
        iurl: this.chatroom.iurl,
        burl: this.chatroom.burl,
        priv: await this.exportRSAPrivKey(keyPair.privateKey),
        type: this.chatroom.type
      })
      const content = {
        pubKeyPEM: await this.exportRSAPubKey(keyPair.publicKey)
      }
      let query = ''
      if (force === true) {
        query = '?force=true'
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'chat/private/pubkey/' + this.chatID + query,
          data: content
        })
        .then(() => {
          if (force === true) {
            // this.$notify(
            //   {
            //     title: 'Encryption Key Replaced',
            //     text: '',
            //     type: 'fmt_notify'
            //   })
          }
        })
        .then(resolve)
        .catch((err) => console.debug(err.message))
      })
    },
    /**
     *
     * @param {CryptoKey} key
     * @returns {Promise<string>}
     */
    exportRSAPrivKey: async function (key) {
      const exported = await window.crypto.subtle.exportKey(
        'pkcs8',
        key
      )
      const exportedAsString = this.arrayBufferToString(exported)
      const exportedAsBase64 = window.btoa(exportedAsString)
      return '-----BEGIN PRIVATE KEY-----\n' + exportedAsBase64 + '-----END PRIVATE KEY-----'
    },
    /**
     *
     * @param {CryptoKey} key
     * @returns {Promise<string>}
     */
    exportRSAPubKey: async function (key) {
      const exported = await window.crypto.subtle.exportKey(
        'spki',
        key
      )
      const exportedAsString = this.arrayBufferToString(exported)
      const exportedAsBase64 = window.btoa(exportedAsString)
      return '-----BEGIN PUBLIC KEY-----\n' + exportedAsBase64 + '\n-----END PUBLIC KEY-----'
    },
    /**
     *
     * @param {ArrayBuffer} buf
     * @returns {string}
     */
    arrayBufferToString: function (buf) {
      return String.fromCharCode.apply(null, new Uint8Array(buf))
    },
    /**
     *
     * @param {Object} message
     * @returns {Promise<void>}
     */
    handleIncomingMessage: async function (message) {
      // Convert raw message to usable object
      const msg = await this.processRawMessage(
        message, false, true)
      // Check draft
      if (msg._mType !== 'EditNotification') {
        // Prevent empty messages or commands to be inserted
        if (!msg.msg) return
        // Check if message was sent from this device
        if (msg.usr === this.store.user.username) {
          const indexTmp = this.messages.findIndex(
            element => element._isDraft && element.usr === this.store.user.username
          )
          if (indexTmp > -1) {
            this.messages[indexTmp]._header = msg._header
            this.messages[indexTmp]._isDraft = false
            // Look for sub-message without uid
            for (let j = 0; j < this.messages[indexTmp]._msgs.length; j++) {
              if (!this.messages[indexTmp]._msgs[j].uid || this.messages[indexTmp]._msgs[j].uid === '-1') {
                this.messages[indexTmp]._msgs[j].uid = msg.uid
                break
              }
            }
            return
          }
        }
      }
      // Check for edit or reaction
      if (message._mType === 'EditNotification') {
        if (message.uid == null) return
        let done = false
        // Look through header messages
        for (let i = 0; i < this.messages.length; i++) {
          // ...and their sub-messages
          for (let j = 0; j < this.messages[i]._msgs.length; j++) {
            if (this.messages[i]._msgs[j].uid === message.uid) {
              if (message.msg.trim() !== '') {
                // Edit message
                try {
                  this.messages[i]._msgs[j]._tagged = message._tagged
                  this.messages[i]._msgs[j].msg = message.msg
                  this.messages[i]._msgs[j]._msg = message._msg
                  this.messages[i]._msgs[j].e = true
                } catch (e) {
                  console.debug(e.message)
                }
              } else {
                // Delete message
                this.messages[i]._msgs.splice(j, 1)
                if (this.messages[i]._msgs.length < 1) {
                  this.messages.splice(i, 1)
                }
                this.getLastMessageTime()
              }
              done = true
              break
            }
          }
          if (done) break
        }
        // Reset the edit background
        this.resetEditing()
        return
      } else if (message._mType === 'ReactNotification') {
        if (message.uid == null) return
        let done = false
        // Look through header messages
        for (let i = 0; i < this.messages.length; i++) {
          // ...and their sub-messages
          for (let j = 0; j < this.messages[i]._msgs.length; j++) {
            if (this.messages[i]._msgs[j].uid === message.uid) {
              // Edit message
              try {
                // Check if message already contains a reaction of this type
                if (this.messages[i]._msgs[j].reacts.length > 0) {
                  for (let k = 0; k < this.messages[i]._msgs[j].reacts.length; k++) {
                    if (this.messages[i]._msgs[j].reacts[k].t === message.msg) {
                      // We found the reaction... do we need to add or remove it?
                      if (message.e === false) {
                        // Add reaction
                        this.messages[i]._msgs[j].reacts[k].src.push(message.usr)
                      } else {
                        // Remove reaction
                        this.messages[i]._msgs[j].reacts[k].src = this.removeValuesFromArray(
                          this.messages[i]._msgs[j].reacts[k].src, message.usr
                        )
                        if (this.messages[i]._msgs[j].reacts[k].src.length < 1) {
                          this.messages[i]._msgs[j].reacts.splice(k, 1)
                        }
                      }
                      return
                    }
                  }
                }
                if (message.e === false) {
                  this.messages[i]._msgs[j].reacts.push({
                    src: [message.usr],
                    t: message.msg,
                    _t: this.replaceEmotePlaceholders(message.msg)
                  })
                  // setTimeout(() => {
                  //   const elem = document.getElementById(
                  //     'react_' + message.uid + '_' + message.msg)
                  //   elem.style.display = 'flex'
                  //   document.getElementById('react_' + message.uid + '_' + message.msg).title =
                  //     message.usr + ' reacted to this message.'
                  // }, 0)
                }
              } catch (e) {
                console.debug(e.message)
              }
              done = true
              break
            }
          }
          if (done) break
        }
        return
      }
      // Add new message
      if (msg.msg) {
        // Modify previous message if there is no header
        if (!msg._header) {
          for (let i = 0; i < this.messages.length; i++) {
            if (this.messages[i].usr === msg.usr) {
              this.messages[i]._ts = msg._ts
              this.messages[i]._msgs.push(msg)
              break
            }
          }
        } else {
          msg._msgs = [msg]
          this.messages.unshift(msg)
        }
      }
      // Remove active state on member
      this.clearActivity(msg.usr, false, true)
    },
    /**
     *
     * @returns {Promise<void>}
     */
    sendMessage: async function () {
      // Add one to the skip count
      this.extraSkipCount += 1
      // Are we currently replying?
      if (this.replyingMessage) {
        await this.sendReply()
        return
      }
      // Are we currently editing?
      if (this.editingMessage) {
        await this.sendEdit()
        return
      }
      if (this.newMessage.trim() === '') return
      // Retrieve and limit the message's content
      let messageContent = this.newMessage.substring(0, 5000)
      messageContent = messageContent.replaceAll(
        '<i class="q-icon material-icons cursor-pointer" onclick="this.parentNode.parentNode.removeChild(this.parentNode)">close</i>', '')
      // Do we need to encrypt the message?
      if (this.chatroom.crypt) {
        messageContent = await this.sdk._wcrypt.encryptPayload(messageContent)
      }
      // Pre-Display message
      const msg = await this.processRawMessage({
        uid: '-1',
        ts: DateTime.now().toISO(),
        usr: this.store.user.username,
        msg: messageContent,
        _isDraft: true
      })
      if (!msg._header) {
        this.messages[0]._isDraft = true
        this.messages[0]._ts = msg._ts
        this.messages[0]._msgs.push(msg)
      } else {
        msg._msgs = [msg]
        this.messages.unshift(msg)
      }
      this.newMessage = ''
      // Send message
      this.sdk.sendMessage(messageContent)
      // Clear activity
      this.clearActivity(this.store.user.username, false, true)
    },
    /**
     *
     */
    addChannel: function () {
      this.isAddingChannel = !this.isAddingChannel
    },
    /**
     *
     */
    inviteToGroup: function () {
      this.isInvitingToGroup = !this.isInvitingToGroup
    },
    /**
     *
     * @returns {Promise<void>}
     */
    connectToChat: async function () {
      this.resetChannelStats()
      const sesh = await dbGetSession(this.chatID)
      await this.sdk.doLogin(this.store.user._u, this.store.user._p)
      await this.sdk.doConnect(this.channel.id, sesh.priv, '', this.chatPW)
      // Finish preparations
      this.manageKeyListeners()
      this.inputResize()
      // Retrieve messages and prepare input field
      await this.getMessages()
      this.$refs.ref_editor.focus()
      // Remember the current channel
      if (this.channel.id !== this.chatID) {
        sesh.lastChannelID = this.channel.id
        // Set channel info if it isn't already set
        if (!this.channel.t || this.channel.t === '') {
          for (let i = 0; i < this.chatroom.subc.length; i++) {
            if (this.chatroom.subc[i].uid === this.channel.id) {
              this.channel.t = this.chatroom.subc[i].t
              break
            }
          }
        }
      } else {
        sesh.lastChannelID = ''
      }
      await dbSetSession(this.chatID, sesh)
      // Get active members + send online message
      await this.getActiveMembers()
      await this.getMessages(true)
      await this.addTimestampRead()
    },
    /**
     *
     * @param {Object} channel
     */
    gotoChannel: function (channel) {
      this.messages = []
      // Prepare to connect
      this.channel.id = channel.uid
      this.channel.t = channel.t
      this.channel.type = channel.type
      this.connectToChat()
      // Hide sidebar on mobile
      if (window.innerWidth < 768) {
        this.sidebarLeft = false
      }
    },
    /**
     *
     */
    resetChannelStats: function () {
      this.lazyLoadingStatus = 'idle'
      this.currentPage = 0
      this.extraSkipCount = 0
      this.activeMembers.clear()
      this.idleMembers.clear()
    },
    /**
     *
     */
    checkScroll: function () {
      const { getVerticalScrollPosition } = scroll
      const y = getVerticalScrollPosition(this.$refs.ref_messages)
      if (!y) {
        return
      }
      // Calculate distance to top
      const scrollHeight = this.$refs.ref_messages.scrollHeight
      const clientHeight = this.$refs.ref_messages.clientHeight
      const distance = scrollHeight - clientHeight - Math.abs(y)
      // Lazily retrieve new messages as we're approaching the top
      if (distance < 400 && this.lazyLoadingStatus === 'idle') {
        this.getMessages(true)
      }
    },
    /**
     *
     */
    transmitActivity: function () {
      this.checkLastInput()
      this.inputResize()
      if (this.lastActivity) {
        // Send activity every 5 seconds max
        if (this.lastActivity.diffNow().milliseconds > -5_000) {
          this.lastActivity = DateTime.now()
          this.receiveActivity(this.store.user.username, false)
          return
        }
      }
      this.lastActivity = DateTime.now()
      this.receiveActivity(this.store.user.username, true)
      this.sdk.sendMessage('[c:SC]' + '[activity]' + this.store.user.username)
    },
    /**
     *
     */
    checkLastInput: function () {
      // const pos = toRaw(this.$refs.ref_editor.caret._range.endOffset)
      // const msg = this.newMessage
      // if (!msg) return
      // const lastChar = msg.substring(pos, pos + 1)
      // // Get surrounding chars
      // let atStart = true
      // let atEnd = true
      // let leftChar = ''
      // let rightChar = ''
      // if (pos > 0) {
      //   atStart = false
      //   leftChar = msg.substring(pos - 1, pos)
      // }
      // if (pos < msg.length - 1) {
      //   atEnd = false
      //   rightChar = msg.substring(pos + 1, pos + 2)
      // }
      // console.log(msg)
      // console.log(pos, atStart, leftChar, lastChar, rightChar, atEnd)
    },
    /**
     *
     * @param {String} username
     * @param {Boolean=true} doClear
     */
    receiveActivity: function (username, doClear = true) {
      // First clear idle status if it exists
      this.clearActivity(username, true, true)
      // Set active status
      this.activeMembers.set(username, DateTime.now())
      // Clear activity after 5 seconds inactivity
      if (doClear) {
        this.clearActivity(username)
      }
      // Set online status, too (convenience!)
      this.setMemberOnlineStatus([username], true)
    },
    /**
     *
     * @param {String} username
     * @param {Boolean=false} idle
     * @param {Boolean=false} force
     */
    clearActivity: function (username, idle = false, force = false) {
      let lastActivity
      if (!idle) {
        lastActivity = this.activeMembers.get(username)
      } else {
        lastActivity = this.idleMembers.get(username)
      }
      if (!lastActivity) return
      // Clear activity after X seconds inactivity
      let threshold = -5_000
      if (idle) threshold = -30_000
      if (force || lastActivity.diffNow().milliseconds <= threshold) {
        if (!idle) {
          this.activeMembers.delete(username)
          this.idleMembers.set(username, DateTime.now())
          // Clear idle after 30 seconds
          this.clearActivity(username, true)
        } else {
          this.idleMembers.delete(username)
        }
      } else {
        // Retry in X seconds
        setTimeout(() => {
          this.clearActivity(username, idle)
        }, Math.abs(threshold) - 1_000)
      }
    },
    /**
     *
     * @param {Array<String>} usernames
     * @param {Boolean} isOnline
     */
    setMemberOnlineStatus: function (usernames, isOnline) {
      let member
      for (let i = 0; i < usernames.length; i++) {
        member = this.members.get(usernames[i])
        if (member) {
          member.online = isOnline
          if (!member.online) member.active = false
          this.members.set(usernames[i], member)
        }
      }
    },
    /**
     *
     * @param {Object} channel
     * @returns {Promise<void>}
     */
    handleChannelCreation: async function (channel) {
      await this.getChatroom()
      this.gotoChannel(channel)
    },
    /**
     *
     * @returns {Promise<unknown>}
     */
    getCustomEmotes: function () {
      return new Promise((resolve) => {
        api({
          url: `files/private/chat/${this.chatID}?type=emote`
        }).then((response) => {
          const emotes = response.data.files
          if (emotes.length < 1) return
          let url
          let md
          let fname
          this.emotes = new Map()
          this.emoteList = []
          for (let i = 0; i < emotes.length; i++) {
            url = this.$store.state.serverIP + '/' + emotes[i].pth
            emotes[i].t = emotes[i].t.split('.')[0]
            fname = ':' + emotes[i].t + ':'
            // Build Markdown image string
            md = `![${fname}](${url})`
            this.emotes[fname] = md
            // Add to emote list (user prompt)
            emotes[i]._md = md
            this.emoteList.push(emotes[i])
          }
          resolve()
        }).catch((e) => {
          console.debug(e.message)
        })
      })
    },
    /**
     *
     */
    showGroupSettings: function () {
      this.isViewingSettings = !this.isViewingSettings
    },
    /**
     *
     * @returns {Promise<void>}
     */
    getActiveMembers: async function () {
      api({
        url: 'chat/private/users/active/' + this.channel.id
      })
      .then((data) => {
        // for (let i = 0; i < this.mainMembers.length; i++) {
        //   this.mainMembers[i].active = (this.mainMembers[i].usr === this.store.user.username)
        // }
        // this.setActiveMembers(data.result.members, true, subchatMemberMode, uniChatroomGUID)
      })
      .finally(() => {
        setTimeout(() => {
          this.getOnlineUsers()
          this.sdk.sendMessage('[c:SC]' + '[online]' + this.store.user.username)
        }, 0)
      })
    },
    /**
     *
     * @param imgGUID
     * @param get
     * @returns {*|string}
     */
    getImg: function (imgGUID, get = false) {
      if (imgGUID == null || imgGUID === '') {
        return ''
      } else {
        let ret = imgGUID
        if (get) ret = this.store.serverIP + imgGUID
        return ret
      }
    },
    /**
     *
     * @param name
     */
    addToEditor (name) {
      this.$refs.tokenRef.hide()
      const edit = this.$refs.ref_editor
      edit.caret.restore()
      edit.runCmd('insertHTML', `&nbsp;<div class="editor_token row inline items-center" contenteditable="false"><span>@${name}</span><i class="q-icon material-icons cursor-pointer" onclick="this.parentNode.parentNode.removeChild(this.parentNode)">close</i></div>&nbsp;`)
      edit.focus()
    },
    /**
     *
     * @param uid
     */
    handleReplyMessage: function (uid) {
      let done = false
      for (let i = 0; i < this.messages.length; i++) {
        for (let j = 0; j < this.messages[i]._msgs.length; j++) {
          if (this.messages[i]._msgs[j].uid === uid) {
            this.replyingMessage = this.messages[i]._msgs[j]
            this.inputResize()
            this.$refs.ref_editor.focus()
            done = true
            break
          }
        }
        if (done) break
      }
    },
    /**
     *
     * @param uid
     * @param lastMessage
     * @param setLastMessage
     */
    handleEditMessage: function (uid, lastMessage = false, setLastMessage = false) {
      let done = false
      let valid = false
      for (let i = 0; i < this.messages.length; i++) {
        for (let j = this.messages[i]._msgs.length - 1; j >= 0; j--) {
          if (lastMessage && this.messages[i]._msgs[j].usr === this.store.user.username) {
            valid = true
          }
          if (!valid && this.messages[i]._msgs[j].uid === uid) {
            valid = true
          }
          if (valid) {
            if (!setLastMessage) {
              this.editingMessage = this.messages[i]._msgs[j]
              this.newMessage = this.messages[i]._msgs[j]._msg
              this.inputResize()
            } else {
              this.last_message = this.messages[i]._msgs[j]
              this.last_message.msgDay = this.messages[i]._msgs[j]._time.day
              this.last_message.msgMonth = this.messages[i]._msgs[j]._time.day
              this.last_message.msgYear = this.messages[i]._msgs[j]._time.day
            }
            this.$refs.ref_editor.focus()
            done = true
            break
          }
        }
        if (done) break
      }
    },
    /**
     *
     * @param uid
     */
    handleDeleteMessage: function (uid) {
      this.handleEditMessage(uid)
      this.sendEdit(true)
    },
    /**
     *
     * @param messageContent
     */
    handleCopyMessage: function (messageContent) {
      copyToClipboard(messageContent)
      .then(() => {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Message copied',
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
      .catch(() => {
      })
    },
    /**
     *
     * @param uid
     * @param reaction
     */
    handleReactMessage: function (uid, reaction) {
      this.reactToMessage(uid, reaction)
    },
    /**
     *
     */
    getOnlineUsers: function () {
      const payload = {
        usernames: []
      }
      for (const [key, member] of this.members.entries()) {
        if (key && key !== this.store.user.username) {
          // Add user to payload and set online status to offline
          payload.usernames.push(member.usr)
          this.setMemberOnlineStatus([member.usr], false)
        }
      }
      if (payload.usernames.length < 1) return
      api({
        method: 'POST',
        url: 'users/private/status',
        data: payload
      }).then((result) => {
        if (!result.data.users) return
        for (let i = 0; i < result.data.users.length; i++) {
          if (result.data.users[i].status === 'online') {
            this.setMemberOnlineStatus(
              [result.data.users[i].usr],
              true)
          }
        }
      }).catch((e) => {
        console.debug(e.message)
      })
    },
    /**
     *
     * @returns {Promise<void>}
     */
    sendReply: async function () {
      if (!this.replyingMessage) return
      this.replyingMessage._msgs = []
      this.newMessage = this.replaceTagRemover(this.newMessage)
      const payload = await this.sdk._wcrypt.encryptPayload(
        JSON.stringify({
          src: this.replyingMessage,
          reply: this.newMessage
        }))
      this.replyingMessage = null
      this.newMessage = ''
      const txt = '[c:REPLY]' + payload
      this.sdk.sendMessage(txt)
    },
    /**
     *
     */
    sendEdit: async function (forceDelete = false) {
      // Was the message actually edited?
      if (!forceDelete && this.newMessage === this.editingMessage._msg) {
        this.resetEditing()
        return
      }
      // Apply edited content
      this.editingMessage._msg = this.newMessage
      // Transmit
      let editPayloadMessage
      if (!forceDelete && this.newMessage !== '') {
        this.newMessage = this.replaceTagRemover(this.newMessage)
        editPayloadMessage =
          await this.sdk._wcrypt.encryptPayload(this.newMessage)
      } else {
        editPayloadMessage = ''
      }
      const payload = JSON.stringify({
        uid: this.editingMessage.uid,
        text: editPayloadMessage
      })
      this.sdk.sendMessage('[c:EDIT<JSON]' + payload)
      this.resetEditing()
    },
    replaceTagRemover: function (messageContent) {
      return messageContent.replaceAll(
        '<i class="q-icon material-icons cursor-pointer" onclick="this.parentNode.parentNode.removeChild(this.parentNode)">close</i>', '')
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
    /**
     *
     */
    resetEditing: function () {
      this.editingMessage = null
      this.newMessage = ''
      this.inputResize()
    },
    /**
     *
     */
    editLastMessage: function () {
      this.handleEditMessage(-1, true)
    },
    /**
     *
     */
    cancelActions: function () {
      if (this.editingMessage) {
        this.resetEditing()
      }
      if (this.replyingMessage) {
        this.replyingMessage = null
      }
      this.inputResize()
      this.$refs.ref_editor.focus()
    },
    /**
     *
     */
    getLastMessageTime: function () {
      setTimeout(() => {
        this.handleEditMessage(-1, true, true)
      }, 10)
    },
    /**
     *
     * @returns {Promise<void>}
     */
    addTimestampRead: async function () {
      const ts = new Date().getTime()
      const timestamp = await dbGetTimestamp(this.channel.id)
      if (timestamp) {
        if (timestamp.tsRead >= ts) return
        timestamp.tsRead = ts
        await dbSetTimestamp(this.channel.id, {
          tsRead: ts,
          tsNew: timestamp.tsNew
        })
        return
      }
      await dbSetTimestamp(this.channel.id, {
        tsRead: ts
      })
    },
    /**
     *
     * @returns {Promise<void>}
     */
    addTimestampNew: async function (channelID) {
      const ts = new Date().getTime()
      const timestamp = await dbGetTimestamp(channelID)
      if (timestamp) {
        if (timestamp.tsNew >= ts) return
        timestamp.tsNew = ts
        await dbSetTimestamp(channelID, {
          tsRead: timestamp.tsRead,
          tsNew: ts
        })
        return
      }
      await dbSetTimestamp(channelID, {
        tsNew: ts
      })
    },
    /**
     *
     * @param msg
     */
    handleIncomingConnectorMessages: function (msg) {
      if (msg.typ === '[s:ustat]') {
        if (msg.act === 'update') {
          if (this.members.size <= 0) return
          let isOnline = false
          if (msg.msg === 'online') isOnline = true
          this.setMemberOnlineStatus([msg.usr], isOnline)
        }
      } else if (msg.typ === 'subchat_join') {
        // const payload = JSON.parse(msg.msg)
        // this.notifyJoinedSubchat(payload.uid, payload.user)
      } else if (msg.typ === 'subchat_leave') {
        // const payload = JSON.parse(msg.msg)
        // this.notifyJoinedSubchat(payload.uid, payload.user, false, true)
      } else if (msg.typ === '[s:chat]') {
        if (msg.act === 'mark') {
          // Check if we're already connected to this channel
          const subchatID = this.$route.query.chan
          if (subchatID) {
            if (this.$route.fullPath.includes('?chan=' + msg.pid)) {
              return
            }
          } else {
            if (this.$route.fullPath.includes('/' + msg.pid)) {
              return
            }
          }
          this.hasUnread(msg.pid, false, true, true)
          this.addTimestampNew(msg.pid)
          .then(() => {
            this.hasUnread(msg.pid)
          })
        }
      } else if (msg.typ === '[s:memberjoin]') {
        if (msg.act === 'update') {
          // Update member list
          this.getMainMembers().then(() => {
            // Retrieve active users of current group or channel
            this.getActiveMembers()
          })
        }
      }
    },
    handleGroupImageSelected: function (resp) {
      this.selectedImage = resp
    },
    handleGroupImageUpload: function () {
      this.uploadImage()
    },
    uploadImage: function () {
      this.isUploadingImage = true
      const vThis = this
      const config = {
        onUploadProgress: function (progressEvent) {
          vThis.uploadingImageProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total)
        }
      }
      const payload = {
        base64: this.selectedImage.base64,
        name: '',
        pid: this.chatID,
        emote: false
      }
      api.post(
        'files/private/create',
        payload,
        config
      )
      .then((response) => {
        this.processUploadSnippetResponse(response.data)
      })
      .catch((err) => console.debug(err.message))
    },
    processUploadSnippetResponse: async function (response) {
      const contentURL = this.store.serverIP + 'files/public/get/' + response.trim()
      let prefix
      if (this.selectedImage.type.includes('audio')) {
        prefix = '[c:AUD]'
      } else if (this.selectedImage.type.includes('image')) {
        prefix = '[c:IMG]'
      } else if (this.selectedImage.type.includes('text')) {
        prefix = '[c:TXT]'
      } else if (this.selectedImage.type.includes('compressed')) {
        prefix = '[c:ZIP]'
      } else {
        prefix = '[c:FIL]'
      }
      // Add the link as a message, so it shows up in the chat
      const payload = JSON.stringify({
        msg: '![Snippet](' + contentURL + ')',
        url: contentURL,
        fileName: ''
      })
      this.sdk.sendMessage(prefix +
        await this.sdk._wcrypt.encryptPayload(payload)
      )
      this.isUploadingImage = false
      this.uploadingImageProgress = 0
      this.$refs.uploader.hide()
    },
    hasUnread: async function (channelID) {
      let hasUnread = false
      const timestamp = await dbGetTimestamp(channelID)
      if (timestamp == null) return false
      const lastMessageTS = timestamp.tsNew
      if (lastMessageTS == null || lastMessageTS <= 0) {
        return false
      }
      let lastReadTS = timestamp.tsRead
      if (lastReadTS == null) lastReadTS = 0
      hasUnread = lastReadTS < lastMessageTS
      for (let i = 0; i < this.chatroom.subc.length; i++) {
        if (this.chatroom.subc[i].uid === channelID) {
          this.chatroom.subc[i]._hasUnread = hasUnread
          break
        }
      }
    },
    reactToMessage: function (msgUID, reaction) {
      const payload = JSON.stringify({
        uid: msgUID,
        type: reaction
      })
      this.sdk.sendMessage('[c:REACT<JSON]' + payload)
    },
    gotoKnowledge: function () {
      if (!this.chatID) return
      this.manageKeyListeners(true)
      this.$router.push(`/q/knowledge?id=${this.chatID}`)
    },
    gotoProjectManagement: function () {
      if (!this.chatID) return
      this.manageKeyListeners(true)
      this.$router.push(`/q/projects?id=${this.chatID}`)
    }
  }
}
</script>

<style>

.editor_token {
  border: 1px solid var(--md-sys-color-outline-variant);
  background-color: var(--md-sys-color-surface-variant);
  padding: 2px;
  border-radius: 6px;
  color: var(--md-sys-color-on-background);
  font-weight: bold;
  font-size: 1em;
}

</style>
