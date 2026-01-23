import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';

interface AddAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (announcement: {
    title: string;
    content: string | null;
    important: boolean;
    child_id: string;
  }) => Promise<void>;
  childId: string;
  initialData?: {
    id: string;
    title: string;
    content: string | null;
    important: boolean;
  };
}

export function AddAnnouncementDialog({
  open,
  onOpenChange,
  onSubmit,
  childId,
  initialData,
}: AddAnnouncementDialogProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [important, setImportant] = useState(initialData?.important || false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        content: content.trim() || null,
        important,
        child_id: childId,
      });

      // Reset form
      if (!initialData) {
        setTitle('');
        setContent('');
        setImportant(false);
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
            {initialData ? 'Editar Aviso' : 'Novo Aviso'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Reunião de pais"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Conteúdo</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detalhes do aviso..."
              maxLength={1000}
              rows={4}
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="important"
              checked={important}
              onCheckedChange={setImportant}
            />
            <Label htmlFor="important" className="text-sm">
              Marcar como importante
            </Label>
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
