import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChildUserLink } from '@/types/database';

export function useChildUserLink(childId?: string) {
  const queryClient = useQueryClient();

  const { data: link, isLoading } = useQuery({
    queryKey: ['child-user-link', childId],
    queryFn: async () => {
      if (!childId) return null;

      const { data, error } = await supabase
        .from('child_user_link')
        .select('*')
        .eq('child_id', childId)
        .maybeSingle();

      if (error) throw error;
      return data as ChildUserLink | null;
    },
    enabled: !!childId,
  });

  const linkChildAccount = useMutation({
    mutationFn: async ({ childId, email }: { childId: string; email: string }) => {
      // First, find the user by email using a custom RPC or edge function
      // Since we can't directly query auth.users, we need to find the user_id
      // through the profiles table or use an edge function
      
      // For now, we'll look up the user through profiles
      // The child user must have already created an account with role 'child'
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .ilike('name', `%${email}%`)
        .limit(1);

      // Actually, we need a better approach - let's use an edge function
      // For now, let's create a simpler flow: generate an invite code
      // that the child can enter when logged in

      throw new Error('Use the invite code system instead');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-user-link'] });
    },
  });

  const linkByUserId = useMutation({
    mutationFn: async ({ childId, userId }: { childId: string; userId: string }) => {
      const { data, error } = await supabase
        .from('child_user_link')
        .insert({
          child_id: childId,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ChildUserLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-user-link'] });
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });

  const unlinkChildAccount = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase
        .from('child_user_link')
        .delete()
        .eq('id', linkId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['child-user-link'] });
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });

  return {
    link,
    isLoading,
    linkByUserId,
    unlinkChildAccount,
  };
}

// Hook to get all links for the parent's children
export function useAllChildLinks(childIds: string[]) {
  return useQuery({
    queryKey: ['child-user-links', childIds],
    queryFn: async () => {
      if (childIds.length === 0) return [];

      const { data, error } = await supabase
        .from('child_user_link')
        .select('*')
        .in('child_id', childIds);

      if (error) throw error;
      return data as ChildUserLink[];
    },
    enabled: childIds.length > 0,
  });
}
