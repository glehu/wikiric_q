import adapter from 'webrtc-adapter'

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
   * @param worker - wikiricSDK instance
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
    this.selfName = selfName
    this.doLog = doLog
    this.doLogVerbose = doLogVerbose
    this.dummyStream = dummyStream
    // ###
    console.log(`%cHey, ${this.selfName}!`, this.logStyle, 'Running on', adapter.browserDetails.browser, adapter.browserDetails.version)
    // Initialize Connector listener - this is the signaling server!
    this.connector.onmessage = async event => {
      if (event.data.typ == null) return
      // Listen for WebRTC related data
      if (event.data.typ !== 'wRTC') {
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
   * Initiates a Peer to Peer Connection
   *
   * @param {(MediaStream|null)} stream - Outgoing media stream
   * @param {string} remoteName - Remote username
   * @param {boolean} [createDataChannel=true] - Specifies if a data channel needs to be created
   * @param {boolean} [polite=false] - TBD
   */
  initiatePeerConnection: function (stream, remoteName, createDataChannel = true, polite = false) {
    if (remoteName == null) {
      if (this.doLog) {
        console.log('%cInvalid Configuration', this.logStyle, 'for initiatePeerConnection!')
        console.log('---> No remoteName!')
        return
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
    peerConnection.selfName = this.selfName
    peerConnection.remoteName = remoteName
    peerConnection.candidates = []
    peerConnection.incomingCandidates = []
    peerConnection.candidateCounter = 0
    peerConnection.stream = null
    peerConnection.streamCounter = 0
    peerConnection.iceAvailable = false
    peerConnection.isAccepted = true // TODO: Check if needed to be true
    peerConnection.isMakingOffer = false
    peerConnection.isIgnoringOffer = false
    peerConnection.polite = polite
    peerConnection.hasStream = false
    // Add tracks if present
    if (stream != null) {
      // if (peerConnection.hasStream === false) {
      // peerConnection.hasStream = true
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
    if (createDataChannel && !peerConnection.dataChannel) {
      if (this.doLog) {
        console.debug('%cADD DATA CHANNEL', this.logStyle, 'for', remoteName)
      }
      peerConnection.dataChannel = peerConnection.createDataChannel('data', {
        negotiated: true,
        id: 0
      })
      const doLog = this.doLog
      const logStyle = this.logStyle
      const eventChannel = this.eventChannel
      peerConnection.dataChannel.addEventListener('open', _ => {
        if (doLog) {
          console.debug('%c(OUT) DATA CHANNEL OPEN', logStyle, 'to', remoteName)
        }
        const payload = {
          event: 'datachannel_open',
          selfName: peerConnection.selfName,
          remoteName: peerConnection.remoteName
        }
        eventChannel.postMessage(payload)
        peerConnection.dataChannel.addEventListener('message', e => {
          const payload = {
            event: 'datachannel_message',
            selfName: peerConnection.selfName,
            remoteName: peerConnection.remoteName,
            message: e.data
          }
          eventChannel.postMessage(payload)
        })
        peerConnection.dataChannel.send(`HEY from ${this.selfName}!`)
      })
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
      selfName: peerConnection.remoteName,
      remoteName: peerConnection.selfName,
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
    if (!peerConnection.stream) return null
    if (this.doLog) console.log('%cRetrieving remote stream', this.logStyle, peerConnection.remoteName)
    return peerConnection.stream
  },
  hangup: function (remoteName = null) {
    // Stop tracks to free up the resources
    this.setVideo(false, remoteName)
    this.setAudio(false, remoteName)
    for (const peerCon of this.peerConnections.values()) {
      if (!remoteName || peerCon.remoteName === remoteName) {
        // Close connection
        try {
          setTimeout(() => {
            peerCon.close()
          }, 1000)
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
      peerConnection.isMakingOffer = true
      peerConnection.endReached = false
      await peerConnection.setLocalDescription()
      if (this.doLog) {
        console.log(`%c${peerConnection.localDescription.type}`, this.logStyle, 'created for', peerConnection.remoteName)
      }
      if (peerConnection.localDescription.type === 'answer') {
        peerConnection.isAccepted = true
      }
      const msg = {
        description: peerConnection.localDescription,
        remoteName: this.selfName
      }
      this.worker.forwardMessage(msg, 'wRTC', peerConnection.remoteName)
    } catch (e) {
      if (this.doLog) {
        console.log('%cRenegotiation Failed!', this.logStyle, e.message)
      }
    }
  },
  sendIceMessage: function (peerConnection, iceEvent) {
    let candidate = iceEvent.candidate
    if (candidate && candidate.candidate !== '') {
      peerConnection.iceAvailable = true
      if (this.doLog && this.doLogVerbose) {
        console.log('%cICE Candidate sent', this.logStyle, candidate)
      }
    } else {
      if (this.doLog) console.log('%cEnd of Candidates sent', this.logStyle, candidate)
      peerConnection.endReached = true
      candidate = { candidate: '' }
    }
    const msg = {
      candidate,
      remoteName: this.selfName
    }
    this.worker.forwardMessage(msg, 'wRTC', peerConnection.remoteName)
  },
  handleIncomingTrack: function (peerConnection, trackEvent) {
    if (trackEvent.streams) {
      trackEvent.track.onunmute = () => {
        if (this.doLog) console.log('%cIncoming Track', this.logStyle, peerConnection.remoteName)
        trackEvent.track.onunmute = null
        // const [remoteStream] = trackEvent.streams
        const remoteStream = trackEvent.streams[0]
        peerConnection.streamCounter += 1
        peerConnection.stream = remoteStream
        const payload = {
          event: 'incoming_track',
          selfName: peerConnection.selfName,
          remoteName: peerConnection.remoteName
        }
        this.eventChannel.postMessage(payload)
      }
    }
  },
  handleConnectionStateChange: function (peerConnection) {
    const payload = {
      event: 'connection_change',
      selfName: peerConnection.selfName,
      remoteName: peerConnection.remoteName,
      status: peerConnection.connectionState
    }
    this.eventChannel.postMessage(payload)
    if (this.doLog) {
      console.log(`%c${peerConnection.connectionState}`, this.logStyle, peerConnection.remoteName)
    }
    if (peerConnection.connectionState === 'failed') {
      if (this.doLog) {
        console.log('%c--> Triggering ICE Restart', this.logStyle)
      }
      peerConnection.restartIce()
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
      this.initiatePeerConnection(null, remoteName, true, true)
      peerConnection = this.getPeerConnection(remoteName)
    }
    const offerCollision = description.type === 'offer' && (peerConnection.isMakingOffer || peerConnection.signalingState !== 'stable')
    peerConnection.isIgnoringOffer = !peerConnection.polite && offerCollision
    if (peerConnection.isIgnoringOffer) {
      if (this.doLog) {
        console.log('%cIgnored description', this.logStyle, peerConnection.remoteName)
      }
      return
    }
    try {
      if (this.doLog) {
        console.log(`%cRemote ${description.type}`, this.logStyle, 'set from', peerConnection.remoteName)
      }
      await peerConnection.setRemoteDescription(description)
    } catch (e) {
      console.debug(e.message)
    }
    if (description.type === 'offer') {
      peerConnection.isMakingOffer = false
      await peerConnection.setLocalDescription()
      peerConnection.isAccepted = true
      if (this.doLog) {
        console.log('%cOffer accepted:', this.logStyle, peerConnection.remoteName)
      }
      if (this.doLog) {
        console.log(`%c${peerConnection.localDescription.type}`, this.logStyle, 'created')
      }
      const msg = {
        description: peerConnection.localDescription,
        remoteName: this.selfName
      }
      this.worker.forwardMessage(msg, 'wRTC', peerConnection.remoteName)
    } else if (description.type === 'answer') {
      peerConnection.isMakingOffer = false
      peerConnection.isAccepted = true
      if (this.doLog) {
        console.log('%cAnswer accepted:', this.logStyle, peerConnection.remoteName)
      }
    }
  },
  async handleIncomingIce (remoteName, candidate) {
    const peerConnection = this.getPeerConnection(remoteName)
    if (!peerConnection.isAccepted) {
      if (this.doLog && this.doLogVerbose) {
        console.log('%c--> Storing ICE', this.logStyle, candidate)
      }
      peerConnection.incomingCandidates.push(candidate)
    } else {
      if (this.doLog && this.doLogVerbose) {
        console.log('%c--> Incoming ICE', this.logStyle, candidate)
      }
      await this.addIncomingStoredICE(peerConnection, candidate)
    }
  },
  addIncomingStoredICE: async function (peerConnection, candidate = undefined) {
    // const pCon = peerConnection.incomingCandidates
    // peerConnection.incomingCandidates = []
    // if (pCon.length > 0) {
    //   try {
    //     for (let i = 0; i < pCon.length; i++) {
    //       if (this.doLog && this.doLogVerbose) {
    //         console.log('%c--> Setting stored ICE', this.logStyle, pCon[i])
    //       }
    //       await peerConnection.addIceCandidate(pCon[i])
    //     }
    //   } catch (err) {
    //     if (!peerConnection.isIgnoringOffer) {
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
        if (!peerConnection.isIgnoringOffer) {
          if (this.doLog) {
            console.log('%cERROR addIceCandidate', this.logStyle, err.message)
          }
        }
      }
    }
  },
  setVideo: function (valueBoolean, remoteName = null) {
    for (const peerCon of this.peerConnections.values()) {
      if (!remoteName || peerCon.remoteName === remoteName) {
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
      if (!remoteName || peerCon.remoteName === remoteName) {
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
              console.log('%cReplaced track', this.logStyle, kind, peerCon.remoteName)
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
            console.debug(`%cADD TRACK ${sCount}`, this.logStyle, 'for', peerConnection.remoteName, track.kind)
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
  }
}
export default WRTC
