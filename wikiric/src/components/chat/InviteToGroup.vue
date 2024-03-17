<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[90dvw] max-w-xl" flat bordered>
      <p class="text-h6 fontbold">
        Invite To Group
      </p>
      <p class="text-subtitle2">
        Add other members to this group by sending them an invitation.
      </p>
      <div class="flex column gap-4 mt4 background hfull wfull p4">
        <div class="flex row items-center gap-4">
          <q-btn icon="link" label="Invite Link" color="primary" no-caps
                 class="w36" align="left"
                 v-on:click="createInvitationLink"/>
          <p>Creates a personalized invitation link</p>
        </div>
        <div class="flex row items-center gap-4">
          <q-btn icon="fingerprint" label="Invite ID" color="primary" no-caps
                 class="w36" align="left"
                 v-on:click="createInviteID"/>
          <p>Copies the chat ID</p>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { copyToClipboard } from 'quasar'
import { useStore } from 'stores/wikistate'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    groupId: {
      type: String,
      required: true
    },
    groupTitle: {
      type: String,
      required: true
    }
  },
  name: 'InviteToGroup',
  watch: {
    isOpen () {
      this.show = true
    }
  },
  data () {
    return {
      show: false,
      store: useStore()
    }
  },
  methods: {
    createInvitationLink: function () {
      let endpoint = this.store.serverIP + 'invite/chat?id='
      endpoint += this.groupId
      endpoint += '&ref=' + this.store.user.username
      copyToClipboard(endpoint)
      .then(() => {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Invite Link copied',
          caption: '',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {}
            }
          ]
        })
      })
      .catch(() => {
      })
    },
    createInviteID: function () {
      copyToClipboard(this.groupId)
      .then(() => {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Invite ID copied',
          caption: '',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {}
            }
          ]
        })
      })
      .catch(() => {
      })
    }
  }
}
</script>

<style scoped>

</style>
