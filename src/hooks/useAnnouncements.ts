import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Announcement } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useAnnouncements(childId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: announcements = [], isLoading, error } = useQuery({
    queryKey: ['announcements', childId],
    queryFn: async () => {
      if (!childId) return [];

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Announcement[];
    },
    enabled: !!childId,
  });

  const addAnnouncement = useMutation({
    mutationFn: async (announcement: Omit<Announcement, 'id' | 'created_at' | 'created_by'>) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          ...announcement,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const updateAnnouncement = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Announcement> & { id: string }) => {
      const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Announcement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
  });

  return {
    announcements,
    isLoading,
    error,
    addAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
  };
}
