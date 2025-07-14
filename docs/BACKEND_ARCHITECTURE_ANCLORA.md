# Arquitectura Backend Anclora Converter
## Sistema Completo de Gestión de Usuarios, Retención de Archivos y Monetización Flexible

**Autor:** Manus AI  
**Fecha:** 14 de Julio, 2025  
**Versión:** 1.0

---

## Resumen Ejecutivo

Este documento presenta la arquitectura completa del backend para Anclora Converter, diseñado para soportar un modelo de negocio flexible que combina suscripciones tradicionales con pagos por conversión individual y un sistema de recompensas gamificado. La solución propuesta maximiza la monetización mientras ofrece múltiples opciones de acceso a los usuarios, desde conversiones puntuales hasta planes empresariales.

La arquitectura se basa en Flask como framework principal, PostgreSQL como base de datos, Redis para caché y gestión de sesiones, y Stripe para procesamiento de pagos. El sistema incluye políticas inteligentes de retención de archivos, autenticación robusta, y un programa de recompensas que incentiva el uso continuado de la plataforma.

## Introducción y Contexto

Anclora Converter ha evolucionado desde una herramienta simple de conversión de archivos hasta una plataforma profesional que requiere un backend robusto para soportar múltiples modelos de monetización. La necesidad de gestionar usuarios, retener archivos temporalmente según el plan del usuario, permitir pagos individuales, y recompensar la fidelidad del cliente, requiere una arquitectura backend sofisticada pero escalable.

El mercado actual de conversión de archivos está dominado por herramientas que ofrecen modelos rígidos: o completamente gratuitas con limitaciones severas, o de pago con compromisos mensuales. Anclora Converter se diferencia al ofrecer flexibilidad total: desde conversiones puntuales pagadas individualmente hasta planes empresariales con retención extendida de archivos y funcionalidades avanzadas.

Esta flexibilidad requiere un backend que pueda manejar múltiples tipos de usuarios simultáneamente: usuarios anónimos que realizan conversiones puntuales, usuarios registrados con planes gratuitos limitados, suscriptores de planes premium, y clientes empresariales con necesidades específicas. Cada tipo de usuario tiene diferentes políticas de retención de archivos, límites de uso, y acceso a funcionalidades.




## Análisis de Requisitos del Sistema

### Requisitos Funcionales Principales

El sistema backend debe soportar una amplia gama de funcionalidades que permitan la operación eficiente de Anclora Converter como plataforma de conversión de archivos profesional. Los requisitos funcionales se organizan en cinco categorías principales: gestión de usuarios, procesamiento de archivos, monetización, gamificación, y administración.

**Gestión de Usuarios y Autenticación**

El sistema debe permitir el registro de usuarios mediante email y contraseña, con verificación de email obligatoria para activar la cuenta. Los usuarios pueden acceder mediante autenticación tradicional o a través de proveedores OAuth como Google, Microsoft, y GitHub. Cada usuario tiene un perfil completo que incluye información personal, preferencias de conversión, historial de actividad, y estadísticas de uso.

La gestión de sesiones debe ser robusta, permitiendo sesiones persistentes en múltiples dispositivos con la capacidad de revocar sesiones individuales por seguridad. El sistema debe soportar diferentes roles de usuario: anónimo, registrado gratuito, suscriptor premium, y administrador, cada uno con permisos específicos y acceso a funcionalidades diferenciadas.

**Sistema de Planes y Suscripciones**

El backend debe gestionar múltiples tipos de planes de suscripción con características diferenciadas. El plan gratuito incluye conversiones limitadas mensuales, retención de archivos por 24 horas, y acceso a formatos básicos. Los planes premium ofrecen conversiones ilimitadas, retención extendida (7-30 días según el plan), acceso a todos los formatos, y funcionalidades avanzadas como conversión por lotes y API access.

Cada plan tiene límites específicos que el sistema debe monitorear y aplicar en tiempo real. Esto incluye límites de conversiones mensuales, tamaño máximo de archivos, número de archivos simultáneos, y acceso a funcionalidades específicas. El sistema debe permitir upgrades y downgrades de planes con prorrateado automático de facturación.

**Retención Temporal de Archivos**

Una de las funcionalidades más importantes es el sistema de retención temporal de archivos convertidos. Los archivos originales y convertidos se almacenan en el servidor por un período determinado según el plan del usuario. Los usuarios anónimos que realizan pagos individuales tienen acceso inmediato al archivo convertido pero sin retención posterior. Los usuarios del plan gratuito mantienen acceso a sus archivos por 24 horas, mientras que los planes premium extienden este período hasta 30 días.

El sistema debe implementar limpieza automática de archivos expirados, notificaciones a usuarios antes de la expiración, y la capacidad de extender la retención mediante pagos adicionales. Los archivos deben estar organizados por usuario y fecha, con metadatos que incluyan información de conversión, tamaño, formato original y final, y fecha de expiración.

**Pagos por Conversión Individual**

Para maximizar la flexibilidad y capturar usuarios que no desean comprometerse con suscripciones, el sistema debe soportar pagos individuales por conversión. Cada tipo de conversión tiene un precio específico basado en la complejidad del proceso, el tamaño del archivo, y la demanda de recursos del servidor.

El sistema de precios debe ser dinámico, calculando el costo exacto antes de procesar la conversión. Los usuarios pueden ver el precio estimado, confirmar el pago, y proceder con la conversión. Los pagos se procesan mediante Stripe, con soporte para tarjetas de crédito, PayPal, y métodos de pago locales según la región del usuario.

### Requisitos No Funcionales

**Rendimiento y Escalabilidad**

El sistema debe soportar al menos 1,000 conversiones simultáneas sin degradación del rendimiento. Los tiempos de respuesta para operaciones de usuario (login, consulta de archivos, inicio de conversión) deben ser inferiores a 500ms. Las conversiones de archivos pueden tomar más tiempo dependiendo del tamaño y complejidad, pero el sistema debe proporcionar feedback en tiempo real sobre el progreso.

La arquitectura debe ser escalable horizontalmente, permitiendo agregar servidores adicionales para manejar aumentos en la demanda. El almacenamiento de archivos debe soportar crecimiento ilimitado mediante soluciones cloud como AWS S3 o equivalentes.

**Seguridad y Privacidad**

