import { PrismaClient } from '@prisma/client';
import { generateTicketNumber, generateVerificationCode, generateRaffleSeed, selectWinner } from './utils';

const prisma = new PrismaClient();

export class RaffleService {
  static async registerParticipant(data: {
    name: string;
    email: string;
    telegram: string;
    whatsapp: string;
  }): Promise<{ success: boolean; message: string; participantId?: string }> {
    try {
      // Verificar duplicatas
      const existingParticipant = await prisma.participant.findFirst({
        where: {
          OR: [
            { email: data.email },
            { whatsapp: data.whatsapp }
          ]
        }
      });
      
      if (existingParticipant) {
        return {
          success: false,
          message: 'Email ou WhatsApp já cadastrado!'
        };
      }

      // Buscar sorteio ativo
      const activeRaffle = await prisma.raffle.findFirst({
        where: { isActive: true }
      });

      if (!activeRaffle) {
        return {
          success: false,
          message: 'Nenhum sorteio ativo no momento!'
        };
      }

      // Criar participante
      const participant = await prisma.participant.create({
        data: {
          name: data.name,
          email: data.email,
          telegram: data.telegram,
          whatsapp: data.whatsapp,
          ticketNumber: generateTicketNumber(),
          raffleId: activeRaffle.id
        }
      });

      // Gerar código de verificação
      const code = generateVerificationCode();
      await prisma.verificationCode.create({
        data: {
          code,
          whatsapp: data.whatsapp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      });

      // Simular envio via WhatsApp (aparece no console)
      console.log(`SIMULAÇÃO - Código para ${data.whatsapp}: ${code}`);

      return {
        success: true,
        message: 'Código de verificação enviado via WhatsApp!',
        participantId: participant.id
      };
    } catch (error) {
      console.error('Erro ao registrar participante:', error);
      return {
        success: false,
        message: 'Erro interno. Tente novamente.'
      };
    }
  }

  static async verifyCode(participantId: string, code: string): Promise<{ success: boolean; message: string; ticket?: string }> {
    try {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId }
      });

      if (!participant) {
        return { success: false, message: 'Participante não encontrado!' };
      }

      const verificationCode = await prisma.verificationCode.findFirst({
        where: {
          whatsapp: participant.whatsapp,
          code: code,
          isUsed: false,
          expiresAt: { gt: new Date() }
        }
      });

      if (!verificationCode) {
        return { success: false, message: 'Código inválido ou expirado!' };
      }

      // Marcar código como usado
      await prisma.verificationCode.update({
        where: { id: verificationCode.id },
        data: { isUsed: true }
      });
      
      // Validar participante
      await prisma.participant.update({
        where: { id: participantId },
        data: { 
          isValidated: true,
          validatedAt: new Date()
        }
      });

