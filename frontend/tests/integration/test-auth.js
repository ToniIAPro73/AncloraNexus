// Script de prueba para verificar la conexión con el backend
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8000/api';

async function testLogin() {
  try {
    console.log('Probando conexión con el backend…');

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
    const data = await response.json().catch(() => ({}));
    console.log('Response:', data);

    if (response.ok) {
      console.log('✅ Login exitoso');
      console.log('Token:', data.access_token);
      console.log('Usuario:', data.user);
    } else {
      console.log('❌ Error en login:', data.error || data.message || data);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error.message);
  }
}

// Ejecutar la prueba si el backend está corriendo
testLogin();
