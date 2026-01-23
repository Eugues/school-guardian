import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface AddScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (schedule: {
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    all_day: boolean;
    child_id: string;
  }) => Promise<void>;
  childId: string;
  initialData?: {
    id: string;
    title: string;
    description: string | null;
    start_time: string;
    end_time: string | null;
    all_day: boolean;
  };
}

export function AddScheduleDialog({
  open,
  onOpenChange,
  onSubmit,
  childId,
  initialData,
}: AddScheduleDialogProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [date, setDate] = useState<Date>(
    initialData?.start_time ? new Date(initialData.start_time) : new Date()
  );
  const [startTime, setStartTime] = useState(
    initialData?.start_time
      ? format(new Date(initialData.start_time), 'HH:mm')
      : '08:00'
  );
  const [endTime, setEndTime] = useState(
    initialData?.end_time
      ? format(new Date(initialData.end_time), 'HH:mm')
      : '09:00'
  );
  const [allDay, setAllDay] = useState(initialData?.all_day || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const startDateTime = allDay
        ? `${dateStr}T00:00:00`
        : `${dateStr}T${startTime}:00`;
      const endDateTime = allDay
        ? null
        : `${dateStr}T${endTime}:00`;

      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        start_time: startDateTime,
        end_time: endDateTime,
        all_day: allDay,
        child_id: childId,
      });

      // Reset form
      if (!initialData) {
        setTitle('');
        setDescription('');
        setDate(new Date());
        setStartTime('08:00');
        setEndTime('09:00');
        setAllDay(false);
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
            {initialData ? 'Editar Evento' : 'Novo Evento na Agenda'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Aula de natação"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detalhes do evento..."
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label>Data *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd/MM/yyyy') : 'Selecionar data'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="all-day"
              checked={allDay}
              onCheckedChange={setAllDay}
            />
            <Label htmlFor="all-day">Dia inteiro</Label>
          </div>

          {!allDay && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Início</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="start-time"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">Término</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="end-time"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          )}

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
