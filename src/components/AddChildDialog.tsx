import { useState } from 'react';
import { Child } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AddChildDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (child: Omit<Child, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
}

export function AddChildDialog({ open, onOpenChange, onSubmit }: AddChildDialogProps) {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [grade, setGrade] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('O nome é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        birth_date: birthDate || null,
        grade: grade || null,
        school_name: schoolName || null,
        avatar_url: null,
      });
      toast.success('Filho(a) adicionado(a) com sucesso!');
      setName('');
      setBirthDate('');
      setGrade('');
      setSchoolName('');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao adicionar filho(a)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Filho(a)</DialogTitle>
          <DialogDescription>
            Preencha os dados do seu filho(a) para começar a acompanhar a vida escolar.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="child-name">Nome *</Label>
              <Input
                id="child-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome da criança"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birth-date">Data de Nascimento</Label>
              <Input
                id="birth-date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Série/Ano</Label>
              <Input
                id="grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Ex: 3º Ano"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school-name">Escola</Label>
              <Input
                id="school-name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Nome da escola"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
