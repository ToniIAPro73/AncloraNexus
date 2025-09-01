"""
API de Business Intelligence para decisiones de reinversión
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import datetime
import logging

try:
    from ...services.reinvestment_advisor import ReinvestmentAdvisor, BusinessMetrics, get_reinvestment_advice
    ADVISOR_AVAILABLE = True
except ImportError:
    ADVISOR_AVAILABLE = False

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/business", tags=["Business Intelligence"])

class MetricsInput(BaseModel):
    """Modelo para entrada de métricas de negocio"""
    monthly_revenue: float
    monthly_costs: float
    conversion_rate: float  # %
    churn_rate: float  # %
    customer_satisfaction: float  # 1-5
    growth_rate: float  # % mensual
    customer_acquisition_cost: Optional[float] = 50
    lifetime_value: Optional[float] = None
    active_users: Optional[int] = None
    paying_users: Optional[int] = None

class QuickAdviceInput(BaseModel):
    """Modelo simplificado para consejo rápido"""
    monthly_revenue: float
    monthly_profit: float
    conversion_rate: float
    churn_rate: float
    customer_satisfaction: float
    growth_rate: float

@router.post("/record-metrics")
async def record_monthly_metrics(metrics_input: MetricsInput):
    """
    Registra métricas mensuales del negocio
    """
    if not ADVISOR_AVAILABLE:
        raise HTTPException(status_code=500, detail="Asesor de reinversión no disponible")
    
    try:
        # Calcular valores derivados si no se proporcionan
        monthly_profit = metrics_input.monthly_revenue - metrics_input.monthly_costs
        
        if metrics_input.lifetime_value is None:
            # Estimación: LTV = Revenue mensual / churn rate * 12 meses
            metrics_input.lifetime_value = (metrics_input.monthly_revenue / 
                                          max(metrics_input.churn_rate/100, 0.01)) * 12
        
        if metrics_input.active_users is None:
            # Estimación: Usuarios activos basado en revenue
            metrics_input.active_users = int(metrics_input.monthly_revenue / 10)
        
        if metrics_input.paying_users is None:
            # Estimación: Usuarios pagos basado en revenue promedio
            metrics_input.paying_users = int(metrics_input.monthly_revenue / 30)
        
        # Crear objeto de métricas
        business_metrics = BusinessMetrics(
            monthly_revenue=metrics_input.monthly_revenue,
            monthly_costs=metrics_input.monthly_costs,
            monthly_profit=monthly_profit,
            conversion_rate=metrics_input.conversion_rate,
            churn_rate=metrics_input.churn_rate,
            customer_satisfaction=metrics_input.customer_satisfaction,
            growth_rate=metrics_input.growth_rate,
            customer_acquisition_cost=metrics_input.customer_acquisition_cost,
            lifetime_value=metrics_input.lifetime_value,
            active_users=metrics_input.active_users,
            paying_users=metrics_input.paying_users,
            date=datetime.now().isoformat()
        )
        
        # Registrar métricas
        advisor = ReinvestmentAdvisor()
        advisor.record_monthly_metrics(business_metrics)
        
        # Generar recomendación inmediata
        recommendation = advisor.calculate_reinvestment_recommendation(business_metrics)
        
        return {
            "success": True,
            "message": "Métricas registradas exitosamente",
            "metrics_recorded": {
                "date": business_metrics.date,
                "monthly_revenue": business_metrics.monthly_revenue,
                "monthly_profit": business_metrics.monthly_profit,
                "business_health_score": recommendation["business_health_score"]
            },
            "immediate_recommendation": recommendation
        }
        
    except Exception as e:
        logger.error(f"Error registrando métricas: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.post("/quick-advice")
async def get_quick_reinvestment_advice(advice_input: QuickAdviceInput):
    """
    Obtiene consejo rápido de reinversión sin registrar métricas
    """
    if not ADVISOR_AVAILABLE:
        raise HTTPException(status_code=500, detail="Asesor de reinversión no disponible")
    
    try:
        advice = get_reinvestment_advice(
            monthly_revenue=advice_input.monthly_revenue,
            monthly_profit=advice_input.monthly_profit,
            conversion_rate=advice_input.conversion_rate,
            churn_rate=advice_input.churn_rate,
            customer_satisfaction=advice_input.customer_satisfaction,
            growth_rate=advice_input.growth_rate
        )
        
        return {
            "success": True,
            "advice": advice,
            "summary": {
                "reinvest_amount": f"${advice['recommended_amount']:.0f}",
                "reinvest_percentage": f"{advice['recommended_reinvestment_rate']:.1%}",
                "business_health": f"{advice['business_health_score']:.0f}/100",
                "business_stage": advice['business_stage'],
                "risk_level": advice['risk_level']
            }
        }
        
    except Exception as e:
        logger.error(f"Error generando consejo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/monthly-report")
async def get_monthly_report():
    """
    Genera reporte mensual completo
    """
    if not ADVISOR_AVAILABLE:
        raise HTTPException(status_code=500, detail="Asesor de reinversión no disponible")
    
    try:
        advisor = ReinvestmentAdvisor()
        report = advisor.generate_monthly_report()
        
        if "error" in report:
            raise HTTPException(status_code=404, detail=report["error"])
        
        return {
            "success": True,
            "report": report
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando reporte: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/business-health")
async def get_business_health_dashboard():
    """
    Dashboard de salud del negocio
    """
    if not ADVISOR_AVAILABLE:
        raise HTTPException(status_code=500, detail="Asesor de reinversión no disponible")
    
    try:
        advisor = ReinvestmentAdvisor()
        
        if not advisor.metrics_history:
            raise HTTPException(status_code=404, detail="No hay datos históricos disponibles")
        
        # Obtener métricas más recientes
        latest_metrics = advisor.metrics_history[-1]
        
        # Calcular salud del negocio
        business_metrics = BusinessMetrics(**latest_metrics)
        recommendation = advisor.calculate_reinvestment_recommendation(business_metrics)
        
        # Calcular tendencias si hay datos suficientes
        trends = {}
        if len(advisor.metrics_history) >= 2:
            trends = advisor._calculate_trends()
        
        return {
            "success": True,
            "dashboard": {
                "current_period": latest_metrics['date'][:7],  # YYYY-MM
                "health_score": recommendation['business_health_score'],
                "business_stage": recommendation['business_stage'],
                "risk_level": recommendation['risk_level'],
                "key_metrics": {
                    "monthly_revenue": latest_metrics['monthly_revenue'],
                    "monthly_profit": latest_metrics['monthly_profit'],
                    "conversion_rate": latest_metrics['conversion_rate'],
                    "churn_rate": latest_metrics['churn_rate'],
                    "growth_rate": latest_metrics['growth_rate'],
                    "customer_satisfaction": latest_metrics['customer_satisfaction']
                },
                "trends": trends,
                "reinvestment_recommendation": {
                    "amount": recommendation['recommended_amount'],
                    "percentage": recommendation['recommended_reinvestment_rate'],
                    "distribution": recommendation['investment_distribution']
                },
                "alerts": self._generate_alerts(latest_metrics, recommendation)
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/investment-simulator")
async def simulate_investment_scenarios(
    current_revenue: float,
    investment_amount: float,
    investment_category: str = "marketing"
):
    """
    Simula escenarios de inversión
    """
    try:
        # Factores de multiplicación por categoría de inversión
        multipliers = {
            "marketing": {"revenue_boost": 1.3, "time_months": 2},
            "product": {"revenue_boost": 1.2, "time_months": 3},
            "team": {"revenue_boost": 1.5, "time_months": 4},
            "infrastructure": {"revenue_boost": 1.1, "time_months": 1},
            "technology": {"revenue_boost": 1.4, "time_months": 3}
        }
        
        if investment_category not in multipliers:
            raise HTTPException(status_code=400, detail="Categoría de inversión no válida")
        
        multiplier_data = multipliers[investment_category]
        
        # Calcular impacto estimado
        investment_ratio = investment_amount / current_revenue
        expected_boost = multiplier_data["revenue_boost"] * min(investment_ratio, 0.5)  # Cap at 50% boost
        
        projected_revenue = current_revenue * expected_boost
        roi_percentage = ((projected_revenue - current_revenue) / investment_amount) * 100
        
        return {
            "success": True,
            "simulation": {
                "investment_category": investment_category,
                "investment_amount": investment_amount,
                "current_revenue": current_revenue,
                "projected_revenue": projected_revenue,
                "revenue_increase": projected_revenue - current_revenue,
                "roi_percentage": roi_percentage,
                "payback_months": multiplier_data["time_months"],
                "recommendation": "Proceder" if roi_percentage > 200 else "Considerar" if roi_percentage > 100 else "No recomendado"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error en simulación: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/growth-projections")
async def get_growth_projections(months: int = 12):
    """
    Proyecciones de crecimiento basadas en reinversión
    """
    if not ADVISOR_AVAILABLE:
        raise HTTPException(status_code=500, detail="Asesor de reinversión no disponible")
    
    try:
        advisor = ReinvestmentAdvisor()
        
        if not advisor.metrics_history:
            raise HTTPException(status_code=404, detail="No hay datos históricos para proyecciones")
        
        # Obtener métricas más recientes
        latest_metrics = advisor.metrics_history[-1]
        current_revenue = latest_metrics['monthly_revenue']
        current_growth_rate = latest_metrics['growth_rate'] / 100  # Convertir a decimal
        
        # Generar proyecciones
        projections = []
        revenue = current_revenue
        
        for month in range(1, months + 1):
            # Aplicar crecimiento mensual
            revenue *= (1 + current_growth_rate)
            
            # Calcular reinversión recomendada
            profit = revenue * 0.7  # Asumiendo 70% margen
            reinvestment_rate = advisor._get_base_reinvestment_rate(revenue)
            reinvestment = profit * reinvestment_rate
            
            projections.append({
                "month": month,
                "projected_revenue": round(revenue, 2),
                "projected_profit": round(profit, 2),
                "recommended_reinvestment": round(reinvestment, 2),
                "cumulative_investment": round(sum(p["recommended_reinvestment"] for p in projections), 2)
            })
        
        return {
            "success": True,
            "projections": {
                "base_metrics": {
                    "starting_revenue": current_revenue,
                    "growth_rate": latest_metrics['growth_rate']
                },
                "monthly_projections": projections,
                "summary": {
                    "final_revenue": projections[-1]["projected_revenue"],
                    "total_growth": ((projections[-1]["projected_revenue"] / current_revenue) - 1) * 100,
                    "total_reinvestment": projections[-1]["cumulative_investment"]
                }
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generando proyecciones: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

def _generate_alerts(metrics: Dict, recommendation: Dict) -> List[Dict]:
    """Genera alertas basadas en métricas"""
    alerts = []
    
    # Alerta de churn alto
    if metrics['churn_rate'] > 10:
        alerts.append({
            "type": "warning",
            "title": "Churn Rate Alto",
            "message": f"Tasa de abandono del {metrics['churn_rate']:.1f}% requiere atención inmediata",
            "action": "Enfocar inversión en retención de clientes"
        })
    
    # Alerta de conversión baja
    if metrics['conversion_rate'] < 2:
        alerts.append({
            "type": "warning",
            "title": "Conversión Baja",
            "message": f"Tasa de conversión del {metrics['conversion_rate']:.1f}% está por debajo del promedio",
            "action": "Optimizar funnel de conversión y UX"
        })
    
    # Alerta de crecimiento negativo
    if metrics['growth_rate'] < 0:
        alerts.append({
            "type": "danger",
            "title": "Crecimiento Negativo",
            "message": f"Decrecimiento del {abs(metrics['growth_rate']):.1f}% requiere acción urgente",
            "action": "Revisar estrategia completa y reducir reinversión"
        })
    
    # Alerta de salud baja
    if recommendation['business_health_score'] < 50:
        alerts.append({
            "type": "danger",
            "title": "Salud del Negocio Crítica",
            "message": f"Puntuación de salud de {recommendation['business_health_score']:.0f}/100",
            "action": "Enfoque en estabilización antes de crecimiento"
        })
    
    # Alerta de oportunidad
    if recommendation['business_health_score'] > 80 and metrics['growth_rate'] > 20:
        alerts.append({
            "type": "success",
            "title": "Momento Ideal para Escalar",
            "message": "Métricas excelentes - momento perfecto para reinversión agresiva",
            "action": "Considerar aumentar inversión en crecimiento"
        })
    
    return alerts

# Endpoint de prueba para generar datos de ejemplo
@router.post("/generate-sample-data")
async def generate_sample_data():
    """
    Genera datos de ejemplo para testing (solo para desarrollo)
    """
    if not ADVISOR_AVAILABLE:
        raise HTTPException(status_code=500, detail="Asesor de reinversión no disponible")
    
    try:
        advisor = ReinvestmentAdvisor()
        
        # Generar 6 meses de datos de ejemplo
        sample_data = [
            {"revenue": 200, "conversion": 3.5, "churn": 8.0, "satisfaction": 3.8, "growth": 15},
            {"revenue": 500, "conversion": 4.2, "churn": 6.5, "satisfaction": 4.0, "growth": 25},
            {"revenue": 800, "conversion": 5.1, "churn": 5.2, "satisfaction": 4.2, "growth": 30},
            {"revenue": 1200, "conversion": 5.8, "churn": 4.1, "satisfaction": 4.4, "growth": 28},
            {"revenue": 1800, "conversion": 6.2, "churn": 3.5, "satisfaction": 4.5, "growth": 22},
            {"revenue": 2400, "conversion": 6.8, "churn": 3.0, "satisfaction": 4.6, "growth": 18}
        ]
        
        for i, data in enumerate(sample_data):
            metrics = BusinessMetrics(
                monthly_revenue=data["revenue"],
                monthly_costs=data["revenue"] * 0.3,
                monthly_profit=data["revenue"] * 0.7,
                conversion_rate=data["conversion"],
                churn_rate=data["churn"],
                customer_satisfaction=data["satisfaction"],
                growth_rate=data["growth"],
                customer_acquisition_cost=50,
                lifetime_value=data["revenue"] / (data["churn"]/100) * 12,
                active_users=int(data["revenue"] / 10),
                paying_users=int(data["revenue"] / 30),
                date=(datetime.now().replace(day=1) - timedelta(days=30*(5-i))).isoformat()
            )
            advisor.record_monthly_metrics(metrics)
        
        return {
            "success": True,
            "message": "Datos de ejemplo generados",
            "months_generated": len(sample_data)
        }
        
    except Exception as e:
        logger.error(f"Error generando datos de ejemplo: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

from datetime import timedelta
