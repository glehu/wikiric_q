<template>
  <div class="wfull relative">
    <div class="wfull relative">
      <q-menu v-if="!noInteraction && !fullscreen"
              touch-position auto-close cover
              class="flex">
        <q-btn-group flat class="surface flex justify-center flex-grow">
          <q-btn icon="reply" dense
                 v-on:click="$emit('reply', msg.uid)">
            <q-tooltip class="text-subtitle2">Reply</q-tooltip>
          </q-btn>
          <q-btn v-if="sent" icon="edit" dense
                 v-on:click="$emit('edit', msg.uid)">
            <q-tooltip class="text-subtitle2">Edit</q-tooltip>
          </q-btn>
          <q-btn v-if="sent" icon="delete" dense
                 v-on:click="$emit('delete', msg.uid)">
            <q-tooltip class="text-subtitle2">Delete</q-tooltip>
          </q-btn>
          <q-separator vertical spaced color="transparent"
                       class=""/>
          <q-btn icon="thumb_up" dense
                 v-on:click="$emit('react', msg.uid, '+')">
            <q-tooltip class="text-subtitle2">Upvote</q-tooltip>
          </q-btn>
          <q-btn icon="thumb_down" dense
                 v-on:click="$emit('react', msg.uid, '-')">
            <q-tooltip class="text-subtitle2">Dislike</q-tooltip>
          </q-btn>
          <q-btn icon="star" dense
                 v-on:click="$emit('react', msg.uid, '⭐️')">
            <q-tooltip class="text-subtitle2">Wow!</q-tooltip>
          </q-btn>
          <q-separator vertical spaced color="transparent"
                       class=""/>
          <q-btn icon="content_copy" dense
                 v-on:click="$emit('copy', msg._msg)">
            <q-tooltip class="text-subtitle2">Copy</q-tooltip>
          </q-btn>
          <template v-if="msg._isFile">
            <a :href="msg._msgURL"
               class="flex-grow"
               download>
              <q-btn icon="sym_o_file_download" dense unelevated size="1rem">
                <q-tooltip class="text-subtitle2">Download</q-tooltip>
              </q-btn>
            </a>
          </template>
        </q-btn-group>
      </q-menu>
      <q-slide-item @left="onLeft" @right="onLeft"
                    left-color="positive" right-color="positive"
                    class="relative"
                    :class="{'pointer-events-none': noInteraction}">
        <template v-slot:left>
          <q-icon name="reply"/>
        </template>
        <template v-slot:right>
          <q-icon name="reply"/>
        </template>
        <div class="relative"
             :class="{'bg-primary': sent,
                      'surface': !sent}">
          <div v-if="msg._tagged"
               class="relative wfull hfull bg-orange
                right-0 mb2 rounded p2 no-pointer-events
                fontbold flex row items-center text-white">
            <q-icon name="sym_o_alternate_email"
                    class="mr2"
                    size="1.5rem"/>
          </div>
          <div v-if="replySrc"
               class="p1 rounded mb2"
               :class="{'bg-primary': !sent,
                    'background': sent}">
            <div class="flex row items-center gap-1 pl1 pr2">
              <q-icon name="reply" size="1rem"/>
              <div class="flex column fontbold">
                <span class="text-xs">Reply to {{ replySrc.usr }}:</span>
              </div>
            </div>
            <div class="mt2 p2 fmt_border rounded text-white"
                 :class="{'bg-primary': sent,
                    'surface': !sent}">
              <div v-html="replySrc.msg"></div>
              <span class="text-xs opacity-60 text-weight-medium">
                {{ replySrc._ts }}
              </span>
            </div>
          </div>
          <template v-if="msg._mType === 'GIF' || msg._mType === 'Image'">
            <div class="hfit">
              <div class="relative wfull hfull">
                <q-carousel
                  class="wfull hfull surface"
                  swipeable
                  animated
                  v-model="slide"
                  v-model:fullscreen="fullscreen">
                  <q-carousel-slide :name="1"
                                    class="flex column
                                           items-center
                                           justify-center
                                           min-w-[300px]">
                    <q-img :src="msg._msgURL" fit="contain" loading="eager"/>
                  </q-carousel-slide>
                  <template v-slot:control>
                    <q-carousel-control
                      class="wfull"
                      v-if="fullscreen"
                      position="bottom-left"
                      :offset="[0, 0]">
                      <div class="flex row gap-2 items-center
                                  surface wfull pl4 pr14">
                        <span class="text-subtitle2">{{ msg._ts }}:</span>
                        <template v-if="msg._fileName">
                          <span class="text-subtitle2">{{ msg._fileName }}</span>
                        </template>
                        <template v-else>
                          <span class="text-subtitle2 italic">(No Filename)</span>
                        </template>
                        <q-btn-group flat class="surface mlauto">
                          <q-btn icon="reply" dense
                                 v-on:click="$emit('reply', msg.uid)">
                            <q-tooltip class="text-subtitle2">Reply</q-tooltip>
                          </q-btn>
                          <q-btn v-if="sent" icon="edit" dense
                                 v-on:click="$emit('edit', msg.uid)">
                            <q-tooltip class="text-subtitle2">Edit</q-tooltip>
                          </q-btn>
                          <q-btn v-if="sent" icon="delete" dense
                                 v-on:click="$emit('delete', msg.uid)">
                            <q-tooltip class="text-subtitle2">Delete</q-tooltip>
                          </q-btn>
                          <q-separator vertical spaced color="transparent"
                                       class=""/>
                          <q-btn icon="thumb_up" dense
                                 v-on:click="$emit('react', msg.uid, '+')">
                            <q-tooltip class="text-subtitle2">Upvote</q-tooltip>
                          </q-btn>
                          <q-btn icon="thumb_down" dense
                                 v-on:click="$emit('react', msg.uid, '-')">
                            <q-tooltip class="text-subtitle2">Dislike</q-tooltip>
                          </q-btn>
                          <q-btn icon="star" dense
                                 v-on:click="$emit('react', msg.uid, '⭐️')">
                            <q-tooltip class="text-subtitle2">Wow!</q-tooltip>
                          </q-btn>
                          <q-separator vertical spaced color="transparent"
                                       class=""/>
                          <q-btn icon="content_copy" dense
                                 v-on:click="$emit('copy', msg._msg)">
                            <q-tooltip class="text-subtitle2">Copy</q-tooltip>
                          </q-btn>
                          <template v-if="msg._isFile">
                            <a :href="msg._msgURL"
                               class="flex-grow"
                               download>
                              <q-btn icon="sym_o_file_download" dense unelevated size="1rem">
                                <q-tooltip class="text-subtitle2">Download</q-tooltip>
                              </q-btn>
                            </a>
                          </template>
                        </q-btn-group>
                      </div>
                    </q-carousel-control>
                    <q-carousel-control
                      v-if="!noInteraction"
                      position="bottom-right"
                      :offset="[0, 0]">
                      <q-btn
                        square dense color="primary"
                        class="rounded-tl"
                        :icon="fullscreen ? 'fullscreen_exit' : 'fullscreen'"
                        @click="fullscreen = !fullscreen"
                      />
                    </q-carousel-control>
                  </template>
                </q-carousel>
              </div>
            </div>
            <div class="pt2" v-html="msg._msg"></div>
          </template>
          <template v-else-if="msg._mType === 'Audio'">
            <div class="clientMessage">
              <p class="pointer-events-none text-subtitle2
                        font-bold">
                {{ msg._fileName }}
              </p>
              <audio controls preload="auto"
                     class="uploadFileSnippet">
                <source :src="msg._msgURL">
                Your browser does not support playing audio.
              </audio>
            </div>
            <div class="pt2" v-html="msg._msg"></div>
          </template>
          <template v-else-if="msg._isFile">
            <div class="clientMessage">
              <div class="flex gap-2 p2 rounded background items-center">
                <q-icon name="sym_o_attachment" size="2rem"/>
                <span class="pointer-events-none text-subtitle2
                             font-bold">
                  {{ msg._fileName }}
                </span>
              </div>
            </div>
            <div class="pt2" v-html="msg._msg"></div>
          </template>
          <template v-else>
            <div v-html="msg._msg"></div>
          </template>
          <div v-if="msg.e"
               class="flex row gap-1 items-center
                    relative mt4">
            <q-icon name="edit"
                    class="fontbold"
                    size="1rem"/>
            <span class="text-xs">Edited</span>
          </div>
        </div>
      </q-slide-item>
    </div>
    <div v-if="msg.reacts && msg.reacts.length > 0"
         class="flex mt2 relative">
      <div v-for="reaction in msg.reacts" :key="reaction.t"
           style="padding: 1px 4px 1px 4px; margin-right: 4px; border-radius: 5px"
           class="fmt_border cursor-pointer
                  flex row items-center gap-1"
           :title="reaction.src.toString() + ' reacted to this message.'"
           v-on:click="$emit('react', msg.uid, reaction.t)"
           :id="'react_' + msg.uid + '_' + reaction.t">
        <q-icon v-if="reaction.t === '+'" name="thumb_up"
                class=""/>
        <q-icon v-else-if="reaction.t === '-'" name="thumb_down"
                class=""/>
        <span v-else>{{ reaction.t }}</span>
        <span class="text-sm font-bold">
          {{ reaction.src.length }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChatMessageContent',
  props: {
    msg: {
      type: Object,
      required: true
    },
    sent: {
      type: Boolean,
      required: true
    },
    replySrc: {
      type: Object,
      default: undefined
    },
    noInteraction: {
      type: Boolean,
      default: false
    }
  },
  emits: ['reply', 'edit', 'delete', 'copy', 'react'],
  data () {
    return {
      fullscreen: false,
      slide: 1
    }
  },
  mounted () {
    document.addEventListener('keydown', this.cmcHandleKeydown, false)
  },
  beforeUnmount () {
    document.removeEventListener('keydown', this.cmcHandleKeydown, false)
  },
  methods: {
    onLeft ({ reset }) {
      this.$emit('reply', this.msg.uid)
      this.finalize(reset)
    },
    finalize: function (reset) {
      setTimeout(() => {
        reset()
      }, 100)
    },
    cmcHandleKeydown: function (e) {
      if (e.key === 'Escape' && this.fullscreen) {
        this.fullscreen = false
      }
    }
  }
}
</script>

<style scoped>

.markedView pre {
  max-width: 15rem;
}

.q-img__image {
  object-fit: contain !important;
}

</style>
