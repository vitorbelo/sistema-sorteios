"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, Trophy, Ticket, Play, Crown } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  email: string;
  telegram: string;
  whatsapp: string;
  ticketNumber: string;
  isValidated: boolean;
  createdAt: string;
  validatedAt?: string;
}

interface RaffleData {
  id: string;
  title: string;
  description: string;
  prize: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  winnerId?: string;
  drawnAt?: string;
  seed?: string;
  participants: Participant[];
}

interface RaffleDashboardProps {
  onDrawWinner?: () => void;
  isAdmin?: boolean;
}

export function RaffleDashboard({ onDrawWinner, isAdmin = false }: RaffleDashboardProps) {
  const [stats, setStats] = useState({
    totalParticipants: 0,
    validatedParticipants: 0,
    timeRemaining: '',
    isActive: true
  });
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [raffle, setRaffle] = useState<RaffleData | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [allRaffles, setAllRaffles] = useState<any[]>([]);

  // Função para buscar dados
  const fetchData = async () => {
    try {
      console.log('Carregando dados do dashboard...');

      // Buscar estatísticas
      const statsResponse = await fetch('/api/raffle-stats');
      const statsData = await statsResponse.json();
      console.log('Stats carregadas:', statsData);
      setStats(statsData);

      // Buscar participantes
      const participantsResponse = await fetch('/api/participants');
      const participantsData = await participantsResponse.json();
      console.log('Participantes carregados:', participantsData);
      setParticipants(Array.isArray(participantsData) ? participantsData : []);

      // Buscar dados do sorteio
      const raffleResponse = await fetch('/api/current-raffle');
      const raffleData = await raffleResponse.json();
      console.log('Raffle carregado:', raffleData);
      setRaffle(raffleData);

      // Se for admin, buscar todos os sorteios para ativação
      if (isAdmin) {
        const allRafflesResponse = await fetch('/api/activate-raffle');
        const allRafflesData = await allRafflesResponse.json();
        setAllRaffles(Array.isArray(allRafflesData) ? allRafflesData : []);
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setParticipants([]);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleDrawWinner = async () => {
    if (participants.length === 0) {
      alert('Nenhum participante encontrado para sortear!');
      return;
    }

    setIsDrawing(true);
    
    try {
      console.log('Iniciando sorteio via dashboard...');
      
      const response = await fetch('/api/draw-winner', {
        method: 'POST'
      });
      
      const result = await response.json();
      console.log('Resultado do sorteio:', result);
      
      if (result.success) {
        console.log('Sorteio realizado com sucesso!');
        
        // Mostrar alerta de sucesso
        alert(`🎉 Ganhador sorteado!\n\nNome: ${result.winner?.name}\nTicket: #${result.winner?.ticketNumber}`);
        
        // Recarregar todos os dados
        await fetchData();
        
        // Chamar callback se existir
        if (onDrawWinner) {
          onDrawWinner();
        }
        
      } else {
        console.error('Erro no sorteio:', result.message);
        alert('❌ Erro ao realizar sorteio: ' + (result.message || 'Erro desconhecido'));
      }
    } catch (error) {
      console.error('Erro ao realizar sorteio:', error);
      alert('❌ Erro ao conectar com o servidor');
    } finally {
      setIsDrawing(false);
    }
  };

  const handleActivateRaffle = async (raffleId: string) => {
    try {
      console.log('Ativando sorteio:', raffleId);
      
      const response = await fetch('/api/activate-raffle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raffleId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Sorteio ativado com sucesso!');
        // Recarregar todos os dados
        await fetchData();
        // Recarregar a página para atualizar tudo
        window.location.reload();
      } else {
        alert('Erro ao ativar sorteio: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao ativar sorteio:', error);
      alert('Erro ao conectar com o servidor');
    }
  };

  if (!raffle) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white">Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Sorteio */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-0 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold mb-2">
            {raffle.title}
          </CardTitle>
          <p className="text-blue-100 text-lg">
            {raffle.description}
          </p>
          <div className="mt-4 p-4 bg-white/20 rounded-lg backdrop-blur-sm">
            <Trophy className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xl font-semibold">{raffle.prize}</p>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-gray-800">{stats.validatedParticipants}</p>
            <p className="text-gray-600">Participantes Confirmados</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-indigo-600" />
            <p className="text-2xl font-bold text-gray-800">
              {stats.timeRemaining || 'Ativo'}
            </p>
            <p className="text-gray-600">Tempo Restante</p>
          </CardContent>
        </Card>

        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <Ticket className="w-8 h-8 mx-auto mb-2 text-violet-600" />
            <p className="text-2xl font-bold text-gray-800">{stats.totalParticipants}</p>
            <p className="text-gray-600">Total de Inscrições</p>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciar Sorteios (Admin) */}
      {isAdmin && !raffle && allRaffles.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Trophy className="w-5 h-5" />
              Ativar Sorteio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 mb-4">
              Selecione um sorteio para ativar:
            </p>
            <div className="space-y-3">
              {allRaffles
                .filter(r => !r.isActive)
                .map((raffleItem) => (
                  <div key={raffleItem.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div>
                      <p className="font-semibold text-gray-800">{raffleItem.title}</p>
                      <p className="text-sm text-gray-600">{raffleItem.prize}</p>
                      <p className="text-xs text-gray-500">
                        Criado em: {new Date(raffleItem.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleActivateRaffle(raffleItem.id)}
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      Ativar Sorteio
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status do Sorteio */}
      {!stats.isActive && (
        <Card className="bg-orange-100 border-orange-300">
          <CardContent className="p-4 text-center">
            <p className="text-orange-800 font-semibold">
              ⚠️ Este sorteio foi finalizado
            </p>
          </CardContent>
        </Card>
      )}

      {/* Botão de Sorteio */}
      {isAdmin && stats.isActive && participants.length > 0 && !raffle.winnerId && (
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6 text-center">
            <Button
              onClick={handleDrawWinner}
              disabled={isDrawing}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isDrawing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sorteando...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Realizar Sorteio
                </>
              )}
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              {participants.length} participante{participants.length !== 1 ? 's' : ''} confirmado{participants.length !== 1 ? 's' : ''} para o sorteio
            </p>
          </CardContent>
        </Card>
      )}

      {/* Botão desabilitado se não houver participantes */}
      {isAdmin && stats.isActive && participants.length === 0 && (
        <Card className="bg-gray-100 border-gray-300">
          <CardContent className="p-6 text-center">
            <Button
              disabled
              className="bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-lg cursor-not-allowed"
            >
              <Play className="mr-2 h-5 w-5" />
              Aguardando Participantes
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              Nenhum participante confirmado ainda
            </p>
          </CardContent>
        </Card>
      )}

      {/* Resultado do Sorteio */}
      {raffle.winnerId && (
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0 shadow-2xl">
          <CardHeader className="text-center">
            <Crown className="w-12 h-12 mx-auto mb-4" />
            <CardTitle className="text-2xl font-bold mb-4">
              🎉 Ganhador do Sorteio! 🎉
            </CardTitle>
            <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
              {participants.find(p => p.id === raffle.winnerId) && (
                <>
                  <p className="text-2xl font-bold mb-2">
                    {participants.find(p => p.id === raffle.winnerId)?.name}
                  </p>
                  <p className="text-yellow-100 mb-2">
                    Ticket: {participants.find(p => p.id === raffle.winnerId)?.ticketNumber}
                  </p>
                </>
              )}
              <p className="text-yellow-100 text-sm">
                Sorteado em: {raffle.drawnAt ? new Date(raffle.drawnAt).toLocaleString('pt-BR') : ''}
              </p>
              {raffle.seed && (
                <p className="text-yellow-100 text-xs mt-2 font-mono">
                  Seed: {raffle.seed}
                </p>
              )}
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Lista de Participantes */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participantes Confirmados ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {participants.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum participante confirmado ainda
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    participant.id === raffle.winnerId 
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-400' 
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      participant.id === raffle.winnerId 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                    }`}>
                      {participant.id === raffle.winnerId ? '👑' : index + 1}
                    </div>
                    <div>
                      <p className={`font-semibold ${
                        participant.id === raffle.winnerId ? 'text-orange-800' : 'text-gray-800'
                      }`}>
                        {participant.name}
                        {participant.id === raffle.winnerId && ' 🏆'}
                      </p>
                      <p className="text-sm text-gray-600">{participant.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={participant.id === raffle.winnerId ? "default" : "secondary"} 
                      className={`mb-1 ${
                        participant.id === raffle.winnerId 
                          ? 'bg-yellow-500 text-white' 
                          : ''
                      }`}
                    >
                      {participant.ticketNumber}
                    </Badge>
                    <p className="text-xs text-gray-500">
                      {participant.validatedAt ? new Date(participant.validatedAt).toLocaleString('pt-BR') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}