"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, MessageSquare } from 'lucide-react';

export function WhatsAppTest() {
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestStatus('testing');
    
    try {
      const response = await fetch('/api/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestStatus('success');
        setTestMessage(result.message);
      } else {
        setTestStatus('error');
        setTestMessage(result.message);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestMessage = async () => {
    if (!testPhone) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/test-whatsapp-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testPhone,
          message: 'Teste de envio do sistema de sorteios!'
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestMessage('Mensagem de teste enviada com sucesso!');
        setTestStatus('success');
      } else {
        setTestMessage(result.message);
        setTestStatus('error');
      }
    } catch (error) {
      setTestMessage('Erro ao enviar mensagem');
      setTestStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (testStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Conectado</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      case 'testing':
        return <Badge className="bg-yellow-100 text-yellow-800"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Testando</Badge>;
      default:
        return <Badge variant="outline">Não testado</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Teste WhatsApp API
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {testMessage && (
          <div className={`p-3 rounded-lg text-sm ${
            testStatus === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testMessage}
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={testConnection}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando Conexão...
              </>
            ) : (
              'Testar Conexão API'
            )}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="testPhone">Teste de Envio</Label>
            <Input
              id="testPhone"
              type="tel"
              placeholder="5511999999999"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
            <Button
              onClick={sendTestMessage}
              disabled={isLoading || !testPhone}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar Mensagem Teste'
              )}
            </Button>
          </div>
        </div>

        <div className="text-xs text-gray-500 space-y-1">
          <p>• Configure WHATSAPP_API_URL no .env.local</p>
          <p>• Configure WHATSAPP_ACCESS_TOKEN no .env.local</p>
          <p>• Use formato: 5511999999999 (com código do país)</p>
        </div>
      </CardContent>
    </Card>
  );
}