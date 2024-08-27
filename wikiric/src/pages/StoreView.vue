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
        :breakpoint="1080"
        show-if-above
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
          <div class="mt4 wfull overflow-x-hidden">
            <div class="px2 pb8">
              <div class="flex items-center gap-2 mb1">
                <q-icon name="sym_o_sell" size="1.2rem"/>
                <p class="text-subtitle2 fontbold non-selectable">
                  Price Range
                </p>
              </div>
              <q-range
                v-model="priceRange"
                :min="priceMin"
                :max="priceMax"
                :step="0.1"
                track-size="8px" thumb-size="24px"
                label-always switch-label-side
                label-color="primary"
                :left-label-value="minPriceLabel"
                :right-label-value="maxPriceLabel"
                color="primary"
                class="px4 fontbold"
                @update:model-value="processQuery"
              />
            </div>
            <div v-if="brands && brands.length > 0"
                 class="pt1 px2 pb2 mt2">
              <div class="flex items-center gap-2">
                <q-icon name="sym_o_apartment" size="1.2rem"/>
                <p class="text-subtitle2 fontbold non-selectable">
                  Brands
                </p>
              </div>
              <div class="px2">
                <q-select v-model="brandQuery" :options="brands"
                          label="Filter by brand"
                          @update:model-value="processQuery"/>
              </div>
            </div>
            <div class="px2 pb8">
              <div class="flex items-center gap-2 mb1">
                <q-icon name="sym_o_shelves" size="1.2rem"/>
                <p class="text-subtitle2 fontbold non-selectable">
                  Minimum Stock
                </p>
              </div>
              <q-slider
                v-model="minStock"
                :min="0"
                :max="20"
                :step="1"
                track-size="8px" thumb-size="24px"
                label-always switch-label-side
                label-color="primary"
                color="primary"
                class="px4 fontbold"
                @update:model-value="processQuery"
              />
            </div>
            <div class="pt1 px2 pb2 mt2">
              <div class="flex items-center gap-2 mb3">
                <q-icon name="sym_o_style" size="1.2rem"/>
                <p class="text-subtitle2 fontbold non-selectable">
                  Variations
                </p>
              </div>
              <div class="flex column gap-2">
                <template v-if="variations && variations.length > 0">
                  <template v-for="variation in variations" :key="variation">
                    <div class="rounded-2 px2 py1 background">
                      <p class="text-sm text-weight-bolder">
                        {{ variation.t }}
                      </p>
                      <div class="flex gap-2 mt1 pb1">
                        <template v-if="variation.vars && variation.vars.length > 0">
                          <template v-for="vari in variation.vars" :key="vari">
                            <q-btn class="px2 py1 rounded fmt_border"
                                   :class="{'primary': checkVariationActive(variation.t, vari.sval)}"
                                   flat dense no-caps
                                   v-on:click="toggleVariationQuery(variation.t, vari.sval)">
                              <p class="text-sm fontbold">
                                {{ vari.sval }}
                              </p>
                            </q-btn>
                          </template>
                        </template>
                      </div>
                    </div>
                  </template>
                </template>
              </div>
            </div>
            <div class="pt1 px2 pb2 mt2">
              <div class="flex items-center gap-2 mb1">
                <q-icon name="sym_o_filter_alt" size="1.2rem"/>
                <p class="text-subtitle2 fontbold non-selectable">
                  Filter applies to
                </p>
              </div>
              <div class="flex gap-4">
                <div class="flex column text-subtitle2">
                  <q-checkbox v-model="fieldTitle"
                              label="Title"
                              @update:model-value="processQuery">
                    <q-tooltip class="text-subtitle2">
                      Filter titles
                    </q-tooltip>
                  </q-checkbox>
                  <q-checkbox v-model="fieldDesc"
                              label="Description"
                              @update:model-value="processQuery">
                    <q-tooltip class="text-subtitle2">
                      Filter descriptions
                    </q-tooltip>
                  </q-checkbox>
                  <q-checkbox v-model="fieldKeys"
                              label="Keywords"
                              @update:model-value="processQuery">
                    <q-tooltip class="text-subtitle2">
                      Filter keywords
                    </q-tooltip>
                  </q-checkbox>
                  <q-checkbox v-model="fieldClrs"
                              label="Colors"
                              @update:model-value="processQuery">
                    <q-tooltip class="text-subtitle2">
                      Filter colors
                    </q-tooltip>
                  </q-checkbox>
                </div>
                <div class="flex column text-subtitle2">
                  <q-checkbox v-model="fieldCats"
                              label="Categories"
                              @update:model-value="processQuery">
                    <q-tooltip class="text-subtitle2">
                      Filter categories
                    </q-tooltip>
                  </q-checkbox>
                  <q-checkbox v-model="fieldAttr"
                              label="Attributes"
                              @update:model-value="processQuery">
                    <q-tooltip class="text-subtitle2">
                      Filter attributes
                    </q-tooltip>
                  </q-checkbox>
                  <q-checkbox v-model="fieldBrand"
                              label="Brand"
                              @update:model-value="processQuery">
                    <q-tooltip class="text-subtitle2">
                      Filter brands
                    </q-tooltip>
                  </q-checkbox>
                  <q-checkbox v-model="mustIncludeWhole"
                              label="Match Whole"
                              @update:model-value="processQuery">
                    <q-tooltip class="text-subtitle2">
                      Must include whole input sequence
                    </q-tooltip>
                  </q-checkbox>
                </div>
              </div>
            </div>
          </div>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page style="padding-top: 60px"
                class="background min-h-screen flex column">
          <q-page-sticky position="top" expand
                         class="background z-fab">
            <q-toolbar>
              <q-btn flat round dense icon="sym_o_dock_to_right"
                     @click="sidebarLeft = !sidebarLeft">
                <q-tooltip class="text-body2">
                  Toggle&nbsp;Sidebar
                </q-tooltip>
              </q-btn>
              <q-toolbar-title class="text-subtitle1 non-selectable">
                <q-breadcrumbs active-color="brand-p">
                  <template v-if="sidebarLeft">
                    <q-breadcrumbs-el label="Hide Filters"/>
                  </template>
                  <template v-else>
                    <q-breadcrumbs-el label="Show Filters"/>
                  </template>
                </q-breadcrumbs>
              </q-toolbar-title>
              <q-btn flat
                     icon="sym_o_arrow_left_alt"
                     label="Back"
                     class="md:hidden fmt_border ml4 rounded-2
                        surface-variant"
                     @click="clickedBack">
              </q-btn>
            </q-toolbar>
          </q-page-sticky>
          <div class="pb4 flex items-center column wfull">
            <template v-if="viewingStore">
              <div class="wfull dshadow rounded p4 flex justify-center">
                <div class="max-w-screen-lg wfull flex gap-8 <lg:gap-6
                            justify-center">
                  <div class="relative wfull
                              max-w-64 max-h-32">
                    <template v-if="viewingStore.iurl">
                      <q-img :src="getImg(viewingStore.iurl, true)"
                             alt="Store" fit="contain" position="50% 0"
                             class="hfull wfull relative rounded"/>
                    </template>
                  </div>
                  <div class="flex-grow flex column justify-center pr8">
                    <p class="text-5xl <lg:text-3xl <sm:text-[6vw]
                              fontbold wfit">
                      {{ viewingStore.t }}
                    </p>
                    <p class="text-subtitle2 mt2 wfit">
                      {{ viewingStore.desc }}
                    </p>
                    <div v-if="totalOffers > 0"
                         class="mt2 rounded-2 fmt_border gap-x-2
                                px3 py1 wfit flex items-center">
                      <div class="w-2 h-2 rounded-full bg-green"/>
                      <p class="text-subtitle2 fontbold">
                        {{ totalOffers.toLocaleString() }} active offers
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div id="query_container"
                   class="mt20 wfull max-w-screen-lg md:px4
                          sticky top-11 z-fab">
                <div class="fmt_border surface dshadow
                            hfit md:rounded-2">
                  <div class="px3 pb2">
                    <q-form autocomplete="off" spellcheck="false" @submit.prevent>
                      <q-input
                        autofocus
                        for="storeQuery"
                        label="Search for products and services..."
                        color="brand-p"
                        label-color="brand-p"
                        v-model="query"
                        @keyup.enter="processQuery"
                        @focus="showSuggestions"
                        input-class="suggestion_source"
                        class="text-lg md:rounded-t-2 fmt_border_bottom transition-all">
                        <template v-slot:prepend>
                          <template v-if="!isRequestUndergoing">
                            <div class="w10 flex justify-center">
                              <q-icon name="search" size="2rem"/>
                            </div>
                          </template>
                          <template v-else>
                            <q-spinner-rings size="2.5rem" color="primary"/>
                          </template>
                        </template>
                      </q-input>
                    </q-form>
                    <div id="query_suggestions"
                         class="query_suggestions wfull pt2">
                      <div v-if="query.trim() !== ''"
                           class="max-h-60 overflow-y-scroll column no-wrap wfull">
                        <template v-for="cat in categories" :key="cat">
                          <template v-if="cat.toLowerCase().startsWith(query.toLowerCase()) && cat !== ''">
                            <q-btn @click="query = cat; focusQueryField()" :label="cat"
                                   class="wfull"
                                   flat align="left"/>
                          </template>
                        </template>
                      </div>
                    </div>
                  </div>
                  <template v-if="basket?.items?.length > 0">
                    <div class="px3 pb2 wfull flex justify-end
                                items-center gap-4">
                      <q-btn dense no-caps
                             @click="isViewingBasked = true"
                             color="primary">
                        <q-icon name="sym_o_shopping_cart"
                                size="1.5rem"/>
                        <p>
                          View Cart ({{ cartItemsText }})
                        </p>
                      </q-btn>
                    </div>
                  </template>
                </div>
              </div>
              <div class="mt4 wfull max-w-screen-lg md:px4 flex">
                <div v-if="results && results.length > 0"
                     id="results_container"
                     class="fmt_border background wfull
                            hfit md:rounded-2 gap-y-1
                            flex column mb100 p1">
                  <div class="flex my2 gap-y-2
                              column px4">
                    <div class="flex gap-x-4 gap-y-2 wfull items-center">
                      <div class="non-selectable">
                        <p class="text-subtitle2">
                          {{ results.length }} Results in
                          {{ respTime }} seconds
                        </p>
                      </div>
                      <div class="flex gap-2 items-center mlauto">
                        <p class="text-subtitle2 non-selectable">
                          Sort by:
                        </p>
                        <q-icon name="sym_o_arrow_upward" size="1.2rem"
                                class="text-weight-bold"
                                v-on:click="sortByRelevance(false)"
                                v-if="sortingRelevance && !sortAsc"/>
                        <q-icon name="sym_o_arrow_downward" size="1.2rem"
                                class="text-weight-bold"
                                v-on:click="sortByRelevance(false)"
                                v-if="sortingRelevance && sortAsc"/>
                        <q-btn icon="sym_o_target" label="Relevance"
                               no-caps flat align="left" dense
                               class="text-subtitle2 rounded-2 px2"
                               :class="{'surface fmt_border': sortingRelevance}"
                               @click="sortByRelevance(false)"/>
                        <q-icon name="sym_o_arrow_upward" size="1.2rem"
                                class="text-weight-bold"
                                v-on:click="sortByPrice(false)"
                                v-if="sortingPrice && !sortAsc"/>
                        <q-icon name="sym_o_arrow_downward" size="1.2rem"
                                class="text-weight-bold"
                                v-on:click="sortByPrice(false)"
                                v-if="sortingPrice && sortAsc"/>
                        <q-btn icon="payments" label="Price"
                               class="text-subtitle2 rounded-2 px2"
                               :class="{'surface fmt_border': sortingPrice}"
                               no-caps flat align="left" dense
                               @click="sortByPrice(false)"/>
                      </div>
                    </div>
                    <div class="flex gap-4">
                      <template v-if="categoryFilters && categoryFilters.length > 0">
                        <div class="flex gap-2 items-center mt4">
                          <p class="text-subtitle2 non-selectable">
                            Categories:
                          </p>
                          <div v-for="cat in categoryFilters" :key="cat"
                               class="surface rounded px2 py1">
                            <p class="text-subtitle2">
                              {{ cat }}
                            </p>
                          </div>
                        </div>
                      </template>
                      <template v-if="brandQuery !== ''">
                        <div class="flex gap-2 items-center mt4">
                          <p class="text-subtitle2 non-selectable">
                            Brand:
                          </p>
                          <div class="surface rounded px2 py1 flex items-center">
                            <p class="text-subtitle2">
                              {{ brandQuery }}
                            </p>
                            <q-btn icon="close" flat dense
                                   class="ml1"
                                   @click="brandQuery = ''; processQuery()"/>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                  <q-item v-for="res in results" :key="res"
                          dense clickable class="wfull"
                          @click="handleItemClicked(res)">
                    <div class="wfull md:flex gap-4 surface
                                md:rounded-2 fmt_border p2
                                overflow-hidden hfull">
                      <div class="w-50 min-w-50 min-h-50
                                  mt4 md:ml4 md:mb4
                                  <md:w-80 <md:min-w-80 <md:min-h-80
                                  <md:wfull
                                  flex justify-center">
                        <template v-if="res.iurls?.length > 0">
                          <q-carousel
                            v-model="res._iurl"
                            transition-prev="jump-right"
                            transition-next="jump-left"
                            swipeable
                            animated
                            control-color="brand-p"
                            prev-icon="arrow_left"
                            next-icon="arrow_right"
                            :thumbnails="res.iurls.length > 1"
                            height="264px"
                            class="rounded scaled_carousel transparent
                                   w-50 min-w-50 min-h-50
                                   <md:w-80 <md:min-w-80 <md:min-h-80">
                            <template v-for="img in res.iurls" :key="img">
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
                                      w-50 min-w-50 h-50 min-h-50
                                      <md:w-80 <md:h-80
                                      <md:min-w-80 <md:min-h-80">
                            <p class="text-subtitle2">
                              NO IMAGE
                            </p>
                          </div>
                        </template>
                      </div>
                      <div class="p2 flex-grow <md:mt4 md:mt1
                                  flex column gap-2">
                        <p class="text-weight-bolder text-xl lg:text-2xl">
                          {{ res.t }}
                        </p>
                        <p class="text-subtitle2 whitespace-break-spaces
                                line-height-snug">
                          {{ res.desc }}
                        </p>
                        <template v-if="res.attr && res.attr.length > 0">
                          <table class="border-spacing-none
                                        text-subtitle2
                                        rounded mt2 py1 wfit">
                            <template v-for="attr in res.attr" :key="attr">
                              <tr>
                                <td class="fontbold pr3">
                                  {{ capitalizeFirstLetter(attr.t) }}:
                                </td>
                                <td class="pr3">
                                  {{ attr.sval }}
                                </td>
                                <td class="">
                                  {{ attr.desc }}
                                </td>
                              </tr>
                            </template>
                          </table>
                        </template>
                        <div class="mtauto">
                          <div class="flex gap-6 mt4 wfull column items-end">
                            <div class="flex column
                                        items-end">
                              <p class="text-3xl <sm:text-2xl text-weight-bold">
                                {{ res._gross }}
                              </p>
                              <p class="text-xs text-weight-bold">
                                Includes {{ res._vat }} ({{ res._vatp }} %) VAT
                              </p>
                              <div class="flex items-start gap-4 mt4">
                                <div v-if="showingStock"
                                     class="flex items-center gap-2 wfit h9
                                            px3 py0.5 background rounded">
                                  <template v-if="res.stock > 0.0">
                                    <div class="w2 h2 rounded-full bg-green"></div>
                                    <p class="text-subtitle2">
                                      <span class="fontbold">{{ res.stock }}</span>
                                      available
                                    </p>
                                  </template>
                                  <template v-else>
                                    <div class="w2 h2 rounded-full bg-gray"></div>
                                    <p class="text-subtitle2">
                                      out of stock
                                    </p>
                                  </template>
                                </div>
                                <q-btn label="View Product"
                                       icon="sym_o_search"
                                       class="fontbold fmt_border surface"/>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-item>
                  <div class="mt50 wfull flex items-center p2
                              column fmt_border_top">
                    <p class="text-subtitle2 text-weight-bolder">
                      Not what you were looking for?
                    </p>
                    <p class="text-subtitle2">
                      Maybe include more words describing what you mean.
                    </p>
                  </div>
                </div>
                <div v-if="noResults"
                     class="flex column wfull">
                  <div class="mt10 wfull flex items-center p4
                              column fmt_border_top">
                    <p class="text-subtitle2 text-weight-bolder">
                      No results for your search!
                    </p>
                    <p class="text-subtitle2">
                      Maybe include more words describing what you mean.
                    </p>
                  </div>
                </div>
              </div>
            </template>
          </div>
          <div class="wfull flex justify-center mtauto">
            <div class="max-w-screen-lg wfull hfull
                        fmt_border
                        surface-variant rounded-t-2 p4">
              <p class="text-subtitle2 non-selectable">
                <span class="text-weight-bolder">wikiric</span>
                Stores v0-PreAlpha
              </p>
            </div>
          </div>
          <q-page-sticky position="bottom-right" :offset="[18, 18]">
            <q-fab
              v-model="fab"
              label=""
              vertical-actions-align="right"
              color="primary"
              icon="menu"
              direction="up">
              <q-fab-action color="primary" icon="sym_o_shopping_cart"
                            label="View Cart" label-position="left"
                            @close="isViewingBasked = false"
                            @click="isViewingBasked = true"/>
              <template v-if="canEdit">
                <q-fab-action color="primary" icon="sym_o_library_add"
                              label="Add Item" label-position="left"
                              @close="isViewingProduct = false"
                              @click="startCreatingItem"/>
              </template>
            </q-fab>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <product-view :item-id="viewingProductId"
                :item-obj="viewingProduct"
                :is-open="isViewingProduct"
                :can-edit="canEdit"
                :show-stock="showingStock"
                @close="isViewingProduct = false; getBasket()"
                @deleted="handleItemDeleted"/>
  <product-edit-view item-id="x"
                     :is-open="isViewingProductCreate"
                     :is-create="true"
                     :storeID="storeID"
                     @close="isViewingProductCreate = false"/>
  <basket-view :is-adding="false"
               :is-open="isViewingBasked"
               @close="isViewingBasked = false; getBasket()"/>
