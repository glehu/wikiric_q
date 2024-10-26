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
          <q-btn flat icon="sym_o_add"
                 align="left" class="wfull pl4 mt2"
                 no-caps
                 @click="handleAddTask">
            <span class="ml4 text-body1">Add Task</span>
          </q-btn>
          <template v-if="wisdom.coll && wisdom.coll.length > 0">
            <div class="hfull px4 py2">
              <p class="text-subtitle2 fontbold mt3">
                Collaborators - {{ wisdom.coll.length }}
              </p>
              <div class="wfit px1 py1">
                <div class="flex column">
                  <div v-for="coll in wisdom.coll" :key="coll">
                    <q-icon name="engineering" size="1.2rem"
                            class="mr1.5"/>
                    <span>{{ coll }}</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div class="hfull px4 py2">
            <q-input label="Filter" filled dense
                     color="brand-p"
                     class="mb1"
                     v-model="contentQuery"/>
            <template v-if="isLoading">
              <q-skeleton type="text"/>
              <q-skeleton type="text" class="ml6"/>
              <q-skeleton type="text" class="ml12"/>
              <q-skeleton type="text" class="ml6"/>
              <q-skeleton type="text" class="ml6"/>
              <q-skeleton type="text" class="ml12"/>
              <q-skeleton type="text" class="ml18"/>
            </template>
            <q-tree ref="contentTree"
                    :nodes="contentTree"
                    :filter="contentQuery"
                    node-key="label"
                    text-color="brand-p"
                    color="brand-p"
                    class="text-subtitle2"
                    dense
                    default-expand-all
                    no-transition
                    no-connectors
                    v-model:selected="treeNodeSelected"
                    @update:selected="handleTreeNodeSelected"/>
          </div>
        </q-scroll-area>
      </q-drawer>
      <q-page-container>
        <q-page style="padding-top: 60px" class="background pb20">
          <q-page-sticky position="top" expand class="background z-fab">
            <q-toolbar>
              <q-btn flat round dense icon="sym_o_dock_to_right"
                     @click="sidebarLeft = !sidebarLeft">
                <q-tooltip class="text-body2">
                  Toggle&nbsp;Contents
                </q-tooltip>
              </q-btn>
              <q-toolbar-title class="text-subtitle1
                                      flex items-center non-selectable">
                <span>Wisdom Viewer</span>
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
          <div class="flex justify-center">
            <div v-if="wisdom"
                 class="max-w-screen-lg wfull hfull">
              <div class="flex row wfull">
                <q-btn-group flat class="mlauto mb1">
                  <template v-if="wisdom.type === 'lesson' || wisdom.type === 'course'">
                    <q-btn icon="sym_o_topic" label="Add to Course"
                           class="mr2"
                           no-caps dense
                           @click="handleAddToCourse"/>
                  </template>
                  <template v-if="wisdom.type === 'task' && wisdom.done === false">
                    <q-btn icon="check" label="Done"
                           class="mr2"
                           no-caps dense
                           @click="handleFinishWisdom"/>
                  </template>
                  <q-btn icon="edit" label="Edit"
                         class="mr2"
                         no-caps dense
                         @click="handleEditWisdom"/>
                  <template v-if="deleteCounter === 0">
                    <q-btn icon="delete" label="Delete"
                           class="mr2"
                           no-caps dense
                           @click="setDeleteCounter"/>
                  </template>
                  <template v-else-if="deleteCounter === 1">
                    <q-btn icon="delete" label="Confirm Delete"
                           class="fontbold"
                           color="negative"
                           @click="handleDeleteWisdom"/>
                  </template>
                  <q-btn icon="share" label="Share"
                         class="mr2"
                         no-caps dense
                         @click="isSharingTask = !isSharingTask"/>
                </q-btn-group>
              </div>
              <div class="hfull wfull surface
                          rounded
                          px4 pt2 pb4">
                <template v-if="wisdom.type === 'question' && wisdom.done !== true">
                  <div class="wfull pb1 my2 pt2 pb2 px4
                              surface-variant
                              text-sm rounded w-fit fmt_border"
                       style="border-left: 8px solid darkorange">
                    <p class="fontbold text-body1">
                      This question is unanswered
                      or no answer was accepted, yet!
                    </p>
                    <ul class="mb2">
                      <li>
                        Help by submitting a comment,
                        providing useful information on this topic.
                      </li>
                      <li>
                        The question's author may accept an answer,
                        pinning it at the top.
                      </li>
                    </ul>
                  </div>
                </template>
                <template v-if="wisdom.type === 'question' && wisdom.done === true">
                  <div class="wfull pb1 my2 pt2 pb2 px4
                              surface-variant
                              text-sm rounded w-fit fmt_border"
                       style="border-left: 8px solid green">
                    <p class="fontbold text-body1">
                      This question has been answered!
                    </p>
                    <ul>
                      <li>
                        Your comments can not be accepted as
                        the answer anymore,
                        but you can still provide useful information
                        on this topic.
                      </li>
                    </ul>
                    <div class="wfull flex justify-end mb2">
                      <q-btn icon="sym_o_arrow_downward"
                             color="primary"
                             unelevated
                             label="Go to answer"
                             class="wfit"
                             @click="gotoAnswer"/>
                    </div>
                  </div>
                </template>
                <template v-if="wisdom.type === 'proposal' && wisdom.done !== true">
                  <div class="wfull pb1 my2 pt2 pb2 px4
                              surface-variant
                              text-sm rounded w-fit fmt_border"
                       style="border-left: 8px solid darkorange">
                    <p class="fontbold text-body1">
                      This proposal has not been accepted yet.
                    </p>
                    <ul class="mb2">
                      <li>
                        Wait for the supervisor(s) to review and accept this proposal.
                      </li>
                      <li>
                        Do not forget to check the contents yourself to make sure
                        you are delivering the best solution possible.
                      </li>
                    </ul>
                  </div>
                </template>
                <template v-if="wisdom.type === 'proposal' && wisdom.done === true">
                  <div class="wfull pb1 my2 pt2 pb2 px4
                              surface-variant
                              text-sm rounded w-fit fmt_border"
                       style="border-left: 8px solid green">
                    <p class="fontbold text-body1">
                      This proposal has been accepted!
                    </p>
                  </div>
                </template>
                <template v-if="isLoading">
                  <div class="pt2">
                    <q-skeleton type="rect"/>
                  </div>
                </template>
                <p class="text-2xl sm:text-3xl fontbold">{{ wisdom.t }}</p>
                <template v-if="course">
                  <div class="wfull my4
                              background overflow-hidden
                              rounded wfull">
                    <div class="flex items-center gap-2 px3 pt3">
                      <q-icon name="sym_o_topic" size="2rem"/>
                      <p class="text-subtitle2">
                        wikiric <span class="fontbold text-subtitle1">Courses</span>
                      </p>
                    </div>
                    <template v-if="course.chapters && course.chapters.length > 0">
                      <div class="wfull">
                        <q-carousel
                          id="courseCarousel"
                          v-model="slide"
                          transition-prev="jump-right"
                          transition-next="jump-left"
                          swipeable
                          animated
                          control-color="brand-p"
                          control-type="flat"
                          prev-icon="arrow_left"
                          next-icon="arrow_right"
                          padding
                          :arrows="slideArrows"
                          navigation
                          height="264px"
                          class="wfull background rounded">
                          <template v-slot:navigation-icon="{ active, btnProps, onClick }">
                            <q-btn v-if="active" size="sm" :icon="btnProps.icon"
                                   color="primary" round dense
                                   @click="onClick"/>
                            <q-btn v-else size="sm" :icon="btnProps.icon"
                                   color="brand-p" flat round dense
                                   @click="onClick"/>
                          </template>
                          <q-carousel-slide v-for="chapter in course.chapters" :key="chapter"
                                            :name="chapter.index"
                                            class="flex no-wrap wfull hfull justify-center">
                            <q-item class="rounded px3 lg:px6 py2 lg:py4 wfull hfull
                                           surface
                                           max-w-3xl overflow-hidden
                                           column justify-center"
                                    clickable
                                    @click="gotoWisdom(chapter.uid, true, chapter.index)">
                              <div class="flex items-center gap-3 sm:gap-4">
                                <p class="<sm:hidden text-5xl lg:text-7xl fontbold">
                                  {{ chapter.index + 1 }}
                                </p>
                                <div>
                                  <div class="flex gap-2 items-center">
                                    <p class="sm:hidden text-xl fontbold">
                                      {{ chapter.index + 1 }}.
                                    </p>
                                    <p class="text-h6 fontbold">
                                      {{ chapter.t }}
                                    </p>
                                  </div>
                                  <div class="flex gap-x-2 pb1 text-sm">
                                    <q-breadcrumbs active-color="brand-p">
                                      <q-breadcrumbs-el icon="person"
                                                        :label="chapter.usr"/>
                                      <q-breadcrumbs-el :label="getHumanReadableDateText(chapter.ts, false, true)"/>
                                    </q-breadcrumbs>
                                  </div>
                                  <div v-if="chapter.keys"
                                       class="flex items-center no-wrap text-sm">
                                    <q-icon name="sym_o_tag" size="1.2rem" class="mr1.5"/>
                                    <p>{{ chapter.keys }}</p>
                                  </div>
                                </div>
                              </div>
                            </q-item>
                          </q-carousel-slide>
                        </q-carousel>
                      </div>
                      <div class="relative">
                        <q-expansion-item>
                          <template v-slot:header>
                            <div class="wfull flex items-center sticky top-0">
                              <p class="text-subtitle2 wfull fontbold">
                                Toggle Chapter List
                                <span>- {{ course.chapters.length }}</span>
                              </p>
                            </div>
                          </template>
                          <q-input
                            label="Filter..."
                            color="primary"
                            label-color="brand-p"
                            v-model="chapterQuery"
                            @update:model-value="handleChapterQuery"
                            class="text-lg px2 pb2">
                            <template v-slot:prepend>
                              <q-icon name="search"/>
                            </template>
                          </q-input>
                          <div class="max-h-sm overflow-y-auto">
                            <div class="p2 flex column gap-2 hfull">
                              <template v-for="chapter in course.chapters" :key="chapter">
                                <q-item v-if="!chapter._hidden"
                                        class="surface rounded px3 py2 wfull hfull
                                             column justify-center"
                                        clickable
                                        @click="gotoWisdom(chapter.uid, true, chapter.index)">
                                  <div class="flex items-center gap-3 sm:gap-4">
                                    <p class="text-5xl sm:text-7xl fontbold">
                                      {{ chapter.index + 1 }}
                                    </p>
                                    <div>
                                      <p class="text-h6 fontbold">
                                        {{ chapter.t }}
                                      </p>
                                      <div class="flex gap-x-2 pb1 text-subtitle2">
                                        <q-breadcrumbs active-color="brand-p">
                                          <q-breadcrumbs-el icon="person"
                                                            :label="chapter.usr"/>
                                          <q-breadcrumbs-el :label="getHumanReadableDateText(chapter.ts, false, true)"/>
                                        </q-breadcrumbs>
                                      </div>
                                      <div v-if="chapter.keys"
                                           class="flex items-center no-wrap text-subtitle2">
                                        <q-icon name="sym_o_tag" size="1.2rem" class="mr1.5"/>
                                        <p>{{ chapter.keys }}</p>
                                      </div>
                                    </div>
                                  </div>
                                </q-item>
                              </template>
                            </div>
                          </div>
                        </q-expansion-item>
                      </div>
                    </template>
                    <template v-else>
                      <div class="mt4 p2 rounded background wfit">
                        <p class="text-sm fontbold cursor-help">
                          No Chapters available.
                          <q-tooltip class="text-subtitle2">
                            Maybe the author has not added chapters yet.
                          </q-tooltip>
                        </p>
                      </div>
                    </template>
                  </div>
                </template>
                <template v-if="wisdom.due">
                  <div class="flex row gap-6 px2 py1
                              mt4 rounded-2 fmt_border
                              items-start justify-between">
                    <div class="flex column gap-1">
                      <div class="flex row gap-2 items-center">
                        <p class="text-subtitle2 fontbold pointer-events-none w12">
                          From
                        </p>
                        <div class="flex row gap-2 items-center justify-between flex-grow">
                          <q-btn icon="event" flat dense no-caps
                                 class="wfit text-subtitle2 fontbold" :label="getHumanReadableDateText(wisdom.due)"/>
                          <q-btn icon="access_time" flat dense no-caps
                                 class="wfit text-subtitle2 fontbold" :label="wisdom._dueTimeFmt"/>
                        </div>
                      </div>
                      <div class="flex row gap-2 items-center">
                        <p class="text-subtitle2 fontbold pointer-events-none w12">
                          Until
                        </p>
                        <div class="flex row gap-2 items-center justify-between flex-grow">
                          <q-btn icon="event" flat dense no-caps
                                 class="wfit text-subtitle2 fontbold" :label="getHumanReadableDateText(wisdom.duet)"/>
                          <q-btn icon="access_time" flat dense no-caps
                                 class="wfit text-subtitle2 fontbold" :label="wisdom._dueTimeUntilFmt"/>
                        </div>
                      </div>
                    </div>
                    <div class="flex column gap-4 items-start mt1">
                      <div class="flex row gap-2 items-center">
                        <q-icon name="watch" size="1rem"/>
                        <span class="text-subtitle2 fontbold">{{ wisdom._duration }}</span>
                      </div>
                    </div>
                  </div>
                </template>
                <div class="wfull flex column
                            my4 py1 px2 non-selectable
                            background rounded">
                  <div class="flex gap-2 items-start justify-between">
                    <div>
                      <div class="flex gap-x-2 pb1">
                        <q-breadcrumbs active-color="brand-p" class="px1 mt1">
                          <q-breadcrumbs-el icon="person"
                                            :label="wisdom.usr"/>
                          <q-breadcrumbs-el :label="wisdom._ts"/>
                        </q-breadcrumbs>
                        <template v-if="knowledge">
                          <q-breadcrumbs active-color="brand-p" class="px1 mt1">
                            <q-breadcrumbs-el icon="school"
                                              :label="knowledge.t"/>
                            <q-breadcrumbs-el :label="knowledge.desc"/>
                          </q-breadcrumbs>
                        </template>
                      </div>
                      <div v-if="wisdom._keys"
                           class="flex items-center p1">
                        <q-icon name="sym_o_tag" size="1.2rem" class="mr1.5"/>
                        <p>{{ wisdom._keys }}</p>
                      </div>
                      <template v-if="wisdom.type === 'task'">
                        <div class="flex gap-2 my1">
                          <div class="flex items-center fmt_border
                                  wfit rounded px2 py1">
                            <template v-if="wisdom.done === true">
                              <q-icon name="check" size="1.2rem" class="mr1.5"/>
                              <span>Done,</span>
                              <span class="ml1">
                                {{ getHumanReadableDateText(wisdom.tsd, true, true) }}
                              </span>
                            </template>
                            <template v-else>
                              <q-icon name="engineering" size="1.2rem" class="mr1.5"/>
                              <span>In Progress</span>
                            </template>
                          </div>
                          <template v-if="wisdom.due && !wisdom.done">
                            <div class="flex items-center fmt_border
                                        wfit rounded px2 py1">
                              <q-icon name="access_time" size="1.2rem" class="mr1.5"/>
                              <span>Due</span>
                              <span class="ml1">
                                {{ getHumanReadableDateText(wisdom.due, true, true) }}
                              </span>
                            </div>
                          </template>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
                <template v-if="isLoading">
                  <q-skeleton type="text"/>
                  <q-skeleton type="text" class="mr6"/>
                  <q-skeleton type="text" class="mr12"/>
                  <q-skeleton type="text" class="mr6"/>
                  <q-skeleton type="text" class="mr6"/>
                  <q-skeleton type="text" class="mr12"/>
                  <q-skeleton type="text" class="mr18"/>
                </template>
                <div v-html="wisdom.desc" class="markedView"
                     style="word-break: break-word !important;"></div>
              </div>
              <div v-if="related" class="m4">
                <div v-if="related && related.proposals && related.proposals.length > 0"
                     class="mx1 pb1 mt1">
                  <q-expansion-item default-opened class="wfull">
                    <template v-slot:header>
                      <div class="wfull flex items-center gap-2">
                        <p class="text-sm fontbold">
                          {{ related.proposals.length }} {{ proposalWord }}
                        </p>
                      </div>
                    </template>
                    <div class="wfull flex column gap-2 pl2">
                      <div v-for="proposal in related.proposals" :key="proposal.uid"
                           class="wfull fmt_border_top fmt_border_left mb1"
                           style="border-left-color: var(--md-sys-color-primary);
                        border-left-width: 6px">
                        <div class="flex gap-1 items-center wfull no-wrap">
                          <template v-if="canWrite">
                            <q-checkbox :model-value="proposal.done"
                                        class="ml1"
                                        @update:model-value="handleFinishTask(proposal.uid)"/>
                          </template>
                          <template v-else>
                            <div class="w-2"></div>
                          </template>
                          <div class="flex-grow">
                            <div class="flex gap-2 items-center wfull pt1 px1">
                              <q-icon name="person"/>
                              <p class="text-xs font-600">
                                {{ proposal.name }}
                              </p>
                              <q-icon name="schedule"/>
                              <p class="text-xs font-600">
                                {{ getHumanReadableDateText(proposal.ts) }}
                              </p>
                              <template v-if="proposal.done">
                                <q-icon name="check" class="font-900"/>
                                <p class="text-xs font-600">
                                  {{ getHumanReadableDateText(proposal.tsd) }}
                                </p>
                              </template>
                              <q-btn-group class="mlauto pr1 gap-2"
                                           flat unelevated square>
                                <q-btn icon="sym_o_delete" label="Delete"
                                       size="0.7rem"
                                       class="font-600"
                                       dense flat unelevated no-caps
                                       @click="handleDeleteWisdom(proposal.uid)"/>
                                <q-btn icon="north_east" label="View"
                                       size="0.7rem"
                                       class="font-600"
                                       dense flat unelevated no-caps
                                       @click="gotoTask(proposal.uid)"/>
                                <template v-if="canWrite && !proposal.done">
                                  <q-btn icon="sym_o_check"
                                         label="Accept Proposal"
                                         color="positive"
                                         size="0.7rem"
                                         class="font-700 pr2"
                                         no-caps dense unelevated
                                         @click="handleFinishTask(proposal.uid)"/>
                                </template>
                              </q-btn-group>
                            </div>
                            <template v-if="proposal.done === true">
                              <div class="wfit pb1 my1 pt1 pb1 px2
                                          surface-variant
                                          rounded w-fit fmt_border"
                                   style="border-left: 8px solid green">
                                <p class="fontbold text-xs">
                                  This proposal has been accepted!
                                </p>
                              </div>
                            </template>
                            <div class="flex gap-2 items-center wfull">
                              <q-btn class="text-sm fontbold cursor-text wfit"
                                     align="left"
                                     unelevated flat dense no-caps>
                                <p class="text-start wfit">
                                  {{ proposal.t }}
                                </p>
                                <q-popup-edit v-model="proposal.t" buttons v-slot="scope"
                                              @show="editingTask = proposal"
                                              @save="handleTaskEdit"
                                              color="brand-p"
                                              class="z-top">
                                  <q-input v-model="scope.value"
                                           class="wfull min-w-[50dvw] <md:w-screen"
                                           dense autofocus counter
                                           @focus="(input) => input.target.select()"
                                           @keyup.enter="scope.set"/>
                                </q-popup-edit>
                              </q-btn>
                              <q-btn v-if="!proposal.desc || proposal.desc === ''"
                                     class="text-sm fontbold cursor-pointer wfit"
                                     align="left"
                                     unelevated flat dense no-caps>
                                +
                                <q-icon name="sym_o_description" size="1.2rem"/>
                                <q-popup-edit v-model="proposal.desc" buttons v-slot="scope"
                                              @show="editingTask = proposal"
                                              @save="handleTaskEditDesc"
                                              color="brand-p"
                                              class="z-top wfull">
                                  <editor v-model="scope.value"/>
                                </q-popup-edit>
                              </q-btn>
                            </div>
                            <q-expansion-item v-if="proposal.desc && proposal.desc !== ''"
                                              dense dense-toggle header-class="mx0 px1"
                                              class="wfull">
                              <template v-slot:header>
                                <div class="flex items-center
                                    justify-between gap-2 pr2">
                                  <q-icon name="sym_o_description" size="1.2rem"/>
                                </div>
                              </template>
                              <q-btn class="text-sm font-500 cursor-text wfit"
                                     align="left"
                                     unelevated flat dense no-caps>
                                <div v-html="proposal.desc"
                                     class="markedView text-start wfull"
                                     style="word-break: break-word !important;"></div>
                                <q-popup-edit v-model="proposal.desc" buttons v-slot="scope"
                                              @show="editingTask = proposal"
                                              @save="handleTaskEditDesc"
                                              color="brand-p"
                                              class="z-top wfull">
                                  <editor v-model="scope.value"/>
                                </q-popup-edit>
                              </q-btn>
                            </q-expansion-item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-expansion-item>
                </div>
                <div v-if="related && related.tasks && related.tasks.length > 0"
                     class="mx1 pb1 mt2">
                  <q-expansion-item default-opened class="wfull">
                    <template v-slot:header>
                      <div class="wfull flex items-center gap-2">
                        <p class="text-sm fontbold">
                          {{ taskProgress }} / {{ related.tasks.length }} {{ taskWord }} completed
                        </p>
                      </div>
                    </template>
                    <div class="flex wfull justify-end pr2">
                      <q-btn flat icon="sym_o_add"
                             align="left"
                             no-caps dense
                             @click="handleAddTask">
                        <span class="ml4 text-body1">Add Task</span>
                      </q-btn>
                    </div>
                    <q-slider v-model="taskProgress" :min="0" :max="related.tasks.length"
                              readonly
                              color="primary"
                              track-size="16px" thumb-size="0px"
                              class="w-full px4"/>
                    <div class="wfull flex column gap-2 pl2">
                      <div v-for="task in related.tasks" :key="task.uid"
                           class="wfull fmt_border_top fmt_border_left mb1"
                           style="border-left-color: var(--md-sys-color-primary);
                        border-left-width: 6px">
                        <div class="flex gap-1 items-center wfull no-wrap">
                          <q-checkbox :model-value="task.done"
                                      class="ml1"
                                      @update:model-value="handleFinishTask(task.uid)"/>
                          <div class="flex-grow">
                            <div class="flex gap-1 items-center wfull pt1 px1">
                              <q-icon name="schedule"/>
                              <p class="text-xs font-600 pl1 italic">
                                {{ getHumanReadableDateText(task.ts) }}
                              </p>
                              <div v-if="task.done"
                                   class="flex gap-2 items-center">
                                <q-icon name="check" class="font-900"/>
                                <p class="text-xs font-600">
                                  {{ getHumanReadableDateText(task.tsd) }}
                                </p>
                              </div>
                              <q-btn-group class="mlauto pr1 gap-2" flat unelevated>
                                <q-btn icon="sym_o_delete" label="Delete"
                                       size="0.7rem"
                                       class="font-600"
                                       dense flat unelevated no-caps
                                       @click="handleDeleteWisdom(task.uid)"/>
                                <q-btn icon="north_east" label="View"
                                       size="0.7rem"
                                       class="font-600"
                                       dense flat unelevated no-caps
                                       @click="gotoTask(task.uid)"/>
                              </q-btn-group>
                            </div>
                            <div class="flex gap-2 items-center wfull">
                              <q-btn class="text-sm fontbold cursor-text wfit"
                                     align="left"
                                     unelevated flat dense no-caps>
                                <p class="text-start wfit">
                                  {{ task.t }}
                                </p>
                                <q-popup-edit v-model="task.t" buttons v-slot="scope"
                                              @show="editingTask = task"
                                              @save="handleTaskEdit"
                                              color="brand-p"
                                              class="z-top">
                                  <q-input v-model="scope.value"
                                           class="wfull min-w-[50dvw] <md:w-screen"
                                           dense autofocus counter
                                           @focus="(input) => input.target.select()"
                                           @keyup.enter="scope.set"/>
                                </q-popup-edit>
                              </q-btn>
                              <q-btn v-if="!task.desc || task.desc === ''"
                                     class="text-sm fontbold cursor-pointer wfit"
                                     align="left"
                                     unelevated flat dense no-caps>
                                +
                                <q-icon name="sym_o_description" size="1.2rem"/>
                                <q-popup-edit v-model="task.desc" buttons v-slot="scope"
                                              @show="editingTask = task"
                                              @save="handleTaskEditDesc"
                                              color="brand-p"
                                              class="z-top">
                                  <editor v-model="scope.value"/>
                                </q-popup-edit>
                              </q-btn>
                            </div>
                            <q-expansion-item v-if="task.desc && task.desc !== ''"
                                              dense dense-toggle header-class="mx0 px1"
                                              class="wfull">
                              <template v-slot:header>
                                <div class="flex items-center
                                    justify-between gap-2 pr2">
                                  <q-icon name="sym_o_description" size="1.2rem"/>
                                </div>
                              </template>
                              <q-btn class="text-sm font-500 cursor-text wfit"
                                     align="left"
                                     unelevated flat dense no-caps>
                                <div v-html="task.desc"
                                     class="markedView text-start wfull"
                                     style="word-break: break-word !important;"></div>
                                <q-popup-edit v-model="task.desc" buttons v-slot="scope"
                                              @show="editingTask = task"
                                              @save="handleTaskEditDesc"
                                              color="brand-p"
                                              class="z-top">
                                  <editor v-model="scope.value"/>
                                </q-popup-edit>
                              </q-btn>
                            </q-expansion-item>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-expansion-item>
                </div>
                <div v-else>
                  <div class="wfull flex justify-end">
                    <q-btn flat icon="sym_o_add"
                           align="left"
                           no-caps dense
                           @click="handleAddTask">
                      <span class="ml4 text-body1">Add Task</span>
                    </q-btn>
                  </div>
                </div>
                <template v-if="related.answers && related.answers.length > 0">
                  <p id="answer"
                     class="text-body1 mb2">
                    Answer:
                  </p>
                  <div class="surface px3 pt2 pb4 rounded"
                       style="border-left: 8px solid green">
                    <div class="mb2 flex justify-between items-start gap-3">
                      <p class="">
                        {{ related.answers[0].name }}
                      </p>
                      <span class="text-subtitle2">
                        {{ related.answers[0]._ts }}
                      </span>
                    </div>
                    <div v-html="related.answers[0].desc"
                         class="markedView"
                         style="word-break: break-word !important;"></div>
                  </div>
                </template>
              </div>
              <div v-else>
                <div class="wfull flex justify-end">
                  <q-btn flat icon="sym_o_add"
                         align="left"
                         no-caps dense
                         @click="handleAddTask">
                    <span class="ml4 text-body1">Add Task</span>
                  </q-btn>
                </div>
              </div>
              <div class="mx4 mt4">
                <editor v-model="comment" ref="ref_editor"/>
              </div>
              <div class="flex row wfull mt2 pr4">
                <q-btn icon="sym_o_send" label="Post Comment"
                       color="primary"
                       class="mlauto"
                       no-caps
                       @click="postComment"/>
              </div>
              <template v-if="isLoading">
                <div class="pt4 mx4">
                  <q-skeleton type="rect" class="p2">
                    <q-skeleton type="text"/>
                    <q-skeleton type="text"/>
                  </q-skeleton>
                </div>
                <div class="pt4 mx4">
                  <q-skeleton type="rect" class="p2">
                    <q-skeleton type="text"/>
                    <q-skeleton type="text"/>
                  </q-skeleton>
                </div>
              </template>
              <div v-if="related" class="mx4">
                <template v-if="related.replies && related.replies.length > 0">
                  <p class="mt4 mb2 text-subtitle2">
                    Comments:
                    <span class="ml1">{{ related.replies.length }}</span>
                  </p>
                  <div class="wfull flex column gap-2">
                    <template v-for="reply in related.replies" :key="reply.uid">
                      <div class="surface px3 pt2 pb4 rounded">
                        <div class="mb2 flex justify-between items-start gap-3">
                          <p class="">
                            <span class="fontbold">{{ reply.name }}</span>
                          </p>
                          <span class="text-subtitle2">
                          {{ reply._ts }}
                        </span>
                        </div>
                        <div v-html="reply.desc" class="markedView"
                             style="word-break: break-word !important;"></div>
                      </div>
                      <template
                        v-if="wisdom.type === 'question' && wisdom.done !== true && wisdom.usr === store.user.username">
                        <div class="mb-4 mt-1 w-full flex">
                          <q-btn @click="finishQuestion(wisdom, reply)"
                                 icon="check"
                                 color="primary"
                                 label="Accept Answer"/>
                        </div>
                      </template>
                    </template>
                  </div>
                </template>
                <template v-else>
                  <div class="wfull flex items-center gap-2">
                    <q-icon name="sym_o_chat_error" size="2rem" color="brand-p"/>
                    <span class="text-subtitle2">No Comments</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
          <wisdom-edit :is-open="isEditingWisdom"
                       :knowledge-id="knowledge.uid"
                       :wisdom-prop="wisdom"
                       :chat-id="knowledge.pid"
                       @update="handleWisdomUpdate"/>
        </q-page>
      </q-page-container>
    </q-layout>
  </q-page>
  <template v-if="wisdom">
    <task-share :wisdom-prop="wisdom"
                :is-open="isSharingTask"/>
    <course-adder :wisdom-prop="wisdom" :knowledge-prop="knowledge"
                  :is-open="isAddingToCourse"/>
  </template>
