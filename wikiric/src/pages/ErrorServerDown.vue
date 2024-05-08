<template>
  <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
    <div>
      <q-icon name="sym_o_cloud_off" size="10rem"/>
      <p class="text-h2 fontbold my2">
        Server Down
      </p>
      <p class="text-h5" style="opacity:.8">
        The server may be under maintenance.
        <br>Please check back later.
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
  name: 'ErrorServerDown'
})
</script>
