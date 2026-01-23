import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exam } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useExams(childId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: exams = [], isLoading, error } = useQuery({
    queryKey: ['exams', childId],
    queryFn: async () => {
      if (!childId) return [];

      const { data, error } = await supabase
        .from('exams')
        .select('*, subject:subjects(*)')
        .eq('child_id', childId)
        .order('exam_date', { ascending: true });

      if (error) throw error;
      return data as Exam[];
    },
    enabled: !!childId,
  });

  const addExam = useMutation({
    mutationFn: async (exam: Omit<Exam, 'id' | 'created_at' | 'updated_at' | 'subject' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('exams')
        .insert({
          ...exam,
          created_by: user?.id,
        })
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });

  const updateExam = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Exam> & { id: string }) => {
      const { data, error } = await supabase
        .from('exams')
        .update(updates)
        .eq('id', id)
        .select('*, subject:subjects(*)')
        .single();

      if (error) throw error;
      return data as Exam;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });

  const deleteExam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });

  return {
    exams,
    isLoading,
    error,
    addExam,
    updateExam,
    deleteExam,
  };
}