Todos los datos de usuario deben estar encriptados en tránsito y en reposo. Las contraseñas se almacenan usando hashing bcrypt con salt único por usuario. Los archivos subidos por usuarios deben estar protegidos contra acceso no autorizado, con URLs firmadas temporalmente para descarga.

El sistema debe cumplir con GDPR y regulaciones de privacidad similares, incluyendo la capacidad de exportar y eliminar completamente todos los datos de un usuario. Los logs del sistema deben registrar todas las operaciones críticas para auditoría, pero sin incluir información sensible.

**Disponibilidad y Confiabilidad**

El sistema debe mantener 99.9% de uptime, con mecanismos de failover automático en caso de fallos de servidor. Los archivos de usuario deben tener backup automático con retención de al menos 30 días. El sistema debe recuperarse automáticamente de fallos menores y alertar a administradores en caso de problemas críticos.

Las conversiones en progreso deben ser resilientes a interrupciones, con capacidad de reanudar procesos interrumpidos. Los usuarios deben recibir notificaciones claras sobre el estado de sus conversiones y cualquier problema que pueda surgir.


## Diseño de Base de Datos

### Esquema Relacional Completo

El diseño de la base de datos para Anclora Converter utiliza PostgreSQL como sistema de gestión principal, aprovechando sus capacidades avanzadas para manejo de JSON, índices complejos, y transacciones ACID. El esquema está optimizado para consultas frecuentes mientras mantiene la integridad referencial y flexibilidad para futuras expansiones.

**Tabla Users - Gestión Central de Usuarios**

La tabla Users constituye el núcleo del sistema de gestión de usuarios, almacenando información esencial y preferencias de cada usuario registrado. Cada usuario tiene un identificador único UUID que se utiliza como clave primaria, proporcionando mejor seguridad y distribución que los enteros secuenciales tradicionales.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    preferred_language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    notification_preferences JSONB DEFAULT '{"email": true, "browser": true}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    oauth_providers JSONB DEFAULT '[]'
);
```

Los campos de notificación utilizan JSONB para almacenar preferencias complejas de manera eficiente, permitiendo consultas rápidas y actualizaciones parciales. El campo oauth_providers almacena información sobre proveedores de autenticación externa utilizados por el usuario, facilitando la gestión de múltiples métodos de acceso.

**Tabla Subscription_Plans - Definición de Planes**

Esta tabla define los diferentes planes de suscripción disponibles en la plataforma, con flexibilidad para modificar características sin afectar usuarios existentes. Cada plan incluye límites específicos y características que se evalúan en tiempo real durante el uso de la plataforma.

```sql
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2) NOT NULL,
    price_yearly DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'EUR',
    max_conversions_monthly INTEGER,
    max_file_size_mb INTEGER NOT NULL,
    file_retention_hours INTEGER NOT NULL,
    max_simultaneous_conversions INTEGER DEFAULT 1,
    api_access BOOLEAN DEFAULT FALSE,
    batch_conversion BOOLEAN DEFAULT FALSE,
    priority_processing BOOLEAN DEFAULT FALSE,
    advanced_formats BOOLEAN DEFAULT FALSE,
    features JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

El campo features utiliza JSONB para almacenar características específicas del plan de manera flexible, permitiendo agregar nuevas funcionalidades sin modificar el esquema de base de datos. Esto facilita la experimentación con diferentes combinaciones de características y la personalización de planes para clientes específicos.

**Tabla User_Subscriptions - Suscripciones Activas**

Esta tabla gestiona las suscripciones activas de usuarios, incluyendo información de facturación y estado de pago. Soporta tanto suscripciones mensuales como anuales, con capacidad para manejar cambios de plan y períodos de gracia.

```sql
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP NOT NULL,
    current_period_end TIMESTAMP NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    canceled_at TIMESTAMP,
    trial_start TIMESTAMP,
    trial_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

La integración con Stripe se maneja mediante el campo stripe_subscription_id, que permite sincronizar el estado de suscripciones entre ambos sistemas. El campo status soporta múltiples estados: active, past_due, canceled, unpaid, y trialing, proporcionando control granular sobre el acceso a funcionalidades.

**Tabla Files - Gestión de Archivos Convertidos**

El sistema de gestión de archivos es fundamental para la funcionalidad de retención temporal. Esta tabla almacena metadatos de todos los archivos procesados, incluyendo información de conversión y políticas de expiración.

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    original_filename VARCHAR(255) NOT NULL,
    original_format VARCHAR(20) NOT NULL,
    target_format VARCHAR(20) NOT NULL,
    original_size_bytes BIGINT NOT NULL,
    converted_size_bytes BIGINT,
    original_file_path TEXT NOT NULL,
    converted_file_path TEXT,
    conversion_status VARCHAR(50) DEFAULT 'pending',
    conversion_started_at TIMESTAMP,
    conversion_completed_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    download_count INTEGER DEFAULT 0,
    last_downloaded_at TIMESTAMP,
    conversion_parameters JSONB DEFAULT '{}',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

El campo session_id permite asociar archivos con usuarios anónimos que realizan conversiones puntuales, mientras que user_id se utiliza para usuarios registrados. Los parámetros de conversión se almacenan en formato JSONB, permitiendo guardar configuraciones específicas utilizadas en cada conversión para reproducibilidad y análisis.

**Tabla Conversion_Transactions - Pagos Individuales**

Para soportar el modelo de pagos por conversión individual, esta tabla registra todas las transacciones de pago realizadas fuera del contexto de suscripciones regulares.

```sql
CREATE TABLE conversion_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id VARCHAR(255),
    file_id UUID REFERENCES files(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    stripe_payment_intent_id VARCHAR(255) UNIQUE,
    payment_status VARCHAR(50) DEFAULT 'pending',
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);
```

Esta tabla permite rastrear pagos individuales tanto para usuarios registrados como anónimos, proporcionando un historial completo de transacciones para análisis financiero y soporte al cliente.

### Índices y Optimizaciones

Para garantizar rendimiento óptimo, el esquema incluye índices estratégicamente ubicados en campos frecuentemente consultados:

```sql
-- Índices para consultas de usuario
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);

-- Índices para archivos y conversiones
CREATE INDEX idx_files_user_id ON files(user_id);
CREATE INDEX idx_files_session_id ON files(session_id);
CREATE INDEX idx_files_expires_at ON files(expires_at);
CREATE INDEX idx_files_conversion_status ON files(conversion_status);

