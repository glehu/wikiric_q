<template>
  <q-page class="hfull wfull md:px8 md:py4">
    <q-toolbar>
      <q-tabs
        v-model="tab"
        inline-label
        class="">
        <q-tab name="activity" icon="groups" label="Groups"/>
        <q-tab name="friends" icon="people" label="Friends"/>
      </q-tabs>
    </q-toolbar>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="activity">
        <div class="flex gap-2 mb4">
          <p class="text-h6 fontbold">Your Groups</p>
          <q-btn icon="chat" label="Create Group"
                 no-caps dense unelevated
                 class="mlauto <sm:hidden p2"
                 @click="createGroup()"/>
          <q-btn icon="login" label="Join Group"
                 no-caps dense unelevated
                 class="mr4 <sm:hidden p2"
                 @click="joinGroup()"/>
        </div>
        <template v-for="chat in activity" :key="chat">
          <template v-if="chat.type !== 'dm'">
            <q-item clickable
                    dense
                    @click="gotoChat(chat)">
              <q-item-section>
                <q-item-label>
                  <div class="text-lg flex items-center wfull relative">
                    <template v-if="chat.burl">
                      <q-img :src="getImg(chat.burl, true)" alt="Banner"
                             fit="cover" class="hfull wfull absolute rounded-3"/>
                    </template>
                    <div class="p3 relative flex items-center gap-y-2">
                      <group-icon :t="chat.t"
                                  :iurl="chat.iurl"
                                  iurla=""
                                  size="74px"/>
                      <div class="px2 py1 rounded-2 surface relative">
                        <template v-if="chat.iscom">
                          <div class="gap-2 wfit flex row items-center
                                  primary my1 rounded pl2 pr1">
                            <q-icon name="groups" size="1rem"/>
                            <span class="text-subtitle2 fontbold">
                          Community
                        </span>
                          </div>
                        </template>
                        <p class="text-2xl fontbold">
                          {{ chat.t }}
                        </p>
                        <p class="text-body2 fontbold">
                          {{ chat.desc }}
                        </p>
                      </div>
                    </div>
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </template>
      </q-tab-panel>
      <q-tab-panel name="friends">
        <div class="mb4 flex gap-2">
          <p class="text-h6 fontbold">
            Your Friends
          </p>
          <q-btn icon="person_add" label="Add Friend"
                 no-caps dense unelevated
                 class="mlauto <sm:hidden p2"
                 @click="inviteFriend()"/>
        </div>
        <q-item v-for="friend in friends" :key="friend"
                clickable
                dense
                @click="gotoFriendDM(friend)">
          <q-item-section>
            <q-item-label>
              <div class="text-lg flex items-center wfull relative">
                <template v-if="friend.chat.burl">
                  <q-img :src="getImg(friend.chat.burl, true)" alt="Banner"
                         fit="cover" class="hfull wfull absolute rounded-3"/>
                </template>
                <div class="p3 relative flex items-center gap-y-2">
                  <group-icon :t="friend.chat.t"
                              :iurl="friend.chat.iurl"
                              iurla=""
                              size="74px"/>
                  <div class="px2 py1 rounded-2 surface relative">
                    <p class="text-2xl fontbold">
                      {{ friend.chat.t }}
                    </p>
                    <p class="text-body2 fontbold">
                      {{ friend.chat.desc }}
                    </p>
                    <template v-if="friend.msg">
                      <div class="flex gap-1 wfull">
                        <p class="text-subtitle2 wfit">
                          {{ friend.msg.usr }},
                          {{ getHumanReadableDateText(friend.msg.ts, true, true) }}:
                        </p>
                        <div class="all_normal wfit"
                             v-html="friend.msg.msg"></div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-tab-panel>
    </q-tab-panels>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab
        v-model="fab"
        label=""
        vertical-actions-align="right"
        color="primary"
        icon="menu"
        direction="up">
        <q-fab-action color="primary" @click="createGroup()"
                      icon="chat" label="Create Group" label-position="left"/>
        <q-fab-action color="primary" @click="joinGroup()"
                      icon="login" label="Join Group" label-position="left"/>
        <q-fab-action color="primary" @click="inviteFriend()"
                      icon="person_add" label="Add Friend" label-position="left"/>
      </q-fab>
    </q-page-sticky>
  </q-page>
  <new-group-view :is-open="showNewGroup"/>
  <join-group-view :is-open="showJoinGroup"/>
  <friend-adder :is-open="showFriendAdder"/>
