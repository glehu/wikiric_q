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
            <template v-if="item.iurls && item.iurls.length > 0">
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
              <div class="rounded flex items-center
                          background justify-center
                          w-100 h-100">
                <p class="text-subtitle2">
                  NO IMG
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
            <div class="flex gap-2">
              <div class="my2 fmt_border p3 rounded-2 wfit">
                <p class="fontbold text-subtitle2">
                  Price
                </p>
                <q-input v-model="item.net"
                         type="number"
                         color="brand-p"
                         suffix="€"
                         label="Net"
                         class="wfull max-w-20"
                         @update:model-value="calculatePrice"/>
                <q-input v-model="item.vatp"
                         type="number"
                         color="brand-p"
                         suffix="%"
                         label="VAT %"
                         class="wfull max-w-20"
                         @update:model-value="calculatePrice"/>
              </div>
              <div class="my2 fmt_border p3 rounded-2 wfit">
                <p class="fontbold text-subtitle2">
                  Availability
                </p>
                <q-input v-model="item.stock"
                         type="number"
                         color="brand-p"
                         label="Stock"
                         class="wfull max-w-30"/>
              </div>
            </div>
            <q-input v-model="item.t"
                     label="Title"
                     class="text-weight-bolder text-xl sm:text-2xl"/>
            <div class="flex items-center gap-8">
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
                  <q-icon name="visibility" size="1.2rem" class="mr1"/>
                  {{ itemObj.views }} Views
                </p>
              </template>
            </div>
            <div class="my4">
              <q-input v-model="item.keys" label="Keywords"/>
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
              <q-input v-model="item.desc" class="mt2" autogrow
                       label="Description Text"/>
            </q-expansion-item>
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
              <div>
                <q-input v-model="item.brand" label="Brand Name"/>
              </div>
            </q-expansion-item>
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
                              background rounded-2 wfull px2 pt2 pb6">
                  <tr>
                    <th>Name/Type (e.g. Size)</th>
                    <th>Value (e.g. XL)</th>
                    <th>Description (e.g. Slightly larger)</th>
                    <th></th>
                  </tr>
                  <template v-for="(attr, i) in item.attr" :key="attr">
                    <tr>
                      <td class="fontbold">
                        <q-input v-model="attr.t"/>
                      </td>
                      <td>
                        <q-input v-model="attr.sval"/>
                      </td>
                      <td>
                        <q-input v-model="attr.desc"/>
                      </td>
                      <td>
                        <div class="wfull hfull flex pt4
                                  items-center justify-end">
                          <q-btn icon="delete"
                                 class="px2 wfit" dense flat
                                 @click="item.attr.splice(i,1)"/>
                        </div>
                      </td>
                    </tr>
                  </template>
                  <tr>
                    <td>
                      <div class="wfull hfull flex pt4
                                  items-center justify-start">
                        <q-btn label="Add Row" icon="add"
                               class="surface px2" dense
                               @click="item.attr.push({t:'',sval:'',desc:''})"/>
                      </div>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                  </tr>
                </table>
              </q-expansion-item>
            </template>
            <template v-else>
              <div class="my8 wfull fmt_border rounded-2 p4">
                <p class="fontbold text-subtitle2 wfit">
                  <q-icon name="warning" size="1.2rem" class="mr1"/>
                  No attributes found!
                </p>
                <q-btn label="Add Attributes" icon="add"
                       color="primary"
                       class="px2 mt4" dense
                       @click="item.attr.push({t:'',sval:'',desc:''})"/>
              </div>
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
                  <div v-for="(vari, i) in item.vars" :key="vari"
                       class="fmt_border rounded-2 px4 pt3 pb4">
                    <div class="flex gap-2 items-center justify-between">
                      <q-input v-model="vari.t" label="Name" class="flex-grow"/>
                      <q-btn icon="delete"
                             class="px2 wfit" dense flat
                             @click="item.vars.splice(i,1)"/>
                      <q-checkbox v-model="vari.opt" label="Optional"/>
                    </div>
                    <p class="text-body1 fontbold mt8">
                      Variations
                    </p>
                    <div class="flex gap-2 mt2">
                      <template v-for="(sub, j) in vari.vars" :key="sub">
                        <div class="flex gap-2 items-center">
                          <q-input v-model="sub.sval" label="Variation"/>
                          <q-btn icon="delete"
                                 class="px2 wfit" dense flat
                                 @click="vari.vars.splice(j,1)"/>
                        </div>
                      </template>
                      <q-btn label="Add Variation" icon="add"
                             class="surface px2 mt4" dense flat
                             @click="vari.vars.push({sval:''})"/>
                    </div>
                  </div>
                  <div class="pb2 px2 wfull flex justify-start">
                    <q-btn label="Add Variation Group" icon="add"
                           class="background px2 mt4" dense
                           @click="item.vars.push({t:'',opt:false,desc:'',vars:[{sval:''}]})"/>
                  </div>
                </div>
              </q-expansion-item>
            </template>
            <template v-else>
              <div class="my8 wfull fmt_border rounded-2 p4">
                <p class="fontbold text-subtitle2 wfit">
                  <q-icon name="warning" size="1.2rem" class="mr1"/>
                  No variations found!
                </p>
                <q-btn label="Add Variations" icon="add"
                       color="primary"
                       class="px2 mt4" dense
                       @click="item.vars.push({t:'',opt:false,desc:'',vars:[{sval:''}]})"/>
              </div>
            </template>
            <template v-if="item._cats && item._cats.length > 0">
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
                                background rounded-2 wfull px2 pt2 pb6">
                    <tr>
                      <th>Category (e.g. Clothing)</th>
                      <th></th>
                    </tr>
                    <template v-for="(cat, i) in item._cats" :key="cat">
                      <tr>
                        <td class="fontbold wfull">
                          <q-input v-model="cat.t"/>
                        </td>
                        <td>
                          <div class="wfull hfull flex pt4
                                      items-center justify-end">
                            <q-btn icon="delete"
                                   class="px2 wfit" dense flat
                                   @click="item._cats.splice(i,1)"/>
                          </div>
                        </td>
                      </tr>
                    </template>
                    <tr>
                      <td>
                        <div class="wfull hfull flex pt4
                                  items-center justify-start">
                          <q-btn label="Add Row" icon="add"
                                 class="surface px2" dense
                                 @click="item._cats.push({t:''})"/>
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  </table>
                </div>
              </q-expansion-item>
            </template>
            <template v-else>
              <div class="my8 wfull fmt_border rounded-2 p4">
                <p class="fontbold text-subtitle2 wfit">
                  <q-icon name="warning" size="1.2rem" class="mr1"/>
                  No categories found!
                </p>
                <q-btn label="Add Categories" icon="add"
                       color="primary"
                       class="px2 mt4" dense
                       @click="item._cats.push({t:''})"/>
              </div>
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
          <div class="mt2 pl4 pr1 py1 surface-variant rounded-2
                      flex gap-4 items-center">
            <p class="fontbold non-selectable">
              <template v-if="!isCreate">
                EDITING
              </template>
              <template v-else>
                CREATING
              </template>
            </p>
            <template v-if="!isCreate">
              <template v-if="deleteCounter === 0">
                <q-btn icon="delete" label="Delete"
                       class=""
                       no-caps dense
                       @click="setDeleteCounter"/>
              </template>
              <template v-else-if="deleteCounter === 1">
                <q-btn icon="delete" label="Confirm Delete"
                       class="fontbold"
                       color="negative"
                       @click="handleDeleteItem"/>
              </template>
              <q-btn label="Save Changes" color="primary" class="wfit"
                     @click="saveChanges"/>
            </template>
            <template v-else>
              <q-btn label="Save Item" color="primary" class="wfit"
                     @click="saveChanges"/>
            </template>
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>

