import { defineStore } from 'pinia'

export const useStore = defineStore('general', {
  state: () => ({
    loggedIn: false,
    user: {},
    serverIP: 'https://wikiric.xyz/'
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
    }
  }
})
