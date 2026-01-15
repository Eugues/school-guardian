import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Subject } from '@/types/database';

export function useSubjects(childId?: string) {
  const queryClient = useQueryClient();

  const { data: subjects = [], isLoading, error } = useQuery({
    queryKey: ['subjects', childId],
    queryFn: async () => {
      if (!childId) return [];

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('child_id', childId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Subject[];
    },
    enabled: !!childId,
  });

  const addSubject = useMutation({
    mutationFn: async (subject: Omit<Subject, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('subjects')
        .insert(subject)
        .select()
        .single();

      if (error) throw error;
      return data as Subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const updateSubject = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Subject> & { id: string }) => {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Subject;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  const deleteSubject = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
  });

  return {
    subjects,
    isLoading,
    error,
    addSubject,
    updateSubject,
    deleteSubject,
  };
}
