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
            <q-item-label class="text-lg fontbold flex items-center">
              <template v-if="res.icon">
                <q-icon :name="res.icon" size="2rem" class="mr2"/>
              </template>
              <span class="text-2xl">
                {{ res.t }}
              </span>
            </q-item-label>
            <span>{{ res.desc }}</span>
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
          link: '/q/groups'
        }
      ]
    }
  },
  methods: {
    gotoLink: function (link) {
      this.$router.push(link)
    }
  }
}
</script>

<style scoped>

</style>
