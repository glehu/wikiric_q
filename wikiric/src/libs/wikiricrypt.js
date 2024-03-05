const Wikiricrypt = {
  _members: new Map(),
  setMembers: function (members) {
    this._members = members
  },
  decryptPayload: async function (encryptedMessageObj, userId, key) {
    let decryptedMessage
    const encryptionPrefix = '[c:MSG<ENCR]'
    if (encryptedMessageObj.msg.startsWith(encryptionPrefix)) {
      encryptedMessageObj = JSON.parse(encryptedMessageObj.msg.substring(12))
      for (let i = 0; i < encryptedMessageObj.keys.length; i++) {
        const keyPair = encryptedMessageObj.keys[i]
        if (keyPair.id === userId) {
          // Step 1: Decrypt the RSA encrypted AES key
          const decipherRSA = this._base64ToArrayBuffer(keyPair.key)
          const decryptedRSA = await this._decryptMessageRSA(decipherRSA, key)
          const aesPayload = JSON.parse(decryptedRSA)
          const decipherAES = this._base64ToArrayBuffer(encryptedMessageObj.message)
          const aesKey = await this._importSecretKey(await this._base64ToArrayBuffer(aesPayload.key))
          // Step 2: Decrypt the AES encrypted message
          decryptedMessage = await this._decryptMessageAES(
            decipherAES,
            aesKey,
            this._base64ToArrayBuffer(aesPayload.iv))
        }
      }
    } else {
      decryptedMessage = encryptedMessageObj.msg
    }
    return new Promise((resolve) => {
      resolve(decryptedMessage)
    })
  },
  encryptPayload: async function (messageContent) {
    const aesKey = await this._generateAESKey()
    const iv = this._generateIvAES()
    const cipher = await this._encryptMessageAES(messageContent, aesKey, iv)
    const encryptedMessage = this._arrayBufferToBase64(cipher)
    // Encrypt AES key + iv for each participant with RSA encryption
    const aesPayload = {
      key: this._arrayBufferToBase64(await this._exportAESKey(aesKey)),
      iv: this._arrayBufferToBase64(iv)
    }
    const keyArray = []
    for (const [key, user] of this._members.entries()) {
      if (key && user.pubkey != null && user.pubkey !== '') {
        const pubKey = await this._importRSAPubKey(user.pubkey)
        const cipher2 = await this._encryptMessageRSA(JSON.stringify(aesPayload), pubKey)
        const encrypted2 = this._arrayBufferToBase64(cipher2)
        keyArray.unshift({
          id: user.usr,
          key: encrypted2
        })
      }
    }
    return new Promise((resolve) => {
      let encryptedMessageObj = JSON.stringify({
        keys: keyArray,
        message: encryptedMessage
      })
      encryptedMessageObj = '[c:MSG<ENCR]' + encryptedMessageObj
      resolve(encryptedMessageObj)
    })
  },
  _base64ToArrayBuffer: function (base64) {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  },
  _decryptMessageRSA: async function (content, keyPair) {
    const privKey = await this._importRSAPrivKey(keyPair.priv)
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP'
      },
      privKey,
      content
    )
    return new TextDecoder().decode(decrypted)
  },
  _importRSAPrivKey: function (pem) {
    // fetch the part of the PEM string between header and footer
    const pemHeader = '-----BEGIN PRIVATE KEY-----'
    const pemFooter = '-----END PRIVATE KEY-----'
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length)
    // base64 decode the string to get the binary data
    const binaryDerString = window.atob(pemContents)
    // convert from a binary string to an ArrayBuffer
    const binaryDer = this._stringToArrayBuffer(binaryDerString)
    return window.crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-384'
      },
      true,
      ['decrypt']
    )
  },
  _decryptMessageAES: async function (content, key, iv) {
    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv
      },
      key,
      content
    )
    return new TextDecoder().decode(decrypted)
  },
  _stringToArrayBuffer: function (str) {
    const buf = new ArrayBuffer(str.length)
    const bufView = new Uint8Array(buf)
    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i)
    }
    return buf
  },
  _importSecretKey: function (rawKey) {
    return window.crypto.subtle.importKey(
      'raw',
      rawKey,
      'AES-CBC',
      true,
      ['encrypt', 'decrypt']
    )
  },
  _generateAESKey: async function () {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-CBC',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    )
  },
  _encodeStringUInt: function (content) {
    return new TextEncoder().encode(content)
  },
  _encryptMessageRSA: async function (content, pubKey) {
    const encoded = this._encodeStringUInt(content)
    return await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP'
      },
      pubKey,
      encoded
    )
  },
  _generateIvAES: function () {
    return window.crypto.getRandomValues(new Uint8Array(16))
  },
  _arrayBufferToBase64: function (buffer) {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const len = bytes.byteLength
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  },
  _exportAESKey: async function (key) {
    const exported = await window.crypto.subtle.exportKey(
      'raw',
      key
    )
    return new Uint8Array(exported)
  },
  _encryptMessageAES: async function (content, key, iv) {
    const encoded = this._encodeStringUInt(content)
    return await window.crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv
      },
      key,
      encoded
    )
  },
  _importRSAPubKey: async function (pem) {
    const pemHeader = '-----BEGIN PUBLIC KEY-----'
    const pemFooter = '-----END PUBLIC KEY-----'
    const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length)
    const binaryDerString = window.atob(pemContents)
    const binaryDer = this._stringToArrayBuffer(binaryDerString)
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-384'
      },
      true,
      ['encrypt']
    )
  }
}
export default Wikiricrypt
