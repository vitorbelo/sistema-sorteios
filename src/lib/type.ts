export interface Participant {
    id: string;
    name: string;
    email: string;
    telegram: string;
    whatsapp: string;
    ticketNumber: string;
    isValidated: boolean;
    createdAt: Date;
    validatedAt?: Date;
  }
  
  export interface VerificationCode {
    code: string;
    whatsapp: string;
    expiresAt: Date;
    isUsed: boolean;
  }
  
  export interface Raffle {
    id: string;
    title: string;
    description: string;
    prize: string;
    startDate: Date;
    endDate?: Date;
    isActive: boolean;
    participants: Participant[];
    winner?: Participant;
    drawnAt?: Date;
    seed?: string;
  }
  
  export interface RaffleStats {
    totalParticipants: number;
    validatedParticipants: number;
    timeRemaining?: string;
    isActive: boolean;
  }