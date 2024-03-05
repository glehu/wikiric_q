<template>
  <q-page class="hfull wfull md:px8 md:py4">
    <q-toolbar>
      <q-tabs
        v-model="tab"
        inline-label
        class="">
        <q-tab name="activity" icon="history" label="Activity"/>
        <q-tab name="groups" icon="groups" label="Groups"/>
        <q-tab name="friends" icon="people" label="Friends"/>
      </q-tabs>
    </q-toolbar>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="activity">
        <p class="text-h6 mb4 fontbold">Recent Activity</p>
        <q-item v-for="chat in activity" :key="chat"
                clickable
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
      </q-tab-panel>
      <q-tab-panel name="groups">
        <p class="text-h6 mb4 fontbold">Your Groups</p>
        Groups will be found here!
      </q-tab-panel>
      <q-tab-panel name="friends">
        <div class="text-h6 mb4 fontbold">Your Friends</div>
        Friends will be found here!
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
</template>

<script>
import { defineComponent } from 'vue'
import { values } from 'src/libs/wikistore'
import GroupIcon from 'components/chat/GroupIcon.vue'
import NewGroupView from 'components/chat/NewGroup.vue'
import JoinGroupView from 'components/chat/JoinGroup.vue'
import { useStore } from 'stores/wikistate'

export default defineComponent({
  name: 'GroupsView',
  components: {
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
      showNewGroup: false,
      showJoinGroup: false
    }
  },
  created () {
    this.initFunction()
  },
  methods: {
    gotoChat: function (chat) {
      let linkURL = `/q/chat?id=${chat.id}`
      // Rejoin last channel if it exists
      if (chat.lastChannelID && chat.lastChannelID !== '') {
        linkURL += `&chan=${chat.lastChannelID}`
      }
      this.$router.push(linkURL)
    },
    initFunction: async function () {
      this.activity = await values()
    },
    createGroup: function () {
      this.showNewGroup = !this.showNewGroup
    },
    joinGroup: function () {
      this.showJoinGroup = !this.showJoinGroup
    },
    inviteFriend: function () {
    },
    getImg: function (imgGUID, get = false) {
      if (imgGUID == null || imgGUID === '') {
        return ''
      } else {
        let ret = imgGUID
        if (get) ret = this.store.serverIP + imgGUID
        return ret
      }
    }
  }
})
</script>
