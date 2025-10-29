<template>
  <div :class="['task-card', { completed: task.completed, 'priority-high': task.priority === 'high' }]">
    <div class="task-checkbox">
      <button
          @click="$emit('toggle', task.id)"
          :class="['checkbox', { checked: task.completed}]"
      >
        <span v-if="task.completed">✅</span>
      </button>
    </div>

    <div class="task-content" @click="$emit('edit', task)">
      <div class="task-header">
        <h3 class="task-title">{{ task.title }}</h3>
        <div class="task-priority" :class="`priority-${task.priority}`">
          {{ priorityIcons[task.priority] }}
        </div>
      </div>

      <p v-if="task.description" class="task-description">
        {{ task.description }}
      </p>

      <div class="task-meta">
        <div class="meta-item" v-if="task.projectId">
          <span class="project-badge" :style="{ backgroundColor: projectColor }">
            {{ projectName }}
          </span>
        </div>

        <div class="meta-item" v-if="task.dueDate">
          <span class="due-date" :class="{ overdue: isOverdue }">
            📅 {{ formattedDueDate }}
          </span>
        </div>

        <div class="meta-item" v-if="taskTags.length > 0">
          <span
              v-for="tag in taskTags"
              :key="tag.id"
              class="tag"
              :style="{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color}"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <div class="task-footer">
        <span class="created-at">
          Created: {{ formatedDate(task.createdAt) }}
        </span>
      </div>
    </div>

    <div class="task-actions">
      <button
          @click="$emit('delete', task.id)"
          class="action-btn delete-btn"
          title="Delete"
      >
        🗑️
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue';
import {useStore} from 'vuex';
import type {ITask, IProject, ITag} from '../../store/types';

interface Props {
  task: ITask;
}

const props = defineProps<Props>();
defineEmits<{
  toggle: [id: string]
  edit: [task: ITask]
  delete: [id: string]
}>()

const store = useStore();

const projects = computed(() => store.state.projects.projects);
const tags = computed(() => store.state.tags.tags);

const project = computed(() =>
    projects.value.find((p: IProject) => p.id === props.task.projectId)
);

const projectName = computed(() => project.value?.name || 'Unknown');
const projectColor = computed(() => project.value?.color || '#6b7280');

const taskTags = computed(() =>
    tags.value.filter((tag: ITag) => props.task.tagIds.includes(tag.id))
);

const isOverdue = computed(() => {
  if (!props.task.dueDate || props.task.completed) return false;
  return new Date(props.task.dueDate) < new Date();
});

const formattedDueDate = computed(() => {
  if (!props.task.dueDate) return '';
  return new Date(props.task.dueDate).toLocaleDateString();
});

const priorityIcons = {
  high: '🔥',
  medium: '🟡',
  low: '🔵'
};

const formatedDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};
</script>

<style scoped>
.task-card {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  gap: 1rem;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: var(--shadow);
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-color);
}

.task-card.completed {
  opacity: 0.7;
  background: var(--bg-secondary);
}

.task-card.completed .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-card.priority-high {
  border-left: 4px solid var(--danger-color);
}

.task-checkbox {
  display: flex;
  align-items: flex-start;
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox:hover {
  border-color: var(--accent-color);
  transform: scale(1.1);
}

.checkbox.checked {
  background: var(--success-color);
  border-color: var(--success-color);
  color: white;
}

.task-content {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  gap: 1rem;
}

.task-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.task-priority {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.task-description {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  gap: 0.5rem;
}

.project-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
}

.due-date {
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.due-date.overdue {
  background: var(--danger-color);
  color: white;
}

.tag {
  padding: 0.2rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  border: 1px solid;
}

/* Футер */
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.created-at {
  font-size: 0.75rem;
  color: var(--text-muted);
}


.task-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-btn:hover {
  background: var(--accent-color);
  color: white;
  transform: scale(1.1);
}

.delete-btn:hover {
  background: var(--danger-color);
  color: white;
  transform: scale(1.1);
}

@media (max-width: 768px) {
  .task-card {
    padding: 1rem;
    gap: 0.75rem;
  }

  .task-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .task-actions {
    flex-direction: row;
    opacity: 1;
  }

  .action-btn {
    padding: 0.4rem;
    font-size: 0.9rem;
  }
}
</style>