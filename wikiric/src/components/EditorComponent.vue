<template>
  <template v-if="editor">
    <div class="wfull surface rounded-2 overflow-hidden
                fmt_border">
      <menu-bar :editor="editor"/>
      <editor-content :editor="editor"
                      class="p3"/>
    </div>
  </template>
</template>

<script>
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
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
    }
  },
  emits: ['update:modelValue'],
  data () {
    return {
      editor: null
    }
  },
  watch: {
    modelValue (value) {
      // HTML
      const isSame = this.editor.getHTML() === value
      // JSON
      // const isSame = JSON.stringify(this.editor.getJSON()) === JSON.stringify(value)
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
    this.editor.destroy()
  },
  methods: {
    handleMounted: async function () {
      const custom = await dbGetData('emotes')
      let customEmotes = []
      if (custom != null) {
        customEmotes = Array.from(custom.map, ([name, value]) => (value))
      }
      this.editor = new Editor({
        editorProps: {
          attributes: {
            class: 'markedView'
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
          })
        ],
        content: this.modelValue,
        onUpdate: () => {
          this.$emit('update:modelValue', this.editor.getHTML())
        }
      })
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

  ul,
  ol {
    padding: 0 1rem;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
  }

  code {
    background-color: rgba(#616161, 0.1);
    color: #616161;
  }

  pre {
    background: #0D0D0D;
    border-radius: 0.5rem;
    color: #FFF;
    font-family: 'JetBrainsMono', monospace;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  mark {
    background-color: #FAF594;
  }

  img {
    height: auto;
    max-width: 100%;
  }

  hr {
    margin: 1rem 0;
  }

  blockquote {
    border-left: 2px solid rgba(#0D0D0D, 0.1);
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 2px solid rgba(#0D0D0D, 0.1);
    margin: 2rem 0;
  }

  ul[data-type="taskList"] {
    list-style: none;
    padding: 0;

    li {
      align-items: center;
      display: flex;

      > label {
        flex: 0 0 auto;
        margin-right: 0.5rem;
        user-select: none;
      }

      > div {
        flex: 1 1 auto;
      }
    }
  }
}

.wkrg-emote {
  font-size: 1.5rem;
}
</style>
