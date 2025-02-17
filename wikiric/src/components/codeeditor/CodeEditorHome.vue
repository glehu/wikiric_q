<!--
  - Copyright (c) 2025.
  - Module CodeEditor.vue of wikiricQ or wikiric including wikiric and wikiricGo
  - themselves were, are and remain intellectual property of Luca Goldhausen.
  - You may use, edit and redistribute any of their parts as long as you give credit
  - in some visually accessible way.
  - (where one would expect it without having to be visible on a screen under heavy use by the viewer).
  -->
<template>
  <div class="w-screen hfull relative pb20
              flex column no-wrap items-center"
       style="font-family: 'JetBrains Mono', monospace !important;">
    <div class="wfull flex row no-wrap overflow-x-clip surface fontbold my1 py1">
      <template v-for="amt in 150" :key="amt">
        <p>&nbsp;***&nbsp;wkr&nbsp;IDE</p>
      </template>
    </div>
    <div id="wikiricEditorHeader"
         class="hfull wfull relative">
      <img src='../../assets/wikiric/wikiric-logo-big.webp' alt="Logo"
           class="pointer-events-none non-selectable z2 absolute"
           style="max-width: 380px; max-height: 380px; object-fit: contain">
    </div>
    <p class="text-size-[max(2rem,6dvw)] z2 mt2 mb0"
       style="font-weight: bolder">
      wikiric IDE
    </p>
    <div class="max-h-500px md:max-w-[80dvw] wfull hfull z2
                overflow-x-hidden overflow-y-auto rounded-xl">
      <codemirror
        disabled
        v-model="code"
        :style="{ width: '100%', height: '100%',
                fontFamily: 'JetBrains Mono, monospace',
                fontVariantLigatures: 'normal',
                fontSize: '0.9rem', fontWeight: 'bold'
      }"
        :extensions="extensions"
        @ready="handleReady"
      />
    </div>
    <div class="absolute h300 w300 tertiary rounded-full"
         style="transform: translateY(1000px)
                           translateX(calc(0px - 50vw - 150px))"/>
    <div class="absolute h300 w300 primary rounded-full"
         style="transform: translateY(600px)
                           translateX(calc(50vw + 150px))"/>
    <div class="surface px6 py4 rounded-xl z2 mt10
                md:max-w-[80dvw] wfull
                flex justify-center items-center gap-x-4 gap-y-2">
      <q-btn label="Try it out!" color="primary"
             class="fontbold px8 py4 rounded-xl"
             @click="$router.push('/code')"/>
      <p>Warning: Work in progress, unfinished product.</p>
    </div>
    <div class="surface px6 py4 rounded-xl z2 mt10
                md:max-w-[80dvw] wfull">
      <p class="text-size-[clamp(2rem,3vw,3rem)] text-start
                fontbold">
        Awesome Tech!
      </p>
      <p class="text-size-[clamp(1rem,1.5vw,2rem)] text-start mt4">
        A custom syntax rule engine allows this editor to understand
        any language, any syntax, as long as a rule can be written for it.
      </p>
      <p class="text-size-[clamp(1rem,1.5vw,2rem)] text-start mt4">
        Using incremental parsing, even huge documents will be easy to handle.
      </p>
      <p class="text-size-[clamp(1rem,1.5vw,2rem)] text-start mt4">
        <span class="markedView"><a href="https://codemirror.net/">CodeMirror</a></span>
        is the base editor used for this IDE, anything else,
        including the tinyPreC WASM pre-compiler, was written from scratch.
      </p>
      <p class="text-size-[clamp(2rem,3vw,3rem)] text-start
                fontbold mt10">
        We're (not) reinventing the wheel!
      </p>
      <p class="text-size-[clamp(1rem,1.5vw,2rem)] text-start mt4">
        Enjoy the new generation of Open Source code editors.
        <br>Don't miss out on the handy features that luckily
        are standard practice for all serious IDEs.
      </p>
      <p class="text-size-[clamp(1rem,1.5vw,2rem)] text-start
                fontbold mt10 mb2">
        >>> Code Completion & Templates
      </p>
      <div class="wfull p2 background rounded flex justify-center">
        <img src='../../assets/codeeditor/autocomplete.png'
             alt="Auto Complete Example"
             class="pointer-events-none non-selectable"
             style="max-width: 500px; object-fit: contain">
      </div>
      <p class="text-size-[clamp(1rem,1.5vw,2rem)] text-start
                fontbold mt10 mb2">
        >>> Smart Tooltips
      </p>
      <div class="wfull p2 background rounded flex justify-center">
        <img src='../../assets/codeeditor/tooltips.png'
             alt="Tooltip Example"
             class="pointer-events-none non-selectable"
             style="max-width: 500px; object-fit: contain">
      </div>
      <p class="text-size-[clamp(1rem,1.5vw,2rem)] text-start
                fontbold mt10 mb2">
        >>> Show Usages, Search & Replace
      </p>
      <div class="wfull p2 background rounded flex justify-center">
        <img src='../../assets/codeeditor/search.png'
             alt="Search Replace Example"
             class="pointer-events-none non-selectable"
             style="max-width: 500px; object-fit: contain">
      </div>
    </div>
  </div>
