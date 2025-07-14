import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import uuid

from src.models import db
from src.models.conversion_transaction import ConversionTransaction
from src.models.user import User
from src.models.file import File

logger = logging.getLogger(__name__)

class PaymentService:
    """Servicio de pagos para conversiones individuales"""
    
    def __init__(self):
        self.stripe_secret_key = os.environ.get('STRIPE_SECRET_KEY')
        self.stripe_publishable_key = os.environ.get('STRIPE_PUBLISHABLE_KEY')
        self.webhook_secret = os.environ.get('STRIPE_WEBHOOK_SECRET')
        
        # Configuración de precios
        self.pricing_config = self._load_pricing_config()
    
    def _load_pricing_config(self) -> Dict[str, Any]:
        """Carga la configuración de precios"""
        return {
            'base_prices': {
                'image_to_image': 0.05,
                'image_to_document': 0.08,
                'document_to_document': 0.10,
                'document_to_image': 0.12,
                'audio_to_audio': 0.15,
                'video_to_video': 0.25,
                'complex_workflow': 0.40
            },
            'size_multipliers': {
                'small': {'max_mb': 10, 'multiplier': 1.0},
                'medium': {'max_mb': 50, 'multiplier': 1.5},
                'large': {'max_mb': 100, 'multiplier': 2.0},
                'xlarge': {'max_mb': 500, 'multiplier': 3.0},
                'xxlarge': {'max_mb': float('inf'), 'multiplier': 4.0}
            },
            'quality_multipliers': {
                'basic': 1.0,
                'standard': 1.3,
                'high': 1.8,
                'premium': 2.5
            },
            'feature_costs': {
                'batch_processing': 0.10,
                'priority_processing': 0.20,
                'custom_settings': 0.05,
                'watermark_removal': 0.15
            },
            'currency': 'EUR',
            'minimum_charge': 0.05,
            'maximum_charge': 10.00
        }
    
    def calculate_conversion_price(self, conversion_request: Dict[str, Any]) -> Dict[str, Any]:
        """Calcula el precio dinámico para una conversión específica"""
        try:
            source_format = conversion_request.get('source_format', '').lower()
            target_format = conversion_request.get('target_format', '').lower()
            file_size_mb = float(conversion_request.get('file_size_mb', 1))
            quality = conversion_request.get('quality', 'standard')
            features = conversion_request.get('features', [])
            
            # Determinar tipo de conversión
            conversion_type = self._determine_conversion_type(source_format, target_format)
            
            # Precio base
            base_price = self.pricing_config['base_prices'].get(conversion_type, 0.15)
            
            # Multiplicador por tamaño
            size_multiplier = self._get_size_multiplier(file_size_mb)
            
            # Multiplicador por calidad
            quality_multiplier = self.pricing_config['quality_multipliers'].get(quality, 1.0)
            
            # Costos por características adicionales
            feature_cost = sum([
                self.pricing_config['feature_costs'].get(feature, 0)
                for feature in features
            ])
            
            # Factor de demanda del servidor (simulado)
            server_load_factor = self._get_server_load_factor()
            
            # Cálculo final
            total_price = (base_price * size_multiplier * quality_multiplier * server_load_factor) + feature_cost
            
            # Aplicar límites mínimos y máximos
            total_price = max(self.pricing_config['minimum_charge'], 
                            min(total_price, self.pricing_config['maximum_charge']))
            
            # Redondear a 2 decimales
            total_price = round(total_price, 2)
            
            # Desglose detallado
            breakdown = {
                'conversion_type': conversion_type,
                'base_price': base_price,
                'size_category': self._get_size_category(file_size_mb),
                'size_multiplier': size_multiplier,
                'quality': quality,
                'quality_multiplier': quality_multiplier,
                'features': features,
                'feature_cost': feature_cost,
                'server_load_factor': server_load_factor,
                'subtotal': round(base_price * size_multiplier * quality_multiplier * server_load_factor, 2),
                'total_price': total_price,
                'currency': self.pricing_config['currency']
            }
            
            return {
                'success': True,
                'price': total_price,
                'currency': self.pricing_config['currency'],
                'breakdown': breakdown
            }
            
        except Exception as e:
            logger.error(f"Error calculando precio de conversión: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _determine_conversion_type(self, source_format: str, target_format: str) -> str:
        """Determina el tipo de conversión basado en los formatos"""
        format_categories = {
            'image': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp', 'svg'],
            'document': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
            'audio': ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'],
            'video': ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
        }
        
        source_category = None
        target_category = None
        
        for category, formats in format_categories.items():
            if source_format in formats:
                source_category = category
            if target_format in formats:
                target_category = category
        
        if source_category == target_category:
            return f"{source_category}_to_{target_category}"
        elif source_category and target_category:
            return f"{source_category}_to_{target_category}"
        else:
            return "complex_workflow"
    
    def _get_size_multiplier(self, file_size_mb: float) -> float:
        """Obtiene el multiplicador basado en el tamaño del archivo"""
        for size_config in self.pricing_config['size_multipliers'].values():
            if file_size_mb <= size_config['max_mb']:
                return size_config['multiplier']
        return 4.0  # Para archivos muy grandes
    
    def _get_size_category(self, file_size_mb: float) -> str:
        """Obtiene la categoría de tamaño del archivo"""
        for category, size_config in self.pricing_config['size_multipliers'].items():
            if file_size_mb <= size_config['max_mb']:
                return category
        return 'xxlarge'
    
    def _get_server_load_factor(self) -> float:
        """Calcula el factor de carga del servidor (simulado)"""
        # En producción, esto se basaría en métricas reales del servidor
        # Por ahora, simularemos variaciones entre 0.8 y 1.2
        import random
        return round(random.uniform(0.8, 1.2), 2)
    
    def create_payment_intent(self, conversion_request: Dict[str, Any], user_id: Optional[str] = None, session_id: Optional[str] = None) -> Dict[str, Any]:
        """Crea una intención de pago para una conversión"""
        try:
            # Calcular precio
            pricing_result = self.calculate_conversion_price(conversion_request)
            
            if not pricing_result['success']:
                return pricing_result
            
            amount = pricing_result['price']
            currency = pricing_result['currency']
            
            # En una implementación real, aquí se crearía el Payment Intent en Stripe
            # Por ahora, simularemos la respuesta
            mock_payment_intent_id = f"pi_{uuid.uuid4().hex[:24]}"
            mock_client_secret = f"{mock_payment_intent_id}_secret_{uuid.uuid4().hex[:16]}"
            
            # Crear transacción en base de datos
            transaction = ConversionTransaction(
                user_id=user_id,
                session_id=session_id,
                amount=amount,
                currency=currency,
                stripe_payment_intent_id=mock_payment_intent_id,
                payment_status='pending'
            )
            
            # Guardar detalles de la conversión
            transaction.set_conversion_details({
                'source_format': conversion_request.get('source_format'),
                'target_format': conversion_request.get('target_format'),
                'file_size_mb': conversion_request.get('file_size_mb'),
                'quality': conversion_request.get('quality', 'standard'),
                'features': conversion_request.get('features', []),
                'pricing_breakdown': pricing_result['breakdown']
            })
            
            db.session.add(transaction)
            db.session.commit()
            
            return {
                'success': True,
                'client_secret': mock_client_secret,
                'payment_intent_id': mock_payment_intent_id,
                'transaction_id': transaction.id,
                'amount': amount,
                'currency': currency,
                'pricing_breakdown': pricing_result['breakdown']
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creando intención de pago: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def confirm_payment(self, transaction_id: str, payment_method: str = 'card') -> Dict[str, Any]:
        """Confirma un pago completado"""
        try:
            transaction = ConversionTransaction.query.get(transaction_id)
            
            if not transaction:
                return {'success': False, 'error': 'Transacción no encontrada'}
            
            if transaction.payment_status != 'pending':
                return {'success': False, 'error': 'La transacción ya fue procesada'}
            
            # Simular confirmación de pago exitoso
            transaction.payment_status = 'completed'
            transaction.completed_at = datetime.utcnow()
            transaction.payment_method = payment_method
            
            # Otorgar recompensas si es usuario registrado
            if transaction.user_id:
                self._award_payment_rewards(transaction)
            
            db.session.commit()
            
            return {
                'success': True,
                'transaction': transaction.to_dict(),
                'message': 'Pago confirmado exitosamente'
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error confirmando pago: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _award_payment_rewards(self, transaction: ConversionTransaction):
        """Otorga recompensas por pago de conversión"""
        try:
            user = User.query.get(transaction.user_id)
            if not user:
                return
            
            # Calcular puntos basados en el monto pagado
            # 1 EUR = 10 puntos
            points_to_award = int(transaction.amount * 10)
            
            # Otorgar puntos
            user.add_points(points_to_award)
            
            # Crear registro de recompensa
            from src.models.reward_system import UserReward
            reward = UserReward(
                user_id=user.id,
                reward_type='payment_conversion',
                points_awarded=points_to_award,
                description=f'Puntos por conversión pagada (€{transaction.amount})'
            )
            reward.set_metadata({
                'transaction_id': transaction.id,
                'amount_paid': transaction.amount,
                'conversion_type': transaction.get_conversion_details().get('source_format', '') + '_to_' + transaction.get_conversion_details().get('target_format', '')
            })
            
            db.session.add(reward)
            
            logger.info(f"Recompensas otorgadas al usuario {user.id}: {points_to_award} puntos")
            
        except Exception as e:
            logger.error(f"Error otorgando recompensas por pago: {str(e)}")
    
    def process_refund(self, transaction_id: str, reason: str = 'Solicitud del usuario') -> Dict[str, Any]:
        """Procesa un reembolso"""
        try:
            transaction = ConversionTransaction.query.get(transaction_id)
            
            if not transaction:
                return {'success': False, 'error': 'Transacción no encontrada'}
            
            if transaction.payment_status != 'completed':
                return {'success': False, 'error': 'Solo se pueden reembolsar transacciones completadas'}
            
            if transaction.is_refunded:
                return {'success': False, 'error': 'Esta transacción ya fue reembolsada'}
            
            # En una implementación real, aquí se procesaría el reembolso en Stripe
            # Por ahora, simularemos el reembolso automático
            transaction.process_refund(reason=reason)
            
            # Revertir recompensas si es usuario registrado
            if transaction.user_id:
                self._revert_payment_rewards(transaction)
            
            db.session.commit()
            
            return {
                'success': True,
                'transaction': transaction.to_dict(),
                'message': 'Reembolso procesado exitosamente'
            }
            
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error procesando reembolso: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _revert_payment_rewards(self, transaction: ConversionTransaction):
        """Revierte las recompensas de un pago reembolsado"""
        try:
            user = User.query.get(transaction.user_id)
            if not user:
                return
            
            # Calcular puntos a revertir
            points_to_revert = int(transaction.amount * 10)
            
            # Revertir puntos (sin ir por debajo de 0)
            user.total_points = max(0, user.total_points - points_to_revert)
            
            # Crear registro de reversión
            from src.models.reward_system import UserReward
            reward = UserReward(
                user_id=user.id,
                reward_type='payment_refund',
                points_awarded=-points_to_revert,
                description=f'Reversión por reembolso (€{transaction.amount})'
            )
            reward.set_metadata({
                'transaction_id': transaction.id,
                'refund_reason': transaction.refund_reason,
                'original_amount': transaction.amount
            })
            
            db.session.add(reward)
            
            logger.info(f"Recompensas revertidas del usuario {user.id}: {points_to_revert} puntos")
            
        except Exception as e:
            logger.error(f"Error revirtiendo recompensas: {str(e)}")
    
    def get_pricing_tiers(self) -> Dict[str, Any]:
        """Obtiene información sobre los niveles de precios"""
        return {
            'base_prices': self.pricing_config['base_prices'],
            'size_tiers': {
                category: {
                    'max_size_mb': config['max_mb'] if config['max_mb'] != float('inf') else None,
                    'price_multiplier': config['multiplier']
                }
                for category, config in self.pricing_config['size_multipliers'].items()
            },
            'quality_options': self.pricing_config['quality_multipliers'],
            'additional_features': self.pricing_config['feature_costs'],
            'currency': self.pricing_config['currency'],
            'limits': {
                'minimum_charge': self.pricing_config['minimum_charge'],
                'maximum_charge': self.pricing_config['maximum_charge']
            }
        }
    
    def get_payment_statistics(self, user_id: Optional[str] = None, days: int = 30) -> Dict[str, Any]:
        """Obtiene estadísticas de pagos"""
        try:
            # Filtro de fecha
            start_date = datetime.utcnow() - timedelta(days=days)
            
            query = ConversionTransaction.query.filter(
                ConversionTransaction.created_at >= start_date
            )
            
            if user_id:
                query = query.filter_by(user_id=user_id)
            
            transactions = query.all()
            
            # Calcular estadísticas
            total_transactions = len(transactions)
            completed_transactions = [t for t in transactions if t.payment_status == 'completed']
            total_revenue = sum(t.amount for t in completed_transactions)
            average_transaction = total_revenue / max(1, len(completed_transactions))
            
            # Estadísticas por formato
            format_stats = {}
            for transaction in completed_transactions:
                details = transaction.get_conversion_details()
                conversion_type = f"{details.get('source_format', 'unknown')}_to_{details.get('target_format', 'unknown')}"
                
                if conversion_type not in format_stats:
                    format_stats[conversion_type] = {'count': 0, 'revenue': 0}
                
                format_stats[conversion_type]['count'] += 1
                format_stats[conversion_type]['revenue'] += transaction.amount
            
            return {
                'period_days': days,
                'total_transactions': total_transactions,
                'completed_transactions': len(completed_transactions),
                'success_rate': round((len(completed_transactions) / max(1, total_transactions)) * 100, 1),
                'total_revenue': round(total_revenue, 2),
                'average_transaction_value': round(average_transaction, 2),
                'format_statistics': format_stats,
                'currency': self.pricing_config['currency']
            }
            
        except Exception as e:
            logger.error(f"Error obteniendo estadísticas de pagos: {str(e)}")
            return {'error': str(e)}

# Instancia global del servicio de pagos
payment_service = PaymentService()

