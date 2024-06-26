<template>
  <div class="w-full flex justify-center">
    <div class="max-w-screen-md w-full fmt_border rounded overflow-hidden h-full">
      <div class="w-full flex pl-3 pr-1 items-center background sticky">
        <p class="p-1 font-bold pointer-events-none text-sm">
          {{ headline }}
        </p>
        <div class="rounded-md w-fit ml-auto
                hover:primary p-2 cursor-pointer"
             v-on:click="clickedBack()">
          <q-icon name="x"/>
        </div>
      </div>
      <div id="listPickerWrapper" ref="listPickerWrapper"
           class="surface-variant pt-2 relative z-50
                  max-h-[50dvh] overflow-y-auto">
        <div class="flex column wfull hfull">
          <q-item v-for="(obj, ix) in list_obj" :key="obj"
                  clickable
                  v-show="!obj._isHidden"
                  v-on:click="confirmOnClick(obj)"
                  :id="'listPickObj_' + ix"
                  class="mb-2 p-2 rounded flex flex-row gap-4 items-center
                       surface hover:tertiary cursor-pointer"
                  :class="{'tertiary': ix === index}">
            <q-img :src="obj._pth" size="48px" fit="contain"/>
            <p class="font-bold">
              <template v-if="keyName === 't'">
                {{ obj.t }}
              </template>
              <template v-else-if="keyName === 'usr'">
                {{ obj.usr }}
              </template>
              <template v-else>
                {{ obj }}
              </template>
            </p>
            <template v-if="obj._hint">
              <p class="font-bold text-sm">
                {{ obj._hint }}
              </p>
            </template>
          </q-item>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import { toRaw } from 'vue'

export default {
  name: 'ListPicker',
  props: {
    list: {
      type: Array
    },
    keyName: {
      type: String
    },
    keyHelper: {
      type: Boolean
    },
    query: {
      type: String
    },
    headline: {
      type: String
    },
    prefix: {
      type: String
    }
  },
  watch: {
    query: function (newVal) {
      this.filterResults(newVal)
    }
  },
  emits: ['close', 'confirm'],
  data () {
    return {
      list_obj: [],
      index: 0,
      prefixString: ''
    }
  },
  mounted () {
    this.initFunction()
  },
  beforeUnmount () {
    document.removeEventListener('keydown', this.handleKeyUpListPicker, false)
  },
  computed: {},
  methods: {
    initFunction: async function () {
      this.list_obj = toRaw(this.list)
      this.filterResults('')
      if (this.prefix) {
        this.prefixString = this.prefix
      }
      document.addEventListener('keydown', this.handleKeyUpListPicker, false)
    },
    handleKeyUpListPicker: function (e) {
      if (this.list_obj.length < 1) return
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        e.stopPropagation()
        this.moveSelection(-1)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        e.stopPropagation()
        this.moveSelection(1)
      } else if (e.key === 'Tab' || e.key === 'Tabulator') {
        e.preventDefault()
        e.stopPropagation()
        this.confirmOnEnter()
      }
    },
    moveSelection: function (delta) {
      if (delta === 0 || this.list_obj.length < 1) {
        return
      }
      // Normalize delta
      if (delta < -1) delta = -1
      if (delta > 1) delta = 1
      // Simulate move
      const indexTmp = this.index + delta
      // Check if we reached a boundary
      if (indexTmp < 0 || indexTmp >= this.list_obj.length) {
        // We have reached the beginning or end of the list
        // (index 1 for length 1 would be out of bounds)
        return
      }
      this.index = indexTmp
      const tmpElem = document.getElementById('listPickObj_' + this.index)
      if (tmpElem) {
        tmpElem.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        })
      }
      // Move selection until we have moved the delta
      // Since entries filtered out do not count towards the actual
      // ...amount of steps, we will loop until we reached the delta
      if (this.list_obj[this.index]._isHidden) {
        this.moveSelection(delta)
      }
    },
    clickedBack: function () {
      // Remove event listener just in case
      window.removeEventListener('keydown', this.handleKeyUp, false)
      this.$emit('close')
    },
    filterResults: function (query) {
      if (this.list_obj.length < 1) return
      const splits = query.split(this.prefixString)
      // Extract the actual query which sits after the prefix symbol e.g. @
      // e.g.: hello @max
      // Here the actual query would be max
      let queryTmp = splits[splits.length - 1]
      // Put _isHidden value for all objects
      for (let i = 0; i < this.list_obj.length; i++) {
        if (queryTmp === '' || queryTmp == null) {
          this.list_obj[i]._isHidden = false
          continue
        }
        queryTmp = queryTmp.toLowerCase()
        switch (this.keyName) {
          case 't':
            this.list_obj[i]._isHidden = !this.list_obj[i].t.toLowerCase().includes(queryTmp)
            break
          case 'usr':
            this.list_obj[i]._isHidden = !this.list_obj[i].usr.toLowerCase().includes(queryTmp)
            break
          default:
            this.list_obj[i]._isHidden = !this.list_obj[i].toLowerCase().includes(queryTmp)
        }
        if (this.list_obj[i]._isHidden && this.keyHelper) {
          this.list_obj[i]._isHidden = !this.list_obj[i]._keys.toLowerCase().includes(queryTmp)
        }
      }
      // After filtering we need to check
      // ...if the currently selected value is hidden
      if (this.list_obj[this.index]._isHidden) {
        // Check if we're in the upper half or bottom half
        if (this.index < (this.list_obj.length / 2)) {
          this.index = 0
          this.moveSelection(1)
        } else {
          this.index = this.list_obj.length - 1
          this.moveSelection(-1)
        }
      }
    },
    confirmOnClick: function (obj) {
      if (obj == null) {
        return
      }
      this.$emit('confirm', obj)
      this.clickedBack()
    },
    confirmOnEnter: function () {
      if (this.list_obj.length < 1 || this.list_obj[this.index]._isHidden) {
        this.clickedBack()
        return
      }
      this.confirmOnClick(this.list_obj[this.index])
    }
  }
}
</script>

<style>

</style>
