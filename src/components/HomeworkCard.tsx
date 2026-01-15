import { Homework } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HomeworkCardProps {
  homework: Homework;
  onToggleComplete: (id: string, completed: boolean) => void;
  onEdit?: (homework: Homework) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function HomeworkCard({
  homework,
  onToggleComplete,
  onEdit,
  onDelete,
  showActions = false,
}: HomeworkCardProps) {
  const dueDate = new Date(homework.due_date + 'T00:00:00');
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && !homework.completed;
  const isDueToday = isToday(dueDate);

  return (
    <Card
      className={cn(
        'transition-all',
        homework.completed && 'opacity-60',
        isOverdue && 'border-destructive/50 bg-destructive/5'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={homework.completed}
            onCheckedChange={(checked) =>
              onToggleComplete(homework.id, checked as boolean)
            }
            className="mt-1"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={cn(
                  'font-medium',
                  homework.completed && 'line-through text-muted-foreground'
                )}
              >
                {homework.title}
              </h4>
              {homework.subject && (
                <Badge
                  variant="outline"
                  style={{ borderColor: homework.subject.color, color: homework.subject.color }}
                >
                  {homework.subject.name}
                </Badge>
              )}
            </div>
            {homework.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {homework.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant={isOverdue ? 'destructive' : isDueToday ? 'default' : 'secondary'}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                {isDueToday
                  ? 'Hoje'
                  : format(dueDate, "d 'de' MMM", { locale: ptBR })}
              </Badge>
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(homework)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(homework.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
