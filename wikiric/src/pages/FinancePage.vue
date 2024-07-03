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
        show-if-above
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
                  <q-breadcrumbs-el label="Finance"/>
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
          <div class="flex gap-2">
            <div class="flex column items-center justify-center p4
                        flex-grow">
              <div class="grid wfull gap-4
                          grid-cols-1
                          sm:grid-cols-2
                          limit-screen">
                <q-item clickable
                        ref="openQuickie"
                        @click="quickPayment"
                        class="surface rounded p4">
                  <q-item-label class="wfull">
                    <div class="flex items-center gap-2
                                p2 mb2 background rounded">
                      <q-icon name="sym_o_contract" size="1.4rem"/>
                      <div>
                        <p class="fontbold text-body1">
                          Add Payment
                        </p>
                      </div>
                    </div>
                    <p class="text-subtitle2">
                      Quickly add a payment to the last collection used.
                    </p>
                  </q-item-label>
                </q-item>
                <q-item clickable
                        ref="openQuickie"
                        @click="quickIncome"
                        class="surface rounded p4">
                  <q-item-label class="wfull">
                    <div class="flex items-center gap-2
                                p2 mb2 background rounded">
                      <q-icon name="sym_o_account_balance" size="1.4rem"/>
                      <div>
                        <p class="fontbold text-body1">
                          Add Income
                        </p>
                      </div>
                    </div>
                    <p class="text-subtitle2">
                      Quickly add income to the last collection used.
                    </p>
                  </q-item-label>
                </q-item>
                <q-item clickable
                        @click="newCollection"
                        class="surface rounded p4">
                  <q-item-label class="wfull">
                    <div class="flex items-center gap-2
                                p2 mb2 background rounded">
                      <q-icon name="add" size="1.4rem"/>
                      <div>
                        <p class="fontbold text-body1">
                          New Collection
                        </p>
                      </div>
                    </div>
                    <p class="text-subtitle2">
                      Funnel payments and allow for summaries
                      and splitting between others.
                    </p>
                  </q-item-label>
                </q-item>
                <q-item clickable
                        @click="joinCollection"
                        class="surface rounded p4">
                  <q-item-label class="wfull">
                    <div class="flex items-center gap-2 wfull
                                p2 mb2 background rounded">
                      <q-icon name="sym_o_join" size="1.4rem"/>
                      <div>
                        <p class="fontbold text-body1">
                          Join Collection
                        </p>
                      </div>
                    </div>
                    <p class="text-subtitle2">
                      Join a collection to split the costs.
                    </p>
                  </q-item-label>
                </q-item>
              </div>
              <template v-if="collections && collections.length > 0">
                <p class="text-h5 fontbold mt8 mb4 mrauto">
                  Collections
                </p>
                <template v-for="coll in collections" :key="coll">
                  <div v-if="coll"
                       class="wfull surface px3 py1 rounded mb3">
                    <div class="flex items-center gap-2">
                      <p class="fontbold text-body1">
                        <template v-if="coll.t">
                        {{ coll.t }}
                        </template>
                        <template v-else>
                          (No Title)
                        </template>
                      </p>
                      <p class="text-subtitle2">
                        <template v-if="coll.t">
                        {{ coll.desc }}
                        </template>
                      </p>
                      <template v-if="coll._summary">
                        <div class="mlauto flex items-center gap-4">
                          <template v-if="coll._summary._ownIncome">
                            <p class="text-green fontbold text-h5">
                              {{ Math.abs(coll._summary._ownIncome) }} €
                            </p>
                          </template>
                          <template v-if="coll._summary._ownPayment">
                            <p class="text-red fontbold text-h5">
                              {{ Math.abs(coll._summary._ownPayment) }} €
                            </p>
                          </template>
                        </div>
                      </template>
                    </div>
                    <div class="flex gap-2 mt2 pb2 wfull">
                      <q-btn label="View"
                             icon="search"
                             no-caps flat class="fmt_border flex-grow"
                             @click="showCollection(coll)"/>
                      <q-btn label="Add Payment"
                             icon="sym_o_contract"
                             no-caps flat class="fmt_border flex-grow"
                             @click="addPaymentToColl(coll)"/>
                      <q-btn label="Add Income"
                             icon="sym_o_account_balance"
                             no-caps flat class="fmt_border flex-grow"
                             @click="addIncomeToColl(coll)"/>
                    </div>
                    <div class="flex gap-2 pb2 wfull justify-end">
                      <q-btn label="Share Collection"
                             icon="link"
                             no-caps flat
                             @click="showCollectionID(coll)"/>
                      <q-btn label="Remove Collection"
                             icon="delete"
                             no-caps flat
                             @click="removeCollection(coll)"/>
                    </div>
                  </div>
                </template>
              </template>
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
              <q-fab-action color="primary" icon="sym_o_contract"
                            label="Add Payment" label-position="left"/>
            </q-fab>
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <finance-transaction-editor :is-open="isViewingTransaction"
                              :collection="lastCollection"
                              :from="trxFrom"
                              :to="trxTo"
                              @trxsubmit="handleTransactionSubmit"
                              @close="isViewingTransaction = false"/>
  <finance-collection-editor :is-open="isViewingCollection"
                             :collection="{}"
                             @collsubmit="handleCollectionSubmit"/>
  <finance-collection-join :is-open="isViewingCollectionJoin"
                           @selected="handleCollectionJoin"/>
  <q-dialog v-model="isViewingCollectionID" class="z-fab">
    <q-card class="surface p4 wfull" flat bordered>
      <div class="flex gap-2 items-center justify-center p2">
        <p class="wfit fontbold text-body1 fmt_border p2 rounded">
          <template v-if="isHidingID">
            &gt; ID Hidden &lt;
          </template>
          <template v-else>
            {{ viewingCollection.uid }}
          </template>
        </p>
      </div>
      <div class="mb8 flex justify-center non-selectable">
        <p>
          Do not share this ID with strangers you do not trust!
        </p>
      </div>
      <div class="mt4 wfull flex justify-end gap-2">
        <template v-if="isHidingID">
          <q-btn label="Show ID" @click="isHidingID = false"
                 flat
                 no-caps icon="sym_o_visibility"/>
        </template>
        <template v-else>
          <q-btn label="Hide ID" @click="isHidingID = true"
                 flat
                 no-caps icon="sym_o_visibility_off"/>
        </template>
        <q-btn label="Copy ID to Clipboard" @click="copyCollectionID"
               color="primary"
               no-caps icon="sym_o_content_copy"/>
      </div>
    </q-card>
  </q-dialog>
  <q-dialog v-model="isViewingCollectionDetails"
            class="z-fab">
    <q-card class="surface p4 wfull" flat bordered>
      <div class="flex gap-2">
        <div class="wfull">
          <p class="text-h5 fontbold">
            {{ viewingCollection.t }}
          </p>
          <p class="mt1 text-subtitle2">
            {{ viewingCollection.desc }}
          </p>
          <div class="my2">
            <hr style="color: var(--md-sys-color-outline-variant); margin: 0 !important;">
          </div>
          <div class="flex gap-x-8 gap-y-2 mt3">
            <div class="">
              <p class="mb3 fontbold text-body1">
                Collaborators - {{ viewingCollection.coll.length }}
              </p>
              <template v-if="viewingCollection.coll && viewingCollection.coll.length > 0">
                <div class="flex gap-4">
                  <template v-for="coll in viewingCollection.coll" :key="coll">
                    <div class="flex gap-2 items-center fmt_border rounded px2 py1">
                      <q-icon name="person"/>
                      <p class="text-subtitle1 fontbold">
                        {{ coll }}
                      </p>
                    </div>
                  </template>
                </div>
              </template>
              <template v-else>
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
            <template v-if="summary && summary._compensation?.length > 0">
              <div class="">
                <p class="mb3 fontbold text-body1">
                  Compensations - {{ summary._compensation.length }}
                </p>
                <div class="flex gap-2">
                  <template v-for="comp in summary._compensation" :key="comp">
                    <template v-if="comp.val > 0">
                      <div class="fmt_border rounded px4 py2">
                        <p>
                          <span class="fontbold mr1">{{ comp.from }}</span>
                          owes
                          <span class="fontbold mx1">{{ comp.to }}</span>
                          <span class="fontbold ml1">{{ comp.val }} €</span>
                        </p>
                      </div>
                    </template>
                  </template>
                </div>
              </div>
            </template>
            <template v-if="summary && summary.summary?.length > 0">
              <div class="">
                <p class="mb3 fontbold text-body1">
                  Total - {{ summary.summary.length }}
                </p>
                <div class="flex gap-2">
                  <template v-for="sum in summary.summary" :key="sum">
                    <div class="fmt_border rounded px2 pt1 pb2 flex gap-4">
                      <p class="text-subtitle1 fontbold">
                        {{ sum.from }}
                      </p>
                      <div class="mt0.5">
                        <p class="text-subtitle2 fontbold text-green
                                  line-height-snug text-end">
                          + {{
                            sum._totalIncome.toLocaleString(
                              'de-DE', {
                                style: 'currency',
                                currency: 'EUR'
                              })
                          }}
                        </p>
                        <p class="text-subtitle2 fontbold text-red
                                  line-height-snug text-end">
                          – {{
                            sum._totalPayment.toLocaleString(
                              'de-DE', {
                                style: 'currency',
                                currency: 'EUR'
                              })
                          }}
                        </p>
                        <div class="my1">
                          <hr style="margin: 0 !important;">
                        </div>
                        <p class="text-subtitle1 fontbold
                                  line-height-snug text-end">
                          {{
                            (sum._totalIncome - sum._totalPayment).toLocaleString(
                              'de-DE', {
                                style: 'currency',
                                currency: 'EUR'
                              })
                          }}
                        </p>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
          <template v-if="summary && summary.transactions?.length > 0">
            <div class="mt3">
              <p class="mb4 fontbold text-body1">
                Transactions - {{ summary.transactions.length }}
              </p>
              <div class="flex column gap-2">
                <template v-for="(trx, i) in summary.transactions" :key="trx">
                  <div class="rounded background px2 py1">
                    <div class="flex gap-4 items-center">
                      <p class="text-subtitle2">
                        # {{ summary.transactions.length - i }}
                      </p>
                      <p class="text-subtitle2 fontbold flex items-center">
                        <template v-if="trx.from !== ''">
                          {{ trx.from }}
                        </template>
                        <template v-else>
                          <q-icon name="sym_o_account_balance"/>
                        </template>
                        <q-icon name="sym_o_arrow_right"/>
                        <template v-if="trx.to !== ''">
                          {{ trx.to }}
                        </template>
                        <template v-else>
                          <q-icon name="sym_o_contract"/>
                        </template>
                      </p>
                      <p class="text-subtitle2">
                        {{ capitalizeFirstLetter(trx.type) }}
                      </p>
                      <p class="fontbold text-body1 mlauto">
                        <template v-if="trx.type === 'income'">
                          +
                        </template>
                        <template v-else-if="trx.type === 'payment'">
                          –
                        </template>
                        {{
                          trx.val.toLocaleString(
                            'de-DE', {
                              style: 'currency',
                              currency: trx.unit
                            })
                        }}
                      </p>
                      <p class="text-subtitle2 ml4">
                        {{ getHumanReadableDateText(trx.ts, true, true) }}
                      </p>
                    </div>
                    <template v-if="trx.comment">
                      <div class="flex gap-2 items-center mt2
                                  fmt_border_top pt2 pb1">
                        <p class="text-subtitle2">
                          <q-icon name="sym_o_info" size="1.2rem" class="mr1"/>
                          {{ trx.comment }}
                        </p>
                      </div>
                    </template>
                    <q-expansion-item dense
                                      class="surface rounded rounded
                                             mt2 mb1"
                                      header-class="background flex
                                                    items-center">
                      <template v-slot:header>
                        <p class="wfull text-subtitle2 rounded">
                          Details
                        </p>
                      </template>
                      <div class="px4 py2 wfull text-subtitle2 surface break-all">
                        <p>
                          <span class="fontbold">Signature:</span>
                          <template v-if="trx.sig && trx.sig !== ''">
                            <span class="ml1">{{ trx.sig }}</span>
                          </template>
                          <template v-else>
                            <span class="ml1">
                              Unsigned thus unverified
                              <q-tooltip>
                                <span class="text-subtitle2">
                                  User has not digitally signed this transaction!
                                  <br>The transaction can still be legit, but not fully verified.
                                </span>
                              </q-tooltip>
                            </span>
                          </template>
                        </p>
                        <p>
                          <span class="fontbold">Hash:</span>
                          <span class="ml1">{{ trx.hash }}</span>
                        </p>
                        <p>
                          <span class="fontbold">Previous:</span>
                          <template v-if="trx.prev && trx.prev !== ''">
                            <span class="ml1">{{ trx.prev }}</span>
                          </template>
                          <template v-else>
                            <span>
                              Genesis Block
                              <q-tooltip>
                                <span class="text-subtitle2">
                                  First Transaction
                                </span>
                              </q-tooltip>
                            </span>
                          </template>
                        </p>
                      </div>
                    </q-expansion-item>
                  </div>
                </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { api } from 'boot/axios'
