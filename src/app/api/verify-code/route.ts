import { NextRequest, NextResponse } from 'next/server';
import { RaffleService } from '@/lib/raffle-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { participantId, code } = body;

    const result = await RaffleService.verifyCode(participantId, code);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    }, { status: 500 });
  }
}