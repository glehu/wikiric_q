<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <p class="text-h5">
        Mock Config
      </p>
      <div>
        <q-input v-model="conf.endpoint" label="Endpoint" prefix="/"
                 class="text-body1"/>
        <q-input v-model="conf.t" label="Title"
                 class="text-body1"/>
        <q-input v-model="conf.desc" label="Description"
                 class="text-body2"/>
      </div>
      <div class="wfull flex justify-end mt8">
        <q-btn label="Submit" color="primary" class="wfit"
               @click="submitConfig"/>
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
    },
    config: {
      type: Object,
      required: true
    }
  },
  emits: ['subconfig'],
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
      conf: {
        t: '',
        desc: '',
        endpoint: ''
      }
    }
  },
  methods: {
    handleDialogOpen: function () {
      if (this.config) {
        this.conf = { ...this.config }
      }
    },
    submitConfig: function () {
      this.$emit('subconfig', this.conf)
      this.show = false
    }
  }
}
</script>

<style scoped>

</style>
