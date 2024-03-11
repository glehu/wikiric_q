<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[75dvw] max-w-xl" flat bordered>
      <p class="text-h6 fontbold">
        <template v-if="!isChannel">
          New Group
        </template>
        <template v-else>
          New Channel
        </template>
      </p>
      <q-input
        for="group_t"
        label="Title"
        color="brand-p"
        label-color="brand-p"
        v-model="newGroup.t"
        class="p2 text-xl">
        <template v-slot:prepend>
          <q-icon name="people"/>
        </template>
      </q-input>
      <q-input
        for="group_desc"
        label="Description"
        color="brand-p"
        label-color="brand-p"
        v-model="newGroup.desc"
        class="p2 text-xl">
        <template v-slot:prepend>
          <q-icon name="info"/>
        </template>
      </q-input>
      <template v-if="!isChannel">
        <q-input
          for="group_pw"
          label="Password"
          color="brand-p"
          label-color="brand-p"
          v-model="newGroup.pw"
          class="p2">
          <template v-slot:prepend>
            <q-icon name="password"/>
          </template>
        </q-input>
        <p class="text-h6 fontbold mt4 mb2">Settings</p>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="newGroup.crypt"
                        @update:model-value="checkEncryption"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="fontbold">
              Encryption
            </q-item-label>
            <q-item-label caption>
              End-to-End encrypts all messages sent in this group.
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="newGroup.iscom"
                        @update:model-value="checkCommunity"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="fontbold">
              Community
            </q-item-label>
            <q-item-label caption>
              Check to enable community features for this group.
              Communities are by default unencrypted so new people can read previous messages.
            </q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-else>
        <div class="mt4 flex gap-4">
          <q-option-group
            v-model="channelType"
            :options="options"
            color="primary">
            <template v-slot:label="opt">
              <q-icon :name="opt.icon" size="1.5rem" class="mr2"/>
              <span class="fontbold">{{ opt.label }}</span>
            </template>
          </q-option-group>
        </div>
      </template>
      <div class="flex wfull mt6">
        <q-card-actions align="right">
          <q-btn flat label="Close" color="text-brand-p" v-close-popup/>
        </q-card-actions>
        <q-btn color="primary" no-caps
               v-on:click="createGroup()"
               class="mlauto">
          <div class="column py2 px4">
            <p class="text-weight-bold q-ma-none">
              <template v-if="!isChannel">
                Create Group
              </template>
              <template v-else>
                Create Channel
              </template>
            </p>
          </div>
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { api } from 'boot/axios'
import { ref } from 'vue'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    isChannel: {
      type: Boolean,
      default: false
    },
    groupId: {
      type: String,
      default: ''
    }
  },
  emits: ['refresh'],
  name: 'NewGroup',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false,
      newGroup: {
        t: '',
        desc: '',
        pw: '',
        crypt: true,
        iscom: false
      },
      channelType: ref('text'),
      options: [
        {
          label: 'Text',
          value: 'text',
          icon: 'tag'
        },
        {
          label: 'Audio',
          value: 'audio',
          icon: 'mic'
        },
        {
          label: 'Video',
          value: 'video',
          icon: 'videocam'
        }
      ]
    }
  },
  methods: {
    checkEncryption: function (isEncrypted) {
      // Prevent encryption if we're creating a community
      if (isEncrypted && this.newGroup.iscom) {
        this.newGroup.crypt = false
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Encryption not possible!',
          caption: 'Communities are unencrypted.',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {}
            }
          ]
        })
      }
    },
    checkCommunity: function (isCommunity) {
      // Communities are not encrypted by default
      this.newGroup.crypt = !isCommunity
    },
    handleDialogOpen: function () {
      setTimeout(() => {
        const elem = document.getElementById('group_t')
        if (!elem) return
        elem.focus()
      })
    },
    createGroup: function () {
      if (this.newGroup.t === '') {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Missing Title',
          caption: 'A name/title is mandatory!',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {}
            }
          ]
        })
        return
      }
      return new Promise((resolve) => {
        if (!this.isChannel) {
          // Add group
          api({
            method: 'post',
            url: 'chat/private/create',
            data: this.newGroup
          })
          .then((result) => {
            let route = `/q/chat?id=${result.data}`
            if (this.newGroup.pw && this.newGroup.pw !== '') {
              route += `&pw=${this.newGroup.pw}`
            }
            this.$router.push(route)
          })
          .then(resolve)
          .catch((err) => console.debug(err.message))
        } else {
          // Add channel
          this.newGroup.pid = this.groupId
          this.newGroup.type = this.channelType
          api({
            method: 'post',
            url: 'chat/private/create',
            data: this.newGroup
          })
          .then((result) => {
            this.show = false
            // Request refresh
            this.newGroup.uid = result.data.trim()
            this.$emit('refresh', this.newGroup)
          })
          .then(resolve)
          .catch((err) => console.debug(err.message))
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
