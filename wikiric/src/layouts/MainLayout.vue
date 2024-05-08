<template>
  <q-layout view="hHH Lpr lff" class="overflow-hidden">
    <q-bar class="q-electron-drag absolute wfull">
      <q-header class="surface"
                style="border-bottom: 1px solid var(--md-sys-color-outline-variant)">
        <q-toolbar>
          <template v-if="$q.platform.is.electron && !forceWinLook">
            <div v-if="$q.platform.is.mac || forceMacLook"
                 class="flex row items-center ml1">
              <q-btn dense flat round icon="lens" size="8.5px" color="red"
                     @click="closeApp"/>
              <q-btn dense flat round icon="lens" size="8.5px" color="amber"
                     @click="minimize"/>
              <q-btn dense flat round icon="lens" size="8.5px" color="green"
                     @click="toggleMaximize"
                     class="mr4"/>
            </div>
          </template>
          <q-btn
            flat
            dense
            round
            icon="menu"
            aria-label="Menu"
            @click="toggleLeftDrawer"
          >
            <q-tooltip class="text-body2">
              Toggle&nbsp;Sidebar
            </q-tooltip>
          </q-btn>
          <q-toolbar-title class="text-weight-bold text-subtitle1 <sm:hidden" shrink>
            wikiric
          </q-toolbar-title>
          <q-btn flat no-caps
                 class="background ml4 w40 flex justify-between text-body1"
                 @click="openDialog()">
            <p class="m0 mrauto">Search</p>
            <kbd v-if="$q.platform.is.win || $q.platform.is.linux">
              ALT-K
            </kbd>
            <kbd v-else-if="$q.platform.is.mac">
              ⌘K
            </kbd>
          </q-btn>
          <div class="relative flex mlauto">
            <q-btn icon="inbox" size="1rem" unelevated dense
                   @click="isViewingNotifications = !isViewingNotifications"/>
            <template v-if="notifications.length > 0">
              <p style="width: 14px; height: 14px; background-color: orange;
                      border: 2px solid var(--md-sys-color-surface);
                      border-radius: 100%; transform: translateX(22px) translateY(22px)"
                 class="absolute pointer-events-none"></p>
            </template>
          </div>
          <template v-if="$q.platform.is.electron && !forceMacLook">
            <template v-if="$q.platform.is.win || $q.platform.is.linux || forceWinLook">
              <q-btn dense flat icon="minimize" @click="minimize"/>
              <q-btn dense flat icon="crop_square" @click="toggleMaximize"/>
              <q-btn dense flat icon="close" @click="closeApp"/>
            </template>
          </template>
        </q-toolbar>
      </q-header>
    </q-bar>
    <q-drawer
      class="surface"
      v-model="leftDrawerOpen"
      :breakpoint="1023"
      no-swipe-open>
      <q-toolbar>
        <q-toolbar-title class="text-lg">
          Links
        </q-toolbar-title>
      </q-toolbar>
      <q-list>
        <EssentialLink
          class=""
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>
    <q-page-container class="background">
      <template v-if="ready">
        <router-view/>
      </template>
    </q-page-container>
    <q-dialog v-model="fixed" class="z-max"
              backdrop-filter="blur(10px)"
              style="background-color: transparent">
      <div ref="dialogSearchContainer"
           id="dialogSearchContainer"
           class="pt2 wfull sm:w-[75dvw] sm:max-w-xl
                  fmt_border
                  fixed top-0 sm:top-[60px]"
           style="background-color: rgba(var(--rgb-sys-color-surface), 0.8)">
        <q-input
          for="searchEverything"
          label="Search everything... (SPACE to show all)"
          color="brand-p"
          label-color="brand-p"
          v-model="queryText"
          @update:model-value="processQuery"
          class="text-xl px4">
          <template v-slot:prepend>
            <q-icon name="search" class=""/>
          </template>
        </q-input>
        <div ref="seResults"
             class="max-h-[90dvh] overflow-y-auto px2">
          <div v-if="queryResults.length > 0">
            <p class="fontbold ml4 mb1 mt6 text-subtitle2">
              {{ queryResults.length }} Apps/Settings:
            </p>
            <q-item v-for="res in queryResults" :key="res"
                    clickable dense
                    class="mt2 ml2"
                    @click="gotoLink(res.link)">
              <q-item-section>
                <q-item-label class="fontbold
                                     flex row items-center
                                     gap-3">
                  <template v-if="res.icon">
                    <q-icon :name="res.icon" size="1.6rem"/>
                  </template>
                  <div>
                    <p class="text-body2 fontbold">
                      {{ res.t }}
                    </p>
                    <p class="text-xs text-weight-regular">
                      {{ res.desc }}
                    </p>
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
          <div v-if="queryGroupResults.length > 0">
            <p class="fontbold ml4 mb1 mt4 text-subtitle2">
              {{ queryGroupResults.length }} Chat Groups:
            </p>
            <q-item v-for="res in queryGroupResults" :key="res"
                    clickable dense
                    class="mt2 ml2"
                    @click="gotoLink(res.link)">
              <q-item-section>
                <q-item-label class="text-lg fontbold
                                     flex items-center
                                     gap-3">
                  <template v-if="res.icon">
                    <q-icon :name="res.icon" size="1.6rem"/>
                  </template>
                  <div>
                    <p class="text-body2 fontbold">
                      {{ res.t }}
                    </p>
                    <p class="text-xs text-weight-regular">
                      {{ res.desc }}
                    </p>
                  </div>
                </q-item-label>
              </q-item-section>
            </q-item>
          </div>
        </div>
        <q-card-actions align="right"
                        class="surface py2 px4 mt6 flex gap-6
                               fmt_border_top">
          <!--<q-btn flat label="Close" color="text-brand-p" v-close-popup/>-->
          <img src='../assets/wikiric/wikiric-logo-big.webp' alt="Logo"
               class="mrauto pointer-events-none non-selectable"
               style="max-width: 22px; max-height: 22px; object-fit: contain">
          <div class="flex gap-2 items-center
                      pointer-events-none non-selectable">
            <span class="text-subtitle2">
              Open/Enter
            </span>
            <div class="fmt_border rounded w5 h5
                        flex items-center justify-center">
              <q-icon name="keyboard_return"/>
            </div>
          </div>
          <div class="flex gap-2 items-center
                      pointer-events-none non-selectable">
            <span class="text-subtitle2">
              Close
            </span>
            <div class="fmt_border rounded w7 h5
                        flex items-center justify-center">
              <span class="text-xs fontbold">
                ESC
              </span>
            </div>
          </div>
        </q-card-actions>
      </div>
    </q-dialog>
  </q-layout>
  <notification-list-view :is-open="isViewingNotifications"
                          :notifications="notifications"
                          @update="getNotifications"/>
