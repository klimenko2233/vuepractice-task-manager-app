import type {FilterState, ITask, TaskStats} from '../types';
import type {Module} from 'vuex/types/index.js';


interface TasksState {
    tasks: ITask[];
    filters: FilterState;
    loading: boolean;
}

const taskModule: Module<TasksState, any> = {
    namespaced: true,
    state: (): TasksState => ({
        tasks: [
            {
                id: '1',
                title: 'Complete Vuex tutorial',
                description: 'Finish learning Vuex module architecture and implement in project',
                completed: false,
                priority: 'high',
                dueDate: '2024-01-15',
                projectId: '3',
                tagIds: ['1', '4'],
                createdAt: new Date('2024-01-10'),
                updatedAt: new Date('2024-01-10')
            },
            {
                id: '2',
                title: 'Prepare project presentation',
                description: 'Create slides and demo for the team meeting',
                completed: true,
                priority: 'medium',
                dueDate: '2024-01-12',
                projectId: '2',
                tagIds: ['5'],
                createdAt: new Date('2024-01-08'),
                updatedAt: new Date('2024-01-11')
            },
            {
                id: '3',
                title: 'Fix responsive layout issues',
                description: 'Mobile view breaks on small screens, need to fix CSS',
                completed: false,
                priority: 'medium',
                dueDate: '2024-01-20',
                projectId: '2',
                tagIds: ['4', '6'],
                createdAt: new Date('2024-01-09'),
                updatedAt: new Date('2024-01-09')
            },
            {
                id: '4',
                title: 'Buy groceries',
                description: 'Milk, eggs, bread, fruits and vegetables',
                completed: false,
                priority: 'low',
                projectId: '1',
                tagIds: [],
                createdAt: new Date('2024-01-13'),
                updatedAt: new Date('2024-01-13')
            },
            {
                id: '5',
                title: 'Write documentation',
                description: 'Document the new API endpoints and update README',
                completed: false,
                priority: 'high',
                dueDate: '2024-01-14',
                projectId: '2',
                tagIds: ['6'],
                createdAt: new Date('2024-01-11'),
                updatedAt: new Date('2024-01-11')
            }
        ],
        filters: {
            searchQuery: '',
            status: 'all',
            priority: 'all',
            projectId: null,
            tagIds: []
        },
        loading: false
    }),
    getters: {
        filteredTasks: (state) => {
            let tasks = state.tasks;

            if (state.filters.searchQuery) {
                const query = state.filters.searchQuery.toLowerCase();
                tasks = tasks.filter(task =>
                    task.title.toLowerCase().includes(query) ||
                    task.description.toLowerCase().includes(query)
                );
            }

            if (state.filters.status === 'active') {
                tasks = tasks.filter(task => !task.completed);
            } else if (state.filters.status === 'completed') {
                tasks = tasks.filter(task => task.completed);
            }

            if (state.filters.priority !== 'all') {
                tasks = tasks.filter(task => task.priority === state.filters.priority);
            }

            if (state.filters.projectId) {
                tasks = tasks.filter(task => task.projectId === state.filters.projectId?.toString());
            }

            if (state.filters.tagIds.length > 0) {
                tasks = tasks.filter(task =>
                    state.filters.tagIds.every(tagId => task.tagIds.includes(tagId)));
            }

            return tasks;
        },
        stats: (state): TaskStats => {
            const total = state.tasks.length;
            const completed = state.tasks.filter(task => task.completed).length;
            const pending = total - completed;
            const overdue = state.tasks.filter(task =>
                !task.completed && task.dueDate && new Date(task.dueDate) < new Date()).length;

            return {total, completed, pending, overdue};
        },
        tasksByPriority: (state) => {
            return {
                high: state.tasks.filter(task => task.priority === 'high'),
                medium: state.tasks.filter(task => task.priority === 'medium'),
                low: state.tasks.filter(task => task.priority === 'low')
            };
        }
    },
    mutations: {
        SET_LOADING(state, loading: boolean) {
            state.loading = loading;
        },
        SET_TASKS(state, tasks: ITask[]) {
            state.tasks = tasks;
        },
        ADD_TASK(state, task: ITask) {
            state.tasks.unshift(task);
        },
        UPDATE_TASK(state, updatedTask: ITask) {
            const index = state.tasks.findIndex(task => task.id === updatedTask.id);
            if (index !== -1) {
                state.tasks.splice(index, 1, updatedTask);
            }
        },
        DELETE_TASK(state, taskId: string) {
            state.tasks = state.tasks.filter(task => task.id !== taskId)
        },
        TOGGLE_TASK(state, taskId: string) {
            const task = state.tasks.find(task => task.id === taskId);
            if (task) {
                task.completed = !task.completed;
                task.updatedAt = new Date();
            }
        },
        SET_FILTERS(state, filters: Partial<FilterState>) {
            state.filters = {...state.filters, ...filters};
        },
        CLEAR_COMPLETED(state) {
            state.tasks = state.tasks.filter(task => !task.completed);
        }
    },
    actions: {
        async fetchTasks({commit}) {
            commit('SET_LOADING', true);
            setTimeout(() => {
                const saved = localStorage.getItem('tm_tasks');
                if (saved) {
                    const tasks = JSON.parse(saved);
                    commit('SET_TASKS', tasks);
                }
                commit('SET_LOADING', false);
            }, 500);
        },
        async createTask({commit}, taskData: Omit<ITask, 'id' | 'createdAt' | 'updatedAt'>) {
            const newTask: ITask = {
                ...taskData,
                id: Date.now().toString(),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            commit('ADD_TASK', newTask);
            return newTask;
        },
        async updateTask({commit}, taskData: Partial<ITask> & { id: string }) {
            commit('UPDATE_TASK', {
                ...taskData,
                updatedAt: new Date()
            } as ITask);
        },
        async deleteTask({commit}, taskId: string) {
            commit('DELETE_TASK', taskId);
        },
        async toggleTask({commit}, taskId: string) {
            commit('TOGGLE_TASK', taskId);
        },
        setFilters({commit}, filters: Partial<FilterState>) {
            commit('SET_FILTERS', filters);
        },
        clearCompleted({commit}) {
            commit('CLEAR_COMPLETED');
        },
        saveToLocalStorage({state}) {
            localStorage.setItem('tm_tasks', JSON.stringify(state.tasks));
        }
    }
};

export default taskModule;