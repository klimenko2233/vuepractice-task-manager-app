import { Module } from 'vuex'
import type { UIState } from '../types';

const uiModule: Module<UIState, any> = {
    namespaced: true,

    state: () => ({
        theme: 'light',
        sidebarOpen: true,
        currentView: 'tasks'
    }),

    getters: {
        isDarkTheme: state => state.theme === 'dark',
        isSidebarOpen: state => state.sidebarOpen,
        currentView: state => state.currentView
    },

    mutations: {
        SET_THEME(state, theme: 'light' | 'darh') {
            state.theme = theme;
            document.documentElement.setAttribute('data-theme', theme);
        },
        TOGGLE_THEME(state) {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', state.theme);
        },
        SET_SIDEBAR_OPEN(state, open: boolean) {
            state.sidebarOpen = open;
        },
        TOGGLE_SIDEBAR(state) {
            state.sidebarOpen = !state.sidebarOpen;
        },
        SET_CURRENT_VIEW(state, view: 'tasks' | 'projects' | 'analitics') {
            state.currentView = view;
        }
    },

    actions: {
        initTheme({ commit }) {
            const saved = localStorage.getItem('tm_theme');
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if(saved) {
                commit('SET_THEME', saved as 'light' | 'dark');
            } else if(systemDark) {
                commit('SET_THEME', 'dark');
            }
        },
        toggleTheme({ commit, state }) {
            commit('TOGGLE_THEME');
            localStorage.setItem('tm_theme', state.theme);
        },
        toggleSidebar({ commit }) {
            commit('TOGGLE_SIDEBAR');
        },
        setCurrentView({ commit }, view: 'tasks' | 'projects' | 'analytics') {
            commit('SET_CURRENT_VIEW', view);
        }
    }
}

export default uiModule;