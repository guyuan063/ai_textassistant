<template>
  <div class="page-shell">
    <header class="hero-panel">
      <div class="hero-copy">
        <h1>AI 智能文本助手</h1>
        <p class="hero-description">
          润色、翻译、摘要与创意文案 — 你的文字工作台
        </p>
      </div>

      <nav class="nav-menu">
        <router-link to="/workbench" class="nav-item">
          <span class="nav-icon">✦</span>
          工作台
        </router-link>
        <router-link to="/model-config" class="nav-item">
          <span class="nav-icon">⚙</span>
          模型配置
        </router-link>
      </nav>
    </header>

    <router-view />
  </div>
</template>

<script setup>
import { useAssistantStore } from '@/stores/assistant'

const store = useAssistantStore()

store.hydrate()

store.$subscribe(
  (_mutation, state) => {
    store.persistState(state)
  },
  { detached: true }
)
</script>

<style scoped>
.nav-icon {
  display: inline-block;
  margin-right: 4px;
  font-size: 0.8em;
  opacity: 0.7;
}

.nav-item.router-link-active .nav-icon {
  opacity: 1;
}
</style>