-- Índices para suscripciones
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_current_period_end ON user_subscriptions(current_period_end);

-- Índices para transacciones
CREATE INDEX idx_conversion_transactions_user_id ON conversion_transactions(user_id);
CREATE INDEX idx_conversion_transactions_session_id ON conversion_transactions(session_id);
CREATE INDEX idx_conversion_transactions_payment_status ON conversion_transactions(payment_status);
```

Estos índices optimizan las consultas más frecuentes del sistema, incluyendo autenticación de usuarios, verificación de límites de plan, limpieza de archivos expirados, y consultas de historial de transacciones.


## Sistema de Retención Temporal de Archivos

### Políticas de Retención por Tipo de Usuario

El sistema de retención temporal de archivos constituye una de las características más distintivas de Anclora Converter, proporcionando valor diferenciado según el nivel de suscripción del usuario. Las políticas de retención están diseñadas para incentivar upgrades de plan mientras mantienen una experiencia positiva para todos los usuarios.

**Usuarios Anónimos - Conversión Puntual**

Los usuarios que realizan conversiones sin registro tienen acceso inmediato al archivo convertido mediante una URL firmada temporalmente válida por 2 horas. Durante este período, pueden descargar el archivo las veces que necesiten, pero no existe retención posterior. Esta política equilibra la utilidad inmediata con la incentivación al registro.

El sistema genera URLs firmadas usando tokens JWT con expiración automática, garantizando que los archivos no permanezcan accesibles indefinidamente. Los archivos físicos se eliminan automáticamente 4 horas después de la conversión, proporcionando un margen de seguridad para descargas en progreso.

**Plan Gratuito - Retención 24 Horas**

Los usuarios registrados en el plan gratuito mantienen acceso a sus archivos convertidos durante 24 horas completas desde la finalización de la conversión. Durante este período, pueden acceder a sus archivos desde cualquier dispositivo mediante su cuenta, descargarlos múltiples veces, y compartir enlaces de descarga con otros usuarios.

El sistema envía notificaciones automáticas 2 horas antes de la expiración, recordando al usuario que descargue sus archivos o considere un upgrade de plan para retención extendida. Esta ventana de notificación proporciona tiempo suficiente para acción sin ser intrusiva.

**Planes Premium - Retención Extendida**

Los planes de suscripción premium ofrecen períodos de retención significativamente extendidos, creando valor tangible para usuarios que procesan archivos regularmente. El plan Professional mantiene archivos durante 7 días, el plan Business durante 15 días, y el plan Enterprise durante 30 días completos.

Además de la retención extendida, los usuarios premium tienen acceso a funcionalidades adicionales como historial completo de conversiones, organización en carpetas, etiquetado de archivos, y capacidad de extender la retención de archivos específicos mediante créditos adicionales.

### Implementación Técnica del Sistema de Limpieza

**Proceso de Limpieza Automática**

El sistema implementa un proceso de limpieza automática que se ejecuta cada hora, identificando y eliminando archivos que han superado su período de retención. El proceso utiliza una consulta optimizada que aprovecha el índice en el campo expires_at para identificar archivos candidatos para eliminación.

```python
def cleanup_expired_files():
    """
    Proceso de limpieza automática de archivos expirados
    Se ejecuta cada hora mediante cron job
    """
    current_time = datetime.utcnow()
    
    # Identificar archivos expirados
    expired_files = db.session.query(File).filter(
        File.expires_at <= current_time,
        File.conversion_status == 'completed'
    ).all()
    
    for file in expired_files:
        try:
            # Eliminar archivo físico del almacenamiento
            if os.path.exists(file.original_file_path):
                os.remove(file.original_file_path)
            if file.converted_file_path and os.path.exists(file.converted_file_path):
                os.remove(file.converted_file_path)
            
            # Actualizar registro en base de datos
            file.conversion_status = 'expired'
            file.original_file_path = None
            file.converted_file_path = None
            
            db.session.commit()
            
        except Exception as e:
            logger.error(f"Error cleaning up file {file.id}: {str(e)}")
            db.session.rollback()
```

El proceso mantiene los registros de metadatos en la base de datos para propósitos de auditoría y análisis, pero elimina los archivos físicos y marca el estado como 'expired'. Esto permite mantener estadísticas de uso sin consumir espacio de almacenamiento innecesario.

**Notificaciones de Expiración**

El sistema implementa un servicio de notificaciones que alerta a los usuarios sobre archivos próximos a expirar. Las notificaciones se envían mediante email y notificaciones push en el navegador, proporcionando múltiples oportunidades para que el usuario tome acción.

```python
def send_expiration_notifications():
    """
    Envía notificaciones de archivos próximos a expirar
    Se ejecuta cada 2 horas
    """
    notification_threshold = datetime.utcnow() + timedelta(hours=2)
    
    files_expiring_soon = db.session.query(File).join(User).filter(
        File.expires_at <= notification_threshold,
        File.expires_at > datetime.utcnow(),
        File.conversion_status == 'completed',
        File.expiration_notification_sent == False
    ).all()
    
    for file in files_expiring_soon:
        send_email_notification(
            user=file.user,
            template='file_expiring_soon',
            context={
                'filename': file.original_filename,
                'expires_at': file.expires_at,
                'download_url': generate_download_url(file.id)
            }
        )
        
        file.expiration_notification_sent = True
        db.session.commit()
