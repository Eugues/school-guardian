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

interface AddExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (exam: {
    title: string;
    description: string | null;
    exam_date: string;
    exam_type: 'prova' | 'trabalho';
    subject_id: string | null;
    grade: number | null;
    child_id: string;
  }) => Promise<void>;
  childId: string;
  subjects: Subject[];
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    exam_date: string;
    exam_type: 'prova' | 'trabalho';
    subject_id: string | null;
    grade: number | null;
  };
}

export function AddExamDialog({
  open,
  onOpenChange,
  onSubmit,
  childId,
  subjects,
  initialData,
}: AddExamDialogProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [examDate, setExamDate] = useState<Date>(
    initialData?.exam_date ? new Date(initialData.exam_date) : new Date()
  );
  const [examType, setExamType] = useState<'prova' | 'trabalho'>(
    initialData?.exam_type || 'prova'
  );
  const [subjectId, setSubjectId] = useState<string>(initialData?.subject_id || '');
  const [grade, setGrade] = useState<string>(
    initialData?.grade !== null && initialData?.grade !== undefined
      ? String(initialData.grade)
      : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        exam_date: format(examDate, 'yyyy-MM-dd'),
        exam_type: examType,
        subject_id: subjectId || null,
        grade: grade ? parseFloat(grade) : null,
        child_id: childId,
      });

      // Reset form
      if (!initialData) {
        setTitle('');
        setDescription('');
        setExamDate(new Date());
        setExamType('prova');
        setSubjectId('');
        setGrade('');
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
            {initialData ? 'Editar Prova/Trabalho' : 'Nova Prova/Trabalho'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Prova de Matemática"
              maxLength={100}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo *</Label>
              <Select value={examType} onValueChange={(v) => setExamType(v as 'prova' | 'trabalho')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prova">Prova</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Matéria</Label>
              <Select value={subjectId} onValueChange={setSubjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar" />
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Conteúdo da prova..."
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !examDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {examDate ? format(examDate, 'dd/MM') : 'Data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={examDate}
                    onSelect={(d) => d && setExamDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Nota (0-10)</Label>
              <Input
                id="grade"
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Nota"
              />
            </div>
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