import axios from 'axios'
import { useStore } from 'stores/wikistate'
import { scroll } from 'quasar'
import { api } from 'boot/axios'

const {
  setVerticalScrollPosition
} = scroll

export default {
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
    isCreate: {
      type: Boolean,
      required: true
    },
    storeID: {
      type: String,
      required: true
    }
  },
  name: 'ProductEditView',
  emits: ['close', 'deleted'],
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
        keys: '',
        vatp: 0.0
      },
      variationQuery: [],
      isAddToCart: false,
      amount: 1,
      isRequestUndergoing: false,
      originalStock: null,
      deleteCounter: 0
    }
  },
  methods: {
    handleDialogOpen: function () {
      if (!this.isCreate) {
        this.getProduct()
      } else {
        if (this.item.vatp === 0.0) {
          this.item.vatp = 0.19
        }
        this.item._cats = []
        this.item.vars = []
        this.item.attr = []
      }
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
          this.calculatePrice()
          // Set first image for carousel
          if (!this.item.iurls || this.item.iurls.length < 1) {
            this.item._iurl = ''
          } else {
            this.item._iurl = this.item.iurls[0].url
          }
          // Add temp-categories as we need objects for v-model
          this.item._cats = []
          if (this.item.cats && this.item.cats.length > 0) {
            for (let i = 0; i < this.item.cats.length; i++) {
              this.item._cats.push({
                t: this.item.cats[i]
              })
            }
          }
          this.originalStock = this.item.stock
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
    saveChanges: function () {
      if (this.isCreate) {
        this.createItem()
        return
      }
      this.cleanItem()
      return new Promise((resolve) => {
        // If the stock has been modified, update it
        if (this.item.stock && this.item.stock !== this.originalStock) {
          api({
            method: 'post',
            url: 'items/private/bulk/stock/' + this.item.pid.trim(),
            data: {
              type: 'SET',
              mods: [
                {
                  uid: this.itemId,
                  amt: parseFloat(this.item.stock.toString())
                }
              ]
            }
          }).then(() => {
            api({
              method: 'post',
              url: 'items/private/edit/' + this.itemId,
              data: this.item
            }).then(() => {
              this.$q.notify({
                color: 'primary',
                position: 'top-right',
                message: 'Item Updated!',
                caption: '',
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
            }).catch((err) => {
              this.$q.notify({
                color: 'negative',
                position: 'top-right',
                message: 'Error!' + err.message,
                caption: 'Maybe you aren\'t the owner of the Store.',
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
              console.debug(err.message)
            })
          }).finally(() => {
            this.$emit('close')
            resolve()
          })
          return
        }
        api({
          method: 'post',
          url: 'items/private/edit/' + this.itemId,
          data: this.item
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Item Updated!',
            caption: '',
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
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!' + err.message,
            caption: 'Maybe you aren\'t the owner of the Store.',
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
          console.debug(err.message)
        }).finally(() => {
          this.$emit('close')
          resolve()
        })
      })
    },
    createItem: function () {
      this.cleanItem()
      let itemUID = null
      return new Promise((resolve) => {
        if (this.item.stock && this.item.stock > 0) {
          api({
            method: 'post',
            url: 'items/private/create/' + this.storeID.trim(),
            data: this.item
          }).then((response) => {
            itemUID = response.data.trim()
            this.$q.notify({
              color: 'primary',
              position: 'top-right',
              message: 'Item Created!',
              caption: '',
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
          }).catch((err) => {
            this.$q.notify({
              color: 'negative',
              position: 'top-right',
              message: 'Error!' + err.message,
              caption: 'Maybe you aren\'t the owner of the Store.',
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
            console.debug(err.message)
          }).then(() => {
            api({
              method: 'post',
              url: 'items/private/bulk/stock/' + this.storeID.trim(),
              data: {
                type: 'SET',
                mods: [
                  {
                    uid: itemUID,
                    amt: parseFloat(this.item.stock.toString())
                  }
                ]
              }
            })
          }).finally(() => {
            this.$emit('close')
            resolve()
          })
          return
        }
        api({
          method: 'post',
          url: 'items/private/create/' + this.storeID.trim(),
          data: this.item
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Item Created!',
            caption: '',
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
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error! ' + err.message,
            caption: 'Maybe you aren\'t the owner of the Store.',
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
          console.debug(err.message)
        }).finally(() => {
          this.$emit('close')
          resolve()
        })
      })
    },
    cleanItem: function () {
      this.item.net = Number.parseFloat(
        Number.parseFloat(this.item.net).toFixed(2))
      // Removes empty categories, attributes, variations etc.
      this.item.cats = []
      for (let i = 0; i < this.item._cats.length; i++) {
        this.item.cats.push(this.item._cats[i].t)
      }
    },
    calculatePrice: function () {
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
    },
    setDeleteCounter: function () {
      this.deleteCounter = 1
      setTimeout(() => {
        this.deleteCounter = 0
      }, 5000)
    },
    handleDeleteItem: function () {
      return new Promise((resolve) => {
        // If the stock has been modified, update it
        api({
          method: 'get',
          url: 'items/private/delete/' + this.itemId.trim()
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Item Deleted!',
            caption: '',
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
          this.deleteCounter = 0
          this.$emit('deleted')
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error! ' + err.message,
            caption: 'Maybe you aren\'t the owner of the Store.',
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
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
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
