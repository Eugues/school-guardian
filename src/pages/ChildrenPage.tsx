import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useChild } from '@/contexts/ChildContext';
import { useChildren } from '@/hooks/useChildren';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChildCard } from '@/components/ChildCard';
import { AddChildDialog } from '@/components/AddChildDialog';
import { ConfirmDeleteDialog } from '@/components/dialogs/ConfirmDeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  GraduationCap,
  Calendar,
  School,
} from 'lucide-react';

export default function ChildrenPage() {
  const { userRole } = useAuth();
  const { setSelectedChildId } = useChild();
  const { children, isLoading, addChild, updateChild, deleteChild } = useChildren();
  
  const [addOpen, setAddOpen] = useState(false);
  const [editChild, setEditChild] = useState<typeof children[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isParent = userRole === 'parent';

  const handleDelete = async () => {
    if (deleteId) {
      await deleteChild.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (!isParent) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="w-16 h-16 mb-4 opacity-50" />
          <p>Apenas pais podem acessar esta página</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
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
              <Users className="w-7 h-7 text-primary" />
              Meus Filhos
            </h1>
            <p className="text-muted-foreground">
              Gerencie os perfis dos seus filhos
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Filho
          </Button>
        </div>

        {/* Children Grid */}
        {children.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Nenhum filho cadastrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione seu primeiro filho para começar
              </p>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Filho
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {children.map(child => (
              <Card key={child.id} className="group relative overflow-hidden">
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setEditChild(child)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => setDeleteId(child.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary text-lg font-bold">
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{child.name}</CardTitle>
                      {child.grade && (
                        <p className="text-sm text-muted-foreground">{child.grade}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  {child.school_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <School className="w-4 h-4 text-muted-foreground" />
                      <span>{child.school_name}</span>
                    </div>
                  )}
                  
                  {child.birth_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        Nascimento: {format(new Date(child.birth_date), "d 'de' MMMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  )}
                  
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setSelectedChildId(child.id)}
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <AddChildDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={async (data) => {
          await addChild.mutateAsync(data);
        }}
      />

      {/* Edit Dialog */}
      {editChild && (
        <AddChildDialog
          open={!!editChild}
          onOpenChange={(open) => !open && setEditChild(null)}
          initialData={editChild}
          onSubmit={async (data) => {
            await updateChild.mutateAsync({ id: editChild.id, ...data });
            setEditChild(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir filho"
        description="Tem certeza que deseja remover este filho? Todos os dados associados (tarefas, provas, agenda) serão perdidos permanentemente."
        loading={deleteChild.isPending}
      />
    </DashboardLayout>
  );
}
