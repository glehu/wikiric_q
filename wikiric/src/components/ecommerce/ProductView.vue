<template>
  <q-dialog v-model="show" class="z-fab"
            full-width full-height
            @before-hide="$emit('close')">
    <q-card class="surface"
            flat bordered>
      <div id="item_scroller"
           class="flex wfull hfull surface overflow-x-hidden">
        <div class="flex gap-4
                    px1 pt4 wfull
                    lg:flex-nowrap">
          <div class="w-100 min-w-100 min-h-100
                      xl:w-140 xl:min-w-140 xl:min-h-140
                      <lg:wfull
                      rounded lg:ml4
                      flex justify-center">
            <template v-if="isRequestUndergoing">
              <q-skeleton width="90%" height="90%"></q-skeleton>
            </template>
            <template v-if="item.iurls?.length > 0">
              <q-carousel
                v-model="item._iurl"
                transition-prev="jump-right"
                transition-next="jump-left"
                swipeable
                animated
                control-color="brand-p"
                prev-icon="arrow_left"
                next-icon="arrow_right"
                arrows
                :thumbnails="item?.iurls?.length > 1"
                height="264px"
                class="scaled_carousel
                       w-100 min-w-100 min-h-100
                       xl:w-140 xl:min-w-140 xl:min-h-140">
                <template v-for="img in item.iurls" :key="img">
                  <q-carousel-slide :img-src="getImg(img.url, true)"
                                    :name="img.url"
                                    class="wfull hfull">
                  </q-carousel-slide>
                </template>
              </q-carousel>
            </template>
            <template v-else>
              <div class="w-100 min-w-100 min-h-100
                          xl:w-140 xl:min-w-140 xl:min-h-140
                          rounded-2 background flex
                          items-center justify-center">
                <p class="text-subtitle2">
                  NO IMAGE
                </p>
              </div>
            </template>
          </div>
          <div class="p4 wfull rounded
                      no-wrap flex-grow
                      flex column gap-2">
            <template v-if="isRequestUndergoing">
              <q-skeleton width="90%" height="30px"></q-skeleton>
            </template>
            <div class="fmt_border_bottom pb2 mb1 flex
                        justify-between
                        gap-4 items-baseline">
              <p class="text-weight-bolder text-xl sm:text-2xl">
                {{ item.t }}
              </p>
              <template v-if="canEdit">
                <q-btn icon="edit" label="Edit"
                       class="wfit"
                       dense flat
                       @click="isEditingItem = true"/>
              </template>
            </div>
            <div class="flex items-center gap-4">
              <template v-if="item.vars && item.vars.length > 0">
                <q-btn class="px2 py1 rounded secondary wfit
                              fontbold text-sm"
                       icon="sym_o_style"
                       no-caps dense
                       :label="item.vars.length + ' Variations available (click to view)'"
                       @click="viewItemVariations"/>
              </template>
              <template v-if="itemObj && itemObj.views">
                <p class="fontbold text-subtitle2">
                  <q-icon name="visibility" size="1.4rem" class="mr2 ml4"/>
                  {{ itemObj.views }} Views
                </p>
              </template>
            </div>
            <q-expansion-item class="overflow-hidden mt2"
                              default-opened dense>
              <template v-slot:header>
                <div class="flex items-center justify-between wfull">
                  <p class="fontbold text-subtitle2">
                    <q-icon name="sym_o_description" size="1.4rem" class="mr2"/>
                    Description:
                  </p>
                </div>
              </template>
              <template v-if="isRequestUndergoing">
                <q-skeleton width="90%" height="20px" class="mb1"></q-skeleton>
                <q-skeleton width="65%" height="20px" class="mb1"></q-skeleton>
                <q-skeleton width="80%" height="20px" class="mb1"></q-skeleton>
              </template>
              <div class="markedView mt2 line-height-snug
                          text-subtitle2 whitespace-break-spaces"
                   v-html="item.desc"></div>
            </q-expansion-item>
            <template v-if="item.brand">
              <q-expansion-item class="overflow-hidden mt2"
                                default-opened dense>
                <template v-slot:header>
                  <div class="flex items-center justify-between wfull">
                    <p class="fontbold text-subtitle2">
                      <q-icon name="sym_o_apartment" size="1.4rem" class="mr2"/>
                      Brand:
                    </p>
                  </div>
                </template>
                <div class="px4 py2 rounded-2 background wfit mt2">
                  <p class="text-subtitle1 text-weight-medium">
                    {{ item.brand }}
                  </p>
                </div>
              </q-expansion-item>
            </template>
            <template v-if="item.attr && item.attr.length > 0">
              <q-expansion-item class="overflow-hidden mt2"
                                default-opened dense>
                <template v-slot:header>
                  <div class="flex items-center justify-between wfull">
                    <p class="fontbold text-subtitle2">
                      <q-icon name="sym_o_info" size="1.4rem" class="mr2"/>
                      Attributes:
                    </p>
                  </div>
                </template>
                <table class="table_start border-spacing-none
                              text-subtitle2 mt2
                              background rounded-2 wfit p2">
                  <template v-for="attr in item.attr" :key="attr">
                    <tr>
                      <td class="fontbold">
                        {{ attr.t }}:
                      </td>
                      <td>
                        {{ attr.sval }}
                      </td>
                      <td>
                        {{ attr.desc }}
                      </td>
                    </tr>
                  </template>
                </table>
              </q-expansion-item>
            </template>
            <template v-if="item.vars && item.vars.length > 0">
              <q-expansion-item class="overflow-hidden mt2"
                                default-opened dense>
                <template v-slot:header>
                  <div class="flex items-center justify-between wfull">
                    <p class="fontbold text-subtitle2">
                      <q-icon name="sym_o_style" size="1.4rem" class="mr2"/>
                      Available Variations:
                    </p>
                  </div>
                </template>
                <div id="item_variations"
                     class="flex gap-2 column mt4">
                  <div v-for="vari in item.vars" :key="vari"
                       class="fmt_border rounded-2 px4 pt3 pb4">
                    <div class="flex gap-2 items-center justify-between">
                      <p class="fontbold text-xl">
                        {{ vari.t }}
                      </p>
                      <template v-if="!vari.opt">
                        <div class="px1 py0.1 background rounded wfit">
                          <p class="text-subtitle2 fontbold">
                            Mandatory
                          </p>
                        </div>
                      </template>
                    </div>
                    <div class="flex gap-2 mt4">
                      <template v-for="sub in vari.vars" :key="sub">
                        <q-btn class="px2 py1 rounded fmt_border"
                               :class="{'primary': checkVariationActive(vari.t, sub.sval)}"
                               flat dense no-caps
                               v-on:click="toggleVariationQuery(vari.t, sub.sval)">
                          <p class="text-sm fontbold">
                            {{ sub.sval }}
                          </p>
                        </q-btn>
                      </template>
                    </div>
                  </div>
                </div>
              </q-expansion-item>
            </template>
            <template v-if="item.cats && item.cats.length > 0">
              <q-expansion-item class="overflow-hidden mt2"
                                default-opened dense>
                <template v-slot:header>
                  <div class="flex items-center justify-between wfull">
                    <p class="fontbold text-subtitle2">
                      <q-icon name="sym_o_label" size="1.4rem" class="mr2"/>
                      Categories:
                    </p>
                  </div>
                </template>
                <div>
                  <table class="table_start border-spacing-none
                                text-subtitle2 mt2
                                background rounded-2 wfit p2">
                    <template v-for="cat in item.cats" :key="cat">
                      <tr>
                        <td class="fontbold">
                          {{ cat }}
                        </td>
                      </tr>
                    </template>
                  </table>
                </div>
              </q-expansion-item>
            </template>
          </div>
        </div>
        <div class="flex column items-end p4 rounded
                    sticky bottom-0 wfull
                    background fmt_border">
          <p class="text-3xl <sm:text-2xl text-weight-bold">
            {{ item._gross }}
          </p>
          <p class="text-xs text-weight-bold">
            Includes {{ item._vat }} ({{ item._vatp }} %) VAT
          </p>
          <q-btn label="Add to Cart"
                 color="primary"
                 icon="sym_o_shopping_cart"
                 class="fontbold mt2"
                 @click="handleAddToCart"/>
        </div>
      </div>
    </q-card>
  </q-dialog>
  <basket-view :is-adding="isAddToCart"
               :is-open="isAddToCart"
               :item-obj="item"
               :amount="amount"
               @close="onBasketClose"/>
  <product-edit-view :item-id="itemId"
                     :is-open="isEditingItem"
                     @close="isEditingItem = false; getProduct()"/>
