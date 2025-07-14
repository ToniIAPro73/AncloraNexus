# Guía de Despliegue en Producción - Anclora Converter Backend

**Versión:** 1.0.0  
**Fecha:** 14 de Julio, 2025  
**Autor:** Manus AI  

## Resumen Ejecutivo

Esta guía proporciona instrucciones detalladas para el despliegue del backend de Anclora Converter en un entorno de producción. Incluye configuración de infraestructura, optimizaciones de rendimiento, procedimientos de seguridad, y estrategias de monitoreo para garantizar un funcionamiento robusto y escalable.

## Tabla de Contenidos

1. [Requisitos de Infraestructura](#requisitos-de-infraestructura)
2. [Configuración del Servidor](#configuración-del-servidor)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Configuración de Base de Datos](#configuración-de-base-de-datos)
5. [Configuración de Servicios](#configuración-de-servicios)
6. [Seguridad y SSL](#seguridad-y-ssl)
7. [Monitoreo y Logging](#monitoreo-y-logging)
8. [Backup y Recuperación](#backup-y-recuperación)
9. [Escalabilidad](#escalabilidad)
10. [Mantenimiento](#mantenimiento)

## Requisitos de Infraestructura

### Especificaciones Mínimas

**Servidor de Aplicación:**
- CPU: 4 cores (2.4 GHz)
- RAM: 8 GB
- Almacenamiento: 100 GB SSD
- Ancho de banda: 100 Mbps
- OS: Ubuntu 22.04 LTS o CentOS 8

**Base de Datos:**
- CPU: 2 cores (2.4 GHz)
- RAM: 4 GB
- Almacenamiento: 50 GB SSD
- PostgreSQL 14+

**Cache/Redis:**
- CPU: 1 core
- RAM: 2 GB
- Almacenamiento: 10 GB SSD

### Especificaciones Recomendadas

**Servidor de Aplicación:**
- CPU: 8 cores (3.0 GHz)
- RAM: 16 GB
- Almacenamiento: 500 GB NVMe SSD
- Ancho de banda: 1 Gbps
- OS: Ubuntu 22.04 LTS

**Base de Datos:**
- CPU: 4 cores (3.0 GHz)
- RAM: 8 GB
- Almacenamiento: 200 GB SSD con RAID 1
- PostgreSQL 15+

**Load Balancer:**
- CPU: 2 cores
- RAM: 4 GB
- Nginx o HAProxy

### Arquitectura de Producción

```
Internet
    ↓
[Load Balancer - Nginx]
    ↓
[App Server 1] [App Server 2] [App Server N]
    ↓              ↓              ↓
[PostgreSQL Master] ← → [PostgreSQL Replica]
    ↓
[Redis Cluster]
    ↓
[File Storage - NFS/S3]
```

## Configuración del Servidor

### Preparación del Sistema

**1. Actualización del sistema:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop

# CentOS/RHEL
sudo yum update -y
sudo yum install -y curl wget git vim htop
```

**2. Configuración de usuario:**
```bash
# Crear usuario para la aplicación
sudo adduser anclora
sudo usermod -aG sudo anclora

# Configurar SSH key
sudo -u anclora ssh-keygen -t rsa -b 4096
```

**3. Configuración de firewall:**
```bash
# Ubuntu UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5432  # PostgreSQL (solo desde app servers)
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5432/tcp
sudo firewall-cmd --reload
```

### Instalación de Python

**1. Instalar Python 3.11:**
```bash
# Ubuntu
sudo apt install -y software-properties-common
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev

# CentOS
sudo yum install -y python3.11 python3.11-devel python3.11-pip
```

**2. Configurar pip y virtualenv:**
```bash
# Instalar pip para Python 3.11
curl -sS https://bootstrap.pypa.io/get-pip.py | python3.11

# Verificar instalación
python3.11 --version
pip3.11 --version
```

### Instalación de PostgreSQL

**1. Instalar PostgreSQL 15:**
```bash
# Ubuntu
sudo apt install -y postgresql-15 postgresql-contrib-15

# CentOS
sudo yum install -y postgresql15-server postgresql15-contrib
sudo postgresql-15-setup initdb
```

**2. Configurar PostgreSQL:**
```bash
# Iniciar y habilitar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configurar usuario y base de datos
sudo -u postgres psql
```

```sql
-- En psql
CREATE USER anclora_user WITH PASSWORD 'password_super_segura';
CREATE DATABASE anclora_db OWNER anclora_user;
GRANT ALL PRIVILEGES ON DATABASE anclora_db TO anclora_user;
\q
```

**3. Configurar acceso:**
```bash
# Editar pg_hba.conf
sudo vim /etc/postgresql/15/main/pg_hba.conf

# Agregar línea para acceso local
local   anclora_db      anclora_user                    md5
host    anclora_db      anclora_user    127.0.0.1/32   md5
```

### Instalación de Redis

**1. Instalar Redis:**
```bash
# Ubuntu
sudo apt install -y redis-server

# CentOS
sudo yum install -y redis
```

**2. Configurar Redis:**
```bash
# Editar configuración
sudo vim /etc/redis/redis.conf

# Configuraciones importantes:
# bind 127.0.0.1
# maxmemory 1gb
# maxmemory-policy allkeys-lru
# save 900 1
# save 300 10
# save 60 10000

# Reiniciar servicio
sudo systemctl restart redis
sudo systemctl enable redis
```

## Instalación y Configuración

### Despliegue de la Aplicación

**1. Clonar repositorio:**
```bash
# Cambiar a usuario anclora
sudo su - anclora

# Clonar código
git clone https://github.com/tu-org/anclora-backend.git
cd anclora-backend
```

**2. Configurar entorno virtual:**
```bash
# Crear entorno virtual
python3.11 -m venv venv

# Activar entorno
source venv/bin/activate

# Instalar dependencias
pip install --upgrade pip
pip install -r requirements.txt
```

**3. Configurar variables de entorno:**
```bash
# Crear archivo de configuración
cp .env.example .env
vim .env
```

```bash
# Configuración de producción
FLASK_ENV=production
FLASK_DEBUG=False

# Base de datos
DATABASE_URL=postgresql://anclora_user:password_super_segura@localhost/anclora_db

# JWT
JWT_SECRET_KEY=clave-jwt-super-secreta-cambiar-en-produccion

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
MAIL_SERVER=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.tu-api-key-de-sendgrid

# Almacenamiento
UPLOAD_FOLDER=/var/anclora/uploads
MAX_CONTENT_LENGTH=524288000  # 500MB

# Redis
REDIS_URL=redis://localhost:6379/0

# Logging
LOG_LEVEL=INFO
LOG_FILE=/var/log/anclora/app.log
```

**4. Crear directorios necesarios:**
```bash
# Crear directorios
sudo mkdir -p /var/anclora/uploads
sudo mkdir -p /var/log/anclora
sudo chown -R anclora:anclora /var/anclora
sudo chown -R anclora:anclora /var/log/anclora
```

**5. Inicializar base de datos:**
```bash
# Activar entorno virtual
source venv/bin/activate

# Crear tablas
python -c "
from src.main import create_app
app = create_app()
with app.app_context():
    from src.models import db
    db.create_all()
    print('Base de datos inicializada')
"
```

### Configuración de Gunicorn

**1. Instalar Gunicorn:**
```bash
pip install gunicorn
```

**2. Crear configuración de Gunicorn:**
```bash
vim gunicorn.conf.py
```

```python
# gunicorn.conf.py
import multiprocessing

# Server socket
bind = "127.0.0.1:5000"
backlog = 2048

# Worker processes
workers = multiprocessing.cpu_count() * 2 + 1
worker_class = "sync"
worker_connections = 1000
timeout = 30
keepalive = 2

# Restart workers
max_requests = 1000
max_requests_jitter = 50
preload_app = True

# Logging
accesslog = "/var/log/anclora/gunicorn_access.log"
errorlog = "/var/log/anclora/gunicorn_error.log"
loglevel = "info"

# Process naming
proc_name = "anclora_backend"

# Server mechanics
daemon = False
pidfile = "/var/run/anclora/gunicorn.pid"
user = "anclora"
group = "anclora"
tmp_upload_dir = None

# SSL (si se usa HTTPS directo)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"
```

**3. Crear script de inicio:**
```bash
vim start_gunicorn.sh
chmod +x start_gunicorn.sh
```

```bash
#!/bin/bash
# start_gunicorn.sh

cd /home/anclora/anclora-backend
source venv/bin/activate

# Crear directorio para PID si no existe
sudo mkdir -p /var/run/anclora
sudo chown anclora:anclora /var/run/anclora

# Iniciar Gunicorn
exec gunicorn --config gunicorn.conf.py "src.main:create_app()"
```

### Configuración de Systemd

**1. Crear servicio systemd:**
```bash
sudo vim /etc/systemd/system/anclora-backend.service
```

```ini
[Unit]
Description=Anclora Backend API
After=network.target postgresql.service redis.service
Requires=postgresql.service redis.service

[Service]
Type=notify
User=anclora
Group=anclora
WorkingDirectory=/home/anclora/anclora-backend
Environment=PATH=/home/anclora/anclora-backend/venv/bin
ExecStart=/home/anclora/anclora-backend/venv/bin/gunicorn --config gunicorn.conf.py "src.main:create_app()"
ExecReload=/bin/kill -s HUP $MAINPID
KillMode=mixed
TimeoutStopSec=5
PrivateTmp=true
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**2. Habilitar y iniciar servicio:**
```bash
# Recargar systemd
sudo systemctl daemon-reload

# Habilitar servicio
sudo systemctl enable anclora-backend

# Iniciar servicio
sudo systemctl start anclora-backend

# Verificar estado
sudo systemctl status anclora-backend
```

## Configuración de Base de Datos

### Optimización de PostgreSQL

**1. Configurar postgresql.conf:**
```bash
sudo vim /etc/postgresql/15/main/postgresql.conf
```

```ini
# Configuración optimizada para producción

# Memory
shared_buffers = 2GB                    # 25% de RAM total
effective_cache_size = 6GB              # 75% de RAM total
work_mem = 64MB                         # Para operaciones complejas
maintenance_work_mem = 512MB            # Para VACUUM, CREATE INDEX

# Checkpoints
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/log/postgresql'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_min_duration_statement = 1000       # Log queries > 1 segundo

# Connections
max_connections = 200
```

**2. Configurar pg_hba.conf para producción:**
```bash
sudo vim /etc/postgresql/15/main/pg_hba.conf
```

```ini
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# Local connections
local   all             postgres                                peer
local   anclora_db      anclora_user                           md5

# IPv4 local connections
host    anclora_db      anclora_user    127.0.0.1/32           md5
host    anclora_db      anclora_user    10.0.0.0/8             md5

# Deny all other connections
host    all             all             0.0.0.0/0               reject
```

**3. Crear índices optimizados:**
```sql
-- Conectar a la base de datos
psql -U anclora_user -d anclora_db

-- Índices para usuarios
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX CONCURRENTLY idx_users_level ON users(level);

-- Índices para archivos
CREATE INDEX CONCURRENTLY idx_files_user_id ON files(user_id);
CREATE INDEX CONCURRENTLY idx_files_session_id ON files(session_id);
CREATE INDEX CONCURRENTLY idx_files_expires_at ON files(expires_at);
CREATE INDEX CONCURRENTLY idx_files_status ON files(conversion_status);

-- Índices para transacciones
CREATE INDEX CONCURRENTLY idx_transactions_user_id ON conversion_transactions(user_id);
CREATE INDEX CONCURRENTLY idx_transactions_status ON conversion_transactions(payment_status);
CREATE INDEX CONCURRENTLY idx_transactions_created ON conversion_transactions(created_at);

-- Índices para recompensas
CREATE INDEX CONCURRENTLY idx_user_rewards_user_id ON user_rewards(user_id);
CREATE INDEX CONCURRENTLY idx_user_rewards_type ON user_rewards(reward_type);
CREATE INDEX CONCURRENTLY idx_user_rewards_created ON user_rewards(created_at);
```

### Backup Automatizado

**1. Crear script de backup:**
```bash
sudo vim /usr/local/bin/backup_anclora.sh
sudo chmod +x /usr/local/bin/backup_anclora.sh
```

```bash
#!/bin/bash
# backup_anclora.sh

BACKUP_DIR="/var/backups/anclora"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="anclora_db"
DB_USER="anclora_user"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Backup de base de datos
pg_dump -U $DB_USER -h localhost $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup de archivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/anclora/uploads

# Limpiar backups antiguos (mantener 30 días)
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Log del backup
echo "$(date): Backup completado - $DATE" >> /var/log/anclora/backup.log
```

**2. Configurar cron para backups:**
```bash
sudo crontab -e
```

```bash
# Backup diario a las 2:00 AM
0 2 * * * /usr/local/bin/backup_anclora.sh

# Backup de logs semanalmente
0 3 * * 0 tar -czf /var/backups/anclora/logs_$(date +\%Y\%m\%d).tar.gz /var/log/anclora/
```

## Configuración de Servicios

### Nginx como Proxy Reverso

**1. Instalar Nginx:**
```bash
# Ubuntu
sudo apt install -y nginx

# CentOS
sudo yum install -y nginx
```

**2. Configurar sitio:**
```bash
sudo vim /etc/nginx/sites-available/anclora-backend
```

```nginx
# /etc/nginx/sites-available/anclora-backend

upstream anclora_backend {
    server 127.0.0.1:5000 max_fails=3 fail_timeout=30s;
    # Para múltiples servidores:
    # server 127.0.0.1:5001 max_fails=3 fail_timeout=30s;
    # server 127.0.0.1:5002 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.anclora.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.anclora.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.anclora.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.anclora.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logging
    access_log /var/log/nginx/anclora_access.log;
    error_log /var/log/nginx/anclora_error.log;
    
    # Client settings
    client_max_body_size 500M;
    client_body_timeout 60s;
    client_header_timeout 60s;
    
    # Proxy settings
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 300s;
    proxy_buffer_size 4k;
    proxy_buffers 4 32k;
    proxy_busy_buffers_size 64k;
    
    # Main location
    location / {
        proxy_pass http://anclora_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;
        proxy_redirect off;
    }
    
    # Health check endpoint
    location /api/health {
        proxy_pass http://anclora_backend;
        access_log off;
    }
    
    # Static files (si los hay)
    location /static/ {
        alias /var/anclora/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Uploads (con autenticación)
    location /uploads/ {
        internal;
        alias /var/anclora/uploads/;
    }
}
```

**3. Habilitar sitio:**
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/anclora-backend /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Configuración de SSL con Let's Encrypt

**1. Instalar Certbot:**
```bash
# Ubuntu
sudo apt install -y certbot python3-certbot-nginx

# CentOS
sudo yum install -y certbot python3-certbot-nginx
```

**2. Obtener certificado:**
```bash
# Obtener certificado SSL
sudo certbot --nginx -d api.anclora.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

**3. Configurar renovación automática:**
```bash
# Agregar a crontab
sudo crontab -e
```

```bash
# Renovar certificados SSL cada 12 horas
0 */12 * * * /usr/bin/certbot renew --quiet
```

## Seguridad y SSL

### Configuración de Firewall

**1. Configurar UFW (Ubuntu):**
```bash
# Reglas básicas
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH (cambiar puerto si es necesario)
sudo ufw allow 22/tcp

# Permitir HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir PostgreSQL solo desde localhost
sudo ufw allow from 127.0.0.1 to any port 5432

# Permitir Redis solo desde localhost
sudo ufw allow from 127.0.0.1 to any port 6379

# Activar firewall
sudo ufw enable
```

**2. Configurar fail2ban:**
```bash
# Instalar fail2ban
sudo apt install -y fail2ban

# Configurar jail local
sudo vim /etc/fail2ban/jail.local
```

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = %(sshd_log)s

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/anclora_error.log
maxretry = 3

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/anclora_error.log
maxretry = 10
```

### Hardening del Sistema

**1. Configurar SSH:**
```bash
sudo vim /etc/ssh/sshd_config
```

```ini
# Configuración segura de SSH
Port 2222                          # Cambiar puerto por defecto
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
X11Forwarding no
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
```

**2. Configurar límites del sistema:**
```bash
sudo vim /etc/security/limits.conf
```

```ini
# Límites para usuario anclora
anclora soft nofile 65536
anclora hard nofile 65536
anclora soft nproc 32768
anclora hard nproc 32768
```

**3. Configurar kernel parameters:**
```bash
sudo vim /etc/sysctl.conf
```

```ini
# Network security
net.ipv4.ip_forward = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0

# Performance tuning
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
```

## Monitoreo y Logging

### Configuración de Logging

**1. Configurar logrotate:**
```bash
sudo vim /etc/logrotate.d/anclora
```

```ini
/var/log/anclora/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 anclora anclora
    postrotate
        systemctl reload anclora-backend
    endscript
}
```

**2. Configurar rsyslog:**
```bash
sudo vim /etc/rsyslog.d/50-anclora.conf
```

```ini
# Anclora logging
if $programname == 'anclora_backend' then /var/log/anclora/app.log
& stop
```

### Monitoreo con Prometheus (Opcional)

**1. Instalar Prometheus:**
```bash
# Crear usuario
sudo useradd --no-create-home --shell /bin/false prometheus

# Descargar Prometheus
cd /tmp
wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
tar xvf prometheus-2.40.0.linux-amd64.tar.gz

# Instalar
sudo mv prometheus-2.40.0.linux-amd64/prometheus /usr/local/bin/
sudo mv prometheus-2.40.0.linux-amd64/promtool /usr/local/bin/
sudo chown prometheus:prometheus /usr/local/bin/prometheus
sudo chown prometheus:prometheus /usr/local/bin/promtool

# Crear directorios
sudo mkdir /etc/prometheus
sudo mkdir /var/lib/prometheus
sudo chown prometheus:prometheus /etc/prometheus
sudo chown prometheus:prometheus /var/lib/prometheus
```

**2. Configurar Prometheus:**
```bash
sudo vim /etc/prometheus/prometheus.yml
```

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'anclora-backend'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'postgres-exporter'
    static_configs:
      - targets: ['localhost:9187']
```

### Alertas y Notificaciones

**1. Configurar alertas básicas:**
```bash
sudo vim /usr/local/bin/health_check.sh
sudo chmod +x /usr/local/bin/health_check.sh
```

```bash
#!/bin/bash
# health_check.sh

API_URL="https://api.anclora.com/api/health"
EMAIL="admin@anclora.com"

# Verificar API
response=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $response -ne 200 ]; then
    echo "ALERTA: API no responde correctamente (HTTP $response)" | \
    mail -s "Anclora API Down" $EMAIL
fi

# Verificar espacio en disco
disk_usage=$(df /var/anclora | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -gt 80 ]; then
    echo "ALERTA: Uso de disco alto: ${disk_usage}%" | \
    mail -s "Anclora Disk Usage High" $EMAIL
fi

# Verificar memoria
mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $mem_usage -gt 85 ]; then
    echo "ALERTA: Uso de memoria alto: ${mem_usage}%" | \
    mail -s "Anclora Memory Usage High" $EMAIL
fi
```

**2. Configurar cron para monitoreo:**
```bash
sudo crontab -e
```

```bash
# Health check cada 5 minutos
*/5 * * * * /usr/local/bin/health_check.sh
```

## Backup y Recuperación

### Estrategia de Backup

**1. Backup completo semanal:**
```bash
sudo vim /usr/local/bin/full_backup.sh
sudo chmod +x /usr/local/bin/full_backup.sh
```

```bash
#!/bin/bash
# full_backup.sh

BACKUP_DIR="/var/backups/anclora"
DATE=$(date +%Y%m%d)
S3_BUCKET="anclora-backups"  # Si usas S3

# Crear backup completo
mkdir -p $BACKUP_DIR/full_$DATE

# Base de datos
pg_dump -U anclora_user anclora_db | gzip > $BACKUP_DIR/full_$DATE/database.sql.gz

# Archivos de aplicación
tar -czf $BACKUP_DIR/full_$DATE/application.tar.gz /home/anclora/anclora-backend

# Archivos de usuario
tar -czf $BACKUP_DIR/full_$DATE/uploads.tar.gz /var/anclora/uploads

# Configuración del sistema
tar -czf $BACKUP_DIR/full_$DATE/config.tar.gz /etc/nginx /etc/postgresql /etc/systemd/system/anclora*

# Subir a S3 (opcional)
# aws s3 sync $BACKUP_DIR/full_$DATE s3://$S3_BUCKET/full_$DATE/

# Limpiar backups locales antiguos (mantener 4 semanas)
find $BACKUP_DIR -name "full_*" -mtime +28 -exec rm -rf {} \;
```

### Procedimiento de Recuperación

**1. Script de restauración:**
```bash
sudo vim /usr/local/bin/restore_backup.sh
sudo chmod +x /usr/local/bin/restore_backup.sh
```

```bash
#!/bin/bash
# restore_backup.sh

if [ $# -ne 1 ]; then
    echo "Uso: $0 <fecha_backup>"
    echo "Ejemplo: $0 20250714"
    exit 1
fi

BACKUP_DATE=$1
BACKUP_DIR="/var/backups/anclora/full_$BACKUP_DATE"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Backup no encontrado en $BACKUP_DIR"
    exit 1
fi

echo "ADVERTENCIA: Este proceso restaurará el sistema al estado del $BACKUP_DATE"
echo "Presiona Enter para continuar o Ctrl+C para cancelar"
read

# Detener servicios
sudo systemctl stop anclora-backend
sudo systemctl stop nginx

# Restaurar base de datos
echo "Restaurando base de datos..."
sudo -u postgres dropdb anclora_db
sudo -u postgres createdb anclora_db -O anclora_user
gunzip -c $BACKUP_DIR/database.sql.gz | sudo -u postgres psql anclora_db

# Restaurar aplicación
echo "Restaurando aplicación..."
sudo rm -rf /home/anclora/anclora-backend.bak
sudo mv /home/anclora/anclora-backend /home/anclora/anclora-backend.bak
sudo tar -xzf $BACKUP_DIR/application.tar.gz -C /

# Restaurar archivos
echo "Restaurando archivos..."
sudo rm -rf /var/anclora/uploads.bak
sudo mv /var/anclora/uploads /var/anclora/uploads.bak
sudo tar -xzf $BACKUP_DIR/uploads.tar.gz -C /

# Restaurar configuración
echo "Restaurando configuración..."
sudo tar -xzf $BACKUP_DIR/config.tar.gz -C /

# Reiniciar servicios
sudo systemctl start postgresql
sudo systemctl start redis
sudo systemctl start anclora-backend
sudo systemctl start nginx

echo "Restauración completada"
```

## Escalabilidad

### Load Balancing

**1. Configuración HAProxy:**
```bash
sudo apt install -y haproxy
sudo vim /etc/haproxy/haproxy.cfg
```

```ini
global
    daemon
    maxconn 4096
    log stdout local0

defaults
    mode http
    timeout connect 5000ms
    timeout client 50000ms
    timeout server 50000ms
    option httplog

frontend anclora_frontend
    bind *:80
    bind *:443 ssl crt /etc/ssl/certs/anclora.pem
    redirect scheme https if !{ ssl_fc }
    default_backend anclora_backend

backend anclora_backend
    balance roundrobin
    option httpchk GET /api/health
    server app1 10.0.1.10:5000 check
    server app2 10.0.1.11:5000 check
    server app3 10.0.1.12:5000 check
```

### Auto-scaling con Docker

**1. Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar aplicación
COPY src/ ./src/
COPY .env .

# Crear usuario no-root
RUN useradd --create-home --shell /bin/bash anclora
USER anclora

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "src.main:create_app()"]
```

**2. Docker Compose:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://anclora_user:password@db:5432/anclora_db
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - uploads:/var/anclora/uploads
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=anclora_db
      - POSTGRES_USER=anclora_user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - uploads:/var/anclora/uploads
    depends_on:
      - app

volumes:
  postgres_data:
  redis_data:
  uploads:
```

## Mantenimiento

### Tareas de Mantenimiento Programadas

**1. Script de mantenimiento diario:**
```bash
sudo vim /usr/local/bin/daily_maintenance.sh
sudo chmod +x /usr/local/bin/daily_maintenance.sh
```

```bash
#!/bin/bash
# daily_maintenance.sh

LOG_FILE="/var/log/anclora/maintenance.log"

echo "$(date): Iniciando mantenimiento diario" >> $LOG_FILE

# Limpiar archivos expirados
python3 /home/anclora/anclora-backend/scripts/cleanup_expired_files.py >> $LOG_FILE 2>&1

# Actualizar estadísticas de BD
sudo -u postgres psql anclora_db -c "ANALYZE;" >> $LOG_FILE 2>&1

# Limpiar logs antiguos
find /var/log/anclora -name "*.log" -mtime +7 -delete

# Verificar espacio en disco
df -h >> $LOG_FILE

echo "$(date): Mantenimiento diario completado" >> $LOG_FILE
```

**2. Script de mantenimiento semanal:**
```bash
sudo vim /usr/local/bin/weekly_maintenance.sh
sudo chmod +x /usr/local/bin/weekly_maintenance.sh
```

```bash
#!/bin/bash
# weekly_maintenance.sh

LOG_FILE="/var/log/anclora/maintenance.log"

echo "$(date): Iniciando mantenimiento semanal" >> $LOG_FILE

# VACUUM completo de la base de datos
sudo -u postgres psql anclora_db -c "VACUUM FULL;" >> $LOG_FILE 2>&1

# Reindexar tablas principales
sudo -u postgres psql anclora_db -c "REINDEX DATABASE anclora_db;" >> $LOG_FILE 2>&1

# Reiniciar servicios para liberar memoria
sudo systemctl restart anclora-backend
sudo systemctl restart redis

# Verificar integridad de archivos
python3 /home/anclora/anclora-backend/scripts/verify_file_integrity.py >> $LOG_FILE 2>&1

echo "$(date): Mantenimiento semanal completado" >> $LOG_FILE
```

### Procedimientos de Actualización

**1. Script de actualización:**
```bash
sudo vim /usr/local/bin/update_anclora.sh
sudo chmod +x /usr/local/bin/update_anclora.sh
```

```bash
#!/bin/bash
# update_anclora.sh

if [ $# -ne 1 ]; then
    echo "Uso: $0 <version>"
    echo "Ejemplo: $0 v1.1.0"
    exit 1
fi

VERSION=$1
BACKUP_DIR="/var/backups/anclora/pre_update_$(date +%Y%m%d_%H%M%S)"

echo "Actualizando Anclora Backend a $VERSION"

# Crear backup pre-actualización
echo "Creando backup..."
mkdir -p $BACKUP_DIR
pg_dump -U anclora_user anclora_db | gzip > $BACKUP_DIR/database.sql.gz
tar -czf $BACKUP_DIR/application.tar.gz /home/anclora/anclora-backend

# Detener servicios
echo "Deteniendo servicios..."
sudo systemctl stop anclora-backend

# Actualizar código
echo "Actualizando código..."
cd /home/anclora/anclora-backend
git fetch origin
git checkout $VERSION

# Actualizar dependencias
source venv/bin/activate
pip install -r requirements.txt

# Ejecutar migraciones (si las hay)
python scripts/migrate.py

# Reiniciar servicios
echo "Reiniciando servicios..."
sudo systemctl start anclora-backend

# Verificar funcionamiento
sleep 10
if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "Actualización completada exitosamente"
else
    echo "Error en la actualización, restaurando backup..."
    # Procedimiento de rollback aquí
fi
```

### Monitoreo de Performance

**1. Script de monitoreo:**
```bash
sudo vim /usr/local/bin/performance_monitor.sh
sudo chmod +x /usr/local/bin/performance_monitor.sh
```

```bash
#!/bin/bash
# performance_monitor.sh

METRICS_FILE="/var/log/anclora/performance.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# CPU Usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')

# Memory Usage
MEM_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')

# Disk Usage
DISK_USAGE=$(df /var/anclora | awk 'NR==2 {print $5}' | sed 's/%//')

# Database connections
DB_CONNECTIONS=$(sudo -u postgres psql anclora_db -t -c "SELECT count(*) FROM pg_stat_activity;")

# API Response time
API_RESPONSE=$(curl -o /dev/null -s -w '%{time_total}' http://localhost:5000/api/health)

# Log metrics
echo "$DATE,CPU:$CPU_USAGE,MEM:$MEM_USAGE,DISK:$DISK_USAGE,DB_CONN:$DB_CONNECTIONS,API_TIME:$API_RESPONSE" >> $METRICS_FILE
```

## Conclusiones

Esta guía de despliegue proporciona una base sólida para ejecutar el backend de Anclora Converter en un entorno de producción robusto y escalable. Los puntos clave incluyen:

**Aspectos críticos implementados:**
1. **Seguridad robusta:** SSL, firewall, hardening del sistema
2. **Alta disponibilidad:** Load balancing, monitoreo, alertas
3. **Escalabilidad:** Configuración para crecimiento horizontal
4. **Backup y recuperación:** Estrategias automatizadas de respaldo
5. **Monitoreo completo:** Logs, métricas, alertas proactivas

**Próximos pasos recomendados:**
1. Implementar monitoreo avanzado con Prometheus/Grafana
2. Configurar CI/CD para despliegues automatizados
3. Implementar auto-scaling basado en métricas
4. Configurar disaster recovery en múltiples regiones
5. Optimizar performance con CDN para archivos estáticos

El sistema está preparado para manejar cargas de producción significativas y proporciona las bases para un crecimiento sostenible del servicio Anclora Converter.