import FinanceCollectionEditor from 'components/finance/FinanceCollectionEditor.vue'
import { dbDelData, dbGetAllDataKeys, dbGetData, dbSetData } from 'src/libs/wikistore'
import FinanceTransactionEditor from 'components/finance/FinanceTransactionEditor.vue'
import FinanceCollectionJoin from 'components/finance/FinanceCollectionJoin.vue'
import { copyToClipboard } from 'quasar'
import { DateTime } from 'luxon'
import { useStore } from 'stores/wikistate'

export default {
  name: 'FinancePage',
  components: {
    FinanceCollectionJoin,
    FinanceTransactionEditor,
    FinanceCollectionEditor
  },
  created () {
    this.getCollections()
  },
  data () {
    return {
      store: useStore(),
      fab: false,
      sidebarLeft: false,
      collections: [],
      isHidingID: true,
      isViewingTransaction: false,
      isViewingCollectionJoin: false,
      isViewingCollectionID: false,
      isViewingCollectionDetails: false,
      isViewingCollection: false,
      viewingCollection: null,
      summary: null,
      lastCollection: null,
      trxFrom: '',
      trxTo: ''
    }
  },
  methods: {
    clickedBack: function () {
      this.$router.back()
    },
    newCollection: function () {
      this.isViewingCollection = !this.isViewingCollection
    },
    joinCollection: function () {
      this.isViewingCollectionJoin = !this.isViewingCollectionJoin
    },
    handleCollectionSubmit: async function (collection) {
      if (collection == null) return
      await api({
        method: 'POST',
        url: 'finance/private/collection/create',
        data: collection
      }).then((response) => {
        // Remember collection
        collection.uid = response.data
        const key = `finance_coll_${response.data}`
        dbSetData(key, collection)
        this.getCollections()
      }).catch((e) => {
        console.debug(e.message)
      })
    },
    handleCollectionJoin: async function (query) {
      query = query.trim()
      if (query == null) {
        return
      }
      await api({
        url: `finance/private/collection/join/${query}`
      }).then(() => {
        const key = `finance_coll_${query}`
        dbSetData(key, {
          uid: query,
          t: query
        })
        this.getCollections()
      }).catch((e) => {
        if (e) {
          query = ''
        }
      })
    },
    quickPayment: function () {
      this.trxFrom = this.store.user.username
      this.trxTo = ''
      this.isViewingTransaction = true
    },
    quickIncome: function () {
      this.trxFrom = ''
      this.trxTo = this.store.user.username
      this.isViewingTransaction = true
    },
    getCollections: async function () {
      this.lastCollection = null
      const keys = await dbGetAllDataKeys()
      if (!keys || keys.length < 1) {
        this.collections = []
        return
      }
      if (keys.length < this.collections.length) {
        this.collections.splice(keys.length)
      }
      for (let i = 0; i < this.collections.length; i++) {
        this.collections[i] = null
      }
      let coll
      for (let i = 0; i < keys.length; i++) {
        if (!keys[i].startsWith('finance_coll_')) {
          continue
        }
        coll = await dbGetData(keys[i])
        if (!coll) {
          continue
        }
        if (i < this.collections.length) {
          this.collections[i] = coll
        } else {
          this.collections.push(coll)
        }
        if (!this.lastCollection) {
          this.lastCollection = coll
        }
      }
    },
    showCollectionID: function (coll) {
      if (!coll) return
      this.viewingCollection = coll
      this.isHidingID = true
      this.isViewingCollectionID = true
    },
    showCollection: async function (coll) {
      if (!coll) return
      this.viewingCollection = coll
      await api({
        url: `finance/private/collection/view/${coll.uid}`
      }).then((response) => {
        let collection = response.data.collection
        collection.uid = coll.uid
        this.viewingCollection = collection
        this.summary = response.data
        collection = this.processViewingCollection(collection)
        console.log(collection)
        const key = `finance_coll_${coll.uid}`
        dbSetData(key, collection)
      }).catch((e) => {
        if (e) {
          console.error(e)
        }
      })
      this.isViewingCollectionDetails = true
      await this.getCollections()
    },
    copyCollectionID: function () {
      if (!this.viewingCollection.uid) return
      copyToClipboard(this.viewingCollection.uid)
      .then(() => {
        this.$q.notify({
          color: 'primary',
          position: 'top-right',
          message: 'Collection ID copied',
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
      })
      .catch((e) => {
        console.error(e)
      })
    },
    handleTransactionSubmit: async function (trx) {
      if (trx == null) return
      let tmp
      trx = JSON.parse(trx)
      tmp = trx.val
      trx.val = parseFloat(tmp)
      if (trx.coll) {
        for (let i = 0; i < trx.coll.length; i++) {
          tmp = JSON.parse(trx.coll[i])
          trx.coll[i] = {
            from: tmp.from,
            ratio: tmp.ratio,
            val: parseFloat(tmp.val)
          }
        }
      }
      await api({
        method: 'POST',
        url: `finance/private/trx/create/${trx.pid}`,
        data: trx
      }).then(() => {
        this.isViewingTransaction = false
      }).catch((e) => {
        console.error(e)
      })
    },
    processViewingCollection: function (collection) {
      if (!this.summary) return
      /**
       * @type {Map<String, Object>}
       */
      const compensation = new Map()
      if (this.summary.compensation) {
        let tmp
        let key
        for (let i = 0; i < this.summary.compensation.length; i++) {
          // Calculate directional compensation
          if (this.summary.compensation[i].from === '' ||
            this.summary.compensation[i].to === '') {
            continue
          }
          key = `${this.summary.compensation[i].from}->${this.summary.compensation[i].to}`
          if (!compensation.has(key)) {
            compensation.set(key, {
              from: this.summary.compensation[i].from,
              to: this.summary.compensation[i].to,
              val: this.summary.compensation[i].val
            })
          } else {
            tmp = compensation.get(key)
            tmp.val += this.summary.compensation[i].val
            compensation.set(key, tmp)
          }
        }
        this.summary._compensation = []
        for (const [i, comp] of compensation) {
          if (i) {
            this.summary._compensation.push({
              from: comp.from,
              to: comp.to,
              val: comp.val
            })
          }
        }
        // Reduce the amount of unnecessary payments
        // E.g. Alice owes 10 to Bob and Bob owes 5 to Alice
        //   -> Alice only owes 5 and Bob owes nothing
        let i = 0
        for (const comp of this.summary._compensation) {
          key = `${comp.to}->${comp.from}`
          if (compensation.has(key)) {
            tmp = compensation.get(key)
            if (comp.val <= tmp.val && comp.val > 0 && tmp.val > 0) {
              tmp.val -= comp.val
              comp.val = 0
              compensation.set(key, tmp)
              this.summary._compensation[i] = comp
              for (let j = 0; j < this.summary._compensation.length; j++) {
                if (this.summary._compensation[j].from === comp.to &&
                  this.summary._compensation[j].to === comp.from) {
                  this.summary._compensation[j] = tmp
                }
              }
            }
          }
          i += 1
        }
        const totalPayment = new Map()
        const totalIncome = new Map()
        let tmpFrom
        let tmpTo
        let tmpVal
        for (let j = 0; j < this.summary.compensation.length; j++) {
          tmpFrom = this.summary.compensation[j].from
          tmpTo = this.summary.compensation[j].to
          tmpVal = this.summary.compensation[j].val
          if (tmpFrom === '' && tmpTo !== '') {
            // Income
            if (!totalIncome.has(tmpTo)) {
              totalIncome.set(tmpTo, tmpVal)
            } else {
              tmpVal = totalIncome.get(tmpTo)
              tmpVal += this.summary.compensation[j].val
              totalIncome.set(tmpTo, tmpVal)
            }
          } else {
            if (tmpVal > 0 && tmpFrom !== '') {
              // Payment for tmpFrom
              if (!totalPayment.has(tmpFrom)) {
                totalPayment.set(tmpFrom, tmpVal)
              } else {
                tmpVal = totalPayment.get(tmpFrom)
                tmpVal += this.summary.compensation[j].val
                totalPayment.set(tmpFrom, tmpVal)
              }
              if (tmpTo !== '') {
                // Income for tmpTo
                if (!totalIncome.has(tmpTo)) {
                  totalIncome.set(tmpTo, this.summary.compensation[j].val)
                } else {
                  tmpVal = totalIncome.get(tmpTo)
                  tmpVal += this.summary.compensation[j].val
                  totalIncome.set(tmpTo, tmpVal)
                }
                // // Expected income through compensation is
                // // ... considered a kind of payment
                // if (!totalPayment.has(tmpTo)) {
                //   totalPayment.set(tmpTo, this.summary.compensation[j].val)
                // } else {
                //   tmpVal = totalPayment.get(tmpTo)
                //   tmpVal += this.summary.compensation[j].val
                //   totalPayment.set(tmpTo, tmpVal)
                // }
              }
            }
          }
        }
        for (let j = this.summary.summary.length - 1; j >= 0; j--) {
          if (this.summary.summary[j].from === '' &&
            this.summary.summary[j].to === '') {
            this.summary.summary.splice(j, 1)
            continue
          }
          this.summary.summary[j]._totalPayment = Math.abs(
            totalPayment.get(this.summary.summary[j].from))
          if (!this.summary.summary[j]._totalPayment) {
            this.summary.summary[j]._totalPayment = 0.0
          }
          this.summary.summary[j]._totalIncome = Math.abs(
            totalIncome.get(this.summary.summary[j].from))
          if (!this.summary.summary[j]._totalIncome) {
            this.summary.summary[j]._totalIncome = 0.0
          }
          // Personal Income and Spending's
          if (this.summary.summary[j].from === this.store.user.username) {
            this.summary._ownPayment =
              this.summary.summary[j]._totalPayment
            this.summary._ownIncome =
              this.summary.summary[j]._totalIncome
          }
        }
        // If a compensation doesn't start and end with a person,
        // ... we can discard it
        // (nobody can be held responsive for the missing end)
        for (let j = this.summary._compensation.length - 1; j >= 0; j--) {
          if (this.summary._compensation[j].to === '' ||
            this.summary._compensation[j].from === '' ||
            this.summary._compensation[j].val === 0.0) {
            this.summary._compensation.splice(j, 1)
          }
        }
      }
      // Crazy hack
      const copy = { ...this.summary }
      const json = JSON.stringify(copy)
      collection._summary = JSON.parse(json)
      return collection
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
    capitalizeFirstLetter: function ([first, ...rest], locale = navigator.language) {
      return first === undefined ? '' : first.toLocaleUpperCase(locale) + rest.join('')
    },
    removeCollection: async function (coll) {
      if (!coll) return
      await dbDelData(`finance_coll_${coll.uid}`)
      await this.getCollections()
      this.$q.notify({
        color: 'primary',
        position: 'top-right',
        message: 'Collection removed',
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
    },
    addPaymentToColl: async function (coll) {
      if (!coll) return
      this.trxFrom = this.store.user.username
      this.trxTo = ''
      this.lastCollection = coll
      this.isViewingTransaction = true
    },
    addIncomeToColl: async function (coll) {
      if (!coll) return
      this.trxFrom = ''
      this.trxTo = this.store.user.username
      this.lastCollection = coll
      this.isViewingTransaction = true
    }
  }
}
</script>

<style scoped>

</style>
