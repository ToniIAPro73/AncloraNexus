// Script de prueba para verificar la conexiÃ³n con el backend
const API_BASE_URL = 'http://localhost:8000/api';

async function testLogin() {
  try {
    console.log('Probando conexiÃ³n con el backend...');
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ancloratest@dominio.com',
        password: 'Alcloratest123',
      }),
    });

    console.log('Status:', response.status);
    const data = await response.json();
    console.log('Response:', data);

    if (response.ok) {
      console.log('âœ… Login exitoso');
      console.log('Token:', data.access_token);
      console.log('Usuario:', data.user);
    } else {
      console.log('âŒ Error en login:', data.error);
    }
  } catch (error) {
    console.log('âŒ Error de conexiÃ³n:', error.message);
  }
}

// Ejecutar la prueba si el backend estÃ¡ corriendo
testLogin();
