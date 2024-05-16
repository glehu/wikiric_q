<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <div>
        <q-toolbar class="wfull mb4">
          <q-toolbar-title class="wfull flex justify-between">
            <p class="text-h5 fontbold non-selectable">
              Add Friend
            </p>
            <q-btn icon="close" flat @click="show = false"/>
          </q-toolbar-title>
        </q-toolbar>
        <div class="mb8 markedView">
          <p class="text-subtitle2">
            Type in your friend's username and send him a friend request
            including an invitation to your own personal DM (Direct Messages) group!
          </p>
          <p class="text-subtitle2">
            You may also include a message.
          </p>
        </div>
        <q-input for="frequest_username"
                 label="Username"
                 v-model="friendUsername"
                 bg-color="brand-bg"
                 outlined
                 color="brand-p"
                 class="text-body1"/>
        <q-input label="Message (Optional)"
                 autogrow
                 v-model="requestMessage"
                 bg-color="brand-bg"
                 color="brand-p"
                 class="text-body1"/>
        <div class="wfull flex justify-end mt4">
          <q-btn label="Send Request" icon-right="send"
                 color="primary"
                 no-caps
                 @click="sendRequest"/>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { api } from 'boot/axios'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  name: 'FriendAdder',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false,
      friendUsername: '',
      requestMessage: ''
    }
  },
  methods: {
    handleDialogOpen: function () {
      setTimeout(() => {
        const elem = document.getElementById('frequest_username')
        if (elem) {
          elem.focus()
        }
      }, 0)
    },
    sendRequest: function () {
      if (this.friendUsername === '') {
        const elem = document.getElementById('frequest_username')
        if (elem) {
          elem.focus()
        }
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Missing Username',
          caption: 'Please enter an existing username.',
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
        return
      }
      return new Promise((resolve) => {
        api({
          url: 'users/private/befriend',
          method: 'post',
          data: {
            usr: this.friendUsername,
            msg: this.requestMessage
          }
        }).then(() => {
          this.friendUsername = ''
          this.requestMessage = ''
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Request Sent!',
            caption: 'It\'s now up to your friend to decide what\'s next.',
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
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error',
            caption: 'Maybe the username does not exist?',
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

</style>
