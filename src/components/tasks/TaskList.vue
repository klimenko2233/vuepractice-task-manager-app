<template>
  <div class="task-list">
    <div class="list-header">
      <div class="header-left">
        <h2>Tasks ({{ filteredTasks.length }})</h2>
        <div class="view-controls">
          <button
              v-for="view in viewModes"
              :key="view.id"
              @click="setViewMode(view.id)"
              :class="['view-btn', { active: viewMode === view.id }]"
          >
            {{ view.icon }}
          </button>
        </div>
      </div>
    </div>

    <div class="filters-section">
      <div class="search-box">
        <input
            type="text"
            v-model="filters.searchQuery"
            placeholder="Search tasks..."
            class="search-input"
        >
        <span class="search-icon">🔍</span>
      </div>
      <div class="filter-controls">
        <select
            v-model="filters.status"
            class="filter-select"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>

        <select
            v-model="filters.priority"
            class="filter-select"
        >
          <option value="all">All Priority</option>
          <option value="high">🔥 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🔵 Low</option>
        </select>

        <select
            v-model="filters.projectId"
            class="filter-select"
        >
          <option :value="null">All Projects</option>
          <option
              :value="project.id"
              :key="project.id"
              v-for="project in projects"
          >
            {{ project.name }}
          </option>
        </select>
        <button
            v-if="hasActiveFilters"
            @click="clearFilters"
            class="clear-filters-btn"
        >
          Clear Filters
        </button>
      </div>
    </div>

    <div class="task-container">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading tasks...</p>
      </div>

      <div v-else-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <h3>No tasks found</h3>
        <p v-if="hasActiveFilters">Try changing your filters</p>
        <p v-else>Create your first task to get started!</p>

        <button
            v-if="!hasActiveFilters"
            @click="showCreateModal = true"
            class="create-first-btn"
        >
          Create First Task
        </button>
      </div>

      <div v-else class="tasks-grid">
        <TaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @toggle="toggleTask"
            @edit="openEditModal"
            @delete="deleteTask"
        />
      </div>
    </div>

    <TaskModal
        v-if="showCreateModal"
        :task="editingTask"
        :mode="editingTask ? 'edit' : 'create'"
        @save="handleSaveTask"
        @close="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import TaskCard from './TaskCard.vue'
import type { ITask } from '../../store/types';

const store = useStore();

const showCreateModal = ref(false);
const editingTask = ref<ITask | null>(null);
const viewMode = ref<'list' | 'board'>('list');

const filteredTasks = computed(() => store.getters['tasks/filteredTasks']);
const projects = computed(() => store.state.projects.projects);
const loading = computed(() => store.state.tasks.loading);

const filters = computed({
  get: () => store.state.tasks.filters,
  set: (value) => store.dispatch('tasks/setFilters', value)
})

const hasActiveFilters = computed(() => {
  const f = filters.value;
  return f.searchQuery || f.status !== 'all' || f.priority !== 'all' || f.projectId !== null || f.projectId !== null;
})

const setViewMode = (mode: 'list' | 'board') => {
  viewMode.value = mode;
}

const toggleTask = (taskId: string) => {
  store.dispatch('tasks/toggleTask', taskId);
  store.dispatch('tasks/saveToLocalStorage');
}

const openEditModal = (task: ITask) => {
  editingTask.value = task;
  showCreateModal.value = true;
}

const closeModal = () => {
  showCreateModal.value = false;
  editingTask.value = null;
}

const handleSaveTask = async (taskData: any) => {
  if(editingTask.value) {
    await store.dispatch('tasks/updateTask', {
      ...taskData,
      id: editingTask.value.id
    })
  } else {
    await store.dispatch('tasks/createTask', taskData);
  }
  store.dispatch('tasks/saveToLocalStorage');
  closeModal();
}

const deleteTask = async (taskId: string) => {
  if(confirm('Are you sure you want to delete this task?')) {
    await store.dispatch('tasks/deleteTask', taskId);
    store.dispatch('tasks/saveToLocalStorage');
  }
}

const clearFilters = () => {
  store.dispatch('tasks/setFilters', {
    searchQuery: '',
    status: 'all',
    priority: 'all',
    projectId: null
  });
}

const viewModes = [
  { id: 'list' as const, icon: '◼️◼️◼️'},
  { id: 'board' as const, icon: '📋'}
]

onMounted(() => {
  store.dispatch('tasks/fetchTasks');
})
</script>

<style scoped>
.task-list {
  height: 100%;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.header-left h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
}

.view-controls {
  display: flex;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
}

.view-btn.active {
  background: var(--accent-color);
  color: white;
}

.create-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.filters-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: var(--shadow);
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.95rem;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-color);
}

.clear-filters-btn {
  background: var(--danger-color);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.clear-filters-btn:hover {
  background: #dc2626;
}

.task-container {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.create-first-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-first-btn:hover {
  background: var(--accent-hover);
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

@media (max-width: 768px) {
  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 0;
  }
}

@media (min-width: 1200px) {
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}
</style>