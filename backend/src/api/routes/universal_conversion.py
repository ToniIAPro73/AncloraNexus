"""
API Universal de Conversión - Presupuesto Reducido
Endpoint único que maneja todas las conversiones esenciales
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from typing import Optional, Dict, Any
import os
import tempfile
import uuid
from pathlib import Path
import logging

# Importar conversores
try:
    from ...models.conversions.essential_converter import EssentialConverter
    ESSENTIAL_AVAILABLE = True
except ImportError:
    ESSENTIAL_AVAILABLE = False

try:
    from ...models.conversions.html_to_pdf import convert as html_to_pdf_convert
    HTML_PDF_AVAILABLE = True
except ImportError:
    HTML_PDF_AVAILABLE = False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/conversion", tags=["Universal Conversion"])

# Almacenamiento temporal de archivos convertidos
TEMP_STORAGE = {}

@router.post("/universal-convert")
async def universal_convert(
    file: UploadFile = File(...),
    target_format: str = Form(...),
    source_format: Optional[str] = Form(None),
    quality_preference: str = Form("balanced")  # fast|balanced|maximum
):
    """
    Endpoint universal para conversiones de documentos
    Diseñado para presupuesto reducido con máximo impacto
    """
    
    if not ESSENTIAL_AVAILABLE:
        raise HTTPException(status_code=500, detail="Conversor esencial no disponible")
    
    # Generar IDs únicos para archivos temporales
    conversion_id = str(uuid.uuid4())
    
    try:
        # 1. Guardar archivo de entrada temporalmente
        input_extension = Path(file.filename).suffix.lower() if file.filename else ""
        temp_input = f"/tmp/input_{conversion_id}{input_extension}"
        
        with open(temp_input, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # 2. Detectar formato de entrada si no se especifica
        if not source_format:
            source_format = input_extension.lstrip('.')
            if not source_format:
                source_format = _detect_format_from_content(temp_input)
        
        # 3. Validar conversión soportada
        converter = EssentialConverter()
        conversion_key = (source_format.lower(), target_format.lower())
        
        if conversion_key not in converter.supported_conversions:
            # Verificar si es HTML→PDF (caso especial)
            if source_format.lower() == 'html' and target_format.lower() == 'pdf':
                if HTML_PDF_AVAILABLE:
                    return await _handle_html_to_pdf(temp_input, conversion_id, quality_preference)
                else:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Conversión {source_format}→{target_format} no soportada"
                    )
            else:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Conversión {source_format}→{target_format} no soportada"
                )
        
        # 4. Preparar archivo de salida
        temp_output = f"/tmp/output_{conversion_id}.{target_format.lower()}"
        
        # 5. Realizar conversión
        success, message = converter.convert(
            temp_input, 
            temp_output, 
            source_format, 
            target_format
        )
        
        if not success:
            raise HTTPException(status_code=500, detail=message)
        
        # 6. Calcular métricas básicas
        input_size = os.path.getsize(temp_input)
        output_size = os.path.getsize(temp_output) if os.path.exists(temp_output) else 0
        estimated_time = converter.estimate_conversion_time(temp_input, f"{source_format}→{target_format}")
        
        # 7. Almacenar archivo para descarga
        TEMP_STORAGE[conversion_id] = {
            'file_path': temp_output,
            'original_name': file.filename,
            'target_format': target_format,
            'created_at': os.path.getctime(temp_output)
        }
        
        # 8. Limpiar archivo de entrada
        try:
            os.remove(temp_input)
        except:
            pass
        
        return {
            "success": True,
            "conversion_id": conversion_id,
            "download_url": f"/api/conversion/download/{conversion_id}",
            "message": message,
            "metrics": {
                "input_size_bytes": input_size,
                "output_size_bytes": output_size,
                "compression_ratio": round(output_size / input_size, 2) if input_size > 0 else 1,
                "estimated_time": estimated_time,
                "source_format": source_format,
                "target_format": target_format
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en conversión universal: {str(e)}")
        
        # Limpiar archivos temporales en caso de error
        for temp_file in [f"/tmp/input_{conversion_id}{input_extension}", f"/tmp/output_{conversion_id}.{target_format.lower()}"]:
            try:
                if os.path.exists(temp_file):
                    os.remove(temp_file)
            except:
                pass
        
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/download/{conversion_id}")
async def download_converted_file(conversion_id: str):
    """
    Descarga archivo convertido
    """
    if conversion_id not in TEMP_STORAGE:
        raise HTTPException(status_code=404, detail="Archivo no encontrado o expirado")
    
    file_info = TEMP_STORAGE[conversion_id]
    file_path = file_info['file_path']
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    # Generar nombre de archivo para descarga
    original_name = file_info['original_name'] or "converted_file"
    name_without_ext = Path(original_name).stem
    target_format = file_info['target_format']
    download_filename = f"{name_without_ext}.{target_format.lower()}"
    
    return FileResponse(
        path=file_path,
        filename=download_filename,
        media_type='application/octet-stream'
    )

@router.get("/supported-conversions")
async def get_supported_conversions():
    """
    Lista todas las conversiones soportadas
    """
    if not ESSENTIAL_AVAILABLE:
        return {"error": "Conversor esencial no disponible"}
    
    converter = EssentialConverter()
    conversions = converter.get_supported_conversions()
    
    # Añadir HTML→PDF si está disponible
    if HTML_PDF_AVAILABLE:
        if 'web' not in conversions:
            conversions['web'] = []
        conversions['web'].append('HTML → PDF (Inteligente)')
    
    return {
        "supported_conversions": conversions,
        "total_types": sum(len(conv_list) for conv_list in conversions.values()),
        "categories": list(conversions.keys())
    }

@router.post("/analyze-document")
async def analyze_document(file: UploadFile = File(...)):
    """
    Analiza un documento para recomendar conversiones
    """
    conversion_id = str(uuid.uuid4())
    
    try:
        # Guardar archivo temporalmente
        input_extension = Path(file.filename).suffix.lower() if file.filename else ""
        temp_input = f"/tmp/analyze_{conversion_id}{input_extension}"
        
        with open(temp_input, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Detectar formato
        detected_format = input_extension.lstrip('.') or _detect_format_from_content(temp_input)
        
        # Calcular métricas básicas
        file_size = os.path.getsize(temp_input)
        
        # Recomendar conversiones posibles
        if ESSENTIAL_AVAILABLE:
            converter = EssentialConverter()
            possible_conversions = []
            
            for (source, target) in converter.supported_conversions.keys():
                if source.lower() == detected_format.lower():
                    estimated_time = converter.estimate_conversion_time(temp_input, f"{source}→{target}")
                    possible_conversions.append({
                        "target_format": target,
                        "estimated_time": estimated_time,
                        "recommended": target in ['pdf', 'xlsx', 'png']  # Formatos más populares
                    })
        
        # Limpiar archivo temporal
        try:
            os.remove(temp_input)
        except:
            pass
        
        return {
            "detected_format": detected_format,
            "file_size_bytes": file_size,
            "file_size_mb": round(file_size / (1024 * 1024), 2),
            "possible_conversions": possible_conversions,
            "analysis": {
                "complexity": "simple" if file_size < 1024*1024 else "medium" if file_size < 10*1024*1024 else "complex",
                "processing_time_estimate": "< 30 segundos" if file_size < 5*1024*1024 else "30-60 segundos"
            }
        }
        
    except Exception as e:
        logger.error(f"Error en análisis de documento: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en análisis: {str(e)}")

async def _handle_html_to_pdf(input_path: str, conversion_id: str, quality_preference: str):
    """
    Maneja conversión HTML→PDF usando el sistema existente
    """
    try:
        output_path = f"/tmp/output_{conversion_id}.pdf"
        
        success, message = html_to_pdf_convert(input_path, output_path)
        
        if not success:
            raise HTTPException(status_code=500, detail=message)
        
        # Calcular métricas
        input_size = os.path.getsize(input_path)
        output_size = os.path.getsize(output_path) if os.path.exists(output_path) else 0
        
        # Almacenar para descarga
        TEMP_STORAGE[conversion_id] = {
            'file_path': output_path,
            'original_name': 'document.html',
            'target_format': 'pdf',
            'created_at': os.path.getctime(output_path)
        }
        
        # Limpiar entrada
        try:
            os.remove(input_path)
        except:
            pass
        
        return {
            "success": True,
            "conversion_id": conversion_id,
            "download_url": f"/api/conversion/download/{conversion_id}",
            "message": message,
            "metrics": {
                "input_size_bytes": input_size,
                "output_size_bytes": output_size,
                "compression_ratio": round(output_size / input_size, 2) if input_size > 0 else 1,
                "estimated_time": "< 10 segundos",
                "source_format": "html",
                "target_format": "pdf"
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en HTML→PDF: {str(e)}")

def _detect_format_from_content(file_path: str) -> str:
    """
    Detecta formato de archivo por contenido (magic numbers)
    """
    try:
        with open(file_path, 'rb') as f:
            header = f.read(16)
        
        # Magic numbers comunes
        if header.startswith(b'%PDF'):
            return 'pdf'
        elif header.startswith(b'PK\x03\x04'):
            # ZIP-based formats (DOCX, XLSX, etc.)
            if file_path.endswith('.docx'):
                return 'docx'
            elif file_path.endswith('.xlsx'):
                return 'xlsx'
            else:
                return 'zip'
        elif header.startswith(b'\x89PNG'):
            return 'png'
        elif header.startswith(b'\xff\xd8\xff'):
            return 'jpg'
        elif header.startswith(b'GIF8'):
            return 'gif'
        elif b'<html' in header.lower() or b'<!doctype' in header.lower():
            return 'html'
        else:
            return 'unknown'
            
    except:
        return 'unknown'

# Limpieza periódica de archivos temporales (ejecutar en background)
import asyncio
import time

async def cleanup_temp_files():
    """
    Limpia archivos temporales antiguos (> 1 hora)
    """
    while True:
        try:
            current_time = time.time()
            expired_ids = []
            
            for conversion_id, file_info in TEMP_STORAGE.items():
                if current_time - file_info['created_at'] > 3600:  # 1 hora
                    try:
                        if os.path.exists(file_info['file_path']):
                            os.remove(file_info['file_path'])
                        expired_ids.append(conversion_id)
                    except:
                        pass
            
            for expired_id in expired_ids:
                del TEMP_STORAGE[expired_id]
            
            logger.info(f"Limpieza completada: {len(expired_ids)} archivos eliminados")
            
        except Exception as e:
            logger.error(f"Error en limpieza: {str(e)}")
        
        # Esperar 30 minutos antes de la próxima limpieza
        await asyncio.sleep(1800)
