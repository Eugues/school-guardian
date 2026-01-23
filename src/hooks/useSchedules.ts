import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Schedule } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useSchedules(childId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading, error } = useQuery({
    queryKey: ['schedules', childId],
    queryFn: async () => {
      if (!childId) return [];

      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('child_id', childId)
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as Schedule[];
    },
    enabled: !!childId,
  });

  const addSchedule = useMutation({
    mutationFn: async (schedule: Omit<Schedule, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          ...schedule,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const updateSchedule = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Schedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Schedule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  const deleteSchedule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });

  return {
    schedules,
    isLoading,
    error,
    addSchedule,
    updateSchedule,
    deleteSchedule,
  };
}
