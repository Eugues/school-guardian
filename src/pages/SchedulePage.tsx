import { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, startOfMonth, endOfMonth, addMonths, subMonths, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { useChild } from '@/contexts/ChildContext';
import { useSchedules } from '@/hooks/useSchedules';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AddScheduleDialog } from '@/components/dialogs/AddScheduleDialog';
import { ConfirmDeleteDialog } from '@/components/dialogs/ConfirmDeleteDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewType = 'day' | 'week' | 'month';

export default function SchedulePage() {
  const { userRole } = useAuth();
  const { activeChildId } = useChild();
  const { schedules, isLoading, addSchedule, updateSchedule, deleteSchedule } = useSchedules(activeChildId);
  
  const [view, setView] = useState<ViewType>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addOpen, setAddOpen] = useState(false);
  const [editSchedule, setEditSchedule] = useState<typeof schedules[0] | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const isParent = userRole === 'parent';

  const goToToday = () => setCurrentDate(new Date());
  const goPrev = () => {
    if (view === 'day') setCurrentDate(d => new Date(d.setDate(d.getDate() - 1)));
    else if (view === 'week') setCurrentDate(d => subWeeks(d, 1));
    else setCurrentDate(d => subMonths(d, 1));
  };
  const goNext = () => {
    if (view === 'day') setCurrentDate(d => new Date(d.setDate(d.getDate() + 1)));
    else if (view === 'week') setCurrentDate(d => addWeeks(d, 1));
    else setCurrentDate(d => addMonths(d, 1));
  };

  // Get days based on view
  const getDays = () => {
    if (view === 'day') return [currentDate];
    if (view === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 0 });
      const end = endOfWeek(currentDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    }
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const days = getDays();

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(s => {
      const scheduleDate = new Date(s.start_time);
      return isSameDay(scheduleDate, day);
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSchedule.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  if (!activeChildId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Calendar className="w-16 h-16 mb-4 opacity-50" />
          <p>Selecione um filho para ver a agenda</p>
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
              <Calendar className="w-7 h-7 text-primary" />
              Agenda
            </h1>
            <p className="text-muted-foreground">
              Gerencie os eventos e compromissos
            </p>
          </div>
          {isParent && (
            <Button onClick={() => setAddOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          )}
        </div>

        {/* Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={goPrev}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Hoje
                </Button>
                <Button variant="outline" size="icon" onClick={goNext}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <span className="ml-2 font-medium text-lg">
                  {view === 'month'
                    ? format(currentDate, 'MMMM yyyy', { locale: ptBR })
                    : view === 'week'
                    ? `${format(days[0], 'd MMM', { locale: ptBR })} - ${format(days[days.length - 1], 'd MMM', { locale: ptBR })}`
                    : format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </span>
              </div>
              <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
                <TabsList>
                  <TabsTrigger value="day">Dia</TabsTrigger>
                  <TabsTrigger value="week">Semana</TabsTrigger>
                  <TabsTrigger value="month">Mês</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Calendar View */}
        {view === 'month' ? (
          <div className="grid grid-cols-7 gap-1">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                {day}
              </div>
            ))}
            {/* Padding for first week */}
            {Array.from({ length: days[0].getDay() }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}
            {days.map(day => {
              const daySchedules = getSchedulesForDay(day);
              return (
                <Card
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[100px] p-2 cursor-pointer hover:bg-muted/50 transition-colors',
                    isToday(day) && 'ring-2 ring-primary'
                  )}
                  onClick={() => {
                    setCurrentDate(day);
                    setView('day');
                  }}
                >
                  <div className={cn(
                    'text-sm font-medium',
                    isToday(day) ? 'text-primary' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1 mt-1">
                    {daySchedules.slice(0, 2).map(s => (
                      <div
                        key={s.id}
                        className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 truncate"
                      >
                        {s.title}
                      </div>
                    ))}
                    {daySchedules.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{daySchedules.length - 2} mais
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : view === 'week' ? (
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {days.map(day => {
              const daySchedules = getSchedulesForDay(day);
              return (
                <Card
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[150px]',
                    isToday(day) && 'ring-2 ring-primary'
                  )}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className={cn(
                      'text-sm',
                      isToday(day) ? 'text-primary' : ''
                    )}>
                      {format(day, 'EEE d', { locale: ptBR })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    {daySchedules.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Sem eventos</p>
                    ) : (
                      daySchedules.map(s => (
                        <div
                          key={s.id}
                          className="group relative p-2 rounded-lg bg-primary/10 border border-primary/20"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{s.title}</p>
                              {!s.all_day && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {format(new Date(s.start_time), 'HH:mm')}
                                  {s.end_time && ` - ${format(new Date(s.end_time), 'HH:mm')}`}
                                </p>
                              )}
                              {s.all_day && (
                                <Badge variant="secondary" className="text-xs">Dia inteiro</Badge>
                              )}
                            </div>
                            {isParent && (
                              <div className="hidden group-hover:flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => { e.stopPropagation(); setEditSchedule(s); }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-destructive"
                                  onClick={(e) => { e.stopPropagation(); setDeleteId(s.id); }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{format(currentDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</CardTitle>
            </CardHeader>
            <CardContent>
              {getSchedulesForDay(currentDate).length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum evento para este dia</p>
                  {isParent && (
                    <Button className="mt-4" onClick={() => setAddOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Evento
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {getSchedulesForDay(currentDate).map(s => (
                    <div
                      key={s.id}
                      className="group flex items-start justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium">{s.title}</h3>
                        {s.description && (
                          <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {s.all_day ? (
                            <Badge variant="secondary">Dia inteiro</Badge>
                          ) : (
                            <Badge variant="outline" className="gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(s.start_time), 'HH:mm')}
                              {s.end_time && ` - ${format(new Date(s.end_time), 'HH:mm')}`}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {isParent && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditSchedule(s)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => setDeleteId(s.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Dialog */}
      {activeChildId && (
        <AddScheduleDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          childId={activeChildId}
          onSubmit={async (data) => {
            await addSchedule.mutateAsync(data);
          }}
        />
      )}

      {/* Edit Dialog */}
      {editSchedule && activeChildId && (
        <AddScheduleDialog
          open={!!editSchedule}
          onOpenChange={(open) => !open && setEditSchedule(null)}
          childId={activeChildId}
          initialData={editSchedule}
          onSubmit={async (data) => {
            await updateSchedule.mutateAsync({ id: editSchedule.id, ...data });
            setEditSchedule(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir evento"
        description="Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita."
        loading={deleteSchedule.isPending}
      />
    </DashboardLayout>
  );
}
