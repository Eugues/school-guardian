import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Subject } from '@/types/database';

interface AddHomeworkDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (homework: {
    title: string;
    description: string | null;
    due_date: string;
    subject_id: string | null;
    child_id: string;
  }) => Promise<void>;
  childId: string;
  subjects: Subject[];
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    due_date: string;
    subject_id: string | null;
  };
}

export function AddHomeworkDialog({
  open,
  onOpenChange,
  onSubmit,
  childId,
  subjects,
  initialData,
}: AddHomeworkDialogProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dueDate, setDueDate] = useState<Date>(
    initialData?.due_date ? new Date(initialData.due_date) : new Date()
  );
  const [subjectId, setSubjectId] = useState<string>(initialData?.subject_id || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        subject_id: subjectId || null,
        child_id: childId,
      });

      // Reset form
      if (!initialData) {
        setTitle('');
        setDescription('');
        setDueDate(new Date());
        setSubjectId('');
      }
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Tarefa' : 'Nova Tarefa'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Exercícios de matemática"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Matéria</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar matéria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhuma</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: subject.color }}
                      />
                      {subject.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes da tarefa..."
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label>Data de Entrega *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'dd/MM/yyyy') : 'Selecionar data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={(d) => d && setDueDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? 'Salvando...' : initialData ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
