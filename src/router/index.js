// 从 Vue Router 导入核心方法
// createRouter: 创建路由实例
// createWebHashHistory: 创建哈希模式的历史记录（URL中包含#，无需服务器配置）
import { createRouter, createWebHashHistory } from 'vue-router'

// 定义路由规则数组
// 每个路由对象包含：path（路径）、name（路由名称）、component（对应组件）
const routes = [
  // 根路径重定向：访问 '/' 时自动跳转到工作台页面
  {
    path: '/',
    redirect: '/workbench'
  },
  // 工作台页面路由：包含文本输入、AI生成、结果展示功能
  {
    path: '/workbench',           // 访问路径
    name: 'Workbench',            // 路由名称（用于编程式导航）
    // 使用动态导入（懒加载）方式加载组件，优化首屏加载性能
    component: () => import('../views/WorkbenchView.vue')
  },
  // 模型配置页面路由：管理AI模型参数和API设置
  {
    path: '/model-config',        // 访问路径
    name: 'ModelConfig',          // 路由名称
    component: () => import('../views/ModelConfigView.vue')
  }
]

// 创建路由实例
const router = createRouter({
  // 使用哈希模式：URL中包含#符号（如 http://localhost:5173/#/workbench）
  // 优点：无需服务器配置即可部署，适合静态站点
  history: createWebHashHistory(),
  // 传入路由规则数组
  routes
})

// 导出路由实例，供 main.js 导入使用
export default router