</template>

<script>
import { api } from 'boot/axios'
import { DateTime } from 'luxon'
import WisdomEdit from 'components/knowledge/WisdomEdit.vue'
import { dbGetDisplayName } from 'src/libs/wikistore'
import TaskShare from 'components/knowledge/TaskShare.vue'
import Editor from 'components/EditorComponent.vue'
import { useStore } from 'stores/wikistate'
import CourseAdder from 'components/knowledge/CourseAdder.vue'
import { debounce, scroll } from 'quasar'

const {
  getScrollTarget,
  setVerticalScrollPosition
} = scroll

export default {
  props: {
    wisdomProp: {
      type: Object,
      required: false
    },
    knowledgeProp: {
      type: Object,
      required: false
    }
  },
  name: 'WisdomView',
  components: {
    CourseAdder,
    Editor,
    TaskShare,
    WisdomEdit
  },
  created () {
    if (this.wisdomProp) {
      this.wisdomId = this.wisdomProp.uid
    } else {
      const paramID = this.$route.query.id
      if (paramID) {
        this.wisdomId = paramID
      }
      const course = this.$route.query.course
      if (course) {
        this.getCourse(course)
      }
      const chapter = this.$route.query.chapter
      if (chapter) {
        this.slide = parseInt(chapter)
      }
    }
    this.checkCarouselResize = debounce(this.checkCarouselResize, 50)
    this.getWisdom()
  },
  computed: {
    taskProgress () {
      if (!this.related || !this.related.tasks || this.related.tasks.length < 1) {
        return 0
      }
      let done = 0
      for (let i = 0; i < this.related.tasks.length; i++) {
        if (this.related.tasks[i].done) {
          done += 1
        }
      }
      return done
    },
    canWrite () {
      if (this.wisdom.usr === this.store.user.username) {
        return true
      }
      return !!(this.wisdom.coll && this.wisdom.coll.includes(this.store.user.username))
    },
    proposalWord () {
      if (this.related && this.related.proposals && this.related.proposals.length > 1) {
        return 'Proposals'
      } else {
        return 'Proposal'
      }
    },
    taskWord () {
      if (this.related && this.related.tasks && this.related.tasks.length > 1) {
        return 'Tasks'
      } else {
        return 'Task'
      }
    }
  },
  data () {
    return {
      store: useStore(),
      sidebarLeft: false,
      wisdomId: '',
      wisdom: {
        t: '',
        desc: '',
        keys: ''
      },
      knowledge: {
        uid: ''
      },
      related: null,
      course: null,
      isEditingWisdom: false,
      contentTree: [],
      contentMap: null,
      contentQuery: '',
      comment: '',
      isSharingTask: false,
      isAddingToCourse: false,
      deleteCounter: 0,
      slide: 0,
      slideArrows: true,
      treeNodeSelected: '',
      chapterQuery: '',
      isLoading: false,
      editingTask: null
    }
  },
  methods: {
    getWisdom: function () {
      if (!this.wisdomId || this.wisdomId === '') return
      this.isLoading = true
      return new Promise((resolve) => {
        const url = 'wisdom/private/get/' + this.wisdomId
        api({
          url
        }).then((response) => {
          this.wisdom = response.data
          this.wisdom._time = DateTime.fromISO(this.wisdom.ts)
          this.wisdom._ts = this.getHumanReadableDateText(this.wisdom._time, true, true)
          if (this.wisdom.keys) {
            this.wisdom._keys = this.wisdom.keys.split(',').join(', ')
          }
          this.wisdom = this.jsDateToQDate(this.wisdom)
          if (this.wisdom.type === 'course') {
            this.course = this.wisdom
            if (this.course.chapters && this.course.chapters.length > 0) {
              if (this.slide > this.course.chapters.length - 1) {
                this.slide = 0
              }
            }
          }
          this.buildContentLinks()
        }).then(() => {
          this.getKnowledge()
        }).then(() => {
          this.getRelated()
        }).then(() => {
          setTimeout(() => {
            this.checkCarouselResize()
            const elem = document.body
            if (elem) {
              elem.onresize = this.checkCarouselResize
            }
          }, 100)
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => {
          this.isLoading = false
          resolve()
        })
      })
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
    getKnowledge: async function (fromChat = false) {
      if (!this.wisdom || !this.wisdom.pid) return
      return new Promise((resolve) => {
        let url
        if (fromChat) {
          url = 'knowledge/private/chat/' + this.wisdom.pid
        } else {
          url = 'knowledge/private/get/' + this.wisdom.pid
        }
        api({
          url
        }).then((response) => {
          this.knowledge = response.data
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => {
          resolve()
        })
      })
    },
    clickedBack: function () {
      let backrefUrl = this.$route.query.backrefurl
      if (backrefUrl) {
        if (!backrefUrl.startsWith('/')) {
          backrefUrl = '/' + backrefUrl
        }
        const url = `/redir?redirect=${backrefUrl}`
        this.$router.push(url)
        return
      }
      const backrefQuery = this.$route.query.backref
      if (backrefQuery && backrefQuery !== this.wisdom.uid) {
        const url = `/redir?redirect=/wisdom?id=${backrefQuery}`
        this.$router.push(url)
      } else {
        this.$router.push(`/knowledge?id=${this.knowledge.pid}`)
      }
    },
    handleFinishWisdom: function () {
      if (this.wisdomId == null || this.wisdomId === '') return
      return new Promise((resolve) => {
        api({
          url: 'wisdom/private/finish/' + this.wisdomId
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Task Finished!',
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
          this.getWisdom()
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner or collaborator of this task.',
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
    },
    handleEditWisdom: function () {
      this.isEditingWisdom = !this.isEditingWisdom
    },
    handleDeleteWisdom: function (uid) {
      if (this.wisdomId == null || this.wisdomId === '' || !uid || uid === '') {
        return
      }
      let wisUID = this.wisdomId
      if (uid) {
        wisUID = uid
      }
      return new Promise((resolve) => {
        api({
          url: 'wisdom/private/delete/' + wisUID
        })
        .then(() => {
          if (!uid) {
            this.$router.back()
          }
        })
        .then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Wisdom Deleted!',
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
        .catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Wisdom.',
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
          this.getRelated()
          resolve()
        })
      })
    },
    handleWisdomUpdate: function (wisdom) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/edit/' + wisdom.uid,
          data: wisdom
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Wisdom Updated!',
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
          this.getWisdom()
          resolve()
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Wisdom.',
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
      })
    },
    handleAddToCourse: function () {
      this.isAddingToCourse = !this.isAddingToCourse
    },
    /**
     * So much spaghetti you can call it italy!
     * Never-nesters will cry! if'n'else-heaven!
     */
    buildContentLinks: function () {
      if (!this.wisdom) return
      const headers = [...this.wisdom.desc.matchAll(/<h([1-6])\sdata-wikiric-id="([\w-]*)">([^<]+)<\/h[1-6]>/gm)]
      let level
      let content
      let dataId
      let lastLevel
      let lastParentDataId = ''
      let ix = 0
      let tmp = {
        label: '',
        children: []
      }
      let obj = {}
      const parentIndices = []
      // Prepare content tree
      const tree = []
      // Add root node
      tree.push({
        label: this.wisdom.t,
        children: []
      })
      // Prepare content map
      this.contentMap = new Map()
      // Add further nodes
      for (let i = 0; i < headers.length; i++) {
        level = parseInt(headers[i][1], 10)
        // Extract content
        // If group 2 aka ID group exists we need to choose group 3
        // Since group 0 (the whole match) always exists group 2 is on length 3
        if (headers[i].length === 3) {
          content = headers[i][2]
        } else if (headers[i].length === 4) {
          content = headers[i][3]
        }
        if (!content) continue
        if (content.length > 40) {
          content = content.substring(0, 40) + '...'
        }
        content = ++ix + '. ' + content
        // Remember data id
        if (headers[i].length === 4) {
          dataId = headers[i][2]
        } else {
          dataId = ''
        }
        this.contentMap.set(content, dataId)
        if (level && content) {
          if (lastLevel) {
            if (level < lastLevel) {
              // Lower level (more important) -> remember
              tmp = {
                label: content,
                children: [],
                id: dataId
              }
              parentIndices.pop()
              if (parentIndices.length > 0) {
                parentIndices[parentIndices.length - 1].children.push(tmp)
              } else {
                tree[0].children.push(tmp)
              }
            } else {
              if (level > lastLevel) {
                // Higher level (less important) -> insert as child
                // Insert as child of child if possible
                const len = tmp.children.length
                obj = {
                  label: content,
                  children: [],
                  id: dataId
                }
                if (len > 0) {
                  // Allow for another level of child
                  const len2 = tmp.children[len - 1].children.length
                  if (len2 > 0) {
                    tmp.children[len - 1].children[len2 - 1].children.push(obj)
                    if (lastParentDataId !== tmp.children[len - 1].children[len2 - 1].id) {
                      lastParentDataId = tmp.children[len - 1].children[len2 - 1].id
                      parentIndices.push(tmp.children[len - 1].children[len2 - 1])
                    }
                  } else {
                    tmp.children[len - 1].children.push(obj)
                    if (lastParentDataId !== tmp.children[len - 1].id) {
                      lastParentDataId = tmp.children[len - 1].id
                      parentIndices.push(tmp.children[len - 1])
                    }
                  }
                } else {
                  tmp.children.push(obj)
                  if (lastParentDataId !== tmp.id) {
                    lastParentDataId = tmp.id
                    parentIndices.push(tmp)
                  }
                }
              } else if (level === lastLevel) {
                // Same level -> remember
                obj = {
                  label: content,
                  children: [],
                  id: dataId
                }
                tmp = { ...obj }
                if (parentIndices.length > 0) {
                  parentIndices[parentIndices.length - 1].children.push(tmp)
                } else {
                  tree[0].children.push(tmp)
                }
              }
            }
          } else {
            // First node -> remember
            tmp = {
              label: content,
              children: [],
              id: dataId
            }
            tree[0].children.push(tmp)
          }
          lastLevel = level
        }
      }
      this.contentTree = tree
      if (tree[0].children.length > 0) {
        setTimeout(() => {
          this.$refs.contentTree.expandAll()
        }, 0)
      }
    },
    postComment: async function () {
      if (this.comment.trim() === '') return
      const payload = {
        t: '',
        desc: this.comment.trim(),
        ref: this.wisdom.uid,
        keys: '',
        type: 'reply',
        pid: this.knowledge.uid
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/reply',
          data: payload
        }).then(() => {
          this.comment = ''
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Comment sent!',
            caption: 'Thanks for contributing.',
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
        }).then(() => {
          this.getRelated()
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    getRelated: async function () {
      if (!this.wisdom.uid) return
      return new Promise((resolve) => {
        const guid = this.wisdom.uid
        api({
          url: 'wisdom/private/investigate/' + guid
        })
        .then(async (response) => {
          const related = response.data
          let dName
          if (related.replies) {
            for (let i = 0; i < related.replies.length; i++) {
              related.replies[i]._time = DateTime.fromISO(related.replies[i].ts)
              related.replies[i]._ts = this.getHumanReadableDateText(related.replies[i]._time, true, true)
              dName = await dbGetDisplayName(related.replies[i].usr)
              if (dName == null) {
                dName = related.replies[i].usr
              }
              related.replies[i].name = dName
            }
          }
          if (related.answers) {
            for (let i = 0; i < related.answers.length; i++) {
              related.answers[i]._time = DateTime.fromISO(related.answers[i].ts)
              related.answers[i]._ts = this.getHumanReadableDateText(related.answers[i]._time, true, true)
              dName = await dbGetDisplayName(related.answers[i].usr)
              if (dName == null) {
                dName = related.answers[i].usr
              }
              related.answers[i].name = dName
            }
          }
          if (related.ref) {
            related.ref.ts = DateTime.fromISO(related.ref.ts)
            dName = await dbGetDisplayName(related.ref.usr)
            if (dName == null) {
              dName = related.ref.usr
            }
            related.ref.name = dName
          }
          if (related.tasks) {
            let dName
            for (let i = 0; i < related.tasks.length; i++) {
              related.tasks[i].t = this.formatTitle(related.tasks[i].t)
              related.tasks[i].ts = DateTime.fromISO(related.tasks[i].ts)
              dName = await dbGetDisplayName(related.tasks[i].usr)
              if (dName == null) {
                dName = related.tasks[i].usr
              }
              related.tasks[i].name = dName
            }
            related.tasks.sort(
              (a, b) => new Date(b.ts).valueOf() - new Date(a.ts).valueOf())
          }
          if (related.proposals) {
            let dName
            for (let i = 0; i < related.proposals.length; i++) {
              related.proposals[i].t = this.formatTitle(related.proposals[i].t)
              related.proposals[i].ts = DateTime.fromISO(related.proposals[i].ts)
              dName = await dbGetDisplayName(related.proposals[i].usr)
              if (dName == null) {
                dName = related.proposals[i].usr
              }
              related.proposals[i].name = dName
            }
            related.proposals.sort(
              (a, b) => new Date(b.ts).valueOf() - new Date(a.ts).valueOf())
          }
          this.related = { ...related }
          this.gotRelated = true
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          resolve()
        })
      })
    },
    jsDateToQDate: function (date) {
      if (!date.due) return date
      const lux = DateTime.fromISO(date.due)
      date._dueDate = lux.toISODate().replaceAll('-', '/')
      date._dueTime = lux.toISOTime()
      date._dueTimeFmt = lux.toLocaleString(DateTime.TIME_24_SIMPLE)
      if (!date.duet) return date
      const luxt = DateTime.fromISO(date.duet)
      date._dueDateUntil = luxt.toISODate().replaceAll('-', '/')
      date._dueTimeUntil = luxt.toISOTime()
      date._dueTimeUntilFmt = luxt.toLocaleString(DateTime.TIME_24_SIMPLE)
      let dur = luxt.diff(lux).as('minutes')
      if (dur >= 120) {
        dur = dur / 60
        date._duration = dur.toFixed(2) + ' hour'
      } else {
        date._duration = dur.toFixed(2) + ' minute'
      }
      if (dur > 1) date._duration += 's'
      return date
    },
    setDeleteCounter: function () {
      this.deleteCounter = 1
      setTimeout(() => {
        this.deleteCounter = 0
      }, 5000)
    },
    finishQuestion: async function (wisdom, comment) {
      if (wisdom == null) return
      return new Promise((resolve) => {
        api({
          url: `wisdom/private/accept/${comment.uid}`
        })
        .then(() => {
          this.getWisdom()
        })
        .then(() => {
          this.getRelated()
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => resolve())
      })
    },
    gotoWisdom: function (uid, fromCourse = false, chapterIndex = -1) {
      let url = '/redir?redirect=/wisdom?id=' + uid
      if (fromCourse) {
        url += `&backref=${this.wisdom.uid}`
        if (this.wisdom.type === 'course') {
          url += `&course=${this.wisdom.uid}`
        } else {
          url += `&course=${this.course.uid}`
        }
        url += `&chapter=${chapterIndex}`
      }
      this.$router.push(url)
    },
    gotoTask: function (uid) {
      let url = '/redir?redirect=/wisdom?id=' + uid
      url += '&backrefurl=/wisdom?id=' + this.wisdom.uid
      this.$router.push(url)
    },
    checkCarouselResize: function () {
      this.slideArrows = document.body.clientWidth > 500
    },
    handleTreeNodeSelected: function (e) {
      const result = this.contentMap.get(e)
      if (result) {
        const elems = document.querySelectorAll(
          `[data-wikiric-id="${result}"]`)
        if (elems.length > 0) {
          this.scrollToElement(elems[0])
        }
      }
    },
    scrollToElement: function (el) {
      const target = getScrollTarget(el)
      let offset = el.offsetTop - 64
      if (offset < 0) {
        offset = 0
      }
      const duration = 200
      setVerticalScrollPosition(target, offset, duration)
    },
    gotoAnswer: function () {
      const elem = document.getElementById('answer')
      if (elem) {
        this.scrollToElement(elem)
      }
    },
    handleChapterQuery: function () {
      if (!this.wisdom || !this.wisdom.chapters) {
        return
      }
      if (this.chapterQuery === '') {
        for (let i = 0; i < this.wisdom.chapters.length; i++) {
          this.wisdom.chapters[i]._hidden = false
        }
      } else {
        for (let i = 0; i < this.wisdom.chapters.length; i++) {
          if (this.wisdom.chapters[i].t.toLowerCase().includes(this.chapterQuery)) {
            this.wisdom.chapters[i]._hidden = false
          } else {
            this.wisdom.chapters[i]._hidden =
              !this.wisdom.chapters[i].keys.toLowerCase().includes(this.chapterQuery)
          }
        }
      }
    },
    getCourse: function (wisdomId) {
      if (!wisdomId || wisdomId === '') return
      return new Promise((resolve) => {
        const url = 'wisdom/private/get/' + wisdomId
        api({
          url
        }).then((response) => {
          this.course = response.data
          this.course._time = DateTime.fromISO(this.course.ts)
          this.course._ts = this.getHumanReadableDateText(this.course._time, true, true)
          if (this.course.keys) {
            this.course._keys = this.course.keys.split(',').join(', ')
          }
          this.course = this.jsDateToQDate(this.course)
        }).then(() => {
          setTimeout(() => {
            this.checkCarouselResize()
            const elem = document.body
            if (elem) {
              elem.onresize = this.checkCarouselResize
            }
          }, 100)
        })
        .catch((err) => {
          console.debug(err.message)
        })
        .finally(() => {
          resolve()
        })
      })
    },
    handleTaskEdit: function (val) {
      if (!this.editingTask) {
        return
      }
      this.editingTask.t = val
      this.handleTaskUpdate(this.editingTask)
      this.editingTask = null
    },
    handleTaskEditDesc: function (val) {
      if (!this.editingTask) {
        return
      }
      this.editingTask.desc = val
      this.handleTaskUpdate(this.editingTask)
      this.editingTask = null
    },
    handleTaskUpdate: function (wisdom) {
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/edit/' + wisdom.uid,
          data: wisdom
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Wisdom Updated!',
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
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner of the Wisdom.',
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
          this.getRelated()
          resolve()
        })
      })
    },
    handleFinishTask: function (uid) {
      if (uid == null || uid === '') return
      return new Promise((resolve) => {
        api({
          url: 'wisdom/private/finish/' + uid
        }).then(() => {
          this.$q.notify({
            color: 'primary',
            position: 'top-right',
            message: 'Progress set!',
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
          this.getRelated()
        }).catch((err) => {
          this.$q.notify({
            color: 'negative',
            position: 'top-right',
            message: 'Error!',
            caption: 'Maybe you aren\'t the owner or collaborator of this task.',
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
    },
    handleAddTask: function () {
      let collT = []
      if (this.wisdom.coll) {
        collT = this.wisdom.coll
      }
      const payload = {
        t: 'New Task',
        desc: '',
        keys: '',
        pid: this.knowledge.uid,
        copy: '',
        cats: [],
        coll: collT,
        type: 'task',
        row: 0,
        ref: this.wisdom.uid
      }
      return new Promise((resolve) => {
        api({
          method: 'post',
          url: 'wisdom/private/create',
          data: payload
        }).catch((err) => {
          console.debug(err.message)
        }).finally(() => {
          this.getRelated()
          resolve()
        })
      })
    },
    formatTitle: function (title) {
      if (!title || title.length < 1) return ''
      if (title.startsWith('#')) {
        let cutUntil = 0
        for (let i = 0; i < title.length; i++) {
          if (title.substring(i, i + 1) === '#') {
            cutUntil++
          }
        }
        return title.substring(cutUntil).trim()
      } else {
        return title
      }
    }
  }
}
</script>

<style scoped>

</style>

<style lang="scss">

.markedView pre {
  background: #0D0D0D;
  color: #FFF;
  font-family: 'JetBrainsMono', monospace;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;

  code {
    color: inherit;
    padding: 0;
    background: none;
    font-size: 0.8rem;
  }

  .hljs-comment,
  .hljs-quote {
    color: #616161;
  }

  .hljs-variable,
  .hljs-template-variable,
  .hljs-attribute,
  .hljs-tag,
  .hljs-name,
  .hljs-regexp,
  .hljs-link,
  .hljs-name,
  .hljs-selector-id,
  .hljs-selector-class {
    color: #F98181;
  }

  .hljs-number,
  .hljs-meta,
  .hljs-built_in,
  .hljs-builtin-name,
  .hljs-literal,
  .hljs-type,
  .hljs-params {
    color: #FBBC88;
  }

  .hljs-string,
  .hljs-symbol,
  .hljs-bullet {
    color: #B9F18D;
  }

  .hljs-title,
  .hljs-section {
    color: #FAF594;
  }

  .hljs-keyword,
  .hljs-selector-tag {
    color: #70CFF8;
  }

  .hljs-emphasis {
    font-style: italic;
  }

  .hljs-strong {
    font-weight: 700;
  }
}

</style>
