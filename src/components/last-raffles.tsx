"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Gift, 
  Crown,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageSquare
} from 'lucide-react';

interface Winner {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  telegram: string;
  ticketNumber: string;
}

interface HistoricalRaffle {
  id: string;
  title: string;
  description: string;
  prize: string;
  startDate: string;
  endDate: string;
  drawDate?: string;
  isActive: boolean;
  isCompleted: boolean;
  totalParticipants: number;
  winner?: Winner;
}

interface LastRafflesProps {
  isAdmin?: boolean;
}

export function LastRaffles({ isAdmin = false }: LastRafflesProps) {
  const [raffles, setRaffles] = useState<HistoricalRaffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRaffle, setExpandedRaffle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistoricalRaffles();
  }, []);

  const fetchHistoricalRaffles = async () => {
    try {
      console.log('Buscando histórico de sorteios...');
      const response = await fetch('/api/historical-raffles');
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Dados recebidos:', data);
      setRaffles(data);
    } catch (error) {
      console.error('Erro ao carregar sorteios:', error);
      setError('Erro ao carregar histórico de sorteios');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (raffleId: string) => {
    setExpandedRaffle(expandedRaffle === raffleId ? null : raffleId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatWhatsApp = (whatsapp: string) => {
    const cleaned = whatsapp.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    return whatsapp;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-300 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="bg-white/95 backdrop-blur-sm border-red-200">
          <CardContent className="p-8">
            <div className="text-red-500 mb-4">
              <Gift className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Erro ao Carregar</h3>
              <p className="text-sm mt-2">{error}</p>
            </div>
            <Button 
              onClick={fetchHistoricalRaffles}
              variant="outline"
              className="mt-4"
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (raffles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-12">
            <Trophy className="w-16 h-16 mx-auto mb-6 text-blue-500" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Nenhum Sorteio Realizado
            </h3>
            <p className="text-gray-600 text-lg">
              Este é o primeiro sorteio da plataforma! 
              Em breve você poderá ver aqui o histórico de todos os ganhadores.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-gray-800">
              {raffles.filter(r => r.isCompleted).length}
            </div>
            <div className="text-sm text-gray-600">Sorteios Realizados</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold text-gray-800">
              {raffles.reduce((acc, r) => acc + r.totalParticipants, 0)}
            </div>
            <div className="text-sm text-gray-600">Total de Participantes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/95 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-gray-800">
              {raffles.filter(r => r.winner).length}
            </div>
            <div className="text-sm text-gray-600">Ganhadores</div>
          </CardContent>
        </Card>
      </div>

      {/* Raffles List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {raffles
          .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())
          .map((raffle) => (
            <Card key={raffle.id} className="bg-white/95 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-bold text-gray-800 mb-2">
                      {raffle.prize}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mb-3">
                      {raffle.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={raffle.isCompleted ? "default" : "secondary"}
                      >
                        {raffle.isCompleted ? 'Concluído' : 'Em Andamento'}
                      </Badge>
                      <Badge variant="outline">
                        <Users className="w-3 h-3 mr-1" />
                        {raffle.totalParticipants} participantes
                      </Badge>
                    </div>
                  </div>
                  
                  {raffle.winner && (
                    <div className="ml-4">
                      <Crown className="w-8 h-8 text-yellow-500" />
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Início: {formatDate(raffle.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Fim: {formatDate(raffle.endDate)}</span>
                  </div>
                  {raffle.drawDate && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Trophy className="w-4 h-4" />
                      <span>Sorteio: {formatDate(raffle.drawDate)}</span>
                    </div>
                  )}
                </div>

                {raffle.winner && (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Ganhador</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <p className="font-medium text-gray-800">{raffle.winner.name}</p>
                      <p className="text-gray-600">Ticket: #{raffle.winner.ticketNumber}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => toggleExpanded(raffle.id)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {expandedRaffle === raffle.id ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Ocultar Detalhes
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </>
                  )}
                </Button>

                {/* Expanded Details - APENAS PARA ADMIN */}
                {expandedRaffle === raffle.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {raffle.winner && isAdmin ? (
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-500" />
                          Dados do Ganhador
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Nome:</span>
                            <span>{raffle.winner.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Email:</span>
                            <span className="text-gray-600">{raffle.winner.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">WhatsApp:</span>
                            <span className="text-gray-600">{formatWhatsApp(raffle.winner.whatsapp)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Telegram:</span>
                            <span className="text-gray-600">@{raffle.winner.telegram}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">Ticket Sorteado:</span>
                            <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              #{raffle.winner.ticketNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : raffle.winner && !isAdmin ? (
                      <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                        <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-600" />
                          Informações do Ganhador
                        </h4>
                        <p className="text-yellow-700 text-sm">
                          Os dados pessoais do ganhador são visíveis apenas para administradores por questões de privacidade.
                        </p>
                        <p className="text-yellow-600 text-sm mt-2">
                          <strong>Ganhador:</strong> {raffle.winner.name} - Ticket #{raffle.winner.ticketNumber}
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-2">
                          Informações do Sorteio
                        </h4>
                        <div className="space-y-2 text-sm text-gray-600">
                          <p><strong>Participantes:</strong> {raffle.totalParticipants}</p>
                          <p><strong>Status:</strong> {raffle.isCompleted ? 'Concluído' : 'Em andamento'}</p>
                          {raffle.drawDate && (
                            <p><strong>Data do sorteio:</strong> {formatDate(raffle.drawDate)}</p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {!raffle.isCompleted && (
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mt-4">
                        <h4 className="font-semibold text-blue-800 mb-2">
                          Sorteio em Andamento
                        </h4>
                        <p className="text-sm text-blue-700">
                          Este sorteio ainda não foi finalizado. O ganhador será anunciado após o término.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}