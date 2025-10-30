<template>
  <div class="tasks-view">
    <TaskList />
  </div>
</template>

<script setup lang="ts">
import TaskList from './../components/tasks/TaskList.vue'
</script>

<style scoped>
.tasks-view {
  height: 100%;
  background: var(--bg-primary);
}
</style>