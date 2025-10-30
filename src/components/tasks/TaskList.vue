<template>
  <div class="task-list">
    <div class="list-header">
      <div class="header-left">
        <h2>Tasks ({{ filteredTasks.length }})</h2>
        <button
            @click="handleCreateTask"
            class="create-task-btn"
        >
          + New Task
        </button>
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
            @click="handleCreateTask"
            class="create-first-btn"
        >
          Create First Task
        </button>
      </div>

      <div v-else-if="viewMode === 'list'" class="tasks-grid">
        <TaskCard
            v-for="task in filteredTasks"
            :key="task.id"
            :task="task"
            @toggle="toggleTask"
            @edit="openEditModal"
            @delete="deleteTask"
        />
      </div>

      <div v-else-if="viewMode === 'board'" class="kanban-board">
        <div
            class="kanban-column"
            @drop="onDrop($event, 'todo')"
            @dragover.prevent
            @dragenter.prevent
        >
          <h3>To Do ({{ todoTasks.length }})</h3>
          <div class="kanban-tasks">
            <TaskCard
                v-for="task in todoTasks"
                :key="task.id"
                :task="task"
                draggable="true"
                @dragstart="onDragStart($event, task)"
                @toggle="toggleTask"
                @edit="openEditModal"
                @delete="deleteTask"
            />
          </div>
        </div>

        <div
            class="kanban-column"
            @drop="onDrop($event, 'completed')"
            @dragover.prevent
            @dragenter.prevent
        >
          <h3>Completed ({{ completedTasks.length }})</h3>
          <div class="kanban-tasks">
            <TaskCard
                v-for="task in completedTasks"
                :key="task.id"
                :task="task"
                draggable="true"
                @dragstart="onDragStart($event, task)"
                @toggle="toggleTask"
                @edit="openEditModal"
                @delete="deleteTask"
            />
          </div>
        </div>
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
import TaskModal from './TaskModal.vue';

const store = useStore() as any;

const showCreateModal = ref(false);
const editingTask = ref<ITask | null>(null);
const viewMode = ref<'list' | 'board'>('list');
const dragTaskId = ref<string | null>(null);

const filteredTasks = computed(() => {
  return store.getters['tasks/filteredTasks'];
});
const projects = computed(() => store.state.projects.projects);
const loading = computed(() => store.state.tasks.loading);

const filters = computed({
  get: () => store.state.tasks.filters,
  set: (value) => store.dispatch('tasks/setFilters', value)
});

const hasActiveFilters = computed(() => {
  const f = filters.value;
  return f.searchQuery || f.status !== 'all' || f.priority !== 'all' || f.projectId !== null;
});

const allTasks = computed(() => store.state.tasks.tasks);
const todoTasks = computed(() => allTasks.value.filter((task: ITask) => !task.completed));
const completedTasks = computed(() => allTasks.value.filter((task: ITask) => task.completed));

const onDragStart = (event: DragEvent, task: ITask) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', task.id);
    event.dataTransfer.effectAllowed = 'move';
    dragTaskId.value = task.id;
  }
};

const onDrop = async (event: DragEvent, targetStatus: 'todo' | 'completed') => {
  event.preventDefault();

  const taskId = event.dataTransfer?.getData('text/plain');
  if (!taskId) return;

  try {
    await store.dispatch('tasks/toggleTask', taskId);
    store.dispatch('tasks/saveToLocalStorage');
  } catch (error) {
    console.error('Error updating task:', error);
  } finally {
    dragTaskId.value = null;
  }
};

const handleCreateTask = () => {
  editingTask.value = null;
  showCreateModal.value = true;
};

const setViewMode = (mode: 'list' | 'board') => {
  viewMode.value = mode;
};

const toggleTask = (taskId: string) => {
  store.dispatch('tasks/toggleTask', taskId);
  store.dispatch('tasks/saveToLocalStorage');
};

const openEditModal = (task: ITask) => {
  editingTask.value = task;
  showCreateModal.value = true;
};

const closeModal = () => {
  showCreateModal.value = false;
  editingTask.value = null;
};

const handleSaveTask = async (taskData: any) => {
  try {
    if(editingTask.value) {
      await store.dispatch('tasks/updateTask', {
        ...taskData,
        id: editingTask.value.id
      });
    } else {
      await store.dispatch('tasks/createTask', taskData);
    }
    store.dispatch('tasks/saveToLocalStorage');
    closeModal();
  } catch (error) {
    console.error('Error saving task:', error);
  }
};

