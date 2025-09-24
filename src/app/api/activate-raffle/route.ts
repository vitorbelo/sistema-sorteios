// src/app/api/activate-raffle/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { raffleId } = await request.json();

    if (!raffleId) {
      return NextResponse.json(
        { error: 'ID do sorteio é obrigatório' },
        { status: 400 }
      );
    }

    // Primeiro, desativar todos os outros sorteios
    await prisma.raffle.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    });

    // Ativar o sorteio selecionado
    const updatedRaffle = await prisma.raffle.update({
      where: { id: raffleId },
      data: { isActive: true }
    });

    console.log('Sorteio ativado:', updatedRaffle.id);

    return NextResponse.json({
      success: true,
      message: 'Sorteio ativado com sucesso!',
      raffle: updatedRaffle
    });
  } catch (error) {
    console.error('Erro ao ativar sorteio:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Listar todos os sorteios (para seleção)
export async function GET() {
  try {
    const raffles = await prisma.raffle.findMany({
      select: {
        id: true,
        title: true,
        prize: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(raffles);
  } catch (error) {
    console.error('Erro ao buscar sorteios:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}