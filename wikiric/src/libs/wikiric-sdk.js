/*
 * Copyright (c) 2024.
 * Module wikiric-sdk.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import Wikiricrypt from './wikiricrypt'

/**
 * # The official wikiric SDK
 *
 * ---
 *
 * ## Features
 *
 * This SDK provides easy access to the Chat, Encryption and SyncRoom functionality for wikiric.
 *
 * - Easy login
 * - Easy chat session creation
 * - Automatic chat session authorization
 * - Decryption of incoming E2E encrypted messages
 * - Encrypting and sending of messages
 * - Receiving and sending of backend messages and commands
 * - Connecting to arbitrarily named SyncRooms with features as broadcasting messages, setting and getting data etc.
 *
 * ## Dependencies
 *
 * The only mandatory requirement to be able to use this SDK is the `wikiricrypt` library
 * that is being developed for wikiric, too. The library needs to be in
 * the same folder as the wikiric SDK.
 *
 * This SDK offers WebRTC functionality, too, though, so you might be interested in using the "wRTC" library
 * which is also being developed for wikiric. The backend implements the WebRTC specifications by utilizing
 * the Pion/webrtc library, which is written in GO, just like wikiric's backend itself.
 *
 * ## Private Key
 *
 * To get the private key which is needed to connect to a chat group
 * you need to open the targeted chat group, click on your profile and then on "Transfer".
 * On the bottom side of the modal you will see the button to copy the private Key.
 *
 * ## Code
 *
 * Quick Start Copy&Paste Template:
 *
 * ```js
 * // 0. Initialize SDK
 * const wikiric = wikiricSDK
 *
 * // 1. Authorize and Synchronize
 * await wikiric.login('yourUsername', window.btoa('yourPassword'))
 * await wikiric.doSync()
 *
 * // 2. Connect to the chat group's channel
 * wikiric.connect('yourChannelID', 'yourPrivateKey')
 *
 * // 3. Listen to the chat group's incoming messages
 * const messages = new BroadcastChannel('wikiric_msg')
 * messages.onmessage = event => { console.log('New Message', event.data) }
 *
 * // 4. Send an unencrypted message to the chat group
 * wikiric.sendMessage('Hello World!')
 *
 * // 5. Send an encrypted message to the chat group
 * // First, prepare the pubkey map (you only have to do this once and for any new member)
 * const pubKeys = new Map()
 * if (this.members != null && this.members.size > 0) {
 *   for (const [key, member] of this.members.entries()) {
 *     if (key && member.pubkey != null) {
 *       pubKeys.set(member.usr, member.pubkey)
 *     }
 *   }
 * }
 * this.sdk._wcrypt.setMembers(pubKeys)
 * // Then, encrypt and send the message
 * const message = 'Secret Hello World!'
 * const encryptedMessage = await this.sdk._wcrypt.encryptPayload(message)
 * wikiric.sendMessage(encryptedMessage)
 *
 * // 5. Listen to backend messages
 * const events = new BroadcastChannel('wikiric_connector')
 * events.onmessage = event => { console.log('Connector', event.data) }
 *
 * // 6. Connect to a SyncRoom, which basically acts as a temporary
 * //    websocket pool/room for message distribution,
 * //    data setting and getting, latency testing and more.
 * await wikiric.doJoinSyncRoom('yourRoomIdOrName')
 *
 * // 7. Listen for SyncRoom messages
 * const eventsSync = new BroadcastChannel('wikiric_sync')
 * eventsSync.onmessage = event => { console.log('SyncRoom', event.data) }
 *
 * // 8. Broadcast a SyncRoom message
 * wikiric.sendSyncRoomMessage('Hello World!')
 * ```
 */
