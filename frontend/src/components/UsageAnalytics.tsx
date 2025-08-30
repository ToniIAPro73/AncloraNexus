import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui';
import { Badge, Button } from './ui';
import { 
  DonutChart,
  AreaChart, BarList
} from '@tremor/react';
import { 
  PieChart, LineChart as LineChartIcon, BarChart as BarChartIcon,
  Clock, Download, FileText, Filter, Calendar, Zap
} from 'lucide-react';

interface UsageData {
  date: string;
  conversions: number;
  bytesProcessed: number;
}

interface ConversionType {
  name: string;
  value: number;
  color: string;
}

interface TopConversion {
  name: string;
  value: number;
}

interface UsageAnalyticsProps {
  userId?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isPremiumUser: boolean;
  onChangePeriod?: (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  className?: string;
}

export const UsageAnalytics: React.FC<UsageAnalyticsProps> = ({
  period = 'monthly',
  isPremiumUser,
  onChangePeriod,
  className = '',
}) => {
  // Mock data for demonstration
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(period);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [conversionTypes, setConversionTypes] = useState<ConversionType[]>([]);
  const [topConversions, setTopConversions] = useState<TopConversion[]>([]);
  const [statsCards, setStatsCards] = useState({
    totalConversions: 0,
    totalBytes: 0,
    averageConversions: 0,
    conversionLimit: isPremiumUser ? 100 : 20,
    remainingConversions: 0
  });
  
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  // Remove unused state

  // Format display of bytes
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Generate mock data based on selected period
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const mockUsageData: UsageData[] = [];
      const currentDate = new Date();
      let dataPoints = 30;
      
      switch (selectedPeriod) {
        case 'daily':
          dataPoints = 24; // 24 hours
          for (let i = 0; i < dataPoints; i++) {
            const hour = i < 10 ? `0${i}` : `${i}`;
            mockUsageData.push({
              date: `${hour}:00`,
              conversions: Math.floor(Math.random() * 5),
              bytesProcessed: Math.floor(Math.random() * 1000000)
            });
          }
          break;
          
        case 'weekly':
          dataPoints = 7; // 7 days
          for (let i = dataPoints - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(currentDate.getDate() - i);
            mockUsageData.push({
              date: date.toLocaleDateString('es-ES', { weekday: 'short' }),
              conversions: Math.floor(Math.random() * 12) + 1,
              bytesProcessed: Math.floor(Math.random() * 5000000)
            });
          }
          break;
          
        case 'monthly':
          dataPoints = 30; // 30 days
          for (let i = dataPoints - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(currentDate.getDate() - i);
            mockUsageData.push({
              date: date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
              conversions: Math.floor(Math.random() * 8) + 1,
              bytesProcessed: Math.floor(Math.random() * 3000000)
            });
          }
          break;
          
        case 'yearly':
          dataPoints = 12; // 12 months
          for (let i = 0; i < dataPoints; i++) {
            const date = new Date(currentDate.getFullYear(), i, 1);
            mockUsageData.push({
              date: date.toLocaleDateString('es-ES', { month: 'short' }),
              conversions: Math.floor(Math.random() * 50) + 10,
              bytesProcessed: Math.floor(Math.random() * 30000000)
            });
          }
          break;
      }
      
      // Calculate total stats
      const totalConversions = mockUsageData.reduce((sum, item) => sum + item.conversions, 0);
      const totalBytes = mockUsageData.reduce((sum, item) => sum + item.bytesProcessed, 0);
      const averageConversions = Math.round(totalConversions / dataPoints);
      const remainingConversions = isPremiumUser ? 100 - totalConversions : 20 - totalConversions;
      
      setStatsCards({
        totalConversions,
        totalBytes,
        averageConversions,
        conversionLimit: isPremiumUser ? 100 : 20,
        remainingConversions: remainingConversions < 0 ? 0 : remainingConversions
      });

      // Mock conversion types data
      const mockConversionTypes: ConversionType[] = [
        { name: 'PDF a DOCX', value: Math.floor(Math.random() * 20) + 10, color: '#3b82f6' },
        { name: 'DOCX a PDF', value: Math.floor(Math.random() * 15) + 5, color: '#10b981' },
        { name: 'JPG a PNG', value: Math.floor(Math.random() * 10) + 3, color: '#f59e0b' },
        { name: 'MP4 a MP3', value: Math.floor(Math.random() * 8) + 2, color: '#6366f1' },
        { name: 'PNG a SVG', value: Math.floor(Math.random() * 5) + 1, color: '#ec4899' }
      ];
      
      // Mock top conversions
      const mockTopConversions: TopConversion[] = [
        { name: 'PDF a DOCX', value: 45 },
        { name: 'DOCX a PDF', value: 35 },
        { name: 'JPG a PNG', value: 21 },
        { name: 'MP4 a MP3', value: 19 },
        { name: 'PNG a SVG', value: 13 }
      ];
      
      setUsageData(mockUsageData);
      setConversionTypes(mockConversionTypes);
      setTopConversions(mockTopConversions);
      setIsLoading(false);
      
      if (onChangePeriod) {
        onChangePeriod(selectedPeriod);
      }
    }, 1000);
  }, [selectedPeriod, isPremiumUser, onChangePeriod]);

  const handlePeriodChange = (newPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setSelectedPeriod(newPeriod);
  };

  // The component must return JSX
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChartIcon className="mr-2 text-primary h-5 w-5" />
              <CardTitle>Analítica de Uso</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'overview' ? 'secondary' : 'ghost'} 
                size="sm"
                onClick={() => setActiveTab('overview')}
              >
                Resumen
              </Button>
              <Button 
                variant={activeTab === 'detailed' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('detailed')}
              >
                Detallado
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Total Conversiones</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{statsCards.totalConversions}</h3>
                      </div>
                      <div className="p-3 bg-primary/10 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      <span className={statsCards.averageConversions > 5 ? "text-green-400" : "text-slate-400"}>
                        {statsCards.averageConversions} media por {selectedPeriod === 'daily' ? 'hora' : selectedPeriod === 'weekly' ? 'día' : selectedPeriod === 'monthly' ? 'día' : 'mes'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Datos Procesados</p>
                        <h3 className="text-2xl font-bold text-white mt-1">{formatBytes(statsCards.totalBytes)}</h3>
                      </div>
                      <div className="p-3 bg-indigo-500/10 rounded-full">
                        <Zap className="h-5 w-5 text-indigo-500" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-slate-400">
                      <span>
                        {formatBytes(statsCards.totalBytes / (selectedPeriod === 'daily' ? 24 : selectedPeriod === 'weekly' ? 7 : selectedPeriod === 'monthly' ? 30 : 12))} por {selectedPeriod === 'daily' ? 'hora' : selectedPeriod === 'weekly' ? 'día' : selectedPeriod === 'monthly' ? 'día' : 'mes'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Límite de Uso</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                          {statsCards.remainingConversions} / {statsCards.conversionLimit}
                        </h3>
                      </div>
                      <div className="p-3 bg-amber-500/10 rounded-full">
                        <Download className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      {statsCards.remainingConversions < 5 ? (
                        <span className="text-red-400">Casi alcanzando el límite</span>
                      ) : (
                        <span className="text-slate-400">Conversiones restantes</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Plan Actual</p>
                        <h3 className="flex items-center mt-1">
                          <Badge variant={isPremiumUser ? "primary" : "secondary"} className="text-xs">
                            {isPremiumUser ? 'Premium' : 'Gratuito'}
                          </Badge>
                        </h3>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-full">
                        <Clock className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                    <div className="mt-2">
                      {!isPremiumUser ? (
                        <Button className="border border-gray-300 text-xs p-0 h-auto px-2 py-1 rounded">
                          Actualizar a Premium
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-400">Renovación: 15/10/2023</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Usage and Conversion Types Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Usage Chart */}
                <Card>
                  <CardHeader className="flex flex-col space-y-1.5 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <LineChartIcon className="mr-2 text-primary h-5 w-5" />
                        <CardTitle>Historial de conversiones</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant={selectedPeriod === 'daily' ? 'secondary' : 'ghost'}
                          onClick={() => handlePeriodChange('daily')}
                          className="text-xs"
                        >
                          Día
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedPeriod === 'weekly' ? 'secondary' : 'ghost'}
                          onClick={() => handlePeriodChange('weekly')}
                          className="text-xs"
                        >
                          Semana
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedPeriod === 'monthly' ? 'secondary' : 'ghost'}
                          onClick={() => handlePeriodChange('monthly')}
                          className="text-xs"
                        >
                          Mes
                        </Button>
                        <Button
                          size="sm"
                          variant={selectedPeriod === 'yearly' ? 'secondary' : 'ghost'}
                          onClick={() => handlePeriodChange('yearly')}
                          className="text-xs"
                        >
                          Año
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <AreaChart
                        className="h-64"
                        data={usageData}
                        index="date"
                        categories={["conversions"]}
                        colors={["primary"]}
                        showLegend={false}
                        showGridLines={false}
                        showAnimation={true}
                        valueFormatter={(value: number) => `${value.toFixed(0)}`}
                        yAxisWidth={40}
                      />
                    )}
                  </CardContent>
                </Card>
                {/* Conversion Types Chart */}
                <Card>
                  <CardHeader className="flex flex-col space-y-1.5 pb-2">
                    <div className="flex items-center">
                      <PieChart className="mr-2 text-primary h-5 w-5" />
                      <CardTitle>Tipos de conversión</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="h-64 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <DonutChart
                            className="h-48"
                            data={conversionTypes}
                            category="value"
                            index="name"
                            colors={conversionTypes.map(t => t.color)}
                            showAnimation={true}
                            valueFormatter={(value: number) => `${value}`}
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-300 mb-2">Top conversiones</h4>
                          <BarList
                            data={topConversions}
                            valueFormatter={(value: number) => `${value}`}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Detailed View
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Historial detallado</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {}}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {}}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Periodo
                  </Button>
                </div>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-800">
                          <th className="text-left py-3 px-4 font-medium">Fecha</th>
                          <th className="text-left py-3 px-4 font-medium">Nombre</th>
                          <th className="text-left py-3 px-4 font-medium">De</th>
                          <th className="text-left py-3 px-4 font-medium">A</th>
                          <th className="text-left py-3 px-4 font-medium">Tamaño</th>
                          <th className="text-right py-3 px-4 font-medium">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {/* Mock data for table rows */}
                        {Array.from({ length: 10 }).map((_, i) => (
                          <tr key={i} className="hover:bg-slate-800/50">
                            <td className="py-3 px-4 text-slate-300">
                              {new Date(Date.now() - i * 86400000).toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-slate-400" />
                                <span className="text-slate-200">documento_{i+1}.{i % 2 === 0 ? 'docx' : 'pdf'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {i % 2 === 0 ? 'DOCX' : 'PDF'}
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {i % 2 === 0 ? 'PDF' : 'DOCX'}
                            </td>
                            <td className="py-3 px-4 text-slate-300">
                              {formatBytes(Math.random() * 1000000)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Badge 
                                variant={i % 5 !== 0 ? "success" : "danger"}
                              >
                                {i % 5 !== 0 ? 'Completado' : 'Error'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-slate-400">
                  Mostrando 1-10 de 45 resultados
                </div>
                <div className="flex gap-1">
                  <Button className="border border-gray-300 text-sm px-2 py-1 rounded" disabled>Anterior</Button>
                  <Button className="border border-gray-300 text-sm px-2 py-1 rounded bg-slate-800">1</Button>
                  <Button className="border border-gray-300 text-sm px-2 py-1 rounded">2</Button>
                  <Button className="border border-gray-300 text-sm px-2 py-1 rounded">3</Button>
                  <Button className="border border-gray-300 text-sm px-2 py-1 rounded">Siguiente</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageAnalytics;
