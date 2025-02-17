<template>
  <q-page class="wfull hfull md:px8 md:py4">
    <q-toolbar>
      <q-tabs
        v-model="tab"
        inline-label
        class="">
        <q-tab name="apps" icon="apps" label="Apps"/>
        <q-tab name="desk" icon="dashboard" label="Desk"/>
        <q-tab name="settings" icon="settings" label="Settings"/>
      </q-tabs>
    </q-toolbar>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="apps">
        <div class="text-h6 mb4 fontbold">Apps</div>
        <q-item v-for="res in apps" :key="res"
                clickable
                @click="gotoLink(res.link)">
          <q-item-section>
            <q-item-label class="flex items-center gap-4 no-wrap">
              <template v-if="res.icon">
                <q-icon :name="res.icon" size="2rem"/>
              </template>
              <div>
                <p class="text-xl md:text-2xl fontbold">
                  {{ res.t }}
                </p>
                <p class="text-subtitle2">
                  {{ res.desc }}
                </p>
              </div>
            </q-item-label>
          </q-item-section>
        </q-item>
        <div class="text-h6 my4 fontbold">Games</div>
        <q-item v-for="res in games" :key="res"
                clickable
                @click="gotoLink(res.link)">
          <q-item-section>
            <q-item-label class="flex items-center gap-4 no-wrap">
              <template v-if="res.icon">
                <q-icon :name="res.icon" size="2rem"/>
              </template>
              <div>
                <p class="text-xl md:text-2xl fontbold">
                  {{ res.t }}
                </p>
                <p class="text-subtitle2">
                  {{ res.desc }}
                </p>
              </div>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-tab-panel>
      <q-tab-panel name="desk">
        <div class="text-h6 mb4 fontbold">Desk</div>
        Desk (dashboard) will be found here!
      </q-tab-panel>
      <q-tab-panel name="settings">
        <account-settings-view/>
      </q-tab-panel>
    </q-tab-panels>
  </q-page>
</template>

<script>
import AccountSettingsView from 'components/AccountSettings.vue'

export default {
  name: 'AccountView',
  components: { AccountSettingsView },
  data () {
    return {
      tab: 'apps',
      apps: [
        {
          t: 'Chat',
          desc: 'Your E2EE communication platform',
          icon: 'code',
          link: '/groups'
        },
        {
          t: 'API Mockingbird',
          desc: 'Analyse HTTP requests',
          icon: 'sym_o_travel_explore',
          link: '/mockingbird'
        },
        {
          t: 'Finance',
          desc: 'Track payments and split with others',
          icon: 'sym_o_finance_mode',
          link: '/finance'
        },
        {
          t: 'E-Commerce',
          desc: 'Find or create a store for services or products',
          icon: 'sym_o_store',
          link: '/stores'
        },
        {
          t: 'Code Editor',
          desc: 'Work in progress IDE',
          icon: 'sym_o_frame_source',
          link: '/codeeditor'
        }
      ],
      games: [
        {
          t: 'Flow Field Demo',
          desc: '',
          icon: 'sym_o_my_location',
          link: '/flowfielddemo'
        }
      ]
    }
  },
  mounted () {
    this.checkTabQuery()
  },
  methods: {
    gotoLink: function (link) {
      this.$router.push(link)
    },
    checkTabQuery: function () {
      const tab = this.$route.query.tab
      if (!tab || tab === '') {
        return
      }
      // I know I could write this.tab = tab but this acts
      // ...as a protective measurement
      switch (tab) {
        case 'apps':
          this.tab = 'apps'
          break
        case 'desk':
          this.tab = 'desk'
          break
        case 'settings':
          this.tab = 'settings'
          break
        default:
          this.tab = 'apps'
      }
    }
  }
}
</script>

<style scoped>

</style>
