import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/whatsapp-service';

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json();
    
    const sent = await WhatsAppService.sendVerificationCode(phone, '123456');
    
    return NextResponse.json({
      success: sent,
      message: sent ? 'Mensagem enviada' : 'Falha no envio'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro interno'
    });
  }
}