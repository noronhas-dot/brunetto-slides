import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: session, isLoading } = trpc.auth.session.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      setLocation("/login");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!session) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1A3123] flex items-center justify-center text-[#F9EAD3] text-sm font-bold">
              B&CO
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Brunetto & CO</h1>
              <p className="text-sm text-gray-500">Gerenciador de Slides</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session.name}</p>
              <p className="text-xs text-gray-500">{session.role}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Stats Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">0</CardTitle>
              <CardDescription>Templates Criados</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">58</CardTitle>
              <CardDescription>Slides Disponíveis</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">1</CardTitle>
              <CardDescription>Template Padrão</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Ações Rápidas</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>📁 Meus Templates</CardTitle>
                <CardDescription>
                  Visualize e gerencie seus templates de apresentação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#1A3123] hover:bg-[#2a4133]">
                  Ver Templates
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>🎨 Biblioteca de Slides</CardTitle>
                <CardDescription>
                  Explore todos os slides disponíveis (58 slides)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#8B9B88] hover:bg-[#7a8a77]">
                  Ver Biblioteca
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>➕ Criar Template</CardTitle>
                <CardDescription>
                  Crie um novo template selecionando slides
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-[#1A3123] hover:bg-[#2a4133]">
                  Novo Template
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>⚙️ Configurações</CardTitle>
                <CardDescription>
                  Personalize cores, logo e preferências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Configurar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Atividade Recente</h2>
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Nenhuma atividade recente. Comece criando seu primeiro template!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

