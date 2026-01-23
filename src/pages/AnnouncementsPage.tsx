import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useChild } from '@/contexts/ChildContext';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AddAnnouncementDialog } from '@/components/dialogs/AddAnnouncementDialog';
import { ConfirmDeleteDialog } from '@/components/dialogs/ConfirmDeleteDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Bell,
  Edit2,
  Trash2,
  AlertTriangle,
  Megaphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AnnouncementsPage() {
  const { userRole } = useAuth();
  const { activeChildId } = useChild();
  const { announcements, isLoading, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements(activeChildId);
  
  const [addOpen, setAddOpen] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState<typeof announcements[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isParent = userRole === 'parent';

  // Sort: important first, then by date
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.important !== b.important) return b.important ? 1 : -1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleDelete = async () => {
    if (deleteId) {
      await deleteAnnouncement.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (!activeChildId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bell className="w-16 h-16 mb-4 opacity-50" />
          <p>Selecione um filho para ver os avisos</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Bell className="w-7 h-7 text-primary" />
              Avisos
            </h1>
            <p className="text-muted-foreground">
              Comunicados e informações importantes
            </p>
          </div>
          {isParent && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Aviso
            </Button>
          )}
        </div>

        {/* Announcements List */}
        {sortedAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Megaphone className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhum aviso</h3>
              <p className="text-muted-foreground">Não há comunicados no momento</p>
              {isParent && (
                <Button className="mt-4" onClick={() => setAddOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Aviso
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedAnnouncements.map(announcement => (
              <Card
                key={announcement.id}
                className={cn(
                  'group transition-all',
                  announcement.important && 'border-destructive/50 bg-destructive/5'
                )}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {announcement.important && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Importante
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(announcement.created_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      {announcement.content && (
                        <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                          {announcement.content}
                        </p>
                      )}
                    </div>
                    {isParent && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditAnnouncement(announcement)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => setDeleteId(announcement.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      {activeChildId && (
        <AddAnnouncementDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          childId={activeChildId}
          onSubmit={async (data) => {
            await addAnnouncement.mutateAsync(data);
          }}
        />
      )}

      {/* Edit Dialog */}
      {editAnnouncement && activeChildId && (
        <AddAnnouncementDialog
          open={!!editAnnouncement}
          onOpenChange={(open) => !open && setEditAnnouncement(null)}
          childId={activeChildId}
          initialData={editAnnouncement}
          onSubmit={async (data) => {
            await updateAnnouncement.mutateAsync({ id: editAnnouncement.id, ...data });
            setEditAnnouncement(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir aviso"
        description="Tem certeza que deseja excluir este aviso?"
        loading={deleteAnnouncement.isPending}
      />
    </DashboardLayout>
  );
}
