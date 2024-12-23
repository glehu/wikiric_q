<template>
  <q-page class="full-height full-width flex items-center justify-center">
    <q-layout
      view="lhh LpR lff"
      container
      style="height: calc(100dvh - 52px)"
      class="overflow-hidden no-scroll">
      <q-drawer
        side="left"
        v-model="sidebarLeft"
        :width="300"
        :breakpoint="768"
        class="surface-variant hfit">
        <q-scroll-area class="fit">
          <q-toolbar class="fmt_border_bottom md:hidden">
            <q-btn flat dense icon="sym_o_left_panel_close"
                   align="left" class="wfull"
                   no-caps label="Hide Sidebar"
                   @click="sidebarLeft = !sidebarLeft">
            </q-btn>
          </q-toolbar>
          <q-btn flat icon="sym_o_arrow_left_alt"
                 align="left" class="wfull pl4 mt2"
                 no-caps
                 @click="clickedBack">
            <span class="ml4 text-body1">Back</span>
          </q-btn>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page style="padding-top: 60px" class="background pb20">
          <q-page-sticky position="top" expand
                         class="background z-fab">
            <q-toolbar>
              <q-btn flat round dense icon="sym_o_dock_to_right"
                     @click="sidebarLeft = !sidebarLeft">
                <q-tooltip class="text-body2">
                  Toggle&nbsp;Sidebar
                </q-tooltip>
              </q-btn>
              <q-toolbar-title class="text-subtitle1">
                <q-breadcrumbs active-color="brand-p">
                  <q-breadcrumbs-el label="Checkout"/>
                </q-breadcrumbs>
              </q-toolbar-title>
            </q-toolbar>
          </q-page-sticky>
          <q-btn flat
                 icon="sym_o_arrow_left_alt"
                 label="Back"
                 class="md:hidden fmt_border ml4 mb3 rounded-2
                        surface-variant"
                 @click="clickedBack">
          </q-btn>
          <form @submit.prevent.stop="onSubmit">
            <div class="p4 background wfull dshadow mb20 flex justify-center">
              <div class="wfull">
                <template v-if="basket && basket.items?.length > 0">
                  <div class="wfull flex gap-2 md:flex-nowrap">
                    <div class="flex-grow-1">
                      <p class="mb6 text-2xl fontbold wfull non-selectable">
                        Your Cart
                      </p>
                      <div v-for="entry in basket.items" :key="entry"
                           class="flex gap-4 ml2 mb2 pb4
                                  xl:flex-nowrap
                                  fmt_border surface
                                  p2 rounded-2">
                        <div class="w-20 max-h-20 max-w-20 hauto
                                    rounded flex justify-center">
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
                        <div class="rounded no-wrap flex-grow max-w-120
                                    flex column gap-2">
                          <p class="text-weight-bolder text-md
                                    pb2 fmt_border_bottom">
                            {{ entry.itemObj.t }}
                          </p>
                          <template v-if="entry.itemObj.vars && entry.itemObj.vars.length > 0">
                            <div class="flex items-center gap-2">
                              <q-icon name="sym_o_style" size="1.4rem"/>
                              <p class="text-subtitle2">
                                Selected Variations:
                              </p>
                            </div>
                            <div v-for="vari in entry.itemObj.vars" :key="vari"
                                 class="flex items-center gap-2 my1">
                              <p class="fontbold text-subtitle1">
                                * {{ vari.t }}:
                              </p>
                              <div v-for="sub in vari.vars" :key="sub"
                                   class="px2 py0.5 rounded fmt_border surface">
                                <p class="text-subtitle2">
                                  {{ sub.sval }}
                                </p>
                              </div>
                            </div>
                          </template>
                          <div class="flex items-center gap-x-4 gap-y-2 pr1 mt1
                                      rounded fmt_border justify-between">
                            <q-input v-model="entry.amount" filled
                                     type="number"
                                     color="brand-p" dense bo
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
                    <div class="flex justify-center flex-grow-2 hfit">
                      <div class="">
                        <p class="mb6 text-2xl fontbold wfull non-selectable">
                          Billing & Delivery Form
                        </p>
                        <div class="p4 surface wfull fmt_border
                                    justify-evenly
                                    rounded-2 flex gap-10">
                          <div class="flex-grow">
                            <p class="mb2 text-2xl fontbold wfull non-selectable">
                              Billing Address
                            </p>
                            <div class="h-14"/>
                            <div class="flex gap-x-2">
                              <q-input v-model="billing.last"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="Surname"
                                       ref="b1"
                                       class="flex-grow"/>
                              <q-input v-model="billing.first"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="First Name"
                                       ref="b2"
                                       class="flex-grow"/>
                            </div>
                            <q-input v-model="billing.company"
                                     dense
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Company"
                                     ref="b3"
                                     class="flex-grow"/>
                            <q-input v-model="billing.phone"
                                     dense
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Phone"
                                     ref="b4"
                                     class="flex-grow"/>
                            <q-input v-model="billing.email"
                                     dense
                                     :rules="[val => !!val || 'Field is required']"
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Email"
                                     ref="b5"
                                     class="flex-grow"/>
                            <div class="flex gap-x-2 mt8">
                              <q-input v-model="billing.postcode"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="Zip Code"
                                       ref="b6"
                                       class="flex-grow-1"/>
                              <q-input v-model="billing.city"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="City"
                                       ref="b7"
                                       class="flex-grow-3"/>
                            </div>
                            <q-input v-model="billing.stateArea"
                                     dense
                                     :rules="[val => !!val || 'Field is required']"
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="State/Area/Province Name"
                                     ref="b8"
                                     class="wfull"/>
                            <q-input v-model="billing.country"
                                     dense
                                     :rules="[val => !!val || 'Field is required']"
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Country"
                                     ref="b9"
                                     class="wfull"/>
                            <div class="flex gap-x-2">
                              <q-input v-model="billing.street"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="Street"
                                       ref="b10"
                                       class="flex-grow-2"/>
                              <q-input v-model="billing.number"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="House/Aprt. Number"
                                       ref="b11"
                                       class="flex-grow-1"/>
                            </div>
                            <q-input v-model="billing.floor"
                                     dense
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Floor"
                                     ref="b12"
                                     class="wfull"/>
                          </div>
                          <div class="flex-grow">
                            <p class="mb2 text-2xl fontbold wfull non-selectable">
                              Delivery Address
                            </p>
                            <div class="h-14">
                              <q-checkbox v-model="billingAsDelivery"
                                          label="Same as billing address"
                                          @update:model-value="handleBillingAsDeliveryChange"/>
                            </div>
                            <div class="flex gap-x-2">
                              <q-input v-model="delivery.last"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="Surname"
                                       ref="d1"
                                       class="flex-grow"/>
                              <q-input v-model="delivery.first"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="First Name"
                                       ref="d2"
                                       class="flex-grow"/>
                            </div>
                            <q-input v-model="delivery.company"
                                     dense
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Company"
                                     ref="d3"
                                     class="flex-grow"/>
                            <q-input v-model="delivery.phone"
                                     dense
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Phone"
                                     ref="d4"
                                     class="flex-grow"/>
                            <q-input v-model="delivery.email"
                                     dense
                                     :rules="[val => !!val || 'Field is required']"
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Email"
                                     ref="d5"
                                     class="flex-grow"/>
                            <div class="flex gap-x-2 mt8">
                              <q-input v-model="delivery.postcode"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="Zip Code"
                                       ref="d6"
                                       class="flex-grow-1"/>
                              <q-input v-model="delivery.city"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="City"
                                       ref="d7"
                                       class="flex-grow-3"/>
                            </div>
                            <q-input v-model="delivery.stateArea"
                                     dense
                                     :rules="[val => !!val || 'Field is required']"
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="State/Area/Province Name"
                                     ref="d8"
                                     class="wfull"/>
                            <q-input v-model="delivery.country"
                                     dense
                                     :rules="[val => !!val || 'Field is required']"
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Country"
                                     ref="d9"
                                     class="wfull"/>
                            <div class="flex gap-x-2">
                              <q-input v-model="delivery.street"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="Street"
                                       ref="d10"
                                       class="flex-grow-2"/>
                              <q-input v-model="delivery.number"
                                       dense
                                       :rules="[val => !!val || 'Field is required']"
                                       @update:model-value="handleFieldEdit"
                                       color="brand-p"
                                       label="House/Aprt. Number"
                                       ref="d11"
                                       class="flex-grow-1"/>
                            </div>
                            <q-input v-model="delivery.floor"
                                     dense
                                     @update:model-value="handleFieldEdit"
                                     color="brand-p"
                                     label="Floor"

                                     ref="d12"
                                     class="wfull"/>
                          </div>
                          <div class="flex-grow">
                            <p class="mb2 text-2xl fontbold wfull non-selectable">
                              Payment
                            </p>
                            <p class="text-subtitle2">
                              Placing the order entails an obligation
                              to pay the seller.
                            </p>
                            <p class="text-subtitle2 mt2">
                              There is no guarantee an order can be cancelled,
                              <br>so it is best to attempt before confirmation
                              by the seller.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div class="flex items-center justify-center wfull p4">
                    <p class="fontbold text-body1 non-selectable">
                      Nothing here, yet!
                    </p>
                    <q-btn flat
                           icon="sym_o_arrow_left_alt"
                           label="Continue Shopping"
                           class="fmt_border ml4 rounded-2
                                  surface-variant"
                           @click="clickedBack">
                    </q-btn>
                  </div>
                </template>
                <div class="wfull flex justify-center mt10">
                  <div class="max-w-screen-lg wfull hfull
                            fmt_border surface-variant
                            rounded-2 p4">
                    <p class="text-subtitle2 non-selectable">
                      <span class="text-weight-bolder">wikiric</span>
                      Stores v0-PreAlpha
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <q-page-sticky position="bottom-right" :offset="[18, 18]"
                           class="wfit">
              <div class="wfull rounded-2
                        dshadow surface
                        items-center fmt_border px3 py2">
                <div class="mb4">
                  <p class="text-2xl fontbold">
                    Total: {{ total }}
                  </p>
                  <p class="text-subtitle2">
                    Includes {{ totalVat }} VAT
                  </p>
                </div>
                <template v-if="basket && basket.items?.length > 0">
                  <q-btn label="order with obligation to pay"
                         type="submit" unelevated
                         color="primary" class="fontbold"/>
                </template>
                <template v-else>
                  <p class="non-selectable">
                    Your cart is empty.
                  </p>
                </template>
              </div>
            </q-page-sticky>
          </form>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script>
