<template>
  <q-dialog v-model="show" class="z-top">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <div class="flex items-center justify-between">
        <p class="fontbold text-h6 pointer-events-none">
          Notifications
        </p>
        <q-btn label="Mark all as read" icon="delete" flat no-caps
               @click="tidyNotifications"/>
      </div>
      <div class="mt4">
        <div class="flex wfull gap2">
          <template v-if="notifications && notifications.length > 0">
            <template v-for="notification in notifications" :key="notification">
              <div class="wfull p2 rounded"
                   style="border: 1px solid var(--md-sys-color-outline-variant)">
                <div class="flex items-center gap-2">
                  <p class="text-sm fontbold px1 rounded primary wfit">
                    {{ capitalizeFirstLetter(notification.type) }}
                  </p>
                  <p class="text-body1">
                    {{ notification.t }}
                  </p>
                  <p class="text-body2 mlauto">
                    {{ getHumanReadableDateText(notification.ts, true, true) }}
                  </p>
                </div>
                <p class="text-body2">
                  {{ notification.desc }}
                </p>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="background p2 rounded pointer-events-none">
              <p>Nothing here, yet.</p>
            </div>
          </template>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { DateTime } from 'luxon'
import { api } from 'boot/axios'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    notifications: {
      type: Array,
      required: true
    }
  },
  emits: ['update'],
  name: 'NotificationListView',
  watch: {
    isOpen () {
      this.show = true
      this.handleDialogOpen()
    }
  },
  data () {
    return {
      show: false
    }
  },
  methods: {
    handleDialogOpen: function () {
    },
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    },
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
    },
    tidyNotifications: function () {
      return new Promise((resolve) => {
        api({
          url: 'notification/private/tidy'
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          this.$emit('update')
          resolve()
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
