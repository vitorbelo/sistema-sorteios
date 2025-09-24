import { NextResponse } from 'next/server';
import { RaffleService } from '@/lib/raffle-service';

export async function GET() {
  try {
    const stats = await RaffleService.getRaffleStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json({
      totalParticipants: 0,
      validatedParticipants: 0,
      timeRemaining: 'Erro',
      isActive: false
    });
  }
}