</template>

<script>
import { defineComponent } from 'vue'
import { dbGetGroups, dbGetSession } from 'src/libs/wikistore'
import GroupIcon from 'components/chat/GroupIcon.vue'
import NewGroupView from 'components/chat/NewGroup.vue'
import JoinGroupView from 'components/chat/JoinGroup.vue'
import { useStore } from 'stores/wikistate'
import FriendAdder from 'components/chat/FriendAdder.vue'
import { api } from 'boot/axios'
import wikiricrypt from 'src/libs/wikiricrypt'
import { DateTime } from 'luxon'

export default defineComponent({
  name: 'GroupsView',
  components: {
    FriendAdder,
    JoinGroupView,
    NewGroupView,
    GroupIcon
  },
  data () {
    return {
      store: useStore(),
      tab: 'activity',
      fab: false,
      activity: [],
      friends: [],
      showNewGroup: false,
      showJoinGroup: false,
      showFriendAdder: false
    }
  },
  created () {
    this.initFunction()
  },
  methods: {
    gotoChat: function (chat) {
      let linkURL = `/chat?id=${chat.id}`
      // Rejoin last channel if it exists
      if (chat.lastChannelID && chat.lastChannelID !== '') {
        linkURL += `&chan=${chat.lastChannelID}`
      }
      this.$router.push(linkURL)
    },
    gotoFriendDM: function (friend) {
      if (!friend || !friend.chat) {
        return
      }
      this.$router.push(`/chat?id=${friend.chat.uid}`)
    },
    initFunction: async function () {
      this.activity = await dbGetGroups()
      await this.getFriends()
    },
    createGroup: function () {
      this.showNewGroup = !this.showNewGroup
    },
    joinGroup: function () {
      this.showJoinGroup = !this.showJoinGroup
    },
    inviteFriend: function () {
      this.showFriendAdder = !this.showFriendAdder
    },
    getImg: function (imgGUID, get = false) {
      if (imgGUID == null || imgGUID === '') {
        return ''
      } else {
        let ret = imgGUID
        if (get) ret = this.store.serverIP + imgGUID
        return ret
      }
    },
    getFriends: async function () {
      return new Promise((resolve) => {
        api({
          url: 'chat/private/users/friends'
        }).then((result) => {
          if (result.data.friends) {
            this.friends = result.data.friends
            for (let i = 0; i < this.friends.length; i++) {
              if (this.friends[i].chat.type === 'dm') {
                // Sanitize group title
                const names = [...this.friends[i].chat.t.matchAll(
                  /\|([^|]+)\|/g)]
                let title = ''
                for (let i = 0; i < names.length; i++) {
                  if (names[i][1] !== this.store.user.username) {
                    if (title !== '') {
                      title += ' & '
                    }
                    title += names[i][1]
                  }
                }
                if (title === '') {
                  title = this.store.user.username
                }
                this.friends[i].chat.t = title
                // Decrypt (if encrypted) the last message sent
                if (this.friends[i].msg && this.friends[i].msg.msg) {
                  // Do we need to decrypt?
                  if (this.friends[i].msg.msg.startsWith('[c:MSG<ENCR]')) {
                    // Retrieve key for group
                    dbGetSession(this.friends[i].chat.uid)
                    .then((clarifierKeyPair) => {
                      if (clarifierKeyPair && clarifierKeyPair.priv) {
                        wikiricrypt.decryptPayload(
                          this.friends[i].msg,
                          this.store.user.username,
                          clarifierKeyPair)
                        .then((decryptedMessage) => {
                          // Set message to display
                          this.friends[i].msg.msg = decryptedMessage
                        }).catch((err) => {
                          console.debug(err.message)
                          this.friends[i].msg = null
                        })
                      }
                    }).catch((err) => {
                      console.debug(err.message)
                      this.friends[i].msg = null
                    })
                  }
                  // Can we even display the message?
                  if (this.friends[i].msg.msg.startsWith('[c:AUD]')) {
                    this.friends[i].msg = null
                  }
                }
              }
            }
          } else {
            this.friends = []
          }
          resolve()
        }).catch((err) => {
          console.debug(err.message)
          this.friends = []
          resolve()
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
    }
  }
})
</script>
