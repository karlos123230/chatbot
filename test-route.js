// Script de teste para verificar se a rota está funcionando
const testRoute = async () => {
  try {
    console.log('🔍 Testando rota /api/find-numbers...');
    
    const response = await fetch('http://localhost:3001/api/find-numbers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ddd: '11', 
        quantity: 5 
      })
    });

    console.log('Status:', response.status);
    console.log('Headers:', response.headers);

    if (response.status === 404) {
      console.error('❌ Rota não encontrada! Verifique se o servidor foi reiniciado.');
    } else if (response.status === 400) {
      const data = await response.json();
      console.log('⚠️ Erro 400:', data);
    } else {
      console.log('✅ Rota encontrada!');
    }
  } catch (error) {
    console.error('❌ Erro ao testar:', error.message);
  }
};

testRoute();
