// Manages global application state including the mocked user and bidirectional media player sync.

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
    seekRequest: number | null;
    setCurrentMediaTime: (time: number) => void;
    requestSeek: (time: number) => void;
    clearSeekRequest: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentUser: {
        id: "user-123",
        name: "Default User",
        email: "user@example.com",
        avatar_url: null
    },
    currentMediaTime: 0,
    seekRequest: null,
    setCurrentMediaTime: (time) => set({ currentMediaTime: time }),
    requestSeek: (time) => set({ seekRequest: time }),
    clearSeekRequest: () => set({ seekRequest: null }),
}));