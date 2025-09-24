"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, Mail, MessageCircle, Phone } from 'lucide-react';
import { validateEmail, validateWhatsApp, validateTelegram, formatWhatsApp } from '@/lib/utils';

interface RegistrationFormProps {
  onSuccess: (participantId: string) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    whatsapp: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telegram.trim()) {
      newErrors.telegram = 'Telegram é obrigatório';
    } else if (!validateTelegram(formData.telegram)) {
      newErrors.telegram = 'Telegram deve começar com @ e ter 5-32 caracteres';
    }

    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp é obrigatório';
    } else if (!validateWhatsApp(formData.whatsapp)) {
      newErrors.whatsapp = 'WhatsApp inválido (ex: 11999999999)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/register-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          whatsapp: formatWhatsApp(formData.whatsapp)
        }),
      });
    
      const result = await response.json();
    
      if (result.success && result.participantId) {
        onSuccess(result.participantId);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'Erro interno. Tente novamente.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm shadow-2xl border-0">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          Participar do Sorteio
        </CardTitle>
        <CardDescription className="text-gray-600">
          Preencha seus dados para concorrer
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {errors.general}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Nome Completo
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="name"
                type="text"
                placeholder="Seu nome completo"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 bg-white text-gray-600 placeholder-gray-400 border-gray-300 ${errors.name ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 bg-white text-gray-600 placeholder-gray-400 border-gray-300 ${errors.email ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram" className="text-sm font-medium text-gray-700">
              Telegram
            </Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="telegram"
                type="text"
                placeholder="@seuusuario"
                value={formData.telegram}
                onChange={(e) => handleInputChange('telegram', e.target.value)}
                className={`pl-10 bg-white text-gray-600 placeholder-gray-400 border-gray-300 ${errors.telegram ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.telegram && <p className="text-red-500 text-xs">{errors.telegram}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
              WhatsApp
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="whatsapp"
                type="tel"
                placeholder="11999999999"
                value={formData.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                  className={`pl-10 bg-white text-gray-600 placeholder-gray-400 border-gray-300 ${errors.whatsapp ? 'border-red-300 focus:border-red-500' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.whatsapp && <p className="text-red-500 text-xs">{errors.whatsapp}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-700 hover:to-blue-400 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              'Participar do Sorteio'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}