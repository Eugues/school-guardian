import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Child } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';

export function useChildren() {
  const { user, userRole } = useAuth();
  const queryClient = useQueryClient();

  const { data: children = [], isLoading, error } = useQuery({
    queryKey: ['children', user?.id],
    queryFn: async () => {
      if (!user) return [];

      if (userRole === 'child') {
        // For child users, get the linked child
        const { data: linkData } = await supabase
          .from('child_user_link')
          .select('child_id')
          .eq('user_id', user.id)
          .single();

        if (linkData) {
          const { data, error } = await supabase
            .from('children')
            .select('*')
            .eq('id', linkData.child_id);

          if (error) throw error;
          return data as Child[];
        }
        return [];
      }

      // For parents, get all their children
      const { data: parentChildData } = await supabase
        .from('parent_child')
        .select('child_id')
        .eq('parent_id', user.id);

      if (!parentChildData || parentChildData.length === 0) return [];

      const childIds = parentChildData.map((pc) => pc.child_id);
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .in('id', childIds);

      if (error) throw error;
      return data as Child[];
    },
    enabled: !!user,
  });

  const addChild = useMutation({
    mutationFn: async (child: Omit<Child, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('Not authenticated');

      // Create child
      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert(child)
        .select()
        .single();

      if (childError) throw childError;

      // Create parent-child relationship
      const { error: relationError } = await supabase
        .from('parent_child')
        .insert({
          parent_id: user.id,
          child_id: childData.id,
        });

      if (relationError) throw relationError;

      return childData as Child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });

  const updateChild = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Child> & { id: string }) => {
      const { data, error } = await supabase
        .from('children')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Child;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });

  const deleteChild = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });

  return {
    children,
    isLoading,
    error,
    addChild,
    updateChild,
    deleteChild,
  };
}
