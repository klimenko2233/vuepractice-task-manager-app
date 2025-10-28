import {Module} from 'vuex';
import type {ITag} from '../types';

interface TagsState {
    tags: ITag[];
}

const tagsModule: Module<TagsState, any> = {
    namespaced: true,
    state: () => ({
        tags: [
            {
                id: '1',
                name: 'Urgent',
                color: '#f44336'
            },
            {
                id: '2',
                name: 'Important',
                color: '#ff9800'
            },
            {
                id: '3',
                name: 'Backend',
                color: '#2196f3'
            },
            {
                id: '4',
                name: 'Frontend',
                color: '#4caf50'
            },
            {
                id: '5',
                name: 'Meeting',
                color: '#9c27b0'
            },
            {
                id: '6',
                name: 'Documentation',
                color: '#607d8b'
            }
        ]
    }),

    getters: {
        tagsWithStats: (state, getters, rootState) => {
            return state.tags.map(tag => ({
                ...tag,
                taskCount: rootState.tasks.tasks.filter((task: any) =>
                    task.tagIds.includes(tag.id)).length
            }))
        },
        popularTags: (state, getters) => {
            return (getters.tagsWithStats as any[])
                .filter(tag => tag.taskCount > 0)
                .sort((a, b) => b.taskCount - a.taskCount);
        }
    },

    mutations: {
        SET_TAGS(state, tags: ITag[]) {
            state.tags = tags;
        },
        ADD_TAG(state, tag: ITag) {
            state.tags.push(tag);
        },
        UPDATE_TAG(state, updatedTag: ITag) {
            const index = state.tags.findIndex(tag => tag.id === updatedTag.id);
            if (index !== -1) {
                state.tags.splice(index, 1, updatedTag)
            }
        },
        DELETE_TAG(state, tagId: string) {
            state.tags = state.tags.filter(tag => tag.id !== tagId);
        }
    },

    actions: {
        createTag({ commit }, tagData: Omit<ITag, 'id'>) {
            const newTag: ITag = {
                ...tagData,
                id: Date.now().toString()
            };
            commit('ADD_TAG', newTag);
            return newTag;
        },
        updateTag({ commit }, tagData: Partial<ITag> & {id:string}) {
            commit('UPDATE_TAG', tagData);
        },
        deleteTag({ commit }, tagId: string) {
            commit('DELETE_TAG', tagId);
        },
        saveToLocalStorage({ state }) {
            localStorage.setItem('tm_tags', JSON.stringify(state.tags));
        }
    }
};

export default tagsModule;