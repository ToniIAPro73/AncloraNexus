import os
import logging
import pandas as pd
import json
from pathlib import Path

# Importar librerías para Excel
try:
    import openpyxl
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False
    logging.warning("openpyxl no disponible para XLSX→JSON de alta calidad")

CONVERSION = ('xlsx', 'json')

def convert(input_path, output_path):
    """Convierte XLSX a JSON usando pandas con múltiples formatos de salida"""
    
    try:
        # Leer Excel con pandas usando openpyxl
        if OPENPYXL_AVAILABLE:
            excel_file = pd.ExcelFile(input_path, engine='openpyxl')
        else:
            excel_file = pd.ExcelFile(input_path)
        
        # Obtener información de las hojas
        sheet_names = excel_file.sheet_names
        
        if not sheet_names:
            return False, "Excel sin hojas válidas"
        
        # Determinar estrategia de conversión basada en número de hojas
        if len(sheet_names) == 1:
            # Una sola hoja - convertir directamente
            json_data = convert_single_sheet(excel_file, sheet_names[0])
            sheet_info = f" (hoja: {sheet_names[0]})"
        else:
            # Múltiples hojas - crear estructura jerárquica
            json_data = convert_multiple_sheets(excel_file, sheet_names)
            sheet_info = f" ({len(sheet_names)} hojas)"
        
        if not json_data:
            return False, "No se pudieron extraer datos válidos del Excel"
        
        # Guardar JSON con formato bonito
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2, default=str)
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            return True, f"JSON generado desde Excel{sheet_info}"
        else:
            return False, "Error: JSON no se generó correctamente"
        
    except Exception as e:
        return False, f"Error en conversión XLSX→JSON: {str(e)}"

def convert_single_sheet(excel_file, sheet_name):
    """Convertir una sola hoja de Excel a JSON"""
    try:
        # Leer la hoja
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        if df.empty:
            return None
        
        # Limpiar datos para JSON
        df_cleaned = clean_dataframe_for_json(df)
        
        # Determinar mejor formato JSON basado en los datos
        json_format = determine_best_json_format(df_cleaned)
        
        # Convertir a JSON según el formato determinado
        json_data = convert_to_json_format(df_cleaned, json_format)
        
        # Agregar metadatos si es útil
        if should_add_metadata(df_cleaned):
            return add_metadata_to_json(json_data, df_cleaned, json_format, sheet_name)
        
        return json_data
        
    except Exception as e:
        logging.error(f"Error convirtiendo hoja {sheet_name}: {e}")
        return None

def convert_multiple_sheets(excel_file, sheet_names):
    """Convertir múltiples hojas de Excel a JSON jerárquico"""
    try:
        json_data = {}
        
        for sheet_name in sheet_names:
            try:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                
                if df.empty:
                    continue
                
                # Limpiar datos para JSON
                df_cleaned = clean_dataframe_for_json(df)
                
                # Determinar formato para esta hoja
                json_format = determine_best_json_format(df_cleaned)
                
                # Convertir hoja a JSON
                sheet_data = convert_to_json_format(df_cleaned, json_format)
                
                # Usar nombre de hoja limpio como clave
                clean_sheet_name = clean_json_key(sheet_name)
                json_data[clean_sheet_name] = sheet_data
                
            except Exception as e:
                logging.warning(f"Error procesando hoja {sheet_name}: {e}")
                continue
        
        # Si solo se procesó una hoja exitosamente, devolver su contenido directamente
        if len(json_data) == 1:
            return list(json_data.values())[0]
        
        return json_data if json_data else None
        
    except Exception as e:
        logging.error(f"Error convirtiendo múltiples hojas: {e}")
        return None

def clean_dataframe_for_json(df):
    """Limpiar DataFrame para exportación JSON"""
    try:
        # Crear copia para no modificar original
        df_clean = df.copy()
        
        # Eliminar filas completamente vacías
        df_clean = df_clean.dropna(how='all')
        
        # Eliminar columnas completamente vacías
        df_clean = df_clean.dropna(axis=1, how='all')
        
        # Limpiar nombres de columnas para JSON
        df_clean.columns = [clean_json_key(str(col)) for col in df_clean.columns]
        
        # Convertir tipos de datos apropiados
        for column in df_clean.columns:
            df_clean[column] = df_clean[column].apply(convert_excel_value_to_json)
        
        return df_clean
        
    except Exception as e:
        logging.warning(f"Error limpiando DataFrame: {e}")
        return df