```

Las notificaciones incluyen enlaces directos para descarga inmediata y opciones para extender la retención mediante upgrade de plan o compra de créditos adicionales.

### Gestión de Almacenamiento y Costos

**Estrategia de Almacenamiento Híbrido**

Para optimizar costos mientras mantiene rendimiento, el sistema utiliza una estrategia de almacenamiento híbrido. Los archivos recién convertidos se almacenan en almacenamiento SSD de alta velocidad para acceso inmediato, mientras que archivos con más de 24 horas se migran automáticamente a almacenamiento estándar más económico.

Los archivos de usuarios premium con retención extendida se mantienen en almacenamiento estándar pero con replicación automática para garantizar disponibilidad. Esta estrategia reduce costos operativos mientras mantiene la experiencia de usuario esperada para cada nivel de plan.

**Monitoreo de Uso y Proyecciones**

El sistema incluye herramientas de monitoreo que rastrean el uso de almacenamiento por tipo de plan, formato de archivo, y patrones temporales. Esta información se utiliza para optimizar políticas de retención y proyectar costos futuros de infraestructura.

```python
def generate_storage_analytics():
    """
    Genera análisis de uso de almacenamiento
    """
    analytics = {
        'total_files': db.session.query(File).count(),
        'total_storage_gb': db.session.query(
            func.sum(File.original_size_bytes + File.converted_size_bytes)
        ).scalar() / (1024**3),
        'by_plan': {},
        'by_format': {},
        'retention_efficiency': calculate_retention_efficiency()
    }
    
    # Análisis por plan de suscripción
    for plan in SubscriptionPlan.query.all():
        plan_files = db.session.query(File).join(User).join(UserSubscription).filter(
            UserSubscription.plan_id == plan.id,
            File.conversion_status == 'completed'
        ).all()
        
        analytics['by_plan'][plan.name] = {
            'file_count': len(plan_files),
            'total_size_gb': sum(f.original_size_bytes + f.converted_size_bytes for f in plan_files) / (1024**3),
            'avg_retention_days': plan.file_retention_hours / 24
        }
    
    return analytics
```

Estos análisis informan decisiones sobre precios, políticas de retención, y inversiones en infraestructura, asegurando que el modelo de negocio permanezca sostenible mientras escala.


## Sistema de Pagos por Conversión Individual

### Modelo de Precios Dinámicos

El sistema de pagos por conversión individual representa una innovación significativa en el mercado de conversión de archivos, permitiendo a usuarios acceder a funcionalidades premium sin comprometerse con suscripciones mensuales. El modelo de precios dinámicos calcula el costo exacto de cada conversión basándose en múltiples factores que reflejan el uso real de recursos del servidor.

**Factores de Cálculo de Precios**

El algoritmo de precios considera cinco factores principales para determinar el costo de cada conversión. El tipo de conversión constituye el factor base, con conversiones simples como imagen a imagen costando menos que conversiones complejas como video a múltiples formatos. El tamaño del archivo influye directamente en el costo, ya que archivos más grandes requieren más recursos de procesamiento y almacenamiento.

La calidad de salida solicitada afecta significativamente el precio, especialmente para conversiones de video y audio donde la calidad superior requiere algoritmos más sofisticados y tiempo de procesamiento extendido. La demanda del servidor en tiempo real introduce un factor dinámico que incentiva el uso durante períodos de menor carga, similar a los modelos de precios de servicios cloud.

Finalmente, las funcionalidades adicionales como conversión por lotes, configuraciones avanzadas, o procesamiento prioritario agregan costos incrementales que reflejan el valor adicional proporcionado al usuario.

```python
def calculate_conversion_price(conversion_request):
    """
    Calcula el precio dinámico para una conversión específica
    """
    base_prices = {
        'image_to_image': 0.05,
        'document_to_document': 0.08,
        'audio_to_audio': 0.12,
        'video_to_video': 0.25,
        'document_to_image': 0.10,
        'complex_workflow': 0.40
    }
    
    # Precio base según tipo de conversión
    conversion_type = determine_conversion_type(
        conversion_request.source_format,
        conversion_request.target_format
    )
    base_price = base_prices.get(conversion_type, 0.15)
    
    # Multiplicador por tamaño de archivo
    size_multiplier = calculate_size_multiplier(conversion_request.file_size)
    
    # Multiplicador por calidad solicitada
    quality_multiplier = {
        'basic': 1.0,
        'standard': 1.3,
        'high': 1.8,
        'premium': 2.5
    }.get(conversion_request.quality, 1.0)
    
    # Factor de demanda del servidor
    server_load_factor = get_current_server_load_factor()
    
    # Funcionalidades adicionales
    feature_cost = calculate_additional_features_cost(conversion_request.features)
    
    total_price = (base_price * size_multiplier * quality_multiplier * server_load_factor) + feature_cost
    
    return round(total_price, 2)
```

**Transparencia de Precios**

Una característica fundamental del sistema es la transparencia completa de precios. Antes de procesar cualquier conversión, el usuario recibe un desglose detallado del costo, incluyendo cada factor que contribuye al precio final. Esta transparencia construye confianza y permite a los usuarios tomar decisiones informadas sobre sus conversiones.

El sistema muestra estimaciones de precio en tiempo real mientras el usuario configura su conversión, actualizando automáticamente cuando cambian parámetros como calidad de salida o funcionalidades adicionales. Esta retroalimentación inmediata mejora la experiencia de usuario y reduce el abandono durante el proceso de pago.

### Integración con Stripe

**Procesamiento de Pagos Seguro**

La integración con Stripe proporciona procesamiento de pagos seguro y confiable, soportando múltiples métodos de pago incluyendo tarjetas de crédito, débito, PayPal, y métodos de pago locales según la región del usuario. El sistema utiliza Stripe Payment Intents para manejar el flujo completo de pago, desde la autorización inicial hasta la confirmación final.

```python
import stripe
from flask import request, jsonify

@app.route('/api/create-payment-intent', methods=['POST'])
def create_payment_intent():
    """
    Crea un Payment Intent para conversión individual
    """
    try:
        data = request.get_json()
        
        # Calcular precio de conversión
        conversion_price = calculate_conversion_price(data['conversion_request'])
        
        # Crear Payment Intent en Stripe
        intent = stripe.PaymentIntent.create(
            amount=int(conversion_price * 100),  # Stripe usa centavos
            currency='eur',
            metadata={
                'conversion_type': data['conversion_request']['type'],
                'file_size': data['conversion_request']['file_size'],
                'user_id': data.get('user_id'),
                'session_id': data.get('session_id')
            }
        )
        
        # Guardar transacción en base de datos
        transaction = ConversionTransaction(
            user_id=data.get('user_id'),
            session_id=data.get('session_id'),
            amount=conversion_price,
            currency='EUR',
            stripe_payment_intent_id=intent.id,
            payment_status='pending'
        )
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'client_secret': intent.client_secret,
            'transaction_id': transaction.id,
            'amount': conversion_price
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400
```

**Manejo de Estados de Pago**

El sistema implementa un manejo robusto de estados de pago, incluyendo pagos pendientes, exitosos, fallidos, y reembolsos. Los webhooks de Stripe proporcionan notificaciones en tiempo real sobre cambios de estado, permitiendo al sistema responder inmediatamente a eventos de pago.

```python
@app.route('/api/stripe-webhook', methods=['POST'])
def stripe_webhook():
    """
    Maneja webhooks de Stripe para actualizar estados de pago
    """
    payload = request.get_data()
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, app.config['STRIPE_WEBHOOK_SECRET']
        )
    except ValueError:
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError:
        return 'Invalid signature', 400
    
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        
        # Actualizar transacción en base de datos
        transaction = ConversionTransaction.query.filter_by(
            stripe_payment_intent_id=payment_intent['id']
        ).first()
        
        if transaction:
            transaction.payment_status = 'completed'
            transaction.completed_at = datetime.utcnow()
            db.session.commit()
            
            # Iniciar proceso de conversión
            start_conversion_process(transaction.id)
    
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        
        transaction = ConversionTransaction.query.filter_by(
            stripe_payment_intent_id=payment_intent['id']
        ).first()
        
        if transaction:
            transaction.payment_status = 'failed'
            db.session.commit()
    
    return jsonify({'status': 'success'})
