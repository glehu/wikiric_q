<template>
  <q-dialog v-model="show" class="z-fab"
            @before-hide="$emit('close')">
    <q-card class="surface p4 w-[99dvw] max-w-xl" flat bordered>
      <p class="text-h5 fontbold">
        {{ coll.t }}
      </p>
      <p class="mt1 text-subtitle2">
        {{ coll.desc }}
      </p>
      <div class="my2">
        <hr style="color: var(--md-sys-color-outline-variant); margin: 0 !important;">
      </div>
      <div class="flex gap-2">
        <q-input square
                 v-model="trx.val"
                 :suffix="trx.unit"
                 mask="#.##"
                 fill-mask="0"
                 reverse-fill-mask
                 autofocus
                 input-class="text-right"
                 input-style="font-weight: 1000"
                 color="brand-p"
                 class="text-h4 max-w-60 fmt_border rounded px2"
                 @update:model-value="calculateDistribution"/>
        <div class="flex column gap-2 flex-grow fmt_border p1 rounded">
          <div class="flex items-center min-w-50">
            <q-icon name="sym_o_contract" color="red"
                    class="text-h5 ml1 mr2"/>
            <q-select :options="coll.coll" v-model="trx.from" filled
                      option-label="from"
                      option-value="from"
                      color="brand-p"
                      class="flex-grow"
                      label="From (Payment)"
                      @update:model-value="calculateDistribution"/>
          </div>
          <div class="flex items-center min-w-50">
            <q-icon name="sym_o_account_balance" color="green"
                    class="text-h5 ml1 mr2"/>
            <q-select :options="coll.coll" v-model="trx.to" filled
                      option-label="from"
                      option-value="from"
                      color="brand-p"
                      class="flex-grow"
                      label="To (Income)"
                      @update:model-value="calculateDistribution"/>
          </div>
        </div>
      </div>
      <div class="mb4">
        <q-input v-model="trx.comment" label="Comment (optional)"
                 autogrow
                 color="brand-p"/>
      </div>
      <p class="fontbold text-body1 my2 non-selectable">
        Distribution
      </p>
      <template v-if="trx.dist && trx.dist.length > 0">
        <div class="flex gap-4">
          <template v-for="dist in trx.dist" :key="dist">
            <div class="flex column gap-2 wfit fmt_border rounded px4 pb4 pt1">
              <p class="text-subtitle1 fontbold">
                <template v-if="dist.from && dist.from.trim() !== ''">
                  {{ dist.from }}
                </template>
                <template v-if="dist.to && dist.to.trim() !== ''">
                  <q-icon name="sym_o_arrow_right"/>
                  {{ dist.to }}
                </template>
              </p>
              <q-circular-progress
                show-value
                font-size="14px"
                :value="dist.ratio * 100"
                size="96px"
                :thickness="0.2"
                color="primary"
                track-color="grey-4"
                class="fontbold">
                {{
                  (dist.val).toLocaleString(
                    'de-DE', {
                      style: 'currency',
                      currency: trx.unit
                    })
                }}
              </q-circular-progress>
            </div>
          </template>
          <template v-if="trx.dist.length < 2">
            <div class="flex column gap-2 wfit fmt_border
                      rounded py2 px4 items-center justify-center">
              <q-icon name="sym_o_arrow_split" size="32px"/>
              <p class="text-subtitle2 non-selectable">
                Invite People
                <br>to split costs.
              </p>
            </div>
          </template>
        </div>
      </template>
      <div class="mt4 mb1">
        <hr style="color: var(--md-sys-color-outline-variant); margin: 0 !important;">
      </div>
      <div class="wfull flex items-center justify-end mt4 gap-4">
        <p class="text-subtitle2 fontbold non-selectable">
          {{ capitalizeFirstLetter(trx.type) }}
        </p>
        <q-btn label="Submit" color="primary"
               @click="submitTransaction"/>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import { useStore } from 'stores/wikistate'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    collection: {
      type: Object,
      required: true
    },
    from: {
      type: String,
      default: ''
    },
    to: {
      type: String,
      default: ''
    }
  },
  name: 'FinanceTransactionEditor',
  emits: ['trxsubmit', 'close'],
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (!this.show) {
        return
      }
      this.handleDialogOpen()
    },
    collection (newVal) {
      if (!newVal?.uid) return
      this.trx.pid = newVal.uid.trim()
    }
  },
  data () {
    return {
      store: useStore(),
      show: false,
      coll: {
        t: '',
        desc: ''
      },
      isDirectional: false,
      trx: {
        val: 0.0,
        unit: 'EUR',
        from: '',
        to: '',
        dist: [],
        comment: ''
      }
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.trx = {
        val: 0.0,
        unit: 'EUR',
        from: '',
        to: '',
        dist: [],
        comment: ''
      }
      this.coll = this.collection
      if (this.coll.coll.length < 1) {
        this.coll.coll = [{
          from: this.store.user.username
        }]
      }
      this.trx.pid = this.collection.uid.trim()
      if (this.from.trim() !== '') {
        this.trx.from = this.from.trim()
      } else if (this.to.trim() === '') {
        this.trx.from = this.store.user.username
      }
      if (this.to.trim() !== '') {
        this.trx.to = this.to.trim()
      }
      this.calculateDistribution()
    },
    calculateDistribution: function () {
      if (this.trx.from.trim() === '') {
        this.trx.type = 'income'
      }
      if (this.trx.to.trim() === '') {
        this.trx.type = 'payment'
      }
      if (this.trx.from.trim() !== '' && this.trx.to.trim() !== '') {
        this.trx.type = 'payment'
        this.isDirectional = true
      } else {
        this.isDirectional = false
      }
      this.trx.dist = []
      let ratioTmp
      for (let i = 0; i < this.coll.coll.length; i++) {
        // Check if user is collaborator if this is directional
        if (this.isDirectional || this.trx.type === 'income') {
          if (this.trx.to !== this.coll.coll[i]) {
            continue
          }
        }
        if (this.trx.from === this.coll.coll[i]) {
          // Negative since user will expect money back
          ratioTmp = 1 / this.coll.coll.length * -1
          if (this.coll.coll.length === 1) {
            // If there is nobody else, cover the full cost
            ratioTmp = 1
            this.trx.dist.push({
              from: this.coll.coll[i],
              ratio: ratioTmp,
              val: this.trx.val * ratioTmp
            })
          } else {
            this.trx.dist.push({
              from: this.coll.coll[i],
              ratio: ratioTmp,
              val: this.trx.val * ratioTmp
            })
          }
        } else {
          // Positive since user owes money
          ratioTmp = 1 / this.coll.coll.length
          if (this.trx.type === 'income') {
            // If its pure income, receive it all
            ratioTmp = 1
            this.trx.dist.push({
              from: '',
              to: this.coll.coll[i],
              ratio: ratioTmp,
              val: this.trx.val * ratioTmp
            })
            continue
          } else if (this.coll.coll.length === 1) {
            // If its pure income, pay it all
            ratioTmp = 1
          }
          if (this.isDirectional) {
            ratioTmp = -1
            this.trx.dist.push({
              from: this.trx.from,
              to: this.coll.coll[i],
              ratio: ratioTmp,
              val: this.trx.val * ratioTmp
            })
          } else {
            this.trx.dist.push({
              from: this.coll.coll[i],
              to: this.trx.from,
              ratio: ratioTmp,
              val: this.trx.val * ratioTmp
            })
          }
        }
      }
    },
    submitTransaction: function () {
      const payload = JSON.stringify(this.trx)
      this.$emit('trxsubmit', payload)
    },
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    }
  }
}
</script>

<style scoped>

</style>
