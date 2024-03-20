<template>
  <template v-if="editor">
    <div class="wfull surface rounded-2 overflow-hidden
                fmt_border">
      <menu-bar :editor="editor"/>
      <editor-content :editor="editor"
                      class="p3" :style="{ minHeight: eMinHeight }"/>
    </div>
  </template>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, Extension } from '@tiptap/vue-3'
import MenuBar from 'components/MenuBar.vue'
import Emoji from '@tiptap-pro/extension-emoji'
import suggestion from 'components/MenuSuggestion.js'
import { dbGetData } from 'src/libs/wikistore'

export default {
  components: {
    MenuBar,
    EditorContent
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    eMinHeight: {
      type: String,
      default: '1rem'
    },
    preventEnter: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:modelValue', 'kpress', 'fpaste'],
  data () {
    return {
      editor: null,
      bc: new BroadcastChannel('wikiric_internal')
    }
  },
  watch: {
    modelValue (value) {
      // HTML
      const isSame = this.editor.getHTML() === value
      if (isSame) {
        return
      }
      this.editor.commands.setContent(value, false)
    }
  },
  mounted () {
    this.handleMounted()
  },
  beforeUnmount () {
    this.bc = null
    this.editor.destroy()
  },
  methods: {
    handleMounted: async function () {
      const custom = await dbGetData('emotes')
      let customEmotes = []
      if (custom != null) {
        customEmotes = Array.from(custom.map, ([name, value]) => (value))
      }
      const shiftEnterExtension = Extension.create({
        addKeyboardShortcuts () {
          return {
            'Shift-Enter': ({ editor }) => {
              editor.commands.enter()
              return true
            }
          }
        }
      })
      this.editor = new Editor({
        editorProps: {
          attributes: {
            class: 'markedView'
          },
          handleDOMEvents: {
            keydown: (_, event) => {
              this.$emit('kpress', event)
              if (event.key === 'Enter') {
                if (this.preventEnter && !event.shiftKey) {
                  return true
                }
              }
            },
            paste: (_, event) => {
              this.$emit('fpaste', event)
            }
          }
        },
        extensions: [
          StarterKit,
          Emoji.configure({
            emojis: customEmotes,
            enableEmoticons: false,
            suggestion,
            HTMLAttributes: {
              class: 'wkrg-emote'
            }
          }),
          shiftEnterExtension
        ],
        content: this.modelValue,
        onUpdate: () => {
          this.$emit('update:modelValue', this.editor.getHTML())
        }
      })
      this.bc.onmessage = event => {
        this.handleEditorInternal(event.data)
      }
    },
    handleEditorInternal: function (e) {
      if (e.app !== 'editor') return
      if (e.type === 'focus') {
        this.editor.commands.focus('end')
      }
    }
  }
}
</script>

<style lang="scss">
.editor {
  background-color: var(--md-sys-color-surface);
  border: 1px solid var(--md-sys-color-outline-variant);
  border-radius: 0.75rem;
  color: var(--md-sys-color-on-surface);
  display: flex;
  flex-direction: column;
  max-height: 32rem;

  &__header {
    align-items: center;
    background: var(--md-sys-color-surface);
    border-bottom: 1px solid var(--md-sys-color-outline-variant);
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    padding: 0.25rem;
  }

  &__content {
    flex: 1 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
    padding: 1.25rem 1rem;
    -webkit-overflow-scrolling: touch;
  }

  &__footer {
    align-items: center;
    border-top: 1px solid var(--md-sys-color-outline-variant);
    color: var(--md-sys-color-on-surface);
    display: flex;
    flex: 0 0 auto;
    flex-wrap: wrap;
    font-size: 12px;
    font-weight: 600;
    justify-content: space-between;
    padding: 0.25rem 0.75rem;
    white-space: nowrap;
  }
}

/* Give a remote user a caret */
.collaboration-cursor__caret {
  border-left: 1px solid #0D0D0D;
  border-right: 1px solid #0D0D0D;
  margin-left: -1px;
  margin-right: -1px;
  pointer-events: none;
  position: relative;
  word-break: normal;
}

/* Render the username above the caret */
.collaboration-cursor__label {
  border-radius: 3px 3px 3px 0;
  color: #0D0D0D;
  font-size: 12px;
  font-style: normal;
  font-weight: 600;
  left: -1px;
  line-height: normal;
  padding: 0.1rem 0.3rem;
  position: absolute;
  top: -1.4em;
  user-select: none;
  white-space: nowrap;
}

/* Basic editor styles */
.tiptap {
  > * + * {
    margin-top: 0.75em;
  }

  mark {
    background-color: #FAF594;
  }
}

.wkrg-emote {
  font-size: 1.5rem;
}
</style>
