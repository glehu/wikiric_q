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
      <q-expansion-item class="mt4 background">
        <template v-slot:header>
          <p class="text-h6 wfull">
            Privacy / Visibility
          </p>
        </template>
        <q-card class="background">
          <q-card-section>
            <p class="mb4 fmt_border_bottom pb4">
              Control how your privacy needs to being handled in this group.
            </p>
            <div class="flex items-center gap-2 mb4">
              <q-icon name="visibility" size="2rem"/>
              <p class="text-h6 fontbold">
                Channel Activity
              </p>
            </div>
            <div class="p4 text-subtitle2 max-w-[300px]
                        flex column gap-2">
              <q-checkbox v-model="settingsDat.showCAct"
                          label="Display your username under the channel you're connected to."
                          @update:model-value="updateGroupCAct"/>
              <q-checkbox v-model="settingsDat.hideNewCAct"
                          label="Deactivate this feature for new channels."
                          @update:model-value="updateGroupCAct"/>
            </div>
            <template v-if="settingsDat.cSet && settingsDat.cSet.length > 0">
              <p class="mb2 text-subtitle2">
                Deactivate this feature for each channel if you want to:
              </p>
              <div class="flex column p4 gap-2">
                <template v-for="cSet in settingsDat.cSet" :key="cSet">
                  <q-checkbox v-model="cSet.hideCAct"
                              @update:model-value="updateGroupCAct">
                    <div class="flex flex-nowrap items-center">
                      <template v-if="cSet.typ === 'text'">
                        <q-icon name="tag" size="1.5rem"/>
                      </template>
                      <template v-else-if="cSet.typ === 'audio'">
                        <q-icon name="mic" size="1.5rem"/>
                      </template>
                      <template v-else-if="cSet.typ === 'video'">
                        <q-icon name="videocam" size="1.5rem"/>
                      </template>
                      <div class="flex column wfit">
                        <span class="ml1 fontbold">{{ cSet.t }}</span>
                        <span class="ml1 text-xs">({{ cSet.uid }})</span>
                      </div>
                    </div>
                  </q-checkbox>
                </template>
              </div>
              <p class="mt2 text-subtitle2">
                TIP: Revisit this page to see new channels as they appear.
              </p>
            </template>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <q-expansion-item class="mt2 background">
        <template v-slot:header>
          <p class="text-h6 wfull">
            Visuals
          </p>
        </template>
        <q-card class="background">
          <q-card-section>
            <p class="mb4 fmt_border_bottom pb4">
              Choose a nice look for your group here.
            </p>
            <p class="text-h6 fontbold mb4">
              Group Image
            </p>
            <div class="wfull flex px2">
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
        <q-card class="background">
          <q-card-section>
            <p class="text-h6 fontbold mb4">
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
      </q-expansion-item>
      <q-expansion-item class="mt2 background">
        <template v-slot:header>
          <p class="text-h6 wfull">
            Danger Zone
          </p>
        </template>
        <q-card class="my2 background">
          <q-card-section>
            <div class="rounded-2 overflow-hidden p2"
                 style="border: 4px solid var(--md-sys-color-error-light);">
              <div class="p2 wfit rounded-2 overflow-hidden">
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
                         color="negative"
                         label="Press To Confirm: Leave Group"
                         class="fontbold"
                         v-on:click="leaveGroup"/>
                </template>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-expansion-item>
      <template v-if="newGroup.subc">
        <q-expansion-item class="mt2 background">
          <template v-slot:header>
            <p class="text-h6 wfull">
              Channels - {{ newGroup.subc.length - 1 }}
            </p>
          </template>
          <div class="flex items-center gap-1
                      px1 py0.5 rounded surface
                      wfit ml4 my2">
            <q-icon name="info"/>
            <span class="text-subtitle2">
              General channel is not shown here.
            </span>
          </div>
          <div class="pb4">
            <template v-for="chat in newGroup.subc" :key="chat">
              <q-item v-if="chat.uid !== newGroup.uid" clickable dense>
                <template v-if="chat._hasUnread">
                  <div class="w[6px] h-[90%] bg-orange rounded-r absolute left-0"></div>
                </template>
                <q-item-section class="rounded">
                  <q-item-label class="fontbold text-lg flex items-center">
                    <q-btn icon="menu" class="" flat>
                      <q-popup-proxy class="z-top">
                        <q-btn-group class="surface">
                          <q-btn icon="edit" label="Edit" color="primary">
                            <q-popup-edit v-model="chat.t" buttons v-slot="scope"
                                          @show="editingChannel = chat"
                                          @save="handleChannelEdit"
                                          color="brand-p"
                                          class="z-top">
                              <q-input v-model="scope.value"
                                       dense autofocus counter
                                       @keyup.enter="scope.set"/>
                            </q-popup-edit>
                          </q-btn>
                          <q-btn icon="delete" label="Delete"
                                 @click="editingChannel = chat; handleChannelEdit('')"/>
                        </q-btn-group>
                      </q-popup-proxy>
                    </q-btn>
                    <template v-if="chat.type === 'text'">
                      <q-icon name="tag" size="1.5rem"/>
                    </template>
                    <template v-else-if="chat.type === 'audio'">
                      <q-icon name="mic" size="1.5rem"/>
                    </template>
                    <template v-else-if="chat.type === 'video'">
                      <q-icon name="videocam" size="1.5rem"/>
                    </template>
                    <span class="ml4 text-body1 fontbold">
                  {{ chat.t }}
                </span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </div>
        </q-expansion-item>
      </template>
      <q-expansion-item class="mt2 background">
        <template v-slot:header>
          <p class="text-h6 wfull">
            Custom Emotes - {{ emoteList.length }}
          </p>
        </template>
        <div class="px4 mt2 wfull">
          <p class="mb4 fmt_border_bottom pb4">
            You can use custom emotes by entering ":" (without the quotes)
            into any rich-text editor on wikiric. Eureka!
          </p>
          <q-file
            v-model="bulkEmoteFiles"
            @update:model-value="handleBulkFilesSelect"
            label="Pick files"
            label-color="brand-p"
            accept=".jpg, .png"
            clearable
            filled
            multiple
            style="max-width: 300px"
          />
          <template v-if="bulkFiles.length > 0">
            <div class="p4 fmt_border rounded-2 my4 wfull">
              <p class="text-h6 fontbold">
                Bulk Upload
              </p>
              <div class="flex gap-4 mt4 wfull">
                <template v-for="(file, i) in bulkFiles" :key="file">
                  <div class="flex column items-center">
                    <q-img :src="file._base64"
                           size="96px"
                           fit="contain"/>
                    <div class="my2">
                      <p class="text-subtitle2">Name:</p>
                      <input type="text" v-model="file._name"
                             class="surface p1 border-none
                                    decoration-none ring-0 outline-none
                                    rounded"
                             style="color: var(--md-sys-color-on-surface)">
                    </div>
                    <q-btn icon="delete" label="Remove" no-caps
                           class="wfull"
                           color="brand-bg" text-color="brand-p"
                           @click="removeFile(i)"/>
                  </div>
                </template>
              </div>
              <div class="wfull flex justify-end gap-2 mt8">
                <q-btn label="Cancel"
                       no-caps
                       flat
                       @click="cancelBulkUpload"/>
                <q-btn label="Upload Emotes"
                       no-caps
                       color="primary"
                       @click="bulkUploadEmotes"/>
              </div>
              <template v-if="isBulkUploadingEmotes">
                <div class="wfull flex justify-end gap-2 mt4">
                  <q-spinner-radio color="brand_p"/>
                  <span>Uploading {{ bulkUploadingCurrently }}... {{ bulkUploadLeft }} left</span>
                </div>
              </template>
            </div>
          </template>
        </div>
        <template v-if="emoteList.length < 1">
          <div class="pb2">
            <div class="flex items-center gap-1
                        px1 py0.5 rounded-b surface
                        wfit ml4 my2 wfull"
                 style="max-width: 300px">
              <q-icon name="info"/>
              <span class="text-subtitle2">
              Upload some emotes to get started!
            </span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="p4 flex wfull gap-2">
            <template v-for="emote in emoteList" :key="emote">
              <div class="flex column items-center gap-2">
                <q-img :src="emote._pth"
                       size="96px"
                       fit="contain"/>
                <p class="text-subtitle2 fontbold">
                  {{ emote.t }}
                </p>
              </div>
            </template>
          </div>
        </template>
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
      leaveCounter: 0,
      editingChannel: null,
      emotes: new Map(),
      emoteList: [],
      bulkEmoteFiles: [],
      bulkFiles: [],
      isBulkUploadingEmotes: false,
      bulkUploadingCurrently: '',
      bulkUploadLeft: 0,
      settingsDat: {
        showCAct: false,
        hideNewCAct: false,
        cSet: []
      }
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.newGroup = this.group
      this.getCustomEmotes()
      this.setSettingsData()
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
        url: `files/private/chat/${this.group.uid}?type=emote`
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
            pid: this.group.uid,
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
      const key = `groupset-${this.group.uid}`
      let set = await dbGetData(key)
      if (set == null) {
        set = {
          showCAct: false,
          hideNewCAct: false,
          cSet: []
        }
        await dbSetData(key, set)
      }
      if (set.cSet == null || set.cSet.length < 1) {
        if (this.group.subc && this.group.subc.length > 0) {
          for (let i = 0; i < this.group.subc.length; i++) {
            set.cSet.push({
              t: this.group.subc[i].t,
              uid: this.group.subc[i].uid,
              typ: this.group.subc[i].type,
              hideCAct: false
            })
          }
        }
      } else {
        if (this.group.subc && this.group.subc.length > 0) {
          for (let i = 0; i < this.group.subc.length; i++) {
            for (let j = 0; j < set.cSet.length; j++) {
              if (set.cSet[j].uid === this.group.subc[i].uid) {
                set.cSet[j].t = this.group.subc[i].t
                set.cSet[j].typ = this.group.subc[i].type
              }
            }
          }
        }
      }
      this.settingsDat = set
    },
    updateGroupCAct: async function () {
      await dbSetData(`groupset-${this.group.uid}`, this.settingsDat)
    }
  }
}
</script>

<style scoped>

</style>
