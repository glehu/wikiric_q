/*
 * Copyright (c) 2024.
 * Module workeric.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

const WorkerRic = {
  worker: null,
  execute: function (payload) {
    if (!this.worker) return
    return new Promise((resolve, reject) => {
      // Open new MessageChannel
      const channel = new MessageChannel()
      // Set up response listener
      channel.port1.onmessage = ({ data }) => {
        channel.port1.close()
        if (data.error) {
          reject(data.error)
        } else {
          resolve(data)
        }
      }
      // Submit payload to worker
      this.worker.postMessage(payload, [channel.port2])
    })
  }
}
export default WorkerRic
