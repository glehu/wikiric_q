<template>
  <div class="p2">
    <q-slide-transition :duration="slideDuration">
      <div v-show="showImage && fileValue && fileValue.type && fileValue.type.startsWith('image')"
           class="">
        <q-img :src="base64" fit="contain"
               class="wfull hfull mb2
                      max-h-[min(400px,90dvh)]
                      max-w-[min(500px,90dvw)]"/>
      </div>
    </q-slide-transition>
    <q-slide-transition :duration="slideDuration">
      <div v-show="showImage && fileValue && fileValue.type && fileValue.type.startsWith('audio')"
           class="wfull">
        <audio v-if="fileValue && fileValue.type && audioURL"
               controls preload="auto">
          <source :src="audioURL" :type="fileValue.type">
          Your browser does not support playing audio.
        </audio>
      </div>
    </q-slide-transition>
    <q-slide-transition duration="100">
      <template v-if="uploading">
        <div class="mt2 flex column gap2">
          <q-linear-progress
            class="h4 rounded fmt_border"
            :value="uploadProgress"
            color="primary"
            track-color="brand_bg"
          />
        </div>
      </template>
    </q-slide-transition>
    <q-file filled bottom-slots
            v-model="fileValue"
            @update:model-value="showPreviewImage"
            label="Upload"
            label-color="brand-p"
            counter>
      <template v-slot:prepend>
        <q-icon name="attach_file" @click.stop.prevent/>
      </template>
      <template v-slot:append>
        <q-btn icon="delete"
               flat
               @click.stop.prevent="clearFile"/>
        <template v-if="uploading">
          <q-spinner-radio color="brand_p"/>
        </template>
        <template v-else>
          <q-btn :icon="confirmIcon"
                 color="primary"
                 @click.stop.prevent="handleConfirm"/>
        </template>
      </template>
      <template v-slot:hint>
        Select a file
      </template>
    </q-file>
  </div>
</template>

<script>

export default {
  props: {
    confirmIcon: {
      type: String,
      default: 'upload'
    },
    uploading: {
      type: Boolean,
      default: false
    },
    uploadProgress: {
      type: Number,
      default: 0
    },
    fileRef: {
      type: File
    }
  },
  name: 'FilePicker',
  emits: ['selected', 'upload'],
  watch: {
    uploading (newVal, oldVal) {
      if (oldVal === true && newVal === false) {
        this.slideDuration = 300
        this.fileValue = null
        this.showImage = false
      }
    },
    fileRef (newVal) {
      if (!newVal) return
      this.fileValue = newVal
      this.showPreviewImage(newVal)
    }
  },
  data () {
    return {
      fileValue: null,
      base64: null,
      audioURL: null,
      showImage: false,
      slideDuration: 0
    }
  },
  methods: {
    showPreviewImage: function (file) {
      const reader = new FileReader()
      const vThis = this
      const url = window.URL || window.webkitURL
      if (this.fileValue !== file) {
        this.fileValue = file
      }
      reader.onload = function () {
        vThis.base64 = reader.result
        vThis.$emit('selected', {
          base64: vThis.base64,
          type: file.type,
          name: file.name
        })
        vThis.slideDuration = 0
        vThis.showImage = true
        if (file.type.startsWith('audio')) {
          vThis.audioURL = url.createObjectURL(file)
          console.log(vThis.audioURL)
        }
      }
      reader.readAsDataURL(file)
    },
    handleConfirm: function () {
      if (!this.fileValue || !this.fileValue.type) return
      this.$emit('upload')
    },
    clearFile: function () {
      this.slideDuration = 300
      this.fileValue = null
      this.showImage = false
      setTimeout(() => {
        this.$emit('selected', undefined)
      }, 350)
    }
  }
}
</script>

<style scoped>

</style>