</template>

<script>

import axios from 'axios'
import { useStore } from 'stores/wikistate'
import { scroll } from 'quasar'
import BasketView from 'components/ecommerce/BasketView.vue'
import ProductEditView from 'components/ecommerce/ProductEditView.vue'

const {
  setVerticalScrollPosition
} = scroll

export default {
  components: {
    ProductEditView,
    BasketView
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    itemId: {
      type: String,
      required: true
    },
    itemObj: {
      type: Object,
      required: false
    },
    canEdit: {
      type: Boolean,
      required: true
    }
  },
  name: 'ProductView',
  emits: ['close'],
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
      item: {
        t: '',
        desc: '',
        keys: ''
      },
      variationQuery: [],
      isAddToCart: false,
      amount: 1,
      isRequestUndergoing: false,
      isEditingItem: false
    }
  },
  methods: {
    handleDialogOpen: function () {
      this.getProduct()
      this.variationQuery = []
    },
    getProduct: async function () {
      if (!this.itemId || this.itemId.trim() === '') {
        this.item = {
          t: '',
          desc: '',
          keys: ''
        }
        return
      }
      this.isRequestUndergoing = true
      return new Promise((resolve) => {
        axios.get(
          `${this.store.serverIP}items/public/get/${this.itemId.trim()}`)
        .then((response) => {
          this.item = response.data
          // Sanitize
          this.item._vatp = this.item.vatp * 100
          this.item._vat =
            this.item.net * this.item.vatp
          this.item._gross =
            this.item.net * (this.item.vatp + 1)
          // Make it human-readable
          this.item._vat = this.item._vat.toLocaleString(
            'de-DE', {
              style: 'currency',
              currency: 'EUR'
            })
          this.item._gross = this.item._gross.toLocaleString(
            'de-DE', {
              style: 'currency',
              currency: 'EUR'
            })
          // Set first image for carousel
          if (!this.item.iurls || this.item.iurls.length < 1) {
            this.item._iurl = ''
          } else {
            this.item._iurl = this.item.iurls[0].url
          }
        }).catch((e) => {
          this.item = {
            t: '',
            desc: '',
            keys: ''
          }
          console.debug(e.message)
        }).finally(() => {
          this.isRequestUndergoing = false
          resolve()
        })
      })
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
    /**
     *
     * @param {String} t
     * @param {String} sval
     */
    toggleVariationQuery: function (t, sval) {
      for (let i = 0; i < this.variationQuery.length; i++) {
        if (this.variationQuery[i]?.t === t) {
          // We found the variation
          if (!this.variationQuery[i].svals ||
            this.variationQuery[i].svals.length < 1) {
            // Variation did not have sub-variations yet
            this.variationQuery[i].svals = [sval]
            return
          }
          for (let j = 0; j < this.variationQuery[i].svals.length; j++) {
            if (this.variationQuery[i].svals[j] === sval) {
              // We found the sub-variation, so we remove it
              this.variationQuery[i].svals.splice(j, 1)
              if (this.variationQuery[i].svals.length < 1) {
                this.variationQuery.splice(i, 1)
              }
              return
            }
          }
          // We did not find the sub-variation yet, so we add it
          this.variationQuery[i].svals.push(sval)
          return
        }
      }
      // Variation did not exist yet, so we add it
      this.variationQuery.push({
        t,
        svals: [sval]
      })
    },
    checkVariationActive: function (t, sval) {
      if (this.variationQuery.length < 1) {
        return false
      }
      for (let i = 0; i < this.variationQuery.length; i++) {
        if (this.variationQuery[i]?.t && this.variationQuery[i].t === t) {
          // We found the variation
          if (!this.variationQuery[i].svals) {
            // Variation did not have sub-variations yet
            continue
          }
          for (let j = 0; j < this.variationQuery[i].svals.length; j++) {
            if (this.variationQuery[i].svals[j] === sval) {
              // We found the sub-variation
              return true
            }
          }
        }
      }
      return false
    },
    viewItemVariations: function () {
      const elem = document.getElementById('item_variations')
      if (elem) {
        this.scrollToElement(elem)
      }
    },
    scrollToElement: function (el) {
      const target = document.getElementById('item_scroller')
      let offset = el.offsetTop - 64
      if (offset < 0) {
        offset = 0
      }
      const duration = 300
      setVerticalScrollPosition(target, offset, duration)
    },
    handleAddToCart: function () {
      // Add user selected variations to item
      this.item._vars = this.item.vars
      this.item.vars = []
      let tmp
      for (let i = 0; i < this.variationQuery.length; i++) {
        tmp = {
          t: this.variationQuery[i].t,
          vars: []
        }
        for (let j = 0; j < this.variationQuery[i].svals.length; j++) {
          tmp.vars.push({
            sval: this.variationQuery[i].svals[j]
          })
        }
        this.item.vars.push(tmp)
      }
      // Add item to cart (basket does this automatically)
      this.isAddToCart = true
    },
    onBasketClose: function () {
      this.isAddToCart = false
      if (this.item._vars) {
        this.item.vars = this.item._vars
        delete this.item._vars
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

.table_start tr td,
.table_start tr th {
  text-align: left;
  padding: 0.2rem 1rem 0.2rem 1rem;
}

</style>
