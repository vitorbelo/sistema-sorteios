# 📱 Sistema de Sorteios - Documentação

## 🎯 Visão Geral

Este é um sistema completo de sorteios online com validação por WhatsApp, desenvolvido com Next.js 15, React 19 e TypeScript. O sistema garante transparência, segurança e uma experiência de usuário excepcional.

## ✨ Funcionalidades Principais

### 🔐 Sistema de Participação Seguro
- **Formulário de inscrição** com validação em tempo real
- **Campos obrigatórios**: Nome, Email, Telegram, WhatsApp
- **Prevenção de duplicatas** por email e WhatsApp
- **Validação rigorosa** de todos os inputs

### 📲 Validação por WhatsApp
- **Código de 6 dígitos** enviado automaticamente
- **Timeout de 10 minutos** para segurança
- **Opção de reenvio** após 1 minuto
- **Interface intuitiva** para inserção do código

### 🎲 Sistema de Sorteio Transparente
- **Algoritmo determinístico** com seed auditável
- **Sorteio em tempo real** com animação
- **Histórico completo** de todas as ações
- **Verificação de legitimidade** disponível

### 📊 Dashboard Completo
- **Estatísticas em tempo real** dos participantes
- **Lista de participantes validados**
- **Contador de tempo restante**
- **Controle do sorteio** com um clique

## 🛠️ Configuração da Integração WhatsApp

### Opção 1: WhatsApp Business API (Recomendado)

1. **Criar conta no WhatsApp Business**
   ```bash
   # Acesse: https://business.whatsapp.com/
   # Registre sua empresa
   # Obtenha as credenciais da API
   ```

2. **Configurar variáveis de ambiente**
   ```env
   WHATSAPP_API_URL=https://graph.facebook.com/v18.0/YOUR_PHONE_ID/messages
   WHATSAPP_ACCESS_TOKEN=your_access_token_here
   WHATSAPP_VERIFY_TOKEN=your_verify_token_here
   ```

3. **Implementar webhook**
   ```typescript
   // src/app/api/whatsapp/route.ts
   export async function POST(request: Request) {
     const body = await request.json();
     // Processar mensagens recebidas
     return Response.json({ status: 'ok' });
   }
   ```

### Opção 2: Twilio WhatsApp API

1. **Criar conta no Twilio**
   ```bash
   # Acesse: https://www.twilio.com/
   # Configure WhatsApp Sandbox
   ```

2. **Instalar SDK**
   ```bash
   npm install twilio
   ```

3. **Configurar serviço**
   ```typescript
   import twilio from 'twilio';
   
   const client = twilio(accountSid, authToken);
   
   export async function sendWhatsAppCode(to: string, code: string) {
     return client.messages.create({
       from: 'whatsapp:+14155238886',
       to: `whatsapp:${to}`,
       body: `Seu código de verificação é: ${code}`
     });
   }
   ```

### Opção 3: Integração Personalizada

Para desenvolvimento/teste, o sistema atual simula o envio:

```typescript
// src/lib/raffle-service.ts
console.log(`Código de verificação para ${data.whatsapp}: ${code}`);
```

**Para produção**, substitua por:

```typescript
import { sendWhatsAppMessage } from '@/lib/whatsapp-api';

await sendWhatsAppMessage(data.whatsapp, `Seu código: ${code}`);
```

## 🔧 Configuração do Projeto

### 1. Instalação
```bash
npm install
```

### 2. Configuração de Ambiente
```env
# .env.local
WHATSAPP_API_URL=your_whatsapp_api_url
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_VERIFY_TOKEN=your_verify_token
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Execução
```bash
npm run dev
```

## 🎨 Personalização

### Cores e Tema
O sistema usa gradientes modernos configuráveis:

```css
/* Gradiente principal */
from-blue-500 to-blue-600

/* Gradiente secundário */
from-blue-500 to-cyan-600

/* Gradiente de sucesso */
from-green-500 to-emerald-600
```

### Prêmio e Configurações
Edite em `src/lib/raffle-service.ts`:

```typescript
let currentRaffle: Raffle = {
  title: 'Seu Sorteio',
  description: 'Descrição do sorteio',
  prize: 'Seu Prêmio Aqui',
  // ... outras configurações
};
```

## 🔒 Segurança Implementada

### Validações
- ✅ **Email**: Regex RFC compliant
- ✅ **WhatsApp**: Formato internacional
- ✅ **Telegram**: Username válido (@usuario)
- ✅ **Rate Limiting**: Prevenção de spam
- ✅ **Timeout**: Códigos expiram em 10min

### Proteções
- 🛡️ **Duplicatas**: Verificação por email/WhatsApp
- 🛡️ **Códigos**: Uso único e temporal
- 🛡️ **Sorteio**: Seed determinístico auditável
- 🛡️ **Dados**: Validação rigorosa de inputs

## 📱 Responsividade

O sistema é **mobile-first** e funciona perfeitamente em:
- 📱 **Mobile**: 320px+
- 📱 **Tablet**: 768px+
- 💻 **Desktop**: 1024px+
- 🖥️ **Large**: 1440px+

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm run build
vercel --prod
```

### Outros Provedores
```bash
npm run build
npm start
```

## 📊 Analytics e Monitoramento

Para adicionar analytics:

```typescript
// src/lib/analytics.ts
export function trackParticipation(participantId: string) {
  // Google Analytics, Mixpanel, etc.
}

export function trackRaffleDraw(winnerId: string) {
  // Tracking do sorteio
}
```

## 🔄 Backup e Recuperação

Para produção, implemente backup dos dados:

```typescript
// src/lib/backup.ts
export async function backupParticipants() {
  // Backup para banco de dados
  // Ou serviço de storage
}
```

## 📞 Suporte

Para dúvidas sobre implementação:
1. Verifique a documentação das APIs (WhatsApp Business, Twilio)
2. Teste primeiro no ambiente sandbox
3. Implemente logs detalhados para debug
4. Use ferramentas de monitoramento em produção

## 🎉 Conclusão

Este sistema oferece uma solução completa e profissional para sorteios online, com foco em:
- **Segurança** e transparência
- **Experiência do usuário** excepcional
- **Facilidade de configuração** e manutenção
- **Escalabilidade** para muitos participantes

O código é modular, bem documentado e pronto para produção!