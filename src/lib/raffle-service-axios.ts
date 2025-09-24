import { PrismaClient } from '@prisma/client';
import { WhatsAppService } from './whatsapp-service';
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
      // Verificar se WhatsApp está configurado
      const configCheck = WhatsAppService.validateConfig();
      if (!configCheck.isValid) {
        console.warn('WhatsApp não configurado, usando modo simulação');
      }

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
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
        }
      });

      // Enviar código via WhatsApp
      let sent = false;
      if (configCheck.isValid) {
        sent = await WhatsAppService.sendVerificationCode(data.whatsapp, code);
      } else {
        // Modo simulação para desenvolvimento
        console.log(`SIMULAÇÃO - Código para ${data.whatsapp}: ${code}`);
        sent = true;
      }
      
      if (!sent) {
        return {
          success: false,
          message: 'Erro ao enviar código. Tente novamente.'
        };
      }

      return {
        success: true,
        message: configCheck.isValid 
          ? 'Código de verificação enviado via WhatsApp!' 
          : 'Código gerado (modo desenvolvimento)',
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

      // Verificar se WhatsApp está configurado
      const configCheck = WhatsAppService.validateConfig();

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

      // Enviar via WhatsApp
      let sent = false;
      if (configCheck.isValid) {
        sent = await WhatsAppService.sendVerificationCode(participant.whatsapp, code);
      } else {
        console.log(`SIMULAÇÃO - Novo código para ${participant.whatsapp}: ${code}`);
        sent = true;
      }
      
      if (!sent) {
        return { success: false, message: 'Erro ao enviar código.' };
      }

      return { 
        success: true, 
        message: configCheck.isValid ? 'Novo código enviado!' : 'Novo código gerado (modo desenvolvimento)'
      };
    } catch (error) {
      console.error('Erro ao reenviar código:', error);
      return { success: false, message: 'Erro interno. Tente novamente.' };
    }
  }

  static async drawWinner() {
    try {
      const activeRaffle = await prisma.raffle.findFirst({
        where: { isActive: true },
        include: {
          participants: {
            where: { isValidated: true }
          }
        }
      });

      if (!activeRaffle || activeRaffle.participants.length === 0) {
        return { success: false };
      }

      const seed = generateRaffleSeed();
      const winner = selectWinner(activeRaffle.participants, seed);

      // Atualizar sorteio com o ganhador
      await prisma.raffle.update({
        where: { id: activeRaffle.id },
        data: {
          winnerId: winner.id,
          drawnAt: new Date(),
          seed: seed,
          isActive: false
        }
      });

      // Enviar notificação para o ganhador
      const configCheck = WhatsAppService.validateConfig();
      if (configCheck.isValid) {
        await WhatsAppService.sendWinnerNotification(
          winner.whatsapp, 
          winner.name, 
          activeRaffle.prize
        );
      } else {
        console.log(`SIMULAÇÃO - Notificação de vitória para ${winner.name} (${winner.whatsapp})`);
      }

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

  // Método para testar configuração do WhatsApp
  static async testWhatsAppConfig(): Promise<{ success: boolean; message: string }> {
    const configCheck = WhatsAppService.validateConfig();
    
    if (!configCheck.isValid) {
      return {
        success: false,
        message: `Configuração incompleta. Faltam: ${configCheck.missing.join(', ')}`
      };
    }

    return await WhatsAppService.testConnection();
  }

  // Outros métodos mantidos iguais...
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

    const validatedCount = activeRaffle.participants.filter(p => p.isValidated).length;

    return {
      totalParticipants: activeRaffle.participants.length,
      validatedParticipants: validatedCount,
      timeRemaining: activeRaffle.endDate ? this.formatTimeRemaining(activeRaffle.endDate) : undefined,
      isActive: activeRaffle.isActive
    };
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

  private static formatTimeRemaining(endDate: Date): string {
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