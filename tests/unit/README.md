# Pruebas Unitarias - Anclora Metaform

Este directorio contiene las pruebas unitarias para el backend de Anclora Metaform.

## Configuración

### Instalación de dependencias

Antes de ejecutar las pruebas, asegúrate de tener instaladas las dependencias:

```bash
# Desde el directorio backend/
pip install -r requirements.txt
pip install -r requirements-test.txt
```

### Estructura de archivos
```
tests/unit/
├── conftest.py              # Configuración de fixtures para pytest
├── test_user_model.py       # Pruebas para el modelo User
├── test_conversion_models.py # Pruebas para Conversion y CreditTransaction
├── test_conversion_engine.py # Pruebas para ConversionEngine
└── README.md               # Este archivo
```

## Ejecutar las pruebas

### Todas las pruebas unitarias
```bash
# Desde el directorio raíz del proyecto
python -m pytest tests/unit/ -v
```

### Pruebas específicas
```bash
# Modelo User
python -m pytest tests/unit/test_user_model.py -v

# Modelos Conversion y CreditTransaction
python -m pytest tests/unit/test_conversion_models.py -v

# Motor de conversión
python -m pytest tests/unit/test_conversion_engine.py -v
```

## Pruebas del modelo User

Las pruebas cubren las siguientes funcionalidades:

### 🔐 Métodos de contraseña
- ✅ `set_password()` - Verifica que las contraseñas se hashean correctamente
- ✅ `check_password()` - Valida contraseñas correctas e incorrectas

### 💳 Métodos de créditos
- ✅ `consume_credits()` - Consume créditos cuando hay saldo suficiente
- ✅ `consume_credits()` - Rechaza operaciones con saldo insuficiente
- ✅ `add_credits()` - Añade créditos correctamente

### 🔧 Métodos utilitarios
- ✅ `reset_daily_usage()` - Resetea el uso diario de créditos
- ✅ `get_plan_info()` - Retorna información correcta de todos los planes
- ✅ `to_dict()` - Serialización con y sin información sensible

### 🏗️ Pruebas de integración
- ✅ Creación de usuarios con valores por defecto
- ✅ Persistencia en base de datos

## Cobertura actual

Las pruebas actuales proporcionan un **94% de cobertura** del modelo User.

## Fixtures disponibles

### `app`
Aplicación Flask configurada para testing con base de datos en memoria.

### `client`
Cliente de pruebas para realizar requests HTTP.

### `user_data`
Datos de usuario de prueba estándar.

### `user`
Usuario de prueba ya creado y guardado en la base de datos.

## Notas importantes

- Las pruebas utilizan SQLite en memoria (`sqlite:///:memory:`) para aislamiento
- Cada prueba se ejecuta en una transacción independiente
- Los datos se limpian automáticamente después de cada prueba
- Las contraseñas se verifican usando bcrypt para asegurar el hashing correcto

## Agregar nuevas pruebas

Para agregar nuevas pruebas:

1. Crear una nueva clase de prueba siguiendo el patrón `TestNombreFuncionalidad`
2. Usar las fixtures existentes o crear nuevas en `conftest.py`
3. Seguir la convención de nombres `test_metodo_escenario`
4. Documentar el propósito de cada prueba con docstrings descriptivos

Ejemplo:
```python
class TestUserNewFeature:
    """Pruebas para nueva funcionalidad del usuario"""
    
    def test_new_method_happy_path(self, app, user_data):
        """Prueba que el nuevo método funciona correctamente"""
        # Implementación de la prueba
```