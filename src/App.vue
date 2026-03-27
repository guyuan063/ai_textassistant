<template>
  <!-- 页面最外层容器，负责限制内容宽度并承载整体布局 -->
  <div class="page-shell">

    <!-- 顶部介绍区：展示项目标题和核心卖点 -->
    <header class="hero-panel panel">
      <div class="hero-copy">
        <h1>AI 智能文本助手</h1>
        <p class="hero-description">
          润色、翻译、摘要和创意文案文本工作台
        </p>
      </div>
      
      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <router-link to="/workbench" class="nav-item">工作台</router-link>
        <router-link to="/model-config" class="nav-item">模型配置</router-link>
      </nav>
    </header>

    <!-- 路由视图 -->
    <router-view />
  </div>
</template>

<script setup>
import { useAssistantStore } from '@/stores/assistant'

// 这里拿到的是整个应用共享的 Pinia store。
const store = useAssistantStore()

// 页面加载时先把浏览器里上次保存的内容恢复回来。
store.hydrate()

// 任何和 store 有关的变化都会自动持久化到 localStorage。
store.$subscribe(
  (_mutation, state) => {
    store.persistState(state)
  },
  { detached: true }
)
</script>

<style>
.nav-menu {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.nav-item {
  padding: 8px 16px;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.nav-item:hover {
  background-color: #f5f5f5;
}

.nav-item.router-link-active {
  background-color: #409eff;
  color: white;
}
</style>