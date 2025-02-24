<template>
  <div class="flex items-center p1 <sm:hidden">
    <template v-for="(item, index) in items">
      <div class="divider" v-if="item.type === 'divider'" :key="`divider${index}`"/>
      <menu-item v-else :key="index" v-bind="item"/>
    </template>
  </div>
  <EditorLinkWizard :is-open="showLinkWiz"
                    :chat-id="chatId"
                    @close="showLinkWiz = false"
                    @wisdom="handleLinkWisdom"/>
</template>

<script>
import MenuItem from './MenuItem.vue'
import EditorLinkWizard from 'components/EditorLinkWizard.vue'

export default {
  components: {
    EditorLinkWizard,
    MenuItem
  },
  props: {
    editor: {
      type: Object,
      required: true
    },
    chatId: {
      type: String,
      default: null,
      required: false
    }
  },
  data () {
    return {
      showLinkWiz: false,
      items: [
        {
          icon: 'sym_o_format_bold',
          title: 'Bold',
          action: () => this.editor.chain().focus().toggleBold().run(),
          isActive: () => this.editor.isActive('bold')
        },
        {
          icon: 'sym_o_format_italic',
          title: 'Italic',
          action: () => this.editor.chain().focus().toggleItalic().run(),
          isActive: () => this.editor.isActive('italic')
        },
        {
          icon: 'sym_o_format_strikethrough',
          title: 'Strike',
          action: () => this.editor.chain().focus().toggleStrike().run(),
          isActive: () => this.editor.isActive('strike')
        },
        {
          type: 'divider'
        },
        {
          icon: 'sym_o_format_h4',
          title: 'Heading 4',
          action: () => this.editor.chain().focus().toggleHeading({ level: 4 }).run(),
          isActive: () => this.editor.isActive('heading', { level: 4 })
        },
        {
          icon: 'sym_o_format_h5',
          title: 'Heading 5',
          action: () => this.editor.chain().focus().toggleHeading({ level: 5 }).run(),
          isActive: () => this.editor.isActive('heading', { level: 5 })
        },
        {
          icon: 'sym_o_format_paragraph',
          title: 'Paragraph',
          action: () => this.editor.chain().focus().setParagraph().run(),
          isActive: () => this.editor.isActive('paragraph')
        },
        {
          icon: 'sym_o_format_list_bulleted',
          title: 'Bullet List',
          action: () => this.editor.chain().focus().toggleBulletList().run(),
          isActive: () => this.editor.isActive('bulletList')
        },
        {
          icon: 'sym_o_format_list_numbered',
          title: 'Ordered List',
          action: () => this.editor.chain().focus().toggleOrderedList().run(),
          isActive: () => this.editor.isActive('orderedList')
        },
        {
          icon: 'sym_o_code',
          title: 'Code Block',
          action: () => this.editor.chain().focus().toggleCodeBlock().run(),
          isActive: () => this.editor.isActive('codeBlock')
        },
        {
          icon: 'sym_o_format_quote',
          title: 'Blockquote',
          action: () => this.editor.chain().focus().toggleBlockquote().run(),
          isActive: () => this.editor.isActive('blockquote')
        },
        {
          icon: 'sym_o_add_link',
          title: 'Link',
          action: () => {
            this.showLinkWiz = true
          },
          isActive: () => false
        },
        {
          type: 'divider'
        },
        {
          icon: 'sym_o_table',
          title: 'Table',
          action: () => this.editor.chain().focus().insertTable({
            rows: 2,
            cols: 2,
            withHeaderRow: true
          }).run(),
          isActive: () => this.editor.isActive('table')
        },
        {
          icon: 'sym_o_add_row_below',
          title: 'Add Row',
          action: () => this.editor.chain().focus().addRowAfter().run(),
          isActive: () => false,
          show: () => this.editor.isActive('table')
        },
        {
          icon: 'sym_o_delete',
          title: 'Delete Row',
          action: () => this.editor.chain().focus().deleteRow().run(),
          isActive: () => false,
          show: () => this.editor.isActive('table')
        },
        {
          icon: 'sym_o_add_column_right',
          title: 'Add Column',
          action: () => this.editor.chain().focus().addColumnAfter().run(),
          isActive: () => false,
          show: () => this.editor.isActive('table')
        },
        {
          icon: 'sym_o_delete',
          title: 'Remove Column',
          action: () => this.editor.chain().focus().deleteColumn().run(),
          isActive: () => false,
          show: () => this.editor.isActive('table')
        },
        {
          type: 'divider'
        },
        {
          icon: 'sym_o_format_clear',
          title: 'Clear Format',
          action: () => this.editor.chain()
          .focus()
          .clearNodes()
          .unsetAllMarks()
          .run()
        }
      ]
    }
  },
  methods: {
    handleLinkWisdom: function (uid) {
      if (!uid) {
        return
      }
      const url = 'https://wikiric.xyz/#/wisdom?id=' + uid.trim()
      this.editor.commands.setLink({ href: url })
    }
  }
}
</script>

<style lang="scss">
.divider {
  background-color: var(--md-sys-color-outline-variant);
  height: 1rem;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  width: 1px;
}
</style>
