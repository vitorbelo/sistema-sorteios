"use client";

import { useState, useEffect } from 'react';
import { RegistrationForm } from '@/components/registration-form';
import { VerificationForm } from '@/components/verification-form';
import { SuccessConfirmation } from '@/components/success-confirmation';
import { RaffleDashboard } from '@/components/raffle-dashboard';
import { LastRaffles } from '@/components/last-raffles';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, Gift, Shield, Clock, BarChart3 } from 'lucide-react';

type Step = 'registration' | 'verification' | 'success' | 'dashboard';
type ActiveTab = 'active-raffle' | 'last-raffles' | 'dashboard';

interface RaffleData {
  id: string;
  title: string;
  description: string;
  prize: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

export default function RafflePage() {
  const [currentStep, setCurrentStep] = useState<Step>('registration');
  const [participantId, setParticipantId] = useState<string>('');
  const [ticket, setTicket] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('active-raffle');
  const [raffle, setRaffle] = useState<RaffleData | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRaffle = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/current-raffle');
        const raffleData = await response.json();
        setRaffle(raffleData);
      } catch (error) {
        console.error('Erro ao carregar sorteio:', error);
        setRaffle(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRaffle();
  }, []);

  // Verificar se é admin quando dashboard for acessado
  useEffect(() => {
    const checkAdminAuth = () => {
      const adminAuth = sessionStorage.getItem('admin_authenticated');
      setIsAdmin(adminAuth === 'true');
    };

    if (activeTab === 'dashboard') {
      checkAdminAuth();
    }
  }, [activeTab]);

  const handleRegistrationSuccess = (id: string) => {
    setParticipantId(id);
    setCurrentStep('verification');
  };

  const handleVerificationSuccess = (ticketNumber: string) => {
    setTicket(ticketNumber);
    setCurrentStep('success');
  };

  const handleReset = () => {
    setCurrentStep('registration');
    setParticipantId('');
    setTicket('');
  };

  const handleBackToRegistration = () => {
    setCurrentStep('registration');
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    // Reset form state when changing tabs
    if (tab !== 'active-raffle') {
      setCurrentStep('registration');
      setParticipantId('');
      setTicket('');
    }
  };

  // Se ainda está carregando, mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Carregando sorteio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-indigo-800">
      <div className="absolute inset-0 opacity-20"></div>
      
