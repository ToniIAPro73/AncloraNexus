"""
Asesor de Reinversión Inteligente
Analiza métricas y recomienda cuánto y dónde reinvertir los beneficios
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class BusinessMetrics:
    """Métricas de negocio para análisis de reinversión"""
    monthly_revenue: float
    monthly_costs: float
    monthly_profit: float
    conversion_rate: float  # %
    churn_rate: float  # %
    customer_satisfaction: float  # 1-5
    growth_rate: float  # % mensual
    customer_acquisition_cost: float
    lifetime_value: float
    active_users: int
    paying_users: int
    date: str

class ReinvestmentAdvisor:
    """
    Asesor inteligente de reinversión basado en métricas de negocio
    """
    
    def __init__(self, metrics_file: str = "business_metrics.json"):
        self.metrics_file = metrics_file
        self.metrics_history = self._load_metrics_history()
    
    def _load_metrics_history(self) -> List[Dict]:
        """Carga historial de métricas"""
        if os.path.exists(self.metrics_file):
            try:
                with open(self.metrics_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                logger.warning(f"Error cargando métricas: {e}")
                return []
        return []
    
    def _save_metrics(self):
        """Guarda métricas al archivo"""
        try:
            with open(self.metrics_file, 'w', encoding='utf-8') as f:
                json.dump(self.metrics_history, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error guardando métricas: {e}")
    
    def record_monthly_metrics(self, metrics: BusinessMetrics):
        """Registra métricas mensuales"""
        metrics_dict = {
            'monthly_revenue': metrics.monthly_revenue,
            'monthly_costs': metrics.monthly_costs,
            'monthly_profit': metrics.monthly_profit,
            'conversion_rate': metrics.conversion_rate,
            'churn_rate': metrics.churn_rate,
            'customer_satisfaction': metrics.customer_satisfaction,
            'growth_rate': metrics.growth_rate,
            'customer_acquisition_cost': metrics.customer_acquisition_cost,
            'lifetime_value': metrics.lifetime_value,
            'active_users': metrics.active_users,
            'paying_users': metrics.paying_users,
            'date': metrics.date
        }
        
        self.metrics_history.append(metrics_dict)
        self._save_metrics()
        logger.info(f"Métricas registradas para {metrics.date}")
    
    def calculate_reinvestment_recommendation(self, current_metrics: BusinessMetrics) -> Dict:
        """
        Calcula recomendación de reinversión basada en métricas actuales
        """
        
        # Calcular salud del negocio
        business_health = self._calculate_business_health(current_metrics)
        
        # Determinar porcentaje de reinversión base
        base_reinvestment_rate = self._get_base_reinvestment_rate(current_metrics.monthly_revenue)
        
        # Ajustar por salud del negocio
        adjusted_rate = self._adjust_reinvestment_rate(base_reinvestment_rate, business_health)
        
        # Calcular cantidad a reinvertir
        reinvestment_amount = current_metrics.monthly_profit * adjusted_rate
        
        # Recomendar distribución de inversión
        investment_distribution = self._recommend_investment_distribution(
            current_metrics, business_health, reinvestment_amount
        )
        
        return {
            'recommended_reinvestment_rate': adjusted_rate,
            'recommended_amount': reinvestment_amount,
            'business_health_score': business_health['overall_score'],
            'business_stage': self._determine_business_stage(current_metrics.monthly_revenue),
            'investment_distribution': investment_distribution,
            'reasoning': self._generate_reasoning(current_metrics, business_health),
            'risk_level': self._assess_risk_level(business_health),
            'next_review_date': (datetime.now() + timedelta(days=30)).isoformat()
        }
    
    def _calculate_business_health(self, metrics: BusinessMetrics) -> Dict:
        """Calcula puntuación de salud del negocio"""
        
        health_factors = {}
        
        # Factor 1: Tasa de conversión (0-100)
        if metrics.conversion_rate >= 10:
            health_factors['conversion'] = 100
        elif metrics.conversion_rate >= 5:
            health_factors['conversion'] = 80
        elif metrics.conversion_rate >= 2:
            health_factors['conversion'] = 60
        else:
            health_factors['conversion'] = 30
        
        # Factor 2: Churn rate (0-100, invertido)
        if metrics.churn_rate <= 2:
            health_factors['retention'] = 100
        elif metrics.churn_rate <= 5:
            health_factors['retention'] = 80
        elif metrics.churn_rate <= 10:
            health_factors['retention'] = 60
        else:
            health_factors['retention'] = 30
        
        # Factor 3: Satisfacción del cliente (0-100)
        health_factors['satisfaction'] = (metrics.customer_satisfaction / 5) * 100
        
        # Factor 4: Crecimiento (0-100)
        if metrics.growth_rate >= 30:
            health_factors['growth'] = 100
        elif metrics.growth_rate >= 20:
            health_factors['growth'] = 80
        elif metrics.growth_rate >= 10:
            health_factors['growth'] = 60
        elif metrics.growth_rate >= 0:
            health_factors['growth'] = 40
        else:
            health_factors['growth'] = 20
        
        # Factor 5: LTV/CAC ratio (0-100)
        ltv_cac_ratio = metrics.lifetime_value / max(metrics.customer_acquisition_cost, 1)
        if ltv_cac_ratio >= 5:
            health_factors['unit_economics'] = 100
        elif ltv_cac_ratio >= 3:
            health_factors['unit_economics'] = 80
        elif ltv_cac_ratio >= 2:
            health_factors['unit_economics'] = 60
        else:
            health_factors['unit_economics'] = 30
        
        # Calcular puntuación general
        overall_score = sum(health_factors.values()) / len(health_factors)
        
        return {
            'factors': health_factors,
            'overall_score': overall_score
        }
    
    def _get_base_reinvestment_rate(self, monthly_revenue: float) -> float:
        """Determina tasa de reinversión base según revenue"""
        
        if monthly_revenue < 500:
            return 0.8  # 80% - Supervivencia
        elif monthly_revenue < 2000:
            return 0.75  # 75% - Crecimiento temprano
        elif monthly_revenue < 10000:
            return 0.7   # 70% - Crecimiento
        elif monthly_revenue < 50000:
            return 0.6   # 60% - Escalabilidad
        else:
            return 0.5   # 50% - Madurez
    
    def _adjust_reinvestment_rate(self, base_rate: float, business_health: Dict) -> float:
        """Ajusta tasa de reinversión según salud del negocio"""
        
        health_score = business_health['overall_score']
        
        if health_score >= 80:
            # Negocio muy saludable - reinvertir más agresivamente
            return min(base_rate + 0.1, 0.9)
        elif health_score >= 60:
            # Negocio saludable - mantener tasa base
            return base_rate
        elif health_score >= 40:
            # Negocio con problemas - reducir reinversión
            return max(base_rate - 0.1, 0.3)
        else:
            # Negocio en crisis - reinversión mínima
            return max(base_rate - 0.2, 0.2)
    
    def _recommend_investment_distribution(self, metrics: BusinessMetrics, 
                                         business_health: Dict, total_amount: float) -> Dict:
        """Recomienda cómo distribuir la inversión"""
        
        stage = self._determine_business_stage(metrics.monthly_revenue)
        health_score = business_health['overall_score']
        
        if stage == "supervivencia":
            return {
                'infrastructure': total_amount * 0.5,
                'marketing': total_amount * 0.3,
                'product': total_amount * 0.2,
                'team': 0
            }
        elif stage == "crecimiento_temprano":
            return {
                'marketing': total_amount * 0.4,
                'product': total_amount * 0.35,
                'infrastructure': total_amount * 0.25,
                'team': 0
            }
        elif stage == "crecimiento":
            return {
                'team': total_amount * 0.4,
                'marketing': total_amount * 0.3,
                'product': total_amount * 0.2,
                'infrastructure': total_amount * 0.1
            }
        elif stage == "escalabilidad":
            return {
                'team': total_amount * 0.45,
                'technology': total_amount * 0.3,
                'expansion': total_amount * 0.25
            }
        else:  # madurez
            return {
                'innovation': total_amount * 0.4,
                'expansion': total_amount * 0.35,
                'acquisitions': total_amount * 0.25
            }
    
    def _determine_business_stage(self, monthly_revenue: float) -> str:
        """Determina etapa del negocio"""
        if monthly_revenue < 1000:
            return "supervivencia"
        elif monthly_revenue < 5000:
            return "crecimiento_temprano"
        elif monthly_revenue < 20000:
            return "crecimiento"
        elif monthly_revenue < 100000:
            return "escalabilidad"
        else:
            return "madurez"
    
    def _generate_reasoning(self, metrics: BusinessMetrics, business_health: Dict) -> List[str]:
        """Genera explicación de las recomendaciones"""
        
        reasoning = []
        health_score = business_health['overall_score']
        
        # Análisis de salud general
        if health_score >= 80:
            reasoning.append("🟢 Negocio muy saludable - momento ideal para reinversión agresiva")
        elif health_score >= 60:
            reasoning.append("🟡 Negocio saludable - mantener estrategia de reinversión")
        else:
            reasoning.append("🔴 Negocio necesita atención - reducir reinversión y enfocar en problemas")
        
        # Análisis específico por factor
        factors = business_health['factors']
        
        if factors['conversion'] < 60:
            reasoning.append("⚠️ Tasa de conversión baja - priorizar marketing y UX")
        
        if factors['retention'] < 60:
            reasoning.append("⚠️ Alta tasa de churn - enfocar en satisfacción del cliente")
        
        if factors['growth'] < 60:
            reasoning.append("⚠️ Crecimiento lento - aumentar inversión en adquisición")
        
        if factors['unit_economics'] < 60:
            reasoning.append("⚠️ Unit economics problemáticos - optimizar CAC y LTV")
        
        # Recomendaciones por etapa
        stage = self._determine_business_stage(metrics.monthly_revenue)
        
        if stage == "supervivencia":
            reasoning.append("🎯 Etapa de supervivencia - priorizar infraestructura y validación")
        elif stage == "crecimiento_temprano":
            reasoning.append("🎯 Crecimiento temprano - balancear marketing y producto")
        elif stage == "crecimiento":
            reasoning.append("🎯 Etapa de crecimiento - momento de construir equipo")
        
        return reasoning
    
    def _assess_risk_level(self, business_health: Dict) -> str:
        """Evalúa nivel de riesgo de la reinversión"""
        
        health_score = business_health['overall_score']
        
        if health_score >= 80:
            return "bajo"
        elif health_score >= 60:
            return "medio"
        elif health_score >= 40:
            return "alto"
        else:
            return "muy_alto"
    
    def generate_monthly_report(self) -> Dict:
        """Genera reporte mensual de métricas y recomendaciones"""
        
        if not self.metrics_history:
            return {"error": "No hay datos históricos disponibles"}
        
        # Obtener métricas más recientes
        latest_metrics = self.metrics_history[-1]
        
        # Calcular tendencias
        trends = self._calculate_trends()
        
        # Generar recomendación
        current_metrics = BusinessMetrics(**latest_metrics)
        recommendation = self.calculate_reinvestment_recommendation(current_metrics)
        
        return {
            'period': latest_metrics['date'],
            'current_metrics': latest_metrics,
            'trends': trends,
            'reinvestment_recommendation': recommendation,
            'key_insights': self._generate_key_insights(trends, recommendation),
            'action_items': self._generate_action_items(recommendation)
        }
    
    def _calculate_trends(self) -> Dict:
        """Calcula tendencias de métricas clave"""
        
        if len(self.metrics_history) < 2:
            return {"insufficient_data": True}
        
        current = self.metrics_history[-1]
        previous = self.metrics_history[-2]
        
        return {
            'revenue_change': ((current['monthly_revenue'] - previous['monthly_revenue']) / previous['monthly_revenue']) * 100,
            'profit_change': ((current['monthly_profit'] - previous['monthly_profit']) / previous['monthly_profit']) * 100,
            'users_change': ((current['active_users'] - previous['active_users']) / previous['active_users']) * 100,
            'conversion_change': current['conversion_rate'] - previous['conversion_rate'],
            'churn_change': current['churn_rate'] - previous['churn_rate']
        }
    
    def _generate_key_insights(self, trends: Dict, recommendation: Dict) -> List[str]:
        """Genera insights clave del análisis"""
        
        insights = []
        
        if 'revenue_change' in trends:
            if trends['revenue_change'] > 20:
                insights.append("🚀 Crecimiento acelerado de revenue - excelente momento para escalar")
            elif trends['revenue_change'] < -10:
                insights.append("⚠️ Decline en revenue - revisar estrategia urgentemente")
        
        risk_level = recommendation['risk_level']
        if risk_level == "bajo":
            insights.append("✅ Bajo riesgo de reinversión - proceder con confianza")
        elif risk_level == "muy_alto":
            insights.append("🚨 Alto riesgo - considerar reducir reinversión")
        
        return insights
    
    def _generate_action_items(self, recommendation: Dict) -> List[str]:
        """Genera elementos de acción específicos"""
        
        actions = []
        amount = recommendation['recommended_amount']
        distribution = recommendation['investment_distribution']
        
        for category, investment in distribution.items():
            if investment > 0:
                actions.append(f"💰 Invertir ${investment:.0f} en {category}")
        
        actions.append(f"📅 Revisar métricas el {recommendation['next_review_date'][:10]}")
        
        return actions

# Función de conveniencia
def get_reinvestment_advice(monthly_revenue: float, monthly_profit: float, 
                          conversion_rate: float, churn_rate: float,
                          customer_satisfaction: float, growth_rate: float) -> Dict:
    """
    Función de conveniencia para obtener consejo de reinversión rápido
    """
    
    advisor = ReinvestmentAdvisor()
    
    metrics = BusinessMetrics(
        monthly_revenue=monthly_revenue,
        monthly_costs=monthly_revenue - monthly_profit,
        monthly_profit=monthly_profit,
        conversion_rate=conversion_rate,
        churn_rate=churn_rate,
        customer_satisfaction=customer_satisfaction,
        growth_rate=growth_rate,
        customer_acquisition_cost=50,  # Estimación
        lifetime_value=monthly_revenue / max(churn_rate/100, 0.01) * 12,  # Estimación
        active_users=int(monthly_revenue / 10),  # Estimación
        paying_users=int(monthly_revenue / 30),  # Estimación
        date=datetime.now().isoformat()
    )
    
    return advisor.calculate_reinvestment_recommendation(metrics)

# Ejemplo de uso
if __name__ == "__main__":
    # Simular métricas de ejemplo
    advice = get_reinvestment_advice(
        monthly_revenue=1500,
        monthly_profit=1000,
        conversion_rate=5.5,
        churn_rate=3.2,
        customer_satisfaction=4.2,
        growth_rate=25.0
    )
    
    print("=== CONSEJO DE REINVERSIÓN ===")
    print(f"Tasa recomendada: {advice['recommended_reinvestment_rate']:.1%}")
    print(f"Cantidad a reinvertir: ${advice['recommended_amount']:.0f}")
    print(f"Salud del negocio: {advice['business_health_score']:.0f}/100")
    print(f"Etapa: {advice['business_stage']}")
    print(f"Riesgo: {advice['risk_level']}")
    
    print("\nDistribución recomendada:")
    for category, amount in advice['investment_distribution'].items():
        print(f"  {category}: ${amount:.0f}")
    
    print("\nRazonamiento:")
    for reason in advice['reasoning']:
        print(f"  {reason}")
