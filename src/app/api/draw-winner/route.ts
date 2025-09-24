import { NextResponse } from 'next/server';
import { RaffleService } from '@/lib/raffle-service';

export async function POST() {
  try {
    const result = await RaffleService.drawWinner();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
}