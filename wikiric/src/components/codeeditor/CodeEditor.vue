<!--
  - Copyright (c) 2025.
  - Module CodeEditor.vue of wikiricQ or wikiric including wikiric and wikiricGo
  - themselves were, are and remain intellectual property of Luca Goldhausen.
  - You may use, edit and redistribute any of their parts as long as you give credit
  - in some visually accessible way.
  - (where one would expect it without having to be visible on a screen under heavy use by the viewer).
  -->
<template>
  <div class="z1 w-screen h-screen absolute">
    <div class="z3 fixed right-0 top-[calc(2*50px)]
                flex row justify-end pr3 gap-2">
      <div v-if="errors > 0"
           class="background rounded-md px2 py1 fontbold
                  flex items-center no-wrap">
        <p class="mr2 text-sm">{{ errors }}</p>
        <q-icon name="sym_o_error" size="1.4rem"
                style="color: rgb(220, 100, 100)">
          <q-tooltip>
            <p class="text-xs fontbold">
              {{ errors }}&nbsp;Errors&nbsp;found!
            </p>
          </q-tooltip>
        </q-icon>
      </div>
      <div class="background rounded-md px2 py1 fontbold
                  flex items-center no-wrap">
        <template v-if="warnings > 0">
          <p class="mr2 text-sm">{{ warnings }}</p>
          <q-icon name="sym_o_warning" size="1.4rem"
                  style="color: #ffb648">
            <q-tooltip>
              <p class="text-xs fontbold">
                {{ warnings }}&nbsp;Warnings&nbsp;found!
              </p>
            </q-tooltip>
          </q-icon>
        </template>
        <template v-else>
          <q-icon name="sym_o_done_outline" size="1.4rem"
                  style="color: #06a386">
            <q-tooltip>
              <p class="text-xs fontbold">
                No&nbsp;Warnings
              </p>
            </q-tooltip>
          </q-icon>
        </template>
      </div>
    </div>
    <q-splitter
      v-model="horiSplitter"
      :separator-style="{backgroundColor: 'var(--md-sys-color-outline-variant)'}"
      class="z1 wfull hfull overflow-hidden fixed"
      style="max-height: calc(100dvh - var(--h_nav));
             max-width: 100dvw;
             top: calc(var(--h_nav))">
      <template v-slot:before>
        <div class="surface-variant hfull wfull flex row no-wrap"
             style="max-height: calc(100dvh - var(--h_nav)); overflow-y: auto">
          <div class="hfull w-[40px] fmt_border_right flex column no-wrap
                      items-center justify-end pb2 gap-1 fixed"
               style="max-height: calc(100dvh - var(--h_nav))">
            <q-tabs class="text-subtitle2 no-wrap wfull"
                    v-model="leftTab"
                    dense no-caps vertical switch-indicator
                    active-class="surface fmt_border_bottom fmt_border_top">
              <q-tab name="files" icon="folder"/>
              <q-tab name="compare" icon="compare_arrows" disable/>
              <q-tab name="settings" icon="sym_o_settings" disable/>
            </q-tabs>
            <q-btn icon="sym_o_bookmarks" dense square unelevated size="0.9rem" disable
                   class="w-[39px] h-[40px] flex items-center justify-center"/>
            <q-btn icon="sym_o_search" dense square unelevated size="0.9rem"
                   class="w-[39px] h-[40px] flex items-center justify-center" @click="showSearchAnything"/>
            <q-btn icon="sym_o_terminal" dense square unelevated size="0.9rem"
                   class="w-[39px] h-[40px] flex items-center justify-center" @click="toggleTerminal"
                   :class="{ surface: vertSplitter < 95, big_border_left: vertSplitter < 95 }"/>
            <q-btn icon="sym_o_wifi_off" dense square unelevated size="0.8rem"
                   class="w-[39px] h-[40px] flex items-center justify-center" disable/>
          </div>
          <div class="flex-grow hfull pl-[40px]">
            <div class="flex column gap-1.5 px3 pt2 pb3
                        wfull fmt_border_bottom">
              <q-btn label="Save" icon="sym_o_save" dense no-caps unelevated
                     @click="saveDocument"
                     class="fontbold wfull" size="0.8rem" align="left"/>
              <q-btn label="Compile" icon="sym_o_memory" dense no-caps unelevated
                     disable
                     class="fontbold wfull" size="0.8rem" align="left"/>
              <q-btn label="Fmt" icon="sym_o_mop" dense no-caps unelevated
                     disable
                     class="fontbold wfull" size="0.8rem" align="left"/>
            </div>
            <div class="px4 pt2 pb10 wfull hfull whitespace-nowrap">
              <q-input v-model="treeQuery"
                       class="rounded-md"
                       label="Search Files"
                       label-color="brand-p"
                       dense borderless>
                <template v-slot:before>
                  <q-icon name="search"/>
                </template>
                <template v-slot:append>
                  <q-icon v-if="treeQuery !== ''" name="clear" class="cursor-pointer" @click="resetFilter"/>
                </template>
              </q-input>
              <p class="fontbold text-subtitle2 mt2 mb2 pointer-events-none">
                Recent Files – {{ cacheTree[0].children.length }}
              </p>
              <q-tree
                :nodes="cacheTree"
                :filter="treeQuery"
                v-model:selected="selectedCache"
                selected-color="brand-p"
                class="text-subtitle2"
                dense
                node-key="label"
              />
              <p class="fontbold text-subtitle2 mt4 mb2 pointer-events-none">
                Project
              </p>
              <q-tree
                :nodes="projectTree"
                :filter="treeQuery"
                v-model:selected="selected"
                selected-color="brand-p"
                class="text-subtitle2"
                dense default-expand-all
                node-key="label"
              />
            </div>
          </div>
        </div>
      </template>
      <template v-slot:after>
        <q-tabs class="z2 text-subtitle2 no-wrap fmt_border_bottom"
                style="height: 40px !important;"
                v-model="tab"
                dense no-caps switch-indicator
                active-class="background"
                align="left">
          <q-btn-dropdown auto-close flat
                          menu-self="top left"
                          menu-anchor="bottom left"
                          content-class="surface-variant pb2
                                         shadow-none rounded-0
                                         fmt_border_top
                                         fmt_border_right
                                         fmt_border_bottom">
            <template v-slot:label>
              <q-icon name="sym_o_menu"/>
            </template>
            <q-list class="on-background-text" dense>
              <q-item>
                <q-item-section>
                  <q-item-label caption lines="2">
                    <span class="fontbold">Editor</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable disable>
                <q-item-section>
                  <q-item-label lines="2">
                    <q-icon name="sym_o_question_mark" size="1.2rem"/>
                    Help Center
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable disable>
                <q-item-section>
                  <q-item-label lines="2">
                    <q-icon name="sym_o_settings" size="1.2rem"/>
                    Preferences
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item clickable @click="$router.push('/redir?redirect=/code')">
                <q-item-section>
                  <q-item-label lines="2">
                    <q-icon name="sym_o_restart_alt" size="1.2rem"/>
                    Restart IDE
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label caption lines="2">
                    <span class="fontbold">Project</span>
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
            <q-item clickable disable>
              <q-item-section>
                <q-item-label lines="2">
                  <q-icon name="sym_o_add" size="1.2rem"/>
                  New Project
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-btn-dropdown>
          <template v-for="t in tabs" :key="t">
            <q-tab :name="t.docName"
                   :label="t.docName"
                   class="no-wrap">
              <q-menu touch-position context-menu auto-close
                      class="surface-variant
                             fmt_border
                             shadow-none rounded-0">
                <q-list class="on-background-text text-sm" dense>
                  <q-item clickable disable>
                    <q-item-section>
                      <q-item-label lines="2">
                        <q-icon name="sym_o_edit_note" size="1.2rem"/>
                        Rename
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable disable>
                    <q-item-section>
                      <q-item-label lines="2">
                        <q-icon name="sym_o_delete" size="1.2rem"/>
                        Delete
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-tab>
          </template>
          <q-btn icon="sym_o_add" class="w-10 hfull"
                 @click="createNewFile"
                 dense no-caps unelevated square/>
        </q-tabs>
        <q-splitter
          v-model="vertSplitter"
          :limits="[ 1, 99 ]"
          :separator-style="{backgroundColor: 'var(--md-sys-color-outline-variant)'}"
          horizontal
          class="z1 wfull overflow-hidden fixed"
          style="max-height: calc(100dvh - 40px - var(--h_nav));
                 top: calc(40px + var(--h_nav))">
          <template v-slot:before>
            <div class="wfull hfull">
              <codemirror
                v-model="code"
                placeholder="Code goes here..."
                :style="{ width: '100%', height: '100%',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontVariantLigatures: 'normal',
                          fontSize: '0.9rem', fontWeight: 'bold'}"
                :autofocus="true"
                :indent-with-tab="true"
                :tab-size="2"
                :extensions="extensions"
                @ready="handleReady"/>
              <q-menu touch-position context-menu auto-close
                      class="surface-variant
                             fmt_border
                             shadow-none rounded-0">
                <q-list class="on-background-text text-sm" dense>
                  <q-item clickable disable>
                    <q-item-section>
                      <q-item-label lines="2">
                        <q-icon name="sym_o_content_copy" size="1.2rem"/>
                        Copy
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable disable>
                    <q-item-section>
                      <q-item-label lines="2">
                        <q-icon name="sym_o_content_cut" size="1.2rem"/>
                        Cut
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable disable>
                    <q-item-section>
                      <q-item-label lines="2">
                        <q-icon name="sym_o_content_paste" size="1.2rem"/>
                        Paste
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <div class="wfull my2 fmt_border_top"></div>
                  <q-item clickable @click="showSearchAnything">
                    <q-item-section>
                      <q-item-label lines="2">
                        <q-icon name="sym_o_search" size="1.2rem"/>
                        Search
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  <div class="wfull my2 fmt_border_top"></div>
                  <q-item clickable @click="saveDocument">
                    <q-item-section>
                      <q-item-label lines="2">
                        <q-icon name="sym_o_save" size="1.2rem"/>
                        Save File
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </div>
          </template>
          <template v-slot:after>
            <div class="wfull hfull relative">
              <div class="z1 wfull surface-variant px2 row gap-2
                          items-center h-[36px] sticky top-0">
                <template v-if="vertSplitter < 90">
                  <q-btn icon="sym_o_check_indeterminate_small"
                         @click="vertSplitter = 95"
                         dense unelevated/>
                </template>
                <template v-else>
                  <q-btn icon="sym_o_expand_content"
                         @click="vertSplitter = 60"
                         dense unelevated/>
                </template>
                <p class="fontbold text-xs pointer-events-none">Terminal</p>
              </div>
              <div class="wfull hfull p4 background">
                <q-timeline color="primary" side="right" class="my0">
                  <q-timeline-entry v-for="entry in terminalEntries" :key="entry"
                                    :subtitle="entry.time + '&nbsp;(' + entry.duration + ')'">
                    <div>
                      <p class="text-xs fontbold">{{ entry.description }}</p>
                    </div>
                  </q-timeline-entry>
                </q-timeline>
              </div>
            </div>
          </template>
        </q-splitter>
      </template>
    </q-splitter>
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
import { lintGutter, setDiagnostics } from '@codemirror/lint'
import { toRaw } from 'vue'
import { dbGetAllDataKeys, dbGetData, dbSetData } from 'src/libs/wikistore'

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
      code: '',
      handleReady: (payload) => {
        this.view = payload.view
        this.injectExtension(this.view, autocompletion({
          override: [this.myCompletions]
        }))
        this.injectExtension(this.view, wordHover)
        this.injectExtension(this.view, underlineKeymap)
        this.injectExtension(this.view, highlightKeymap)
        this.injectExtension(this.view, lintGutter())
        this.injectExtension(this.view, EditorView.updateListener.of(
          (v) => {
            this.evalDocChange(v)
          }))
        this.injectExtension(this.view, keymap.of([{
          key: 'Mod-Shift-f',
          preventDefault: true,
          run: this.showSearchAnything
        }]))
        this.initializeEditor()
      },
      cWorker: null,
      wasm: false,
      wasmDiagnostics: [],
      wasmRanges: [],
      internal: new BroadcastChannel('wikiric_internal'),
      initialized: false,
      wasReset: false,
      isRendering: false,
      preCompResp: null,
      tokenList: [],
      projectName: 'Untitled Project',
      docName: 'Untitled',
      hasChanged: false,
      lastSave: 'None',
      searchAnything: false,
      searchMode: 'search',
      queryText: '',
      resultTxt: '',
      replaceText: '',
      errors: 0,
      warnings: 0,
      horiSplitter: 20,
      vertSplitter: 70,
      showTerminal: true,
      terminalEntries: [{
        duration: '0s',
        time: DateTime.now().toLocaleString(DateTime.TIME_SIMPLE),
        description: 'Console Ready'
      }],
      leftTab: 'files',
      tab: 'Untitled',
      tabs: [],
      selectedCache: 'Untitled',
      treeQuery: '',
      cacheTree: [
        {
          label: 'Cached',
          icon: 'sync',
          selectable: false,
          children: []
        }
      ],
      selected: 'Untitled',
      projectTree: [
        {
          label: 'Untitled Project',
          icon: 'folder',
          selectable: false,
          children: []
        }
      ]
    }
  },
  created () {
    this.handleEditChange = debounce(this.handleEditChange, 500)
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
    },
    setUpPReCWorker: function () {
      this.cWorker = new Worker(
        new URL('codeWorker.js', import.meta.url),
        { type: 'module' })
      this.cWorker.onmessage = e => {
        console.log(e.data)
      }
      this.cWorker.postMessage({
        msg: '[c:init]',
        tiny: true
      })
    },
    initializeEditor: async function () {
      if (this.initialized) {
        return
      }
      this.createNewFile()
      await this.getDocumentContent()
      if (this.wasm) {
        this.cWorker.postMessage({
          msg: '[c:sdoc]',
          c: this.code
        })
      } else {
        window.wSetDoc(this.code)
      }
      await this.getSyntaxInformation()
      if (this.tokenList.length === 1 && !this.tokenList[0].success) {
        this.tokenList = []
      }
      const noContent = this.code.trim() === ''
      if (noContent) {
        this.tokenList = []
      }
      if (this.tokenList.length > 0) {
        const diagnostics = []
        let tk
        for (let i = 0; i < this.tokenList.length; i++) {
          tk = this.tokenList[i]
          if (!tk.v) {
            this.warnings += 1
            diagnostics.push({
              from: tk.p,
              to: tk.p + tk.len,
              severity: 'error', // "error" | "hint" | "info" | "warning"
              message: `Invalid: "${tk.str}"`
            })
          } else if (tk.typ === 2) {
            diagnostics.push({
              from: tk.p,
              to: tk.p + tk.len,
              severity: 'warning',
              message: `Unresolved: "${tk.str}"\n  (Check nearby Syntax Errors)`
            })
          }
          tokenMap.set(tk.str, tk)
        }
        // Show syntax errors and warnings
        this.view.dispatch(
          setDiagnostics(this.view.state, diagnostics
          ))
        await this.clr(true)
        this.initialized = true
      }
      this.terminalEntries.unshift({
        duration: '0s',
        time: DateTime.now().toLocaleString({
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        description: `Document INIT with ${this.warnings} warnings`
      })
      this.setUpPReCWorker()
    },
    handleEditChange: async function (txt, doClr) {
      return new Promise((resolve) => {
        // Can we redirect this to the worker?
        if (this.wasm) {
          this.cWorker.postMessage({
            msg: '[c:prec]'
          })
          resolve()
          return
        }
        // Turn words into tokens
        let resp
        if (txt) {
          resp = window.wPreCompile(txt)
        } else {
          resp = window.wPreCompile()
        }
        this.receiveWasmPreCompileResult(resp, doClr)
        resolve()
      })
    },
    receiveWasmPreCompileResult: async function (resp, doClr) {
      return new Promise((resolve) => {
        this.preCompResp = resp
        // this.tokenList = []
        if (!resp.success) {
          return
        }
        this.errors = resp.errors
        this.terminalEntries.unshift({
          duration: resp.duration,
          time: DateTime.now().toLocaleString({
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }),
          description: `Pre-Compile DONE with ${this.errors} errors`
        })
        if (this.terminalEntries.length > 50) {
          this.terminalEntries.pop()
        }
        // Can we redirect this?
        if (this.wasm) {
          this.cWorker.postMessage({
            msg: '[c:diff]'
          })
        } else {
          // Diff token states
          resp = window.wCompareResults()
          const max = resp.changes +
            resp.additions +
            resp.deletions
          const ranges = []
          let tmp
          for (let i = 0; i < max; i++) {
            tmp = window.wGetChanges(i)
            if (tmp == null || !tmp.success) {
              continue
            }
            ranges.push(tmp)
          }
          this.receiveWasmDiffResult(ranges, doClr)
        }
        resolve()
      })
    },
    receiveWasmDiffResult: async function (ranges, doClr) {
      return new Promise((resolve) => {
        let startIndex = -1
        if (ranges && ranges.length > 0) {
          if (ranges.length > 1) {
            ranges.sort((a, b) => a.fromA - b.fromA)
          }
          this.wasmRanges = ranges
          startIndex = ranges[0].fromA
          for (let i = 0; i < ranges.length; i++) {
            if (ranges[i].typ === 'change' &&
              ranges[i].fromA === ranges[i].toB) {
              ranges[i].toB += 1
            }
          }
        } else {
          if (!this.wasReset) {
            // Initial run
            this.warnings = 0
            this.tokenList = []
          }
          this.wasmRanges = []
        }
        // Can we redirect this?
        if (this.wasm) {
          this.cWorker.postMessage({
            msg: '[c:get]',
            i: startIndex,
            c: doClr
          })
        } else {
          const diagnostics = []
          // The following function is recursive!
          setTimeout(() => {
            this.processPreCompResponse(startIndex, doClr, diagnostics, ranges)
          }, 0)
        }
        resolve()
      })
    },
    receiveWasmDiagnostics: async function (diagnostics) {
      return new Promise((resolve) => {
        this.wasmDiagnostics = diagnostics
        this.view.dispatch(setDiagnostics(this.view.state, diagnostics))
        // We have the tokens and ranges, so we can update our token list accordingly
        if (this.wasmRanges.length > 0) {
          if (this.wasmRanges.length > 1) {
            this.wasmRanges.sort((a, b) => a.fromA - b.fromA)
          }
          for (let i = 0; i < this.wasmRanges.length; i++) {
            this.cWorker.postMessage({
              msg: '[c:read]',
              f: this.wasmRanges[i].fromA,
              t: this.wasmRanges[i].toB,
              c: i === this.wasmRanges.length - 1
            })
          }
        } else if (!this.wasReset) {
          // Initial run
          this.warnings = 0
          this.tokenList = []
        }
        resolve()
      })
    },
    receiveWasmTokenList: async function (list, doClr) {
      return new Promise((resolve) => {
        for (let i = 0; i < list.length; i++) {
          // Insert/Change/Delete Tokens
          if (list[i].ix > this.tokenList.length) {
            // Currently: 0123_ (length 4)
            // New Index: ____4 (length 5) => 4-4=0
            // No buffer token will be inserted.
            //
            // Currently: 0123___ (length 4)
            // New Index: ______6 (length 7) => 6-2=2
            // Two buffer tokens will be inserted.
            //
            const buf = list[i].ix - this.tokenList.length
            // E.g. 6 - 4 = 2
            for (let j = 0; j < buf; j++) {
              this.tokenList.push({
                len: 0,
                typ: 0,
                styp: 0
              })
            }
            this.tokenList.push(list[i].t)
          } else {
            this.tokenList[list[i].ix] = list[i].t
          }
          if (list[i].t != null && list[i].t.str != null) {
            tokenMap.set(list[i].t.str, list[i].t)
          }
        }
        if (doClr) {
          if (!this.wasReset) {
            this.wasReset = true
            this.clr(true)
          } else if (this.wasmRanges.length > 0) {
            this.clr(true)
          }
        }
        resolve()
      })
    },
    processPreCompResponse: async function (i, doClr, diagnostics, ranges) {
      let er
      if (i >= this.preCompResp.tokens) {
        // We are done collecting Tokens!
        for (let j = 0; j < this.preCompResp.errors; j++) {
          er = window.wGetError(j)
          if (er.from == null || er.to == null) {
            continue
          }
          diagnostics.push({
            from: er.from,
            to: er.to,
            severity: 'error',
            message: er.msg
          })
        }
        await this.submitSyntaxInformation()
        // Show syntax errors and warnings
        this.view.dispatch(setDiagnostics(this.view.state, diagnostics))
        const bc = new BroadcastChannel('wikiric_internal')
        bc.postMessage({
          app: 'codeeditor',
          type: 'render',
          noreset: true
        })
        return
      }
      // Receive token by token
      const tk = window.wGetToken(i, true)
      if (!tk.success) {
        // We are done here (canceled by WASM)
        setTimeout(() => {
          this.processPreCompResponse(
            this.preCompResp.tokens, doClr, diagnostics, ranges)
        }, 0)
        return
      }
      if (!tk.v) {
        this.warnings += 1
        diagnostics.push({
          from: tk.p,
          to: tk.p + tk.len,
          severity: 'error', // "error" | "hint" | "info" | "warning"
          message: `Invalid: "${tk.str}"`
        })
      } else if (tk.typ === 2) {
        diagnostics.push({
          from: tk.p,
          to: tk.p + tk.len,
          severity: 'warning',
          message: `Unresolved: "${tk.str}"\n  (Check nearby Syntax Errors)`
        })
      }
      tokenMap.set(tk.str, tk)
      this.hasChanged = true
      // Are there ranges?
      // We can save a lot of time when only getting the tokens
      // ...that were actually changed!
      if (ranges.length > 0) {
        let inBounds = true
        if (i > ranges[0].toB) {
          // Remove already seen range
          ranges.splice(0, 1)
          inBounds = false
        }
        // Are there still ranges present?
        if (ranges.length < 1) {
          // Done!
          setTimeout(() => {
            this.processPreCompResponse(
              this.preCompResp.tokens, doClr, diagnostics, ranges)
          }, 0)
          return
        }
        if (i < ranges[0].fromA) {
          // Set i to the index before the next changed token
          i = ranges[0].fromA - 1
          inBounds = false
        }
        if (inBounds) {
          // Insert/Change/Delete Tokens
          if (i > this.tokenList.length) {
            this.tokenList.push(tk)
          } else {
            this.tokenList[i] = tk
          }
        }
      } else {
        this.tokenList.push(tk)
      }
      // Start next iteration
      setTimeout(() => {
        this.processPreCompResponse(i + 1, doClr, diagnostics, ranges)
      }, 0)
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
            label: 'eraseall',
            type: 'text',
            apply: 'eraseall sFilename ',
            detail: '| Template'
          },
          {
            label: 'eraseall',
            type: 'keyword'
          },
          {
            label: 'replacetext',
            type: 'text',
            apply: 'replacetext sContent from \'a\' to \'b\' ',
            detail: '| Template'
          },
          {
            label: 'replacetext',
            type: 'keyword'
          },
          {
            label: 'only fileexist ',
            type: 'keyword'
          },
          {
            label: 'only not fileexist ',
            type: 'keyword'
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
    reconfigureExtension: function (view, extension) {
      view.dispatch({
        effects: StateEffect.reconfigure.of(extension)
      })
    },
    clr: async function (reset) {
      return new Promise((resolve) => {
        this.highlightTokens(this.view, reset)
        this.isRendering = false
        resolve()
      })
    },
    highlightTokens: function (view, reset) {
      const effects = []
      let amt = 0
      const docLen = this.code.length
      const ranges = [].concat(this.wasmRanges)
      console.log(this.wasmRanges)
      let tk
      for (let i = 0; i < this.tokenList.length; i++) {
        if (ranges.length > 0) {
          if (i < ranges[0].fromA) {
            // Too early!
            i = ranges[0].fromA
          }
          if (i >= ranges[0].toB) {
            // Too late!
            ranges.splice(0, 1)
            if (ranges.length < 1) {
              // Done
              break
            }
            // Check if we need to skip some tokens
            if (i < ranges[0].fromA) {
              i = ranges[0].fromA - 1
              continue
            }
          }
        }
        tk = this.tokenList[i]
        if (tk == null || tk.len == null || tk.len <= 0) {
          continue
        }
        // Guard out of bounds
        if (tk.p >= docLen || tk.p + tk.len >= docLen) {
          continue
        }
        if (reset) {
          effects.push(removeHighlight.of({
            from: tk.p,
            to: (tk.p + tk.len)
          }))
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
          case 2:
            // Error
            effects.push(addHighlightError.of({
              from: tk.p,
              to: (tk.p + tk.len)
            }))
            amt += 1
            continue
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
      if (this.code.trim() === '') {
        this.code = ''
        this.tokenList = []
        this.errors = 0
        this.warnings = 0
        tokenMap.clear()
      }
      this.submitDocumentContent()
      this.submitSyntaxInformation()
      this.lastSave = DateTime.now().toHTTP()
      this.hasChanged = false
      this.terminalEntries.unshift({
        duration: '0s',
        time: DateTime.now().toLocaleString({
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        description: 'Document Saved'
      })
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
        case 'render':
          if (this.isRendering) {
            break
          }
          this.isRendering = true
          if (e.noreset) {
            this.clr(false)
          } else {
            this.clr(true)
          }
          break
        case 'wasm':
          this.wasm = true
          this.cWorker.postMessage({
            msg: '[c:sdoc]',
            c: this.code
          })
          this.terminalEntries.unshift({
            duration: '0s',
            time: DateTime.now().toLocaleString({
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }),
            description: 'Instantiated Pre-Compiler Go WebAssembly Module'
          })
          // this.handleEditChange(this.code, true)
          break
        case 'prec':
          this.receiveWasmPreCompileResult(structuredClone(e.r))
          break
        case 'diff':
          this.receiveWasmDiffResult(structuredClone(e.r), true)
          break
        case 'done':
          this.receiveWasmDiagnostics(structuredClone(e.d))
          break
        case 'token':
          if (e.s != null && e.s) {
            this.receiveWasmTokenList(structuredClone(e.tl), e.c)
          }
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
      this.cWorker.postMessage({
        msg: '[c:gus]',
        q: query
      })
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
     * evalDocChange analyzes the ViewUpdate to retrieve changes made to the document.
     * We cannot have this be async since the changes act as transactions.
     * @param {ViewUpdate} v
     */
    evalDocChange: function (v) {
      if (!v.docChanged || v.changedRanges.length < 1) {
        return
      }
      const cr = v.changedRanges[0]
      let ins = ''
      let del = false
      if (v.changes.inserted.length > 0) {
        ins = this.getTextFromChange(v)
      } else {
        del = true
      }
      if (ins === '') {
        del = true
      }
      // Tell tinyPreC about the editor changes
      if (this.wasm) {
        this.cWorker.postMessage({
          msg: '[c:cdoc]',
          d: del,
          f: cr.fromA,
          t: cr.toA,
          i: ins
        })
      } else {
        window.wChangeDoc(del, cr.fromA, cr.toA, ins)
      }
      // Run pre-compilation and update syntax highlighting
      this.handleEditChange(null, true)
    },
    getTextFromChange: function (v) {
      let lines = 0
      let ins = ''
      for (let i = 0; i < v.changes.inserted.length; i++) {
        if (v.changes.inserted[i].children != null) {
          lines = v.changes.inserted[i].lines
          for (let j = 0; j < v.changes.inserted[i].children.length; j++) {
            for (let k = 0; k < v.changes.inserted[i].children[j].text.length; k++) {
              if (v.changes.inserted[i].children[j].text[k] &&
                v.changes.inserted[i].children[j].text[k].length > 0) {
                ins += v.changes.inserted[i].children[j].text[k]
              }
              if (lines > 1) {
                ins += '\n'
                lines -= 1
              }
            }
          }
          continue
        }
        lines = v.changes.inserted[i].lines
        for (let j = 0; j < v.changes.inserted[i].text.length; j++) {
          if (v.changes.inserted[i].text[j] && v.changes.inserted[i].text[j].length > 0) {
            ins += v.changes.inserted[i].text[j]
          }
          if (lines > 1) {
            ins += '\n'
            lines -= 1
          }
        }
      }
      return ins
    },
    toggleTerminal: function () {
      if (this.vertSplitter < 90) {
        this.vertSplitter = 100
      } else {
        this.vertSplitter = 70
      }
    },
    resetFilter () {
      this.treeQuery = ''
    },
    submitSyntaxInformation: async function () {
      const key = `syntax_${btoa(this.projectName)}_${btoa(this.docName)}`
      const keys = await dbGetAllDataKeys()
      if (!keys || keys.length < 1) {
        // Set (initial data)
        const data = {
          tokenList: toRaw(this.tokenList)
        }
        await dbSetData(key, data)
        return
      }
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== key) {
          continue
        }
        let data = await dbGetData(keys[i])
        if (data != null) {
          // Update (found and valid)
          data.tokenList = toRaw(this.tokenList)
          await dbSetData(keys[i], data)
          return
        }
        // Set (found but invalid)
        data = {
          tokenList: toRaw(this.tokenList)
        }
        await dbSetData(keys[i], data)
        return
      }
      // Set (not found)
      const data = {
        tokenList: toRaw(this.tokenList)
      }
      await dbSetData(key, data)
    },
    submitDocumentContent: async function () {
      const key = `code_doc_${btoa(this.projectName)}_${btoa(this.docName)}`
      await dbSetData(key, this.code)
    },
    getSyntaxInformation: async function () {
      const key = `syntax_${btoa(this.projectName)}_${btoa(this.docName)}`
      const keys = await dbGetAllDataKeys()
      if (!keys || keys.length < 1) {
        this.tokenList = []
        return
      }
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== key) {
          continue
        }
        const data = await dbGetData(keys[i])
        if (data != null && data.tokenList != null && data.tokenList.length > 0) {
          // Retrieve (found and valid)
          this.tokenList = data.tokenList
          return
        }
        // Invalid
        this.tokenList = []
        return
      }
    },
    getDocumentContent: async function () {
      const key = `code_doc_${btoa(this.projectName)}_${btoa(this.docName)}`
      const keys = await dbGetAllDataKeys()
      if (!keys || keys.length < 1) {
        return
      }
      for (let i = 0; i < keys.length; i++) {
        if (keys[i] !== key) {
          continue
        }
        const data = await dbGetData(keys[i])
        if (data != null && typeof data === 'string') {
          // Retrieve (found and valid)
          this.code = data
          return
        }
        // Invalid
        return
      }
    },
    createNewFile: function () {
      let name = 'Untitled'
      let ix
      let highestIx = 0
      let usIx
      for (let i = 0; i < this.tabs.length; i++) {
        usIx = this.tabs[i].docName.lastIndexOf('_')
        if ((usIx === -1 && this.tabs[i].docName === name) ||
          (this.tabs[i].docName.substring(0, usIx) === name)) {
          ix = this.getFileNumber(this.tabs[i].docName)
          if (ix > highestIx) {
            highestIx = ix + 1
          } else {
            highestIx += 1
          }
        }
      }
      if (highestIx > 0) {
        name += `_${highestIx}`
      }
      this.tabs.push({
        docName: name
      })
      const vThis = this
      this.cacheTree[0].children.push({
        label: name,
        icon: 'description',
        handler: function () {
          vThis.tab = name
        }
      })
      this.projectTree[0].children.push({
        label: name,
        icon: 'description',
        handler: function () {
          vThis.tab = name
        }
      })
      this.tab = name
    },
    /**
     *
     * @param {String} docName
     */
    getFileNumber: function (docName) {
      const dotIx = docName.lastIndexOf('.')
      if (dotIx !== -1) {
        docName = docName.substring(0, dotIx)
      }
      const usIx = docName.lastIndexOf('_')
      if (usIx === -1 || usIx === docName.length - 1) {
        return 0
      }
      return parseInt(docName.substring(usIx + 1), 10)
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
      dom.style.padding = '8px'
      // Show the targeted Word/Token
      const token = document.createElement('div')
      token.style.padding = '4px 8px 4px 8px'
      token.style.color = 'var(--md-sys-color-on-background)'
      token.style.fontSize = '1rem'
      token.style.fontFamily = 'JetBrains Mono, monospace'
      token.style.backgroundColor = 'var(--md-sys-color-background)'
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
        if (ref.sTypName !== '' && ref.sTypName !== ref.typName) {
          infString += ` (${ref.sTypName})`
        }
        info.textContent = infString
        dom.appendChild(info)
        // Is there rule information?
        if (ref.rs && ref.rs !== '') {
          const rules = document.createElement('div')
          rules.style.borderTop = '1px solid var(--md-sys-color-outline-variant)'
          rules.style.padding = '4px 8px 4px 8px'
          rules.style.fontSize = '0.8rem'
          rules.style.fontFamily = 'JetBrains Mono, monospace'
          rules.textContent = `Syntax: {${ref.rs}}`
          dom.appendChild(rules)
        }
        // Buttons!
        const buttons = document.createElement('div')
        buttons.style.borderBottom = '1px solid var(--md-sys-color-outline-variant)'
        buttons.style.display = 'flex'
        buttons.style.flexDirection = 'row'
        buttons.style.justifyContent = 'end'
        buttons.style.gap = '0.25rem'
        buttons.style.padding = '14px 8px 8px 8px'
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
          filter: (from, to) => {
            return from < e.value.from || to > e.value.to
          }
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
WebAssembly.instantiateStreaming(fetch('main.wasm'),
  go.importObject).then((result) => {
  mod = result.module
  inst = result.instance
  go.run(inst)
  WebAssembly.instantiate(mod, go.importObject) // reset instance
})
</script>

<style>

.big_border_left {
  border-left: 2px solid var(--md-sys-color-on-surface);
}

.ͼo {
  background-color: var(--md-sys-color-background-dark) !important;
}

.ͼo .cm-activeLine {
}

.ͼo .cm-gutters {
  background-color: var(--md-sys-color-background-dark) !important;
}

.ͼo .cm-activeLineGutter {
  background-color: var(--md-sys-color-surface-variant-dark) !important;
}

.cm-line * {
  font-family: 'JetBrains Mono', monospace !important;
  font-variant-ligatures: normal !important;
}

.cm-diagnosticText,
.cm-diagnosticText * {
  font-size: 13px !important;
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
