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
          >
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
              v-model="formData.description"
              placeholder="Task description"
              rows="3"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Project *</label>
            <select v-model="formData.projectId" required>
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
            <select v-model="formData.priority">
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
                    :style="{ backgroundColor: tag.color || '#6b7280' }"
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
                    class="tag-search-input"
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
                        :style="{ backgroundColor: tag.color || '#666' }"
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

// Исправленный watch - добавлен immediate: true
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
    // Сброс формы при создании
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
}

.modal {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

input, select, textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4a90e2;
}

textarea {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.tags-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #6b7280;
  color: white;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
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
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.5);
}

.tags-input-wrapper {
  position: relative;
}

.tag-search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.tag-search-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.tag-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-height: 150px;
  overflow-y: auto;
  z-index: 10;
}

.tag-suggestion {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background 0.2s;
  font-size: 14px;
}

.tag-suggestion:hover {
  background: #f5f5f5;
}

.tag-suggestion.selected {
  background: #e3f2fd;
  color: #1976d2;
}

.tag-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.check-mark {
  margin-left: auto;
  font-weight: bold;
  color: #4caf50;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-cancel {
  background: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background: #e0e0e0;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357ae8;
}

@media (max-width: 600px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal {
    margin: 10px;
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
</style>