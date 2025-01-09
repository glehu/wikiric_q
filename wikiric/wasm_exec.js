// Copyright 2018 The Go Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.
//
// This file has been modified for use by the TinyGo compiler.
// This file has been modified by Luca Goldhausen because of linter problems...

(() => {
  // Map multiple JavaScript environments to a single common API,
  // preferring web standards over Node.js API.
  //
  // Environments considered:
  // - Browsers
  // - Node.js
  // - Electron
  // - Parcel

  if (typeof global !== 'undefined') {
    // global already exists
  } else if (typeof window !== 'undefined') {
    window.global = window
  } else if (typeof self !== 'undefined') {
    self.global = self
  } else {
    throw new Error('cannot export Go (neither global, window nor self is defined)')
  }

  if (!global.require && typeof require !== 'undefined') {
    global.require = require
  }

  if (!global.fs && global.require) {
    global.fs = require('node:fs')
  }

  const enosys = () => {
    const err = new Error('not implemented')
    err.code = 'ENOSYS'
    return err
  }

  if (!global.fs) {
    let outputBuf = ''
    global.fs = {
      constants: {
        O_WRONLY: -1,
        O_RDWR: -1,
        O_CREAT: -1,
        O_TRUNC: -1,
        O_APPEND: -1,
        O_EXCL: -1
      }, // unused
      writeSync (fd, buf) {
        outputBuf += decoder.decode(buf)
        const nl = outputBuf.lastIndexOf('\n')
        if (nl !== -1) {
          console.log(outputBuf.substr(0, nl))
          outputBuf = outputBuf.substr(nl + 1)
        }
        return buf.length
      },
      write (fd, buf, offset, length, position, callback) {
        if (offset !== 0 || length !== buf.length || position !== null) {
          callback(enosys())
          return
        }
        const n = this.writeSync(fd, buf)
        callback(null, n)
      },
      chmod (path, mode, callback) {
        callback(enosys())
      },
      chown (path, uid, gid, callback) {
        callback(enosys())
      },
      close (fd, callback) {
        callback(enosys())
      },
      fchmod (fd, mode, callback) {
        callback(enosys())
      },
      fchown (fd, uid, gid, callback) {
        callback(enosys())
      },
      fstat (fd, callback) {
        callback(enosys())
      },
      fsync (fd, callback) {
        callback(null)
      },
      ftruncate (fd, length, callback) {
        callback(enosys())
      },
      lchown (path, uid, gid, callback) {
        callback(enosys())
      },
      link (path, link, callback) {
        callback(enosys())
      },
      lstat (path, callback) {
        callback(enosys())
      },
      mkdir (path, perm, callback) {
        callback(enosys())
      },
      open (path, flags, mode, callback) {
        callback(enosys())
      },
      read (fd, buffer, offset, length, position, callback) {
        callback(enosys())
      },
      readdir (path, callback) {
        callback(enosys())
      },
      readlink (path, callback) {
        callback(enosys())
      },
      rename (from, to, callback) {
        callback(enosys())
      },
      rmdir (path, callback) {
        callback(enosys())
      },
      stat (path, callback) {
        callback(enosys())
      },
      symlink (path, link, callback) {
        callback(enosys())
      },
      truncate (path, length, callback) {
        callback(enosys())
      },
      unlink (path, callback) {
        callback(enosys())
      },
      utimes (path, atime, mtime, callback) {
        callback(enosys())
      }
    }
  }

  if (!global.process) {
    global.process = {
      getuid () {
        return -1
      },
      getgid () {
        return -1
      },
      geteuid () {
        return -1
      },
      getegid () {
        return -1
      },
      getgroups () {
        throw enosys()
      },
      pid: -1,
      ppid: -1,
      umask () {
        throw enosys()
      },
      cwd () {
        throw enosys()
      },
      chdir () {
        throw enosys()
      }
    }
  }

  if (!global.crypto) {
    const nodeCrypto = require('node:crypto')
    global.crypto = {
      getRandomValues (b) {
        nodeCrypto.randomFillSync(b)
      }
    }
  }

  if (!global.performance) {
    global.performance = {
      now () {
        const [sec, nsec] = process.hrtime()
        return sec * 1000 + nsec / 1000000
      }
    }
  }

  if (!global.TextEncoder) {
    global.TextEncoder = require('node:util').TextEncoder
  }

  if (!global.TextDecoder) {
    global.TextDecoder = require('node:util').TextDecoder
  }

  // End of polyfills for common API.

  const encoder = new TextEncoder('utf-8')
  const decoder = new TextDecoder('utf-8')
  const reinterpretBuf = new DataView(new ArrayBuffer(8))
  let logLine = []
  const wasmExit = {} // thrown to exit via proc_exit (not an error)

  global.Go = class {
    constructor () {
      this._callbackTimeouts = new Map()
      this._nextCallbackTimeoutID = 1

      const mem = () => {
        // The buffer may change when requesting more memory.
        return new DataView(this._inst.exports.memory.buffer)
      }

      const unboxValue = (vRef) => {
        reinterpretBuf.setBigInt64(0, vRef, true)
        const f = reinterpretBuf.getFloat64(0, true)
        if (f === 0) {
          return undefined
        }
        if (!isNaN(f)) {
          return f
        }

        const id = vRef & 0xffffffffn
        return this._values[id]
      }

      const loadValue = (addr) => {
        const vRef = mem().getBigUint64(addr, true)
        return unboxValue(vRef)
      }

      const boxValue = (v) => {
        const nanHead = 0x7FF80000n

        if (typeof v === 'number') {
          if (isNaN(v)) {
            return nanHead << 32n
          }
          if (v === 0) {
            return (nanHead << 32n) | 1n
          }
          reinterpretBuf.setFloat64(0, v, true)
          return reinterpretBuf.getBigInt64(0, true)
        }

        switch (v) {
          case undefined:
            return 0n
          case null:
            return (nanHead << 32n) | 2n
          case true:
            return (nanHead << 32n) | 3n
          case false:
            return (nanHead << 32n) | 4n
        }

        let id = this._ids.get(v)
        if (id === undefined) {
          id = this._idPool.pop()
          if (id === undefined) {
            id = BigInt(this._values.length)
          }
          this._values[id] = v
          this._goRefCounts[id] = 0
          this._ids.set(v, id)
        }
        this._goRefCounts[id]++
        let typeFlag = 1n
        switch (typeof v) {
          case 'string':
            typeFlag = 2n
            break
          case 'symbol':
            typeFlag = 3n
            break
          case 'function':
            typeFlag = 4n
            break
        }
        return id | ((nanHead | typeFlag) << 32n)
      }

      const storeValue = (addr, v) => {
        const vRef = boxValue(v)
        mem().setBigUint64(addr, vRef, true)
      }

      const loadSlice = (array, len, cap) => {
        return new Uint8Array(this._inst.exports.memory.buffer, array, len)
      }

      const loadSliceOfValues = (array, len, cap) => {
        const a = new Array(len)
        for (let i = 0; i < len; i++) {
          a[i] = loadValue(array + i * 8)
        }
        return a
      }

      const loadString = (ptr, len) => {
        return decoder.decode(new DataView(this._inst.exports.memory.buffer, ptr, len))
      }

      const timeOrigin = Date.now() - performance.now()
      this.importObject = {
        wasi_snapshot_preview1: {
          // https://github.com/WebAssembly/WASI/blob/main/phases/snapshot/docs.md#fd_write
          fd_write: function (fd, iovsPtr, iovsLen, nwrittenPtr) {
            let nwritten = 0
            if (fd === 1) {
              for (let iovsI = 0; iovsI < iovsLen; iovsI++) {
                const iovPtr = iovsPtr + iovsI * 8 // assuming wasm32
                const ptr = mem().getUint32(iovPtr + 0, true)
                const len = mem().getUint32(iovPtr + 4, true)
                nwritten += len
                for (let i = 0; i < len; i++) {
                  const c = mem().getUint8(ptr + i)
                  if (c === 13) { // CR
                    // ignore
                  } else if (c === 10) { // LF
                    // write line
                    const line = decoder.decode(new Uint8Array(logLine))
                    logLine = []
                    console.log(line)
                  } else {
                    logLine.push(c)
                  }
                }
              }
            } else {
              console.error('invalid file descriptor:', fd)
            }
            mem().setUint32(nwrittenPtr, nwritten, true)
            return 0
          },
          fd_close: () => 0,
          fd_fdstat_get: () => 0,
          fd_seek: () => 0,
          proc_exit: (code) => {
            this.exited = true
            this.exitCode = code
            this._resolveExitPromise()
            throw wasmExit
          },
          random_get: (bufPtr, bufLen) => {
            crypto.getRandomValues(loadSlice(bufPtr, bufLen))
            return 0
          }
        },
        gojs: {
          // func ticks() float64
          'runtime.ticks': () => {
            return timeOrigin + performance.now()
          },

          // func sleepTicks(timeout float64)
          'runtime.sleepTicks': (timeout) => {
            // Do not sleep, only reactivate scheduler after the given timeout.
            setTimeout(() => {
              if (this.exited) return
              try {
                this._inst.exports.go_scheduler()
              } catch (e) {
                if (e !== wasmExit) throw e
              }
            }, timeout)
          },

          // func finalizeRef(v ref)
          'syscall/js.finalizeRef': (vRef) => {
            // Note: TinyGo does not support finalizers so this should never be
            // called.
            console.error('syscall/js.finalizeRef not implemented')
          },

          // func stringVal(value string) ref
          'syscall/js.stringVal': (valuePtr, valueLen) => {
            const s = loadString(valuePtr, valueLen)
            return boxValue(s)
          },

          // func valueGet(v ref, p string) ref
          'syscall/js.valueGet': (vRef, pPtr, pLen) => {
            const prop = loadString(pPtr, pLen)
            const v = unboxValue(vRef)
            const result = Reflect.get(v, prop)
            return boxValue(result)
          },

          // func valueSet(v ref, p string, x ref)
          'syscall/js.valueSet': (vRef, pPtr, pLen, xRef) => {
            const v = unboxValue(vRef)
            const p = loadString(pPtr, pLen)
            const x = unboxValue(xRef)
            Reflect.set(v, p, x)
          },

          // func valueDelete(v ref, p string)
          'syscall/js.valueDelete': (vRef, pPtr, pLen) => {
            const v = unboxValue(vRef)
            const p = loadString(pPtr, pLen)
            Reflect.deleteProperty(v, p)
          },

          // func valueIndex(v ref, i int) ref
          'syscall/js.valueIndex': (vRef, i) => {
            return boxValue(Reflect.get(unboxValue(vRef), i))
          },

          // valueSetIndex(v ref, i int, x ref)
          'syscall/js.valueSetIndex': (vRef, i, xRef) => {
            Reflect.set(unboxValue(vRef), i, unboxValue(xRef))
          },

          // func valueCall(v ref, m string, args []ref) (ref, bool)
          'syscall/js.valueCall': (retAddr, vRef, mPtr, mLen, argsPtr, argsLen, argsCap) => {
            const v = unboxValue(vRef)
            const name = loadString(mPtr, mLen)
            const args = loadSliceOfValues(argsPtr, argsLen, argsCap)
            try {
              const m = Reflect.get(v, name)
              storeValue(retAddr, Reflect.apply(m, v, args))
              mem().setUint8(retAddr + 8, 1)
            } catch (err) {
              storeValue(retAddr, err)
              mem().setUint8(retAddr + 8, 0)
            }
          },

          // func valueInvoke(v ref, args []ref) (ref, bool)
          'syscall/js.valueInvoke': (retAddr, vRef, argsPtr, argsLen, argsCap) => {
            try {
              const v = unboxValue(vRef)
              const args = loadSliceOfValues(argsPtr, argsLen, argsCap)
              storeValue(retAddr, Reflect.apply(v, undefined, args))
              mem().setUint8(retAddr + 8, 1)
            } catch (err) {
              storeValue(retAddr, err)
              mem().setUint8(retAddr + 8, 0)
            }
          },

          // func valueNew(v ref, args []ref) (ref, bool)
          'syscall/js.valueNew': (retAddr, vRef, argsPtr, argsLen, argsCap) => {
            const v = unboxValue(vRef)
            const args = loadSliceOfValues(argsPtr, argsLen, argsCap)
            try {
              storeValue(retAddr, Reflect.construct(v, args))
              mem().setUint8(retAddr + 8, 1)
            } catch (err) {
              storeValue(retAddr, err)
              mem().setUint8(retAddr + 8, 0)
            }
          },

          // func valueLength(v ref) int
          'syscall/js.valueLength': (vRef) => {
            return unboxValue(vRef).length
          },

          // valuePrepareString(v ref) (ref, int)
          'syscall/js.valuePrepareString': (retAddr, vRef) => {
            const s = String(unboxValue(vRef))
            const str = encoder.encode(s)
            storeValue(retAddr, str)
            mem().setInt32(retAddr + 8, str.length, true)
          },

          // valueLoadString(v ref, b []byte)
          'syscall/js.valueLoadString': (vRef, slicePtr, sliceLen, sliceCap) => {
            const str = unboxValue(vRef)
            loadSlice(slicePtr, sliceLen, sliceCap).set(str)
          },

          // func valueInstanceOf(v ref, t ref) bool
          'syscall/js.valueInstanceOf': (vRef, tRef) => {
            return unboxValue(vRef) instanceof unboxValue(tRef)
          },

          // func copyBytesToGo(dst []byte, src ref) (int, bool)
          'syscall/js.copyBytesToGo': (retAddr, destAddr, destLen, destCap, srcRef) => {
            const numBytesCopiedAddr = retAddr
            const returnedStatusAddr = retAddr + 4 // Address of returned boolean status variable

            const dst = loadSlice(destAddr, destLen)
            const src = unboxValue(srcRef)
            if (!(src instanceof Uint8Array || src instanceof Uint8ClampedArray)) {
              mem().setUint8(returnedStatusAddr, 0) // Return 'not ok' status
              return
            }
            const toCopy = src.subarray(0, dst.length)
            dst.set(toCopy)
            mem().setUint32(numBytesCopiedAddr, toCopy.length, true)
            mem().setUint8(returnedStatusAddr, 1) // Return 'ok' status
          },

          // copyBytesToJS(dst ref, src []byte) (int, bool)
          // Originally copied from upstream Go project, then modified:
          //   https://github.com/golang/go/blob/3f995c3f3b43033013013e6c7ccc93a9b1411ca9/misc/wasm/wasm_exec.js#L404-L416
          'syscall/js.copyBytesToJS': (retAddr, dstRef, srcAddr, srcLen, srcCap) => {
            const numBytesCopiedAddr = retAddr
            const returnedStatusAddr = retAddr + 4 // Address of returned boolean status variable

            const dst = unboxValue(dstRef)
            const src = loadSlice(srcAddr, srcLen)
            if (!(dst instanceof Uint8Array || dst instanceof Uint8ClampedArray)) {
              mem().setUint8(returnedStatusAddr, 0) // Return 'not ok' status
              return
            }
            const toCopy = src.subarray(0, dst.length)
            dst.set(toCopy)
            mem().setUint32(numBytesCopiedAddr, toCopy.length, true)
            mem().setUint8(returnedStatusAddr, 1) // Return 'ok' status
          }
        }
      }

      // Go 1.20 uses 'env'. Go 1.21 uses 'gojs'.
      // For compatibility, we use both as long as Go 1.20 is supported.
      this.importObject.env = this.importObject.gojs
    }

    async run (instance) {
      this._inst = instance
      this._values = [ // JS values that Go currently has references to, indexed by reference id
        NaN, 0, null, true, false, global, this]
      this._goRefCounts = []
      this._ids = new Map()
      this._idPool = []
      this.exited = false
      this.exitCode = 0

      if (this._inst.exports._start) {
        const exitPromise = new Promise((resolve, reject) => {
          this._resolveExitPromise = resolve
        })

        // Run program, but catch the wasmExit exception that's thrown
        // to return back here.
        try {
          this._inst.exports._start()
        } catch (e) {
          if (e !== wasmExit) throw e
        }

        await exitPromise
        return this.exitCode
      } else {
        this._inst.exports._initialize()
      }
    }

    _resume () {
      if (this.exited) {
        throw new Error('Go program has already exited')
      }
      try {
        this._inst.exports.resume()
      } catch (e) {
        if (e !== wasmExit) throw e
      }
      if (this.exited) {
        this._resolveExitPromise()
      }
    }

    _makeFuncWrapper (id) {
      const go = this
      return function () {
        const event = {
          id,
          this: this,
          args: arguments
        }
        go._pendingEvent = event
        go._resume()
        return event.result
      }
    }
  }

  if (global.require && global.require.main === module && global.process && global.process.versions && !global.process.versions.electron) {
    if (process.argv.length !== 3) {
      console.error('usage: go_js_wasm_exec [wasm binary] [arguments]')
      process.exit(1)
    }

    const go = new global.Go()
    WebAssembly.instantiate(global.fs.readFileSync(process.argv[2]), go.importObject).then(async (result) => {
      const exitCode = await go.run(result.instance)
      process.exit(exitCode)
    }).catch((err) => {
      console.error(err)
      process.exit(1)
    })
  }
})()
