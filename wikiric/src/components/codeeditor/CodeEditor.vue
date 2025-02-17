<!--
  - Copyright (c) 2025.
  - Module CodeEditor.vue of wikiricQ or wikiric including wikiric and wikiricGo
  - themselves were, are and remain intellectual property of Luca Goldhausen.
  - You may use, edit and redistribute any of their parts as long as you give credit
  - in some visually accessible way.
  - (where one would expect it without having to be visible on a screen under heavy use by the viewer).
  -->
<template>
  <div class="w-screen h-screen absolute">
    <div class="h12 px4 flex row gap-2 items-center justify-between
                relative"
         style="font-family: 'JetBrains Mono', monospace;
                font-size: 0.8rem; font-weight: bolder">
      <div class="flex row items-center gap-2">
        <div>
          <p>Last Save: {{ lastSave }}</p>
          <p>{{ showChange }}{{ docName }}</p>
        </div>
      </div>
      <div class="flex row gap-2">
        <q-btn label="Save" icon="sym_o_save" dense no-caps
               @click="saveDocument"
               class="text-xs fontbold"/>
        <q-btn label="Compile" icon="sym_o_memory" dense no-caps
               class="text-xs fontbold"/>
        <q-btn label="Fmt" icon="sym_o_mop" dense no-caps
               class="text-xs fontbold"/>
      </div>
    </div>
    <codemirror
      v-model="code"
      placeholder="Code goes here..."
      :style="{ width: '100%', height: '100%',
                fontFamily: 'JetBrains Mono, monospace',
                fontVariantLigatures: 'normal',
                fontSize: '0.9rem', fontWeight: 'bold'
      }"
      :autofocus="true"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @ready="handleReady"
    />
  </div>
  <q-dialog v-model="searchAnything" class="z-max"
            style="background-color: transparent">
    <div ref="dialogSearchAnythingContainer"
         id="dialogSearchAnythingContainer"
         class="pt2 wfull
                fmt_border wfull
                fixed top-0 sm:top-[60px]"
         style="background-color: rgba(var(--rgb-sys-color-surface), 1);
                border-bottom: 2px solid var(--md-sys-color-primary) !important;
                font-family: 'JetBrains Mono', monospace !important;">
      <q-input
        for="searchAnythingCode"
        color="brand-p"
        label-color="brand-p"
        v-model="queryText"
        dense autocomplete="off"
        @update:model-value="processQuery"
        input-class="fontbold"
        class="text-subtitle1 px4">
        <template v-slot:prepend>
          <q-icon name="search" class=""/>
        </template>
      </q-input>
      <template v-if="searchMode === 'replace'">
        <div class="px4 pt2 pb4 mx3 mt3 mb1 text-sm surface-variant rounded
                    flex row no-wrap gap-4">
          <q-icon name="sym_o_edit" size="2rem"
                  style="color: var(--md-sys-color-tertiary)"/>
          <div class="flex-grow">
            <p class="pb2"
               style="color: var(--md-sys-color-tertiary)">
              Rename
              <span style="color: var(--md-sys-color-on-surface); font-style: italic">{{ queryText }}</span>
              and its usages to:
            </p>
            <q-input for="renameTokenCode"
                     color="brand-p"
                     label-color="brand-p"
                     input-style="border-bottom: 2px solid var(--md-sys-color-primary)"
                     v-model="replaceText" borderless dense
                     @keydown.enter="doRenameToken"/>
          </div>
        </div>
      </template>
      <div ref="seResults"
           class="max-h-[90dvh] overflow-y-auto p4"
           style="font-size: 14px; line-height: 18px">
        <p v-html="resultTxt"></p>
      </div>
      <q-card-actions align="right"
                      class="surface py2 px4 mt6 flex gap-6
                             fmt_border_top">
        <!--<q-btn flat label="Close" color="text-brand-p" v-close-popup/>-->
        <img src='../../assets/wikiric/wikiric-logo-big.webp' alt="Logo"
             class="mrauto pointer-events-none non-selectable"
             style="max-width: 22px; max-height: 22px; object-fit: contain">
        <div class="flex gap-2 items-center
                      pointer-events-none non-selectable">
            <span class="text-subtitle2">
              <template v-if="searchMode === 'search'">-/-</template>
              <template v-else-if="searchMode === 'replace'">Rename</template>
            </span>
          <div class="fmt_border rounded w5 h5
                        flex items-center justify-center">
            <q-icon name="keyboard_return"/>
          </div>
        </div>
        <div class="flex gap-2 items-center
                      pointer-events-none non-selectable">
            <span class="text-subtitle2">
              <template v-if="searchMode === 'search'">Close</template>
              <template v-else-if="searchMode === 'replace'">Cancel</template>
            </span>
          <div class="fmt_border rounded w7 h5
                        flex items-center justify-center">
              <span class="text-xs fontbold">
                ESC
              </span>
          </div>
        </div>
      </q-card-actions>
    </div>
  </q-dialog>
