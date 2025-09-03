import os
import logging
import pandas as pd
import json
from pathlib import Path

CONVERSION = ('csv', 'json')

def convert(input_path, output_path):
    """Convierte CSV a JSON usando pandas con múltiples formatos de salida"""
    
    try:
        # Detectar encoding del CSV
        encoding = detect_csv_encoding(input_path)
        
        # Leer CSV con pandas
        df = pd.read_csv(input_path, encoding=encoding)
        
        if df.empty:
            return False, "CSV vacío o sin datos válidos"
        
        # Limpiar datos para JSON
        df_cleaned = clean_dataframe_for_json(df)
        
        # Determinar mejor formato JSON basado en los datos
        json_format = determine_best_json_format(df_cleaned)
        
        # Convertir a JSON según el formato determinado
        json_data = convert_to_json_format(df_cleaned, json_format)
        
        # Guardar JSON con formato bonito
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(json_data, f, ensure_ascii=False, indent=2, default=str)
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            rows, cols = df_cleaned.shape
            return True, f"JSON generado: {rows} registros, {cols} campos (formato: {json_format})"
        else:
            return False, "Error: JSON no se generó correctamente"
        
    except Exception as e:
        return False, f"Error en conversión CSV→JSON: {str(e)}"

def detect_csv_encoding(file_path):
    """Detectar encoding del archivo CSV"""
    try:
        import chardet
        
        with open(file_path, 'rb') as f:
            raw_data = f.read(10000)  # Leer primeros 10KB
            result = chardet.detect(raw_data)
            encoding = result['encoding']
            
            # Mapear encodings comunes
            encoding_map = {
                'ascii': 'utf-8',
                'ISO-8859-1': 'latin-1',
                'Windows-1252': 'cp1252'
            }
            
            return encoding_map.get(encoding, encoding or 'utf-8')
            
    except ImportError:
        # Si chardet no está disponible, probar encodings comunes
        encodings_to_try = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
        
        for encoding in encodings_to_try:
            try:
                with open(file_path, 'r', encoding=encoding) as f:
                    f.read(1000)  # Probar leer
                return encoding
            except UnicodeDecodeError:
                continue
        
        return 'utf-8'  # Fallback por defecto

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
            df_clean[column] = df_clean[column].apply(convert_to_json_value)
        
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

def convert_to_json_value(value):
    """Convertir valor a tipo apropiado para JSON"""
    try:
        # Manejar valores nulos
        if pd.isna(value) or value is None:
            return None
        
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

def add_metadata_to_json(json_data, df, format_type):
    """Agregar metadatos al JSON"""
    try:
        rows, cols = df.shape
        
        metadata = {
            'metadata': {
                'format': format_type,
                'rows': rows,
                'columns': cols,
                'column_names': df.columns.tolist(),
                'generated_by': 'Anclora Nexus CSV→JSON Converter',
                'data_types': {col: str(df[col].dtype) for col in df.columns}
            },
            'data': json_data
        }
        
        return metadata
        
    except Exception:
        return json_data

def validate_json_output(output_path):
    """Validar que el JSON generado es válido"""
    try:
        with open(output_path, 'r', encoding='utf-8') as f:
            json.load(f)
        return True
    except json.JSONDecodeError:
        return False
    except Exception:
        return False
