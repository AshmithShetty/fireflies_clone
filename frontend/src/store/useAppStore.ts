// Manages global application state including the mocked user and media player sync.

import { create } from 'zustand';

interface User {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
}

interface AppState {
    currentUser: User;
    currentMediaTime: number;
    setCurrentMediaTime: (time: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentUser: {
        id: "user-123",
        name: "Default User",
        email: "user@example.com",
        avatar_url: null
    },
    currentMediaTime: 0,
    setCurrentMediaTime: (time) => set({ currentMediaTime: time }),
}));