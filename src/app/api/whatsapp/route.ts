// src/app/api/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

export async function GET(request: NextRequest) {
  // Webhook verification
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado com sucesso');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('Falha na verificação do webhook');
    return new NextResponse('Forbidden', { status: 403 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log para debug (remover em produção)
    console.log('Webhook recebido:', JSON.stringify(body, null, 2));

    // Verificar se é uma mensagem
    if (body.entry?.[0]?.changes?.[0]?.value?.messages) {
      const messages = body.entry[0].changes[0].value.messages;
      
      for (const message of messages) {
        const from = message.from;
        const messageText = message.text?.body;
        
        console.log(`Mensagem recebida de ${from}: ${messageText}`);
        
        // Aqui você pode implementar lógica para processar respostas
        // Por exemplo, se alguém responder "PARAR" para cancelar mensagens
        if (messageText?.toUpperCase().includes('PARAR')) {
          console.log(`Usuário ${from} solicitou parar mensagens`);
          // Implementar lógica de opt-out
        }
      }
    }

    // Verificar se é um status de entrega
    if (body.entry?.[0]?.changes?.[0]?.value?.statuses) {
      const statuses = body.entry[0].changes[0].value.statuses;
      
      for (const status of statuses) {
        console.log(`Status da mensagem ${status.id}: ${status.status}`);
        
        if (status.status === 'failed') {
          console.error(`Falha ao entregar mensagem para ${status.recipient_id}`);
        }
      }
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}