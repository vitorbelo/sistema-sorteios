import { NextResponse } from 'next/server';
import { RaffleService } from '@/lib/raffle-service';

export async function GET() {
  try {
    console.log('Buscando histórico de sorteios...');
    
    const historicalRaffles = await RaffleService.getHistoricalRaffles();
    
    console.log(`Encontrados ${historicalRaffles.length} sorteios históricos`);
    
    return NextResponse.json(historicalRaffles);
  } catch (error) {
    console.error('Erro na API de histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}