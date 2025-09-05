# Plan de Mejora — Anclora Nexus (rama ugment-dev)

Fecha: 2025-09-05
Autor: Auditoría técnica automatizada

## Resumen Ejecutivo
- Arquitectura bien documentada y modular (frontend React + backend Flask + sistema de conversión + créditos + WebSockets).
- Desalineaciones doc ↔ código, inconsistencias de configuración y pequeños errores de encoding que impactan mantenibilidad y despliegue.
- Prioridades: alinear contratos API front/back, unificar configuración (DB/CORS), endurecer seguridad de auth y ficheros, desacoplar build del frontend, mover conversiones pesadas a workers, y limpiar artefactos versionados.

## Objetivos
- Mejorar confiabilidad, seguridad y mantenibilidad.
- Alinear documentación y realidad del código.
- Preparar base para escalar a producción (observabilidad y CI/CD sólidos).

---

## Estado Actual (basado en código y docs)
- Frontend (Vite + React 18 + TS + Tailwind): flujo index.html → main.tsx → MainApp → pages/app(AppPage) → NewApp → MainLayout → SafeConversor.
- Backend (Flask): src/main.py + blueprints outes/{auth,conversion,credits,ai_analysis}.py, SocketIO src/ws.py, modelos src/models/*.
- Documentación: docs/ESQUEMA_ARQUITECTURA_ANCLORA_NEXUS.md + docs de backend/arquitectura/depoy.
- Métricas: prometheus-flask-exporter activo.
- Tests: backend (pytest) y frontend (Vitest a11y); CI Github Actions ejecuta ambos.

---

## Hallazgos Clave
1) Doc ↔ Código desalineados
- Framework: documenta “FastAPI/Flask” pero el servidor es Flask puro.
- Rutas duplicadas: ackend/src/routes/* y ackend/src/api/routes/* coexisten; conviene consolidar.
- Endpoints de créditos: frontend usa /billing/* pero backend expone /api/credits/*.

2) Configuración y Paths
- main.py fija SQLALCHEMY_DATABASE_URI ignorando Config.SQLALCHEMY_DATABASE_URI.
- DB SQLite (ackend/src/models/database/app.db) está versionada.
- rontend/dist y assets pesados están versionados.

3) Calidad/Encoding
- Cadenas con caracteres corruptos (ej. “invǭlido”, “crǸditos”) y comillas mal pegadas en respuestas.
- Logs de depuración en producción (pi.ts hace console.log de URLs y tokens de flujo).

4) Seguridad
- JWT sólo con access token en localStorage; falta refresh/rotación o cookies httpOnly.
- Validación de archivos parcialmente integrada; riesgo por uploads.
- CORS/SocketIO definidos con listas pero sin política única/central.

5) Arquitectura de conversión
- Conversiones potencialmente pesadas en proceso web; no hay workers/colas.
- Falta interfaz estándar “plugin” para models/conversions/* con registro dinámico.

6) Observabilidad y datos
- Métricas presentes; falta logging estructurado, request-id y tracing.
- Ficheros temporales y backups en paths del proyecto/OS sin políticas de retención.

---

## Quick Wins (1–2 semanas)
- Endpoints: unificar a /api/credits/* (o añadir alias /api/billing/*). Ajustar rontend/src/services/api.ts.
- Config DB: eliminar override en main.py y usar Config.SQLALCHEMY_DATABASE_URI. Añadir Alembic y .gitignore para *.db.
- Encoding: normalizar a UTF-8, corregir mensajes y comillas en outes/*.py y respuestas JSON.
- Limpieza repo: dejar de versionar rontend/dist/, ackend/src/models/database/app.db, binarios/ZIP grandes; reforzar .gitignore.
- CORS/WS: única fuente Config.ALLOWED_ORIGINS aplicada a Flask y SocketIO.
- Frontend: quitar dependencia 
ext si no se usa; suprimir console.log en prod.

---

## Mejoras de Arquitectura (3–6 semanas)
- App Factory Flask + módulo create_app(config); tests más aislables y config única.
- Workers: Celery/RQ + Redis para conversiones; progreso por WebSocket.
- Interfaz de conversores: registrar capacidades y costos por plugin; detección dinámica.
- Descargas: URLs firmadas, expirables; streaming/chunking; limpieza automática de outputs.
- Config centralizada: .env → Config; no duplicar rutas/constantes.

---

## Seguridad
- Auth: mover tokens a cookies httpOnly + CSRF; añadir refresh tokens/rotación y revocación.
- Rate limiting (Flask-Limiter) por IP/usuario/endpoint.
- Uploads: validación MIME real (python-magic), tamaño, sandbox de conversión, antivirus (ClamAV opcional) y lista blanca de extensiones.
- Sanitización: nombres con secure_filename, eliminar metadatos sensibles; no loguear PII.

---

## Frontend
- Router: usar ProtectedRoute en rutas y simplificar MainApp.
- Estado remoto: React Query para historial/formatos en lugar de manual; reintentos/caché.
- Config por entorno: VITE_API_BASE_URL/VITE_WS_BASE_URL por env; build sin logs.
- A11y: roles/aria y control de foco en Uploader, modales y toasts; mantener pruebas a11y.
- Diseño: aplicar tokens de diseño globales a todos los componentes.

---

## Backend
- Unificar rutas en src/routes o src/api; eliminar duplicados.
- Validación consistente: ile_validator, integrity_checker y rror_translator integrados en todos los endpoints.
- Observabilidad: logging JSON, X-Request-ID, métricas por endpoint/estado/latencia, OpenTelemetry.
- Config y CORS: una única fuente; SocketIO usa el mismo origen permitido.

---

## Datos y Almacenamiento
- Directorios: parametrizar UPLOAD_DIR, OUTPUT_DIR, BACKUP_DIR por env; no escribir en el repo.
- Retención: TTL y tareas programadas para temporales/outputs; limpieza en segundo plano.
- Auditoría: trazabilidad de conversiones y transacciones de créditos.

---

## Pruebas y CI/CD
- Backend: añadir tests de créditos (purchase/upgrade/gift), límites y WS de progreso.
- Frontend: pruebas de contrato de API con MSW en pi.ts y SafeConversor/CreditPurchase.
- OpenAPI: documentar endpoints y generar cliente TS tipado.
- CI: usar Python 3.11 (alinear con equirements.txt), añadir linters (black/isort/ruff) y type-check (pyright/mypy si aplica).
- Artefactos: construir rontend/dist en CI y publicar; no versionar.

---

## Riesgos
- Codificación corrupta en mensajes (rompe UX y localización).
- Mismatch de endpoints billing/credits (rompe compra de créditos).
- Conversiones pesadas sin colas (time-outs y bloqueos en producción).

---

## Roadmap Propuesto
- Semana 1–2: quick wins + limpieza + endpoints + DB config + encoding.
- Semana 3–4: App Factory, CORS unificado, observabilidad básica, remover duplicados de rutas.
- Semana 5–6: Workers de conversión + URLs firmadas de descarga + retención.
- Semana 7–8: OpenAPI + cliente TS + tests de contrato + endurecer auth.

---

## Checklist de Implementación
- [ ] Actualizar rontend/src/services/api.ts a /api/credits/* o añadir alias /api/billing/*.
- [ ] Quitar override de SQLALCHEMY_DATABASE_URI en main.py y usar Config.
- [ ] Añadir Alembic y eliminar pp.db del repo.
- [ ] Eliminar rontend/dist/ y añadir a .gitignore.
- [ ] Normalizar UTF-8 y corregir mensajes en outes/*.py.
- [ ] Consolidar rutas en un único árbol (src/routes o src/api).
- [ ] Unificar CORS en Config y aplicarlo a Flask + SocketIO.
- [ ] Sustituir logs de desarrollo en pi.ts por utilidades de logging controladas por env.
- [ ] Añadir limitación de tasa y validación estricta de uploads.
- [ ] Diseñar interfaz de plugins de conversión y plan de migración a workers.

---

## Referencias
- docs/ESQUEMA_ARQUITECTURA_ANCLORA_NEXUS.md
- backend/src/main.py, backend/src/routes/*, backend/src/services/*
- frontend/src/services/api.ts, frontend/src/components/*
- .github/workflows/ci-*.yml
