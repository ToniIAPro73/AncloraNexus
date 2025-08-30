import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui';
import { Button, Badge } from './ui';
import { Settings, Sliders, RotateCw, Lock, Unlock, Info, Save, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ConversionSetting {
  id: string;
  name: string;
  description: string;
  type: 'slider' | 'toggle' | 'select' | 'number';
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  unit?: string;
  isPremium?: boolean;
}

interface AdvancedSettingsProps {
  formatFrom: string;
  formatTo: string;
  settings: ConversionSetting[];
  onChange: (settings: Record<string, any>) => void;
  isPremiumUser: boolean;
  onSavePreset: (name: string, settings: Record<string, any>) => void;
  presets: { id: string; name: string; settings: Record<string, any> }[];
  onSelectPreset: (presetId: string) => void;
  className?: string;
  onApplySettings?: (settings: Record<string, unknown>) => void;
}

export const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  formatFrom,
  formatTo,
  settings,
  onChange,
  isPremiumUser,
  onSavePreset,
  presets,
  onSelectPreset,
  className = '',
}) => {
  const [currentSettings, setCurrentSettings] = useState<Record<string, any>>(() => {
    return settings.reduce((acc, setting) => {
      acc[setting.id] = setting.default;
      return acc;
    }, {} as Record<string, any>);
  });

  const [presetName, setPresetName] = useState('');
  const [showSavePreset, setShowSavePreset] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  const handleSettingChange = (id: string, value: any) => {
    setCurrentSettings(prev => {
      const newSettings = { ...prev, [id]: value };
      onChange(newSettings);
      return newSettings;
    });
  };

  const handleSavePreset = () => {
    if (presetName.trim()) {
      onSavePreset(presetName, currentSettings);
      setPresetName('');
      setShowSavePreset(false);
    }
  };

  const handleResetToDefaults = () => {
    const defaultSettings = settings.reduce((acc, setting) => {
      acc[setting.id] = setting.default;
      return acc;
    }, {} as Record<string, any>);
    setCurrentSettings(defaultSettings);
    onChange(defaultSettings);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const basicSettings = settings.filter(s => !s.isPremium && ['quality', 'size', 'format', 'compression'].includes(s.id));
  const advancedSettings = settings.filter(s => !s.isPremium && !['quality', 'size', 'format', 'compression'].includes(s.id));
  const premiumSettings = settings.filter(s => s.isPremium);

  const renderSettingControl = (setting: ConversionSetting) => {
    const isDisabled = setting.isPremium && !isPremiumUser;
    switch (setting.type) {
      case 'slider':
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-300">{currentSettings[setting.id]}{setting.unit}</span>
              {setting.isPremium && !isPremiumUser && (
                <Badge className="bg-yellow-400 text-xs ml-2 px-2 py-1 rounded">Premium</Badge>
              )}
            </div>
            <input
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={currentSettings[setting.id]}
              onChange={(e) => handleSettingChange(setting.id, Number(e.target.value))}
              className={`w-full h-2 bg-slate-700 rounded-full appearance-none ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isDisabled}
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{setting.min}{setting.unit}</span>
              <span>{setting.max}{setting.unit}</span>
            </div>
          </div>
        );
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">{setting.name}</span>
            <div className="flex items-center">
              {setting.isPremium && !isPremiumUser && (
                <Badge className="bg-yellow-400 text-xs mr-2 px-2 py-1 rounded">Premium</Badge>
              )}
              <button
                className={`w-10 h-5 rounded-full relative ${currentSettings[setting.id] ? 'bg-primary' : 'bg-slate-700'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => !isDisabled && handleSettingChange(setting.id, !currentSettings[setting.id])}
                disabled={isDisabled}
              >
                <span
                  className={`absolute w-4 h-4 bg-white rounded-full top-0.5 transition-transform ${currentSettings[setting.id] ? 'translate-x-5' : 'translate-x-0.5'}`}
                />
              </button>
            </div>
          </div>
        );
      case 'select':
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-300">{setting.name}</span>
              {setting.isPremium && !isPremiumUser && (
                <Badge className="bg-yellow-400 text-xs ml-2 px-2 py-1 rounded">Premium</Badge>
              )}
            </div>
            <select
              value={currentSettings[setting.id]}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              className={`w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isDisabled}
            >
              {setting.options?.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        );
      case 'number':
        return (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-slate-300">{setting.name}</span>
              {setting.isPremium && !isPremiumUser && (
                <Badge className="bg-yellow-400 text-xs ml-2 px-2 py-1 rounded">Premium</Badge>
              )}
            </div>
            <input
              type="number"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={currentSettings[setting.id]}
              onChange={(e) => handleSettingChange(setting.id, Number(e.target.value))}
              className={`w-full bg-slate-800 border border-slate-700 rounded p-2 text-slate-300 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isDisabled}
              placeholder={`${setting.min} - ${setting.max}`}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card variant="default" className="animate-in fade-in-0 slide-in-from-bottom-5 duration-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="mr-2 text-primary" size={18} />
              <CardTitle>Configuración Avanzada</CardTitle>
            </div>
            <Badge variant="secondary">
              <Badge className="bg-gray-200 text-xs px-2 py-1 rounded">{formatFrom} → {formatTo}</Badge>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {presets.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-slate-300">Usar un preset</label>
                <Button variant="outline" size="sm" onClick={() => setShowSavePreset(!showSavePreset)}>
                  <Save size={14} className="mr-2" />
                  Guardar Preset
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded p-2 text-sm text-slate-300 transition-colors"
                    onClick={() => onSelectPreset(preset.id)}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
              {showSavePreset && (
                <div className="flex items-center space-x-2 mt-2">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Nombre del preset"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-slate-300"
                  />
                  <Button variant="primary" size="sm" onClick={handleSavePreset} disabled={!presetName.trim()}>
                    Guardar
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <button
              className="flex items-center justify-between w-full bg-slate-800/70 p-3 rounded-lg mb-3 border border-slate-700"
              onClick={() => toggleSection('basic')}
            >
              <div className="flex items-center">
                <Sliders size={16} className="text-primary mr-2" />
                <span className="text-white font-medium">Ajustes Básicos</span>
              </div>
              {expandedSections.includes('basic') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedSections.includes('basic') && (
              <div className="space-y-4 p-3">
                {basicSettings.map(setting => (
                  <div key={setting.id} className="bg-slate-800/50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="text-sm font-medium text-white">{setting.name}</h4>
                        <p className="text-xs text-slate-400">{setting.description}</p>
                      </div>
                    </div>
                    {renderSettingControl(setting)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {advancedSettings.length > 0 && (
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full bg-slate-800/70 p-3 rounded-lg mb-3 border border-slate-700"
                onClick={() => toggleSection('advanced')}
              >
                <div className="flex items-center">
                  <Settings size={16} className="text-secondary mr-2" />
                  <span className="text-white font-medium">Ajustes Avanzados</span>
                </div>
                {expandedSections.includes('advanced') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.includes('advanced') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
                  {advancedSettings.map(setting => (
                    <div key={setting.id} className="bg-slate-800/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-white">{setting.name}</h4>
                          <p className="text-xs text-slate-400">{setting.description}</p>
                        </div>
                      </div>
                      {renderSettingControl(setting)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {premiumSettings.length > 0 && (
            <div className="mb-4">
              <button
                className="flex items-center justify-between w-full bg-slate-800/70 p-3 rounded-lg mb-3 border border-slate-700"
                onClick={() => toggleSection('premium')}
              >
                <div className="flex items-center">
                  {isPremiumUser ? (
                    <Unlock size={16} className="text-amber-500 mr-2" />
                  ) : (
                    <Lock size={16} className="text-slate-400 mr-2" />
                  )}
                  <span className="text-white font-medium">Ajustes Premium</span>
                  {!isPremiumUser && <Badge variant="warning" className="ml-2">Requiere Premium</Badge>}
                </div>
                {expandedSections.includes('premium') ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedSections.includes('premium') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3">
                  {!isPremiumUser && (
                    <div className="md:col-span-2 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-lg p-4 mb-2">
                      <div className="flex items-start">
                        <Info size={20} className="text-amber-500 mr-2 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-white">Desbloquea opciones premium</h4>
                          <p className="text-sm text-slate-300 mt-1">Actualiza a una cuenta Premium para acceder a opciones avanzadas.</p>
                          <Button variant="outline" size="sm" className="mt-2 bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-500/30 text-amber-500 hover:bg-amber-500/30">Actualizar a Premium</Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {premiumSettings.map(setting => (
                    <div key={setting.id} className={`bg-slate-800/50 p-3 rounded-lg ${!isPremiumUser ? 'opacity-75' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-white">{setting.name}</h4>
                          <p className="text-xs text-slate-400">{setting.description}</p>
                        </div>
                        {!isPremiumUser && <Badge variant="warning" className="ml-2">Requiere Premium</Badge>}
                      </div>
                      {renderSettingControl(setting)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <Button variant="outline" size="sm" iconLeft={<RefreshCw size={14} />} onClick={handleResetToDefaults}>Restablecer valores</Button>
            <Button variant="primary" size="sm" onClick={() => onChange(currentSettings)}>
              <RotateCw size={14} className="mr-2" />
              Aplicar cambios
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedSettings;
