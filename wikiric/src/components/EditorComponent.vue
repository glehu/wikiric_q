<template>
  <template v-if="editor">
    <div class="wfull surface rounded-2
                overflow-x-hidden
                overflow-y-auto
                fmt_border">
      <template v-if="!hideMenu">
        <menu-bar :editor="editor" :chat-id="chatId"/>
      </template>
      <editor-content :editor="editor"
                      class="p3 markedView"
                      :style="{ minHeight: eMinHeight,
                                height: eHeight,
                                maxHeight: eMaxHeight}"/>
    </div>
  </template>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent, Extension } from '@tiptap/vue-3'
import MenuBar from 'components/MenuBar.vue'
import Emoji from '@tiptap-pro/extension-emoji'
import Mention from '@tiptap/extension-mention'
import emojiSuggestion from 'components/EmojiSuggestion.js'
import mentionSuggestion from 'components/MentionSuggestion.js'
import { dbGetData } from 'src/libs/wikistore'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import Image from '@tiptap/extension-image'
import { FileHandler } from '@tiptap-pro/extension-file-handler'
import UniqueID from '@tiptap-pro/extension-unique-id'
import Placeholder from '@tiptap/extension-placeholder'
import { Link } from '@tiptap/extension-link'
import { debounce } from 'quasar'

