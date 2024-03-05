<template>
  <q-layout view="hHH Lpr lff" class="overflow-hidden">
    <q-bar class="q-electron-drag absolute wfull">
      <q-header class="surface"
                style="border-bottom: 1px solid var(--md-sys-color-outline-variant)">
        <q-toolbar>
          <div v-if="$q.platform.is.mac" class="flex row items-center ml1">
            <q-btn dense flat round icon="lens" size="8.5px" color="red"
                   @click="closeApp"/>
            <q-btn dense flat round icon="lens" size="8.5px" color="yellow"
                   @click="minimize"/>
            <q-btn dense flat round icon="lens" size="8.5px" color="green"
                   @click="toggleMaximize"
                   class="mr4"/>
          </div>
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
          <q-toolbar-title class="text-weight-bold text-subtitle1" shrink>
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
          <template v-if="$q.platform.is.win || $q.platform.is.linux">
            <q-space></q-space>
            <q-btn dense flat icon="minimize" @click="minimize"/>
            <q-btn dense flat icon="crop_square" @click="toggleMaximize"/>
            <q-btn dense flat icon="close" @click="closeApp"/>
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
    <q-dialog v-model="fixed" class="z-max">
      <q-card class="surface p4 w-[75dvw] max-w-xl
                     fixed top-[60px]"
              flat bordered>
        <q-input
          for="searchEverything"
          label="Search everything... (SPACE to show all)"
          color="brand-p"
          label-color="brand-p"
          v-model="queryText"
          @update:model-value="processQuery"
          class="p2 text-xl">
          <template v-slot:prepend>
            <q-icon name="search"/>
          </template>
        </q-input>
        <div class="max-h-[90dvh] overflow-auto">
          <div v-if="queryResults.length > 0">
            <p class="fontbold ml2 mb1 mt2">
              {{ queryResults.length }} Apps/Settings:</p>
            <q-item v-for="res in queryResults" :key="res"
                    clickable
                    @click="gotoLink(res.link)">
              <q-item-section>
                <q-item-label class="text-lg fontbold flex items-center">
                  <template v-if="res.icon">
                    <q-icon :name="res.icon" size="1.5rem" class="mr1"/>
                  </template>
                  {{ res.t }}
                </q-item-label>
                <span>{{ res.desc }}</span>
              </q-item-section>
            </q-item>
          </div>
          <div v-if="queryGroupResults.length > 0">
            <p class="fontbold ml2 mb1 mt2">
              {{ queryGroupResults.length }} Chat Groups:</p>
            <q-item v-for="res in queryGroupResults" :key="res"
                    clickable
                    @click="gotoLink(res.link)">
              <q-item-section>
                <q-item-label class="text-lg fontbold flex items-center">
                  <template v-if="res.icon">
                    <q-icon :name="res.icon" size="1.5rem" class="mr1"/>
                  </template>
                  {{ res.t }}
                </q-item-label>
                <span>{{ res.desc }}</span>
              </q-item-section>
            </q-item>
          </div>
        </div>
        <q-card-actions align="right">
          <q-btn flat label="Close" color="text-brand-p" v-close-popup/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from 'vue'
import EssentialLink from 'components/EssentialLink.vue'
import { debounce } from 'quasar'
import { dbGetData, values } from 'src/libs/wikistore'
import { api } from 'boot/axios'

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
    link: '/q/account'
  },
  {
    title: 'Chat',
    caption: 'Your E2EE communication platform',
    icon: 'code',
    link: '/q/groups'
  }
]

export default defineComponent({
  name: 'MainLayout',
  components: {
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
      try {
        token = await dbGetData('token')
      } catch (e) {
        console.debug(e.message)
        token = null
      }
      if (!token) {
        this.ready = true
        return
      }
      // Add token as global header for authorization
      api.defaults.headers.common.Authorization = 'Bearer ' + token
      this.ready = true
    },
    manageKeyListeners: function () {
      document.removeEventListener('keydown', this.handleKeyDownM, false)
      document.addEventListener('keydown', this.handleKeyDownM, false)
    },
    handleKeyDownM: function (e) {
      if (e.key === 'k' && e.metaKey) {
        e.preventDefault()
        e.stopImmediatePropagation()
        this.openDialog()
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
      const groups = await values()
      const groupResults = groups.filter((group) =>
        group.t
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(this.queryText.toLowerCase().replace(/\s+/g, ''))
      )
      if (groupResults.length > 0) {
        // Display results
        for (const result of groupResults) {
          let linkURL = `/q/chat?id=${result.id}`
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
      // Return
      setTimeout(() => {
        this.isProcessingQuery = false
      }, 0)
    },
    gotoLink: function (link) {
      this.fixed = false
      this.$router.push(link)
    },
    minimize: function () {
      window.myWindowAPI?.minimize()
    },
    toggleMaximize: function () {
      window.myWindowAPI?.toggleMaximize()
    },
    closeApp: function () {
      window.myWindowAPI?.close()
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
      }
    }

    const connectorMsg = new BroadcastChannel('wikiric_connector')
    connectorMsg.onmessage = event => {
      handleConnectorMessage(event.data)
    }
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
      toggleLeftDrawer () {
        leftDrawerOpen.value = !leftDrawerOpen.value
      }
    }
  }
})
</script>
