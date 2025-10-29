<template>
  <div :class="['app', { 'dark-theme': isDarkTheme }]">
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="toggleSidebar" class="menu-btn">
            ☰
          </button>
          <h1 class="app-title">
            Task Manager
          </h1>
        </div>
        <div class="header-right">
          <button @click="toggleTheme" class="theme-btn">
            {{ isDarkTheme ? '☀️' : '🌙' }}
          </button>
        </div>
      </div>
    </header>

    <div class="app-body">
      <aside :class="['sidebar', { 'sidebar-collapsed': !sidebarOpen }]">
        <nav class="sidebar-nav">
          <button
              v-for="view in views"
              :key="view.id"
              @click="setCurrentView(view.id)"
              :class="['nav-item', { active: currentView === view.id }]"
          >
            <span class="nav-icon">{{ view.icon }}</span>
            <span class="nav-text">{{ view.name }}</span>
          </button>
        </nav>

        <div class="sidebar-stats" v-if="sidebarOpen">
          <h3>📊 Quick Stats</h3>
          <div class="stat-item">
            <span>Total: {{ stats.total }}</span>
          </div>
          <div class="stat-item">
            <span>Pending: {{ stats.pending }}</span>
          </div>
          <div class="stat-item">
            <span>Completed: {{ stats.completed }}</span>
          </div>
        </div>
      </aside>

      <main class="main-content">
        <div class="content-wrapper">
          <TasksView v-if="currentView === 'tasks'"/>
          <ProjectsView v-else-if="currentView === 'projects'"/>
          <AnalyticsView v-else-if="currentView === 'analytics'"/>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted} from 'vue';
import TasksView from './views/TasksView.vue';
import ProjectsView from './views/ProjectsView.vue';
import AnalyticsView from './views/AnalyticsView.vue';
import {useStore} from 'vuex';

const store = useStore();

const isDarkTheme = computed(() => store.getters['ui/isDarkTheme']);
const sidebarOpen = computed(() => store.getters['ui/isSidebarOpen']);
const currentView = computed(() => store.getters['ui/currentView']);
const stats = computed(() => store.getters['tasks/stats']);

const views = [
  {id: 'tasks' as const, name: 'Tasks', icon: '📝'},
  {id: 'projects' as const, name: 'Projects', icon: '📁'},
  {id: 'analytics' as const, name: 'Analytics', icon: '📊'}
];

const toggleTheme = () => store.dispatch('ui/toggleTheme');
const toggleSidebar = () => store.dispatch('ui/toggleSidebar');
const setCurrentView = (view: 'tasks' | 'projects' | 'analytics') => store.dispatch('ui/setCurrentView', view);

onMounted(() => {
  store.dispatch('ui/initTheme');
  store.dispatch('tasks/fetchTasks');
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-sidebar: #1e293b;
  --bg-card: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --accent-color: #3b82f6;
  --accent-hover: #2563eb;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dark-theme {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-sidebar: #0f172a;
  --bg-card: #1e293b;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #64748b;
  --border-color: #334155;
  --accent-color: #3b82f6;
  --accent-hover: #60a5fa;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --danger-color: #ef4444;
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2);
}

body {
  font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.3s ease;
  line-height: 1.6;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  box-shadow: var(--shadow);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menu-btn, .theme-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.menu-btn:hover, .theme-btn:hover {
  background: var(--accent-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: var(--shadow);
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent-color), var(--success-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* App Body */
.app-body {
  display: flex;
  flex: 1;
}

/* Sidebar */
.sidebar {
  background: var(--bg-sidebar);
  color: var(--text-primary);
  width: 280px;
  transition: all 0.3s ease;
  overflow: hidden;
  border-right: 1px solid var(--border-color);
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  width: 100%;
  background: none;
  border: none;
  color: var(--text-secondary);
  padding: 0.875rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.95rem;
  font-weight: 500;
}

.nav-item:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding-left: 1.75rem;
}

.nav-item.active {
  background: var(--accent-color);
  color: white;
  border-right: 3px solid var(--accent-hover);
}

.nav-icon {
  font-size: 1.2rem;
  min-width: 24px;
  text-align: center;
}

.nav-text {
  white-space: nowrap;
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .nav-text {
  opacity: 0;
  width: 0;
}

.sidebar-stats {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  background: var(--bg-secondary);
}

.sidebar-stats h3 {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-item {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item:last-child {
  margin-bottom: 0;
}

.main-content {
  flex: 1;
  background: var(--bg-primary);
  min-height: calc(100vh - 80px);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  height: 100%;
}
</style>
