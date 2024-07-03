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
              <q-knob
                show-value
                font-size="14px"
                v-model="dist._ratio"
                @update:model-value="handleRatioChange"
                min="0" max="1" step="0.001"
                size="96px"
                color="primary"
                track-color="grey-4"
                class="fontbold"
              >
                {{
                  (dist.val).toLocaleString(
                    'de-DE', {
                      style: 'currency',
                      currency: trx.unit
                    })
                }}
              </q-knob>
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        <div class="flex gap-2 py2">
          <div class="flex column gap-2 wfit fmt_border p2 mr3
                      rounded items-center justify-center">
            <template v-if="trx.type === 'income'">
              <q-icon name="sym_o_account_balance" size="32px"/>
              <p class="text-subtitle2 non-selectable">
                Income
              </p>
            </template>
            <template v-else-if="trx.type === 'payment'">
              <q-icon name="sym_o_contract" size="32px"/>
              <p class="text-subtitle2 non-selectable">
                Payment
              </p>
            </template>
            <template v-else>
              <q-icon name="sym_o_arrow_split" size="32px"/>
              <p class="text-subtitle2 non-selectable">
                Invite People
                <br>to split costs.
              </p>
            </template>
          </div>
          <div class="hfit flex-grow">
            <div class="flex gap-2 items-center hfit justify-center
                        px2 py1 rounded background">
              <template v-if="trx.type === 'payment'">
                <div>
                  <p class="text-body1 fontbold">
                    {{ trx.from }}
                  </p>
                </div>
                <div class="wfit">
                  <q-icon name="sym_o_arrow_right" size="2rem"/>
                </div>
              </template>
              <div>
                <p class="text-body1 fontbold">
                  {{ trx.val }} {{ trx.unit }}
                </p>
              </div>
              <div>
                <q-icon name="sym_o_arrow_right" size="2rem"/>
              </div>
              <div>
                <p class="text-body1 fontbold">
                  {{ trx.to }}
                </p>
              </div>
            </div>
            <div class="mt2 max-w-sm">
              <p class="text-subtitle2">
                Is this right? Check before making any payment.
              </p>
              <p class="text-subtitle2 mt2">
                Keep in mind that a transaction can only be cancelled
                if it is the very last transaction made until that point.
              </p>
            </div>
          </div>
        </div>
      </template>
      <div class="mt4 mb1">
        <hr style="color: var(--md-sys-color-outline-variant); margin: 0 !important;">
      </div>
      <div class="wfull flex items-center justify-end mt4 gap-4">
        <p class="text-subtitle2 fontbold non-selectable">
          {{ capitalizeFirstLetter(trx.type) }}
        </p>
        <q-btn label="Submit Transaction" color="primary"
               :disabled="trx.val <= 0.0"
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
      if (this.coll.coll?.length < 1) {
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
      // Do not calculate compensation if the transaction is directional
      // ... or income, as that would be unfair!
      if (this.isDirectional === true || this.trx.type === 'income') {
        return
      }
      let ratioTmp
      for (let i = 0; i < this.coll.coll.length; i++) {
        // Check if user is collaborator if this is directional
        if (this.isDirectional) {
          if (this.trx.to !== this.coll.coll[i]) {
            continue
          }
        }
        if (this.trx.from === this.coll.coll[i]) {
          continue
        }
        // Positive since user owes money
        ratioTmp = 1 / this.coll.coll.length
        this.trx.dist.push({
          from: this.coll.coll[i],
          to: this.trx.from,
          ratio: ratioTmp,
          _ratio: ratioTmp,
          val: Math.abs(this.trx.val * ratioTmp),
          _val: Math.abs(this.trx.val * ratioTmp)
        })
      }
    },
    submitTransaction: function () {
      const payload = JSON.stringify(this.trx)
      this.$emit('trxsubmit', payload)
    },
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    },
    handleRatioChange: function () {
      for (let i = 0; i < this.trx.dist.length; i++) {
        if (this.trx.dist[i]._ratio) {
          this.trx.dist[i].val = this.trx.val * this.trx.dist[i]._ratio
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
