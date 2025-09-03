import os
import logging
import pandas as pd
import json
from pathlib import Path

CONVERSION = ('json', 'csv')

def convert(input_path, output_path):
    """Convierte JSON a CSV usando pandas con normalización inteligente"""
    
    try:
        # Leer y validar JSON
        with open(input_path, 'r', encoding='utf-8') as f:
            json_data = json.load(f)
        
        if not json_data:
            return False, "JSON vacío o sin datos válidos"
        
        # Determinar estructura del JSON y convertir a DataFrame
        df = json_to_dataframe(json_data)
        
        if df.empty:
            return False, "No se pudieron extraer datos tabulares del JSON"
        
        # Limpiar datos para CSV
        df_cleaned = clean_dataframe_for_csv(df)
        
        # Guardar como CSV con encoding UTF-8
        df_cleaned.to_csv(output_path, index=False, encoding='utf-8-sig')
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            rows, cols = df_cleaned.shape
            return True, f"CSV generado: {rows} filas, {cols} columnas desde JSON"
        else:
            return False, "Error: CSV no se generó correctamente"
        
    except json.JSONDecodeError as e:
        return False, f"JSON inválido: {str(e)}"
    except Exception as e:
        return False, f"Error en conversión JSON→CSV: {str(e)}"

def json_to_dataframe(json_data):
    """Convertir JSON a DataFrame detectando automáticamente la estructura"""
    try:
        # Caso 1: Lista de objetos [{"a": 1, "b": 2}, {"a": 3, "b": 4}]
        if isinstance(json_data, list):
            return handle_json_list(json_data)
        
        # Caso 2: Objeto con arrays {"col1": [1, 2], "col2": [3, 4]}
        elif isinstance(json_data, dict):
            return handle_json_dict(json_data)
        
        # Caso 3: Valor simple
        else:
            return pd.DataFrame({'value': [json_data]})
        
    except Exception as e:
        logging.error(f"Error convirtiendo JSON a DataFrame: {e}")
        return pd.DataFrame()

def handle_json_list(json_list):
    """Manejar JSON que es una lista"""
    try:
        if not json_list:
            return pd.DataFrame()
        
        # Si todos los elementos son objetos/diccionarios
        if all(isinstance(item, dict) for item in json_list):
            # Usar pandas.json_normalize para aplanar objetos anidados
            df = pd.json_normalize(json_list)
            return df
        
        # Si todos los elementos son listas
        elif all(isinstance(item, list) for item in json_list):
            # Crear DataFrame con columnas numeradas
            max_cols = max(len(item) for item in json_list) if json_list else 0
            columns = [f'columna_{i+1}' for i in range(max_cols)]
            
            # Rellenar listas cortas con None
            padded_data = []
            for item in json_list:
                padded_item = item + [None] * (max_cols - len(item))
                padded_data.append(padded_item)
            
            return pd.DataFrame(padded_data, columns=columns)
        
        # Si son valores simples
        else:
            return pd.DataFrame({'value': json_list})
        
    except Exception as e:
        logging.error(f"Error manejando lista JSON: {e}")
        return pd.DataFrame()

def handle_json_dict(json_dict):
    """Manejar JSON que es un diccionario"""
    try:
        # Verificar si tiene estructura de metadatos
        if 'data' in json_dict and 'metadata' in json_dict:
            return json_to_dataframe(json_dict['data'])
        
        # Verificar si es formato columnar {"col1": [val1, val2], "col2": [val3, val4]}
        if all(isinstance(value, list) for value in json_dict.values()):
            # Verificar que todas las listas tengan la misma longitud
            lengths = [len(value) for value in json_dict.values()]
            if len(set(lengths)) == 1:  # Todas las longitudes son iguales
                return pd.DataFrame(json_dict)
        
        # Verificar si es formato indexado {"0": {"col1": "val1"}, "1": {"col2": "val2"}}
        if all(isinstance(value, dict) for value in json_dict.values()):
            # Intentar convertir a lista de objetos
            records = list(json_dict.values())
            return pd.json_normalize(records)
        
        # Si es un objeto plano, convertir a una fila
        df = pd.json_normalize([json_dict])
        return df
        
    except Exception as e:
        logging.error(f"Error manejando diccionario JSON: {e}")
        return pd.DataFrame()

def clean_dataframe_for_csv(df):
    """Limpiar DataFrame para exportación CSV"""
    try:
        # Crear copia para no modificar original
        df_clean = df.copy()
        
        # Eliminar filas completamente vacías
        df_clean = df_clean.dropna(how='all')
        
        # Eliminar columnas completamente vacías
        df_clean = df_clean.dropna(axis=1, how='all')
        
        # Limpiar nombres de columnas
        df_clean.columns = [clean_column_name(str(col)) for col in df_clean.columns]
        
        # Limpiar datos de celdas
        for column in df_clean.columns:
            df_clean[column] = df_clean[column].apply(clean_cell_value)
        
        return df_clean
        
    except Exception as e:
        logging.warning(f"Error limpiando DataFrame: {e}")
        return df

