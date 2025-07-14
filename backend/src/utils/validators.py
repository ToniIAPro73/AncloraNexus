import re
from typing import Dict, Any

def validate_email(email: str) -> bool:
    """Valida formato de email"""
    if not email or len(email) > 255:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> Dict[str, Any]:
    """Valida contraseña y devuelve resultado detallado"""
    if not password:
        return {'valid': False, 'message': 'La contraseña es requerida'}
    
    if len(password) < 8:
        return {'valid': False, 'message': 'La contraseña debe tener al menos 8 caracteres'}
    
    if len(password) > 128:
        return {'valid': False, 'message': 'La contraseña no puede tener más de 128 caracteres'}
    
    # Verificar que tenga al menos una letra y un número
    has_letter = re.search(r'[a-zA-Z]', password)
    has_number = re.search(r'\d', password)
    
    if not has_letter:
        return {'valid': False, 'message': 'La contraseña debe contener al menos una letra'}
    
    if not has_number:
        return {'valid': False, 'message': 'La contraseña debe contener al menos un número'}
    
    return {'valid': True, 'message': 'Contraseña válida'}

def validate_file_upload(file, max_size_mb: int = 500) -> Dict[str, Any]:
    """Valida archivo subido"""
    if not file:
        return {'valid': False, 'message': 'No se proporcionó archivo'}
    
    if not file.filename:
        return {'valid': False, 'message': 'Nombre de archivo inválido'}
    
    # Verificar tamaño (aproximado, el tamaño exacto se verifica después)
    if hasattr(file, 'content_length') and file.content_length:
        if file.content_length > max_size_mb * 1024 * 1024:
            return {'valid': False, 'message': f'El archivo excede el tamaño máximo de {max_size_mb}MB'}
    
    # Verificar extensión
    allowed_extensions = {
        'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg',  # Imágenes
        'pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx',  # Documentos
        'mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a',  # Audio
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'  # Video
    }
    
    file_extension = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    
    if file_extension not in allowed_extensions:
        return {'valid': False, 'message': f'Formato de archivo no soportado: .{file_extension}'}
    
    return {'valid': True, 'message': 'Archivo válido', 'extension': file_extension}

def validate_conversion_request(source_format: str, target_format: str) -> Dict[str, Any]:
    """Valida solicitud de conversión"""
    if not source_format or not target_format:
        return {'valid': False, 'message': 'Formatos de origen y destino requeridos'}
    
    source_format = source_format.lower().strip()
    target_format = target_format.lower().strip()
    
    if source_format == target_format:
        return {'valid': False, 'message': 'Los formatos de origen y destino no pueden ser iguales'}
    
    # Definir conversiones válidas
    valid_conversions = {
        # Imágenes
        'jpg': ['png', 'gif', 'bmp', 'tiff', 'webp', 'pdf'],
        'jpeg': ['png', 'gif', 'bmp', 'tiff', 'webp', 'pdf'],
        'png': ['jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp', 'pdf'],
        'gif': ['jpg', 'jpeg', 'png', 'bmp', 'tiff', 'webp'],
        'bmp': ['jpg', 'jpeg', 'png', 'gif', 'tiff', 'webp', 'pdf'],
        'tiff': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf'],
        'webp': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'pdf'],
        'svg': ['png', 'jpg', 'jpeg', 'pdf'],
        
        # Documentos
        'pdf': ['doc', 'docx', 'txt', 'jpg', 'png'],
        'doc': ['pdf', 'docx', 'txt'],
        'docx': ['pdf', 'doc', 'txt'],
        'txt': ['pdf', 'doc', 'docx'],
        'rtf': ['pdf', 'doc', 'docx', 'txt'],
        'odt': ['pdf', 'doc', 'docx', 'txt'],
        
        # Audio
        'mp3': ['wav', 'flac', 'aac', 'ogg', 'm4a'],
        'wav': ['mp3', 'flac', 'aac', 'ogg', 'm4a'],
        'flac': ['mp3', 'wav', 'aac', 'ogg', 'm4a'],
        'aac': ['mp3', 'wav', 'flac', 'ogg', 'm4a'],
        'ogg': ['mp3', 'wav', 'flac', 'aac', 'm4a'],
        'm4a': ['mp3', 'wav', 'flac', 'aac', 'ogg'],
        
        # Video
        'mp4': ['avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
        'avi': ['mp4', 'mov', 'wmv', 'flv', 'mkv', 'webm'],
        'mov': ['mp4', 'avi', 'wmv', 'flv', 'mkv', 'webm'],
        'wmv': ['mp4', 'avi', 'mov', 'flv', 'mkv', 'webm'],
        'flv': ['mp4', 'avi', 'mov', 'wmv', 'mkv', 'webm'],
        'mkv': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'],
        'webm': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv']
    }
    
    if source_format not in valid_conversions:
        return {'valid': False, 'message': f'Formato de origen no soportado: {source_format}'}
    
    if target_format not in valid_conversions[source_format]:
        return {'valid': False, 'message': f'Conversión no soportada: {source_format} → {target_format}'}
    
    return {'valid': True, 'message': 'Conversión válida'}

def validate_subscription_data(data: Dict[str, Any]) -> Dict[str, Any]:
    """Valida datos de suscripción"""
    required_fields = ['plan_id', 'payment_method']
    
    for field in required_fields:
        if field not in data or not data[field]:
            return {'valid': False, 'message': f'Campo requerido: {field}'}
    
    # Validar método de pago
    valid_payment_methods = ['card', 'paypal', 'bank_transfer']
    if data['payment_method'] not in valid_payment_methods:
        return {'valid': False, 'message': 'Método de pago no válido'}
    
    return {'valid': True, 'message': 'Datos de suscripción válidos'}

