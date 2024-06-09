<template>
  <q-dialog v-model="show" class="z-top" seamless no-focus
            position="bottom">
    <q-card class="background wfull
                   max-w-[min(500px,90dvw)]
                   column
                   pb1 mb35"
            flat bordered>
      <q-input v-model="query" prefix="GIF:"
               class="sticky top-0 z-top background px3"/>
      <template v-if="gifs && gifs.length > 0">
        <div class="wfull hfull flex max-h-[calc(100dvh-250px)] px3">
          <template v-for="gif in gifs" :key="gif">
            <q-btn class="wfit hfit flex-grow"
                   @click="handleGIFClick(
                           gif.media_formats.tinygif.url,
                           gif.content_description)">
              <div class="wfull hfull"
                   :style="{width: gif.media_formats.tinygif.dims[0] + 'px',
                          height: gif.media_formats.tinygif.dims[1] + 'px'}">
                <q-img :src="gif.media_formats.tinygif.url"/>
              </div>
            </q-btn>
          </template>
        </div>
      </template>
    </q-card>
  </q-dialog>
</template>

<script>

import WikiricUtils from 'src/libs/wikiric-utils'
import { debounce } from 'quasar'

export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    overrideQuery: {
      type: String
    }
  },
  name: 'GIFViewer',
  emits: ['selected'],
  watch: {
    isOpen () {
      this.show = this.isOpen
      if (this.show) {
        this.handleDialogOpen()
      } else {
        this.gifs = []
      }
    },
    query (newVal) {
      this.queryGIF(newVal)
    },
    overrideQuery (newVal) {
      newVal = WikiricUtils.htmlToString(newVal)
      if (newVal.startsWith('/gif')) {
        const split = newVal.split('/gif')
        if (split.length < 2) return
        newVal = split[1].trim()
        if (!newVal || newVal.length < 1) {
          newVal = ''
        }
      }
      this.query = newVal
    }
  },
  data () {
    return {
      show: false,
      query: '',
      gifs: []
    }
  },
  created () {
    this.queryGIF = debounce(this.queryGIF, 500)
  },
  methods: {
    handleDialogOpen: function () {
      // this.getSnippets()
      // setTimeout(() => {
      //   if (this.$refs.file_query_input) {
      //     this.$refs.file_query_input.focus()
      //   }
      // }, 0)
    },
    queryGIF: async function (query) {
      if (!this.show || !query || query === '') {
        this.gifs = []
        return
      }
      // Search for nice gifs!
      let gifs = null
      // Variables
      const url = 'https://tenor.googleapis.com/v2/search'
      const key = '&key=AIzaSyCeOS6pEu8-TMQfxgic4m8y6cChU8Z-Sf4'
      const cKey = '&client_key=wikiric'
      const mFil = '&media_filter=tinygif'
      const lim = 30
      // Get GIFs
      await fetch(
        `${url}?q=${query}${key}${cKey}${mFil}&limit=${lim}`
      ).then(
        (res) => res.json()
      ).then((data) => {
        gifs = data.results
      }).catch((e) => {
        console.debug(e.message)
      })
      if (gifs == null) {
        this.gifs = []
        return
      }
      this.gifs = gifs
    },
    handleGIFClick: function (url, name) {
      this.$emit('selected', url, name)
      this.show = false
      this.gifs = []
    }
  }
}
</script>

<style scoped>

</style>
