import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useChildren } from '@/hooks/useChildren';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ChildContextType {
  selectedChildId: string | null;
  setSelectedChildId: (id: string | null) => void;
  activeChildId: string | undefined;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export function ChildProvider({ children }: { children: ReactNode }) {
  const { userRole, user } = useAuth();
  const { children: childrenList } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [linkedChildId, setLinkedChildId] = useState<string | null>(null);

  // For child users, get their linked child_id
  useEffect(() => {
    async function getLinkedChild() {
      if (userRole === 'child' && user) {
        const { data } = await supabase
          .from('child_user_link')
          .select('child_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data) {
          setLinkedChildId(data.child_id);
        }
      }
    }
    getLinkedChild();
  }, [userRole, user]);

  // Determine active child ID
  const activeChildId = userRole === 'child' 
    ? linkedChildId ?? undefined
    : selectedChildId || childrenList[0]?.id;

  return (
    <ChildContext.Provider value={{ selectedChildId, setSelectedChildId, activeChildId }}>
      {children}
    </ChildContext.Provider>
  );
}

export function useChild() {
  const context = useContext(ChildContext);
  if (!context) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
}
