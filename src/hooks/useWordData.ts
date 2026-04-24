import { useQuery } from '@tanstack/react-query';
import type { WeekData, Word } from '@/types/word';

export function useWordData(weekId: string, dataUrl: string | null) {
  return useQuery<Word[]>({
    queryKey: ['wordData', weekId],
    queryFn: async () => {
      if (!dataUrl) throw new Error('No data URL');
      const res = await fetch(dataUrl);
      if (!res.ok) throw new Error(`Failed to load ${weekId}`);
      const data: WeekData = await res.json();
      return data.words;
    },
    enabled: !!dataUrl,
    staleTime: Infinity,
  });
}
