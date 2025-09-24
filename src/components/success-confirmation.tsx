"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Ticket, Share2, Home } from 'lucide-react';

interface SuccessConfirmationProps {
  ticket: string;
  onReset: () => void;
}

export function SuccessConfirmation({ ticket, onReset }: SuccessConfirmationProps) {
  const handleShare = () => {
    const text = `🎉 Estou participando do sorteio! Meu ticket é: ${ticket}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Participando do Sorteio!',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Texto copiado para a área de transferência!');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
          Participação Confirmada!
        </CardTitle>
        <p className="text-gray-600">
          Parabéns! Você está oficialmente participando do sorteio.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Ticket */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white text-center">
          <Ticket className="w-8 h-8 mx-auto mb-3" />
          <p className="text-sm opacity-90 mb-2">Seu Ticket:</p>
          <p className="text-2xl font-bold font-mono tracking-wider">{ticket}</p>
        </div>

        {/* Informações */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 Próximos Passos:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Guarde seu número do ticket</li>
            <li>• Acompanhe o sorteio em tempo real</li>
            <li>• Compartilhe com seus amigos</li>
            <li>• Boa sorte! 🍀</li>
          </ul>
        </div>

        {/* Ações */}
        <div className="space-y-3">
          <Button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar Participação
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            className="w-full"
          >
            <Home className="mr-2 h-4 w-4" />
            Voltar ao Início
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}