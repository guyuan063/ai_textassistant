<template>
  <section class="panel config-panel">
    <div class="panel-head">
      <h2>模型配置</h2>
      <span class="panel-subtitle">选择并配置你的 AI 模型</span>
    </div>

    <div class="form-stack">
      <div class="control-item">
        <span class="control-label">模型提供商</span>
        <el-select v-model="store.settings.provider" class="provider-select">
          <el-option v-for="provider in PROVIDER_OPTIONS" :key="provider.value" :label="provider.label"
            :value="provider.value" />
        </el-select>
      </div>

      <div class="divider"></div>

      <div class="control-item">
        <span class="control-label">API Key</span>
        <el-input v-model="currentConfig.apiKey" show-password type="password" placeholder="sk-..." />
      </div>

      <div class="control-item">
        <span class="control-label">Base URL</span>
        <el-input v-model="currentConfig.baseUrl" :placeholder="isDeepSeek ? 'https://api.deepseek.com' : 'https://api.openai.com/v1'" />
      </div>

      <div class="control-item">
        <span class="control-label">模型名称</span>
        <el-select v-if="isDeepSeek" v-model="currentConfig.model" allow-create default-first-option filterable
          class="model-select">
          <el-option v-for="model in DEEPSEEK_MODEL_OPTIONS" :key="model.value" :label="model.label"
            :value="model.value" />
        </el-select>
        <el-input v-else v-model="currentConfig.model" placeholder="gpt-3.5-turbo" />
      </div>

      <div class="control-item">
        <div class="slider-header">
          <span class="control-label">温度值</span>
          <span class="slider-value">{{ currentConfig.temperature }}</span>
        </div>
        <el-slider v-model="currentConfig.temperature" :max="1" :min="0" :step="0.1" />
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { DEEPSEEK_MODEL_OPTIONS, PROVIDER_OPTIONS } from '@/config/assistant'
import { useAssistantStore } from '@/stores/assistant'

const store = useAssistantStore()

const isDeepSeek = computed(() => store.settings.provider === 'deepseek')
const currentConfig = computed(() => store.settings[store.settings.provider])
</script>

<style scoped>
.config-panel {
  max-width: 480px;
  width: 100%;
  padding: 28px 32px;
}

.panel-head {
  margin-bottom: 24px;
}

.panel-head h2 {
  margin-bottom: 4px;
}

.panel-subtitle {
  font-size: 0.85rem;
  color: var(--muted);
}

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.divider {
  height: 1px;
  background: var(--border);
  margin: 4px 0;
}

.slider-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
  background: var(--accent-light);
  padding: 2px 10px;
  border-radius: 100px;
}

@media (max-width: 1120px) {
  .config-panel {
    max-width: 100%;
  }
}

@media (max-width: 720px) {
  .config-panel {
    padding: 20px;
  }
}
</style>
