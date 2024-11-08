<template>
  <div>
    <p class="text-h6 mb4 fontbold">Settings</p>
    <template v-if="userExists">
      <div class="m2 p2 rounded background flex gap-2 items-center">
        <q-icon name="person" size="4rem"/>
        <div class="flex gap-2 items-start flex-grow">
          <div class="wfit">
            <p class="text-h5 fontbold">
              {{ user.displayName }}
            </p>
            <p class="fontbold">
              @{{ user.username }}
            </p>
          </div>
          <q-btn icon="logout" label="Logout"
                 class="ml4"
                 no-caps dense flat
                 @click="handleLogout"/>
        </div>
      </div>
      <div class="m2 p2 rounded fmt_border">
        <p class="text-h6 mb4 fontbold ml2">Login</p>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="user.doRemember"
                        @update:model-value="updateUserData"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="fontbold">
              Remember me
            </q-item-label>
            <q-item-label caption>
              When checked, automatically fills out the login data
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="user.instantLogin"
                        @update:model-value="updateUserData"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="fontbold">
              Auto-Login
            </q-item-label>
            <q-item-label caption>
              When checked, logs you in automatically
              when entering the login screen
            </q-item-label>
          </q-item-section>
        </q-item>
        <p class="text-h6 my4 fontbold ml2">Visuals</p>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="user.forceWin"
                        @update:model-value="updateUserData(true)"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="fontbold">
              Force Windows look
            </q-item-label>
            <q-item-label caption>
              When checked, forces a Windows-esque look
              for the navigation bar in the frameless Electron mode
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="user.forceMac"
                        @update:model-value="updateUserData(true)"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="fontbold">
              Force Mac look
            </q-item-label>
            <q-item-label caption>
              When checked, forces a MacOS/DarwinOS-esque look
              for the navigation bar in the frameless Electron mode
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-item tag="label">
          <q-item-section avatar top>
            <q-select :options="colorSchemes"
                      v-model="user.colorTheme"
                      @update:model-value="updateUserData(false)"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="fontbold">
              Color Scheme
            </q-item-label>
            <q-item-label caption>
              Sets the app's colors to either light or dark
            </q-item-label>
          </q-item-section>
        </q-item>
        <p class="text-h6 my4 fontbold ml2">Auto-Start</p>
        <q-item tag="label">
          <q-item-section avatar top>
            <q-select :options="startingViews"
                      v-model="user.startingView"
                      @update:model-value="updateUserData"/>
          </q-item-section>
          <q-item-section>
            <q-item-label class="fontbold">
              Starting View
            </q-item-label>
            <q-item-label caption>
              Automatically goes to the chosen app on start-up
            </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </template>
  </div>
</template>

<script>
import { useStore } from 'stores/wikistate'
import { dbGetData, dbSetData } from 'src/libs/wikistore'

export default {
  name: 'AccountSettingsView',
  data () {
    return {
      store: useStore(),
      user: {
        doRemember: false,
        instantLogin: false,
        forceMac: false,
        forceWin: false,
        colorTheme: 'auto',
        startingView: '/'
      },
      userExists: false,
      startingViews: ['/', '/groups'],
      colorSchemes: ['auto', 'light', 'dark']
    }
  },
  created () {
    this.getUserData()
  },
  methods: {
    getUserData: async function () {
      // Is there an existing user?
      const usr = await dbGetData('usr')
      if (!usr || !usr._u) return
      this.userExists = true
      this.user = usr
      this.sanitizeUser()
    },
    sanitizeUser: function () {
      if (this.user.doRemember === null || this.user.doRemember === undefined) {
        this.user.doRemember = false
      }
      if (this.user.instantLogin === null || this.user.instantLogin === undefined) {
        this.user.instantLogin = false
      }
      if (this.user.forceMac === null || this.user.forceMac === undefined) {
        this.user.forceMac = false
      }
      if (this.user.forceWin === null || this.user.forceWin === undefined) {
        this.user.forceWin = false
      }
      if (this.user.startingView === null || this.user.startingView === undefined) {
        this.user.startingView = '/'
      }
      if (this.user.colorTheme === null || this.user.colorTheme === undefined) {
        this.user.colorTheme = 'auto'
      }
    },
    updateUserData: async function (isOSChange) {
      // Is there an existing user?
      const usr = await dbGetData('usr')
      if (!usr || !usr._u) {
        this.userExists = false
        return
      }
      this.sanitizeUser()
      if (this.user.doRemember === false) {
        this.user.instantLogin = false
      }
      if (this.user.forceMac && usr.forceWin) {
        this.user.forceWin = false
      }
      if (this.user.forceWin && usr.forceMac) {
        this.user.forceMac = false
      }
      // Set app's color scheme
      if (this.user.colorTheme === 'auto') {
        this.$q.dark.set('auto')
        if (this.$q.dark.isActive) {
          document.documentElement.setAttribute('data-theme', 'dark')
        } else {
          document.documentElement.setAttribute('data-theme', 'light')
        }
      } else if (this.user.colorTheme === 'light') {
        this.$q.dark.set(false)
        document.documentElement.setAttribute('data-theme', 'light')
      } else if (this.user.colorTheme === 'dark') {
        this.$q.dark.set(true)
        document.documentElement.setAttribute('data-theme', 'dark')
      }
      // Update data
      await dbSetData('usr', this.user)
      if (isOSChange) {
        this.notifyOSChange()
      }
    },
    notifyOSChange: function () {
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Refresh Needed',
        caption: 'You will see the changes after refreshing the page.',
        actions: [
          {
            icon: 'refresh',
            color: 'white',
            round: true,
            handler: () => {
              location.reload()
            }
          }
        ]
      })
    },
    handleLogout: async function () {
      this.store.logOut()
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Logged out',
        caption: 'See you soon!',
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
      // Remove auto-login
      let usr = await dbGetData('usr')
      if (!usr || !usr._u) {
        this.userExists = false
        return
      }
      usr.instantLogin = false
      // Does the user wish not to be remembered?
      if (usr.doRemember === false) {
        usr = {
          doRemember: false,
          instantLogin: false,
          forceMac: false,
          forceWin: false,
          startingView: '/'
        }
      }
      // Update user data
      await dbSetData('usr', usr)
      setTimeout(() => {
        this.$router.push('/login?redirect=/account')
      }, 0)
    }
  }
}
</script>

<style scoped>

</style>
