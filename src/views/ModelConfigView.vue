<template>
  <main class="dashboard">
    <section class="config-column">
      <SidebarPanel />
    </section>
  </main>
</template>

<script setup>
import SidebarPanel from '@/components/SidebarPanel.vue'
</script>

<style scoped>
.config-column {
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>
