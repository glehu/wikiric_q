<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <p class="text-h6 fontbold">
        Member Settings
      </p>
      <q-input
        for="group_t"
        label="Title"
        label-color="brand-p"
        v-model="newMember.name"
        class="p2 text-xl">
        <template v-slot:prepend>
          <q-icon name="person"/>
        </template>
      </q-input>
      <p class="ml2">
        @{{ newMember.usr }}
      </p>
      <q-expansion-item class="mt4 background" default-opened>
        <template v-slot:header>
          <p class="text-h6 wfull">
            Visuals
          </p>
        </template>
        <q-card class="background">
          <q-card-section>
            <p class="text-h6 fontbold mb4">
              Profile Image
            </p>
            <div class="wfull flex px2">
              <group-icon :iurla="null"
                          :iurl="newMember.iurl"
                          :t="newMember.name"
                          size="128px"/>
            </div>
            <file-picker
              :uploading="isUploadingImage"
              :upload-progress="uploadingImageProgress"
              @selected="handleGroupImageSelected"
              @upload="handleGroupImageUpload"/>
          </q-card-section>
        </q-card>
      </q-expansion-item>
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
    member: {
      type: Object,
      required: true
    }
  },
  emits: ['refresh'],
  name: 'MemberSettings',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    },
    member (newVal) {
      this.newMember = newVal
    }
  },
  data () {
    return {
      show: false,
      store: useStore(),
      newMember: {
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
      leaveCounter: 0,
      editingChannel: null,
      emotes: new Map(),
      emoteList: [],
      bulkEmoteFiles: [],
      bulkFiles: [],
      isBulkUploadingEmotes: false,
      bulkUploadingCurrently: '',
      bulkUploadLeft: 0
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.newMember = this.member
    },
    updateGroup: function () {
      this.$emit('refresh')
      this.show = false
    },
    handleGroupImageSelected: function (resp) {
      this.imageBase64 = resp.base64
    },
    handleGroupImageUpload: function () {
      this.uploadImage(false)
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
      const field = 'iurl'
      const base64Value = this.imageBase64
      const payload = {
        type: 'edit',
        field,
        new: base64Value
      }
      api.post(
        `chat/private/self/mod/${this.newMember.parent}`,
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
    }
  }
}
</script>

<style scoped>

</style>
