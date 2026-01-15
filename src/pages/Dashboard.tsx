import { useState } from 'react';
import { format, isToday, isTomorrow, startOfDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useChildren } from '@/hooks/useChildren';
import { useHomework } from '@/hooks/useHomework';
import { useExams } from '@/hooks/useExams';
import { useSchedules } from '@/hooks/useSchedules';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ChildCard } from '@/components/ChildCard';
import { AddChildDialog } from '@/components/AddChildDialog';
import { HomeworkCard } from '@/components/HomeworkCard';
import { ExamCard } from '@/components/ExamCard';
import { WeekView } from '@/components/WeekView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Calendar,
  BookOpen,
  FileText,
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function Dashboard() {
  const { profile, userRole } = useAuth();
  const { children, isLoading: loadingChildren, addChild } = useChildren();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [addChildOpen, setAddChildOpen] = useState(false);

  const activeChildId = selectedChildId || children[0]?.id;

  const { homework, toggleComplete } = useHomework(activeChildId);
  const { exams } = useExams(activeChildId);
  const { schedules } = useSchedules(activeChildId);

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const nextWeek = addDays(today, 7);

  // Filter today's and upcoming items
  const todaysHomework = homework.filter(
    (h) => !h.completed && h.due_date === format(today, 'yyyy-MM-dd')
  );
  const upcomingHomework = homework.filter(
    (h) => !h.completed && new Date(h.due_date) > today && new Date(h.due_date) <= nextWeek
  );
  const completedToday = homework.filter(
    (h) => h.completed && h.completed_at && isToday(new Date(h.completed_at))
  );

  const upcomingExams = exams.filter(
    (e) => new Date(e.exam_date) >= today && new Date(e.exam_date) <= nextWeek
  );

  const todaysSchedules = schedules.filter(
    (s) => format(new Date(s.start_time), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
  );

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  if (loadingChildren) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {greeting()}, {profile?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>

        {/* Children Selection (for parents) */}
        {userRole === 'parent' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Seus Filhos</h2>
              <Button onClick={() => setAddChildOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Filho
              </Button>
            </div>
            {children.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <Sparkles className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhum filho cadastrado</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Adicione seu primeiro filho para começar a acompanhar a vida escolar
                  </p>
                  <Button onClick={() => setAddChildOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Filho
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <ChildCard
                    key={child.id}
                    child={child}
                    selected={activeChildId === child.id}
                    onClick={() => setSelectedChildId(child.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeChildId && (
          <>
            {/* Quick Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{todaysHomework.length}</p>
                      <p className="text-sm text-muted-foreground">Tarefas hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                      <FileText className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{upcomingExams.length}</p>
                      <p className="text-sm text-muted-foreground">Provas esta semana</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary/20">
                      <Calendar className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{todaysSchedules.length}</p>
                      <p className="text-sm text-muted-foreground">Eventos hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-success/20">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{completedToday.length}</p>
                      <p className="text-sm text-muted-foreground">Concluídas hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Week View */}
            <WeekView
              schedules={schedules}
              homework={homework}
              exams={exams}
            />

            {/* Today's Tasks */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Tarefas de Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todaysHomework.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma tarefa para hoje! 🎉</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {todaysHomework.map((hw) => (
                        <HomeworkCard
                          key={hw.id}
                          homework={hw}
                          onToggleComplete={(id, completed) =>
                            toggleComplete.mutate({ id, completed })
                          }
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    Próximas Provas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingExams.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Nenhuma prova agendada</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingExams.slice(0, 3).map((exam) => (
                        <ExamCard key={exam.id} exam={exam} />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>

      <AddChildDialog
        open={addChildOpen}
        onOpenChange={setAddChildOpen}
        onSubmit={async (child) => {
          await addChild.mutateAsync(child);
        }}
      />
    </DashboardLayout>
  );
}
