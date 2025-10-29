import { createStore } from 'vuex'
import taskModule from './modules/tasks';
import projectsModule from './modules/projects';
import tagsModule from './modules/tags';
import uiModule from './modules/ui';

interface RootState {}

export default createStore<RootState>({
    modules: {
        tasks:taskModule,
        projects:projectsModule,
        tags: tagsModule,
        ui: uiModule,
    },

    actions: {
        saveAllToLocalStorage({ dispatch }: any) {
            dispatch('tasks/saveToLocalStorage', null, { root: true });
            dispatch('projects/saveToLocalStorage', null, { root: true });
            dispatch('tags/saveToLocalStorage', null, { root: true });
        },
        loadAllFromLocalStorage({ dispatch }: any) {
            dispatch('tasks/fetchTasks', null, { root: true });
        }
    }
})