<template>
  <q-avatar class="mr4 rounded-3 surface bshadow"
            :size="size">
    <template v-if="iurl && iurl !== ''">
      <img :src="getImg(iurl, true)" alt="?"
           class="sender_avatar">
      <template v-if="iurla && iurla !== ''">
        <img :src="getImg(iurla, true)" alt="?"
             class="sender_avatar absolute hidden sender_avatar_animated">
      </template>
    </template>
    <template v-else>
      <span class="fontbold text-h6">
        {{ getImgAlt() }}
      </span>
    </template>
  </q-avatar>
</template>

<script>

import { useStore } from 'stores/wikistate'

export default {
  props: {
    t: {
      required: true
    },
    iurl: {
      required: true
    },
    iurla: {
      required: true
    },
    size: {
      type: String,
      default: '64px'
    }
  },
  name: 'GroupIcon',
  data () {
    return {
      store: useStore()
    }
  },
  methods: {
    getImg: function (imgGUID, get = false) {
      if (imgGUID == null || imgGUID === '') {
        return ''
      } else {
        let ret = imgGUID
        if (get) ret = this.store.serverIP + imgGUID
        return ret
      }
    },
    getImgAlt: function () {
      if (!this.t || this.t === '') {
        return '?'
      } else {
        return this.t.substring(0, 2)
      }
    }
  }
}
</script>

<style>

</style>
