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
              <div class="wfull p2 rounded background"
                   style="border: 1px solid var(--md-sys-color-outline-variant)">
                <div class="flex items-center gap-2 mb2">
                  <div class="primary px1 rounded wfit">
                    <p class="text-sm fontbold">
                      {{ capitalizeFirstLetter(notification.type) }}
                    </p>
                  </div>
                  <p class="text-body2 fontbold">
                    {{ notification.t }}
                  </p>
                  <p class="text-body2 mlauto">
                    {{ getHumanReadableDateText(notification.ts, true, true) }}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <q-icon name="sym_o_info" size="1.2rem"/>
                  <p class="text-body2">
                    {{ notification.desc }}
                  </p>
                </div>
                <div class="wfull flex justify-end mt2 gap-2">
                  <template v-if="notification.type === 'frequest'">
                    <q-btn label="Reject" icon-right="sym_o_delete"
                           unelevated dense no-caps
                           class="pl2"
                           @click="deleteNotification(notification.uid)"/>
                    <q-btn label="Accept" icon-right="check"
                           color="primary"
                           unelevated dense no-caps
                           class="pl2"
                           @click="acceptFriendship(notification)"/>
                  </template>
                  <template v-else>
                    <template v-if="notification.act === 'open' && !notification.t.includes('Deleted')">
                      <template v-if="notification.mod === 'wisdom'">
                        <q-btn label="View Wisdom" icon-right="north_east"
                               unelevated dense no-caps
                               class="pl2"
                               @click="gotoWisdom(notification.id)"/>
                      </template>
                    </template>
                    <q-btn label="Mark as Read" icon-right="check"
                           unelevated dense no-caps
                           class="pl2"
                           @click="deleteNotification(notification.uid)"/>
                  </template>
                </div>
              </div>
            </template>
          </template>
          <template v-else>
            <div class="background py2 pl2 pr3 rounded
                        pointer-events-none flex gap2 items-center">
              <q-icon name="check" size="2rem"/>
              <p>You're up to date!</p>
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
    },
    deleteNotification: function (uid) {
      return new Promise((resolve) => {
        api({
          url: `notification/private/delete/${uid}`
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          this.$emit('update')
          resolve()
        })
      })
    },
    acceptFriendship: function (notification) {
      if (notification.act === 'join' || notification.act === 'open') {
        if (notification.mod === 'chat') {
          // Deconstruct ID with REGEX magic!
          const data = [...notification.id.matchAll(
            /([0-9a-z-]+)\?|pw=([0-9a-z-]+)&|ref=(\w+)/g)]
          // Even more magic here:
          // (Explanation, we will have three matches with three groups each,
          // ...so that's why we have both 0,1,2 for index and 1,2,3 for group)
          const id = data[0][1]
          const pw = data[1][2]
          const rf = data[2][3]
          // Delete notification
          this.deleteNotification(notification.uid)
          // Go to private message room
          this.$router.push(`/chat?id=${id}&pw=${pw}&ref=${rf}`)
        }
      }
    },
    gotoWisdom: function (uid) {
      this.$router.push(`/wisdom?id=${uid}`)
    }
  }
}
</script>

<style scoped>

</style>
