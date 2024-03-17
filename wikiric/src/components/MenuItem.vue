<template>
  <q-btn
    class="menu-item"
    unelevated dense
    size="0.8em"
    :icon="icon"
    :class="{ 'is-active': isActive ? isActive(): null }"
    @click="action"
  >
  </q-btn>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    action: {
      type: Function,
      required: true
    },
    isActive: {
      type: Function,
      default: null
    }
  },
  data () {
    return {}
  }
}
</script>

<style lang="scss">
.menu-item {
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.4rem;
  color: var(--md-sys-color-on-surface);
  cursor: pointer;
  margin-right: 1px;

  &.is-active {
    color: var(--md-sys-color-on-surface);
    background-color: var(--md-sys-color-background);
    border: 1px solid var(--md-sys-color-outline-variant);
  }
}
</style>