def clean_column_name(column_name):
    """Limpiar nombre de columna para CSV"""
    try:
        # Convertir a string si no lo es
        name = str(column_name)
        
        # Reemplazar valores problemáticos
        if name.lower() in ['unnamed', 'nan', 'none', '']:
            return 'Columna_Sin_Nombre'
        
        # Limpiar caracteres problemáticos para CSV
        name = name.replace('\n', ' ').replace('\r', ' ')
        name = name.replace('"', "'").replace(',', ';')
        
        # Reemplazar puntos de json_normalize
        name = name.replace('.', '_')
        
        # Limitar longitud
        if len(name) > 50:
            name = name[:47] + '...'
        
        return name.strip()
        
    except Exception:
        return 'Columna_Error'

def clean_cell_value(value):
    """Limpiar valor de celda para CSV"""
    try:
        # Manejar valores nulos
        if pd.isna(value) or value is None:
            return ''
        
        # Si es un diccionario o lista, convertir a JSON string
        if isinstance(value, (dict, list)):
            return json.dumps(value, ensure_ascii=False, separators=(',', ':'))
        
        # Convertir a string
        str_value = str(value)
        
        # Limpiar caracteres problemáticos
        str_value = str_value.replace('\n', ' ').replace('\r', ' ')
        str_value = str_value.replace('"', "'")
        
        return str_value.strip()
        
    except Exception:
        return str(value) if value is not None else ''

def detect_json_structure(json_data):
    """Detectar y describir la estructura del JSON"""
    try:
        structure_info = {
            'type': type(json_data).__name__,
            'is_tabular': False,
            'estimated_rows': 0,
            'estimated_cols': 0,
            'structure_description': ''
        }
        
        if isinstance(json_data, list):
            structure_info['estimated_rows'] = len(json_data)
            
            if json_data and isinstance(json_data[0], dict):
                # Lista de objetos - estructura tabular
                structure_info['is_tabular'] = True
                structure_info['estimated_cols'] = len(json_data[0].keys())
                structure_info['structure_description'] = 'Array de objetos (formato tabular)'
            
            elif json_data and isinstance(json_data[0], list):
                # Lista de listas
                structure_info['is_tabular'] = True
                structure_info['estimated_cols'] = len(json_data[0]) if json_data[0] else 0
                structure_info['structure_description'] = 'Array de arrays (matriz)'
            
            else:
                # Lista de valores simples
                structure_info['estimated_cols'] = 1
                structure_info['structure_description'] = 'Array de valores simples'
        
        elif isinstance(json_data, dict):
            if 'data' in json_data:
                # Posible estructura con metadatos
                return detect_json_structure(json_data['data'])
            
            elif all(isinstance(v, list) for v in json_data.values()):
                # Formato columnar
                structure_info['is_tabular'] = True
                structure_info['estimated_cols'] = len(json_data.keys())
                structure_info['estimated_rows'] = len(list(json_data.values())[0]) if json_data else 0
                structure_info['structure_description'] = 'Objeto con arrays (formato columnar)'
            
            else:
                # Objeto plano
                structure_info['estimated_rows'] = 1
                structure_info['estimated_cols'] = len(json_data.keys())
                structure_info['structure_description'] = 'Objeto plano (una fila)'
        
        return structure_info
        
    except Exception as e:
        return {
            'type': 'unknown',
            'is_tabular': False,
            'error': str(e)
        }

def flatten_nested_json(obj, parent_key='', sep='_'):
    """Aplanar JSON anidado recursivamente"""
    try:
        items = []
        
        if isinstance(obj, dict):
            for k, v in obj.items():
                new_key = f"{parent_key}{sep}{k}" if parent_key else k
                
                if isinstance(v, (dict, list)) and v:
                    items.extend(flatten_nested_json(v, new_key, sep=sep).items())
                else:
                    items.append((new_key, v))
        
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                new_key = f"{parent_key}{sep}{i}" if parent_key else str(i)
                
                if isinstance(v, (dict, list)) and v:
                    items.extend(flatten_nested_json(v, new_key, sep=sep).items())
                else:
                    items.append((new_key, v))
        
        else:
            return {parent_key: obj}
        
        return dict(items)
        
    except Exception as e:
        logging.error(f"Error aplanando JSON: {e}")
        return {parent_key or 'value': obj}