</template>

<script>
import { Codemirror } from 'vue-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { StateEffect, StateField } from '@codemirror/state'
import {
  keymap, hoverTooltip, Decoration, EditorView
} from '@codemirror/view'
import {
  autocompletion
} from '@codemirror/autocomplete'
import { useStore } from 'stores/wikistate'
import './wasm_exec'
import { debounce } from 'quasar'
import { DateTime } from 'luxon'
import { SearchCursor } from '@codemirror/search'

// #######################################################################
// *** VUE Internal ***
// #######################################################################
const tokenMap = new Map()
export default {
  name: 'CodeEditor',
  components: { Codemirror },
  data () {
    return {
      store: useStore(),
      extensions: [
        oneDark
      ],
      view: null,
      code: `:procedure Sample
var
  nZaehler : number
  nMax     : number
  sStr     : string
beginproc
  nMax = xml.structcount('test')
  xfor nZaehler = 0 to nMax
    sStr : xml.getvalue('val')
    xml.nextstruct('test')
  next nZaehler
endproc
`,
      handleReady: (payload) => {
        this.view = payload.view
        this.injectExtension(this.view, autocompletion({
          override: [this.myCompletions]
        }))
        this.injectExtension(this.view, wordHover)
        this.injectExtension(this.view, underlineKeymap)
        this.injectExtension(this.view, highlightKeymap)
        this.injectExtension(this.view, EditorView.updateListener.of(
          (v) => {
            this.evalDocChange(v)
          }))
        this.injectExtension(this.view, keymap.of([{
          key: 'Mod-Shift-f',
          preventDefault: true,
          run: this.showSearchAnything
        }]))
        this.handleEditChange(this.code)
      },
      internal: new BroadcastChannel('wikiric_internal'),
      tokenList: [],
      docName: 'Untitled',
      hasChanged: false,
      lastSave: 'None',
      searchAnything: false,
      searchMode: 'search',
      queryText: '',
      resultTxt: '',
      replaceText: ''
    }
  },
  created () {
    this.handleEditChange = debounce(this.handleEditChange, 750)
  },
  mounted () {
    this.initFunction()
  },
  computed: {
    showChange () {
      if (this.hasChanged) {
        return '*'
      }
      return ''
    }
  },
  methods: {
    initFunction: function () {
      this.internal.onmessage = event => {
        this.handleCodeEditorInternal(event.data)
      }
      this.setUpPReCWorker()
    },
    setUpPReCWorker: function () {
      // this.cWorker = new Worker(
      //   new URL('codeWorker.js', import.meta.url),
      //   { type: 'module' })
      // this.cWorker.onmessage = e => {
      //   console.log(e.data)
      // }
      // this.cWorker.postMessage({
      //   msg: '[c:init]',
      //   tiny: true
      // })
    },
    handleEditChange: async function (txt) {
      return new Promise((resolve) => {
        const resp = window.wPreCompile(txt, true)
        this.tokenList = []
        let tk
        for (let i = 0; i < resp.tokens; i++) {
          tk = window.wGetToken(i, true)
          this.tokenList.push(tk)
          tokenMap.set(tk.str, tk)
        }
        this.hasChanged = true
        this.clr()
        resolve()
      })
    },
    myCompletions: function (context) {
      const word = context.matchBefore(/\w*/)
      if (word.from === word.to && !context.explicit) {
        return null
      }
      return {
        from: word.from,
        options: [
          {
            label: 'proc',
            type: 'keyword'
          },
          {
            label: 'exitproc',
            type: 'keyword'
          },
          {
            label: 'string',
            type: 'keyword'
          },
          {
            label: 'number',
            type: 'keyword'
          },
          {
            label: 'journal',
            type: 'text',
            apply: 'journal \'logfile.txt\' \'content\' ',
            detail: '| Template'
          },
          {
            label: 'journal',
            type: 'keyword'
          },
          {
            label: 'xfor',
            type: 'text',
            apply: 'xfor nZaehler = 0 to nMax\n  \nnext nZaehler ',
            detail: '| Template'
          },
          {
            label: 'xfor',
            type: 'keyword'
          },
          {
            label: 'New Empty Procedure',
            type: 'text',
            apply: ':procedure Sample\nbeginproc\nendproc ',
            detail: '| Template'
          },
          {
            label: 'magic',
            type: 'text',
            apply: '⠁⭒*.✩.*⭒⠁',
            detail: 'macro'
          }
        ]
      }
    },
    injectExtension: function (view, extension) {
      view.dispatch({
        effects: StateEffect.appendConfig.of(extension)
      })
    },
    clr: function () {
      this.highlightTokens(this.view)
    },
    highlightTokens: function (view) {
      const effects = []
      effects.push(removeHighlight.of({
        from: 0,
        to: 1
      }))
      let amt = 0
      for (const tk of this.tokenList) {
        if (tk.len <= 0) {
          continue
        }
        if (!tk.v) {
          // Error
          effects.push(addHighlightError.of({
            from: tk.p,
            to: (tk.p + tk.len)
          }))
          amt += 1
          continue
        }
        switch (tk.typ) {
          case 5:
            // Number
            effects.push(addHighlightNumber.of({
              from: tk.p,
              to: (tk.p + tk.len)
            }))
            amt += 1
            break
          case 6:
            // String
            effects.push(addHighlightString.of({
              from: tk.p,
              to: (tk.p + tk.len)
            }))
            amt += 1
            break
          case 10:
          case 11:
            // Function
            effects.push(addHighlightFunction.of({
              from: tk.p,
              to: (tk.p + tk.len)
            }))
            amt += 1
            break
          case 12:
          case 13:
          case 14:
          case 15:
            // Keyword
            effects.push(addHighlightKeyword.of({
              from: tk.p,
              to: (tk.p + tk.len)
            }))
            amt += 1
            break
          default:
            // effects.push(addHighlightComment.of({
            //   from: tk.p,
            //   to: (tk.p + tk.len)
            // }))
            // amt += 1
            break
        }
      }
      if (amt < 1) {
        return false
      }
      if (!view.state.field(highlightField, false)) {
        effects.push(StateEffect.appendConfig.of([highlightField,
          highlightTheme]))
      }
      view.dispatch({ effects })
      return true
    },
    saveDocument: function () {
      this.lastSave = DateTime.now().toHTTP()
      this.hasChanged = false
    },
    renameToken: function (query, newText) {
      if (!newText || newText === '') {
        this.queryText = query
        this.replaceText = query
        this.searchAnything = true
        this.searchMode = 'replace'
        setTimeout(() => {
          const elem = document.getElementById('renameTokenCode')
          if (elem) {
            elem.focus()
            elem.select()
          }
        }, 300)
        this.processQuery()
        return
      }
      this._renameToken(query, newText, 0)
    },
    /**
     *
     * @param {String} query
     * @param {String} newText
     * @param {Number} skip
     * @private
     */
    _renameToken: function (query, newText, skip) {
      const sc = new SearchCursor(this.view.state.doc, query, 0, this.view.state.doc.length - 1)
      for (let i = 0; i < skip + 1; i++) {
        sc.next()
        if (sc.done) {
          return
        }
      }
      this.view.dispatch({
        changes: {
          from: sc.value.from,
          to: sc.value.to,
          insert: newText
        }
      })
      // Are we replacing with something similar?
      // If the new value contains the old value, we need to skip on the next run
      if (query.includes(newText)) {
        this._renameToken(query, newText, skip + 1)
      } else {
        this._renameToken(query, newText, skip)
      }
    },
    searchToken: function (query) {
      this.queryText = query
      this.searchAnything = true
      this.searchMode = 'search'
      setTimeout(() => {
        const elem = document.getElementById('renameTokenCode')
        if (elem) {
          elem.focus()
          elem.select()
        }
      }, 300)
      this.processQuery()
    },
    handleCodeEditorInternal: function (e) {
      if (e.app !== 'codeeditor') return
      switch (e.type) {
        case 'replace':
          this.renameToken(e.query)
          break
        case 'search':
          this.searchToken(e.query)
          break
      }
    },
    showSearchAnything: function () {
      if (this.view.state.selection.ranges.length > 0) {
        if (this.view.state.selection.ranges[0].from > 0) {
          const pos = this.view.state.selection.ranges[0].from
          const {
            from,
            to,
            text
          } = this.view.state.doc.lineAt(pos)
          let start = pos, end = pos
          while (start > from && /\w/.test(text[start - from - 1])) {
            start--
          }
          while (end < to && /\w/.test(text[end - from])) {
            end++
          }
          this.searchMode = 'search'
          this.queryText = text.slice(start - from, end - from)
          this.replaceText = ''
          this.processQuery()
        }
      }
      this.searchAnything = !this.searchAnything
      if (this.searchMode === 'search') {
        setTimeout(() => {
          const elem = document.getElementById('searchAnythingCode')
          if (elem) {
            elem.focus()
            elem.select()
          }
        }, 300)
      }
    },
    processQuery: function (query) {
      if (!query || query === '') {
        query = this.queryText
      }
      if (query.trim() === '') {
        this.queryText = ''
        return
      }
      let str = '<div class="flex row no-wrap">'
      let tmp = '<p>'
      let tmp2
      const lc = query.toLowerCase()
      for (let i = 0; i < this.tokenList.length; i++) {
        if (this.tokenList[i].str.toLowerCase().includes(lc)) {
          const {
            from,
            to,
            text
          } = this.view.state.doc.lineAt(this.tokenList[i].p)
          if (from !== to) {
            tmp2 = text.toString().replaceAll(
              ' ', '&nbsp;')
          } else {
            tmp2 = ''
          }
          tmp += `${this.tokenList[i].l}:${this.tokenList[i].pv} ${tmp2}<br>`
        }
      }
      tmp += '</p>'
      str += tmp
      const resp = window.wGetTokenUsages(query)
      if (!resp || !resp.success) {
        str += '</div>'
        this.resultTxt = str
        return
      }
      delete resp.success
      const map = new Map(Object.entries(resp))
      let hasAnnounced = false
      tmp = ''
      map.forEach((value, key) => {
        if (key !== 'success') {
          if (!hasAnnounced) {
            hasAnnounced = true
            tmp += `<div style="border-left: 1px solid var(--md-sys-color-outline-variant);
padding-left: 1rem; margin-left: 1rem" class="flex-grow">
<div class="fontbold"><p style="padding-bottom: 10px">Usages:</p>`
          }
          tmp += `<p style="padding: 10px 20px 10px 20px;
width: 100%;background-color: var(--md-sys-color-background);
color: var(--md-sys-color-on-background)">
${value.replaceAll('\n', '<br>')
          .replaceAll(' ', '&nbsp;')}</p>`
        }
      })
      tmp += '</div></div>'
      str += tmp
      str += '</div>'
      this.resultTxt = str
    },
    doRenameToken: function () {
      this.renameToken(this.queryText, this.replaceText)
      this.searchAnything = false
    },
    /**
     *
     * @param {ViewUpdate} v
     */
    evalDocChange: function (v) {
      console.log(v)
      if (!v.docChanged) {
        return
      }
      // Tell tinyPreC about the editor changes

      // Run pre-compilation and update syntax highlighting
      this.handleEditChange(this.code)
    }
  }
}

