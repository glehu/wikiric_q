<template>
  <q-page class="full-height full-width flex items-center justify-center">
    <form class="login flex" @submit.prevent="register">
      <section class="flex justify-center p4 wfull surface rounded-2">
        <div class="md:mt-0">
          <p class="text-weight-bold text-h3 q-mb-lg">
            Welcome
          </p>
          <div class="mb-4">
            <p class="fontbold mb1">
              Login/Username:
            </p>
            <q-input filled standout
                     required
                     v-model="user.email"
                     label-color="brand-p"
                     type="email"
                     class="q-mb-xs"
                     label="Username"
                     autocomplete="username"
            />
          </div>
          <div class="mb-4">
            <p class="fontbold mb1">
              Public Name:
            </p>
            <q-input filled standout
                     required
                     v-model="user.displayName"
                     label-color="brand-p"
                     class="q-mb-xs"
                     label="Display Name"
            />
          </div>
          <div class="mb-4">
            <q-input filled standout
                     required
                     v-model="user.password"
                     v-on:keyup.enter="register"
                     label-color="brand-p"
                     type="password"
                     class="q-mb-xs"
                     label="Password"
                     color="primary"
                     autocomplete="current-password"
            />
          </div>
          <!--<p class="small mb-5 pb-lg-2"><a class="-50" href="#">Forgot password?</a></p>-->
          <div class="full-width flex column q-mt-lg">
            <q-btn color="primary"
                   class="wfull q-py-md text-weight-bold text-h6"
                   label="Sign Up"
                   v-on:click="register">
            </q-btn>
          </div>
        </div>
        <div class="flex column items-center justify-center
                      q-ml-lg q-pa-md rounded-borders">
          <img src='../assets/wikiric/wikiric-logo-big.webp' alt="Logo"
               style="max-width: 256px; max-height: 256px; object-fit: contain">
        </div>
      </section>
    </form>
  </q-page>
</template>

<script>
import { api } from 'boot/axios'
import { useStore } from 'stores/wikistate'
import { dbSetData } from 'src/libs/wikistore'

export default {
  data () {
    return {
      store: useStore(),
      user: {
        token: '',
        username: '',
        displayName: '',
        email: '',
        password: '',
        accountType: '',
        instantLogin: false,
        doRemember: false
      },
      loginResponse: {
        httpCode: 0,
        token: ''
      }
    }
  },
  computed: {},
  mounted () {
  },
  methods: {
    register () {
      this.serverSignUp()
    },
    async serverSignUp (u = null, p = null, accountType = 'email') {
      if (!u) u = this.user.email
      if (!p) p = this.user.password
      if (accountType) {
        this.user.accountType = accountType
      } else {
        this.user.accountType = 'email'
      }
      api({
        url: 'users/public/signup',
        method: 'post',
        data: {
          username: u,
          displayName: this.user.displayName,
          password: p
        }
      })
      .then((data) => {
        this.processSignUp(data)
      })
      .catch((err) => {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Sign-Up Failed',
          caption: 'Maybe the username exists already?',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => { /* ... */
              }
            }
          ]
        })
        this.user.username = ''
        this.user.password = ''
        console.debug(err.message)
      })
    },
    async processSignUp (response) {
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: `Welcome, ${response.data.username}!`,
        caption: 'Sign-Up succeeded',
        actions: [
          {
            icon: 'close',
            color: 'white',
            round: true,
            handler: () => { /* ... */
            }
          }
        ]
      })
      // Set user information
      this.user.username = response.data.username
      this.user.displayName = response.data.displayName
      this.user.ownChatId = response.data.chatID
      this.user._u = this.user.email
      this.user._p = window.btoa(this.user.password)
      this.user.password = ''
      this.store.logIn(this.user)
      // Add token as global header for authorization
      api.defaults.headers.common.Authorization = 'Bearer ' + response.data.token
      // Does the user want us to remember the login information?
      if (this.user.doRemember) {
        // Save data to indexeddb
        await dbSetData('usr', this.user)
        await dbSetData('token', response.data.token)
      }
      // Authorize connector
      await this.$connector.doLogin(this.user._u, this.user._p)
      // Listen to connector messages
      await this.$connector.doSync()
      // Continue
      this.$router.replace('/login?redirect=/account')
    }
  }
}
</script>

<style scoped>
.muArrow {
  position: relative;
  top: 0;
  transition: top ease 0.5s;
}

.muArrow:hover {
  top: -5px;
}

</style>