const wikiricSDK = {
  // Broadcast channel for chat messages
  chatMessageChannel: new BroadcastChannel('wikiric_msg'),

  // Broadcast channel for connector (backend) messages
  connectorChannel: new BroadcastChannel('wikiric_connector'),

  // Broadcast channel for sync room messages
  syncRoomChannel: new BroadcastChannel('wikiric_sync'),

  // Internal variables
  _serverURL: 'https://wikiric.xyz', // 'http://localhost:9999' 'https://wikiric.xyz'
  _wssURL: 'wss://wikiric.xyz', // 'ws://localhost:9999' 'wss://wikiric.xyz'
  _username: '',
  _token: '',
  _key: null,
  _websocket: null,
  _websocketState: 'CLOSED',
  _connector: null,
  _connectorState: 'CLOSED',
  _syncRoomID: '',
  _syncRoom: null,
  _syncRoomState: 'CLOSED',
  _isAuthorized: false,
  _isSynchronized: false,
  _isSRoomSynchronized: false,
  _isSRLatencyChecking: false,
  _currentSRPPState: 0,
  _currentSRLatency: -1,
  _isBanned: false,
  _wcrypt: Wikiricrypt,
  /**
   * Authorizes a user and retrieves a JWT token
   *
   * Example call:
   *
   * ```
   * await WikiricSDK.doLogin('usr', 'pass')
   * ```
   * @param {String} username
   * @param {String} password
   * @returns {Promise<Boolean>}
   */
  doLogin: async function (username, password) {
    const _u = window.btoa(username + ':' + window.atob(password))
    this._username = username
    return new Promise((resolve, reject) => {
      let response = null
      const headers = new Headers()
      headers.set('Authorization', 'Basic ' + _u)
      fetch(`${this._serverURL}/auth/private/signin`, {
        method: 'get',
        headers
      })
      .then((res) => res.json())
      .then((data) => (response = data))
      .then(() => {
        if (response.httpCode === 200) {
          this._token = response.token
          resolve(response.token)
        } else {
          reject(Error('401'))
        }
      })
      .catch((e) => {
        if (e) {
          reject(Error('401'))
        }
      })
    })
  },
  /**
   * Connects to the wikiric backend, enabling bidirectional communication.
   *
   * **Important:**
   *
   * If multiple instances of the wikiric SDK exist it is recommended
   * to have one of those instances run globally and have it execute doSync()
   *
   * Example call:
   *
   * ```
   * await WikiricSDK.doSync()
   * ```
   * @returns {Promise<Boolean>}
   */
  doSync: async function () {
    return new Promise((resolve, reject) => {
      this._connector = new WebSocket(`${this._wssURL}/ws/connector`)
      this._connectorState = 'CLOSED'
      this._connector.onopen = async () => {
        this._connector.onmessage = (event) => {
          let message = event.data
          if (message.startsWith('[s:wlcm]')) {
            this._isSynchronized = true
          } else {
            // Parse JSON object if provided
            if (message.startsWith('{')) {
              message = JSON.parse(message)
            } else {
              // Create object
              message = {
                typ: message
              }
            }
            // Distribute message to broadcast channel
            this.connectorChannel.postMessage(message)
          }
        }
        this._connector.send(this._token)
        this._connectorState = 'OPEN'
      }
      this._connector.onclose = async () => {
        this._connector = null
        this._connectorState = 'CLOSED'
      }
      resolve(true)
    })
  },
  doJoinSyncRoom: async function (roomId) {
    if (!roomId) return
    if (!this._token) return
    this._syncRoomID = roomId
    return new Promise((resolve, reject) => {
      this._syncRoom = new WebSocket(`${this._wssURL}/ws/synced/${this._syncRoomID}`)
      this._syncRoomState = 'CLOSED'
      this._syncRoom.onopen = async () => {
        this._syncRoom.onmessage = (event) => {
          let message = event.data
          if (message.startsWith('[s:wlcm]')) {
            this._isSRoomSynchronized = true
            resolve(true)
          } else {
            // Parse JSON object if provided
            if (message.startsWith('{')) {
              message = JSON.parse(message)
            } else {
              // Create object
              message = {
                typ: message
              }
            }
            // Sanitize
            if (!message.a) {
              message.a = ''
            }
            if (!message.t) {
              message.t = ''
            }
            // Is this a special message?
            if (message.a.startsWith('[s:A]')) {
              // Respond with a Pong (B)
              this._currentSRPPState += 1
              this.sendSyncRoomMessage(('[c:B]'))
            } else if (message.a.startsWith('[s:L]')) {
              // Latency response
              const lat = message.a.substring(5)
              this._currentSRLatency = parseFloat(lat)
              // Distribute message to broadcast channel
              message.a = `[LAT]${this._currentSRLatency}`
              this.syncRoomChannel.postMessage(message)
            } else {
              // Distribute message to broadcast channel
              this.syncRoomChannel.postMessage(message)
            }
          }
        }
        this._syncRoom.send(this._token)
        this._syncRoomState = 'OPEN'
      }
      this._syncRoom.onclose = async () => {
        this._syncRoom = null
        this._syncRoomState = 'CLOSED'
        this._syncRoomID = ''
      }
    })
  },
  /**
   * Creates a wikiric chat session for the provided chatID and privateKey
   * to be able to connect to channels.
   *
   * The chat session automatically gets authorized, so you can just listen to this SDKs event channel.
   *
   * @param {String} chatID
   * @param {String} privateKey
   * @param {String} pw
   * @param {String} ref
   * @returns {Promise<Boolean>}
   */
  doConnect: async function (chatID, privateKey, pw = '', ref = '') {
    return new Promise((resolve, reject) => {
      // Disconnect from previous session
      this.doDisconnect()
      this._key = {
        id: chatID,
        priv: privateKey
      }
      // Construct connection URL and parameters
      const params = {}
      if (pw && pw !== '') {
        params.pw = pw
      }
      if (ref && ref !== '') {
        params.ref = ref
      }
      let searchParams = new URLSearchParams(params).toString()
      if (searchParams && searchParams !== '') {
        searchParams = `?${searchParams}`
      }
      // Connect to backend and listen for welcome and banned message
      this._websocket = new WebSocket(`${this._wssURL}/ws/chat/${chatID}${searchParams}`)
      this._websocketState = 'CLOSED'
      this._websocket.onopen = async () => {
        this._websocket.onmessage = (event) => {
          const message = event.data
          if (message.substring(0, 8) === '[s:wlcm]') {
            // Info message -> User authorized
            this._isAuthorized = true
            // Notify users of chat session
            this._websocket.send(`[c:SC][online]${this._username}`)
          } else if (message.substring(0, 10) === '[s:banned]') {
            // Info message -> User banned from chat
            this._isAuthorized = false
            this._isBanned = true
            reject('banned')
          } else {
            // User relevant message -> forward
            this._processRawMessage(message)
          }
        }
        // Authorize session
        this._websocket.send(this._token)
        this._websocketState = 'OPEN'
      }
      // Handle end of life for websocket connection
      this._websocket.onclose = async () => {
        if (this._websocketState !== 'OPEN') return
        this._websocket = null
        this._websocketState = 'CLOSED'
        this._isAuthorized = false
      }
      resolve(true)
    })
  },
  /**
   * Disconnects from the current wikiric chat session.
   */
  doDisconnect: function () {
    // Check session
    if (this._websocketState !== 'OPEN') return
    this._websocketState = 'CLOSED'
    if (this._websocket == null) return
    // Notify users from chat session
    this._websocket.send(`[c:SC][offline]${this._username}`)
    // Close session
    this._websocket.close()
  },
  /**
   * Sends a message to the wikiric chat session.
   *
   * Returns true if the message was sent, otherwise it will return false
   * @param {String} text
   * @returns {boolean}
   */
  sendMessage: function (text) {
    if (this._websocketState === 'OPEN' && this._websocket != null && this._isAuthorized && !this._isBanned) {
      this._websocket.send(text)
      return true
    } else {
      return false
    }
  },
  /**
   * Decrypts a message of the wikiric chat session.
   *
   * Returns the decrypted message if it is encrypted, otherwise returns the same message
   * @param {Object} message
   * @returns {Object}
   */
  decryptMessage: async function (message) {
    // Decrypt message if it is encrypted, otherwise return the same message
    if (message.msg.startsWith('[c:MSG<ENCR]')) {
      message._isEncrypted = true
      try {
        message.msg = await this._wcrypt.decryptPayload(message, this._username, this._key)
        if (message.msg == null) {
          message = this.markMessageDecryptionError(message)
        }
      } catch (e) {
        console.debug('ENCRYPTION ERROR', e.message)
        message = this.markMessageDecryptionError(message)
      }
    }
    return message
  },
  /**
   * Marks the message because of a failed decryption
   *
   * @param {Object} message
   * @returns {Object}
   */
  markMessageDecryptionError: function (message) {
    message.msg = 'The message could not be decrypted.'
    message._mType = 'CryptError'
    message._isApi = false
    message._decryptionFailed = true
    message.reacts = []
    return message
  },
  /**
   * Sends a message to the wikiric backend.
   *
   * Returns true if the message was sent, otherwise it will return false
   *
   * @param {Object|String} msg
   * @returns {boolean}
   */
  sendConnectorMessage: function (msg) {
    if (!this._isSynchronized) return false
    if (!this._connector) return false
    let txt
    if (typeof msg === 'object') {
      txt = JSON.stringify(msg)
    } else {
      txt = msg
    }
    this._connector.send(txt)
    return true
  },
  /**
   * Sends a message to the current SyncRoom.
   *
   * Returns true if the message was sent, otherwise it will return false
   *
   * @param {Object|String} msg
   * @returns {boolean}
   */
  sendSyncRoomMessage: function (msg) {
    if (!this._isSRoomSynchronized) return false
    if (!this._syncRoom) return false
    let txt
    if (typeof msg === 'object') {
      txt = JSON.stringify(msg)
    } else {
      txt = msg
    }
    this._syncRoom.send(txt)
    return true
  },
  sendSyncRoomWRTC: function (type, content) {
    if (!content) {
      return
    }
    type = type.toUpperCase()
    let prefix
    switch (type) {
      case 'ICE':
        // Sending of ICE Candidates is allowed
        prefix = '[c:WRTC]ICE;'
        break
      case 'OFFER':
        // Sending of Offers (Local Description) is allowed
        prefix = '[c:WRTC]OFFER;'
        break
      case 'ANSWER':
        // We expect Answers (Remote Description) but do not send them
        // As of 13.11.2024 the wikiric backend would answer with "Service Unavailable" anyway
        return
      case 'DC':
        // User can close the connection on his own
        prefix = '[c:WRTC]DC'
        break
      default:
        // Avoid sending unknown types (e.g. due to malformed input)
        return
    }
    let msg = prefix + content
    msg = msg.trim()
    this.sendSyncRoomMessage(msg)
  },
  /**
   * Starts a Ping-Pong process by sending a latency request to the server.
   * The process will be as follows:
   *    1. Server Ping 1
   *    2. Client Pong 1
   *    3. Server Ping 2
   *    4. Client Pong 2
   *    5. Server responds with the average latency in ms
   */
  calculateSyncRoomLatency: function () {
    this._currentSRPPState = 0
    this._isSRLatencyChecking = true
    this.sendSyncRoomMessage('[c:L]')
  },
  /**
   * Forwards a message to a specific user.
   *
   * Returns true if the message was sent, otherwise it will return false
   *
   * @param {Object|String} message
   * @param {String} type
   * @param {String} username
   * @returns {boolean}
   */
  forwardMessage: function (message, type, username) {
    let txt
    if (typeof message === 'object') {
      txt = JSON.stringify(message)
    } else {
      txt = message
    }
    const payload = {
      act: '[c:FWD]',
      typ: type,
      msg: txt,
      usr: username
    }
    return this.sendConnectorMessage(payload)
  },
  _processRawMessage: async function (message) {
    // Convert string message to object
    message = JSON.parse(message)
    // Process predefined keywords
    message = this.processMessageKeywords(message)
    // Is the message encrypted?
    message = await this.decryptMessage(message)
    // Distribute message to broadcast channel
    this.chatMessageChannel.postMessage(message)
  },
  /**
   *
   * @param {Object} message
   * @returns {*}
   */
  processMessageKeywords: function (message) {
    if (message.action === 'edit') {
      message._mType = 'EditNotification'
    } else if (message.action === 'react') {
      message._mType = 'ReactNotification'
    } else if (message.msg.includes('[s:RegistrationNotification]') === true && message.usr === '_server') {
      message._mType = 'RegistrationNotification'
      message.msg = message.msg.substring(28)
    } else if (message.msg.includes('[s:Leaderboard]') === true && message.usr === '_server') {
      message._mType = 'Leaderboard'
      message.msg = message.msg.substring(15)
    } else if (message.msg.includes('[c:GIF]') === true) {
      message._mType = 'GIF'
      message._isApi = true
      message.msg = message.msg.substring(7)
    } else if (message.msg.includes('[c:JOKE]') === true) {
      message._mType = 'Joke'
      message._isApi = true
      message.msg = message.msg.substring(8)
    } else if (message.msg.includes('[c:IMG]') === true) {
      message._mType = 'Image'
      message._isApi = true
      message._isFile = true
      message.msg = message.msg.substring(7)
    } else if (message.msg.includes('[c:AUD]') === true) {
      message._mType = 'Audio'
      message._isApi = true
      message._isFile = true
      message.msg = message.msg.substring(7)
    } else if (message.msg.includes('[c:TASK]') === true) {
      message._mType = 'Task'
      message._isApi = true
      message.msg = message.msg.substring(8)
    } else if (message.msg.includes('[c:REPLY]') === true) {
      message._mType = 'Reply'
      message.msg = message.msg.substring(9)
    } else if (message.msg.includes('[c:TXT]') === true) {
      message._mType = 'TextFile'
      message._isApi = true
      message._isFile = true
      message.msg = message.msg.substring(7)
    } else if (message.msg.includes('[c:ZIP]') === true) {
      message._mType = 'ZipFile'
      message._isApi = true
      message._isFile = true
      message.msg = message.msg.substring(7)
    } else if (message.msg.includes('[c:FIL]') === true) {
      message._mType = 'File'
      message._isApi = true
      message._isFile = true
      message.msg = message.msg.substring(7)
    }
    return message
  }
}
export default wikiricSDK
