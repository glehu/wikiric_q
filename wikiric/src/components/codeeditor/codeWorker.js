/*
 * Copyright (c) 2025.
 * Module codeWorker.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

'use strict'

import wikiricUtils from 'src/libs/wikiric-utils'
import './wasm_exec'

{
  // #########################
  // ### WebAssembly STUFF ###
  // #########################

  // TinyGo compiled TinyRic
  let go = null

  // WASM Module of TinyRic
  let wasm = null
  let prefWasm = false

  let preCompResult = null
  let diffResult = null
  let diagnostics = []
  let tokenList = []
  let ranges = []
  let warnings = 0
  let tokenMap = new Map()

  // #####################
  // ### MESSAGE STUFF ###
  // #####################

  const internal = new BroadcastChannel('wikiric_internal')

  onmessage = (e) => {
    if (!e.data.msg) return
    switch (e.data.msg) {
      case '[c:init]':
        if (Boolean(e.data.tiny)) {
          // WASM support!
          tinyPreC().then(() => {
            prefWasm = true
            console.debug('[codeWorker] Initialized TinyPreC WASM Module')
            // const resp = self.wPreCompile("str : 'hey'", true)
            // console.log(resp)
            internal.postMessage({
              app: 'codeeditor',
              type: 'wasm'
            })
          })
        }
        break
      case '[c:cdoc]':
        console.log(e.data)
        self.wChangeDoc(e.data.d, e.data.f, e.data.t, e.data.i)
        break
      case '[c:sdoc]':
        self.wSetDoc(e.data.c)
        break
      case '[c:prec]':
        preCompile()
        break
      case '[c:diff]':
        diffStates()
        break
      case '[c:get]':
        getToken(e.data.i, e.data.c)
        break
      case '[c:read]':
        readToken(e.data.f, e.data.t, e.data.c)
        break
    }
  }

  /**
   * tinyPreC initializes the Go WebAssembly Module
   * @return {Promise<unknown>}
   */
  async function tinyPreC () {
    go = new global.Go()
    wasm = await wikiricUtils.wasmBrowserInstantiate('main.wasm', go.importObject)
    return new Promise((resolve) => {
      go.run(wasm.instance)
      resolve()
    })
  }

  /**
   * preCompile tells tinyPreC to process the source code
   */
  function preCompile () {
    diagnostics = []
    preCompResult = self.wPreCompile()
    internal.postMessage({
      app: 'codeeditor',
      type: 'prec',
      r: preCompResult
    })
  }

  /**
   * diffStates tells tinyPreC to check for token state differences
   */
  function diffStates () {
    // Diff token states
    diffResult = self.wCompareResults()
    const max = diffResult.changes + diffResult.additions + diffResult.deletions
    ranges = []
    let tmp
    for (let i = 0; i < max; i++) {
      tmp = self.wGetChanges(i)
      if (tmp == null || !tmp.success) {
        continue
      }
      ranges.push(tmp)
    }
    if (ranges.length > 1) {
      ranges.sort((a, b) => a.fromA - b.fromA)
    }
    internal.postMessage({
      app: 'codeeditor',
      type: 'diff',
      r: ranges
    })
  }

  /**
   * getToken is a recursive function that retrieves all tokens from tinyPreC
   * @param {Number} i
   * @param {Boolean} doClr
   */
  function getToken (i, doClr) {
    if (i >= preCompResult.tokens) {
      // We are done collecting Tokens!
      let er
      for (let j = 0; j < preCompResult.errors; j++) {
        er = self.wGetError(j)
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
      internal.postMessage({
        app: 'codeeditor',
        type: 'done',
        t: tokenList.length,
        d: diagnostics
      })
      return
    }
    // Receive token by token
    const tk = self.wGetToken(i, true)
    if (!tk.success) {
      internal.postMessage({
        app: 'codeeditor',
        type: 'done',
        t: tokenList.length,
        d: diagnostics
      })
      return
    }
    if (!tk.v) {
      warnings += 1
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
    // Are there ranges?
    // We can save a lot of time when only getting the tokens
    // ...that were actually changed!
    if (ranges.length > 0) {
      // console.log('BOUNDS CHECK', i)
      let inBounds = true
      if (i > ranges[0].toB) {
        // Remove already seen range
        ranges.splice(0, 1)
        inBounds = false
      }
      // Are there still ranges present?
      if (ranges.length < 1) {
        // console.log('EOL', i)
        // Done!
        getToken(preCompResult.tokens, doClr)
        return
      }
      if (i < ranges[0].fromA) {
        // Set i to the index before the next changed token
        i = ranges[0].fromA - 1
        inBounds = false
      }
      if (inBounds) {
        // Insert/Change/Delete Tokens
        if (i > tokenList.length) {
          tokenList.push(tk)
          // console.log('IN BOUNDS ADD', i, ranges[0])
        } else {
          tokenList[i] = tk
          // console.log('IN BOUNDS MOD', i, ranges[0])
        }
      }
    } else {
      tokenList.push(tk)
    }
    // Start next iteration
    getToken(i + 1, doClr)
  }

  /**
   * readToken returns all targeted token if they exist.
   * @param {Number} from
   * @param {Number} to
   * @param {Boolean} callback
   */
  function readToken (from, to, callback) {
    // Recover from malformed input
    if (from === to) {
      to += 1
    } else if (from > to) {
      const swap = to
      to = from
      from = swap
    }
    // Guard
    if (from < 0 || to < 0 ||
      from > tokenList.length || to > tokenList.length) {
      internal.postMessage({
        app: 'codeeditor',
        type: 'token',
        s: false,
        c: callback
      })
    }
    // Collect all tokens
    const list = []
    for (let i = from; i < to; i++) {
      list.push({
        ix: i,
        t: tokenList[i]
      })
    }
    // Respond
    internal.postMessage({
      app: 'codeeditor',
      type: 'token',
      s: true,
      tl: list,
      c: callback
    })
  }
}