```

### Experiencia de Usuario Optimizada

**Flujo de Pago Simplificado**

El flujo de pago está diseñado para minimizar fricción mientras mantiene seguridad. Los usuarios pueden ver el precio estimado inmediatamente, confirmar la conversión con un clic, y completar el pago sin salir de la aplicación principal. El sistema recuerda métodos de pago para usuarios registrados, acelerando conversiones futuras.

Para usuarios anónimos, el sistema ofrece la opción de crear una cuenta durante el proceso de pago, proporcionando beneficios inmediatos como historial de conversiones y notificaciones de estado. Esta estrategia de conversión captura usuarios que inicialmente no planeaban registrarse.

**Gestión de Errores y Reembolsos**

El sistema incluye manejo robusto de errores de conversión, con reembolsos automáticos cuando las conversiones fallan por problemas del servidor. Los usuarios reciben notificaciones inmediatas sobre el estado de sus conversiones y cualquier problema que pueda surgir.

```python
def handle_conversion_failure(transaction_id, error_reason):
    """
    Maneja fallos de conversión y procesa reembolsos automáticos
    """
    transaction = ConversionTransaction.query.get(transaction_id)
    
    if transaction and transaction.payment_status == 'completed':
        try:
            # Crear reembolso en Stripe
            refund = stripe.Refund.create(
                payment_intent=transaction.stripe_payment_intent_id,
                reason='requested_by_customer',
                metadata={'reason': error_reason}
            )
            
            # Actualizar transacción
            transaction.payment_status = 'refunded'
            transaction.refund_reason = error_reason
            db.session.commit()
            
            # Notificar al usuario
            send_refund_notification(transaction.user_id, transaction.amount, error_reason)
            
        except Exception as e:
            logger.error(f"Error processing refund for transaction {transaction_id}: {str(e)}")
```

Esta política de reembolsos automáticos construye confianza del usuario y reduce la carga de soporte al cliente, mientras mantiene la reputación de la plataforma como confiable y centrada en el usuario.


## Programa de Recompensas y Gamificación

### Sistema de Puntos y Niveles

El programa de recompensas de Anclora Converter implementa un sistema sofisticado de gamificación que incentiva el uso continuado de la plataforma mientras proporciona valor tangible a usuarios leales. El sistema se basa en múltiples métricas de engagement que van más allá del simple volumen de conversiones, reconociendo diferentes tipos de valor que los usuarios aportan a la plataforma.

**Estructura de Puntos Multi-Dimensional**

El sistema de puntos considera cinco categorías principales de actividad del usuario. Las conversiones realizadas constituyen la fuente primaria de puntos, con diferentes valores según la complejidad de la conversión. Las conversiones simples otorgan 10 puntos, conversiones estándar 25 puntos, y conversiones complejas hasta 50 puntos. Este sistema incentiva el uso de funcionalidades avanzadas mientras recompensa toda actividad.

La consistencia de uso se recompensa mediante bonificaciones por racha, donde usuarios que realizan conversiones durante días consecutivos reciben multiplicadores de puntos. Una racha de 7 días otorga un multiplicador 1.2x, 14 días 1.5x, y 30 días 2.0x. Este mecanismo fomenta el hábito de uso regular y aumenta la retención de usuarios.

Las referencias exitosas proporcionan puntos sustanciales, con 500 puntos por cada usuario referido que se registra y 1000 puntos adicionales cuando el usuario referido realiza su primera conversión de pago. Este sistema de referidos gamificado amplifica el crecimiento orgánico de la plataforma.

La participación en la comunidad se recompensa mediante puntos por actividades como escribir reseñas, reportar bugs, sugerir mejoras, o participar en encuestas de usuario. Estas actividades, aunque no generan ingresos directos, proporcionan valor significativo para el desarrollo del producto.

Finalmente, los logros especiales otorgan puntos por hitos específicos como completar el primer mes de suscripción, usar todos los formatos disponibles, o alcanzar ciertos volúmenes de conversión. Estos logros proporcionan objetivos claros y momentos de celebración en la experiencia del usuario.

```python
class RewardSystem:
    def __init__(self):
        self.point_values = {
            'simple_conversion': 10,
            'standard_conversion': 25,
            'complex_conversion': 50,
            'referral_signup': 500,
            'referral_first_conversion': 1000,
            'review_written': 100,
            'bug_report': 200,
            'survey_completion': 50
        }
        
        self.streak_multipliers = {
            7: 1.2,
            14: 1.5,
            30: 2.0,
            60: 2.5,
            90: 3.0
        }
    
    def calculate_conversion_points(self, conversion_type, user_streak):
        """
        Calcula puntos por conversión incluyendo bonificación por racha
        """
        base_points = self.point_values.get(conversion_type, 10)
        streak_multiplier = self.get_streak_multiplier(user_streak)
        
        return int(base_points * streak_multiplier)
    
    def get_streak_multiplier(self, streak_days):
        """
        Obtiene multiplicador basado en días de racha consecutiva
        """
        for threshold in sorted(self.streak_multipliers.keys(), reverse=True):
            if streak_days >= threshold:
                return self.streak_multipliers[threshold]
        return 1.0
