<template>
  <q-card>
    <q-card-section class="w-[300px] max-w-[90dvw]">
      <div class="flex row items-start wfull">
        <div>
          <member-icon :iurl="member.iurl"
                       :iurla="member.iurla"
                       :online="member.online"
                       size="78px"/>
        </div>
        <div class="flex column">
          <span class="fontbold text-h5">{{ member.name }}</span>
          <span class="text-subtitle1">
            <q-tooltip class="text-body2">
              Username
            </q-tooltip>
            <q-icon name="person" size="1rem"/>
            {{ member.usr }}
          </span>
          <span class="text-subtitle2">
            <q-tooltip class="text-body2">
              Join Date
            </q-tooltip>
            <q-icon name="key" size="1rem">
            </q-icon>
            {{ getHumanReadableDateText(member.ts, true, true) }}
          </span>
        </div>
      </div>
      <q-separator class="my4 wfull"/>
      <template v-if="member.usr === store.user.username">
        <q-btn icon="edit" label="Edit Profile" color="primary"/>
      </template>
    </q-card-section>
  </q-card>
</template>

<script>
import MemberIcon from 'components/chat/MemberIcon.vue'
import { DateTime } from 'luxon'
import { useStore } from 'stores/wikistate'

export default {
  components: { MemberIcon },
  props: {
    member: {
      type: Object,
      required: true
    }
  },
  name: 'MemberCard',
  data () {
    return {
      store: useStore()
    }
  },
  methods: {
    /**
     *
     * @param {String} date
     * @param {Boolean=false} withTime
     * @param {Boolean=false} fullDate
     * @returns {string}
     */
    getHumanReadableDateText: function (date, withTime = false, fullDate = false) {
      const time = DateTime.fromISO(date).toLocaleString(DateTime.TIME_24_SIMPLE)
      const start = DateTime.fromISO(DateTime.fromISO(date).toISODate())
      const end = DateTime.fromISO(DateTime.now().toISODate())
      const diffDays = Math.ceil(end.diff(start) / (1000 * 60 * 60 * 24))
      let suffix = ''
      if (withTime) {
        suffix = ', ' + time
      }
      let returnString
      switch (diffDays) {
        case -5:
          returnString = 'In 5 days' + suffix
          break
        case -4:
          returnString = 'In 4 days' + suffix
          break
        case -3:
          returnString = 'In 3 days' + suffix
          break
        case -2:
          returnString = 'In 2 days' + suffix
          break
        case -1:
          returnString = 'Tomorrow' + suffix
          break
        case 0:
          returnString = 'Today' + suffix
          break
        case 1:
          returnString = 'Yesterday' + suffix
          break
        case 2:
          returnString = '2 days ago' + suffix
          break
        case 3:
          returnString = '3 days ago' + suffix
          break
        default:
          if (!fullDate) {
            returnString = start.toLocaleString(DateTime.DATE_MED) + suffix
          } else {
            returnString = start.toLocaleString(DateTime.DATE_HUGE) + suffix
          }
      }
      return returnString
    }
  }
}
</script>

<style scoped>

</style>