</template>

<script>
import { useStore } from 'stores/wikistate'
import axios from 'axios'
import { scroll } from 'quasar'
import ProductView from 'components/ecommerce/ProductView.vue'
import { dbGetData } from 'src/libs/wikistore'
import BasketView from 'components/ecommerce/BasketView.vue'
import ProductEditView from 'components/ecommerce/ProductEditView.vue'

const {
  getScrollTarget,
  setVerticalScrollPosition
} = scroll

export default {
  name: 'StoreView',
  components: {
    ProductEditView,
    BasketView,
    ProductView
  },
  data () {
    return {
      store: useStore(),
      fab: false,
      sidebarLeft: false,
      viewingStore: null,
      isViewingBasked: false,
      isViewingProduct: false,
      isViewingProductCreate: false,
      viewingProductId: '',
      viewingProduct: {},
      storeID: '',
      query: '',
      priceRange: {
        min: 0.0,
        max: 1000.0
      },
      minStock: 0,
      priceMin: 0.0,
      priceMax: 1000.0,
      priceAvg: 0.0,
      fieldTitle: true,
      fieldDesc: true,
      fieldKeys: true,
      fieldCats: true,
      fieldAttr: true,
      fieldClrs: true,
      fieldBrand: true,
      mustIncludeWhole: false,
      variations: [],
      variationQuery: [],
      categories: [],
      brands: [],
      results: null,
      respTime: 0.0,
      sortAsc: false,
      sortingRelevance: true,
      sortingPrice: false,
      isRequestUndergoing: false,
      basket: null,
      canEdit: false,
      noResults: false,
      categoryFilters: [],
      totalOffers: 0,
      brandQuery: '',
      showingStock: false
    }
  },
  created () {
    // this.processQuery = debounce(this.processQuery, 400)
    this.storeID = this.$route.query.id
    this.getViewingStore()
    this.getStoreFilters()
    this.getBasket()
  },
  mounted () {
    document.addEventListener('keydown', this.storeHandleKeydown, false)
  },
  beforeUnmount () {
    document.removeEventListener('keydown', this.storeHandleKeydown, false)
  },
  computed: {
    minPriceLabel () {
      return this.priceRange.min.toLocaleString(
        'de-DE', {
          style: 'currency',
          currency: 'EUR'
        })
    },
    maxPriceLabel () {
      if (this.priceRange.max >= this.priceMax) {
        return '> ' + this.priceMax.toLocaleString(
          'de-DE', {
            style: 'currency',
            currency: 'EUR'
          })
      }
      return this.priceRange.max.toLocaleString(
        'de-DE', {
          style: 'currency',
          currency: 'EUR'
        })
    },
    cartItemsText () {
      if (this.basket?.items?.length > 0) {
        if (this.basket.items.length > 1) {
          return `${this.basket.items.length} Items`
        } else {
          return `${this.basket.items.length} Item`
        }
      } else {
        return ''
      }
    }
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    getViewingStore: async function () {
      return new Promise((resolve) => {
        axios.get(
          `${this.store.serverIP}stores/public/get/${this.storeID}`)
        .then((response) => {
          this.viewingStore = response.data
          this.canEdit = this.viewingStore.usr === this.store.user.username
        }).catch((e) => {
          console.debug(e.message)
        }).then(() => {
          resolve()
        })
      })
    },
    getStoreFilters: async function () {
      return new Promise((resolve) => {
        axios.get(
          `${this.store.serverIP}items/public/filters/${this.storeID}`)
        .then((response) => {
          const data = response.data
          this.priceMin = data.min - 1
          if (this.priceMin < 0) {
            this.priceMin = 0
          }
          this.priceMax = data.max + 1
          this.priceAvg = data.avg
          this.variations = data.vars
          this.categories = data.cats.sort()
          this.brands = data.brands
          this.totalOffers = data.amt
          // Sanitize query
          this.priceRange.min = this.priceMin
          this.priceRange.max = this.priceMax
        }).catch((e) => {
          console.debug(e.message)
        }).then(() => {
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
    processQuery: async function () {
      // Avoid multiple requests at the same time
      if (this.isRequestUndergoing) return
      let queryText = this.query.trim()
      if (queryText === '') return
      this.isRequestUndergoing = true
      if (this.mustIncludeWhole) {
        queryText = queryText.replaceAll(
          ' ', '\\s')
      }
      let fieldsT = ''
      if (this.fieldTitle) {
        fieldsT += 'title '
      }
      if (this.fieldDesc) {
        fieldsT += 'desc '
      }
      if (this.fieldKeys) {
        fieldsT += 'keys '
      }
      if (this.fieldCats) {
        fieldsT += 'cats '
      }
      if (this.fieldAttr) {
        fieldsT += 'attr '
      }
      if (this.fieldClrs) {
        fieldsT += 'clrs '
      }
      if (this.fieldBrand) {
        fieldsT += 'brand '
      }
      fieldsT = fieldsT.trim()
      // Check if we can pre-filter items by category
      const categories = this.checkCategories(queryText)
      this.applyCategoryFilters(categories)
      // Send it!
      const payload = {
        query: queryText,
        type: '',
        fields: fieldsT,
        state: '',
        minCost: this.priceRange.min,
        maxCost: this.priceRange.max,
        vars: this.variationQuery,
        cats: categories,
        brand: this.brandQuery,
        minStock: this.minStock
      }
      return new Promise((resolve) => {
        axios.post(
          `${this.store.serverIP}items/public/query/${this.storeID}?results=100`,
          payload)
        .then((response) => {
          const data = response.data
          if (!data.items || data.items.length === 0) {
            this.noResults = true
          } else {
            this.noResults = data.items.length > 0
          }
          this.results = data.items
          this.respTime = data.respTime.toPrecision(2)
          for (let i = 0, len = data.items.length; i < len; i++) {
            // Sanitize
            this.results[i]._vatp = this.results[i].vatp * 100
            this.results[i]._vat =
              this.results[i].net * this.results[i].vatp
            this.results[i]._gross =
              this.results[i].net * (this.results[i].vatp + 1)
            // Make it human-readable
            this.results[i]._vat = this.results[i]._vat.toLocaleString(
              'de-DE', {
                style: 'currency',
                currency: 'EUR'
              })
            this.results[i]._gross = this.results[i]._gross.toLocaleString(
              'de-DE', {
                style: 'currency',
                currency: 'EUR'
              })
            // Set first image for carousel
            if (!this.results[i].iurls || this.results[i].iurls.length < 1) {
              this.results[i]._iurl = ''
              continue
            }
            this.results[i]._iurl = this.results[i].iurls[0].url
          }
          this.sortAsc = false
          this.sortByRelevance(true)
          console.log(data)
        }).catch((e) => {
          console.debug(e.message)
        }).finally(() => {
          // ***
          setTimeout(() => {
            let elem = document.getElementById(
              'results_container')
            if (elem) {
              this.scrollToElement(elem)
            }
            elem = document.getElementById('storeQuery')
            if (elem) {
              elem.blur()
            }
          }, 0)
          // ***
          this.isRequestUndergoing = false
          this.showingStock = (this.minStock > 0)
          this.hideSuggestions()
          resolve()
        })
      })
    },
    focusQueryField: function () {
      const elem = document.getElementById('storeQuery')
      if (elem) {
        elem.focus()
      }
    },
    applyCategoryFilters: function (categories) {
      if (!categories) {
        this.categoryFilters = []
      }
      this.categoryFilters = categories
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
            this.processQuery()
            return
          }
          for (let j = 0; j < this.variationQuery[i].svals.length; j++) {
            if (this.variationQuery[i].svals[j] === sval) {
              // We found the sub-variation, so we remove it
              this.variationQuery[i].svals.splice(j, 1)
              if (this.variationQuery[i].svals.length < 1) {
                this.variationQuery.splice(i, 1)
              }
              this.processQuery()
              return
            }
          }
          // We did not find the sub-variation yet, so we add it
          this.variationQuery[i].svals.push(sval)
          this.processQuery()
          return
        }
      }
      // Variation did not exist yet, so we add it
      this.variationQuery.push({
        t,
        svals: [sval]
      })
      this.processQuery()
    },
    checkVariationActive: function (t, sval) {
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
    sortByRelevance: function (skipFlip = false) {
      if (!skipFlip) {
        this.sortAsc = !this.sortAsc
      }
      if (this.sortAsc) {
        this.results.sort(
          (a, b) => a.accuracy - b.accuracy)
      } else {
        this.results.sort(
          (a, b) => b.accuracy - a.accuracy)
      }
      this.sortingRelevance = true
      this.sortingPrice = false
    },
    sortByPrice: function (skipFlip = false) {
      if (!skipFlip) {
        this.sortAsc = !this.sortAsc
      }
      if (this.sortAsc) {
        this.results.sort(
          (a, b) => a.net - b.net)
      } else {
        this.results.sort(
          (a, b) => b.net - a.net)
      }
      this.sortingRelevance = false
      this.sortingPrice = true
    },
    scrollToElement: function (el) {
      const target = getScrollTarget(el)
      let offset = el.offsetTop - 170
      if (offset < 0) {
        offset = 0
      }
      const duration = 300
      setVerticalScrollPosition(target, offset, duration)
    },
    handleItemClicked: function (item) {
      this.viewingProductId = item.uid
      this.viewingProduct = item
      this.isViewingProduct = true
    },
    getBasket: function () {
      dbGetData('basket').then((res) => {
        this.basket = res
      }).catch((err) => {
        console.debug(err.message)
      })
    },
    checkCategories: function (query) {
      if (query === '' || this.categories.length < 1) return []
      const arr = []
      const q1 = query.toLowerCase().split(' ')
      const q2 = query.toLowerCase()
      let comp
      for (let i = 0; i < this.categories.length; i++) {
        comp = this.categories[i].toLowerCase()
        if (q1.includes(comp) || q2 === comp) {
          arr.push(this.categories[i])
        }
      }
      return arr
    },
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    },
    startCreatingItem: function () {
      this.isViewingProductCreate = true
    },
    showSuggestions: function () {
      const elem = document.getElementById('query_suggestions')
      if (!elem) return
      elem.style.display = 'flex'
    },
    hideSuggestions: function () {
      setTimeout(() => {
        const elem = document.getElementById('query_suggestions')
        if (!elem) return
        elem.style.display = 'none'
      }, 200)
    },
    storeHandleKeydown: function (e) {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        this.hideSuggestions()
      }
    },
    handleItemDeleted: function () {
      this.isViewingProduct = false
      this.processQuery()
      this.getBasket()
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