const deleteTask = async (taskId: string) => {
  if(confirm('Are you sure you want to delete this task?')) {
    await store.dispatch('tasks/deleteTask', taskId);
    store.dispatch('tasks/saveToLocalStorage');
  }
};

const clearFilters = () => {
  store.dispatch('tasks/setFilters', {
    searchQuery: '',
    status: 'all',
    priority: 'all',
    projectId: null
  });
};

const viewModes = [
  { id: 'list' as const, icon: '◼️◼️◼️'},
  { id: 'board' as const, icon: '📋'}
];

onMounted(async () => {
  await store.dispatch('tasks/fetchTasks');
});
</script>

<style scoped>
.task-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  min-height: 100vh;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #333);
}

.view-controls {
  display: flex;
  background: var(--bg-secondary, #f5f5f5);
  border: 1px solid var(--border-color, #ddd);
  border-radius: 8px;
  padding: 4px;
}

.view-btn {
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.create-task-btn {
  background: var(--accent-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.create-task-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.filters-section {
  background: var(--bg-card, white);
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
}

.search-box {
  position: relative;
  margin-bottom: 16px;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  font-size: 14px;
  background: var(--bg-primary, white);
  color: var(--text-primary, #333);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-color, #4a90e2);
  box-shadow: 0 0 0 3px;
}

.search-input::placeholder {
  color: var(--text-muted, #999);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted, #999);
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  background: var(--bg-primary, white);
  color: var(--text-primary, #333);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: var(--accent-color, #4a90e2);
}

.clear-filters-btn {
  background: var(--danger-color, #ff4757);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.clear-filters-btn:hover {
  transform: translateY(-1px);
}

.task-container {
  width: 100%;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-secondary, #666);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color, #f3f3f3);
  border-top: 3px solid var(--accent-color, #4a90e2);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary, #666);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.7;
}

.empty-state h3 {
  margin: 0 0 12px 0;
  color: var(--text-primary, #333);
  font-size: 1.25rem;
}

.empty-state p {
  margin: 0 0 20px 0;
  color: var(--text-secondary, #666);
}

.create-first-btn {
  background: var(--accent-color, #4a90e2);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  margin-top: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.create-first-btn:hover {
  background: var(--accent-hover, #357ae8);
  transform: translateY(-1px);
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.kanban-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 600px;
  padding: 20px 0;
}

.kanban-column {
  background: var(--bg-card, white);
  border: 2px solid var(--border-color, #e0e0e0);
  border-radius: 12px;
  padding: 20px;
  min-height: 500px;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
}

.kanban-column:hover {
  border-color: var(--accent-color, #4a90e2);
  box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.15));
}

.kanban-column h3 {
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid var(--border-color, #e9ecef);
  color: var(--text-primary, #495057);
  font-size: 1.1rem;
  font-weight: 600;
}

.kanban-tasks {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 400px;
}

.kanban-column[dragover] {
  border-color: var(--accent-color, #4a90e2);
  transform: scale(1.02);
}

.dark-theme .task-list {
  background: var(--bg-primary);
}

.dark-theme .header-left h2 {
  color: var(--text-primary);
}

.dark-theme .filters-section {
  border-color: var(--border-color);
  background: var(--bg-card);
}

.dark-theme .search-input,
.dark-theme .filter-select {
  background: var(--bg-primary);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.dark-theme .search-input::placeholder {
  color: var(--text-muted);
}

.dark-theme .view-controls {
  background: var(--bg-secondary);
  border-color: var(--border-color);
}

.dark-theme .view-btn {
  color: var(--text-secondary);
}

.dark-theme .empty-state h3 {
  color: var(--text-primary);
}

.dark-theme .empty-state p {
  color: var(--text-secondary);
}

.dark-theme .kanban-column {
  border-color: var(--border-color);
  background: var(--bg-card);
}

.dark-theme .kanban-column h3 {
  color: var(--text-primary);
  border-bottom-color: var(--border-color);
}


@media (max-width: 768px) {
  .task-list {
    padding: 16px;
  }

  .tasks-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 0;
  }

  .kanban-board {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px 0;
  }

  .kanban-column {
    min-height: 400px;
    padding: 16px;
  }

  .kanban-tasks {
    min-height: 300px;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .header-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .filters-section {
    padding: 16px;
  }

  .search-box {
    max-width: 100%;
  }
}

@media (min-width: 1200px) {
  .tasks-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}
</style>