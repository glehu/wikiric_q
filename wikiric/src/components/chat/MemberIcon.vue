<template>
  <q-avatar :size="size">
    <template v-if="iurl && iurl !== ''">
      <img :src="getImg(iurl, true)" alt="?"
           class="sender_avatar p-[3px]">
      <template v-if="iurla && iurla !== ''">
        <img :src="getImg(iurla, true)" alt="?"
             class="sender_avatar p-[3px]
                    absolute hidden sender_avatar_animated">
      </template>
    </template>
    <template v-else>
      <UserCircleIcon></UserCircleIcon>
    </template>
  </q-avatar>
  <template v-if="!hideStatus">
    <q-badge rounded align="bottom" :color="badgeColor" size="1.2rem"
             class="-translate-x-4"
             style="border: 2px solid var(--md-sys-color-background)"/>
  </template>
</template>

<script>
import { UserCircleIcon } from '@heroicons/vue/24/solid'
import { useStore } from 'stores/wikistate'

export default {
  name: 'MemberIcon',
  components: { UserCircleIcon },
  props: {
    iurl: {
      required: true
    },
    iurla: {
      required: true
    },
    online: {
      type: Boolean,
      required: true
    },
    size: {
      type: String,
      default: '39px'
    },
    hideStatus: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
  },
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
    getImgAlt: function (title) {
      if (!title || title === '') {
        return '?'
      } else {
        return title.substring(0, 2)
      }
    }
  },
  computed: {
    badgeColor () {
      let color = 'grey'
      if (this.online) color = 'green'
      return color
    }
  }
}
</script>

<style>

.sender_avatar {
  object-fit: cover !important;
  max-width: 100% !important;
  max-height: 100% !important;

}

</style>