// #######################################################################
// *** Tooltip ***
// #######################################################################
export const wordHover = hoverTooltip((view, pos, side) => {
  const {
    from,
    to,
    text
  } = view.state.doc.lineAt(pos)
  let start = pos, end = pos
  while (start > from && /[^()[\]{}\s.,'"]/.test(text[start - from - 1])) {
    start--
  }
  while (end < to && /[^()[\]{}\s.,'"]/.test(text[end - from])) {
    end++
  }
  if ((start === pos && side < 0) || (end === pos && side > 0)) {
    return null
  }
  return {
    pos: start,
    end,
    above: false,
    create (view) {
      const dom = document.createElement('div')
      // Show the targeted Word/Token
      const token = document.createElement('div')
      token.style.padding = '4px 8px 4px 8px'
      token.style.fontSize = '1rem'
      token.style.fontFamily = 'JetBrains Mono, monospace'
      const tkString = text.slice(start - from, end - from)
      token.textContent = tkString
      dom.appendChild(token)
      if (tokenMap.has(tkString)) {
        // Show detailed information about the Token
        const info = document.createElement('div')
        info.style.borderTop = '1px solid var(--md-sys-color-outline-variant)'
        info.style.padding = '4px 8px 4px 8px'
        info.style.fontSize = '0.8rem'
        info.style.fontFamily = 'JetBrains Mono, monospace'
        const ref = tokenMap.get(tkString)
        let infString = `Type: ${ref.typName}`
        if (ref.sTypName !== '') {
          infString += ` ${ref.sTypName}`
        }
        info.textContent = infString
        dom.appendChild(info)
        // Buttons!
        const buttons = document.createElement('div')
        buttons.style.display = 'flex'
        buttons.style.flexDirection = 'row'
        buttons.style.gap = '0.25rem'
        buttons.style.padding = '16px 8px 4px 8px'
        buttons.style.fontFamily = 'JetBrains Mono, monospace'
        // -> Jump to source
        let btn = document.createElement('button')
        btn.style.fontSize = '0.8rem'
        btn.style.fontWeight = 'bold'
        btn.style.color = 'var(--md-sys-color-on-surface)'
        btn.style.backgroundColor = 'var(--md-sys-color-surface)'
        btn.textContent = 'View source'
        buttons.appendChild(btn)
        // -> Usages
        btn = document.createElement('button')
        btn.style.fontSize = '0.8rem'
        btn.style.fontWeight = 'bold'
        btn.style.color = 'var(--md-sys-color-on-surface)'
        btn.style.backgroundColor = 'var(--md-sys-color-surface)'
        btn.textContent = 'Usages'
        btn.onclick = function () {
          const bc = new BroadcastChannel('wikiric_internal')
          bc.postMessage({
            app: 'codeeditor',
            type: 'search',
            query: tkString.trim()
          })
        }
        buttons.appendChild(btn)
        // -> Rename
        btn = document.createElement('button')
        btn.style.fontSize = '0.8rem'
        btn.style.fontWeight = 'bold'
        btn.style.color = 'var(--md-sys-color-on-surface)'
        btn.style.backgroundColor = 'var(--md-sys-color-surface)'
        btn.textContent = 'Rename'
        btn.onclick = function () {
          const bc = new BroadcastChannel('wikiric_internal')
          bc.postMessage({
            app: 'codeeditor',
            type: 'replace',
            query: tkString.trim()
          })
        }
        buttons.appendChild(btn)
        dom.appendChild(buttons)
      }
      return { dom }
    }
  }
})

// #######################################################################
// *** Underline ***
// #######################################################################
const addUnderline = StateEffect.define({
  map: ({
          from,
          to
        }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to)
  })
})
const underlineField = StateField.define({
  create () {
    return Decoration.none
  },
  update (underlines, tr) {
    underlines = underlines.map(tr.changes)
    for (const e of tr.effects) {
      if (e.is(addUnderline)) {
        underlines = underlines.update({
          add: [underlineMark.range(e.value.from, e.value.to)]
        })
      }
    }
    return underlines
  },
  provide: f => EditorView.decorations.from(f)
})
const underlineMark = Decoration.mark({ class: 'cm-underline' })
const underlineTheme = EditorView.baseTheme({
  '.cm-underline': { textDecoration: 'underline 3px red' }
})

