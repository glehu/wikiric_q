<template>
  <div>
    <p class="text-h6 mb4 fontbold">Settings</p>
    <template v-if="userExists">
      <div class="m2 p2 rounded fmt_border">
        <p class="text-h6 mb4 fontbold">Login</p>
        <q-item tag="label" v-ripple>
          <q-item-section avatar top>
            <q-checkbox v-model="user.doRemember"
                        @update:model-value="updateUserData()"/>
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
                        @update:model-value="updateUserData()"/>
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
      user: {},
      userExists: false
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
    },
    updateUserData: async function () {
      // Is there an existing user?
      const usr = await dbGetData('usr')
      if (!usr || !usr._u) {
        this.userExists = false
        return
      }
      if (this.user.doRemember === false) {
        this.user.instantLogin = false
      }
      // Update data
      await dbSetData('usr', this.user)
    }
  }
}
</script>

<style scoped>

</style>
