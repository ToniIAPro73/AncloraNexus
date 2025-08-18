# Configuración de Autenticación - Frontend y Backend

## Cambios Realizados

### 1. Frontend - Archivo `frontend/src/services/api.ts`

#### Interfaces Actualizadas:
- **User**: Actualizada para coincidir con la estructura del backend
- **LoginData**: Password ahora es requerido
- **RegisterData**: Password ahora es requerido

#### Funciones Implementadas:
- **login()**: Conecta con `/api/auth/login` del backend
- **register()**: Conecta con `/api/auth/register` del backend  
- **verifyToken()**: Conecta con `/api/auth/verify-token` del backend
- **getProfile()**: Conecta con `/api/auth/profile` del backend

### 2. Frontend - Archivo `frontend/src/auth/AuthContext.tsx`

#### Correcciones:
- **refreshUser()**: Corregida para usar la respuesta directa de `getProfile()`

### 3. Configuración de Entorno

#### Archivos Creados:
- **frontend/.env**: Configuración de URL de la API
- **frontend/.env.example**: Ejemplo de configuración

## Cómo Probar

### 1. Iniciar el Backend
```bash
cd backend
python -m flask run
```

### 2. Iniciar el Frontend
```bash
cd frontend
npm run dev
```

### 3. Probar la Autenticación

#### Opción A: Usar la Interfaz Web
1. Navegar a `http://localhost:3000`
2. Usar el formulario de login/registro
3. Credenciales de prueba:
   - Email: `ancoratest@dominio.com`
   - Password: `Ancoratest123`

#### Opción B: Usar el Script de Prueba
```bash
cd frontend
node test-auth.js
```

## Estructura de Respuestas del Backend

### Login/Register Exitoso (200/201):
```json
{
  "message": "Inicio de sesión exitoso",
  "access_token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "Usuario Test",
    "credits": 100,
    "plan": "FREE",
    "plan_info": {
      "name": "Gratuito",
      "monthly_credits": 10,
      "daily_limit": 5
    },
    "total_conversions": 0,
    "is_active": true
  }
}
```

### Error (400/401/409):
```json
{
  "error": "Mensaje de error específico"
}
```

## Flujo de Autenticación

1. **Login**: Usuario envía credenciales → Backend valida → Devuelve token JWT
2. **Token Storage**: Frontend guarda token en localStorage
3. **Requests Autenticados**: Frontend incluye `Authorization: Bearer <token>` en headers
4. **Verificación**: Backend valida token en cada request protegido
5. **Logout**: Frontend elimina token del localStorage

## Variables de Entorno

### Frontend (.env):
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Backend:
Asegúrate de que el backend esté configurado con:
- Flask-JWT-Extended
- CORS habilitado para el frontend
- Base de datos configurada

## Notas Importantes

- El token JWT tiene una duración de 7 días
- Las contraseñas deben cumplir con los requisitos de seguridad del backend
- Los errores del servidor se propagan correctamente al frontend
- El sistema maneja automáticamente la expiración de tokens
