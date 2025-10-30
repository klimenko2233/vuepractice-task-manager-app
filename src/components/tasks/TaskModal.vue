<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h3>{{ mode === 'edit' ? 'Edit Task' : 'New Task' }}</h3>
        <button @click="$emit('close')" class="close-btn">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label>Title *</label>
          <input
              v-model="formData.title"
              type="text"
              placeholder="Task title"
              required
              class="form-input"
          >
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
              v-model="formData.description"
              placeholder="Task description"
              rows="3"
              class="form-textarea"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Project *</label>
            <select v-model="formData.projectId" required class="form-select">
              <option value="">Select project</option>
              <option
                  v-for="project in projects"
                  :key="project.id"
                  :value="project.id"
              >
                {{ project.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Priority</label>
            <select v-model="formData.priority" class="form-select">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Due Date</label>
            <input
                v-model="formData.dueDate"
                type="date"
                class="form-input"
            >
          </div>

          <div class="form-group">
            <label>Tags</label>
            <div class="tags-container">
              <div class="selected-tags" v-if="selectedTagObjects.length > 0">
                <span
                    v-for="tag in selectedTagObjects"
                    :key="tag.id"
                    class="tag-pill"
                    :style="{ backgroundColor: tag.color || 'var(--text-muted)' }"
                >
                  {{ tag.name }}
                  <button
                      type="button"
                      @click="removeTag(tag.id)"
                      class="tag-remove"
                  >×</button>
                </span>
              </div>

              <div class="tags-input-wrapper">
                <input
                    type="text"
                    v-model="tagSearch"
                    @focus="showTagSuggestions = true"
                    placeholder="Type to search tags..."
                    class="tag-search-input form-input"
                    @input="handleTagSearch"
                >

                <div v-if="showTagSuggestions && filteredTags.length > 0" class="tag-suggestions">
                  <div
                      v-for="tag in filteredTags"
                      :key="tag.id"
                      @click="toggleTag(tag)"
                      class="tag-suggestion"
                      :class="{ selected: isTagSelected(tag.id) }"
                  >
                    <span
                        class="tag-color-dot"
                        :style="{ backgroundColor: tag.color || 'var(--text-muted)' }"
                    ></span>
                    {{ tag.name }}
                    <span v-if="isTagSelected(tag.id)" class="check-mark">✓</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="btn btn-cancel">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary">
            {{ mode === 'edit' ? 'Update' : 'Create' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import type { ITag, ITask } from '../../store/types';

interface Props {
  task?: ITask | null;
  mode: 'create' | 'edit';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  save: [taskData: any];
  close: [];
}>();

const store = useStore();

const projects = computed(() => store.state.projects.projects);
const tags = computed(() => store.state.tags.tags);

const formData = ref({
  title: '',
  description: '',
  projectId: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  dueDate: '',
  tagIds: [] as string[]
});

const tagSearch = ref('');
const showTagSuggestions = ref(false);

const selectedTagObjects = computed(() => {
  return tags.value.filter((tag: ITag) => formData.value.tagIds.includes(tag.id));
});

const filteredTags = computed(() => {
  if (!tagSearch.value) return tags.value;
  return tags.value.filter((tag: ITag) =>
      tag.name.toLowerCase().includes(tagSearch.value.toLowerCase())
  );
});

const isTagSelected = (tagId: string) => {
  return formData.value.tagIds.includes(tagId);
};

const toggleTag = (tag: ITag) => {
  const tagIndex = formData.value.tagIds.indexOf(tag.id);
  if (tagIndex > -1) {
    formData.value.tagIds.splice(tagIndex, 1);
  } else {
    formData.value.tagIds.push(tag.id);
  }
  tagSearch.value = '';
  showTagSuggestions.value = false;
};

const removeTag = (tagId: string) => {
  formData.value.tagIds = formData.value.tagIds.filter((id: string) => id !== tagId);
};

const handleTagSearch = () => {
  showTagSuggestions.value = true;
};

const closeSuggestions = (event: Event) => {
  if (!(event.target as HTMLElement).closest('.tags-input-wrapper')) {
    showTagSuggestions.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeSuggestions);
});

onUnmounted(() => {
  document.removeEventListener('click', closeSuggestions);
});

watch(() => props.task, (task) => {
  if (task && props.mode === 'edit') {
    formData.value = {
      title: task.title,
      description: task.description,
      projectId: task.projectId,
      priority: task.priority,
      dueDate: task.dueDate || '',
      tagIds: [...task.tagIds]
    };
  } else if (props.mode === 'create') {
    formData.value = {
      title: '',
      description: '',
      projectId: '',
      priority: 'medium',
      dueDate: '',
      tagIds: []
    };
  }
}, { immediate: true });

const handleSubmit = () => {
  emit('save', formData.value);
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--bg-card);
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.close-btn {
  background: var(--bg-secondary);
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--accent-color);
  color: white;
}

.modal-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  line-height: 1.5;
}

.form-input::placeholder {
  color: var(--text-muted);
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: white;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.tag-remove {
  background: rgba(255, 255, 255, 0.3);
  border: none;
  color: white;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  line-height: 1;
  transition: all 0.2s ease;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.tags-input-wrapper {
  position: relative;
}

.tag-search-input {
  width: 100%;
}

.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-lg);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  margin-top: 4px;
}

.tag-suggestion {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

.tag-suggestion:last-child {
  border-bottom: none;
}

.tag-suggestion:hover {
  background: var(--bg-secondary);
}

.tag-suggestion.selected {
  background: var(--accent-color);
  color: white;
}

.tag-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.check-mark {
  margin-left: auto;
  font-weight: bold;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

.btn-cancel {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-cancel:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: var(--accent-color);
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Темная тема */
.dark-theme .modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}

.dark-theme .tag-suggestion.selected {
  background: var(--accent-color);
}

.dark-theme .tag-remove {
  background: rgba(255, 255, 255, 0.2);
}

.dark-theme .tag-remove:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Адаптивность */
@media (max-width: 600px) {
  .modal-overlay {
    padding: 16px;
  }

  .modal {
    max-height: calc(100vh - 32px);
  }

  .modal-header {
    padding: 20px;
  }

  .modal-form {
    padding: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }

  .tag-suggestions {
    position: fixed;
    top: 50%;
    left: 20px;
    right: 20px;
    transform: translateY(-50%);
    max-height: 60vh;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 16px;
  }

  .modal-form {
    padding: 16px;
  }

  .form-group {
    margin-bottom: 16px;
  }
}
</style>