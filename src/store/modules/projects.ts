import {Module} from 'vuex';
import type {IProject} from '../types';

interface ProjectsState {
    projects: IProject[];
    currentProjectId: string | null;
}

const projectsModule: Module<ProjectsState, any> = {
    namespaced: true,

    state: () => ({
        projects: [
            {
                id: '1',
                name: 'Personal',
                color: '#4CAF50',
                description: 'Personal tasks and assignments',
                taskCount: 0
            },
            {
                id: '2',
                name: 'Work',
                color: '#2196F3',
                description: 'Work-related tasks',
                taskCount: 0
            },
            {
                id: '3',
                name: 'Learning',
                color: '#FF9800',
                description: 'Self-education and development',
                taskCount: 0
            }
        ],
        currentProjectId: null
    }),

    getters: {
        currentProject: (state) => {
            return state.projects.find(project => project.id === state.currentProjectId)
        },
        projectsWithStats: (state, getters, rootState) => {
            return state.projects.map(project => ({
                ...project,
                taskCount: rootState.tasks.tasks.filter((task: any) =>
                    task.projectId === project.id).length
            }))
        }
    },

    mutations: {
        SET_PROJECTS(state, projects: IProject[]) {
            state.projects = projects;
        },
        ADD_PROJECT(state, project: IProject[]) {
            state.projects.push(project);
        },
        UPDATE_PROJECT(state, updatedProject: IProject) {
            const index = state.projects.findIndex(project => project.id === updatedProject.id);
            if (index !== -1) {
                state.projects.splice(index, 1, updatedProject)
            }
        },
        DELETE_PROJECT(state, projectId: string) {
            state.project = state.project.filter(project => project.id !== projectId);
        },
        SET_CURRENT_PROJECT(state, projectId: string | null) {
            state.currentProjectId = projectId;
        }
    },

    actions: {
        createProject({ commit }, projectData: Omit<IProject, 'id' | 'taskCount'>){
            const newProject: IProject = {
                ...projectData,
                id: Date.now().toString(),
                taskCount: 0
            };
            commit('ADD_PROJECT', newProject);
            return newProject;
        },
        updateProject({ commit }, projectData: Partial<IProject> & {id:string}) {
            commit('UPDATE_PROJECT', projectData);
        },
        deleteProject({ commit }, projectId: string) {
            commit('DELETE_PROJECT',projectId);
        },
        setCurrentProject({ commit }, projectId: string | null) {
            commit('SET_CURRENT_PROJECT',projectId)
        },
        saveToLocalStorage({ state }) {
            localStorage.setItem('tm_projects', JSON.stringify(state.projects));
        }
    }
};

export default projectsModule;