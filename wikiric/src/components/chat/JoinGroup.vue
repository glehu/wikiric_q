<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[75dvw] max-w-xl" flat bordered>
      <p class="text-h6 fontbold">
        Join Group
      </p>
      <q-input
        for="group_t"
        label="Invitation ID or URL"
        color="brand-p"
        label-color="brand-p"
        v-model="inviteID"
        v-on:keyup="handleKeyUp"
        @update:model-value="checkInput"
        class="p2 text-xl">
        <template v-slot:prepend>
          <template v-if="isURL">
            <q-icon name="link" size="2rem" class="mr1"/>
          </template>
          <template v-else-if="isLink">
            <q-icon name="fingerprint" size="2rem" class="mr1"/>
          </template>
          <template v-else>
            <q-icon name="search" size="2rem" class="mr1"/>
          </template>
        </template>
      </q-input>
      <q-input
        for="group_pw"
        label="Password"
        color="brand-p"
        label-color="brand-p"
        v-model="pw"
        class="p2">
        <template v-slot:prepend>
          <q-icon name="password" size="2rem" class="mr1"/>
        </template>
      </q-input>
      <div class="flex wfull mt6">
        <q-card-actions align="right">
          <q-btn flat label="Close" color="text-brand-p" v-close-popup/>
        </q-card-actions>
        <q-btn color="primary" no-caps
               v-on:click="joinGroup()"
               class="mlauto">
          <div class="column py2 px4">
            <p class="text-weight-bold q-ma-none">
              Join Group
            </p>
          </div>
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { api } from 'boot/axios'
import WikiricSdk from 'src/libs/wikiric-sdk'
import { useStore } from 'stores/wikistate'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['refresh'],
  name: 'JoinGroupView',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      store: useStore(),
      show: false,
      inviteID: '',
      pw: '',
      isURL: false,
      isLink: false,
      loginInterval: undefined
    }
  },
  methods: {
    handleDialogOpen: function () {
      setTimeout(() => {
        const elem = document.getElementById('group_t')
        if (!elem) return
        elem.focus()
        elem.select()
      })
    },
    handleKeyUp: function (e) {
      if (e.key === 'Enter') {
        e.preventDefault()
        this.joinGroup()
      }
    },
    joinGroup: function () {
      if (this.inviteID === '') return
      // Attempt to retrieve group
      const uuid = this.extractUUID()
      this.getGroup(uuid)
      .then((chat) => {
        const sdk = WikiricSdk
        sdk.doLogin(this.store.user._u, this.store.user._p)
        sdk.doConnect(chat.uid, '', '', this.pw)
        this.loginInterval = setInterval(() => {
          if (sdk._isAuthorized) {
            this.$router.push(`/q/chat?id=${chat.uid}`)
            clearTimeout(this.loginInterval)
          }
        }, 10)
      })
      .catch((e) => {
        this.handleJoinFailed()
      })
      this.handleDialogOpen()
    },
    handleJoinFailed: function () {
      this.$q.notify({
        color: 'negative',
        position: 'top-right',
        message: 'Error!',
        caption: 'Unknown invite link or URL',
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            handler: () => { /* ... */
            }
          }
        ]
      })
    },
    checkInput: function () {
      const invite = this.inviteID
      if (!invite) return
      // Extract UUID in case an invitation URL was provided
      if (invite.includes('/chat?id=')) {
        // URL provided -> Extract UUID
        this.isURL = true
      } else {
        this.isURL = false
      }
      // Check for UUID
      /*
      000000000011111111112222222222333333
      012345678901234567890123456789012345
      76f7fdc1-b699-4551-bb39-3719a25f23f3
       */
      if ((invite.length === 36) &&
        (invite.substring(8, 9) === '-') &&
        (invite.substring(13, 14) === '-') &&
        (invite.substring(18, 19) === '-') &&
        (invite.substring(23, 24) === '-')) {
        // Valid UUID
        this.isLink = true
      } else {
        // Invalid UUID
        this.isLink = false
      }
    },
    extractUUID: function () {
      let uuid = null
      if (this.isURL) {
        const match = this.inviteID.match(/id=[(0-9a-zA-Z)-]+/)
        if (!match || match.length < 1) return null
        uuid = match[0].substring(3)
      } else if (this.isLink) {
        uuid = this.inviteID
      }
      return uuid
    },
    getGroup: function (chatID) {
      return new Promise((resolve, reject) => {
        api({
          url: 'chat/private/get/' + chatID
        }).then((response) => {
          resolve(response.data)
        }).catch((e) => {
          reject(e.message)
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
