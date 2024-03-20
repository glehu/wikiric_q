<template>
  <div>
    <p class="text-h6 mb4 fontbold">Settings</p>
    <template v-if="userExists">
      <div class="m2 p2 rounded background flex gap-2 items-center">
        <q-icon name="person" size="4rem"/>
        <div class="flex gap-2 items-start
                    justify-between flex-grow">
          <div class="wfit">
            <p class="text-h5 fontbold">
              {{ user.displayName }}
            </p>
            <p class="fontbold">
              @{{ user.username }}
            </p>
          </div>
          <q-btn icon="logout" label="Logout"
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
        startingView: '/'
      },
      userExists: false,
      startingViews: ['/', '/groups']
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
