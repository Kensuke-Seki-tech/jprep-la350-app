import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuery } from '@tanstack/react-query';
import type { WeekConfig, WeeksConfig } from '@/types/word';

interface WeekState {
  currentWeekId: string;
  setCurrentWeekId: (id: string) => void;
}

export const useWeekStore = create<WeekState>()(
  persist(
    (set) => ({
      currentWeekId: 'week05',
      setCurrentWeekId: (id) => set({ currentWeekId: id }),
    }),
    { name: 'jprep-current-week' }
  )
);

export function useWeeksConfig() {
  return useQuery<WeekConfig[]>({
    queryKey: ['weeksConfig'],
    queryFn: async () => {
      const res = await fetch('/data/weeks.config.json');
      if (!res.ok) throw new Error('Failed to load weeks config');
      const data: WeeksConfig = await res.json();
      return data.weeks;
    },
    staleTime: Infinity,
  });
}