// #######################################################################
// *** Underline Keymap ***
// #######################################################################
export function underlineSelection (view) {
  const effects = view.state.selection.ranges
  .filter(r => !r.empty)
  .map(({
          from,
          to
        }) => addUnderline.of({
    from,
    to
  }))
  if (!effects.length) {
    return false
  }
  if (!view.state.field(underlineField, false)) {
    effects.push(StateEffect.appendConfig.of([underlineField,
      underlineTheme]))
  }
  view.dispatch({ effects })
  return true
}

export const underlineKeymap = keymap.of([{
  key: 'Mod-h',
  preventDefault: true,
  run: underlineSelection
}])

// #######################################################################
// *** Highlight ***
// #######################################################################
const removeHighlight = StateEffect.define({
  map: ({
          from,
          to
        }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to)
  })
})
const highlightField = StateField.define({
  create () {
    return Decoration.none
  },
  update (highlights, tr) {
    highlights = highlights.map(tr.changes)
    // *** Update Token coloring
    for (const e of tr.effects) {
      if (e.is(addHighlightError)) {
        highlights = highlights.update({
          add: [highlightMark.range(e.value.from, e.value.to)]
        })
      } else if (e.is(addHighlightNumber)) {
        highlights = highlights.update({
          add: [hlNumberMark.range(e.value.from, e.value.to)]
        })
      } else if (e.is(addHighlightString)) {
        highlights = highlights.update({
          add: [hlStringMark.range(e.value.from, e.value.to)]
        })
      } else if (e.is(addHighlightFunction)) {
        highlights = highlights.update({
          add: [hlFunctionMark.range(e.value.from, e.value.to)]
        })
      } else if (e.is(addHighlightKeyword)) {
        highlights = highlights.update({
          add: [hlKeywordMark.range(e.value.from, e.value.to)]
        })
      } else if (e.is(addHighlightComment)) {
        highlights = highlights.update({
          add: [hlCommentMark.range(e.value.from, e.value.to)]
        })
      } else if (e.is(removeHighlight)) {
        highlights = highlights.update({
          filter: (f, t, value) => value.class === 'XYZ'
        })
      }
    }
    return highlights
  },
  provide: f => EditorView.decorations.from(f)
})
// #######################################################################
// *** ERROR
// #######################################################################
const addHighlightError = StateEffect.define({
  map: ({
          from,
          to
        }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to)
  })
})
const highlightMark = Decoration.mark({ class: 'cm-hl-error' })
const highlightTheme = EditorView.baseTheme({
  '.cm-hl-error': { color: 'rgb(220, 100, 100)' }
})
// #######################################################################
// *** NUMBER
// #######################################################################
const addHighlightNumber = StateEffect.define({
  map: ({
          from,
          to
        }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to)
  })
})
const hlNumberMark = Decoration.mark({ class: 'cm-hl-number' })
// const clrNumber = EditorView.baseTheme({
//   '.cm-hl-number': { color: 'rgb(80, 170, 170)' }
// })
// #######################################################################
// *** STRING
// #######################################################################
const addHighlightString = StateEffect.define({
  map: ({
          from,
          to
        }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to)
  })
})
const hlStringMark = Decoration.mark({ class: 'cm-hl-string' })
// const clrString = EditorView.baseTheme({
//   '.cm-hl-string': { color: 'rgb(120, 170, 120)' }
// })
// #######################################################################
// *** KEYWORD
// #######################################################################
const addHighlightKeyword = StateEffect.define({
  map: ({
          from,
          to
        }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to)
  })
})
const hlKeywordMark = Decoration.mark({ class: 'cm-hl-keyword' })
// const clrKeyword = EditorView.baseTheme({
//   '.cm-hl-keyword': { color: 'rgb(180, 130, 100)' }
// })
// #######################################################################
// *** FUNCTION
// #######################################################################
const addHighlightFunction = StateEffect.define({
  map: ({
          from,
          to
        }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to)
  })
})
const hlFunctionMark = Decoration.mark({ class: 'cm-hl-function' })
// const clrFunction = EditorView.baseTheme({
//   '.cm-hl-function': { color: 'rgb(100, 150, 220)' }
// })
// #######################################################################
// *** COMMENTS
// #######################################################################
const addHighlightComment = StateEffect.define({
  map: ({
          from,
          to
        }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to)
  })
})
const hlCommentMark = Decoration.mark({ class: 'cm-hl-comment' })
// const clrComment = EditorView.baseTheme({
//   '.cm-hl-comment': { color: 'rgb(132, 132, 132)' }
// })

