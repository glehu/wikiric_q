<template>
  <q-dialog v-model="show" class="z-fab">
    <q-card class="surface px3 pb2 pt1 w-[99dvw] max-w-xl" flat bordered>
      <div class="flex items-center gap-2">
        <q-select :options="methodOptions"
                  v-model="method"
                  label-color="brand-p"
                  color="brand-p"
                  label="Method"
                  class="w-[95px]"/>
        <q-input v-model="urlString"
                 placeholder="Type an URL"
                 autofocus
                 class="text-body1 flex-grow"/>
      </div>
      <template v-if="method === 'POST' || method === 'PUT' || method === 'PATCH'">
        <div class="wfull relative mt4 background p2 rounded">
          <p class="mb2 text-subtitle2">
            Payload to send with this request:
          </p>
          <q-select :options="payloadOptions"
                    v-model="contentType"
                    label-color="brand-p"
                    color="brand-p"
                    label="Content-Type"
                    borderless
                    class=""/>
          <editor id="mock_payload"
                  ref="mock_payload"
                  e-id="mock_payload_edit"
                  v-model="payload"/>
        </div>
      </template>
      <div class="flex justify-end wfull items-center mt4">
        <q-btn color="primary" no-caps
               @click="sendRequest"
               label="SEND REQUEST (or press Enter)"/>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import Editor from 'components/EditorComponent.vue'
import axios from 'axios'

export default {
  components: { Editor },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close', 'response'],
  name: 'QuickieConfigAdder',
  watch: {
    isOpen (newVal) {
      this.show = newVal
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false,
      urlString: '',
      method: 'GET',
      methodOptions: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      payloadOptions: ['application/json', 'text/xml', 'text/plain'],
      payload: '',
      contentType: 'text/plain'
    }
  },
  beforeUnmount () {
    this.$emit('close')
    this.manageKeyListeners(true)
  },
  methods: {
    handleDialogOpen: function () {
      if (!this.show) return
      this.manageKeyListeners()
    },
    sendRequest: function () {
      if (this.urlString.trim() === '') {
        this.resetAndClose()
        return
      }
      let payload = this.payload
      if (this.method === 'POST' || this.method === 'PUT') {
        if (this.contentType === 'application/json') {
          payload = JSON.stringify(payload)
        }
      }
      const now = performance.now()
      switch (this.method) {
        case 'GET':
          axios.get(this.urlString).then((response) => {
            this.handleResponse(response, now)
          })
          break
        case 'POST':
          axios.post(this.urlString, payload).then((response) => {
            this.handleResponse(response, now)
          })
          break
        case 'PUT':
          axios.put(this.urlString, payload).then((response) => {
            this.handleResponse(response, now)
          })
          break
        case 'DELETE':
          axios.delete(this.urlString).then((response) => {
            this.handleResponse(response, now)
          })
          break
      }
    },
    handleResponse: function (response, timestamp) {
      const time = performance.now() - timestamp
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Request Sent',
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
      response._time = time.toFixed(2)
      console.log(response)
      this.$emit('response', response)
      this.resetAndClose()
    },
    resetAndClose: function () {
      this.payload = ''
      this.method = 'GET'
      this.contentType = 'text/plain'
      this.urlString = ''
      this.$emit('close')
    },
    /**
     *
     * @param {Boolean} forceRemove
     */
    manageKeyListeners: function (forceRemove = false) {
      document.removeEventListener('keydown', this.handleQuickieCKeyDown, false)
      if (forceRemove) return
      document.addEventListener('keydown', this.handleQuickieCKeyDown, false)
    },
    handleQuickieCKeyDown: function (e) {
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          return
        }
        this.manageKeyListeners(true)
        e.stopPropagation()
        e.stopImmediatePropagation()
        e.preventDefault()
        this.sendRequest()
      }
    }
  }
}
</script>

<style scoped>

</style>
