<template>
  <section class="panel side-panel">
    <div class="panel-head">
      <h2>模型配置</h2>
    </div>

    <div class="form-stack">
      <div class="control-item">
        <span>模型选择</span>
        <el-select v-model="store.settings.provider">
          <el-option v-for="provider in PROVIDER_OPTIONS" :key="provider.value" :label="provider.label"
            :value="provider.value" />
        </el-select>
      </div>

      <!-- OpenAI 配置 -->
      <template v-if="store.settings.provider === 'openai'">
        <div class="control-item">
          <span>API Key</span>
          <el-input v-model="store.settings.openai.apiKey" show-password type="password" />
        </div>

        <div class="control-item">
          <span>Base URL</span>
          <el-input v-model="store.settings.openai.baseUrl" />
        </div>

        <div class="control-item">
          <span>模型名称</span>
          <el-input v-model="store.settings.openai.model" />
        </div>

        <div class="control-item">
          <span>温度值 {{ store.settings.openai.temperature }}</span>
          <el-slider v-model="store.settings.openai.temperature" :max="1" :min="0" :step="0.1" />
        </div>
      </template>

      <!-- DeepSeek 配置 -->
      <template v-else>
        <div class="control-item">
          <span>API Key</span>
          <el-input v-model="store.settings.deepseek.apiKey" show-password type="password" />
        </div>

        <div class="control-item">
          <span>Base URL</span>
          <el-input v-model="store.settings.deepseek.baseUrl" />
        </div>

        <div class="control-item">
          <span>模型名称</span>
          <el-select v-model="store.settings.deepseek.model" allow-create default-first-option filterable>
            <el-option v-for="model in DEEPSEEK_MODEL_OPTIONS" :key="model.value" :label="model.label"
              :value="model.value" />
          </el-select>
        </div>

        <div class="control-item">
          <span>温度值 {{ store.settings.deepseek.temperature }}</span>
          <el-slider v-model="store.settings.deepseek.temperature" :max="1" :min="0" :step="0.1" />
        </div>
      </template>
    </div>
  </section>
</template>
<script setup>
import { DEEPSEEK_MODEL_OPTIONS, PROVIDER_OPTIONS } from '@/config/assistant'
import { useAssistantStore } from '@/stores/assistant'

// 设置面板直接读写共享 store，因此用户修改后会马上影响请求配置。
const store = useAssistantStore()
</script>

<style scoped>
.panel-head {
  margin-bottom: 16px;
}

.panel-head h2 {
  font-size: 1.25rem;
  margin: 4px 0 0;
}

/* 整个配置面板里的表单使用统一的纵向堆叠布局 */
.form-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item span {
  color: var(--ink);
  font-size: 0.92rem;
  font-weight: 600;
}
</style>