// #######################################################################
// *** Highlight Keymap ***
// #######################################################################
export function highlightSelection (view) {
  const effects = view.state.selection.ranges
  .filter(r => !r.empty)
  .map(({
          from,
          to
        }) => addHighlightError.of({
    from,
    to
  }))
  if (!effects.length) {
    return false
  }
  if (!view.state.field(highlightField, false)) {
    effects.push(StateEffect.appendConfig.of([highlightField,
      highlightTheme]))
  }
  view.dispatch({ effects })
  return true
}

export const highlightKeymap = keymap.of([{
  key: 'Mod-j',
  preventDefault: true,
  run: highlightSelection
}])

// #######################################################################
// *** Web Assembly ***
// #######################################################################
if (!WebAssembly.instantiateStreaming) { // polyfill
  WebAssembly.instantiateStreaming = async (resp, importObject) => {
    const source = await (await resp).arrayBuffer()
    return await WebAssembly.instantiate(source, importObject)
  }
}
const go = new global.Go()
let mod, inst
WebAssembly.instantiateStreaming(fetch('./main.wasm'),
  go.importObject).then((result) => {
  mod = result.module
  inst = result.instance
  go.run(inst)
  WebAssembly.instantiate(mod, go.importObject) // reset instance
})
</script>

<style>

.cm-line * {
  font-family: 'JetBrains Mono', monospace !important;
  font-variant-ligatures: normal !important;
}

@media (min-width: 640px) {
  #dialogSearchAnythingContainer {
    max-width: 50rem !important;
  }
}

.cm-hl-error {
  color: rgb(220, 100, 100);
}

.cm-hl-number {
  color: rgb(80, 170, 170);
}

.cm-hl-string {
  color: rgb(120, 170, 120);
}

.cm-hl-function {
  color: rgb(100, 150, 220);
}

.cm-hl-keyword {
  color: rgb(180, 130, 100);
}

.cm-hl-comment {
  color: rgb(132, 132, 132);
}

</style>
