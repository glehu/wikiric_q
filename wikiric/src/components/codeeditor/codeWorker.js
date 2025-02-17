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
import '../../../public/wasm_exec'

{
  // #########################
  // ### WebAssembly STUFF ###
  // #########################

  // TinyGo compiled TinyRic
  let go = null

  // WASM Module of TinyRic
  let wasm = null
  let prefWasm = false

  // #####################
  // ### MESSAGE STUFF ###
  // #####################

  onmessage = (e) => {
    if (!e.data.msg) return
    switch (e.data.msg) {
      case '[c:init]':
        if (Boolean(e.data.tiny)) {
          // WASM support!
          tinyPreC().then(() => {
            prefWasm = true
            console.debug('[codeWorker] Initialized TinyPreC WASM Module')
            const resp = go.wPreCompile("str : 'hey'", true)
            console.log(resp)
          })
        }
        break
    }
  }

  /**
   *
   * @return {Promise<unknown>}
   */
  async function tinyPreC () {
    go = new global.Go()
    wasm = await wikiricUtils.wasmBrowserInstantiate('./main.wasm', go.importObject)
    return new Promise((resolve) => {
      go.run(wasm.instance)
      resolve()
    })
  }
}
