<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p1 w-[99dvw] max-w-xl" flat bordered>
      <q-toolbar class="wfull">
        <q-toolbar-title class="wfull flex justify-between">
          <span class="text-h6">
            Share with...
          </span>
          <q-btn icon="close" flat @click="show = false"/>
        </q-toolbar-title>
      </q-toolbar>
      <q-card class="background p3">
        <div class="flex gap-2 items-center mb4 pl1">
          <q-icon name="people"/>
          <span class="text-body1 fontbold">
            Groups
          </span>
        </div>
        <template v-if="groups.length > 0">
          <template v-for="group in groups" :key="group">
            <q-expansion-item class="mt4 surface rounded-2 overflow-hidden"
                              group="group_chan"
                              @before-show="getChatroom(group.id)">
              <template v-slot:header>
                <p class="text-h6 wfull">
                  {{ group.t }}
                </p>
              </template>
              <q-item clickable class="flex items-center"
                      @click="shareTask(group.id)">
                <q-item-label class="flex gap-2 items-center">
                  <q-icon name="share" size="1.5rem"/>
                  <span>General</span>
                </q-item-label>
              </q-item>
              <template v-if="channels.length > 0">
                <q-item v-for="channel in channels" :key="channel"
                        clickable class="flex items-center"
                        @click="shareTask(channel.uid)">
                  <q-item-label class="flex gap-2 items-center">
                    <q-icon name="share" size="1.5rem"/>
                    <span>{{ channel.t }}</span>
                  </q-item-label>
                </q-item>
              </template>
            </q-expansion-item>
          </template>
        </template>
      </q-card>
    </q-card>
  </q-dialog>
</template>

<script>

import { dbGetGroups } from 'src/libs/wikistore'
import { api } from 'boot/axios'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    wisdomProp: {
      type: Object,
      required: true
    }
  },
  name: 'TaskShare',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false,
      groups: [],
      channels: [],
      sharing: {
        message: '',
        selectedChannel: ''
      }
    }
  },
  methods: {
    handleDialogOpen: async function () {
      this.groups = await dbGetGroups()
    },
    getChatroom: function (uid) {
      this.channels = []
      api({
        url: 'chat/private/get/' + uid
      }).then(async (response) => {
        const chatroom = response.data
        // Add general chat (main chat) to subchat list
        if (!chatroom.subc) {
          return
        }
        this.channels = chatroom.subc
      }).catch((e) => {
        console.debug(e.message)
      })
    },
    shareTask: async function (channelID) {
      this.sharing.selectedChannel = channelID
      const message = {
        message: this.sharing.message,
        guid: this.wisdomProp.uid
      }
      const prefix = '[c:TASK]'
      const bodyPayload = {
        pid: this.sharing.selectedChannel,
        msg: prefix + JSON.stringify(message)
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'msg/private/create',
          data: bodyPayload
        })
        .then(() => {
          this.sharing.message = ''
          this.sharing.selectedChannel = ''
          this.show = false
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => resolve())
      })
    }
  }
}
</script>

<style scoped>

</style>