</template>

<script>
import { Codemirror } from 'vue-codemirror'
import { oneDark } from '@codemirror/theme-one-dark'
import { StateEffect, StateField } from '@codemirror/state'
import {
  keymap, hoverTooltip, Decoration, EditorView
} from '@codemirror/view'
import { useStore } from 'stores/wikistate'
import './wasm_exec'
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
      code: `" >>> wikiric Editor

proc Hello-World!

:procedure Hello-World!
var
  sMsg : string = 'Welcome to the wikiric Editor!'
beginproc
  sMsg : 'This Open Source Code Editor not only helps your productivity,'
  sMsg : '  it also helps you to understand the language you are using!'
  proc Show-Features(42)
endproc

:procedure Show-Features
par
  nFlagCool = number
var
  sMsg : string
beginproc
  journal 'log.txt' 'Get off my lawn!'

  sMsg : '###############################'
  sMsg : '###  Syntax Highlighting    ###'
  sMsg : '###############################'

  sMsg : 'You want it, you get it!'
  sMsg : 'This Editor features complete Syntax Highlighting for all types!'

  sMsg : '###############################'
  sMsg : '###  Context Understanding  ###'
  sMsg : '###############################'

  sMsg : 'This Editor knows what strings, numbers, functions etc. are.'
  sMsg : 'This means it will show you type check errors,'
  sMsg : '  even on function calls!'

  sMsg : '###############################'
  sMsg : '###  Smart Tooltips         ###'
  sMsg : '###############################'

  sMsg : 'Get information about the thing you are hovering over.'
  sMsg : 'Try it out on this page, too!'

  sMsg : '###############################'
  sMsg : '###  Code Completion        ###'
  sMsg : '###############################'
  journal 'log.txt' 'This one is nice!'

  sMsg : 'Automatically receive completion options while typing.'
  sMsg : 'Even whole code templates, e.g. loops and empty procedures!'

  sMsg : '###############################'
  sMsg : '###  Version Control Sys    ###'
  sMsg : '###############################'
  journal 'log.txt' 'Work in progress... hand on tight.'

  sMsg : 'Changes are stored as transactions.'
  sMsg : 'Never ever have troubles finding that one change that caused it all...'
endproc
`,
      handleReady: (payload) => {
        this.view = payload.view
        this.injectExtension(this.view, wordHover)
        setTimeout(() => {
          this.handleEditChange(this.code)
          setTimeout(() => {
            this.handleEditChange(this.code)
          }, 100)
        }, 100)
      },
      internal: new BroadcastChannel('wikiric_internal'),
      tokenList: []
    }
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

#wikiricEditorHeader {
  display: grid;
  height: 45vh;
  place-items: center;
}

#wikiricEditorHeader::before {
  animation: anim 30s infinite ease-in-out;
  border-radius: 30% 70% 53% 47% / 26% 46% 54% 74%;
  box-shadow: 0 -2vmin 4vmin LightPink inset,
  0 1vmin 4vmin MediumPurple inset,
  0 -2vmin 7vmin purple inset;
  content: "";
  filter: drop-shadow(0 0 3vmin Thistle) drop-shadow(0 5vmin 4vmin Orchid) drop-shadow(2vmin -2vmin 15vmin MediumSlateBlue) drop-shadow(0 0 7vmin MediumOrchid);
  height: 50vmin;
  position: absolute;
  width: 50vmin;
}

@keyframes anim {
  0%,
  100% {
    border-radius: 30% 70% 70% 30% / 30% 52% 48% 70%;
  }

  10% {
    border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%;
  }

  20% {
    border-radius: 67% 33% 47% 53% / 37% 20% 80% 63%;
  }

  30% {
    border-radius: 39% 61% 47% 53% / 37% 40% 60% 63%;
  }

  40% {
    border-radius: 39% 61% 82% 18% / 74% 40% 60% 26%;
  }

  50% {
    border-radius: 100%;
  }

  60% {
    border-radius: 50% 50% 53% 47% / 72% 69% 31% 28%;
  }

  70% {
    border-radius: 50% 50% 53% 47% / 26% 22% 78% 74%;
  }

  80% {
    border-radius: 50% 50% 53% 47% / 26% 69% 31% 74%;
  }

  90% {
    border-radius: 20% 80% 20% 80% / 20% 80% 20% 80%;
  }
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
