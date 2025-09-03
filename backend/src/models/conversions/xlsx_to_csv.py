import os
import logging
import pandas as pd
from pathlib import Path

# Importar librerías para Excel
try:
    import openpyxl
    OPENPYXL_AVAILABLE = True
except ImportError:
    OPENPYXL_AVAILABLE = False
    logging.warning("openpyxl no disponible para XLSX→CSV de alta calidad")

try:
    import xlrd
    XLRD_AVAILABLE = True
except ImportError:
    XLRD_AVAILABLE = False
    logging.warning("xlrd no disponible para archivos Excel legacy")

CONVERSION = ('xlsx', 'csv')

def convert(input_path, output_path):
    """Convierte XLSX a CSV usando la mejor librería disponible"""
    
    # Método 1: pandas + openpyxl (RECOMENDADO - mejor compatibilidad)
    if OPENPYXL_AVAILABLE:
        try:
            success, message = convert_with_openpyxl(input_path, output_path)
            if success:
                return True, f"Conversión XLSX→CSV exitosa con openpyxl - {message}"
        except Exception as e:
            logging.warning(f"openpyxl falló: {e}")
    
    # Método 2: pandas básico (fallback)
    return convert_with_pandas_basic(input_path, output_path)

def convert_with_openpyxl(input_path, output_path):
    """Conversión usando pandas + openpyxl (máxima calidad)"""
    try:
        # Leer Excel con pandas usando openpyxl
        excel_file = pd.ExcelFile(input_path, engine='openpyxl')
        
        # Obtener información de las hojas
        sheet_names = excel_file.sheet_names
        
        if not sheet_names:
            return False, "Excel sin hojas válidas"
        
        # Determinar qué hoja usar
        target_sheet = determine_best_sheet(excel_file, sheet_names)
        
        # Leer la hoja seleccionada
        df = pd.read_excel(input_path, sheet_name=target_sheet, engine='openpyxl')
        
        if df.empty:
            return False, f"Hoja '{target_sheet}' vacía o sin datos válidos"
        
        # Limpiar datos para CSV
        df_cleaned = clean_dataframe_for_csv(df)
        
        # Guardar como CSV con encoding UTF-8
        df_cleaned.to_csv(output_path, index=False, encoding='utf-8-sig')
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            rows, cols = df_cleaned.shape
            sheet_info = f" (hoja: {target_sheet})" if len(sheet_names) > 1 else ""
            return True, f"CSV generado: {rows} filas, {cols} columnas{sheet_info}"
        else:
            return False, "Error: CSV no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con openpyxl: {str(e)}"

def convert_with_pandas_basic(input_path, output_path):
    """Conversión básica usando solo pandas"""
    try:
        # Intentar leer Excel con motor por defecto
        try:
            df = pd.read_excel(input_path)
        except Exception:
            # Intentar con openpyxl si está disponible
            if OPENPYXL_AVAILABLE:
                df = pd.read_excel(input_path, engine='openpyxl')
            else:
                raise Exception("No se puede leer el archivo Excel")
        
        if df.empty:
            return False, "Excel vacío o sin datos válidos"
        
        # Limpiar datos para CSV
        df_cleaned = clean_dataframe_for_csv(df)
        
        # Guardar como CSV
        df_cleaned.to_csv(output_path, index=False, encoding='utf-8-sig')
        
        # Verificar resultado
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            rows, cols = df_cleaned.shape
            return True, f"CSV básico generado: {rows} filas, {cols} columnas"
        else:
            return False, "Error: CSV no se generó correctamente"
        
    except Exception as e:
        return False, f"Error con pandas básico: {str(e)}"

def determine_best_sheet(excel_file, sheet_names):
    """Determinar la mejor hoja para convertir"""
    try:
        # Prioridades para seleccionar hoja:
        # 1. Primera hoja con datos
        # 2. Hoja llamada 'Data', 'Datos', 'Sheet1'
        # 3. Hoja más grande
        
        preferred_names = ['data', 'datos', 'sheet1', 'hoja1']
        
        # Buscar hojas con nombres preferidos
        for sheet_name in sheet_names:
            if sheet_name.lower() in preferred_names:
                df_test = pd.read_excel(excel_file, sheet_name=sheet_name, nrows=5)
                if not df_test.empty:
                    return sheet_name
        
        # Buscar primera hoja con datos
        for sheet_name in sheet_names:
            try:
                df_test = pd.read_excel(excel_file, sheet_name=sheet_name, nrows=5)
                if not df_test.empty:
                    return sheet_name
            except:
                continue
        
        # Si no encuentra datos, usar primera hoja
        return sheet_names[0]
        
    except Exception:
        return sheet_names[0] if sheet_names else None

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
        
        # Eliminar filas duplicadas si existen muchas
        if len(df_clean) > 10:
            duplicates_before = len(df_clean)
            df_clean = df_clean.drop_duplicates()
            duplicates_after = len(df_clean)
            
            if duplicates_before - duplicates_after > 0:
                logging.info(f"Eliminadas {duplicates_before - duplicates_after} filas duplicadas")
        
        return df_clean
        
    except Exception as e:
        logging.warning(f"Error limpiando DataFrame: {e}")
        return df

def clean_column_name(column_name):
    """Limpiar nombre de columna"""
    try:
        # Convertir a string si no lo es
        name = str(column_name)
        
        # Reemplazar valores problemáticos
        if name.lower() in ['unnamed', 'nan', 'none', '']:
            return 'Columna_Sin_Nombre'
        
        # Limpiar caracteres problemáticos para CSV
        name = name.replace('\n', ' ').replace('\r', ' ')
        name = name.replace('"', "'").replace(',', ';')
        
        # Limitar longitud
        if len(name) > 50:
            name = name[:47] + '...'
        
        return name.strip()
        
    except Exception:
        return 'Columna_Error'

def clean_cell_value(value):
    """Limpiar valor de celda"""
    try:
        # Manejar valores nulos
        if pd.isna(value) or value is None:
            return ''
        
        # Convertir a string
        str_value = str(value)
        
        # Limpiar caracteres problemáticos
        str_value = str_value.replace('\n', ' ').replace('\r', ' ')
        str_value = str_value.replace('"', "'")
        
        # Manejar valores numéricos con decimales innecesarios
        try:
            if '.' in str_value and str_value.replace('.', '').replace('-', '').isdigit():
                float_val = float(str_value)
                if float_val.is_integer():
                    return str(int(float_val))
        except:
            pass
        
        return str_value.strip()
        
    except Exception:
        return str(value) if value is not None else ''

def get_excel_info(input_path):
    """Obtener información del archivo Excel"""
    try:
        excel_file = pd.ExcelFile(input_path, engine='openpyxl' if OPENPYXL_AVAILABLE else None)
        
        info = {
            'sheets': len(excel_file.sheet_names),
            'sheet_names': excel_file.sheet_names,
            'total_rows': 0,
            'total_cols': 0
        }
        
        # Obtener información de cada hoja
        for sheet_name in excel_file.sheet_names[:3]:  # Máximo 3 hojas para no sobrecargar
            try:
                df = pd.read_excel(excel_file, sheet_name=sheet_name, nrows=1000)
                info['total_rows'] += len(df)
                info['total_cols'] = max(info['total_cols'], len(df.columns))
            except:
                continue
        
        return info
        
    except Exception as e:
        return {'error': str(e)}
