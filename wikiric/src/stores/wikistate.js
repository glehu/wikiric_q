/*
 * Copyright (c) 2024.
 * Module wikistate.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

import { defineStore } from 'pinia'

export const useStore = defineStore('general', {
  state: () => ({
    loggedIn: false,
    user: {},
    serverIP: 'https://wikiric.xyz/' // 'http://localhost:9999/' 'https://wikiric.xyz/'
  }),
  getters: {
    isLoggedIn: (state) => state.loggedIn
  },
  actions: {
    logIn (usr) {
      this.loggedIn = true
      this.user = usr
    },
    logOut () {
      this.loggedIn = false
      this.user = {}
    }
  }
})
