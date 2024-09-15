<template>
  <q-page class="full-height full-width flex items-center justify-center">
    <form class="login flex" @submit.prevent="login">
      <section class="flex justify-center p4 wfull surface rounded-2">
        <div class="md:mt-0">
          <p class="text-weight-bold text-h3 q-mb-lg">
            Sign In
          </p>
          <div class="mb-4">
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
            <q-input filled standout
                     required
                     v-model="user.password"
                     v-on:keyup.enter="login"
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
                   label="Login"
                   v-on:click="login">
            </q-btn>
            <q-checkbox label="Remember me"
                        class="wfull pt2"
                        v-model="user.doRemember"/>
            <template v-if="user.doRemember">
              <q-checkbox label="Auto-Login"
                          class="wfull pt2"
                          v-model="user.instantLogin"/>
            </template>
          </div>
          <div class="flex items-center justify-between full-width q-mt-md">
            <p class="no-pointer-events text-subtitle2 q-mb-none">No Account?</p>
            <q-btn v-on:click="gotoRegister"
                   label="Sign Up"
                   class="muArrow surface-variant
                                  text-weight-bold">
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
import { dbGetData, dbSetData } from 'src/libs/wikistore'

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
    this.checkRememberedUser()
  },
  methods: {
    login () {
      if (!this.isLoggedIn) {
        // Bypass login for testing purposes
        if (this.user.email === 'test@cwo') {
          this.store.logIn({
            email: 'test@cwo',
            password: 'test',
            token: '! Test Account - No Token In Offline Mode !'
          })
          this.$router.push(this.$route.query.redirect.toString() || '/')
        } else {
          // Regular login
          this.serverLogin()
        }
      } else {
        console.log('User already logged in.')
      }
    },
    async serverLogin (u = null, p = null, accountType = 'email') {
      if (!u) u = this.user.email
      if (!p) p = this.user.password
      if (accountType) {
        this.user.accountType = accountType
      } else {
        this.user.accountType = 'email'
      }
      api({
        url: 'auth/private/signin',
        auth: {
          username: u,
          password: p
        }
      })
      .then((data) => {
        this.processLogin(data)
      })
      .catch((err) => {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Login Failed',
          caption: 'Wrong username or password',
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
        this.user.password = ''
        console.debug(err.message)
      })
    },
    async processLogin (response) {
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: `Welcome, ${response.data.username}!`,
        caption: 'Login succeeded',
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
      let redirUrl = this.$route.query.redirect.toString() || '/'
      if (redirUrl === '/login') {
        redirUrl = '/account'
      }
      this.$router.replace(redirUrl)
    },
    gotoRegister () {
      const redirect = this.$route.query.redirect
      if (redirect) {
        this.$router.push('/register?redirect=' + redirect)
      } else {
        this.$router.push('/register')
      }
    },
    checkRememberedUser: async function () {
      // Is there an existing user?
      const usr = await dbGetData('usr')
      if (!usr || !usr._u) return
      this.user = usr
      this.user.password = this.user._p
      if (this.user.instantLogin) {
        setTimeout(() => {
          this.login()
        }, 0)
      }
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
