<template>
  <q-dialog v-model="show" class="z-top"
            full-height full-width
            @before-hide="$emit('close')">
    <q-card class="surface p4 wfull flex column items-center"
            flat bordered>
      <div class="wfull max-w-xl mt4">
        <p class="fontbold text-3xl">
          <template v-if="isCreate">
            Create
          </template>
          <template v-else>
            Edit
          </template>
          your store
        </p>
        <div class="mt4">
          <q-input for="store_edit_title"
                   v-model="store.t" label="Title"/>
          <q-input v-model="store.desc" label="Description"/>
          <q-checkbox v-model="store.priv" label="Private Store"
                      class="mt4"/>
        </div>
        <div class="mt8">
          <p class="fontbold text-2xl mb4">
            Bank Information
          </p>
          <q-input v-model="store.bank.name" label="Your Name"/>
          <q-input v-model="store.bank.bank" label="Bank Name"/>
          <q-input v-model="store.bank.iban" label="IBAN"/>
          <q-input v-model="store.bank.swift" label="BIC/SWIFT Code"/>
        </div>
        <div class="mt8 wfull flex justify-end gap-2">
          <q-btn label="Cancel"
                 @click="$emit('close')"/>
          <q-btn color="primary" label="Submit"
                 @click="submitStore"/>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { api } from 'boot/axios'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    isCreate: {
      type: Boolean,
      required: true
    }
  },
  name: 'StoreEditView',
  emits: ['close', 'refresh'],
  watch: {
    isOpen () {
      this.show = this.isOpen
      if (this.show) {
        this.handleDialogOpen()
      }
    }
  },
  data () {
    return {
      show: false,
      store: {
        t: '',
        desc: '',
        priv: false,
        bank: {
          name: '',
          bank: '',
          iban: '',
          swift: ''
        }
      }
    }
  },
  methods: {
    handleDialogOpen: function () {
    },
    submitStore: function () {
      if (this.store.t.trim() === '') {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Store title is mandatory!',
          caption: 'Please enter a title',
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
        const elem = document.getElementById('store_edit_title')
        if (elem) {
          elem.select()
          elem.focus()
        } else {
          alert('yo')
        }
        return
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'stores/private/create',
          data: this.store
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Store Updated!',
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
          this.$emit('refresh')
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error! ' + err.message,
            caption: 'Check the error for more information',
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
          console.debug(err.message)
        }).finally(() => {
          this.$emit('close')
          resolve()
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