const lowlight = createLowlight(common)

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
    eId: {
      type: String,
      default: ''
    },
    eMinHeight: {
      type: String,
      default: '1rem'
    },
    eHeight: {
      type: String,
      default: 'inherit'
    },
    eMaxHeight: {
      type: String,
      default: '100%'
    },
    preventEnter: {
      type: Boolean,
      default: false
    },
    hideMenu: {
      type: Boolean,
      default: false
    },
    preventEdit: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: 'Write something…'
    },
    chatId: {
      type: String,
      default: null,
      required: false
    }
  },
  emits: ['update:modelValue', 'kpress', 'fpaste', 'autosave'],
  data () {
    return {
      editor: null,
      bc: new BroadcastChannel('wikiric_internal'),
      autoSaveTimer: -1
    }
  },
  watch: {
    modelValue (value) {
      // HTML
      this.checkLinks()
      const isSame = this.editor.getHTML() === value
      if (isSame) {
        return
      }
      this.editor.commands.setContent(value, false)
    }
  },
  created () {
    this.checkLinks = debounce(this.checkLinks, 200)
  },
  mounted () {
    this.handleMounted()
  },
  beforeUnmount () {
    this.bc = null
    if (this.editor) {
      this.editor.destroy()
    }
  },
  methods: {
    handleMounted: async function () {
      const custom = await dbGetData('emotes')
      let customEmotes = []
      if (custom != null) {
        customEmotes = Array.from(custom.map, ([name, value]) => (value))
      }
      const preventEnter = this.preventEnter
      const shiftEnterExtension = Extension.create({
        addKeyboardShortcuts () {
          return {
            'Shift-Enter': ({ editor }) => {
              if (preventEnter) {
                editor.commands.first(({ commands }) => [
                  () => commands.newlineInCode(),
                  () => commands.splitListItem('listItem'),
                  () => commands.createParagraphNear(),
                  () => commands.liftEmptyBlock(),
                  () => commands.splitBlock()
                ])
                return true
              }
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
              if (this.preventEdit) {
                // Check if we want to copy
                if (event.key === 'c' && (event.shiftKey || event.metaKey)) {
                  return false
                }
                // Prevent other actions
                event.preventDefault()
                event.stopPropagation()
                return true
              }
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
          Image,
          Emoji.configure({
            emojis: customEmotes,
            enableEmoticons: false,
            suggestion: emojiSuggestion,
            HTMLAttributes: {
              class: 'wkrg-emote'
            }
          }),
          Mention.configure({
            HTMLAttributes: {
              class: 'mention'
            },
            suggestion: mentionSuggestion
          }),
          CodeBlockLowlight.configure({
            lowlight
          }),
          FileHandler.configure({
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
            onDrop: (currentEditor, files, pos) => {
              files.forEach(file => {
                const fileReader = new FileReader()

                fileReader.readAsDataURL(file)
                fileReader.onload = () => {
                  currentEditor.chain().insertContentAt(pos, {
                    type: 'image',
                    attrs: {
                      src: fileReader.result
                    }
                  }).focus().run()
                }
              })
            },
            onPaste: (currentEditor, files) => {
              files.forEach(file => {
                const fileReader = new FileReader()

                fileReader.readAsDataURL(file)
                fileReader.onload = () => {
                  currentEditor.chain().insertContentAt(currentEditor.state.selection.anchor, {
                    type: 'image',
                    attrs: {
                      src: fileReader.result
                    }
                  }).focus().run()
                }
              })
            }
          }),
          UniqueID.configure({
            attributeName: 'wikiric-id',
            types: ['heading']
          }),
          Placeholder.configure({
            placeholder: this.placeholder
          }),
          Link.configure({
            protocols: ['https'],
            openOnClick: false,
            HTMLAttributes: {
              rel: null,
              target: null
            }
          }),
          shiftEnterExtension
        ],
        content: this.modelValue,
        onUpdate: () => {
          this.handleEmitAutoSave()
          this.$emit('update:modelValue', this.editor.getHTML())
        },
        onPaste: (ev, slice) => {
          // Here will be the Markdown parser part :)
        }
      })
      if (!this.bc) {
        this.bc = new BroadcastChannel('wikiric_internal')
      }
      this.bc.onmessage = event => {
        this.handleEditorInternal(event.data)
      }
      setTimeout(() => {
        this.checkLinks()
      }, 100)
    },
    handleEditorInternal: function (e) {
      if (e.app !== 'editor') return
      if (e.id && this.eId !== e.id) return
      if (e.type === 'focus') {
        setTimeout(() => {
          this.editor.commands.focus('end')
        }, 1)
      } else if (e.type === 'add') {
        this.handleInternalCommandAdd(e)
      }
    },
    handleInternalCommandAdd: function (e) {
      if (!e.payload) return
      if (e.payload.type === 'node') {
        this.handleAddNode(e.payload)
      }
    },
    handleAddNode: function (e) {
      if (e.tag === 'img') {
        if (!e.src) return
        this.editor.chain().insertContentAt(
          this.editor.state.selection.anchor, {
            type: 'image',
            attrs: {
              src: e.src
            }
          }).focus().run()
      }
    },
    handleEmitAutoSave: function () {
      if (this.autoSaveTimer) {
        clearTimeout(this.autoSaveTimer)
      }
      this.autoSaveTimer = setTimeout(() => {
        this.$emit('autosave')
        console.debug('AUTOSAVE')
      }, 2_000)
    },
    checkLinks: function () {
      const matches = document.querySelectorAll('a')
      if (matches && matches.length > 0) {
        matches.forEach(el => {
          if (el.href && el.href !== '') {
            if (el.href.startsWith('https://wikiric.xyz/')) {
              // Ignore download links
              if (!el.download) {
                el.classList.add('internalLink')
                el.addEventListener('click', this.interceptLink, false)
              }
            } else {
              el.addEventListener('click', this.interceptRegularLink, false)
            }
          }
        })
      }
    },
    interceptLink: function (e) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      const url = `/redir?redirect=${e.currentTarget.href.substring(21)}` +
        `&backrefurl=${this.$router.currentRoute.value.fullPath}`
      this.$router.push(url)
    },
    interceptRegularLink: function (e) {
      e.preventDefault()
      e.stopImmediatePropagation()
      e.stopPropagation()
      window.open(e.target.href, '_blank')
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

  pre {
    background: #0D0D0D;
    color: #FFF;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;

    code {
      color: inherit;
      padding: 0;
      background: none;
      font-size: 0.8rem;
    }

    .hljs-comment,
    .hljs-quote {
      color: #616161;
    }

    .hljs-variable,
    .hljs-template-variable,
    .hljs-attribute,
    .hljs-tag,
    .hljs-name,
    .hljs-regexp,
    .hljs-link,
    .hljs-name,
    .hljs-selector-id,
    .hljs-selector-class {
      color: #F98181;
    }

    .hljs-number,
    .hljs-meta,
    .hljs-built_in,
    .hljs-builtin-name,
    .hljs-literal,
    .hljs-type,
    .hljs-params {
      color: #FBBC88;
    }

    .hljs-string,
    .hljs-symbol,
    .hljs-bullet {
      color: #B9F18D;
    }

    .hljs-title,
    .hljs-section {
      color: #FAF594;
    }

    .hljs-keyword,
    .hljs-selector-tag {
      color: #70CFF8;
    }

    .hljs-emphasis {
      font-style: italic;
    }

    .hljs-strong {
      font-weight: 700;
    }
  }
}

.wkrg-emote {
  font-size: 1.5rem;
}

.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: var(--md-sys-color-on-surface);
  opacity: 0.7;
  pointer-events: none;
  height: 0;
}
</style>
