import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/workbench'
  },
  {
    path: '/workbench',
    name: 'Workbench',
    component: () => import('../views/WorkbenchView.vue')
  },
  {
    path: '/model-config',
    name: 'ModelConfig',
    component: () => import('../views/ModelConfigView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
