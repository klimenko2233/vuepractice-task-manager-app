<template>
  <div class="task-card" :class="{ completed: task.completed }">
    <div class="task-header">
      <div class="task-title-section">
        <input
            type="checkbox"
            :checked="task.completed"
            @change="$emit('toggle', task.id)"
            class="task-checkbox"
        />
        <h3 class="task-title">{{ task.title }}</h3>
      </div>
      <div class="task-actions">
        <button @click="$emit('edit', task)" class="btn-icon">✏️</button>
        <button @click="$emit('delete', task.id)" class="btn-icon">🗑️</button>
      </div>
    </div>

    <p class="task-description" v-if="task.description">{{ task.description }}</p>

    <div class="task-meta">
      <span class="task-priority" :class="task.priority">
        {{ priorityIcons[task.priority] }}
      </span>

      <span class="task-project" v-if="project">
        {{ project.name }}
      </span>

      <span class="task-date" v-if="task.dueDate">
        {{ formatDate(task.dueDate) }}
      </span>
    </div>

    <div class="task-tags" v-if="taskTags.length > 0">
      <span
          v-for="tag in taskTags"
          :key="tag.id"
          class="tag"
          :style="{ backgroundColor: tag.color || '#e0e0e0' }"
      >
        {{ tag.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import type {ITask, ITag, IProject} from '../../store/types';

interface Props {
  task: ITask;
}

const props = defineProps<Props>();

const store = useStore();

const priorityIcons = {
  low: '🔵',
  medium: '🟡',
  high: '🔥'
};

const tags = computed(() => store.state.tags.tags || []);
const projects = computed(() => store.state.projects.projects || []);

const project = computed(() => {
  return projects.value.find((p: IProject) => p.id === props.task.projectId);
});

const taskTags = computed(() => {
  if (!props.task.tagIds || !Array.isArray(props.task.tagIds)) {
    return [];
  }
  return tags.value.filter((tag: ITag) =>
      props.task.tagIds?.includes(tag.id) || false
  );
});

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.task-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.task-card.completed {
  opacity: 0.7;
  background: var(--bg-secondary);
}

.task-card.completed::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--accent-color);
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;
}

.task-title-section {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.task-checkbox {
  margin-top: 2px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--accent-color);
}

.task-title {
  margin: 0;
  font-size: 1.1rem;
  line-height: 1.4;
  color: var(--text-primary);
  font-weight: 600;
  word-break: break-word;
}

.task-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-icon {
  background: var(--bg-secondary);
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  color: var(--text-secondary);
}

.btn-icon:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.1);
}

.task-description {
  margin: 0 0 16px 0;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
  word-break: break-word;
}

.task-meta {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.task-priority, .task-project, .task-date {
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.task-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  background: var(--accent-color);
}

.dark-theme .task-priority.high {
  background: #7f1d1d;
  color: #fca5a5;
}

.dark-theme .task-priority.medium {
  background: #78350f;
  color: #fdba74;
}

.dark-theme .task-priority.low {
  background: #064e3b;
  color: #6ee7b7;
}

@media (max-width: 480px) {
  .task-card {
    padding: 16px;
  }

  .task-header {
    flex-direction: column;
    gap: 8px;
  }

  .task-actions {
    align-self: flex-end;
  }
}
</style>