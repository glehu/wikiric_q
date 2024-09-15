Copyright (c) 2024.
wikiric and wikiricGo
themselves were, are and remain intellectual property of Luca Goldhausen.
You may use, edit and redistribute any of their parts as long as you give credit
in some visually accessible way.
(where one would expect it without having to be visible on a screen under heavy use by the viewer).

# wikiric (wikiric)

An open source collaboration platform.

wikiric provides wikiric-sdk.js to get started quickly. Read the following documentation
to get to know the first steps to start using some of wikiric's many accessible features.

# The official wikiric SDK

---

## Features

This SDK provides easy access to the Chat, Encryption and SyncRoom functionality for wikiric.

- Easy login
- Easy chat session creation
- Automatic chat session authorization
- Decryption of incoming E2E encrypted messages
- Encrypting and sending of messages
- Receiving and sending of backend messages and commands
- Connecting to arbitrarily named SyncRooms with features as broadcasting messages, setting and getting data etc.

## Dependencies

The only requirement to be able to use this SDK is the `wikiricrypt` library
that is being developed for wikiric, too. The library needs to be in
the same folder as the wikiric SDK.

## Private Key

To get the private key which is needed to connect to a chat group
you need to open the targeted chat group, click on your profile and then on "Transfer".
On the bottom side of the modal you will see the button to copy the private Key.

## Code

Quick Start Copy&Paste Template:

```js
// 0. Initialize SDK
const wikiric = wikiricSDK

// 1. Authorize and Synchronize
await wikiric.login('yourUsername', 'yourPassword')
await wikiric.doSync()

// 2. Connect to the chat group's channel
wikiric.connect('yourChannelID', 'yourPrivateKey')

// 3. Listen to the chat group's incoming messages
const messages = new BroadcastChannel('wikiric_msg')
messages.onmessage = event => { console.log('New Message', event.data) }

// 4. Send an unencrypted message to the chat group
wikiric.sendMessage('Hello World!')

// 5. Send an encrypted message to the chat group
// First, prepare the pubkey map (you only have to do this once and for any new member)
const pubKeys = new Map()
if (this.members != null && this.members.size > 0) {
  for (const [key, member] of this.members.entries()) {
    if (key && member.pubkey != null) {
      pubKeys.set(member.usr, member.pubkey)
    }
  }
}
this.sdk._wcrypt.setMembers(pubKeys)
// Then, encrypt and send the message
const message = 'Secret Hello World!'
const encryptedMessage = await this.sdk._wcrypt.encryptPayload(message)
wikiric.sendMessage(encryptedMessage)

// 5. Listen to backend messages
const events = new BroadcastChannel('wikiric_connector')
events.onmessage = event => { console.log('Connector', event.data) }

// 6. Connect to a SyncRoom, which basically acts as a temporary
//    websocket pool/room for message distribution,
//    data setting and getting, latency testing and more.
await wikiric.doJoinSyncRoom('yourRoomIdOrName')

// 7. Listen for SyncRoom messages
const eventsSync = new BroadcastChannel('wikiric_sync')
eventsSync.onmessage = event => { console.log('SyncRoom', event.data) }

// 8. Broadcast a SyncRoom message
wikiric.sendSyncRoomMessage('Hello World!')
```

## Install the dependencies
```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```


### Lint the files
```bash
yarn lint
# or
npm run lint
```



### Build the app for production
```bash
quasar build
```

### Customize the configuration
See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-vite/quasar-config-js).
