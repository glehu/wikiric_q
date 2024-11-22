<template>
  <q-btn
    v-if="show ? show(): null"
    class="menu-item"
    unelevated dense
    size="0.8em"
    :icon="icon"
    :class="{ 'is-active': isActive ? isActive(): null }"
    @click="action">
    <q-tooltip class="fontbold text-sm"
               anchor="top middle" self="bottom middle"
               :offset="[10, 10]">
      {{ title }}
    </q-tooltip>
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
    },
    show: {
      type: Function,
      default: () => { return true }
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
