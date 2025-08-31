#!/usr/bin/env python3
"""
Suite de pruebas completa para el backend de Anclora Converter
"""

import requests
import json
import time
import uuid
from datetime import datetime
from typing import Any

class AncloraBackendTester:
    """Tester completo para el backend de Anclora Converter"""
    
    def __init__(self, base_url: str = "http://localhost:5001"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []
        self.auth_token = None
        self.test_user_id = None
        self.test_email = None
        
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Registra el resultado de una prueba"""
        result = {
            'test_name': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
        if not success and response_data:
            print(f"   Response: {response_data}")
    
    def test_health_endpoint(self):
        """Prueba el endpoint de salud"""
        try:
            response = self.session.get(f"{self.base_url}/api/health")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test("Health Check", True, "API funcionando correctamente")
                    return True
                else:
                    self.log_test("Health Check", False, "Estado no saludable", data)
                    return False
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Prueba el registro de usuarios"""
        try:
            test_email = f"test_{uuid.uuid4().hex[:8]}@anclora.com"
            user_data = {
                "email": test_email,
                "password": "TestPassword123!",
                "first_name": "Usuario",
                "last_name": "Prueba"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/register",
                json=user_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 201:
                data = response.json()
                if 'access_token' in data:
                    self.auth_token = data['access_token']
                    self.test_user_id = data.get('user', {}).get('id')
                    self.log_test("User Registration", True, f"Usuario registrado: {test_email}")
                    return True
                else:
                    self.log_test("User Registration", False, "Token no recibido", data)
                    return False
            else:
                self.log_test("User Registration", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("User Registration", False, f"Error: {str(e)}")
            return False
    
    def test_user_login(self):
        """Prueba el login de usuarios"""
        try:
            # Usar credenciales del usuario registrado
            if not hasattr(self, 'test_email') or not self.test_email:
                self.log_test("User Login", False, "No hay usuario de prueba registrado")
                return False

            login_data = {
                "email": self.test_email,
                "password": "TestPassword123!"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/auth/login",
                json=login_data,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'access_token' in data:
                    self.log_test("User Login", True, "Login exitoso")
                    return True
                else:
                    self.log_test("User Login", False, "Token no recibido", data)
                    return False
            else:
                self.log_test("User Login", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("User Login", False, f"Error: {str(e)}")
            return False
    
    def test_conversion_formats(self):
        """Prueba el endpoint de formatos soportados"""
        try:
            response = self.session.get(f"{self.base_url}/api/conversion/supported-formats")
            
            if response.status_code == 200:
                data = response.json()
                if 'supported_conversions' in data and 'format_categories' in data:
                    total_conversions = data.get('total_conversions', 0)
                    self.log_test("Conversion Formats", True, f"{total_conversions} conversiones soportadas")
                    return True
                else:
                    self.log_test("Conversion Formats", False, "Estructura de respuesta inválida", data)
                    return False
            else:
                self.log_test("Conversion Formats", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Conversion Formats", False, f"Error: {str(e)}")
            return False
    
    def test_price_estimation(self):
        """Prueba la estimaciÃ³n de precios"""
        try:
            price_request = {
                "source_format": "jpg",
                "target_format": "png",
                "file_size_mb": 5,
                "quality": "standard"
            }
            
            response = self.session.post(
                f"{self.base_url}/api/payments/estimate",
                json=price_request,
                headers={'Content-Type': 'application/json'}
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'estimated_price' in data and 'breakdown' in data:
                    price = data['estimated_price']
                    self.log_test("Price Estimation", True, f"Precio estimado: â‚¬{price}")
                    return True
                else:
                    self.log_test("Price Estimation", False, "Estructura de respuesta invÃ¡lida", data)
                    return False
            else:
                self.log_test("Price Estimation", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Price Estimation", False, f"Error: {str(e)}")
            return False
    
    def test_pricing_tiers(self):
        """Prueba el endpoint de niveles de precios"""
        try:
            response = self.session.get(f"{self.base_url}/api/payments/pricing-tiers")
            
            if response.status_code == 200:
                data = response.json()
                if 'pricing_tiers' in data:
                    tiers = data['pricing_tiers']
                    if 'base_prices' in tiers and 'size_tiers' in tiers:
                        self.log_test("Pricing Tiers", True, "Niveles de precios obtenidos correctamente")
                        return True
                    else:
                        self.log_test("Pricing Tiers", False, "Estructura de tiers invÃ¡lida", data)
                        return False
                else:
                    self.log_test("Pricing Tiers", False, "Estructura de respuesta invÃ¡lida", data)
                    return False
            else:
                self.log_test("Pricing Tiers", False, f"Status code: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Pricing Tiers", False, f"Error: {str(e)}")
            return False
    
    def test_leaderboard(self):
        """Prueba la tabla de líderes"""
        try:
            response = self.session.get(f"{self.base_url}/api/rewards/leaderboard")
            
            if response.status_code == 200:
                data = response.json()
                if 'leaderboard' in data:
                    leaderboard = data['leaderboard']
                    self.log_test("Leaderboard", True, f"Tabla de lÃ­deres con {len(leaderboard)} usuarios")
                    return True
                else:
                    self.log_test("Leaderboard", False, "Estructura de respuesta invÃ¡lida", data)
                    return False
            else:
                self.log_test("Leaderboard", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Leaderboard", False, f"Error: {str(e)}")
            return False
    
    def test_achievements(self):
        """Prueba el endpoint de logros"""
        try:
            response = self.session.get(f"{self.base_url}/api/rewards/achievements")
            
            if response.status_code == 200:
                data = response.json()
                if 'achievements' in data:
                    achievements = data['achievements']
                    total = data.get('total_available', 0)
                    self.log_test("Achievements", True, f"{total} logros disponibles")
                    return True
                else:
                    self.log_test("Achievements", False, "Estructura de respuesta invÃ¡lida", data)
                    return False
            else:
                self.log_test("Achievements", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Achievements", False, f"Error: {str(e)}")
            return False
    
    def test_public_challenges(self):
        """Prueba el endpoint de desafíos públicos"""
        try:
            response = self.session.get(f"{self.base_url}/api/rewards/challenges/public")
            
            if response.status_code == 200:
                data = response.json()
                if 'active_challenges' in data:
                    challenges = data['active_challenges']
                    total = data.get('total_active', 0)
                    self.log_test("Public Challenges", True, f"{total} desafÃ­os activos")
                    return True
                else:
                    self.log_test("Public Challenges", False, "Estructura de respuesta invÃ¡lida", data)
                    return False
            else:
                self.log_test("Public Challenges", False, f"Status code: {response.status_code}", response.text)
                return False
                
        except Exception as e:
            self.log_test("Public Challenges", False, f"Error: {str(e)}")
            return False
    
    def test_authenticated_endpoints(self):
        """Prueba endpoints que requieren autenticaciÃ³n"""
        if not self.auth_token:
            self.log_test("Authenticated Endpoints", False, "No hay token de autenticaciÃ³n")
            return False
        
        headers = {
            'Authorization': f'Bearer {self.auth_token}',
            'Content-Type': 'application/json'
        }
        
        # Probar perfil de usuario
        try:
            response = self.session.get(f"{self.base_url}/api/auth/me", headers=headers)
            if response.status_code == 200:
                self.log_test("User Profile", True, "Perfil de usuario obtenido")
            else:
                self.log_test("User Profile", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("User Profile", False, f"Error: {str(e)}")
            return False
        
        # Probar perfil de recompensas
        try:
            response = self.session.get(f"{self.base_url}/api/rewards/profile", headers=headers)
            if response.status_code == 200:
                self.log_test("Rewards Profile", True, "Perfil de recompensas obtenido")
            else:
                self.log_test("Rewards Profile", False, f"Status code: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Rewards Profile", False, f"Error: {str(e)}")
            return False
        
        return True
    
    def test_error_handling(self):
        """Prueba el manejo de errores"""
        test_cases = [
            {
                'name': 'Invalid Endpoint',
                'url': f"{self.base_url}/api/invalid-endpoint",
                'method': 'GET',
                'expected_status': 404
            },
            {
                'name': 'Invalid JSON',
                'url': f"{self.base_url}/api/payments/estimate",
                'method': 'POST',
                'data': "invalid json",
                'expected_status': 400
            },
            {
                'name': 'Missing Auth Token',
                'url': f"{self.base_url}/api/auth/me",
                'method': 'GET',
                'expected_status': 401
            }
        ]
        
        all_passed = True
        
        for case in test_cases:
            try:
                if case['method'] == 'GET':
                    response = self.session.get(case['url'])
                elif case['method'] == 'POST':
                    headers = {'Content-Type': 'application/json'}
                    if 'data' in case:
                        response = self.session.post(case['url'], data=case['data'], headers=headers)
                    else:
                        response = self.session.post(case['url'], headers=headers)
                
                if response.status_code == case['expected_status']:
                    self.log_test(f"Error Handling - {case['name']}", True, f"Status {response.status_code} como esperado")
                else:
                    self.log_test(f"Error Handling - {case['name']}", False, f"Expected {case['expected_status']}, got {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_test(f"Error Handling - {case['name']}", False, f"Error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def run_all_tests(self):
        """Ejecuta todas las pruebas"""
        print("🚀 Iniciando suite de pruebas del backend Anclora Converter")
        print("=" * 60)
        
        start_time = time.time()
        
        # Pruebas bÃ¡sicas
        self.test_health_endpoint()
        self.test_conversion_formats()
        self.test_price_estimation()
        self.test_pricing_tiers()
        self.test_leaderboard()
        self.test_achievements()
        self.test_public_challenges()
        
        # Pruebas de autenticaciÃ³n
        if self.test_user_registration():
            self.test_authenticated_endpoints()
        
        # Pruebas de manejo de errores
        self.test_error_handling()
        
        end_time = time.time()
        duration = end_time - start_time
        
        # Resumen de resultados
        print("\n" + "=" * 60)
        print("📊 RESUMEN DE PRUEBAS")
        print("=" * 60)

        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests

        print(f"Total de pruebas: {total_tests}")
        print(f"✅ Exitosas: {passed_tests}")
        print(f"❌ Fallidas: {failed_tests}")
        print(f"⏱️ Duración: {duration:.2f} segundos")
        print(f"📈 Tasa de éxito: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n❌ PRUEBAS FALLIDAS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test_name']}: {result['details']}")
        
        return {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': (passed_tests/total_tests)*100,
            'duration': duration,
            'results': self.test_results
        }

if __name__ == "__main__":
    tester = AncloraBackendTester()
    results = tester.run_all_tests()
    
    # Guardar resultados en archivo
    with open('/home/ubuntu/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Resultados guardados en: /home/ubuntu/backend_test_results.json")


