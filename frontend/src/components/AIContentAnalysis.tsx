// src/components/AIContentAnalysis.tsx - Componente de análisis IA de contenido
import React, { useState, useEffect } from 'react';
import { 
  Brain, FileText, BarChart3, Lightbulb, AlertTriangle, 
  CheckCircle, TrendingUp, Eye, Zap, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/button';
import { Progress } from './ui/Progress';
import { Tabs, TabsContent } from './ui/Tabs';

interface ContentStats {
  page_count: number;
  word_count: number;
  image_count: number;
  table_count: number;
  has_forms: boolean;
  has_hyperlinks: boolean;
  has_embedded_media: boolean;
  text_to_image_ratio: number;
}

interface FormatRecommendation {
  format: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface AnalysisData {
  file_type: string;
  content_type: string;
  complexity_score: number;
  quality_score: number;
  size_mb: number;
  content_stats: ContentStats;
  recommendations: {
    formats: FormatRecommendation[];
    optimizations: string[];
    quality_issues: string[];
  };
  metadata: Record<string, any>;
}

interface AIContentAnalysisProps {
  analysisData: AnalysisData | null;
  isLoading: boolean;
  onAnalyze: () => void;
  fileName?: string;
}

const AIContentAnalysis: React.FC<AIContentAnalysisProps> = ({
  analysisData,
  isLoading,
  onAnalyze,
  fileName
}) => {
  const [selectedTab, setSelectedTab] = useState('overview');

  const getComplexityColor = (score: number) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'presentation': return '📊';
      case 'technical_document': return '🔧';
      case 'visual_document': return '🖼️';
      case 'form': return '📝';
      case 'report': return '📋';
      case 'manual': return '📖';
      default: return '📄';
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 animate-pulse" />
            Analizando contenido con IA...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
            <Progress value={33} className="w-full" />
            <p className="text-sm text-gray-600">
              Analizando estructura, contenido y generando recomendaciones...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysisData) {
    return (
      <Card className="w-full bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Análisis IA de Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Eye className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">
              Sube un archivo para obtener análisis inteligente y recomendaciones personalizadas
            </p>
            <Button onClick={onAnalyze} className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Analizar Archivo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Contenido para cada tab
  const overviewContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <FileText className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-sm text-gray-600">Páginas</p>
              <p className="text-xl font-bold">{analysisData.content_stats.page_count}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📝</div>
              <p className="text-sm text-gray-600">Palabras</p>
              <p className="text-xl font-bold">{analysisData.content_stats.word_count.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <p className="text-sm text-gray-600">Imágenes</p>
              <p className="text-xl font-bold">{analysisData.content_stats.image_count}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <p className="text-sm text-gray-600">Tablas</p>
              <p className="text-xl font-bold">{analysisData.content_stats.table_count}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Características especiales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Características Detectadas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {analysisData.content_stats.has_forms && (
              <Badge variant="outline">📝 Formularios</Badge>
            )}
            {analysisData.content_stats.has_hyperlinks && (
              <Badge variant="outline">🔗 Enlaces</Badge>
            )}
            {analysisData.content_stats.has_embedded_media && (
              <Badge variant="outline">🎵 Media Embebido</Badge>
            )}
            {analysisData.content_stats.text_to_image_ratio > 100 && (
              <Badge variant="outline">📄 Rico en Texto</Badge>
            )}
            {analysisData.content_stats.text_to_image_ratio < 10 && (
              <Badge variant="outline">🖼️ Rico en Imágenes</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const recommendationsContent = (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Formatos Recomendados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {analysisData.recommendations.formats.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
              <Badge variant={getPriorityBadgeVariant(rec.priority)}>
                {rec.priority}
              </Badge>
              <div className="flex-1">
                <p className="font-medium">{rec.format.toUpperCase()}</p>
                <p className="text-sm text-gray-600">{rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const optimizationsContent = (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Sugerencias de Optimización
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analysisData.recommendations.optimizations.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {analysisData.recommendations.quality_issues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Problemas de Calidad Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisData.recommendations.quality_issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-2 p-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{issue}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const detailsContent = (
    <Card>
      <CardHeader>
        <CardTitle>Metadatos del Archivo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(analysisData.metadata).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-sm text-gray-600 capitalize">
                {key.replace('_', ' ')}:
              </span>
              <span className="text-sm font-medium">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full space-y-6">
      {/* Header con información básica */}
      <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-400" />
            Análisis IA: {fileName || 'Archivo'}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              {getContentTypeIcon(analysisData.content_type)}
              {analysisData.content_type.replace('_', ' ')}
            </span>
            <span>•</span>
            <span>{analysisData.file_type.toUpperCase()}</span>
            <span>•</span>
            <span>{analysisData.size_mb.toFixed(2)} MB</span>
          </div>
        </CardHeader>
      </Card>

      {/* Scores principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Complejidad</p>
                <p className={`text-2xl font-bold ${getComplexityColor(analysisData.complexity_score)}`}>
                  {analysisData.complexity_score.toFixed(0)}/100
                </p>
              </div>
              <BarChart3 className={`h-8 w-8 ${getComplexityColor(analysisData.complexity_score)}`} />
            </div>
            <Progress value={analysisData.complexity_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/90 backdrop-blur-md border border-slate-700/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">Calidad</p>
                <p className={`text-2xl font-bold ${getQualityColor(analysisData.quality_score)}`}>
                  {analysisData.quality_score.toFixed(0)}/100
                </p>
              </div>
              <Target className={`h-8 w-8 ${getQualityColor(analysisData.quality_score)}`} />
            </div>
            <Progress value={analysisData.quality_score} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs con información detallada */}
      <Tabs
        items={[
          { id: 'overview', label: 'Resumen', content: overviewContent },
          { id: 'recommendations', label: 'Recomendaciones', content: recommendationsContent },
          { id: 'optimizations', label: 'Optimizaciones', content: optimizationsContent },
          { id: 'details', label: 'Detalles', content: detailsContent }
        ]}
        defaultTab={selectedTab}
        onChange={setSelectedTab}
        className="w-full"
      />
    </div>
  );
};

export default AIContentAnalysis;
