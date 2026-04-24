import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { UserProfile } from '@/types/user';
import { MAX_USERS, AVATAR_COLORS } from '@/types/user';

interface UserState {
  users: UserProfile[];
  currentUserId: string | null;
  addUser: (displayName: string, avatarColor: string) => void;
  selectUser: (userId: string) => void;
  removeUser: (userId: string) => void;
  clearCurrentUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: [],
      currentUserId: null,

      addUser: (displayName, avatarColor) =>
        set((state) => {
          if (state.users.length >= MAX_USERS) return state;
          const now = new Date().toISOString();
          const newUser: UserProfile = {
            userId: crypto.randomUUID(),
            displayName,
            avatarColor,
            createdAt: now,
            lastLoginAt: now,
          };
          return {
            users: [...state.users, newUser],
            currentUserId: newUser.userId,
          };
        }),

      selectUser: (userId) =>
        set((state) => ({
          currentUserId: userId,
          users: state.users.map(u =>
            u.userId === userId
              ? { ...u, lastLoginAt: new Date().toISOString() }
              : u
          ),
        })),

      removeUser: (userId) =>
        set((state) => ({
          users: state.users.filter(u => u.userId !== userId),
          currentUserId: state.currentUserId === userId ? null : state.currentUserId,
        })),

      clearCurrentUser: () => set({ currentUserId: null }),
    }),
    {
      name: 'jprep-users',
      partialize: (state) => ({
        users: state.users,
        currentUserId: state.currentUserId,
      }),
    }
  )
);

export function useCurrentUser() {
  const { users, currentUserId } = useUserStore();
  return users.find(u => u.userId === currentUserId) ?? null;
}

// Generate a fallback color not already used
export function getNextColor(users: UserProfile[]): string {
  const usedColors = new Set(users.map(u => u.avatarColor));
  return AVATAR_COLORS.find(c => !usedColors.has(c)) ?? AVATAR_COLORS[users.length % AVATAR_COLORS.length]!;
}