</template>

<script>
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { debounce, useQuasar } from 'quasar'
import { dbGetData, dbGetGroups, dbGetTimestamp, dbSetTimestamp } from 'src/libs/wikistore'
import { api } from 'boot/axios'
import { useStore } from 'stores/wikistate'
import NotificationListView from 'components/NotificationListView.vue'

const linksList = [
  {
    title: 'Home',
    caption: 'Go back to the main page',
    icon: 'home',
    link: '/'
  },
  {
    title: 'Account & Settings',
    caption: 'An overview of apps and settings',
    icon: 'person',
    link: '/account'
  },
  {
    title: 'Chat',
    caption: 'Communication Platform',
    icon: 'code',
    link: '/groups'
  }
]

export default defineComponent({
  name: 'MainLayout',
  components: {
    NotificationListView,
    EssentialLink
  },
  mounted () {
    this.manageKeyListeners()
  },
  created () {
    this.processQuery = debounce(this.processQuery, 50)
    // Check if there's a token saved to avoid refresh issues
    this.checkToken()
  },
  methods: {
    checkToken: async function () {
      let token = null
      let autoStart = false
      // Retrieve previous token
      try {
        token = await dbGetData('token')
      } catch (e) {
        console.debug(e.message)
        token = null
      }
      // Add user info and auto-login if desired to renew token just in case
      const usr = await dbGetData('usr')
      if (usr && usr._u) {
        if (usr.instantLogin) {
          this.store.logIn(usr)
          try {
            token = await this.$connector.doLogin(usr._u, usr._p)
          } catch (e) {
            this.$router.push('/down')
          }
          // Listen to connector messages
          await this.$connector.doSync()
          autoStart = true
          // Auto-renew token every 30 minutes
          setInterval(() => {
            this.$connector.doLogin(usr._u, usr._p).then((token) => {
              api.defaults.headers.common.Authorization = 'Bearer ' + token
            })
          }, 1_800_000)
        }
      }
      if (token) {
        // Add token as global header for authorization
        api.defaults.headers.common.Authorization = 'Bearer ' + token
        await this.getNotifications()
      }
      this.ready = true
      // Is an auto-start view defined?
      if (autoStart && usr && usr.startingView && usr.startingView !== '/') {
        this.$router.push(usr.startingView)
      }
    },
    manageKeyListeners: function () {
      document.removeEventListener('keydown', this.handleKeyDownM, false)
      document.addEventListener('keydown', this.handleKeyDownM, false)
    },
    handleKeyDownM: function (e) {
      if (e.key === 'k') {
        // Check for key combination to open "search everything"
        let os = ''
        if (this.$q.platform.is.mac) {
          os = 'mac'
        } else if (this.$q.platform.is.win || this.$q.platform.is.linux) {
          os = 'win'
        }
        if ((os === 'mac' && e.metaKey) ||
          (os === 'win' && e.altKey)) {
          e.preventDefault()
          e.stopImmediatePropagation()
          this.openDialog()
        }
      }
    },
    openDialog: function () {
      this.fixed = true
      setTimeout(() => {
        this.processQuery(this.queryText)
        const elem = document.getElementById('searchEverything')
        if (elem) {
          elem.focus()
          elem.select()
        }
      }, 0)
    },
    processQuery: async function (text) {
      this.isProcessingQuery = true
      this.queryResults = []
      this.queryGroupResults = []
      if (!text || text === '') {
        this.$refs.seResults.classList.remove('min-h-[25dvh]')
        this.isProcessingQuery = false
        return
      }
      // Check if user has searched for a route
      const navResults = linksList.filter((link) =>
        link.title
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(this.queryText.toLowerCase().replace(/\s+/g, ''))
      )
      if (navResults.length > 0) {
        // Display results
        for (const result of navResults) {
          this.queryResults.push({
            icon: result.icon,
            t: result.title,
            desc: result.caption,
            link: result.link
          })
        }
      }
      // Check if user has searched for a group
      const groups = await dbGetGroups()
      const groupResults = groups.filter((group) =>
        group.t
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(this.queryText.toLowerCase().replace(/\s+/g, ''))
      )
      if (groupResults.length > 0) {
        // Display results
        for (const result of groupResults) {
          let linkURL = `/chat?id=${result.id}`
          // Rejoin last channel if it exists
          if (result.lastChannelID && result.lastChannelID !== '') {
            linkURL += `&chan=${result.lastChannelID}`
          }
          this.queryGroupResults.push({
            icon: 'people',
            t: result.t,
            desc: result.desc,
            link: linkURL
          })
        }
      }
      if (this.queryResults.length > 0 || this.queryGroupResults.length > 0) {
        if (!this.$refs.seResults.classList.contains('min-h-[25dvh]')) {
          this.$refs.seResults.classList.add('min-h-[25dvh]')
        }
      } else {
        this.$refs.seResults.classList.remove('min-h-[25dvh]')
      }
      // Return
      setTimeout(() => {
        this.isProcessingQuery = false
      }, 0)
    },
    gotoLink: function (link) {
      const wasChat = this.$route.path.startsWith('/chat')
      this.fixed = false
      if (wasChat && link.startsWith('/chat')) {
        const url = '/redir?redirect=' + link
        this.$router.push(url)
      } else {
        this.$router.push(link)
      }
    },
    minimize: function () {
      window.myWindowAPI?.minimize()
    },
    toggleMaximize: function () {
      window.myWindowAPI?.toggleMaximize()
    },
    closeApp: function () {
      window.myWindowAPI?.close()
    },
    getNotifications: async function () {
      return new Promise((resolve) => {
        api({
          url: 'notification/private/read'
        })
        .then((response) => {
          if (response.data && response.data.Notifications) {
            this.notifications = response.data.Notifications
          } else {
            this.notifications = []
          }
        }).catch((err) => {
          console.debug(err.message)
          this.notifications = []
        }).finally(() => {
          resolve()
        })
      })
    }
  },
  setup () {
    // *** VARIABLES ***
    const ready = ref(false)
    const leftDrawerOpen = ref(false)
    const fixed = ref(false)
    const queryText = ref('')
    const isProcessingQuery = ref(false)
    const queryResults = ref([])
    const queryGroupResults = ref([])
    const forceMacLook = ref(false)
    const forceWinLook = ref(false)
    const colorTheme = ref('auto')
    const store = useStore()
    const notifications = ref([])
    const isViewingNotifications = ref(false)

    // *** BACKEND CONNECTOR ***
    function handleConnectorMessage (msg) {
      if (!msg) return
      if (msg.typ === '[s:stat]') {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: `${msg.usr} is online`,
          caption: '',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {
              }
            }
          ]
        })
      } else if (msg.typ === '[s:chat]') {
        if (msg.act === 'mark') {
          // Check if we're already connected to this channel
          const subchatID = this.$route.query.chan
          if (subchatID) {
            if (this.$route.fullPath.includes('&chan=' + msg.pid)) {
              return
            }
          } else {
            if (this.$route.fullPath.includes('/chat?id=' + msg.pid)) {
              return
            }
          }
          addTimestampNew(msg.pid)
        }
      } else if (msg.typ === '[s:NOTIFICATION]') {
        api({
          url: 'notification/private/read'
        })
        .then((response) => {
          if (response.data && response.data.Notifications) {
            notifications.value = response.data.Notifications
          } else {
            notifications.value = []
          }
        }).catch((err) => {
          console.debug(err.message)
          notifications.value = []
        }).finally(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: msg.msg,
            caption: 'Notification',
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
                handler: () => {
                }
              }
            ]
          })
        })
      }
    }

    /**
     *
     * @returns {Promise<void>}
     */
    async function addTimestampNew (channelID) {
      const ts = new Date().getTime()
      const timestamp = await dbGetTimestamp(channelID)
      if (timestamp) {
        if (timestamp.tsNew >= ts) return
        timestamp.tsNew = ts
        await dbSetTimestamp(channelID, {
          tsRead: timestamp.tsRead,
          tsNew: ts
        })
        return
      }
      await dbSetTimestamp(channelID, {
        tsNew: ts
      })
    }

    const connectorMsg = new BroadcastChannel('wikiric_connector')
    connectorMsg.onmessage = event => {
      handleConnectorMessage(event.data)
    }

    const $q = useQuasar()
    dbGetData('usr').then((usr) => {
      if (usr && usr._u) {
        forceMacLook.value = usr.forceMac
        forceWinLook.value = usr.forceWin
        colorTheme.value = usr.colorTheme
      }
    }).finally(() => {
      // Set app's color scheme
      if (colorTheme.value === 'light') {
        $q.dark.set(false)
        document.documentElement.setAttribute('data-theme', 'light')
      } else if (colorTheme.value === 'dark') {
        $q.dark.set(true)
        document.documentElement.setAttribute('data-theme', 'dark')
      } else {
        $q.dark.set('auto')
        if ($q.dark.isActive) {
          document.documentElement.setAttribute('data-theme', 'dark')
        } else {
          document.documentElement.setAttribute('data-theme', 'light')
        }
      }
    })

    // *** RETURN ***
    return {
      ready,
      essentialLinks: linksList,
      leftDrawerOpen,
      fixed,
      queryText,
      isProcessingQuery,
      queryResults,
      queryGroupResults,
      forceMacLook,
      forceWinLook,
      store,
      notifications,
      isViewingNotifications,
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>
