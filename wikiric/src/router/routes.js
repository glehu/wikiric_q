const routes = [{
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  children: [{
    path: 'index',
    component: () => import('pages/IndexPage.vue')
  }, {
    path: '',
    component: () => import('pages/HomeView.vue')
  }]
}, {
  path: '/:catchAll(.*)*',
  component: () => import('pages/ErrorNotFound.vue')
}, {
  path: '/',
  component: () => import('layouts/MainLayout.vue'),
  children: [{
    path: '',
    component: () => import('pages/HomeView.vue')
  }, {
    path: 'login',
    component: () => import('pages/LoginView.vue')
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
  }]
}, {
  path: '/:catchAll(.*)*',
  component: () => import('pages/ErrorNotFound.vue')
}]

export default routes
