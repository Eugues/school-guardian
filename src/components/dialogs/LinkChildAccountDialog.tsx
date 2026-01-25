import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Child } from '@/types/database';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Link2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface LinkChildAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  child: Child;
  onSuccess?: () => void;
}

export function LinkChildAccountDialog({
  open,
  onOpenChange,
  child,
  onSuccess,
}: LinkChildAccountDialogProps) {
  const { user } = useAuth();
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a simple invite code based on child ID and parent ID
  const generateInviteCode = () => {
    if (!user) return;
    // Create a simple code: first 4 chars of child id + first 4 chars of parent id
    const code = `${child.id.slice(0, 4)}-${user.id.slice(0, 4)}`.toUpperCase();
    setInviteCode(code);
  };

  useEffect(() => {
    if (open) {
      generateInviteCode();
    }
  }, [open, child.id, user?.id]);

  const copyToClipboard = async () => {
    if (!inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erro ao copiar código');
    }
  };

  const instructions = [
    'O filho deve criar uma conta no app selecionando "Filho(a)" como tipo de conta.',
    'Após fazer login, o filho deve acessar a opção "Vincular à Família" no menu.',
    'Digite o código acima para vincular automaticamente.',
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Vincular Conta de {child.name}
          </DialogTitle>
          <DialogDescription>
            Gere um código para seu filho vincular a conta dele ao perfil.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              O filho precisa ter uma conta própria no app para fazer login independente.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Código de Vinculação</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-lg text-center tracking-widest">
                {inviteCode || '----'}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                disabled={!inviteCode}
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Como vincular:</Label>
            <ol className="space-y-2 text-sm text-muted-foreground">
              {instructions.map((instruction, index) => (
                <li key={index} className="flex gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
