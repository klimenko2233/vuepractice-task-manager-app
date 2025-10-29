export interface ITask {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    priority: 'low' | 'medium' | 'high'
    dueDate?: string;
    projectId: string;
    tagIds: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IProject {
    id: string;
    name: string;
    color: string;
    description?: string;
    taskCount: string;
}

export interface ITag {
    id: string;
    name: string;
    color: string;
}

export interface FilterState {
    searchQuery: string;
    status: 'all' | 'active' | 'completed';
    priority: 'all' | 'low' | 'medium' | 'high';
    projectId: string | null;
    tagIds: string[];
}

export interface UIState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    currentView: 'tasks' | 'projects' | 'analytics';
}

export interface TaskStats {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
}