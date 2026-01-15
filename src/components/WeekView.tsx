import { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Schedule, Homework, Exam } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  schedules: Schedule[];
  homework: Homework[];
  exams: Exam[];
  onDayClick?: (date: Date) => void;
}

export function WeekView({ schedules, homework, exams, onDayClick }: WeekViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getItemsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    const daySchedules = schedules.filter((s) =>
      format(new Date(s.start_time), 'yyyy-MM-dd') === dateStr
    );
    
    const dayHomework = homework.filter((h) => h.due_date === dateStr);
    
    const dayExams = exams.filter((e) => e.exam_date === dateStr);

    return { schedules: daySchedules, homework: dayHomework, exams: dayExams };
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Semana
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[140px] text-center">
              {format(weekStart, "d 'de' MMM", { locale: ptBR })} -{' '}
              {format(weekEnd, "d 'de' MMM", { locale: ptBR })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const items = getItemsForDay(day);
            const hasItems =
              items.schedules.length > 0 ||
              items.homework.length > 0 ||
              items.exams.length > 0;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'min-h-[100px] rounded-lg border p-2 cursor-pointer transition-colors hover:bg-muted/50',
                  isToday(day) && 'border-primary bg-primary/5',
                  hasItems && 'border-primary/30'
                )}
                onClick={() => onDayClick?.(day)}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-muted-foreground">
                    {format(day, 'EEE', { locale: ptBR })}
                  </div>
                  <div
                    className={cn(
                      'text-lg font-semibold',
                      isToday(day) && 'text-primary'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                </div>
                <div className="space-y-1">
                  {items.schedules.slice(0, 2).map((s) => (
                    <Badge
                      key={s.id}
                      variant="secondary"
                      className="w-full text-xs truncate justify-start"
                    >
                      {s.title}
                    </Badge>
                  ))}
                  {items.homework.slice(0, 1).map((h) => (
                    <Badge
                      key={h.id}
                      variant="outline"
                      className={cn(
                        'w-full text-xs truncate justify-start',
                        h.completed && 'line-through opacity-50'
                      )}
                    >
                      📚 {h.title}
                    </Badge>
                  ))}
                  {items.exams.slice(0, 1).map((e) => (
                    <Badge
                      key={e.id}
                      className="w-full text-xs truncate justify-start bg-accent"
                    >
                      📝 {e.title}
                    </Badge>
                  ))}
                  {(items.schedules.length > 2 ||
                    items.homework.length > 1 ||
                    items.exams.length > 1) && (
                    <span className="text-xs text-muted-foreground">
                      +mais...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
