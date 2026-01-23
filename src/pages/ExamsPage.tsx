import { useState } from 'react';
import { format, isPast, isToday, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useChild } from '@/contexts/ChildContext';
import { useExams } from '@/hooks/useExams';
import { useSubjects } from '@/hooks/useSubjects';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AddExamDialog } from '@/components/dialogs/AddExamDialog';
import { ConfirmDeleteDialog } from '@/components/dialogs/ConfirmDeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  FileText,
  Edit2,
  Trash2,
  Calendar,
  Trophy,
  Clock,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ExamsPage() {
  const { userRole } = useAuth();
  const { activeChildId } = useChild();
  const { exams, isLoading, addExam, updateExam, deleteExam } = useExams(activeChildId);
  const { subjects } = useSubjects(activeChildId);
  
  const [tab, setTab] = useState('upcoming');
  const [addOpen, setAddOpen] = useState(false);
  const [editExam, setEditExam] = useState<typeof exams[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isParent = userRole === 'parent';

  // Filter exams
  const upcomingExams = exams.filter(e => isFuture(new Date(e.exam_date)) || isToday(new Date(e.exam_date)));
  const pastExams = exams.filter(e => isPast(new Date(e.exam_date)) && !isToday(new Date(e.exam_date)));
  const gradedExams = pastExams.filter(e => e.grade !== null);
  const averageGrade = gradedExams.length > 0
    ? gradedExams.reduce((acc, e) => acc + (e.grade || 0), 0) / gradedExams.length
    : null;

  const handleDelete = async () => {
    if (deleteId) {
      await deleteExam.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 7) return 'text-success';
    if (grade >= 5) return 'text-warning';
    return 'text-destructive';
  };

  if (!activeChildId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <FileText className="w-16 h-16 mb-4 opacity-50" />
          <p>Selecione um filho para ver as provas</p>
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
              <FileText className="w-7 h-7 text-primary" />
              Provas e Trabalhos
            </h1>
            <p className="text-muted-foreground">
              Acompanhe avaliações e notas
            </p>
          </div>
          {isParent && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Prova
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingExams.length}</p>
                  <p className="text-sm text-muted-foreground">Próximas provas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <Trophy className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {averageGrade !== null ? averageGrade.toFixed(1) : '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">Média geral</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <History className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{gradedExams.length}</p>
                  <p className="text-sm text-muted-foreground">Com nota</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              <Calendar className="w-4 h-4" />
              Próximas ({upcomingExams.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2">
              <History className="w-4 h-4" />
              Histórico ({pastExams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingExams.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <FileText className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma prova agendada</h3>
                  <p className="text-muted-foreground">Relaxe por enquanto! 😊</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingExams.map(exam => {
                  const examDate = new Date(exam.exam_date);
                  const daysUntil = Math.ceil((examDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <Card key={exam.id} className="group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium">{exam.title}</h3>
                              <Badge variant={exam.exam_type === 'prova' ? 'default' : 'secondary'}>
                                {exam.exam_type === 'prova' ? 'Prova' : 'Trabalho'}
                              </Badge>
                              {exam.subject && (
                                <Badge
                                  variant="outline"
                                  style={{
                                    backgroundColor: `${exam.subject.color}20`,
                                    borderColor: exam.subject.color,
                                    color: exam.subject.color
                                  }}
                                >
                                  {exam.subject.name}
                                </Badge>
                              )}
                            </div>
                            {exam.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {exam.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-3 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>{format(examDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
                              {daysUntil >= 0 && (
                                <Badge variant="outline" className={cn(
                                  daysUntil <= 3 && 'border-destructive text-destructive'
                                )}>
                                  {daysUntil === 0 ? 'Hoje!' : `${daysUntil} dias`}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {isParent && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditExam(exam)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive"
                                onClick={() => setDeleteId(exam.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastExams.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <History className="w-16 h-16 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">Nenhuma prova no histórico</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {pastExams.map(exam => (
                  <Card key={exam.id} className="group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">{exam.title}</h3>
                            <Badge variant={exam.exam_type === 'prova' ? 'default' : 'secondary'}>
                              {exam.exam_type === 'prova' ? 'Prova' : 'Trabalho'}
                            </Badge>
                            {exam.subject && (
                              <Badge
                                variant="outline"
                                style={{
                                  backgroundColor: `${exam.subject.color}20`,
                                  borderColor: exam.subject.color,
                                  color: exam.subject.color
                                }}
                              >
                                {exam.subject.name}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(exam.exam_date), "d 'de' MMMM", { locale: ptBR })}
                          </p>
                          
                          {/* Grade */}
                          {exam.grade !== null ? (
                            <div className="mt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">Nota:</span>
                                <span className={cn('text-lg font-bold', getGradeColor(exam.grade))}>
                                  {exam.grade.toFixed(1)}
                                </span>
                              </div>
                              <Progress 
                                value={exam.grade * 10} 
                                className="h-2 mt-1"
                              />
                            </div>
                          ) : isParent ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => setEditExam(exam)}
                            >
                              <Trophy className="w-4 h-4 mr-2" />
                              Adicionar nota
                            </Button>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-2">
                              Nota ainda não disponível
                            </p>
                          )}
                        </div>
                        {isParent && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditExam(exam)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => setDeleteId(exam.id)}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Dialog */}
      {activeChildId && (
        <AddExamDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          childId={activeChildId}
          subjects={subjects}
          onSubmit={async (data) => {
            await addExam.mutateAsync(data);
          }}
        />
      )}

      {/* Edit Dialog */}
      {editExam && activeChildId && (
        <AddExamDialog
          open={!!editExam}
          onOpenChange={(open) => !open && setEditExam(null)}
          childId={activeChildId}
          subjects={subjects}
          initialData={editExam}
          onSubmit={async (data) => {
            await updateExam.mutateAsync({ id: editExam.id, ...data });
            setEditExam(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir prova"
        description="Tem certeza que deseja excluir esta prova/trabalho?"
        loading={deleteExam.isPending}
      />
    </DashboardLayout>
  );
}
