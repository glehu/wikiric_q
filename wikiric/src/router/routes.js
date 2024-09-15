/*
 * Copyright (c) 2024.
 * Module routes.js of wikiricQ or wikiric including wikiric and wikiricGo
 * themselves were, are and remain intellectual property of Luca Goldhausen.
 * You may use, edit and redistribute any of their parts as long as you give credit
 * in some visually accessible way.
 * (where one would expect it without having to be visible on a screen under heavy use by the viewer).
 */

const routes = [{
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  children: [{
    path: '',
    component: () => import('pages/HomeView.vue')
  }, {
    path: 'login',
    component: () => import('pages/LoginView.vue')
  }, {
    path: 'register',
    component: () => import('pages/SignUpView.vue')
  }, {
    path: 'account',
    component: () => import('pages/AccountView.vue')
  }, {
    path: 'chat',
    component: () => import('pages/ChatView.vue')
  }, {
    path: 'groups',
    component: () => import('pages/GroupsView.vue')
  }, {
    path: 'knowledge',
    component: () => import('pages/KnowledgeView.vue')
  }, {
    path: 'wisdom',
    component: () => import('pages/WisdomView.vue')
  }, {
    path: 'projects',
    component: () => import('pages/ProjectManagement.vue')
  }, {
    path: 'planner',
    component: () => import('pages/PlannerView.vue')
  }, {
    path: 'studio',
    component: () => import('pages/StudioSandboxView.vue')
  }, {
    path: 'feed',
    component: () => import('pages/FeedView.vue')
  }, {
    path: 'mockingbird',
    component: () => import('pages/MockingbirdView.vue')
  }, {
    path: 'flowfielddemo',
    component: () => import('pages/games/flowfield/FlowFieldDemo.vue')
  }, {
    path: 'finance',
    component: () => import('pages/FinancePage.vue')
  }, {
    path: 'stores',
    component: () => import('pages/StoreHubView.vue')
  }, {
    path: 'shop',
    component: () => import('pages/StoreView.vue')
  }, {
    path: 'checkout',
    component: () => import('pages/CheckoutPage.vue')
  }, {
    path: 'redir',
    component: () => import('pages/RedirectPage.vue')
  }, {
    path: 'down',
    component: () => import('pages/ErrorServerDown.vue')
  }]
}, {
  path: '/:catchAll(.*)*',
  component: () => import('pages/ErrorNotFound.vue')
}]

export default routes
