<template>
  <div class="items">
    <button
      class="item"
      :class="{ 'is-selected': index === selectedIndex }"
      v-for="(item, index) in items"
      :key="index"
      @click="selectItem(index)">
      <img v-if="item.fallbackImage"
           :src="item.fallbackImage"
           align="absmiddle"
           :alt="item.name"
           style="font-size: 2rem">
      <template v-else>
        {{ item.emoji }}
      </template>
      :{{ item.name }}:
    </button>
  </div>
</template>

<script>
export default {
  props: {
    items: {
      type: Array,
      required: true
    },
    command: {
      type: Function,
      required: true
    },
    editor: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      selectedIndex: 0
    }
  },
  watch: {
    items () {
      this.selectedIndex = 0
    }
  },
  methods: {
    onKeyDown ({ event }) {
      if (event.key === 'ArrowUp') {
        this.upHandler()
        return true
      }
      if (event.key === 'ArrowDown') {
        this.downHandler()
        return true
      }
      if (event.key === 'Tab') {
        this.enterHandler()
        return true
      }
      return false
    },
    upHandler () {
      this.selectedIndex = ((this.selectedIndex + this.items.length) - 1) % this.items.length
    },
    downHandler () {
      this.selectedIndex = (this.selectedIndex + 1) % this.items.length
    },
    enterHandler () {
      this.selectItem(this.selectedIndex)
    },
    selectItem (index) {
      const item = this.items[index]
      if (item) {
        this.command({ name: item.name })
      }
    }
  }
}
</script>

<style lang="scss">
.items {
  padding: 0.2rem;
  position: relative;
  border-radius: 0.5rem;
  background: #FFF;
  color: rgba(0, 0, 0, 0.8);
  overflow: hidden;
  font-size: 0.9rem;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 10px 20px rgba(0, 0, 0, 0.1);
}

.item {
  display: block;
  margin: 0;
  width: 100%;
  text-align: left;
  background: transparent;
  border-radius: 0.4rem;
  border: 1px solid transparent;
  padding: 0.2rem 0.4rem;

  &.is-selected {
    border-color: #000;
  }

  img {
    width: 1em;
    height: 1em;
  }
}
</style>
