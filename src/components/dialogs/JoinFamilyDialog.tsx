import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface JoinFamilyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function JoinFamilyDialog({
  open,
  onOpenChange,
  onSuccess,
}: JoinFamilyDialogProps) {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Parse the invite code: child_id_first4-parent_id_first4
      const parts = code.toUpperCase().split('-');
      if (parts.length !== 2) {
        throw new Error('Código inválido');
      }

      const [childIdPrefix, parentIdPrefix] = parts;

      // Find the child that matches this code
      // We need to find in parent_child where parent_id starts with parentIdPrefix
      // and child_id starts with childIdPrefix
      const { data: parentChildData, error: parentChildError } = await supabase
        .from('parent_child')
        .select('child_id, parent_id')
        .limit(100);

      if (parentChildError) throw parentChildError;

      // Find matching relationship
      const match = parentChildData?.find(
        (pc) =>
          pc.child_id.toUpperCase().startsWith(childIdPrefix) &&
          pc.parent_id.toUpperCase().startsWith(parentIdPrefix)
      );

      if (!match) {
        throw new Error('Código não encontrado. Verifique se o código está correto.');
      }

      // Check if already linked
      const { data: existingLink } = await supabase
        .from('child_user_link')
        .select('id')
        .eq('child_id', match.child_id)
        .maybeSingle();

      if (existingLink) {
        throw new Error('Este perfil de filho já está vinculado a uma conta.');
      }

      // Create the link
      const { error: linkError } = await supabase
        .from('child_user_link')
        .insert({
          child_id: match.child_id,
          user_id: user.id,
        });

      if (linkError) {
        if (linkError.code === '23505') {
          throw new Error('Sua conta já está vinculada a um perfil.');
        }
        throw linkError;
      }

      setSuccess(true);
      toast.success('Conta vinculada com sucesso!');
      
      setTimeout(() => {
        onSuccess?.();
        onOpenChange(false);
        // Reload to update context
        window.location.reload();
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Erro ao vincular conta');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCode('');
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Vincular à Família
          </DialogTitle>
          <DialogDescription>
            Digite o código fornecido pelo seu pai/mãe para vincular sua conta.
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold">Vinculado com sucesso!</h3>
            <p className="text-muted-foreground text-center mt-2">
              Sua conta foi vinculada ao perfil da família.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code">Código de Vinculação</Label>
                <Input
                  id="code"
                  placeholder="XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono text-center text-lg tracking-widest"
                  maxLength={9}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Peça o código para seu pai ou mãe
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || !code.trim()}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Vincular
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
