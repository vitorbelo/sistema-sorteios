// Script para cadastrar participantes de teste
// Execute: node populate-participants.js

const participantesData = [
    {
      name: "Ana Silva Santos",
      email: "ana.silva@teste.com",
      telegram: "@anasilva",
      whatsapp: "11987654321"
    },
    {
      name: "Bruno Costa Lima",
      email: "bruno.costa@teste.com", 
      telegram: "@brunocosta",
      whatsapp: "11876543210"
    },
    {
      name: "Carla Oliveira",
      email: "carla.oliveira@teste.com",
      telegram: "@carlaoliveira", 
      whatsapp: "11765432109"
    },
    {
      name: "Diego Ferreira",
      email: "diego.ferreira@teste.com",
      telegram: "@diegoferreira",
      whatsapp: "11654321098"
    },
    {
      name: "Eduarda Mendes",
      email: "eduarda.mendes@teste.com",
      telegram: "@dudamendes",
      whatsapp: "11543210987"
    },
    {
      name: "Felipe Rodriguez",
      email: "felipe.rodriguez@teste.com",
      telegram: "@feliperod",
      whatsapp: "11432109876"
    },
    {
      name: "Gabriela Martins",
      email: "gabriela.martins@teste.com",
      telegram: "@gabimartins",
      whatsapp: "11321098765"
    },
    {
      name: "Henrique Alves",
      email: "henrique.alves@teste.com",
      telegram: "@henriquealves",
      whatsapp: "11210987654"
    },
    {
      name: "Isabella Pereira",
      email: "isabella.pereira@teste.com", 
      telegram: "@isapereira",
      whatsapp: "11109876543"
    },
    {
      name: "João Pedro Souza",
      email: "joao.souza@teste.com",
      telegram: "@joaopedro",
      whatsapp: "11098765432"
    }
  ];
  
  async function cadastrarParticipante(participante) {
    try {
      console.log(`📝 Cadastrando: ${participante.name}`);
      
      // 1. Registrar participante
      const registroResponse = await fetch('http://localhost:3000/api/register-participant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participante)
      });
  
      const registroResult = await registroResponse.json();
      
      if (!registroResult.success) {
        console.log(`❌ Erro ao registrar ${participante.name}: ${registroResult.message}`);
        return false;
      }
  
      console.log(`✅ Registrado com sucesso: ${participante.name}`);
      
      // 2. Simular verificação (aguardar um pouco para ver o código no console do servidor)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 3. Verificar com código padrão (123456 - você pode ajustar se necessário)
      const codigoResponse = await fetch('http://localhost:3000/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: registroResult.participantId,
          code: '123456' // Código padrão - ajuste se necessário
        })
      });
  
      const codigoResult = await codigoResponse.json();
      
      if (codigoResult.success) {
        console.log(`🎫 Verificado com ticket: ${codigoResult.ticket}`);
        return true;
      } else {
        console.log(`⚠️ Não foi possível verificar ${participante.name}: ${codigoResult.message}`);
        console.log(`   (Participante cadastrado, mas não verificado)`);
        return true; // Ainda conta como sucesso parcial
      }
      
    } catch (error) {
      console.log(`💥 Erro ao processar ${participante.name}:`, error.message);
      return false;
    }
  }
  
  async function popularSorteio() {
    console.log('🚀 Iniciando cadastro de participantes de teste...\n');
    
    let sucessos = 0;
    let erros = 0;
    
    for (const participante of participantesData) {
      const sucesso = await cadastrarParticipante(participante);
      
      if (sucesso) {
        sucessos++;
      } else {
        erros++;
      }
      
      // Pequena pausa entre cadastros
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(''); // Linha em branco para separar
    }
    
    console.log('📊 RESUMO FINAL:');
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📝 Total processados: ${participantesData.length}`);
    
    if (sucessos > 0) {
      console.log('\n🎉 Participantes cadastrados com sucesso!');
      console.log('🌐 Acesse http://localhost:3000 e clique em "Ver Dashboard" para visualizar');
    }
  }
  
  // Executar o script
  popularSorteio().catch(console.error);