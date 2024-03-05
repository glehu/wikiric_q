<template>
  <q-item
    clickable
    @click="gotoLink(link)">
    <q-item-section
      v-if="icon"
      avatar>
      <q-icon :name="icon"/>
    </q-item-section>
    <q-item-section>
      <q-item-label class="text-weight-bold">{{ title }}</q-item-label>
      <q-item-label caption class="text-italic text-subtitle2">{{ caption }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },
    caption: {
      type: String,
      default: ''
    },
    link: {
      type: String,
      default: '#'
    },
    icon: {
      type: String,
      default: ''
    }
  },
  methods: {
    gotoLink: function (link) {
      this.$router.push(link)
    }
  }
})
</script>
