async function runTest(env: string) {
  const baseUrl = env === 'prod' ? 'https://atendaz.vercel.app' : 'http://localhost:3000';
  
  console.log(`🚀 Iniciando Teste de Fumaça (DOD) no ambiente: ${env.toUpperCase()}`);
  console.log(`🔗 URL: ${baseUrl}`);

  try {
    // 1. Testar Seed
    console.log('\n1. Populando banco de dados (Seed)...');
    const seedRes = await fetch(`${baseUrl}/api/admin/seed`);
    const seedData = await seedRes.json();
    
    if (seedRes.ok && seedData.planosInseridos === 3) {
      console.log('✅ Seed finalizado com sucesso (3 planos inseridos).');
    } else {
      throw new Error(`Falha no Seed: ${JSON.stringify(seedData)}`);
    }

    // 2. Testar Health Check
    console.log('\n2. Verificando Health Check...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();

    if (healthRes.ok && healthData.database === 'connected') {
      console.log('✅ Health Check: OK (Banco conectado).');
    } else {
      throw new Error(`Falha no Health Check: ${JSON.stringify(healthData)}`);
    }

    console.log('\n✨ TESTE CONCLUÍDO COM SUCESSO! ✨');
    process.exit(0);
  } catch (error: any) {
    console.error(`\n❌ TESTE FALHOU: ${error.message}`);
    process.exit(1);
  }
}

const targetEnv = process.argv[2] || 'local';
runTest(targetEnv);
