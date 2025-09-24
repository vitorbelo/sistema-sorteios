import axios from 'axios';

export class WhatsAppService {
  private static baseURL = process.env.WHATSAPP_API_URL;
  private static accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  static async sendVerificationCode(to: string, code: string): Promise<boolean> {
    try {
      // Formatar número (remover caracteres especiais)
      const phoneNumber = to.replace(/\D/g, '');
      
      const messageData = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: `🎯 Código de verificação: ${code}\n\nNão compartilhe este código com ninguém.\n\nVálido por 10 minutos.`
        }
      };

      const response = await axios.post(
        this.baseURL!,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 segundos timeout
        }
      );

      console.log('WhatsApp enviado com sucesso:', response.data);
      return true;

    } catch (error: any) {
      console.error('Erro ao enviar WhatsApp:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      return false;
    }
  }

  static async sendWinnerNotification(to: string, name: string, prize: string): Promise<boolean> {
    try {
      const phoneNumber = to.replace(/\D/g, '');
      
      const messageData = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: `🎉 PARABÉNS ${name}!\n\nVocê foi o GANHADOR do sorteio!\n\nPrêmio: ${prize}\n\nEntraremos em contato em breve para entrega.`
        }
      };

      const response = await axios.post(
        this.baseURL!,
        messageData,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log('Notificação de ganhador enviada:', response.data);
      return true;

    } catch (error: any) {
      console.error('Erro ao notificar ganhador:', error.message);
      return false;
    }
  }

  // Método para testar a conexão com a API
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      // Tentar fazer uma requisição simples para verificar credenciais
      const response = await axios.get(
        `${this.baseURL}/../`, // URL base para teste
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 5000
        }
      );

      return {
        success: true,
        message: 'Conexão com WhatsApp API estabelecida com sucesso'
      };

    } catch (error: any) {
      return {
        success: false,
        message: `Erro na conexão: ${error.message}`
      };
    }
  }

  // Método para validar configuração
  static validateConfig(): { isValid: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!this.baseURL) missing.push('WHATSAPP_API_URL');
    if (!this.accessToken) missing.push('WHATSAPP_ACCESS_TOKEN');

    return {
      isValid: missing.length === 0,
      missing
    };
  }
}