def clean_json_key(key):
    """Limpiar clave para JSON (nombres de campos)"""
    try:
        # Convertir a string si no lo es
        clean_key = str(key)
        
        # Reemplazar valores problemáticos
        if clean_key.lower() in ['unnamed', 'nan', 'none', '']:
            return 'campo_sin_nombre'
        
        # Limpiar caracteres problemáticos para JSON keys
        clean_key = clean_key.replace(' ', '_')
        clean_key = clean_key.replace('-', '_')
        clean_key = clean_key.replace('.', '_')
        clean_key = clean_key.replace('(', '').replace(')', '')
        clean_key = clean_key.replace('[', '').replace(']', '')
        clean_key = clean_key.replace('{', '').replace('}', '')
        clean_key = clean_key.replace('/', '_').replace('\\', '_')
        clean_key = clean_key.replace(':', '_').replace(';', '_')
        clean_key = clean_key.replace(',', '_')
        clean_key = clean_key.replace('"', '').replace("'", '')
        
        # Asegurar que empiece con letra o underscore
        if clean_key and not (clean_key[0].isalpha() or clean_key[0] == '_'):
            clean_key = 'campo_' + clean_key
        
        # Limitar longitud
        if len(clean_key) > 50:
            clean_key = clean_key[:47] + '...'
        
        return clean_key.lower().strip('_') or 'campo_vacio'
        
    except Exception:
        return 'campo_error'

def convert_excel_value_to_json(value):
    """Convertir valor de Excel a tipo apropiado para JSON"""
    try:
        # Manejar valores nulos
        if pd.isna(value) or value is None:
            return None
        
        # Manejar fechas de Excel
        if isinstance(value, pd.Timestamp):
            return value.isoformat()
        
        # Convertir a string primero
        str_value = str(value).strip()
        
        if str_value == '':
            return None
        
        # Intentar convertir a número
        try:
            # Verificar si es entero
            if str_value.isdigit() or (str_value.startswith('-') and str_value[1:].isdigit()):
                return int(str_value)
            
            # Verificar si es float
            float_val = float(str_value)
            # Si es un entero representado como float, convertir a int
            if float_val.is_integer():
                return int(float_val)
            return float_val
            
        except ValueError:
            pass
        
        # Intentar convertir a booleano
        if str_value.lower() in ['true', 'verdadero', 'sí', 'si', 'yes', '1']:
            return True
        elif str_value.lower() in ['false', 'falso', 'no', '0']:
            return False
        
        # Mantener como string
        return str_value
        
    except Exception:
        return str(value) if value is not None else None

def determine_best_json_format(df):
    """Determinar el mejor formato JSON basado en los datos"""
    try:
        rows, cols = df.shape
        
        # Si hay pocas columnas y muchas filas, usar array de objetos
        if cols <= 5 and rows > 10:
            return 'records'
        
        # Si hay muchas columnas, usar formato de objeto con arrays
        elif cols > 10:
            return 'columns'
        
        # Si hay una columna que parece ser ID o clave única
        for col in df.columns:
            if any(keyword in col.lower() for keyword in ['id', 'key', 'clave', 'codigo']):
                if df[col].nunique() == len(df):  # Valores únicos
                    return 'index'
        
        # Por defecto, usar array de objetos (más común para APIs)
        return 'records'
        
    except Exception:
        return 'records'

def convert_to_json_format(df, format_type):
    """Convertir DataFrame a formato JSON específico"""
    try:
        if format_type == 'records':
            # Array de objetos: [{"col1": "val1", "col2": "val2"}, ...]
            return df.to_dict('records')
        
        elif format_type == 'columns':
            # Objeto con arrays: {"col1": ["val1", "val2"], "col2": ["val3", "val4"]}
            return df.to_dict('list')
        
        elif format_type == 'index':
            # Objeto indexado: {"0": {"col1": "val1"}, "1": {"col2": "val2"}}
            return df.to_dict('index')
        
        elif format_type == 'values':
            # Array de arrays: [["val1", "val2"], ["val3", "val4"]]
            return {
                'columns': df.columns.tolist(),
                'data': df.values.tolist()
            }
        
        else:
            # Fallback a records
            return df.to_dict('records')
        
    except Exception as e:
        logging.warning(f"Error convirtiendo a formato {format_type}: {e}")
        return df.to_dict('records')

def should_add_metadata(df):
    """Determinar si agregar metadatos al JSON"""
    try:
        rows, cols = df.shape
        
        # Agregar metadatos si:
        # - Hay muchos datos (más de 100 filas o 10 columnas)
        # - Los datos parecen complejos
        return rows > 100 or cols > 10
        
    except Exception:
        return False

def add_metadata_to_json(json_data, df, format_type, sheet_name=None):
    """Agregar metadatos al JSON"""
    try:
        rows, cols = df.shape
        
        metadata = {
            'metadata': {
                'source': 'Excel (XLSX)',
                'sheet_name': sheet_name,
                'format': format_type,
                'rows': rows,
                'columns': cols,
                'column_names': df.columns.tolist(),
                'generated_by': 'Anclora Nexus XLSX→JSON Converter',
                'data_types': {col: str(df[col].dtype) for col in df.columns}
            },
            'data': json_data
        }
        
        return metadata
        
    except Exception:
        return json_data
