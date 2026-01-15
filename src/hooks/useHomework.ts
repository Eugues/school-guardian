import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Homework } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useHomework(childId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: homework = [], isLoading, error } = useQuery({
    queryKey: ['homework', childId],
    queryFn: async () => {
      if (!childId) return [];

      const { data, error } = await supabase
        .from('homework')
        .select('*, subject:subjects(*)')
        .eq('child_id', childId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as Homework[];
    },
    enabled: !!childId,
  });

  const addHomework = useMutation({
    mutationFn: async (hw: Omit<Homework, 'id' | 'created_at' | 'updated_at' | 'completed' | 'completed_at' | 'subject'>) => {
      const { data, error } = await supabase
        .from('homework')
        .insert({
          ...hw,
          created_by: user?.id,
        })
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Homework;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
  });

  const updateHomework = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Homework> & { id: string }) => {
      const { data, error } = await supabase
        .from('homework')
        .update(updates)
        .eq('id', id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Homework;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
  });

  const toggleComplete = useMutation({
    mutationFn: async ({ id, completed }: { id: string; completed: boolean }) => {
      const { data, error } = await supabase
        .from('homework')
        .update({
          completed,
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Homework;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
  });

  const deleteHomework = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('homework')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
    },
  });

  return {
    homework,
    isLoading,
    error,
    addHomework,
    updateHomework,
    toggleComplete,
    deleteHomework,
  };
}
