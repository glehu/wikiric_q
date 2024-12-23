<template>
  <q-dialog v-model="show" class="z-fab"
            position="right" full-height
            @before-hide="$emit('close')">
    <q-card class="surface pt4 px4 pb8 w-[99dvw] max-w-xl"
            flat bordered>
      <template v-if="isAdding && item">
        <div class="flex wfull justify-start items-center
                    mb4 gap-2">
          <q-icon name="sym_o_shopping_cart" size="2rem"/>
          <p class="text-lg fontbold">
            Item added to cart
          </p>
        </div>
        <div class="flex gap-4 mb6 mx2 no-wrap">
          <div class="w-20 max-h-20 max-w-20 hauto
                      rounded
                      flex justify-center">
            <template v-if="item.iurls.length > 0">
              <q-carousel
                v-model="item._iurl"
                transition-prev="jump-right"
                transition-next="jump-left"
                swipeable
                animated
                control-color="brand-p"
                prev-icon="arrow_left"
                next-icon="arrow_right"
                height="264px"
                class="scaled_carousel
                       w-20 max-h-20 max-w-20 hauto">
                <template v-for="img in item.iurls" :key="img">
                  <q-carousel-slide :img-src="getImg(img.url, true)"
                                    :name="img.url"
                                    class="wfull hfull">
                  </q-carousel-slide>
                </template>
              </q-carousel>
            </template>
            <template v-else>
              <div class="rounded flex items-center
                          background justify-center
                          w-20 h-20">
                <p class="text-subtitle2">
                  NO IMG
                </p>
              </div>
            </template>
          </div>
          <div class="rounded no-wrap flex-grow
                      flex column gap-2">
            <p class="text-weight-bolder text-md <md:text-sm
                      fmt_border_bottom pb1">
              {{ item.t }}
            </p>
            <div class="flex gap-8 items-start">
              <p class="text-lg fontbold px4 py1 rounded-full
                      background wfit">
                {{ customAmount }}
              </p>
              <div class="wfit">
                <p class="text-subtitle2">
                  Want more, instead?
                </p>
                <q-btn label="2" @click="setCurrentAmount(2)"
                       :class="{tertiary: customAmount === 2}"/>
                <q-btn label="3" @click="setCurrentAmount(3)"
                       :class="{tertiary: customAmount === 3}"/>
                <q-btn label="4" @click="setCurrentAmount(4)"
                       :class="{tertiary: customAmount === 4}"/>
                <q-btn label="5" @click="setCurrentAmount(5)"
                       :class="{tertiary: customAmount === 5}"/>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-if="basket && basket.items?.length > 0">
        <div class="sticky top-0 z-fab pb4">
          <div class="wfull rounded-2
                      background
                      mb4 fmt_border p4">
            <div class="mb4">
              <div class="flex wfull justify-between items-start">
                <p class="text-lg fontbold">
                  Your Cart
                </p>
                <q-btn label="Continue Shopping" v-close-popup
                       no-caps flat
                       class="w50 surface fmt_border rounded"/>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <p class="text-2xl fontbold">
                  Total: {{ total }}
                </p>
                <p class="text-subtitle2">
                  Includes {{ totalVat }} VAT
                </p>
              </div>
              <q-btn label="Go To Checkout" color="primary"
                     unelevated
                     class="fontbold w50 h16 rounded
                            text-body1 fmt_border"
                     @click="$router.push('/checkout')"/>
            </div>
          </div>
        </div>
        <div v-for="entry in basket.items" :key="entry">
          <div class="flex gap-4 ml2 mb4 fmt_border_bottom pb4 no-wrap">
            <div class="w-20 max-h-20 max-w-20 hauto
                        rounded
                        flex justify-center">
              <template v-if="entry.itemObj.iurls.length > 0">
                <q-carousel
                  v-model="entry.itemObj._iurl"
                  transition-prev="jump-right"
                  transition-next="jump-left"
                  swipeable
                  animated
                  control-color="brand-p"
                  prev-icon="arrow_left"
                  next-icon="arrow_right"
                  height="264px"
                  class="scaled_carousel
                         w-20 max-h-20 max-w-20 hauto">
                  <template v-for="img in entry.itemObj.iurls" :key="img">
                    <q-carousel-slide :img-src="getImg(img.url, true)"
                                      :name="img.url"
                                      class="wfull hfull">
                    </q-carousel-slide>
                  </template>
                </q-carousel>
              </template>
              <template v-else>
                <div class="rounded flex items-center
                                      background justify-center
                                      w-20 h-20">
                  <p class="text-subtitle2">
                    NO IMG
                  </p>
                </div>
              </template>
            </div>
            <div class="rounded no-wrap flex-grow
                        flex column gap-2">
              <p class="text-weight-bolder text-md <md:text-sm
                        fmt_border_bottom pb1">
                {{ entry.itemObj.t }}
              </p>
              <template v-if="entry.itemObj.vars">
                <div v-for="vari in entry.itemObj.vars" :key="vari"
                     class="flex items-center gap-2 mt1">
                  <p class="fontbold text-subtitle2">
                    * {{ vari.t }}:
                  </p>
                  <div v-for="sub in vari.vars" :key="sub">
                    <p class="text-subtitle2 fontbold">
                      {{ sub.sval }}
                    </p>
                  </div>
                </div>
              </template>
              <div class="flex items-center gap-x-4 gap-y-2 pr1
                          rounded fmt_border justify-between">
                <q-input v-model="entry.amount" filled
                         type="number"
                         color="brand-p" dense borderless
                         class="w18 text-body1"
                         @update:model-value="handleAmountEdit(entry)"/>
                <p class="wfit text-lg fontbold px4">
                  {{ entry.itemObj._gross }}
                </p>
                <q-btn label="Remove from cart"
                       dense unelevated no-caps
                       class="wfit px2 fmt_border"
                       @click="removeItem(entry.itemObj)"/>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="flex items-center justify-between wfull p4">
          <p class="fontbold text-body1">
            Nothing here, yet!
          </p>
          <q-btn label="Close Cart" v-close-popup/>
        </div>
      </template>
    </q-card>
  </q-dialog>
