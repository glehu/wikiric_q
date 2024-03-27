<template>
  <div class="flex items-center p1">
    <template v-for="(item, index) in items">
      <div class="divider" v-if="item.type === 'divider'" :key="`divider${index}`"/>
      <menu-item v-else :key="index" v-bind="item"/>
    </template>
  </div>
</template>

<script>
import MenuItem from './MenuItem.vue'

export default {
  components: {
    MenuItem
  },
  props: {
    editor: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
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
