<template>
  <q-dialog v-model="show" full-width full-height>
    <q-card class="wfull" flat bordered>
      <div class="surface p4">
        <p class="text-body2 fontbold mb2">
          Wisdom
        </p>
        <div v-if="typeChangeable"
             class="my2 flex row gap-4">
          <q-option-group
            inline
            v-model="wisdomType"
            :options="wisTypes"
            color="primary">
            <template v-slot:label="opt">
              <q-icon :name="opt.icon" size="1.5rem" class="mr2"/>
              <span class="fontbold">{{ opt.label }}</span>
            </template>
          </q-option-group>
        </div>
        <div class="wfull flex gap-x-2">
          <q-input
            for="wisdom_t"
            label="Title"
            color="brand-p"
            label-color="brand-p"
            v-model="wisdom.t"
            class="text-xl flex-grow <lg:w-full">
            <template v-slot:prepend>
              <q-icon name="info"/>
            </template>
          </q-input>
          <q-input
            for="wisdom_keys"
            label="Keywords"
            color="brand-p"
            label-color="brand-p"
            v-model="wisdom.keys"
            class="text-xl flex-grow <lg:w-full">
            <template v-slot:prepend>
              <q-icon name="sym_o_tag"/>
            </template>
          </q-input>
        </div>
        <p class="text-body2 fontbold mt4 mb2">
          Content
        </p>
        <q-editor id="wisdom_desc"
                  ref="wisdom_desc"
                  v-model="wisdom.desc"
                  min-height="10rem"
                  max-height="60dvh"
                  class=""
                  content-class="markedView"
                  :toolbar="toolbarConfig"
                  :fonts="toolbarFonts"/>
      </div>
      <q-card-actions class="p4 wfull flex row justify-between"
                      align="right">
        <q-btn flat label="Close" color="text-brand-p" v-close-popup/>
        <q-btn color="primary" no-caps
               @click="handleSaveWisdom">
          <span>Save Wisdom</span>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>

import { useStore } from 'stores/wikistate'
import { ref, toRaw } from 'vue'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    knowledgeId: {
      type: String,
      required: true
    },
    typeChangeable: {
      type: Boolean,
      default: true
    },
    wisdomProp: {
      type: Object
    }
  },
  name: 'WisdomEdit',
  emits: ['update', 'create'],
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    },
    wisdomProp () {
      this.wisdom = structuredClone(toRaw(this.wisdomProp))
      if (this.wisdom.type) {
        this.wisdomType = this.wisdom.type
      }
    }
  },
  data () {
    return {
      store: useStore(),
      show: false,
      wisdom: {
        t: '',
        desc: '',
        keys: ''
      },
      wisdomBackup: {},
      toolbarConfig: [
        ['bold', 'italic', 'strike', 'underline'],
        ['token', 'hr', 'link'],
        [
          {
            label: this.$q.lang.editor.formatting,
            icon: this.$q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'p',
              'code'
            ]
          },
          {
            label: this.$q.lang.editor.fontSize,
            icon: this.$q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          }
        ]
      ],
      toolbarFonts: {
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
      },
      wisdomType: ref('lesson'),
      wisTypes: [
        {
          label: 'Lesson',
          value: 'lesson',
          icon: 'lightbulb'
        },
        {
          label: 'Question',
          value: 'question',
          icon: 'question_mark'
        }
      ]
    }
  },
  created () {
    this.wisdomBackup = {
      t: '',
      desc: '',
      keys: ''
    }
  },
  methods: {
    handleDialogOpen: function () {
      setTimeout(() => {
        const elem = document.getElementById('wisdom_t')
        if (elem) {
          elem.focus()
        }
      }, 0)
    },
    handleSaveWisdom: function () {
      // Standardize
      this.checkWisdom()
      if (!this.wisdom.t) {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'No Title!',
          caption: 'A title is mandatory.',
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
        return
      }
      // Emit event
      if (this.wisdom.uid) {
        this.$emit('update', this.wisdom)
      } else {
        this.$emit('create', this.wisdom)
      }
      this.wisdom = this.wisdomBackup
      this.show = false
    },
    checkWisdom: function () {
      if (!this.wisdom.pid) {
        this.wisdom.pid = this.knowledgeId
      }
      this.wisdom.type = this.wisdomType
      if (!this.wisdom.type) {
        this.wisdom.type = 'lesson'
      }
      if (!this.wisdom.usr) {
        this.wisdom.usr = this.store.user.username
      }
      this.wisdom.t = this.wisdom.t.trim()
      this.wisdom.keys = this.wisdom.keys.trim()
      this.wisdom.desc = this.wisdom.desc.trim()
    }
  }
}
</script>

<style scoped>

</style>