</template>

<script>

import { useStore } from 'stores/wikistate'
import { dbGetData, dbSetData } from 'src/libs/wikistore'
import { toRaw } from 'vue'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    isAdding: {
      type: Boolean,
      required: true
    },
    itemObj: {
      type: Object,
      required: false
    },
    amount: {
      type: Number,
      required: false
    }
  },
  emits: ['close'],
  name: 'BasketView',
  watch: {
    isOpen (newVal) {
      this.show = newVal
      if (this.show) {
        this.handleDialogOpen()
      }
    }
  },
  data () {
    return {
      store: useStore(),
      show: false,
      basket: null,
      item: null,
      total: 0.0,
      totalVat: 0.0,
      hasCustomAmount: false,
      customAmount: 0
    }
  },
  mounted () {
    document.addEventListener('keydown', this.basketHandleKeydown, false)
  },
  beforeUnmount () {
    document.removeEventListener('keydown', this.basketHandleKeydown, false)
  },
  methods: {
    handleDialogOpen: function () {
      if (this.itemObj) {
        this.item = this.itemObj
      }
      dbGetData('basket').then((res) => {
        this.basket = res
        if (!this.basket) {
          this.initBasket()
        }
      }).catch((err) => {
        console.debug(err.message)
        this.initBasket()
      }).finally(() => {
        if (this.isAdding) {
          this.addItem()
        }
        this.calculateGrossPrices()
        this.calculateTotal()
        this.customAmount = this.amount
      })
    },
    initBasket: function () {
      this.basket = {
        lastEdit: Date.now(),
        items: []
      }
      this.basket.lastEdit = Date.now()
      dbSetData('basket', this.basket)
    },
    getImg: function (imgGUID, get = false) {
      if (imgGUID == null || imgGUID === '') {
        return ''
      } else {
        let ret = imgGUID
        if (get) ret = this.store.serverIP + imgGUID
        return ret
      }
    },
    addItem: function () {
      if (!this.item) return
      const payload = { ...toRaw(this.item) }
      let amt = this.amount
      if (!amt) {
        amt = 1
      }
      // Did we add this item yet?
      let found = false
      for (let i = 0; i < this.basket.items.length; i++) {
        if (this.basket.items[i].itemObj.uid === payload.uid) {
          if (this.compareVariations(this.basket.items[i].itemObj, payload)) {
            this.basket.items[i].amount += amt
            found = true
            break
          }
        }
      }
      if (!found) {
        // Add to cart
        this.basket.items.push({
          itemObj: payload,
          amount: amt
        })
      }
      this.basket.lastEdit = Date.now()
      dbSetData('basket', this.basket)
    },
    calculateTotal: function () {
      this.total = 0.0
      this.totalVat = 0.0
      let tmp
      let amt
      let tot = 0.0
      let vat = 0.0
      for (let i = 0; i < this.basket.items.length; i++) {
        tmp = this.basket.items[i].itemObj
        amt = this.basket.items[i].amount
        tot += amt * (tmp.net * (tmp.vatp + 1))
        vat += amt * (tmp.net * (tmp.vatp))
      }
      this.total = tot.toLocaleString(
        'de-DE', {
          style: 'currency',
          currency: 'EUR'
        })
      this.totalVat = vat.toLocaleString(
        'de-DE', {
          style: 'currency',
          currency: 'EUR'
        })
    },
    removeItem: function (itemObj) {
      if (!itemObj) return
      const uid = itemObj.uid
      for (let i = 0; i < this.basket.items.length; i++) {
        if (this.basket.items[i].itemObj.uid === uid) {
          this.basket.items.splice(i, 1)
          break
        }
      }
      if (this.basket.items.length < 1) {
        this.item = null
      }
      this.basket.lastEdit = Date.now()
      dbSetData('basket', this.basket)
    },
    calculateGrossPrices: function () {
      if (!this.basket.items) return
      for (let i = 0; i < this.basket.items.length; i++) {
        if (this.basket.items[i].amount < 0.0) {
          this.basket.items[i].amount = 0.0
        }
        const item = this.basket.items[i].itemObj
        item._gross =
          (item.net * (item.vatp + 1)) * this.basket.items[i].amount
        item._gross = item._gross.toLocaleString(
          'de-DE', {
            style: 'currency',
            currency: 'EUR'
          })
        this.basket.items[i].itemObj = item
      }
      this.basket.lastEdit = Date.now()
      dbSetData('basket', this.basket)
    },
    handleAmountEdit: function (entry) {
      if (!entry || !entry.itemObj) return
      const uid = entry.itemObj.uid
      for (let i = 0; i < this.basket.items.length; i++) {
        if (this.basket.items[i].itemObj.uid === uid) {
          if (this.compareVariations(this.basket.items[i].itemObj, entry.itemObj)) {
            if (this.basket.items[i].amount < 0.0) {
              this.basket.items[i].amount = 0.0
            }
            // Recalculate gross price
            const item = this.basket.items[i].itemObj
            item._gross = (item.net * (item.vatp + 1)) * this.basket.items[i].amount
            item._gross = item._gross.toLocaleString(
              'de-DE', {
                style: 'currency',
                currency: 'EUR'
              })
            this.basket.items[i].itemObj = item
            break
          }
        }
      }
      this.basket.lastEdit = Date.now()
      dbSetData('basket', this.basket)
      this.calculateTotal()
    },
    compareVariations: function (a, b) {
      // Compare length of variations
      if (a.vars.length !== b.vars.length) {
        return false
      }
      let variationFound = false
      let subVariationFound = false
      // Iterate through a's variations and match b's variations
      for (let i = 0; i < a.vars.length; i++) {
        // Look in b's vars for a's current var
        variationFound = false
        for (let j = 0; j < b.vars.length; j++) {
          // Match title (unique)
          if (b.vars[j].t === a.vars[i].t) {
            // Variation match - Compare sub-variations
            variationFound = true
            // Compare length of sub-variations
            if (a.vars[i].vars.length !== b.vars[j].vars.length) {
              return false
            }
            // Iterate through a's sub-variations
            // ...and match b's sub-variations
            for (let k = 0; k < a.vars[i].vars.length; k++) {
              subVariationFound = false
              for (let l = 0; l < b.vars[j].vars.length; l++) {
                // Compare sval (unique)
                if (b.vars[j].vars[l].sval === a.vars[i].vars[k].sval) {
                  subVariationFound = true
                  break
                }
              }
              if (!subVariationFound) {
                return false
              }
            }
            break
          }
        }
        if (!variationFound) {
          return false
        }
      }
      // Objects match in variations and sub-variations
      return true
    },
    basketHandleKeydown: function (e) {
      if (e.key === 'Escape') {
        this.$emit('close')
      }
    },
    setCurrentAmount: function (amount) {
      this.customAmount = amount
      const payload = { ...toRaw(this.item) }
      for (let i = 0; i < this.basket.items.length; i++) {
        if (this.basket.items[i].itemObj.uid === payload.uid) {
          if (this.compareVariations(this.basket.items[i].itemObj, payload)) {
            this.basket.items[i].amount = amount
            this.handleAmountEdit(this.basket.items[i])
            break
          }
        }
      }
    }
  }
}
</script>

<style scoped>

.scaled_carousel .q-carousel__slide {
  background-color: transparent;
  background-size: contain !important;
  background-repeat: no-repeat;
}

.field_bold * {
  font-weight: bolder !important;
  font-size: 20rem;
}

</style>
