<template>
  <q-dialog v-model="show" class="z-fab">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <p class="text-h5">
        Mock Config
      </p>
      <div>
        <div class="flex gap-2 items-center">
          <q-select :options="methodOptions"
                    v-model="conf.reqMethod"
                    @update:model-value="handleMethodChange"
                    label-color="brand-p"
                    color="brand-p"
                    label="Method"
                    class="w-[95px]"/>
          <q-input v-model="conf.endpoint" label="Endpoint"
                   color="brand-p" label-color="brand-p"
                   :prefix="`/${username}-`"
                   class="text-lg flex-grow"/>
        </div>
        <q-input v-model="conf.t" label="Title"
                 color="brand-p" label-color="brand-p"
                 class="text-body1"/>
        <q-input v-model="conf.desc" label="Description"
                 color="brand-p" label-color="brand-p"
                 autogrow
                 class="text-body1"/>
      </div>
      <div>
        <q-select :options="responseOptions"
                  v-model="conf.respType"
                  label-color="brand-p"
                  color="brand-p"
                  label="Response-Type"
                  class=""/>
      </div>
      <template v-if="conf.respType === 'message-fixed'">
        <div class="wfull relative mt4 background p2 rounded">
          <p class="mb2 text-subtitle2">
            Payload to send with this request:
          </p>
          <q-select :options="contentTypeOptions"
                    v-model="conf.reqContentType"
                    label-color="brand-p"
                    color="brand-p"
                    label="Content-Type"
                    borderless
                    class=""/>
          <editor id="conf_resp"
                  ref="conf_resp"
                  e-id="conf_resp_edit"
                  v-model="conf.response"/>
        </div>
      </template>
      <div class="wfull flex justify-end mt8 gap-2">
        <template v-if="conf.uid">
          <q-btn label="Delete" color="negative" class="wfit"
                 @click="deleteConfig"/>
        </template>
        <q-btn label="Submit" color="primary" class="wfit"
               @click="submitConfig"/>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { useStore } from 'stores/wikistate'
import Editor from 'components/EditorComponent.vue'

export default {
  components: { Editor },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    config: {
      type: Object,
      required: true
    }
  },
  emits: ['subconfig', 'delconfig'],
  name: 'MockConfigEditor',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false,
      store: useStore(),
      conf: {
        t: '',
        desc: '',
        endpoint: '',
        response: '',
        reqMethod: 'GET',
        reqContentType: 'text/plain',
        respType: 'message-same'
      },
      methodOptions: [
        'GET', 'POST', 'PUT', 'PATCH', 'DELETE'
      ],
      contentTypeOptions: [
        'application/json', 'text/xml', 'text/plain'
      ],
      responseOptions: [
        'message-same', 'message-fixed'
      ]
    }
  },
  methods: {
    handleDialogOpen: function () {
      if (this.config) {
        this.conf = { ...this.config }
      } else {
        this.conf = {
          t: '',
          desc: '',
          endpoint: '',
          response: '',
          reqMethod: 'GET',
          reqContentType: 'text/plain',
          respType: 'message-fixed'
        }
      }
    },
    deleteConfig: function () {
      this.$emit('delconfig', this.conf)
      this.show = false
    },
    submitConfig: function () {
      this.$emit('subconfig', this.conf)
      this.show = false
    },
    handleMethodChange: function (method) {
      this.checkResponseType(method, this.conf.respType)
    },
    handleRespTypeChange: function (respType) {
      this.checkResponseType(this.conf.reqMethod, respType)
    },
    checkResponseType: function (method, respType) {
      if (method === 'GET' && respType !== 'message-fixed') {
        this.conf.respType = 'message-fixed'
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Info',
          caption: 'Response type set to message-fixed',
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
      }
    }
  },
  computed: {
    username () {
      if (!this.store || !this.store.user || !this.store.user.username) {
        return '{usr}'
      }
      return this.store.user.username
    }
  }
}
</script>

<style scoped>

</style>
