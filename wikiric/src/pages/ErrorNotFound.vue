<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <p class="my2" style="font-size: 30vh">
        404
      </p>
      <p class="text-h2" style="opacity:.8">
        Oops. Nothing here...
      </p>
      <q-btn
        class="q-mt-xl fontbold"
        color="white"
        text-color="blue"
        unelevated
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFound'
})
</script>
