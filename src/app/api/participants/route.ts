import { NextResponse } from 'next/server';
import { RaffleService } from '@/lib/raffle-service';

export async function GET() {
  try {
    const participants = await RaffleService.getValidatedParticipants();
    return NextResponse.json(participants);
  } catch (error) {
    console.error('Erro na API:', error);
    return NextResponse.json([]);
  }
}