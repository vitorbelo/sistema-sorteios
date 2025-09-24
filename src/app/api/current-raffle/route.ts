import { NextResponse } from 'next/server';
import { RaffleService } from '@/lib/raffle-service';

export async function GET() {
  try {
    const raffle = await RaffleService.getCurrentRaffle();
    return NextResponse.json(raffle);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json(null);
  }
}