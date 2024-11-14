/*
 * Copyright (c) 2024.
 * Module wRTC.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import adapter from 'webrtc-adapter'
import wikiricSDK from 'src/libs/wikiric-sdk'

/**
 * wRTC.js handles wikiric's WebRTC P2P + DataChannel needs in cooperation with the wikiric.xyz Connector.
 *
 * WebRTC allows us to communicate with other clients in near real time, making Audio/Video chat, screensharing
 * and even multiplayer games possible.
 *
 * wRTC.js uses the Partially Reliable Stream Control Transport Protocol (PR-SCTP)
 * for our WebRTC DataChannel to ensure:
 *
 * 1. Better performance than TCP (no ACK and no resending of frames)
 * 2. Better reliability than UDP (discarding of delayed frames)
 *
 * This protocol is useful for media streaming or streaming data of no chronological importance.
 */
const WRTC = {
  pause: false,
  worker: null,
  doLog: true,
  doLogVerbose: false,
  selfName: null,
  dummyStream: null, /*
  DATA
   */
  eventChannel: new BroadcastChannel('wrtcevents'),
  connector: new BroadcastChannel('wikiric_connector'),
  syncRoomChannel: new BroadcastChannel('wikiric_sync'),
  iceConfig: {
    iceServers: [{
      urls: ['stun:wikiric.xyz:3478']
    }, {
      urls: 'turn:wikiric.xyz:3478',
      username: 'wikiturnric',
      credential: 'turnipricwiki'
    }],
    iceCandidatePoolSize: 10
  },
  peerConnections: new Map(),
  logStyle: 'color: #FFF; background-color: #000; padding: 4px; font-weight: bold;', /*
  FUNCTIONS
   */
  /***
   * Initialize wRTC.js
   *
   * @param {wikiricSDK} worker - wikiricSDK instance
   * @param {string} selfName - Your username
   * @param {boolean} [doLog=true] - Enables simple logging
   * @param {boolean} [doLogVerbose=false] - Enables extensive logging
   * @param {boolean} [pause=false] - If true, ignores new incoming connection attempts
   * @param {MediaStream|null} [dummyStream=null] - Dummy video stream to be used on new connections prior to real media
   */
  initialize: function (worker, selfName, doLog = true, doLogVerbose = false, pause = false, dummyStream = null) {
    // ### Check
    if (worker == null || selfName == null) {
      console.log('%cERROR while initializing', this.logStyle, 'worker and selfName are mandatory!')
    }
    // ### Initialize wRTC ###
    this.pause = pause
    this.worker = worker
    if (!this.worker) {
      // This instance is not logged in, so it will not do anything
      // Maybe the user will replace this worker with a... working one. Heh.
      this.worker = wikiricSDK
    }
    if (this.worker._syncRoom != null) {
      this.setUpSyncRoom()
    }
    this.selfName = selfName
    this.doLog = doLog
    this.doLogVerbose = doLogVerbose
    this.dummyStream = dummyStream
    // ###
    console.log(`%cHey, ${this.selfName}!`, this.logStyle, 'Running on', adapter.browserDetails.browser, adapter.browserDetails.version)
    // Initialize Connector listener - this is the signaling server for users
    // For the backend connection, we use the SyncRoom functionality, instead
    this.connector.onmessage = async event => {
      if (event.data.typ == null) return
      // Listen for WebRTC related data
      if (event.data.typ !== 'wRTC') {
        return
      }
      if (event.data.msg.length >= 10 && event.data.msg.substring(0, 10) === '[c:hangup]') {
        const usr = event.data.msg.substring(10)
        this.hangup(usr)
        const payload = {
          event: 'peer_dc',
          selfName: this.selfName,
          remoteName: usr
        }
        this.eventChannel.postMessage(payload)
        return
      }
      const payload = JSON.parse(event.data.msg)
      if (payload.remoteName == null) return
      if (payload.description) {
        // Incoming Offer or Answer
        if (this.doLog) {
          console.log(`%cIncoming ${payload.description.type}`, this.logStyle)
        }
        await this.handleIncomingDescription(payload.remoteName, payload.description)
      } else if (payload.candidate) {
        // Incoming ICE candidate
        await this.handleIncomingIce(payload.remoteName, payload.candidate)
      }
    }
  },
  /***
   * Initiates a Peer to Peer Connection including a DataChannel if specified.
   *
   * ---
   *
   * #### Protocol
   *
   * wRTC.js uses the Partially Reliable Stream Control Transport Protocol (PR-SCTP)
   * for our WebRTC DataChannel to ensure:
   *
   * 1. Better performance than TCP (no ACK and no resending of frames)
   * 2. Better reliability than UDP (discarding of delayed frames)
   *
   * This protocol is useful for media streaming or streaming data of no chronological importance.
   *
   * It is advised to periodically send data where a single missed frame could cause problems.
   *
   * ---
   *
   * #### remoteName
   *
   * The peer connection will be initialized for the username being provided.
   * The signaling happens automatically for two cases:
   *
   *    1. username being "_server"
   *
   *        In this case, a SyncRoom message will be sent to the wikiric backend to handle signaling
   *        This only works if the user is connected to a SyncRoom to allow DataChannel messages to be
   *        ...distributed to other peers connected to the same SyncRoom. A workaround would be just using
   *        ...the SyncRoom's websocket connection, which would be slower, though.
   *    2. username not being "_server"
   *
   *       If a user is targeted instead of the backend, a wikiric Connector message will be sent to handle signaling
   *
   * @param {(MediaStream|null)} stream - Outgoing media stream
   * @param {string} remoteName - Remote username
   * @param {boolean} [createDataChannel=true] - Specifies if a data channel needs to be created
   * @param {boolean} [polite=false] - Impolite (false) basically means we are SENDING an offer, not expecting one
   */
  initiatePeerConnection: function (stream, remoteName, createDataChannel = true, polite = false) {
    // Check remote name since it may be targeting the backend directly
    if (remoteName == null) {
      if (this.doLog) {
        console.log('%cInvalid Configuration', this.logStyle, 'for initiatePeerConnection!')
        console.log('---> No remoteName!')
        return
      }
    } else {
      remoteName = remoteName.trim()
      if (remoteName.toLowerCase() === '_server') {
        remoteName = '_server'
        // We only send offers to the backend, so we cannot be polite
        polite = false
        // We need to open up a data channel, otherwise the p2p connection would be useless
        createDataChannel = true
        // We will not send a track since this feature is not supported by the backend, yet
        stream = null
      }
    }
    if (this.peerConnections.has(remoteName)) {
      if (this.doLog) {
        console.log('%cRenegotiating Peer Connection', this.logStyle, 'for', remoteName)
      }
    } else {
      if (this.doLog) {
        if (!polite) console.log('%cIMPOLITELY Initializing Peer Connection >:(', this.logStyle, 'to', remoteName)
        if (polite) console.log('%cPOLITELY Initializing Peer Connection O:)', this.logStyle, 'to', remoteName)
      }
      this.peerConnections.set(remoteName, new RTCPeerConnection(this.iceConfig))
      // If no stream was provided, the connection attempt must have been a remote one -> Notify
      if (stream == null) {
        const payload = {
          event: 'peer_init',
          selfName: this.selfName,
          remoteName
        }
        this.eventChannel.postMessage(payload)
        if (this.dummyStream) {
          stream = this.dummyStream
          if (this.doLog) {
            console.log('%cDummy stream used', this.logStyle, 'for', remoteName)
          }
        }
      }
    }
    // Create and initialize P2P connection
    const peerConnection = this.peerConnections.get(remoteName)
    peerConnection._selfName = this.selfName
    peerConnection._remoteName = remoteName
    peerConnection._candidates = []
    peerConnection._incomingCandidates = []
    peerConnection._candidateCounter = 0
    peerConnection._stream = null
    peerConnection._streamCounter = 0
    peerConnection._iceAvailable = false
    peerConnection._isAccepted = true // TODO: Check if needed to be true
    peerConnection._isMakingOffer = false
    peerConnection._isIgnoringOffer = false
    peerConnection._polite = polite
    peerConnection._hasStream = false
    // Add tracks if present
    if (stream != null) {
      peerConnection._hasStream = true
      let sCount = 1
      stream.getTracks().forEach(track => {
        if (this.doLog) {
          console.debug(`%cADD TRACK ${sCount}`, this.logStyle, 'for', remoteName, track.kind)
          sCount++
        }
        try {
          peerConnection.addTrack(track, stream)
        } catch (e) {
          console.log('(Track was not added)')
        }
      })
      // } else {
      //   this.replaceTrack(stream, 'audio')
      //   this.replaceTrack(stream, 'video')
      // }
    }
    // Create data channel if desired
    if (createDataChannel) {
      if (this.doLog) {
        console.debug('%cADD DATA CHANNEL', this.logStyle, 'for', remoteName)
      }
      if (!peerConnection._dataChannel) {
        // We use the Partially Reliable Stream Control Transport Protocol (PR-SCTP)
        // ...for our WebRTC DataChannel to ensure...
        //
        // 1. Better performance than TCP (no ACK and no resending of frames)
        // 2. Better reliability than UDP (discarding of delayed frames)
        //
        // This protocol is useful for media streaming or streaming data of no chronological importance.
        //
        // It is advised to periodically send data where a single missed frame could cause problems.
        if (remoteName === '_server') {
          peerConnection._dataChannel = peerConnection.createDataChannel('data', {
            ordered: true,
            maxRetransmits: 0
          })
        } else {
          peerConnection._dataChannel = peerConnection.createDataChannel('data', {
            negotiated: true,
            id: 0,
            ordered: true,
            maxRetransmits: 0
          })
        }
        const doLog = this.doLog
        const logStyle = this.logStyle
        const eventChannel = this.eventChannel
        peerConnection._dataChannel.addEventListener('open', _ => {
          if (doLog) {
            console.debug('%c(OUT) DATA CHANNEL OPEN', logStyle, 'to', remoteName)
          }
          const payload = {
            event: 'datachannel_open',
            selfName: peerConnection._selfName,
            remoteName: peerConnection._remoteName
          }
          eventChannel.postMessage(payload)
          peerConnection._dataChannel.addEventListener('message', e => {
            const payload = {
              event: 'datachannel_message',
              selfName: peerConnection._selfName,
              remoteName: peerConnection._remoteName,
              message: e.data
            }
            eventChannel.postMessage(payload)
          })
          peerConnection._dataChannel.send(`HEY from ${this.selfName}!`)
        })
      } else {
        if (this.doLog) {
          console.debug('%cDATA CHANNEL', this.logStyle, 'for', remoteName, 'already exists')
        }
      }
    } else {
      if (this.doLog) {
        console.debug('%cNO DATA CHANNEL', this.logStyle, 'for', remoteName)
      }
    }
    // Listen for connection changes
    peerConnection.addEventListener('connectionstatechange', _ => {
      this.handleConnectionStateChange(peerConnection)
    })
    // Listen for new ICE candidates
    peerConnection.addEventListener('icecandidate', event => {
      this.sendIceMessage(peerConnection, event)
    })
    // Listen for incoming tracks
    peerConnection.addEventListener('track', (event) => {
      this.handleIncomingTrack(peerConnection, event)
    })
    // Renegotiation
    peerConnection.addEventListener('negotiationneeded', async () => {
      await this.sendNegotiationMessage(peerConnection)
    })
    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection.iceConnectionState === 'failed') {
        if (this.doLog) {
          console.log('%c--> Triggering ICE Restart', this.logStyle)
        }
        peerConnection.restartIce()
      }
    }
    this.peerConnections.set(remoteName, peerConnection)
  },
  doPause: function () {
    this.pause = true
    if (this.doLog) {
      console.log('%cPaused', this.logStyle)
    }
  },
  doUnpause: function () {
    this.pause = false
    if (this.doLog) {
      console.log('%cUnpaused', this.logStyle)
    }
  },
  /***
   * Creates an Offer
   * @param remoteName
   * @returns {Promise<Object>}
   */
  createOffer: async function (remoteName) {
    if (!this.peerConnections.has(remoteName)) return null
    const peerConnection = this.peerConnections.get(remoteName)
    if (this.doLog) {
      console.log('%cCreating Offer for', this.logStyle, remoteName)
    }
    // Create an offer and set it as the local description
    const offer = await peerConnection.createOffer()
    await peerConnection.setLocalDescription(offer)
    this.peerConnections.set(remoteName, peerConnection)
    /* Generate response payload
    We switch self and remote here since the remote will receive
    and view this offer from their perspective
     */
    const payload = {
      selfName: peerConnection._remoteName,
      remoteName: peerConnection._selfName,
      offer
    }
    return new Promise((resolve) => {
      resolve(payload)
    })
  },
  /***
   * Retrieves a Peer to Peer Connection
   * @param remoteName
   * @returns {null|RTCPeerConnection}
   */
  getPeerConnection: function (remoteName) {
    if (remoteName == null) return null
    if (!this.peerConnections.has(remoteName)) {
      return null
    } else {
      return this.peerConnections.get(remoteName)
    }
  },
  /***
   * Retrieves the remote stream (single or multiple tracks) from a Peer to Peer Connection
   * @param remoteName
   * @returns {null|MediaStream}
   */
  getStream: function (remoteName) {
    if (remoteName == null || !this.peerConnections.has(remoteName)) {
      return null
    }
    const peerConnection = this.peerConnections.get(remoteName)
    if (!peerConnection._stream) return null
    if (this.doLog) console.log('%cRetrieving remote stream', this.logStyle, peerConnection._remoteName)
    return peerConnection._stream
  },
  hangup: function (remoteName = null) {
    // Stop tracks to free up the resources
    this.setVideo(false, remoteName)
    this.setAudio(false, remoteName)
    for (const peerCon of this.peerConnections.values()) {
      if (!remoteName || peerCon._remoteName === remoteName) {
        // Close connection
        if (!remoteName) {
          if (peerCon._remoteName === '_server') {
            this.worker.sendSyncRoomWRTC('DC', '')
          } else {
            this.worker.forwardMessage('[c:hangup]' + this.selfName, 'wRTC', peerCon._remoteName)
          }
        }
        try {
          setTimeout(() => {
            peerCon.close()
          }, 1_000)
        } catch (e) {
          // Connection could not be closed (?)
        }
      }
    }
    if (!remoteName) {
      this.peerConnections = new Map()
      if (this.doLog) console.log('%cHung up!', this.logStyle)
    } else {
      this.peerConnections.delete(remoteName)
      if (this.doLog) console.log('%cRemoved a peer connection', this.logStyle, remoteName)
    }
  },
  sendNegotiationMessage: async function (peerConnection) {
    if (this.doLog) {
      console.log('%cNegotiation needed!', this.logStyle)
    }
    try {
      peerConnection._isMakingOffer = true
      peerConnection.endReached = false
      await peerConnection.setLocalDescription()
      if (this.doLog) {
        console.log(`%c${peerConnection.localDescription.type}`, this.logStyle, 'created for', peerConnection._remoteName)
      }
      if (peerConnection.localDescription.type === 'answer') {
        peerConnection._isAccepted = true
      }
      if (peerConnection._remoteName === '_server') {
        if (peerConnection.localDescription.type === 'offer') {
          this.worker.sendSyncRoomWRTC('OFFER', JSON.stringify(peerConnection.localDescription))
        }
      } else {
        const msg = {
          description: peerConnection.localDescription,
          remoteName: this.selfName
        }
        this.worker.forwardMessage(msg, 'wRTC', peerConnection._remoteName)
      }
    } catch (e) {
      if (this.doLog) {
        console.log('%cRenegotiation Failed!', this.logStyle, e.message)
      }
    }
  },
  sendIceMessage: function (peerConnection, iceEvent) {
    let candidate = iceEvent.candidate
    if (candidate && candidate.candidate !== '') {
      peerConnection._iceAvailable = true
      if (this.doLog && this.doLogVerbose) {
        console.log('%cICE Candidate sent', this.logStyle, candidate)
      }
    } else {
      if (this.doLog) console.log('%cEnd of Candidates sent', this.logStyle, candidate)
      peerConnection.endReached = true
      candidate = { candidate: '' }
    }
    if (peerConnection._remoteName === '_server') {
      this.worker.sendSyncRoomWRTC('ICE', JSON.stringify(candidate))
    } else {
      const msg = {
        candidate,
        remoteName: this.selfName
      }
      this.worker.forwardMessage(msg, 'wRTC', peerConnection._remoteName)
    }
  },
  handleIncomingTrack: function (peerConnection, trackEvent) {
    if (trackEvent.streams) {
      trackEvent.track.onunmute = () => {
        if (this.doLog) console.log('%cIncoming Track', this.logStyle, peerConnection._remoteName)
        trackEvent.track.onunmute = null
        // const [remoteStream] = trackEvent.streams
        const remoteStream = trackEvent.streams[0]
        peerConnection._streamCounter += 1
        peerConnection._stream = remoteStream
        const payload = {
          event: 'incoming_track',
          selfName: peerConnection._selfName,
          remoteName: peerConnection._remoteName
        }
        this.eventChannel.postMessage(payload)
      }
    }
  },
  handleConnectionStateChange: function (peerConnection) {
    const payload = {
      event: 'connection_change',
      selfName: peerConnection._selfName,
      remoteName: peerConnection._remoteName,
      status: peerConnection.connectionState
    }
    this.eventChannel.postMessage(payload)
    if (this.doLog) {
      console.log(`%c${peerConnection.connectionState}`, this.logStyle, peerConnection._remoteName)
    }
    if (peerConnection.connectionState === 'failed') {
      if (this.doLog) {
        console.log('%c--> Triggering ICE Restart', this.logStyle)
      }
      peerConnection.restartIce()
    } else if (peerConnection.connectionState === 'disconnected') {
      this.hangup(peerConnection._remoteName)
      const payload = {
        event: 'peer_dc',
        selfName: this.selfName,
        remoteName: peerConnection._remoteName
      }
      this.eventChannel.postMessage(payload)
    }
  },
  async handleIncomingDescription (remoteName, description) {
    if (this.doLog) {
      console.log(`%cIncoming ${description.type}`, this.logStyle, 'from', remoteName)
    }
    let peerConnection = this.getPeerConnection(remoteName)
    if (peerConnection == null) {
      if (this.pause) {
        if (this.doLog) {
          console.log('%cPAUSE Ignored offer', this.logStyle)
        }
        return
      }
      if (this.doLog) {
        console.log('%cNEW Peer Connection', this.logStyle, 'to', remoteName)
      }
      this.initiatePeerConnection(null, remoteName, true, true)
      peerConnection = this.getPeerConnection(remoteName)
    }
    const offerCollision = description.type === 'offer' && (peerConnection._isMakingOffer || peerConnection.signalingState !== 'stable')
    peerConnection._isIgnoringOffer = !peerConnection._polite && offerCollision
    if (peerConnection._isIgnoringOffer) {
      if (this.doLog) {
        console.log('%cIgnored description', this.logStyle, peerConnection._remoteName)
      }
      return
    }
    try {
      if (this.doLog) {
        console.log(`%cRemote ${description.type}`, this.logStyle, 'set from', peerConnection._remoteName)
      }
      await peerConnection.setRemoteDescription(description)
    } catch (e) {
      console.debug(e.message)
    }
    if (description.type === 'offer') {
      peerConnection._isMakingOffer = false
      await peerConnection.setLocalDescription()
      peerConnection._isAccepted = true
      if (this.doLog) {
        console.log('%cOffer accepted:', this.logStyle, peerConnection._remoteName)
      }
      if (this.doLog) {
        console.log(`%c${peerConnection.localDescription.type}`, this.logStyle, 'created')
      }
      const msg = {
        description: peerConnection.localDescription,
        remoteName: this.selfName
      }
      this.worker.forwardMessage(msg, 'wRTC', peerConnection._remoteName)
    } else if (description.type === 'answer') {
      peerConnection._isMakingOffer = false
      peerConnection._isAccepted = true
      if (this.doLog) {
        console.log('%cAnswer accepted:', this.logStyle, peerConnection._remoteName)
      }
    }
  },
  async handleIncomingIce (remoteName, candidate) {
    const peerConnection = this.getPeerConnection(remoteName)
    if (!peerConnection._isAccepted) {
      if (this.doLog && this.doLogVerbose) {
        console.log('%c--> Storing ICE', this.logStyle, candidate)
      }
      peerConnection._incomingCandidates.push(candidate)
    } else {
      if (this.doLog && this.doLogVerbose) {
        console.log('%c--> Incoming ICE', this.logStyle, candidate)
      }
      await this.addIncomingStoredICE(peerConnection, candidate)
    }
  },
  addIncomingStoredICE: async function (peerConnection, candidate = undefined) {
    // const pCon = peerConnection._incomingCandidates
    // peerConnection._incomingCandidates = []
    // if (pCon.length > 0) {
    //   try {
    //     for (let i = 0; i < pCon.length; i++) {
    //       if (this.doLog && this.doLogVerbose) {
    //         console.log('%c--> Setting stored ICE', this.logStyle, pCon[i])
    //       }
    //       await peerConnection.addIceCandidate(pCon[i])
    //     }
    //   } catch (err) {
    //     if (!peerConnection._isIgnoringOffer) {
    //       if (this.doLog) {
    //         console.log('%cERROR addIceCandidate', this.logStyle, err.message)
    //       }
    //     }
    //   }
    // }
    if (candidate !== undefined) {
      try {
        if (this.doLog && this.doLogVerbose) {
          console.log('%c--> Setting ICE', this.logStyle, candidate)
        }
        await peerConnection.addIceCandidate(candidate)
      } catch (err) {
        if (!peerConnection._isIgnoringOffer) {
          if (this.doLog) {
            console.log('%cERROR addIceCandidate', this.logStyle, err.message)
          }
        }
      }
    }
  },
  setVideo: function (valueBoolean, remoteName = null) {
    for (const peerCon of this.peerConnections.values()) {
      if (!remoteName || peerCon._remoteName === remoteName) {
        const senderList = peerCon.getSenders()
        senderList.forEach((sender) => {
          if (sender.track && sender.track.kind === 'video') {
            sender.track.enabled = valueBoolean
            if (valueBoolean === false) sender.track.stop()
          }
        })
      }
    }
  },
  setAudio: function (valueBoolean, remoteName = null) {
    for (const peerCon of this.peerConnections.values()) {
      if (!remoteName || peerCon._remoteName === remoteName) {
        const senderList = peerCon.getSenders()
        senderList.forEach((sender) => {
          if (sender.track && sender.track.kind === 'audio') {
            sender.track.enabled = valueBoolean
          }
        })
      }
    }
  },
  replaceTrack: function (stream, kind) {
    if (!stream || !kind) return
    const [videoTracks] = stream.getTracks()
    for (const peerCon of this.peerConnections.values()) {
      const senderList = peerCon.getSenders()
      senderList.forEach((sender) => {
        if (sender.track && sender.track.kind === kind) {
          sender.replaceTrack(videoTracks)
          .then(() => {
            if (this.doLog) {
              console.log('%cReplaced track', this.logStyle, kind, peerCon._remoteName)
            }
            sender.track.enabled = true
          })
          .catch(async () => {
            this.sendNegotiationMessage(peerCon)
          })
        }
      })
    }
  },
  addStreamTracks: function (stream, forceType = null) {
    if (!stream) {
      return
    }
    for (const peerConnection of this.peerConnections.values()) {
      let sCount = 1
      stream.getTracks().forEach(track => {
        if (!forceType || track.kind === forceType) {
          if (this.doLog) {
            console.debug(`%cADD TRACK ${sCount}`, this.logStyle, 'for', peerConnection._remoteName, track.kind)
            sCount++
          }
          try {
            try {
              peerConnection.addTrack(track, stream)
            } catch (e) {
              console.log('(Track was not added)')
            }
          } catch (e) {
            console.debug(e.message)
          }
        }
      })
    }
  },
  /**
   * Sends a message to a user using the WebRTC DataChannel
   * @param {String} usr
   * @param {Object|String} msg
   * @return boolean
   */
  sendDataChannelMessage: function (usr, msg) {
    if (msg == null || !this.peerConnections.has(usr)) {
      return false
    }
    const peer = this.peerConnections.get(usr)
    if (!peer._dataChannel || peer._dataChannel.readyState !== 'open') {
      return false
    }
    if (typeof msg === 'object') {
      msg = JSON.stringify(msg)
    }
    try {
      peer._dataChannel.send(msg)
      return true
    } catch (e) {
      console.debug(e.message)
      return false
    }
  },
  /**
   * Sends a message to a user using the WebRTC DataChannel
   * @param {Object|String} msg
   * @return boolean
   */
  broadcastDataChannelMessage: function (msg) {
    if (msg == null) {
      return false
    }
    let didSend = false
    this.peerConnections.forEach((peer) => {
      if (!peer._dataChannel || peer._dataChannel.readyState !== 'open') {
        return
      }
      if (typeof msg === 'object') {
        msg = JSON.stringify(msg)
      }
      try {
        peer._dataChannel.send(msg)
        // We cannot guarantee delivery of UDP messages
        // ...so we call it a success on any delivery made
        didSend = true
      } catch (e) {
        console.debug(e.message)
      }
    })
    return didSend
  },
  setUpSyncRoom: async function () {
    // Listen for SyncRoom messages
    const events = new BroadcastChannel('wikiric_sync')
    events.onmessage = event => {
      // Sanitize
      if (!event.data || (!event.data.a && !event.data.t)) {
        return
      }
      event.data.a = event.data.a.trim()
      event.data.t = event.data.t.trim()
      if (event.data.a.startsWith('[s:ICE]')) {
        // Incoming ICE candidate
        const candidate = JSON.parse(event.data.a.substring(7))
        this.handleIncomingIce('_server', candidate)
      } else if (event.data.a.startsWith('[s:ANSWER]')) {
        // Incoming answer
        const answer = JSON.parse(event.data.a.substring(10))
        if (this.doLog) {
          console.log('%cIncoming answer', this.logStyle, 'from the wikiric backend')
        }
        this.handleIncomingDescription('_server', answer)
      }
    }
  }
}
export default WRTC