      <div className="relative z-10">
        {/* Header com Logo e Navegação */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">PY SORTEIOS</h1>
                  <p className="text-sm text-white/80">Sorteios diários para você!</p>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="hidden md:flex items-center space-x-1">
                <Button
                  onClick={() => handleTabChange('active-raffle')}
                  variant={activeTab === 'active-raffle' ? 'secondary' : 'ghost'}
                  className={`text-white hover:bg-white/20 ${
                    activeTab === 'active-raffle' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  SORTEIO ATIVO
                </Button>
                
                <Button
                  onClick={() => handleTabChange('last-raffles')}
                  variant={activeTab === 'last-raffles' ? 'secondary' : 'ghost'}
                  className={`text-white hover:bg-white/20 ${
                    activeTab === 'last-raffles' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  ÚLTIMOS SORTEIOS
                </Button>
                
                <Button
                  onClick={() => handleTabChange('dashboard')}
                  variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
                  className={`text-white hover:bg-white/20 ${
                    activeTab === 'dashboard' 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  DASHBOARD
                  {isAdmin && activeTab === 'dashboard' && (
                    <span className="ml-1 text-xs">👑</span>
                  )}
                </Button>
              </nav>

              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <select 
                  value={activeTab}
                  onChange={(e) => handleTabChange(e.target.value as ActiveTab)}
                  className="bg-white/20 text-white border-white/30 rounded-md px-3 py-2 text-sm backdrop-blur-sm"
                >
                  <option value="active-raffle" className="text-gray-900">SORTEIO ATIVO</option>
                  <option value="last-raffles" className="text-gray-900">ÚLTIMOS SORTEIOS</option>
                  <option value="dashboard" className="text-gray-900">DASHBOARD</option>
                </select>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Sorteio Ativo */}
            {activeTab === 'active-raffle' && (
              <>
                {raffle ? (
                  <>
                    {/* Page Title */}
                    <div className="text-center mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Sorteio Ativo
                      </h2>
                      <p className="text-xl text-white/90">
                        Participe agora e concorra a {raffle.prize}!
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                      {/* Left Column - Form */}
                      <div className="order-2 lg:order-1">
                        {currentStep === 'registration' && (
                          <RegistrationForm onSuccess={handleRegistrationSuccess} />
                        )}
                        
                        {currentStep === 'verification' && (
                          <VerificationForm
                            participantId={participantId}
                            onSuccess={handleVerificationSuccess}
                            onBack={handleBackToRegistration}
                          />
                        )}
                        
                        {currentStep === 'success' && (
                          <SuccessConfirmation
                            ticket={ticket}
                            onReset={handleReset}
                          />
                        )}
                      </div>

                      {/* Right Column - Info */}
                      <div className="order-1 lg:order-2 space-y-6">
                        {/* Prize Info */}
                        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                          <CardContent className="p-6">
                            <div className="text-center">
                              <Gift className="w-12 h-12 mx-auto mb-4 text-blue-500" />
                              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                {raffle.prize}
                              </h3>
                              <p className="text-gray-600 mb-4">
                                Participe e concorra a este prêmio incrível!
                              </p>
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-4">
                                <p className="text-sm opacity-90">Prêmio</p>
                                <p className="text-3xl font-bold">{raffle.prize}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* How it Works */}
                        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                          <CardContent className="p-6">
                            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Como Participar
                            </h4>
                            <div className="space-y-3">
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                  1
                                </div>
                                <p className="text-gray-700">Preencha o formulário com seus dados</p>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                  2
                                </div>
                                <p className="text-gray-700">Confirme seu WhatsApp com o código enviado</p>
                              </div>
                              <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                                  3
                                </div>
                                <p className="text-gray-700">Receba seu ticket e aguarde o sorteio</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Security */}
                        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                          <CardContent className="p-6">
                            <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                              <Shield className="w-5 h-5" />
                              Segurança e Transparência
                            </h4>
                            <div className="space-y-2 text-gray-700">
                              <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Validação por WhatsApp
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Sorteio aleatório auditável
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Dados protegidos e criptografados
                              </p>
                              <p className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Processo 100% transparente
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Nenhum Sorteio Ativo */
                  <div className="text-center">
                    <div className="mb-12">
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Sorteio Ativo
                      </h2>
                      <p className="text-xl text-white/90">
                        Aguarde nossos próximos sorteios incríveis!
                      </p>
                    </div>
                    
                    <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-2xl mx-auto">
                      <CardContent className="p-12">
                        <Trophy className="w-16 h-16 mx-auto mb-6 text-blue-500" />
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">
                          Nenhum Sorteio Ativo
                        </h3>
                        <p className="text-gray-600 text-lg mb-6">
                          No momento não há sorteios em andamento. Fique atento às nossas redes sociais para não perder o próximo!
                        </p>
                        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg p-4">
                          <p className="text-sm text-blue-800 font-semibold mb-2">
                            Em breve:
                          </p>
                          <p className="text-blue-700">
                            Novos sorteios com prêmios incríveis estão sendo preparados especialmente para você!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}

            {/* Últimos Sorteios */}
            {activeTab === 'last-raffles' && (
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Últimos Sorteios
                  </h2>
                  <p className="text-xl text-white/90">
                    Confira os sorteios já realizados e seus ganhadores
                  </p>
                </div>
                
                <LastRaffles isAdmin={isAdmin} />
              </div>
            )}

            {/* Dashboard */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="text-center mb-12">
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    Dashboard {isAdmin && '👑'}
                  </h2>
                  <p className="text-xl text-white/90">
                    {isAdmin ? 'Painel administrativo' : 'Estatísticas dos sorteios'}
                  </p>
                </div>
                
                {raffle ? (
                  <RaffleDashboard isAdmin={isAdmin} />
                ) : (
                  <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 max-w-2xl mx-auto">
                    <CardContent className="p-12">
                      <BarChart3 className="w-16 h-16 mx-auto mb-6 text-blue-500" />
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">
                        Dashboard Indisponível
                      </h3>
                      <p className="text-gray-600 text-lg">
                        O dashboard estará disponível quando houver um sorteio ativo.
                      </p>
                      {isAdmin && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                          <p className="text-blue-800 text-sm">
                            <strong>Admin:</strong> Crie um novo sorteio para acessar o dashboard completo.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

          </div>
        </main>

        {/* Footer */}
        <footer className="text-center py-8 px-4 text-white/80">
          <p className="text-sm">
            © 2025 PY SORTEIOS. Todos os direitos reservados.
          </p>
          <p className="text-xs mt-2">
            Sorteio realizado de forma transparente e auditável.
          </p>
        </footer>
      </div>
    </div>
  );
}