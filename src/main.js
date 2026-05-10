// 从 Vue 核心库导入 createApp 方法，用于创建 Vue 应用实例
import { createApp } from 'vue'
// 从 Pinia 导入 createPinia 方法，用于创建状态管理实例
import { createPinia } from 'pinia'
// 导入 Element Plus UI 组件库
import ElementPlus from 'element-plus'
// 导入 Element Plus 的全局样式
import 'element-plus/dist/index.css'
// 导入 Element Plus 的所有图标组件
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// 导入根组件 App.vue
import App from './App.vue'
// 导入路由配置
import router from './router'
// 导入全局样式文件
import './styles.css'

// 创建 Vue 应用实例，以 App.vue 作为根组件
const app = createApp(App)

// 注册 Pinia 状态管理，使应用支持全局状态共享
app.use(createPinia())

// 注册 Element Plus UI 组件库，使应用可以使用 Element Plus 的组件
app.use(ElementPlus)

// 注册 Vue Router，使应用支持路由导航
app.use(router)

// 遍历 Element Plus 的所有图标，将它们注册为全局组件
// 这样在任意组件中都可以直接使用 <图标名 /> 的方式引用
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

// 将 Vue 应用挂载到 index.html 中的 <div id="app"></div> 元素上
// 至此，应用开始启动运行
app.mount('#app')
