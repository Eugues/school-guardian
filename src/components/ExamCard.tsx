import { Exam } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format, isPast, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pencil, Trash2, Calendar, FileText, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExamCardProps {
  exam: Exam;
  onEdit?: (exam: Exam) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

export function ExamCard({ exam, onEdit, onDelete, showActions = false }: ExamCardProps) {
  const examDate = new Date(exam.exam_date + 'T00:00:00');
  const isPastDate = isPast(examDate) && !isToday(examDate);
  const isExamToday = isToday(examDate);

  return (
    <Card
      className={cn(
        'transition-all',
        isPastDate && !exam.grade && 'opacity-60',
        isExamToday && 'border-accent/50 bg-accent/5'
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg',
              exam.exam_type === 'prova' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'
            )}
          >
            {exam.exam_type === 'prova' ? (
              <FileText className="w-5 h-5" />
            ) : (
              <ClipboardList className="w-5 h-5" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium">{exam.title}</h4>
              <Badge variant={exam.exam_type === 'prova' ? 'default' : 'secondary'}>
                {exam.exam_type === 'prova' ? 'Prova' : 'Trabalho'}
              </Badge>
              {exam.subject && (
                <Badge
                  variant="outline"
                  style={{ borderColor: exam.subject.color, color: exam.subject.color }}
                >
                  {exam.subject.name}
                </Badge>
              )}
            </div>
            {exam.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {exam.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <Badge
                variant={isExamToday ? 'default' : isPastDate ? 'secondary' : 'outline'}
                className="text-xs"
              >
                <Calendar className="w-3 h-3 mr-1" />
                {isExamToday ? 'Hoje' : format(examDate, "d 'de' MMM", { locale: ptBR })}
              </Badge>
              {exam.grade !== null && (
                <Badge className="text-xs bg-success text-success-foreground">
                  Nota: {exam.grade}
                </Badge>
              )}
            </div>
          </div>
          {showActions && (
            <div className="flex gap-1">
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={() => onEdit(exam)}>
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(exam.id)}
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