```

**Sistema de Niveles Progresivos**

Los usuarios avanzan a través de niveles basados en puntos acumulados, con cada nivel desbloqueando beneficios específicos. El sistema incluye 10 niveles principales, desde "Explorador" (0-999 puntos) hasta "Maestro Converter" (50,000+ puntos). Cada nivel requiere aproximadamente el doble de puntos que el anterior, creando una progresión satisfactoria pero desafiante.

Los beneficios por nivel incluyen descuentos incrementales en conversiones individuales, créditos gratuitos mensuales, acceso anticipado a nuevas funcionalidades, soporte prioritario, y límites aumentados para usuarios del plan gratuito. Los niveles más altos desbloquean funcionalidades exclusivas como conversiones por lotes ilimitadas, API access gratuito, y consultoría personalizada.

### Recompensas Tangibles

**Sistema de Créditos Gratuitos**

Los usuarios acumulan créditos gratuitos a través de diversas actividades, proporcionando valor monetario real por su engagement con la plataforma. Los créditos se otorgan por completar objetivos mensuales, mantener rachas de uso, referir nuevos usuarios, y alcanzar nuevos niveles en el sistema de recompensas.

```python
def award_monthly_credits(user_id):
    """
    Otorga créditos mensuales basados en actividad del usuario
    """
    user = User.query.get(user_id)
    user_stats = calculate_monthly_stats(user_id)
    
    credits_earned = 0
    
    # Créditos base por nivel
    level_credits = {
        1: 5, 2: 10, 3: 15, 4: 25, 5: 40,
        6: 60, 7: 85, 8: 115, 9: 150, 10: 200
    }
    credits_earned += level_credits.get(user.level, 0)
    
    # Bonificación por conversiones realizadas
    if user_stats['conversions'] >= 50:
        credits_earned += 50
    elif user_stats['conversions'] >= 20:
        credits_earned += 25
    elif user_stats['conversions'] >= 10:
        credits_earned += 10
    
    # Bonificación por racha mantenida
    if user_stats['longest_streak'] >= 30:
        credits_earned += 30
    elif user_stats['longest_streak'] >= 14:
        credits_earned += 15
    elif user_stats['longest_streak'] >= 7:
        credits_earned += 5
    
    # Otorgar créditos
    user.free_credits += credits_earned
    db.session.commit()
    
    return credits_earned
```

**Descuentos y Beneficios Exclusivos**

Los usuarios de niveles altos reciben descuentos automáticos en conversiones individuales y suscripciones. Los descuentos van desde 5% para usuarios nivel 3 hasta 25% para usuarios nivel 10. Estos descuentos se aplican automáticamente, proporcionando valor inmediato sin requerir códigos promocionales o procesos complicados.

Los beneficios exclusivos incluyen acceso anticipado a nuevas funcionalidades, participación en programas beta, sesiones de feedback directo con el equipo de desarrollo, y invitaciones a eventos virtuales exclusivos. Estos beneficios no monetarios crean una sensación de pertenencia a una comunidad exclusiva.

### Mecánicas de Engagement

**Objetivos y Desafíos**

El sistema presenta objetivos semanales y mensuales que varían según el nivel y comportamiento del usuario. Los objetivos pueden incluir realizar cierto número de conversiones, probar nuevos formatos, mantener una racha de uso, o invitar amigos a la plataforma. Completar objetivos otorga puntos bonus, créditos gratuitos, y progreso hacia logros especiales.

```python
def generate_weekly_challenges(user_id):
    """
    Genera desafíos semanales personalizados para el usuario
    """
    user = User.query.get(user_id)
    user_history = get_user_conversion_history(user_id, days=30)
    
    challenges = []
    
    # Desafío basado en formatos no utilizados
    unused_formats = get_unused_formats(user_history)
    if unused_formats:
        challenges.append({
            'type': 'try_new_format',
            'target': random.choice(unused_formats),
            'reward_points': 100,
            'reward_credits': 5,
            'description': f'Prueba convertir a formato {unused_formats[0]}'
        })
    
    # Desafío de volumen basado en historial
    avg_weekly_conversions = calculate_avg_weekly_conversions(user_history)
    target_conversions = max(3, int(avg_weekly_conversions * 1.2))
    
    challenges.append({
        'type': 'volume_challenge',
        'target': target_conversions,
        'reward_points': target_conversions * 15,
        'reward_credits': target_conversions * 2,
        'description': f'Realiza {target_conversions} conversiones esta semana'
    })
    
    # Desafío de racha
    current_streak = get_current_streak(user_id)
    if current_streak < 7:
        challenges.append({
            'type': 'streak_challenge',
            'target': 7,
            'reward_points': 200,
            'reward_credits': 10,
            'description': 'Mantén una racha de 7 días consecutivos'
        })
    
    return challenges
```

**Logros y Badges**

El sistema incluye más de 50 logros diferentes que reconocen diversos tipos de actividad y hitos. Los logros van desde básicos como "Primera Conversión" hasta extremadamente desafiantes como "Maestro de Todos los Formatos" (usar todos los formatos disponibles) o "Embajador" (referir 100 usuarios exitosamente).

Cada logro otorga puntos, créditos, y un badge visual que se muestra en el perfil del usuario. Los badges más raros se convierten en símbolos de estatus dentro de la comunidad, incentivando el engagement a largo plazo y creando objetivos aspiracionales para usuarios dedicados.

### Análisis y Optimización

**Métricas de Engagement**

El sistema de recompensas incluye análisis detallado de métricas de engagement para optimizar continuamente la efectividad del programa. Las métricas rastreadas incluyen tasa de participación en desafíos, tiempo promedio para completar objetivos, correlación entre nivel de usuario y retención, y impacto de recompensas específicas en comportamiento de usuario.

```python
def analyze_reward_program_effectiveness():
    """
    Analiza la efectividad del programa de recompensas
    """
    analytics = {
        'participation_rates': {},
        'retention_by_level': {},
        'reward_impact': {},
        'challenge_completion': {}
    }
    
    # Tasa de participación por tipo de desafío
    for challenge_type in ['volume_challenge', 'streak_challenge', 'try_new_format']:
        total_assigned = Challenge.query.filter_by(type=challenge_type).count()
        completed = Challenge.query.filter_by(type=challenge_type, status='completed').count()
        analytics['participation_rates'][challenge_type] = completed / total_assigned if total_assigned > 0 else 0
    
    # Retención por nivel de usuario
    for level in range(1, 11):
        level_users = User.query.filter_by(level=level).all()
        active_users = [u for u in level_users if is_user_active_last_30_days(u.id)]
        analytics['retention_by_level'][level] = len(active_users) / len(level_users) if level_users else 0
    
    return analytics
