<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
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
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
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
