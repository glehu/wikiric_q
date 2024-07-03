import Wikiricrypt from './wikiricrypt'

/**
 * # The official wikiric SDK
 *
 * ---
 *
 * ## Features
 *
 * This SDK provides easy access to the chat functionality.
 *
 * - Easy login
 * - Easy chat session creation
 * - Automatic chat session authorization
 * - Decryption of incoming E2E encrypted messages
 * - Sending of messages
 * - Receiving and sending of backend messages and commands
 *
 * ## Dependencies
 *
 * The only requirement to be able to use this SDK is the `wikiricrypt` library
 * that is being developed for wikiric, too. The library needs to be in
 * the same folder as the wikiric SDK.
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
 * await wikiric.login('yourUsername', 'yourPassword')
 * await wikiric.doSync()
 *
 * // 2. Connect to the chat group's channel
 * wikiric.connect('yourChannelID', 'yourPrivateKey')
 *
 * // 3. Listen to the chat group's incoming messages
 * const messages = new BroadcastChannel('wikiric_msg')
 * messages.onmessage = event => { console.log('New Message', event.data) }
 *
 * // 4. Send a message to the chat group
 * wikiric.sendMessage('Hello World!')
 *
 * // 5. Listen to backend messages
 * const events = new BroadcastChannel('wikiric_connector')
 * events.onmessage = event => { console.log('Connector', event.data) }
 * ```
 */
const wikiricSDK = {
  // Broadcast channel for chat messages
  chatMessageChannel: new BroadcastChannel('wikiric_msg'),

  // Broadcast channel for connector (backend) messages
  connectorChannel: new BroadcastChannel('wikiric_connector'),

  // Internal variables
  _username: '',
  _token: '',
  _key: null,
  _websocket: null,
  _websocketState: 'CLOSED',
  _connector: null,
  _connectorState: 'CLOSED',
  _isAuthorized: false,
  _isSynchronized: false,
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
    const _u = window.btoa(username + ':' + password)
    this._username = username
    return new Promise((resolve, reject) => {
      let response = null
      const headers = new Headers()
      headers.set('Authorization', 'Basic ' + _u)
      fetch('https://wikiric.xyz/auth/private/signin', {
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
      this._connector = new WebSocket('wss://wikiric.xyz/ws/connector')
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
      this._websocket = new WebSocket(`wss://wikiric.xyz/ws/chat/${chatID}${searchParams}`)
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
