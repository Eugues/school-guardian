import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, Users, Calendar, BookOpen, CheckCircle } from 'lucide-react';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground">
              <Shield className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl">School Guardian</span>
          </div>
          <Button onClick={() => navigate('/auth')}>Entrar</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Acompanhe a vida escolar dos seus filhos
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Organize tarefas, provas, agenda e muito mais em um só lugar. 
            Para pais e filhos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Começar Agora
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mt-20">
          {[
            { icon: Users, title: 'Multi-usuário', desc: 'Pais e filhos com contas separadas' },
            { icon: Calendar, title: 'Agenda Completa', desc: 'Visualize por dia, semana ou mês' },
            { icon: BookOpen, title: 'Tarefas', desc: 'Gerencie e acompanhe conclusões' },
            { icon: CheckCircle, title: 'Provas', desc: 'Nunca perca uma data importante' },
          ].map((feature) => (
            <div key={feature.title} className="text-center p-6 rounded-2xl bg-card border">
              <feature.icon className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
