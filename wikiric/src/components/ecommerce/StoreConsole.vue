<template>
  <q-dialog v-model="show" class="z-top" full-height full-width
            @before-hide="$emit('close')">
    <q-card class="surface p2 relative" flat bordered>
      <div class="top-0 wfull h-[30px] pl2
                  flex justify-between items-center">
        <p class="text-sm">
          <span class="fontbold text-lg">wikiric</span>
          | CLI v0.1-PA
        </p>
        <q-btn icon="close" dense flat unelevated
               @click="$emit('close')"/>
      </div>
      <div class="top-0 wfull fmt_border_bottom h-[40px]
                  flex items-center">
        <div class="flex hfit wfit items-center">
          <q-spinner-rings
            color="primary"
            size="2em"
          />
          <p class="text-sm">
            Listening for messages...
          </p>
        </div>
      </div>
      <div ref="store_console_messages"
           class="wfull hfit max-h-[calc(100%-70px)] p4 background
                    column reverse items-center scroll">
        <div class="wfull hfit max-w-3xl_custom pr2 column reverse no-wrap">
          <p v-for="msg in log" :key="msg" class="text-sm font-600">
            {{ msg }}
          </p>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  name: 'StoreConsole',
  emits: ['close'],
  watch: {
    isOpen (doShow) {
      this.show = doShow
      if (this.show) {
        this.handleDialogOpen()
      }
    }
  },
  data () {
    return {
      show: false,
      log: []
    }
  },
  methods: {
    handleDialogOpen: function () {
      // Listen for backend messages
      const connector = new BroadcastChannel('wikiric_connector')
      connector.onmessage = event => {
        this.handleIncomingConnectorMessages(event.data)
      }
    },
    /**
     *
     * @param msg
     */
    handleIncomingConnectorMessages: function (msg) {
      if (msg.typ === '[s:storeix]') {
        if (msg.act === 'log') {
          this.log.unshift(msg.msg)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
