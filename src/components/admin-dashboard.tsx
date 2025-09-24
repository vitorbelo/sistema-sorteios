"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Trophy, 
  Calendar,
  Power,
  PowerOff,
  LogOut,
  Save,
  X
} from 'lucide-react';

interface Raffle {
  id: string;
  title: string;
  description: string;
  prize: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  participants: Array<{
    id: string;
    name: string;
    isValidated: boolean;
  }>;
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [activatingRaffle, setActivatingRaffle] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    endDate: '',
    setAsActive: false
  });

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    try {
      const response = await fetch('/api/admin/raffles');
      const data = await response.json();
      setRaffles(data);
    } catch (error) {
      console.error('Erro ao buscar sorteios:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchRaffles();
        setShowCreateForm(false);
        setFormData({ title: '', description: '', prize: '', endDate: '', setAsActive: false });
      }
    } catch (error) {
      console.error('Erro ao criar sorteio:', error);
    }
  };

  const handleUpdateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRaffle) return;

    try {
      const response = await fetch(`/api/admin/raffles/${editingRaffle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          prize: formData.prize,
          endDate: formData.endDate,
          isActive: formData.setAsActive
        })
      });

      if (response.ok) {
        await fetchRaffles();
        setEditingRaffle(null);
        setFormData({ title: '', description: '', prize: '', endDate: '', setAsActive: false });
      }
    } catch (error) {
      console.error('Erro ao atualizar sorteio:', error);
    }
  };

  const handleDeleteRaffle = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este sorteio? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/raffles/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchRaffles();
      }
    } catch (error) {
      console.error('Erro ao deletar sorteio:', error);
    }
  };

  // NOVA FUNÇÃO: Ativar/Desativar sorteio
  const handleToggleRaffle = async (raffleId: string, currentStatus: boolean) => {
    setActivatingRaffle(raffleId);
    
    try {
      const response = await fetch('/api/activate-raffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raffleId })
      });

      const result = await response.json();

      if (result.success) {
        // Recarregar lista de sorteios
        await fetchRaffles();
        alert(currentStatus ? 'Sorteio desativado!' : 'Sorteio ativado com sucesso!');
      } else {
        alert('Erro: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao alterar status do sorteio:', error);
      alert('Erro ao conectar com o servidor');
    } finally {
      setActivatingRaffle(null);
    }
  };

  const handleEdit = (raffle: Raffle) => {
    setEditingRaffle(raffle);
    setFormData({
      title: raffle.title,
      description: raffle.description,
      prize: raffle.prize,
      endDate: raffle.endDate ? raffle.endDate.split('T')[0] : '',
      setAsActive: raffle.isActive
    });
    setShowCreateForm(false);
  };

  const cancelEdit = () => {
    setEditingRaffle(null);
    setShowCreateForm(false);
    setFormData({ title: '', description: '', prize: '', endDate: '', setAsActive: false });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-indigo-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-white">Painel Administrativo</h1>
              <p className="text-white/80">Gerenciar sorteios e participantes</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="bg-white text-gray-600 border-white/30 shadow-lg hover:scale-105"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="mb-8 flex gap-4">
          <Button
            onClick={() => {
              setShowCreateForm(true);
              setEditingRaffle(null);
            }}
            className="bg-white text-gray-600 border-white/30 shadow-lg hover:scale-105"
          >
            <Plus className="mr-2 h-4 w-4" />
            Criar Novo Sorteio
          </Button>
        </div>

        {/* Create/Edit Form */}
        {(showCreateForm || editingRaffle) && (
          <Card className="mb-8 bg-white shadow-xl">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="text-xl text-gray-800">
                {editingRaffle ? 'Editar Sorteio' : 'Criar Novo Sorteio'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-white">
              <form onSubmit={editingRaffle ? handleUpdateRaffle : handleCreateRaffle} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                      Título do Sorteio
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ex: Grande Sorteio de Natal"
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prize" className="text-sm font-semibold text-gray-700">
                      Prêmio
                    </Label>
                    <Input
                      id="prize"
                      value={formData.prize}
                      onChange={(e) => setFormData({ ...formData, prize: e.target.value })}
                      placeholder="Ex: iPhone 15 Pro + R$ 5.000"
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                    Descrição
                  </Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do sorteio..."
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-semibold text-gray-700">
                      Data de Encerramento (Opcional)
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">
                      Configurações
                    </Label>
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        id="setAsActive"
                        checked={formData.setAsActive}
                        onChange={(e) => setFormData({ ...formData, setAsActive: e.target.checked })}
                        className="w-5 h-5 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <div>
                        <Label htmlFor="setAsActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                          Ativar sorteio imediatamente
                        </Label>
                        {formData.setAsActive && (
                          <p className="text-xs text-amber-600 mt-1 bg-amber-50 p-2 rounded border border-amber-200">
                            ⚠️ Isso desativará outros sorteios ativos
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <Button 
                    type="submit" 
                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 font-semibold"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editingRaffle ? 'Atualizar' : 'Criar'} Sorteio
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={cancelEdit}
                    className="bg-gray-300 border-gray-300 text-gray-700 hover:scale-x-105 px-8 py-2.5"
                  >
                    <X className="text-red-700 mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Raffles List */}
        <div className="grid gap-6">
          {raffles.length === 0 ? (
            <Card className="bg-white shadow-xl">
              <CardContent className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-xl text-gray-500 mb-2">Nenhum sorteio criado ainda</p>
                <p className="text-sm text-gray-400">Clique em "Criar Novo Sorteio" para começar</p>
              </CardContent>
            </Card>
          ) : (
            raffles.map((raffle) => (
              <Card key={raffle.id} className={`bg-white shadow-xl ${raffle.isActive ? 'ring-4 ring-blue-300 ring-opacity-50' : ''}`}>
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
                        {raffle.title}
                        {raffle.isActive ? (
                          <Badge className="bg-green-100 text-green-800 border border-green-300">
                            <Power className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-300 text-gray-600">
                            <PowerOff className="w-3 h-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-gray-600 mt-2 text-base">{raffle.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      {/* NOVO BOTÃO: Ativar/Desativar */}
                      <Button
                        size="sm"
                        onClick={() => handleToggleRaffle(raffle.id, raffle.isActive)}
                        disabled={activatingRaffle === raffle.id}
                        className={`${
                          raffle.isActive 
                            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {activatingRaffle === raffle.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        ) : raffle.isActive ? (
                          <>
                            <PowerOff className="w-4 h-4 mr-1" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Power className="w-4 h-4 mr-1" />
                            Ativar
                          </>
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(raffle)}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteRaffle(raffle.id)}
                        className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{raffle.prize}</p>
                        <p className="text-sm text-gray-500">Prêmio</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {raffle.participants.filter(p => p.isValidated).length} confirmados
                        </p>
                        <p className="text-sm text-gray-500">
                          {raffle.participants.length} total
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {raffle.endDate 
                            ? new Date(raffle.endDate).toLocaleDateString('pt-BR')
                            : 'Sem data limite'
                          }
                        </p>
                        <p className="text-sm text-gray-500">Encerramento</p>
                      </div>
                    </div>
                  </div>

                  {raffle.participants.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium mb-3 text-gray-700">Últimos participantes:</p>
                      <div className="flex flex-wrap gap-2">
                        {raffle.participants.slice(0, 5).map((participant) => (
                          <Badge 
                            key={participant.id}
                            variant={participant.isValidated ? "default" : "outline"}
                            className={`text-sm px-3 py-1 ${
                              participant.isValidated 
                                ? 'bg-blue-100 text-blue-800 border border-blue-300' 
                                : 'border-gray-300 text-gray-600'
                            }`}
                          >
                            {participant.name}
                          </Badge>
                        ))}
                        {raffle.participants.length > 5 && (
                          <Badge variant="outline" className="text-sm px-3 py-1 border-gray-300 text-gray-600">
                            +{raffle.participants.length - 5} mais
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}