```

Estos análisis informan ajustes regulares al programa, incluyendo modificación de valores de puntos, introducción de nuevos tipos de desafíos, y refinamiento de recompensas para maximizar engagement y satisfacción del usuario.


## Arquitectura Técnica del Backend

### Stack Tecnológico Completo

La arquitectura técnica de Anclora Converter utiliza un stack moderno y escalable diseñado para manejar alta concurrencia mientras mantiene flexibilidad para futuras expansiones. El backend se construye sobre Flask como framework principal, aprovechando su simplicidad y extensibilidad para crear una API robusta que soporta tanto la aplicación web como futuras integraciones móviles y de terceros.

**Framework y Estructura de Aplicación**

Flask proporciona la base del backend, organizado en una estructura modular que separa claramente las responsabilidades. El patrón Blueprint se utiliza para organizar endpoints por funcionalidad: autenticación, gestión de archivos, pagos, recompensas, y administración. Esta organización facilita el mantenimiento y permite el desarrollo paralelo de diferentes módulos.

```python
# Estructura principal de la aplicación Flask
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])
    
    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    CORS(app, origins=['http://localhost:5173', 'https://anclora.com'])
    
    # Configurar rate limiting
    limiter = Limiter(
        app,
        key_func=get_remote_address,
        default_limits=["1000 per hour"]
    )
    
    # Registrar blueprints
    from app.auth import auth_bp
    from app.files import files_bp
    from app.payments import payments_bp
    from app.rewards import rewards_bp
    from app.admin import admin_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(files_bp, url_prefix='/api/files')
    app.register_blueprint(payments_bp, url_prefix='/api/payments')
    app.register_blueprint(rewards_bp, url_prefix='/api/rewards')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    return app
```

**Base de Datos y ORM**

PostgreSQL sirve como base de datos principal, elegida por su robustez, soporte para JSON nativo, y capacidades avanzadas de indexación. SQLAlchemy actúa como ORM, proporcionando una abstracción elegante sobre la base de datos mientras mantiene la flexibilidad para consultas SQL optimizadas cuando sea necesario.

Las migraciones de base de datos se gestionan mediante Flask-Migrate, permitiendo evolución controlada del esquema en diferentes entornos. El sistema incluye seeds de datos para desarrollo y testing, facilitando la configuración rápida de entornos nuevos.

**Autenticación y Autorización**

El sistema de autenticación utiliza JWT (JSON Web Tokens) para mantener sesiones sin estado, facilitando la escalabilidad horizontal. Los tokens incluyen claims personalizados que especifican el plan del usuario, nivel de recompensas, y permisos específicos, reduciendo consultas a base de datos para verificaciones de autorización.

```python
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

def generate_user_token(user):
    """
    Genera token JWT con claims personalizados
    """
    additional_claims = {
        'user_level': user.level,
        'plan_id': user.current_subscription.plan_id if user.current_subscription else None,
        'free_credits': user.free_credits,
        'permissions': get_user_permissions(user)
    }
    
    return create_access_token(
        identity=str(user.id),
        additional_claims=additional_claims,
        expires_delta=timedelta(hours=24)
    )

@jwt_required()
def protected_endpoint():
    """
    Endpoint protegido que utiliza información del token
    """
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    
    # Verificar permisos sin consulta a base de datos
    if 'api_access' not in claims.get('permissions', []):
        return jsonify({'error': 'API access required'}), 403
    
    # Procesar request...
```

### Gestión de Archivos y Almacenamiento

**Estrategia de Almacenamiento Multi-Tier**

El sistema implementa una estrategia de almacenamiento multi-tier que optimiza costos mientras mantiene rendimiento. Los archivos recién subidos se almacenan en almacenamiento SSD local para procesamiento inmediato, luego se migran a almacenamiento cloud según políticas de retención.

```python
import boto3
from werkzeug.utils import secure_filename
import os
from datetime import datetime, timedelta

class FileStorageManager:
    def __init__(self):
        self.s3_client = boto3.client('s3')
        self.local_storage_path = '/tmp/anclora_files'
        self.s3_bucket = 'anclora-file-storage'
    
    def store_uploaded_file(self, file, user_id, session_id=None):
        """
        Almacena archivo subido en almacenamiento local temporal
        """
        filename = secure_filename(file.filename)
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        
        # Crear directorio de usuario si no existe
        user_dir = os.path.join(self.local_storage_path, str(user_id) if user_id else session_id)
        os.makedirs(user_dir, exist_ok=True)
        
        # Guardar archivo localmente
        local_path = os.path.join(user_dir, unique_filename)
        file.save(local_path)
        
        return local_path
    
    def migrate_to_cloud_storage(self, local_path, retention_days):
        """
        Migra archivo a almacenamiento cloud con política de retención
        """
        filename = os.path.basename(local_path)
        s3_key = f"user_files/{filename}"
        
        # Subir a S3 con metadatos de retención
        self.s3_client.upload_file(
            local_path,
            self.s3_bucket,
            s3_key,
            ExtraArgs={
                'Metadata': {
                    'retention_days': str(retention_days),
                    'upload_date': datetime.utcnow().isoformat()
                }
            }
        )
        
        # Eliminar archivo local
        os.remove(local_path)
        
        return f"s3://{self.s3_bucket}/{s3_key}"
```

**Procesamiento Asíncrono**

Las conversiones de archivos se procesan de manera asíncrona utilizando Celery con Redis como broker de mensajes. Esta arquitectura permite manejar conversiones de larga duración sin bloquear la API principal, mientras proporciona actualizaciones de estado en tiempo real a los usuarios.

```python
from celery import Celery
import redis

# Configuración de Celery
celery_app = Celery('anclora_converter')
celery_app.config_from_object('app.celery_config')

# Cliente Redis para actualizaciones de estado
redis_client = redis.Redis(host='localhost', port=6379, db=0)

