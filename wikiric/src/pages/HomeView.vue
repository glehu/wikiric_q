<template>
  <q-page class="wfull hfull background
                 flex justify-center">
    <div class="flex column wfull hfull relative overflow-hidden
                justify-center text-center items-center
                rounded-18 mx2 mt2 md:mx4 md:mt4 non-selectable">
      <div class="absolute top-0 left-0 wfull hfull">
        <img src='../assets/account/pexels-marek-piwnicki-10050567.jpg' alt="Banner"
             style="object-fit: fill; object-position: top"
             class="wfull hfull">
        <div class="backdrop-blur
                    absolute top-0 left-0 wfull hfull"></div>
      </div>
      <div class="flex column py28 px8 z1">
        <div class="q-pb-md md:text-start">
          <p class="text-h2 text-white">
            Open Source
          </p>
          <p class="text-h2 md:text-h1 text-weight-bold text-white">
            Collaboration
          </p>
        </div>
        <p class="text-weight-bold no-pointer-events
                  text-body1 md:text-start text-white">
          {{ $t("home.title") }}
          <br>Powered by wikiric and
          <span class="italic">{{ userCount }}</span> others.
        </p>
        <div class="relative q-mt-lg flex justify-center
                    md:justify-start">
          <q-btn color="primary" no-caps
                 class="muArrow q-mr-sm q-mb-sm rounded-18"
                 v-on:click="gotoLogin()">
            <div class="column text-left q-pa-md px10">
              <p class="text-h5 text-weight-bold q-ma-none">Sign In</p>
            </div>
          </q-btn>
          <q-btn color="transparent" no-caps
                 class="muArrow q-mb-sm backdrop-blur-3xl rounded-18
                        fmt_border"
                 v-on:click="gotoRegistration()">
            <div class="column text-left q-pa-md">
              <p class="text-h5 text-weight-bold q-ma-none">Sign Up</p>
            </div>
          </q-btn>
        </div>
      </div>
    </div>
    <div class="wfull relative p8 markedView non-selectable">
      <p class="text-weight-bolder text-lg">
        E X P E R I M E N T A L
      </p>
      <p>
        This website is under construction.
        You can find a working version here:
        <a :href="'https://wikiric.xyz'">wikiric</a>
      </p>
    </div>
  </q-page>
</template>

<script>

import { defineComponent } from 'vue'
import { useStore } from 'stores/wikistate'
import { api } from 'boot/axios'

export default defineComponent({
  data () {
    return {
      userCount: '8',
      store: useStore()
    }
  },
  created () {
    // this.getUsercount()
  },
  methods: {
    gotoLogin () {
      if (this.store.isLoggedIn) {
        this.$router.push('/q/account')
      } else {
        this.$router.push('/q/login?redirect=/q/account')
      }
    },
    gotoRegistration () {
      if (this.store.isLoggedIn) {
        this.$router.push('/q/account')
      } else {
        this.$router.push('/q/register?redirect=/q/login')
      }
    },
    getUsercount: async function () {
      return new Promise((resolve) => {
        api({
          url: 'users/public/count'
        }).then((response) => {
          if (response.data) this.userCount = response.data
        }).catch((err) => {
          if (err.message) return
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    }
  },
  computed: {
    isLoggedIn () {
      return this.$store.state.authenticated
    },
    usageTracker () {
      return this.$store.state.usageTracking
    }
  }
})
</script>

<style scoped>

.header-margin {
  min-height: 55px;
}

.b_purple {
  background-color: #68349b;
}

.c_purple {
  color: #68349b;
}

.b_darkblue {
  background-color: #041830;
}

.c_darkblue {
  color: #041830;
}

.b_darkgray {
  background-color: #192129;
}

.c_darkgray {
  color: #192129;
}

.b_darkergray {
  background-color: #131313;
}

.c_darkergray {
  color: #131313;
}

.b_gray {
  background-color: #293139;
}

.c_gray {
  color: #293139;
}

.c_lightgray {
  color: #aeaeb7;
}

.b_orange {
  background-color: #ff5d37;
}

.c_orange {
  color: #ff5d37;
}

.wrapper {
  display: grid;
  gap: 50px;
  grid-auto-rows: minmax(100px, auto);
  grid-template-columns: repeat(1, 1fr);
}

/* Small devices (portrait tablets and large phones, 765px and up) */
@media only screen and (min-width: 992px) {
  .wrapper {
    grid-template-columns: repeat(2, 1fr);
  }
}

.shadow-box {
  box-shadow: -10px 10px 20px 15px rgba(0, 0, 0, 0.8);
  border-radius: 1em
}

.purplehover {
  color: #68349b;
  text-shadow: 0 0 10px #7b40b4;
}

.darkbutton:hover > .purplehover {
  color: #46b59b;
  text-shadow: 0 0 15px #46b59b;
}

.muArrow, .mdArrow {
  position: relative;
  top: 0;
  transition: top ease 0.5s;
}

.muArrow:hover {
  top: -8px;
}

.mdArrow:hover {
  top: +8px;
}

.demotext {
  font-size: 1rem;
  padding-top: 10px;
  pointer-events: none;
  width: 100%;
  text-align: center
}

</style>
