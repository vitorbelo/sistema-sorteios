"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Shield, RefreshCw, CheckCircle } from 'lucide-react';

interface VerificationFormProps {
  participantId: string;
  onSuccess: (ticket: string) => void;
  onBack: () => void;
}

export function VerificationForm({ participantId, onSuccess, onBack }: VerificationFormProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setError('Código deve ter 6 dígitos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId,
          code
        }),
      });

      const result = await response.json();
      
      if (result.success && result.ticket) {
        onSuccess(result.ticket);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erro interno. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError('');

    try {
      const response = await fetch('/api/resend-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setTimeLeft(600); // Reset timer
        setCode('');
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Erro ao reenviar código.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-2xl font-bold text-gray-800">
          Verificação WhatsApp
        </CardTitle>
        <CardDescription className="text-gray-600">
          Digite o código de 6 dígitos enviado para seu WhatsApp
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="code" className="text-sm font-medium text-gray-700">
              Código de Verificação
            </Label>
            <Input
              id="code"
              type="text"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCode(value);
                if (error) setError('');
              }}
              className="bg-white text-gray-600 placeholder-gray-400 border-gray-300 text-center text-2xl font-mono tracking-widest focus:border-blue-500 focus:ring-blue-500"
              maxLength={6}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center text-xs text-gray-500">
              <span>Código expira em: {formatTime(timeLeft)}</span>
              {timeLeft === 0 && <span className="text-red-500">Expirado</span>}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              disabled={isLoading || code.length !== 6 || timeLeft === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Código
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={handleResendCode}
              disabled={isResending || timeLeft > 540} // Só permite reenviar após 1 minuto
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reenviar Código
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-600 hover:bg-gray-50"
              onClick={onBack}
            >
              Voltar ao Formulário
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}