<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <p class="text-h6 fontbold">
        Group Settings
      </p>
      <q-input
        for="group_t"
        label="Title"
        label-color="brand-p"
        v-model="newGroup.t"
        class="p2 text-xl">
        <template v-slot:prepend>
          <q-icon name="people"/>
        </template>
      </q-input>
      <q-input
        for="group_desc"
        label="Description"
        label-color="brand-p"
        v-model="newGroup.desc"
        class="p2 text-xl">
        <template v-slot:prepend>
          <q-icon name="info"/>
        </template>
      </q-input>
      <q-card class="mt4 mb2 surface-variant">
        <q-card-section>
          <p class="text-h6 fontbold mb2">
            Group Image
          </p>
          <div class="wfull flex justify-center">
            <group-icon :iurla="null"
                        :iurl="newGroup.iurl"
                        :t="newGroup.t"
                        size="128px"/>
          </div>
          <file-picker
            :uploading="isUploadingImage"
            :upload-progress="uploadingImageProgress"
            @selected="handleGroupImageSelected"
            @upload="handleGroupImageUpload"/>
        </q-card-section>
      </q-card>
      <q-card class="my2 surface-variant">
        <q-card-section>
          <p class="text-h6 fontbold mb2">
            Group Banner
          </p>
          <div v-if="newGroup.burl"
               class="flex row justify-center">
            <q-img :src="getImg(newGroup.burl, true)" alt="Banner"
                   fit="cover" class="h20 w-[96%]"/>
          </div>
          <template v-else>
            <div class="wfull flex items-center p2
                    justify-center fmt_border">
              <p class="text-subtitle2">No Banner</p>
            </div>
          </template>
          <file-picker
            :uploading="isUploadingBanner"
            :upload-progress="uploadingImageProgress"
            @selected="handleGroupBannerSelected"
            @upload="handleGroupBannerUpload"/>
        </q-card-section>
      </q-card>
      <q-card class="my2 surface-variant">
        <q-card-section>
          <div class="rounded-2 overflow-hidden p2"
               style="border: 4px solid var(--md-sys-color-error);">
            <p class="fontbold text-h6">
              Danger Zone
            </p>
            <div class="p2 wfit rounded-2 overflow-hidden mt4">
              <template v-if="leaveCounter === 0">
                <q-btn icon="delete"
                       color="brand-bg"
                       text-color="brand-p"
                       label="Leave Group"
                       class="fontbold"
                       v-on:click="setLeaveCounter"/>
              </template>
              <template v-else-if="leaveCounter === 1">
                <q-btn icon="delete"
                       color="brand-bg"
                       text-color="brand-p"
                       label="Press To Confirm: Leave Group"
                       class="fontbold"
                       v-on:click="leaveGroup"/>
              </template>
            </div>
          </div>
        </q-card-section>
      </q-card>
      <div class="flex wfull mt6">
        <q-card-actions align="right">
          <q-btn flat label="Close" color="text-brand-p" v-close-popup/>
        </q-card-actions>
        <q-btn color="primary" no-caps
               v-on:click="updateGroup"
               class="mlauto">
          <div class="column py2 px4">
            <p class="text-weight-bold q-ma-none">
              Confirm
            </p>
          </div>
        </q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { api } from 'boot/axios'
import FilePicker from 'components/FilePicker.vue'
import GroupIcon from 'components/chat/GroupIcon.vue'
import { useStore } from 'stores/wikistate'
import { dbDeleteSession } from 'src/libs/wikistore'

export default {
  components: {
    GroupIcon,
    FilePicker
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    group: {
      type: Object,
      required: true
    }
  },
  emits: ['refresh'],
  name: 'GroupSettings',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    },
    group (newVal) {
      this.newGroup = newVal
    }
  },
  data () {
    return {
      show: false,
      store: useStore(),
      newGroup: {
        t: '',
        desc: '',
        pw: '',
        crypt: true,
        iscom: false
      },
      imageBase64: undefined,
      bannerBase64: undefined,
      isUploadingImage: false,
      isUploadingBanner: false,
      uploadingImageProgress: 0,
      leaveCounter: 0
    }
  },
  methods: {
    handleDialogOpen: function () {
      setTimeout(() => {
        const elem = document.getElementById('group_t')
        if (!elem) return
        elem.focus()
      })
      this.newGroup = this.group
    },
    updateGroup: function () {
      this.$emit('refresh')
    },
    handleGroupImageSelected: function (resp) {
      this.imageBase64 = resp.base64
    },
    handleGroupBannerSelected: function (resp) {
      this.bannerBase64 = resp.base64
    },
    handleGroupImageUpload: function () {
      this.uploadImage(false)
    },
    handleGroupBannerUpload: function () {
      this.uploadImage(true)
    },
    uploadImage: function (isBanner = false) {
      if (!isBanner) {
        this.isUploadingImage = true
      } else {
        this.isUploadingBanner = true
      }
      const vThis = this
      const config = {
        onUploadProgress: function (progressEvent) {
          vThis.uploadingImageProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total)
        }
      }
      let field = 'iurl'
      let base64Value = this.imageBase64
      if (isBanner) {
        field = 'burl'
        base64Value = this.bannerBase64
      }
      const payload = {
        type: 'edit',
        field,
        new: base64Value
      }
      api.post(
        `chat/private/mod/${this.group.uid}`,
        payload,
        config
      )
      .then(() => {
        if (!isBanner) {
          this.isUploadingImage = false
        } else {
          this.isUploadingBanner = false
        }
        this.uploadingImageProgress = 0
        this.updateGroup()
      })
      .catch((err) => console.debug(err.message))
    },
    getImg: function (imgGUID, get = false) {
      if (imgGUID == null || imgGUID === '') {
        return ''
      } else {
        let ret = imgGUID
        if (get) ret = this.store.serverIP + imgGUID
        return ret
      }
    },
    leaveGroup: async function () {
      await dbDeleteSession(this.group.uid)
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Group Removed',
        caption: '',
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            handler: () => {
            }
          }
        ]
      })
      this.$router.push('/q/groups')
    },
    setLeaveCounter: function () {
      this.leaveCounter = 1
      setTimeout(() => {
        this.leaveCounter = 0
      }, 5_000)
    }
  }
}
</script>

<style scoped>

</style>