      return {
        success: true,
        message: 'Participação confirmada com sucesso!',
        ticket: participant.ticketNumber
      };
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    }
  }

  static async resendCode(participantId: string): Promise<{ success: boolean; message: string }> {
    try {
      const participant = await prisma.participant.findUnique({
        where: { id: participantId }
      });

      if (!participant) {
        return { success: false, message: 'Participante não encontrado!' };
      }

      // Invalidar códigos anteriores
      await prisma.verificationCode.updateMany({
        where: { whatsapp: participant.whatsapp },
        data: { isUsed: true }
      });

      // Gerar novo código
      const code = generateVerificationCode();
      await prisma.verificationCode.create({
        data: {
          code,
          whatsapp: participant.whatsapp,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        }
      });

      console.log(`SIMULAÇÃO - Novo código para ${participant.whatsapp}: ${code}`);

      return { success: true, message: 'Novo código enviado!' };
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    }
  }

  static async getValidatedParticipants() {
    const activeRaffle = await prisma.raffle.findFirst({
      where: { isActive: true },
      include: {
        participants: {
          where: { isValidated: true },
          orderBy: { validatedAt: 'asc' }
        }
      }
    });

    return activeRaffle?.participants || [];
  }

  static async getRaffleStats() {
    try {
      const activeRaffle = await prisma.raffle.findFirst({
        where: { isActive: true },
        include: {
          participants: true
        }
      });
  
      if (!activeRaffle) {
        return {
          totalParticipants: 0,
          validatedParticipants: 0,
          timeRemaining: 'Nenhum sorteio ativo',
          isActive: false
        };
      }
  
      // Garantir que participants é um array
      const participants = activeRaffle.participants || [];
      const validatedCount = participants.filter((participant: { isValidated: boolean; }) => participant.isValidated === true).length;
  
      return {
        totalParticipants: participants.length,
        validatedParticipants: validatedCount,
        timeRemaining: activeRaffle.endDate ? RaffleService.formatTimeRemaining(activeRaffle.endDate) : undefined,
        isActive: activeRaffle.isActive
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalParticipants: 0,
        validatedParticipants: 0,
        timeRemaining: 'Erro',
        isActive: false
      };
    }
  }

  static async getCurrentRaffle() {
    const activeRaffle = await prisma.raffle.findFirst({
      where: { isActive: true },
      include: {
        participants: {
          where: { isValidated: true }
        }
      }
    });

    return activeRaffle;
  }

  static async drawWinner() {
    try {
      console.log('Iniciando sorteio...');
      
      const activeRaffle = await prisma.raffle.findFirst({
        where: { isActive: true },
        include: {
          participants: {
            where: { isValidated: true }
          }
        }
      });
  
      console.log('Sorteio encontrado:', activeRaffle?.id);
      console.log('Participantes validados:', activeRaffle?.participants.length);
  
      if (!activeRaffle || activeRaffle.participants.length === 0) {
        console.log('Nenhum participante encontrado');
        return { success: false };
      }
  
      const seed = generateRaffleSeed();
      const winner = selectWinner(activeRaffle.participants, seed);
  
      console.log('Ganhador selecionado:', winner.name);
  
      await prisma.raffle.update({
        where: { id: activeRaffle.id },
        data: {
          winnerId: winner.id,
          drawnAt: new Date(),
          seed: seed,
          isActive: false
        }
      });
  
      console.log('Sorteio finalizado com sucesso');
  
      return {
        success: true,
        winner,
        seed
      };
    } catch (error) {
      console.error('Erro ao realizar sorteio:', error);
      return { success: false };
    }
  }

  // NOVO MÉTODO: Buscar histórico de sorteios
  static async getHistoricalRaffles() {
    try {
      const historicalRaffles = await prisma.raffle.findMany({
        where: {
          isActive: false, // Apenas sorteios finalizados
        },
        include: {
          participants: {
            where: {
              isValidated: true,
            },
          },
          winner: true, // Inclui dados do ganhador
        },
        orderBy: {
          drawnAt: 'desc', // Mais recentes primeiro
        },
      });

      return historicalRaffles.map((raffle: any) => ({
        id: raffle.id,
        title: raffle.title,
        description: raffle.description,
        prize: raffle.prize,
        startDate: raffle.startDate.toISOString(),
        endDate: raffle.endDate ? raffle.endDate.toISOString() : raffle.startDate.toISOString(),
        drawDate: raffle.drawnAt ? raffle.drawnAt.toISOString() : null,
        isActive: raffle.isActive,
        isCompleted: !!raffle.winner,
        totalParticipants: raffle.participants.length,
        winner: raffle.winner ? {
          id: raffle.winner.id,
          name: raffle.winner.name,
          email: raffle.winner.email,
          whatsapp: raffle.winner.whatsapp,
          telegram: raffle.winner.telegram,
          ticketNumber: raffle.winner.ticketNumber,
        } : undefined,
      }));
    } catch (error) {
      console.error('Erro ao buscar histórico de sorteios:', error);
      return [];
    }
  }

  // NOVO MÉTODO: Buscar participantes do sorteio ativo (para dashboard)
  static async getParticipants() {
    try {
      const activeRaffle = await prisma.raffle.findFirst({
        where: { isActive: true },
      });

      if (!activeRaffle) {
        return [];
      }

      const participants = await prisma.participant.findMany({
        where: { raffleId: activeRaffle.id },
        orderBy: { createdAt: 'desc' },
      });

      return participants.map((p: any) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        whatsapp: p.whatsapp,
        telegram: p.telegram,
        ticketNumber: p.ticketNumber,
        isValidated: p.isValidated,
        validatedAt: p.validatedAt?.toISOString(),
        createdAt: p.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      return [];
    }
  }

  static formatTimeRemaining(endDate: Date): string {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return "Encerrado";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }
}