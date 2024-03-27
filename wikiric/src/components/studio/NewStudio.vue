<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <p class="text-h6 fontbold">
        New Layout
      </p>
      <p class="text-subtitle2">
        Notes, images, apps and more things will be
        organized in so called layouts.
      </p>
      <p class="text-subtitle2">
        Create and use different layouts for
        different applications.
      </p>
      <q-input
        for="group_desc"
        label="Name"
        color="brand-p"
        label-color="brand-p"
        v-model="desc"
        class="text-xl mt2">
        <template v-slot:prepend>
          <q-icon name="info"/>
        </template>
      </q-input>
      <div class="wfull flex justify-end mt4">
        <q-btn label="Create Layout" color="primary" no-caps
               @click="submitSandbox()"/>
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
  name: 'NewStudio',
  emits: ['create'],
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false,
      desc: ''
    }
  },
  methods: {
    handleDialogOpen: function () {
      setTimeout(() => {
        const elem = document.getElementById('group_desc')
        if (elem) {
          elem.focus()
        }
      })
    },
    submitSandbox: function () {
      if (this.desc.trim() === '') {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Missing Name',
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
      this.$emit('create', this.desc)
      this.desc = ''
      this.show = false
    }
  }
}
</script>

<style scoped>

</style>
