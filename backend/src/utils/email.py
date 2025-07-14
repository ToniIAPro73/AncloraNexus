from flask import current_app
import logging

def send_verification_email(user):
    """Envía email de verificación (simulado en desarrollo)"""
    try:
        # En desarrollo, solo registrar en logs
        verification_url = f"https://anclora.com/verify-email?token={user.email_verification_token}"
        
        current_app.logger.info(f"""
        =================================
        EMAIL DE VERIFICACIÓN (SIMULADO)
        =================================
        Para: {user.email}
        Asunto: Verifica tu cuenta en Anclora Converter
        
        Hola {user.full_name},
        
        Gracias por registrarte en Anclora Converter. Para completar tu registro,
        por favor verifica tu dirección de email haciendo clic en el siguiente enlace:
        
        {verification_url}
        
        Si no creaste esta cuenta, puedes ignorar este email.
        
        Saludos,
        El equipo de Anclora Converter
        =================================
        """)
        
        return True
        
    except Exception as e:
        current_app.logger.error(f"Error enviando email de verificación: {str(e)}")
        return False

def send_password_reset_email(user):
    """Envía email de reset de contraseña (simulado en desarrollo)"""
    try:
        # En desarrollo, solo registrar en logs
        reset_url = f"https://anclora.com/reset-password?token={user.password_reset_token}"
        
        current_app.logger.info(f"""
        ====================================
        EMAIL DE RESET DE CONTRASEÑA (SIMULADO)
        ====================================
        Para: {user.email}
        Asunto: Resetea tu contraseña en Anclora Converter
        
        Hola {user.full_name},
        
        Recibimos una solicitud para resetear la contraseña de tu cuenta.
        Si fuiste tú, haz clic en el siguiente enlace para crear una nueva contraseña:
        
        {reset_url}
        
        Este enlace expirará en 1 hora por seguridad.
        
        Si no solicitaste este reset, puedes ignorar este email.
        Tu contraseña actual permanecerá sin cambios.
        
        Saludos,
        El equipo de Anclora Converter
        ====================================
        """)
        
        return True
        
    except Exception as e:
        current_app.logger.error(f"Error enviando email de reset: {str(e)}")
        return False

def send_conversion_complete_notification(user_id, file_id):
    """Envía notificación de conversión completada (simulado en desarrollo)"""
    try:
        from src.models.user import User
        from src.models.file import File
        
        user = User.query.get(user_id)
        file = File.query.get(file_id)
        
        if not user or not file:
            return False
        
        download_url = f"https://anclora.com/download/{file_id}"
        
        current_app.logger.info(f"""
        ==========================================
        NOTIFICACIÓN DE CONVERSIÓN COMPLETADA (SIMULADO)
        ==========================================
        Para: {user.email}
        Asunto: Tu conversión está lista - {file.original_filename}
        
        Hola {user.full_name},
        
        ¡Buenas noticias! Tu conversión ha sido completada exitosamente.
        
        Archivo: {file.original_filename}
        Conversión: {file.original_format.upper()} → {file.target_format.upper()}
        Tamaño: {file.file_size_mb} MB
        
        Puedes descargar tu archivo convertido aquí:
        {download_url}
        
        El archivo estará disponible hasta: {file.expires_at.strftime('%d/%m/%Y %H:%M')}
        
        Saludos,
        El equipo de Anclora Converter
        ==========================================
        """)
        
        return True
        
    except Exception as e:
        current_app.logger.error(f"Error enviando notificación de conversión: {str(e)}")
        return False

def send_file_expiration_warning(user_id, file_id):
    """Envía advertencia de expiración de archivo (simulado en desarrollo)"""
    try:
        from src.models.user import User
        from src.models.file import File
        
        user = User.query.get(user_id)
        file = File.query.get(file_id)
        
        if not user or not file:
            return False
        
        download_url = f"https://anclora.com/download/{file_id}"
        
        current_app.logger.info(f"""
        ==========================================
        ADVERTENCIA DE EXPIRACIÓN DE ARCHIVO (SIMULADO)
        ==========================================
        Para: {user.email}
        Asunto: Tu archivo expirará pronto - {file.original_filename}
        
        Hola {user.full_name},
        
        Te recordamos que tu archivo convertido expirará pronto.
        
        Archivo: {file.original_filename}
        Expira: {file.expires_at.strftime('%d/%m/%Y %H:%M')}
        Tiempo restante: {file.hours_until_expiration:.1f} horas
        
        Descarga tu archivo antes de que expire:
        {download_url}
        
        ¿Necesitas más tiempo? Considera actualizar tu plan para mayor retención.
        
        Saludos,
        El equipo de Anclora Converter
        ==========================================
        """)
        
        return True
        
    except Exception as e:
        current_app.logger.error(f"Error enviando advertencia de expiración: {str(e)}")
        return False

