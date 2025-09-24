import { NextResponse } from 'next/server';
import { RaffleService } from '@/lib/raffle-service';

export async function POST() {
  try {
    const result = await RaffleService.testWhatsAppConfig();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Erro interno no teste'
    });
  }
}