import { createStore } from 'vuex'
import taskModule from './modules/tasks.ts';
import projectsModule from './modules/projects.ts';
import tagsModule from './modules/tags.ts';
import uiModule from './modules/ui.ts';

export default createStore({
    modules: {
        tasks:taskModule,
        projects:projectsModule,
        tags: tagsModule,
        ui: uiModule,
    },

    actions: {
        saveAllToLocalStorage({ dispatch }) {
            dispatch('tasks/saveToLocalStorage', null, { root: true });
            dispatch('projects/saveToLocalStorage', null, { root: true });
            dispatch('tags/saveToLocalStorage', null, { root: true });
        },
        loadAllFromLocalStorage({ dispatch }) {
            dispatch('tasks/fetchTasks', null, { root: true });
        }
    }
})