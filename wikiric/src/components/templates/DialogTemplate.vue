<template>
  <q-dialog v-model="show" class="z-top" @before-hide="$emit('close')">
    <q-card class="surface p4" flat bordered>
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
  name: 'DialogTemplate',
  emits: ['close'],
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (this.show) {
        this.handleDialogOpen()
      }
    }
  },
  data () {
    return {
      show: false
    }
  },
  methods: {
    handleDialogOpen: function () {
    }
  }
}
</script>

<style scoped>

</style>
