import { useState } from 'react';
import { format, isToday, isTomorrow, startOfDay, addDays, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useChild } from '@/contexts/ChildContext';
import { useHomework } from '@/hooks/useHomework';
import { useSubjects } from '@/hooks/useSubjects';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AddHomeworkDialog } from '@/components/dialogs/AddHomeworkDialog';
import { AddSubjectDialog } from '@/components/dialogs/AddSubjectDialog';
import { ConfirmDeleteDialog } from '@/components/dialogs/ConfirmDeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Palette,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function HomeworkPage() {
  const { userRole } = useAuth();
  const { activeChildId } = useChild();
  const { homework, isLoading, addHomework, updateHomework, toggleComplete, deleteHomework } = useHomework(activeChildId);
  const { subjects, addSubject, deleteSubject } = useSubjects(activeChildId);
  
  const [tab, setTab] = useState('pending');
  const [addOpen, setAddOpen] = useState(false);
  const [addSubjectOpen, setAddSubjectOpen] = useState(false);
  const [editHomework, setEditHomework] = useState<typeof homework[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string | null>(null);

  const isParent = userRole === 'parent';
  const today = startOfDay(new Date());

  // Filter homework
  const pendingHomework = homework.filter(h => !h.completed);
  const completedHomework = homework.filter(h => h.completed);

  // Group by date
  const groupByDate = (items: typeof homework) => {
    const groups: { [key: string]: typeof homework } = {};
    items.forEach(item => {
      const dateKey = item.due_date;
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteHomework.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleDeleteSubject = async () => {
    if (deleteSubjectId) {
      await deleteSubject.mutateAsync(deleteSubjectId);
      setDeleteSubjectId(null);
    }
  };

  if (!activeChildId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <BookOpen className="w-16 h-16 mb-4 opacity-50" />
          <p>Selecione um filho para ver as tarefas</p>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
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
              <BookOpen className="w-7 h-7 text-primary" />
              Tarefas
            </h1>
            <p className="text-muted-foreground">
              Gerencie as tarefas de casa
            </p>
          </div>
          {isParent && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setAddSubjectOpen(true)}>
                <Palette className="w-4 h-4 mr-2" />
                Matérias
              </Button>
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Tarefa
              </Button>
            </div>
          )}
        </div>

        {/* Subjects */}
        {subjects.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {subjects.map(subject => (
              <Badge
                key={subject.id}
                variant="secondary"
                className="gap-2 pr-1"
                style={{ 
                  backgroundColor: `${subject.color}20`,
                  borderColor: subject.color,
                  color: subject.color
                }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
                {isParent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 hover:bg-transparent hover:text-destructive"
                    onClick={() => setDeleteSubjectId(subject.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="w-4 h-4" />
              Pendentes ({pendingHomework.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Concluídas ({completedHomework.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6 mt-6">
            {pendingHomework.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <CheckCircle2 className="w-16 h-16 text-success mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Tudo em dia! 🎉</h3>
                  <p className="text-muted-foreground">Nenhuma tarefa pendente</p>
                </CardContent>
              </Card>
            ) : (
              groupByDate(pendingHomework).map(([dateStr, items]) => {
                const isOverdue = isPast(new Date(dateStr)) && !isToday(new Date(dateStr));
                return (
                  <div key={dateStr}>
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className={cn(
                        'font-semibold capitalize',
                        isOverdue && 'text-destructive'
                      )}>
                        {formatDateLabel(dateStr)}
                      </h3>
                      {isOverdue && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Atrasada
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-3">
                      {items.map(hw => (
                        <Card key={hw.id} className={cn(
                          'group',
                          isOverdue && 'border-destructive/50'
                        )}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Checkbox
                                checked={hw.completed}
                                onCheckedChange={(checked) => 
                                  toggleComplete.mutate({ id: hw.id, completed: !!checked })
                                }
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="font-medium">{hw.title}</h4>
                                    {hw.description && (
                                      <p className="text-sm text-muted-foreground mt-1">
                                        {hw.description}
                                      </p>
                                    )}
                                  </div>
                                  {isParent && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => setEditHomework(hw)}
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => setDeleteId(hw.id)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                                {hw.subject && (
                                  <Badge
                                    variant="secondary"
                                    className="mt-2"
                                    style={{
                                      backgroundColor: `${hw.subject.color}20`,
                                      borderColor: hw.subject.color,
                                      color: hw.subject.color
                                    }}
                                  >
                                    {hw.subject.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6 mt-6">
            {completedHomework.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">Nenhuma tarefa concluída</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedHomework.map(hw => (
                  <Card key={hw.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Checkbox
                          checked={hw.completed}
                          onCheckedChange={(checked) =>
                            toggleComplete.mutate({ id: hw.id, completed: !!checked })
                          }
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium line-through text-muted-foreground">
                            {hw.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            Concluída em {hw.completed_at && format(new Date(hw.completed_at), "d 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Homework Dialog */}
      {activeChildId && (
        <AddHomeworkDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          childId={activeChildId}
          subjects={subjects}
          onSubmit={async (data) => {
            await addHomework.mutateAsync(data);
          }}
        />
      )}

      {/* Edit Homework Dialog */}
      {editHomework && activeChildId && (
        <AddHomeworkDialog
          open={!!editHomework}
          onOpenChange={(open) => !open && setEditHomework(null)}
          childId={activeChildId}
          subjects={subjects}
          initialData={editHomework}
          onSubmit={async (data) => {
            await updateHomework.mutateAsync({ id: editHomework.id, ...data });
            setEditHomework(null);
          }}
        />
      )}

      {/* Add Subject Dialog */}
      {activeChildId && (
        <AddSubjectDialog
          open={addSubjectOpen}
          onOpenChange={setAddSubjectOpen}
          childId={activeChildId}
          onSubmit={async (data) => {
            await addSubject.mutateAsync(data);
          }}
        />
      )}

      {/* Delete Homework Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir tarefa"
        description="Tem certeza que deseja excluir esta tarefa?"
        loading={deleteHomework.isPending}
      />

      {/* Delete Subject Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteSubjectId}
        onOpenChange={(open) => !open && setDeleteSubjectId(null)}
        onConfirm={handleDeleteSubject}
        title="Excluir matéria"
        description="Tem certeza que deseja excluir esta matéria? As tarefas associadas perderão a vinculação."
        loading={deleteSubject.isPending}
      />
    </DashboardLayout>
  );
}