@celery_app.task(bind=True)
def process_file_conversion(self, file_id, conversion_params):
    """
    Tarea asíncrona para procesar conversión de archivos
    """
    try:
        # Actualizar estado inicial
        self.update_state(state='PROCESSING', meta={'progress': 0})
        redis_client.set(f"conversion_status:{file_id}", 'processing')
        
        # Cargar archivo y parámetros
        file_record = File.query.get(file_id)
        
        # Procesar conversión con actualizaciones de progreso
        for step, progress in enumerate([25, 50, 75, 100]):
            # Simular paso de procesamiento
            process_conversion_step(file_record, conversion_params, step)
            
            # Actualizar progreso
            self.update_state(state='PROCESSING', meta={'progress': progress})
            redis_client.set(f"conversion_progress:{file_id}", progress)
        
        # Finalizar conversión
        file_record.conversion_status = 'completed'
        file_record.conversion_completed_at = datetime.utcnow()
        db.session.commit()
        
        # Notificar finalización
        redis_client.set(f"conversion_status:{file_id}", 'completed')
        send_conversion_complete_notification(file_record.user_id, file_id)
        
        return {'status': 'completed', 'file_id': file_id}
        
    except Exception as e:
        # Manejar errores y reembolsos automáticos
        handle_conversion_error(file_id, str(e))
        return {'status': 'failed', 'error': str(e)}
```

### Monitoreo y Observabilidad

**Logging Estructurado**

El sistema implementa logging estructurado utilizando formato JSON para facilitar análisis y alertas automáticas. Los logs incluyen información contextual como user_id, session_id, conversion_id, y métricas de rendimiento para cada operación.

```python
import logging
import json
from datetime import datetime

class StructuredLogger:
    def __init__(self, name):
        self.logger = logging.getLogger(name)
        handler = logging.StreamHandler()
        handler.setFormatter(self.JSONFormatter())
        self.logger.addHandler(handler)
        self.logger.setLevel(logging.INFO)
    
    class JSONFormatter(logging.Formatter):
        def format(self, record):
            log_entry = {
                'timestamp': datetime.utcnow().isoformat(),
                'level': record.levelname,
                'message': record.getMessage(),
                'module': record.module,
                'function': record.funcName,
                'line': record.lineno
            }
            
            # Agregar contexto adicional si está disponible
            if hasattr(record, 'user_id'):
                log_entry['user_id'] = record.user_id
            if hasattr(record, 'conversion_id'):
                log_entry['conversion_id'] = record.conversion_id
            if hasattr(record, 'duration_ms'):
                log_entry['duration_ms'] = record.duration_ms
            
            return json.dumps(log_entry)
    
    def log_conversion_start(self, user_id, file_id, conversion_type):
        self.logger.info(
            "Conversion started",
            extra={
                'user_id': user_id,
                'conversion_id': file_id,
                'conversion_type': conversion_type,
                'event_type': 'conversion_start'
            }
        )
```

**Métricas y Alertas**

El sistema expone métricas de rendimiento y negocio mediante endpoints de Prometheus, permitiendo monitoreo en tiempo real y alertas automáticas. Las métricas incluyen latencia de API, tasa de conversiones exitosas, ingresos por hora, y utilización de recursos.

## Conclusiones y Recomendaciones

### Beneficios del Sistema Propuesto

La arquitectura backend propuesta para Anclora Converter representa una solución integral que aborda todos los requisitos de un sistema moderno de conversión de archivos con monetización flexible. El diseño modular facilita el desarrollo incremental y la escalabilidad, mientras que las tecnologías elegidas proporcionan una base sólida para crecimiento futuro.

El sistema de retención temporal de archivos diferenciado por plan crea incentivos claros para upgrades de suscripción, mientras que el modelo de pagos por conversión individual captura usuarios que no están listos para comprometerse con suscripciones mensuales. Esta flexibilidad maximiza la monetización al servir diferentes segmentos de usuarios con necesidades variadas.

El programa de recompensas gamificado fomenta el engagement a largo plazo y crea una comunidad de usuarios leales que actúan como embajadores de la marca. Los análisis detallados del comportamiento de usuario proporcionan insights valiosos para optimización continua del producto y estrategias de marketing.

### Roadmap de Implementación

**Fase 1 (Semanas 1-4): Infraestructura Base**
- Configuración del entorno de desarrollo y producción
- Implementación de modelos de base de datos y migraciones
- Sistema básico de autenticación y autorización
- Endpoints fundamentales de gestión de usuarios

**Fase 2 (Semanas 5-8): Gestión de Archivos**
- Sistema de subida y almacenamiento de archivos
- Implementación de políticas de retención
- Proceso de limpieza automática
- Integración con servicios de conversión

**Fase 3 (Semanas 9-12): Monetización**
- Integración completa con Stripe
- Sistema de pagos por conversión individual
- Gestión de suscripciones y planes
- Procesamiento de reembolsos automáticos

**Fase 4 (Semanas 13-16): Gamificación**
- Sistema de puntos y niveles
- Programa de recompensas
- Desafíos y logros
- Dashboard de estadísticas de usuario

**Fase 5 (Semanas 17-20): Optimización y Lanzamiento**
- Testing exhaustivo y optimización de rendimiento
- Implementación de monitoreo y alertas
- Documentación completa de API
- Preparación para lanzamiento en producción

### Consideraciones de Escalabilidad

El diseño propuesto soporta escalabilidad horizontal mediante la separación de responsabilidades entre diferentes servicios. La API principal puede replicarse en múltiples instancias, mientras que el procesamiento de archivos se maneja mediante workers de Celery que pueden escalarse independientemente según la demanda.

La base de datos PostgreSQL puede escalarse mediante read replicas para consultas de solo lectura, mientras que el almacenamiento de archivos en cloud proporciona escalabilidad prácticamente ilimitada. El uso de Redis para caché y gestión de sesiones reduce la carga en la base de datos principal.

### Estimación de Costos Operativos

Los costos operativos del sistema incluyen infraestructura de servidores, almacenamiento de archivos, procesamiento de pagos, y servicios de terceros. Para una base de usuarios de 10,000 usuarios activos mensuales con 50,000 conversiones, los costos estimados son:

- Infraestructura de servidores: €800/mes
- Almacenamiento cloud: €300/mes  
- Procesamiento de pagos (Stripe): €450/mes (3% de €15,000 ingresos)
- Servicios adicionales (monitoring, email): €150/mes

Total estimado: €1,700/mes, representando aproximadamente 11% de ingresos proyectados, manteniendo márgenes saludables para crecimiento y reinversión.

La arquitectura propuesta posiciona Anclora Converter como una plataforma robusta, escalable, y rentable que puede competir efectivamente en el mercado de conversión de archivos mientras proporcionando experiencias superiores a usuarios de todos los segmentos.

