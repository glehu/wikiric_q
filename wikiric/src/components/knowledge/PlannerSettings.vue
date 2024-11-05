<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <p class="text-h6 fontbold">
        Planner Settings
      </p>
      <q-expansion-item class="mt2 background" default-opened>
        <template v-slot:header>
          <p class="text-h6 wfull">
            Visuals
          </p>
        </template>
        <q-card class="background">
          <q-card-section>
            <p class="mb4 fmt_border_bottom pb4">
              Choose a nice look for your Planner here.
            </p>
            <p class="text-h6 fontbold mb4">
              Planner Image
            </p>
            <div class="wfull flex px2">
              <group-icon :iurla="null"
                          :iurl="newGroup.piurl"
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
        <q-card class="background">
          <q-card-section>
            <p class="text-h6 fontbold mb4">
              Planner Background
            </p>
            <div v-if="newGroup.pburl"
                 class="flex row justify-center">
              <q-img :src="getImg(newGroup.pburl, true)" alt="Banner"
                     fit="cover" class="h20 w-[96%]"/>
            </div>
            <template v-else>
              <div class="wfull flex items-center p2
                    justify-center fmt_border">
                <p class="text-subtitle2">No Background</p>
              </div>
            </template>
            <file-picker
              :uploading="isUploadingBanner"
              :upload-progress="uploadingImageProgress"
              @selected="handleGroupBannerSelected"
              @upload="handleGroupBannerUpload"/>
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
import { dbDeleteSession, dbGetData, dbSetData } from 'src/libs/wikistore'

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
    knowledge: {
      type: Object,
      required: true
    }
  },
  emits: ['refresh'],
  name: 'PlannerSettings',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    },
    knowledge (newVal) {
      if (!newVal) return
      this.newGroup = newVal
      if (!this.newGroup.piurl) {
        this.newGroup.piurl = ''
      }
      if (!this.newGroup.pburl) {
        this.newGroup.pburl = ''
      }
    }
  },
  data () {
    return {
      show: false,
      store: useStore(),
      newGroup: {
        t: '',
        desc: '',
        piurl: '',
        pburl: ''
      },
      imageBase64: undefined,
      bannerBase64: undefined,
      isUploadingImage: false,
      isUploadingBanner: false,
      uploadingImageProgress: 0
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.newGroup = this.knowledge
    },
    updateGroup: function () {
      this.$emit('refresh')
      this.show = false
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
      let field = 'piurl'
      let nameT = 'planner-image'
      let base64Value = this.imageBase64
      if (isBanner) {
        field = 'pburl'
        nameT = 'planner-banner'
        base64Value = this.bannerBase64
      }
      const payload1 = {
        base64: base64Value,
        name: nameT
      }
      api.post(
        'files/private/create',
        payload1,
        config
      ).then((response) => {
        this.processUploadSnippetResponse(response.data, field, isBanner)
      }).catch((err) => console.debug(err.message))
    },
    processUploadSnippetResponse: async function (response, field, isBanner) {
      const contentURL = response.trim()
      const payload = {
        type: 'edit',
        field,
        new: contentURL
      }
      const vThis = this
      const config = {
        onUploadProgress: function (progressEvent) {
          vThis.uploadingImageProgress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total)
        }
      }
      api.post(
        `knowledge/private/mod/${this.knowledge.uid}`,
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
      await dbDeleteSession(this.knowledge.uid)
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
      this.$router.push('/groups')
    },
    setLeaveCounter: function () {
      this.leaveCounter = 1
      setTimeout(() => {
        this.leaveCounter = 0
      }, 5_000)
    },
    handleChannelEdit: function (newValue) {
      if (!this.editingChannel) return
      api({
        method: 'post',
        url: 'chat/private/mod/' + this.editingChannel.uid,
        data: {
          type: 'edit',
          field: 't',
          new: newValue
        }
      })
      .then(() => {
        let verb
        if (newValue !== '') {
          verb = 'Updated'
        } else {
          verb = 'Deleted'
        }
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: `Channel ${verb}!`,
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
        this.updateGroup()
      })
      .catch((err) => console.debug(err.message))
    },
    handleBulkFilesSelect: async function (fileEv) {
      this.bulkFiles = []
      const files = fileEv
      for (let i = 0; i < files.length; i++) {
        files[i]._base64 = await this.getBase64(files[i])
        files[i]._name = files[i].name.split('.')[0]
        this.bulkFiles.push(files[i])
      }
    },
    getBase64: function (file) {
      return new Promise(function (resolve, reject) {
        const reader = new FileReader()
        reader.onload = function () {
          resolve(reader.result)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    /**
     *
     * @returns {Promise<unknown>}
     */
    getCustomEmotes: async function () {
      const response = await api({
        url: `files/private/chat/${this.knowledge.uid}?type=emote`
      }).catch((e) => {
        console.debug(e.message)
      })
      if (response == null || response.data == null) return
      const emotes = response.data.files
      if (emotes.length < 1) return
      let url
      let md
      let emotesStore = await dbGetData('emotes')
      if (emotesStore == null) {
        emotesStore = {
          map: new Map()
        }
      }
      let fname
      this.emotes = new Map()
      this.emoteList = []
      for (let i = 0; i < emotes.length; i++) {
        url = this.store.serverIP + emotes[i].pth
        emotes[i].t = emotes[i].t.split('.')[0]
        fname = ':' + emotes[i].t + ':'
        // Build Markdown image string
        md = `![${fname}](${url})`
        this.emotes[fname] = md
        // Add to emote list (user prompt)
        emotes[i]._md = md
        emotes[i]._pth = url
        this.emoteList.push(emotes[i])
        await this.addEmoteToSaved(emotesStore, emotes[i])
      }
      await dbSetData('emotes', emotesStore)
      return new Promise((resolve) => {
        resolve()
      })
    },
    /**
     *
     * @param emotes
     * @param emoteFile
     * @returns {Promise<unknown>}
     */
    addEmoteToSaved: async function (emotes, emoteFile) {
      const tmp = `${emoteFile.t}-${this.newGroup.t}`
      const newEntry = {
        // A unique name of the emoji which will be stored as attribute
        name: tmp,
        // A list of unique shortcodes that are used by input rules to find the emoji
        shortcodes: [tmp.toLowerCase()],
        // A list of tags that can help for searching emojis
        tags: [tmp.toLowerCase(), 'custom', this.newGroup.t.toLowerCase()],
        // A name that can help to group emojis
        group: 'Custom Emotes',
        // The image to be rendered
        fallbackImage: emoteFile._pth
      }
      emotes.map.set(emoteFile.t, newEntry)
      return new Promise((resolve) => {
        resolve()
      })
    },
    cancelBulkUpload: function () {
      this.bulkFiles = []
      this.bulkEmoteFiles = []
    },
    removeFile: function (index) {
      if (index < 0) return
      if (this.bulkFiles == null || index > this.bulkFiles.length) return
      this.bulkFiles.splice(index, 1)
    },
    bulkUploadEmotes: async function () {
      if (this.isBulkUploadingEmotes === true) return
      if (!this.bulkFiles || this.bulkFiles.length < 1) return
      this.isBulkUploadingEmotes = true
      this.bulkUploadLeft = this.bulkFiles.length
      for (let i = 0; i < this.bulkFiles.length; i++) {
        this.bulkUploadingCurrently = this.bulkFiles[i]._name
        await this.uploadSnippet(this.bulkFiles[i])
        this.bulkUploadLeft -= 1
      }
      this.bulkFiles = []
      this.isBulkUploadingEmotes = false
      await this.getCustomEmotes()
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Emotes Uploaded!',
        caption: 'Use emotes by typing a colon ":" in the chat!',
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
    },
    uploadSnippet: function (file) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const content = {
            base64: file._base64,
            name: file._name,
            pid: this.knowledge.uid,
            emote: true
          }
          api({
            method: 'post',
            url: 'files/private/create',
            data: content
          })
          .catch((err) => (console.log(err.message)))
          .finally(() => {
            resolve()
          })
        }, 500)
      })
    },
    setSettingsData: async function () {
      const key = `groupset-${this.knowledge.uid}`
      let set = await dbGetData(key)
      if (set == null) {
        set = {
          showCAct: true,
          hideNewCAct: false,
          cSet: []
        }
        await dbSetData(key, set)
      }
      if (set.cSet == null || set.cSet.length < 1) {
        if (this.knowledge.subc && this.knowledge.subc.length > 0) {
          for (let i = 0; i < this.knowledge.subc.length; i++) {
            set.cSet.push({
              t: this.knowledge.subc[i].t,
              uid: this.knowledge.subc[i].uid,
              typ: this.knowledge.subc[i].type,
              hideCAct: false
            })
          }
        }
      } else {
        if (this.knowledge.subc && this.knowledge.subc.length > 0) {
          for (let i = 0; i < this.knowledge.subc.length; i++) {
            for (let j = 0; j < set.cSet.length; j++) {
              if (set.cSet[j].uid === this.knowledge.subc[i].uid) {
                set.cSet[j].t = this.knowledge.subc[i].t
                set.cSet[j].typ = this.knowledge.subc[i].type
              }
            }
          }
        }
      }
      this.settingsDat = set
    },
    updateGroupCAct: async function () {
      await dbSetData(`groupset-${this.knowledge.uid}`, this.settingsDat)
    }
  }
}
</script>

<style scoped>

</style>
