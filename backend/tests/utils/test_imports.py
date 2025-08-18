#!/usr/bin/env python3
"""Script para verificar que todas las importaciones funcionen correctamente."""

import sys
from pathlib import Path

# Añadir src al path (relativo a la ubicación del script)
backend_src = Path(__file__).parent.parent.parent / 'src'
sys.path.insert(0, str(backend_src))

def test_imports():
    """Probar todas las importaciones críticas."""
    try:
        # Test 1: Importar modelos principales
        from src.models.user import db, User, Conversion, CreditTransaction
        print("✅ Modelos importados correctamente")
        
        # Test 2: Importar normalización
        from src.nexus.encoding_normalizer import detect_encoding, normalize_to_utf8
        print("✅ Módulo de normalización importado correctamente")
        
        # Test 3: Verificar chardet
        import chardet
        print(f"✅ chardet disponible: versión {chardet.__version__}")
        
        # Test 4: Verificar ftfy
        import ftfy
        print(f"✅ ftfy disponible: versión {ftfy.__version__}")
        
        print("\n🎉 Todas las importaciones funcionan correctamente!")
        return True
        
    except ImportError as e:
        print(f"❌ Error de importación: {e}")
        return False
    except Exception as e:
        print(f"❌ Error inesperado: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)
