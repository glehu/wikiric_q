<template>
  <q-dialog v-model="show" class="z-fab"
            @before-hide="$emit('close')">
    <q-card class="surface px4 pb4 w-[99dvw] max-w-xl" flat bordered>
      <q-input v-model="collectionID" color="brand-p"
               label="Account ID"
               @update:model-value="queryCollection"/>
      <p class="text-subtitle2 mt2">
        Paste an Account ID to automatically join it!
      </p>
    </q-card>
  </q-dialog>
</template>

<script>

import { debounce } from 'quasar'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  name: 'FinanceCollectionJoin',
  emits: ['selected', 'close'],
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (this.show) {
        this.handleDialogOpen()
      }
    }
  },
  created () {
    this.queryCollection = debounce(this.queryCollection, 200)
  },
  data () {
    return {
      show: false,
      collectionID: ''
    }
  },
  methods: {
    handleDialogOpen: function () {
    },
    queryCollection: function (query) {
      if (!query || query.trim() === '') {
        return
      }
      this.$emit('selected', query)
    }
  }
}
</script>

<style scoped>

</style>
