import { supabase, checkSupabaseConnection, isSupabaseAvailable } from '../lib/supabase';
import { addProfessional, getAllProfessionals, Professional } from '../lib/professionals';

/**
 * Script de teste para verificar o cadastro de profissionais no Supabase
 * 
 * Como usar:
 * 1. Execute este script com: npm run ts-node src/tests/professional-test.ts
 * 2. Verifique os logs para confirmar se o teste foi bem-sucedido
 */

// Configuração de timeout global para o teste
const TEST_TIMEOUT = 30000; // 30 segundos

// Gera um CPF único para teste
function generateTestCPF() {
  const random9Digits = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  // Calculando o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(random9Digits[i]) * (10 - i);
  }
  const firstVerifier = 11 - (sum % 11);
  const firstDigit = firstVerifier > 9 ? 0 : firstVerifier;
  
  // Calculando o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(random9Digits[i]) * (11 - i);
  }
  sum += firstDigit * 2;
  const secondVerifier = 11 - (sum % 11);
  const secondDigit = secondVerifier > 9 ? 0 : secondVerifier;
  
  // Formatando o CPF no padrão 000.000.000-00
  const cpf = `${random9Digits.slice(0, 3)}.${random9Digits.slice(3, 6)}.${random9Digits.slice(6, 9)}-${firstDigit}${secondDigit}`;
  return cpf;
}

// Cria dados de teste para um profissional
function createTestProfessionalData(): Omit<Professional, 'id' | 'created_at' | 'updated_at'> {
  const testId = Math.floor(Math.random() * 1000000);
  return {
    name: `Profissional Teste ${testId}`,
    role: 'Enfermeiro',
    status: 'active' as const,
    start_date: new Date().toISOString().split('T')[0],
    cpf: generateTestCPF(),
    birth_date: '1990-01-01',
    work_hours: '08:00-17:00',
    work_city: 'São Paulo',
    salary: '5000',
    address: 'Rua de Teste, 123',
    phone: '(11) 98765-4321',
    email: `teste${testId}@example.com`,
  };
}

// Função principal de teste
async function testProfessionalRegistration() {
  console.log('🧪 Iniciando teste de cadastro de profissional');
  
  try {
    // Verificar conexão com o Supabase
    console.log('🔄 Verificando conexão com o Supabase...');
    const connectionStatus = await isSupabaseAvailable();
    
    if (!connectionStatus) {
      throw new Error('❌ Não foi possível conectar ao Supabase. Verifique sua conexão com a internet e as credenciais.');
    }
    
    console.log('✅ Conexão com o Supabase estabelecida');
    
    // Criar dados de teste
    const testData = createTestProfessionalData();
    console.log('📝 Dados de teste criados:', {
      name: testData.name,
      cpf: testData.cpf,
      email: testData.email
    });
    
    // Tentar cadastrar o profissional
    console.log('🔄 Enviando dados para cadastro...');
    const startTime = Date.now();
    const { data, error } = await addProfessional(testData);
    const endTime = Date.now();
    
    if (error) {
      throw new Error(`❌ Erro ao cadastrar profissional: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      throw new Error('❌ Profissional foi cadastrado, mas nenhum dado foi retornado');
    }
    
    console.log(`✅ Profissional cadastrado com sucesso em ${endTime - startTime}ms!`);
    console.log('📊 Dados retornados:', {
      id: data[0].id,
      name: data[0].name,
      cpf: data[0].cpf,
      created_at: data[0].created_at
    });
    
    // Verificar se o profissional foi realmente cadastrado consultando todos os profissionais
    console.log('🔄 Verificando se o profissional está no banco de dados...');
    const { data: allProfessionals } = await getAllProfessionals();
    
    const foundProfessional = allProfessionals?.find(p => p.id === data[0].id);
    
    if (!foundProfessional) {
      throw new Error('❌ Profissional não foi encontrado na lista de profissionais');
    }
    
    console.log('✅ Profissional encontrado no banco de dados!');
    
    // Limpar dados de teste (opcional - remover esta parte se quiser manter os dados)
    console.log('🧹 Limpando dados de teste...');
    const { error: deleteError } = await supabase
      .from('professionals')
      .delete()
      .eq('id', data[0].id);
    
    if (deleteError) {
      console.warn(`⚠️ Não foi possível limpar os dados de teste: ${deleteError.message}`);
    } else {
      console.log('✅ Dados de teste removidos com sucesso');
    }
    
    console.log('🎉 Teste concluído com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Teste falhou:', error);
    return false;
  }
}

// Executar o teste com timeout
const testPromise = testProfessionalRegistration();
const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => reject(new Error('⏱️ Teste excedeu o tempo limite de ' + TEST_TIMEOUT / 1000 + ' segundos')), TEST_TIMEOUT);
});

Promise.race([testPromise, timeoutPromise])
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  })
  .finally(() => {
    // Encerrar a aplicação após o teste
    setTimeout(() => {
      console.log('👋 Encerrando teste...');
      process.exit(0);
    }, 1000);
  }); 