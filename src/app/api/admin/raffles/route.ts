import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Listar todos os sorteios
export async function GET() {
  try {
    const raffles = await prisma.raffle.findMany({
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            isValidated: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(raffles);
  } catch (error) {
    console.error('Erro ao buscar sorteios:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar novo sorteio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, prize, endDate } = body;

    // Desativar sorteios ativos anteriores se necessário
    if (body.setAsActive) {
      await prisma.raffle.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      });
    }

    const raffle = await prisma.raffle.create({
      data: {
        title,
        description,
        prize,
        endDate: endDate ? new Date(endDate) : null,
        isActive: body.setAsActive || false
      }
    });

    return NextResponse.json(raffle);
  } catch (error) {
    console.error('Erro ao criar sorteio:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}