import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import './styles.css'

// createApp(App) 表示把根组件 App.vue 作为整个应用的入口。
const app = createApp(App)

// 注册 Pinia，这样所有组件都能使用 useAssistantStore() 访问共享状态。
app.use(createPinia())

// 注册 Element Plus，后续页面里才能直接使用 <el-button>、<el-input> 这类组件。
app.use(ElementPlus)

// 把 Element Plus 自带图标批量注册成全局组件。
// 这样在任意 .vue 文件里都能直接写 <Loading />、<Document />。
for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(name, component)
}

// 把整个 Vue 应用挂载到 index.html 里的 <div id="app"></div> 上。
app.mount('#app')
