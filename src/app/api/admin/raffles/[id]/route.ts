import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT - Atualizar sorteio
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, prize, endDate, isActive } = body;

    // Se está ativando este sorteio, desativar os outros
    if (isActive) {
      await prisma.raffle.updateMany({
        where: { 
          isActive: true,
          id: { not: params.id }
        },
        data: { isActive: false }
      });
    }

    const raffle = await prisma.raffle.update({
      where: { id: params.id },
      data: {
        title,
        description,
        prize,
        endDate: endDate ? new Date(endDate) : null,
        isActive
      }
    });

    return NextResponse.json(raffle);
  } catch (error) {
    console.error('Erro ao atualizar sorteio:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// DELETE - Deletar sorteio
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Primeiro, deletar participantes relacionados
    await prisma.participant.deleteMany({
      where: { raffleId: params.id }
    });

    // Depois, deletar o sorteio
    await prisma.raffle.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar sorteio:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}