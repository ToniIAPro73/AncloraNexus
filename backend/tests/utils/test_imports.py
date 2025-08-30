#!/usr/bin/env python3
"""Script para verificar que todas las importaciones funcionen correctamente."""

import sys
from pathlib import Path

# AÃ±adir src al path (relativo a la ubicaciÃ³n del script)
backend_src = Path(__file__).parent.parent.parent / 'src'
sys.path.insert(0, str(backend_src))

def test_imports():
    """Probar todas las importaciones crÃ­ticas."""
    try:
        # Test 1: Importar modelos principales
        from src.models.user import db, User, Conversion, CreditTransaction
        print("âœ… Modelos importados correctamente")
        
        # Test 2: Importar normalizaciÃ³n
        from src.encoding_normalizer import detect_encoding, normalize_to_utf8
        print("âœ… MÃ³dulo de normalizaciÃ³n importado correctamente")
        
        # Test 3: Verificar chardet
        import chardet
        print(f"âœ… chardet disponible: versiÃ³n {chardet.__version__}")
        
        # Test 4: Verificar ftfy
        import ftfy
        print(f"âœ… ftfy disponible: versiÃ³n {ftfy.__version__}")
        
        print("\nðŸŽ‰ Todas las importaciones funcionan correctamente!")
        return True
        
    except ImportError as e:
        print(f"âŒ Error de importaciÃ³n: {e}")
        return False
    except Exception as e:
        print(f"âŒ Error inesperado: {e}")
        return False

if __name__ == "__main__":
    success = test_imports()
    sys.exit(0 if success else 1)

