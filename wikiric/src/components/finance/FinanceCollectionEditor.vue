<template>
  <q-dialog v-model="show" class="z-top"
            @before-hide="$emit('close')">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <p class="mb2 text-body1 fontbold">
        New Account
      </p>
      <q-input v-model="coll.t" label="Title" autofocus
               color="brand-p"/>
      <q-input v-model="coll.desc" label="Description"
               color="brand-p"/>
      <q-input v-model="coll.keys" label="Keywords"
               color="brand-p"/>
      <div class="flex wfull justify-end mt8">
        <q-btn label="Submit" color="primary"
               @click="submitCollection"/>
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
    collection: {
      type: Object,
      required: true
    }
  },
  name: 'FinanceCollectionEditor',
  emits: ['collsubmit', 'close'],
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
      show: false,
      coll: {
        t: '',
        desc: '',
        keys: ''
      }
    }
  },
  methods: {
    handleDialogOpen: function () {
      if (this.collection && this.collection.t) {
        this.coll = { ...this.collection }
      } else {
        this.coll = {
          t: '',
          desc: '',
          keys: ''
        }
      }
    },
    submitCollection: function () {
      this.$emit('collsubmit', this.coll)
    }
  }
}
</script>

<style scoped>

</style>