import { useStore } from 'stores/wikistate'
import { dbGetData, dbSetData } from 'src/libs/wikistore'

export default {
  name: 'CheckoutPage',
  created () {
    this.basket = null
    dbGetData('basket').then((res) => {
      this.basket = res
    }).catch((err) => {
      console.debug(err.message)
      this.basket = null
    }).finally(() => {
      this.calculateTotal()
      this.calculateGrossPrices()
    })
  },
  data () {
    return {
      store: useStore(),
      fab: false,
      sidebarLeft: false,
      basket: null,
      total: 0.0,
      totalVat: 0.0,
      billingAsDelivery: false,
      billing: {
        country: '',
        postcode: '',
        stateArea: '',
        city: '',
        street: '',
        number: '',
        floor: '',
        first: '',
        last: '',
        company: '',
        email: '',
        cnote: '',
        phone: ''
      },
      deliveryClone: null,
      delivery: {
        country: '',
        postcode: '',
        stateArea: '',
        city: '',
        street: '',
        number: '',
        floor: '',
        first: '',
        last: '',
        company: '',
        email: '',
        cnote: '',
        phone: ''
      }
    }
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
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
          if (this.compareVariations(this.basket.items[i].itemObj, itemObj)) {
            this.basket.items.splice(i, 1)
            break
          }
        }
      }
      if (this.basket.items.length < 1) {
        this.item = null
      }
      this.basket.lastEdit = Date.now()
      dbSetData('basket', this.basket)
      this.calculateTotal()
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
    calculateGrossPrices: function () {
      if (!this.basket.items) return
      for (let i = 0; i < this.basket.items.length; i++) {
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
    handleBillingAsDeliveryChange: function (newVal) {
      if (newVal) {
        this.deliveryClone = { ...this.delivery }
        this.delivery = { ...this.billing }
      } else {
        this.delivery = { ...this.deliveryClone }
      }
    },
    handleFieldEdit: function () {
      if (this.billingAsDelivery) {
        this.delivery = { ...this.billing }
      }
    },
    /**
     * Please lord, forgive me for the sins I am about to commit.
     */
    onSubmit: function () {
      const refs = []
      let isDone = true
      refs.push(this.$refs.b1)
      refs.push(this.$refs.b2)
      refs.push(this.$refs.b3)
      refs.push(this.$refs.b4)
      refs.push(this.$refs.b5)
      refs.push(this.$refs.b6)
      refs.push(this.$refs.b7)
      refs.push(this.$refs.b8)
      refs.push(this.$refs.b9)
      refs.push(this.$refs.b10)
      refs.push(this.$refs.b11)
      refs.push(this.$refs.b12)
      refs.push(this.$refs.d1)
      refs.push(this.$refs.d2)
      refs.push(this.$refs.d3)
      refs.push(this.$refs.d4)
      refs.push(this.$refs.d5)
      refs.push(this.$refs.d6)
      refs.push(this.$refs.d7)
      refs.push(this.$refs.d8)
      refs.push(this.$refs.d9)
      refs.push(this.$refs.d10)
      refs.push(this.$refs.d11)
      refs.push(this.$refs.d12)
      for (const ref of refs) {
        ref.validate()
        if (ref.hasError) {
          isDone = false
        }
      }
      if (!isDone) {
        this.$q.notify({
          color: 'negative',
          position: 'top-right',
          message: 'Not enough information',
          caption: 'Please fill out the mandatory fields.',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {
              }
            }
          ]
        })
      }
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
    }
  }
}
</script>

<style scoped>

</style>
