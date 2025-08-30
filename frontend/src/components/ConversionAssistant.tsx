import React, { useState, useRef, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from './ui';
import { Button } from './ui';
import { MessageCircle, Send, Bot, Sparkles, Trash, Copy, User, ChevronDown, ChevronRight } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface Suggestion {
  id: string;
  text: string;
  action?: () => void;
}

interface ConversionAssistantProps {
  userName?: string;
  onRequestConversion?: (from: string, to: string) => void;
  onRequestFormatInfo?: (format: string) => void;
  className?: string;
  isPremium?: boolean;
}

export const ConversionAssistant: React.FC<ConversionAssistantProps> = ({
  userName = 'Usuario',
  onRequestConversion,
  onRequestFormatInfo,
  className = '',
  isPremium = false,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `¡Hola ${userName}! Soy tu asistente de conversión de Anclora Metaform. Puedo ayudarte a elegir el mejor formato para tus archivos o resolver dudas sobre conversiones. ¿En qué puedo ayudarte hoy?`,
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial suggestions
  const initialSuggestions: Suggestion[] = [
    {
      id: 'suggest-1',
      text: '¿Qué formato es mejor para compartir documentos?',
      action: () => handleSendMessage('¿Qué formato es mejor para compartir documentos?')
    },
    {
      id: 'suggest-2',
      text: '¿Cómo puedo convertir varios archivos a la vez?',
      action: () => handleSendMessage('¿Cómo puedo convertir varios archivos a la vez?')
    },
    {
      id: 'suggest-3',
      text: '¿Cuál es la diferencia entre JPG y PNG?',
      action: () => handleSendMessage('¿Cuál es la diferencia entre JPG y PNG?')
    }
  ];

  // Historical conversations stored by category
  const conversationHistory = [
    {
      category: 'Conversiones Recientes',
      conversations: [
        {
          title: 'Conversión de PDF a Word',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          messages: [
            { id: 'h1-1', text: '¿Cómo puedo convertir un PDF a Word?', isUser: true, timestamp: new Date() },
            { id: 'h1-2', text: 'Para convertir un PDF a Word, sube tu archivo PDF y selecciona DOCX como formato de salida. Esta conversión es ideal para cuando necesitas editar el contenido de un PDF.', isUser: false, timestamp: new Date() }
          ]
        },
        {
          title: 'Problema con archivo SVG',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          messages: [
            { id: 'h2-1', text: 'No puedo abrir un archivo SVG que he convertido', isUser: true, timestamp: new Date() },
            { id: 'h2-2', text: 'Los archivos SVG son gráficos vectoriales que se pueden abrir con navegadores web modernos o programas de diseño como Adobe Illustrator o Inkscape. ¿Qué programa estás usando para intentar abrirlo?', isUser: false, timestamp: new Date() }
          ]
        }
      ]
    },
    {
      category: 'Formatos de Imagen',
      conversations: [
        {
          title: 'Diferencias entre formatos',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          messages: [
            { id: 'h3-1', text: '¿Cuál es mejor para fotografías, JPG o PNG?', isUser: true, timestamp: new Date() },
            { id: 'h3-2', text: 'Para fotografías, JPG suele ser mejor porque ofrece buena calidad con tamaños de archivo más pequeños. PNG es preferible para imágenes con texto, gráficos o transparencias, pero los archivos son más grandes.', isUser: false, timestamp: new Date() }
          ]
        }
      ]
    }
  ];
  
  const [showConversationHistory, setShowConversationHistory] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    setCurrentSuggestions(initialSuggestions);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (text: string = inputText) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: text.trim(),
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    
    // Generate response based on user input
    setTimeout(() => {
      let botResponse = '';
      let newSuggestions: Suggestion[] = [];
      
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('convertir') || lowerText.includes('cambiar formato')) {
        // Extract formats from user message if possible
        const fromFormat = extractFormat(lowerText, 'de') || extractFormat(lowerText, 'desde');
        const toFormat = extractFormat(lowerText, 'a') || extractFormat(lowerText, 'en');
        
        if (fromFormat && toFormat) {
          botResponse = `Puedo ayudarte a convertir archivos de ${fromFormat.toUpperCase()} a ${toFormat.toUpperCase()}. Para comenzar, simplemente sube tu archivo ${fromFormat.toUpperCase()} y selecciona ${toFormat.toUpperCase()} como formato de salida.`;
          
          if (onRequestConversion) {
            newSuggestions.push({
              id: `convert-${Date.now()}`,
              text: `Convertir de ${fromFormat.toUpperCase()} a ${toFormat.toUpperCase()}`,
              action: () => onRequestConversion(fromFormat, toFormat)
            });
          }
        } else {
          botResponse = 'Para convertir un archivo, necesito saber el formato de origen y el formato de destino. ¿Qué tipo de archivo quieres convertir y a qué formato?';
          
          newSuggestions = [
            { id: 'format-1', text: 'PDF a Word', action: () => onRequestConversion ? onRequestConversion('pdf', 'docx') : null },
            { id: 'format-2', text: 'JPG a PNG', action: () => onRequestConversion ? onRequestConversion('jpg', 'png') : null },
            { id: 'format-3', text: 'Word a PDF', action: () => onRequestConversion ? onRequestConversion('docx', 'pdf') : null }
          ];
        }
      } else if (lowerText.includes('diferencia') || lowerText.includes('mejor formato')) {
        // Extract formats to compare
        const formats = extractFormatsToCompare(lowerText);
        
        if (formats.length >= 2) {
          botResponse = generateFormatComparisonResponse(formats);
          
          formats.forEach(format => {
            if (onRequestFormatInfo) {
              newSuggestions.push({
                id: `info-${format}-${Date.now()}`,
                text: `Más sobre ${format.toUpperCase()}`,
                action: () => onRequestFormatInfo(format)
              });
            }
          });
        } else if (lowerText.includes('compartir') || lowerText.includes('enviar')) {
          botResponse = 'Para compartir documentos, el formato PDF es generalmente la mejor opción porque mantiene el formato exacto y puede ser visualizado en prácticamente cualquier dispositivo. Si necesitas que el destinatario pueda editar el documento, considera usar DOCX (Word) o una alternativa como Google Docs con permisos de edición.';
          
          newSuggestions = [
            { id: 'share-1', text: 'Convertir a PDF', action: () => onRequestConversion ? onRequestConversion('', 'pdf') : null },
            { id: 'share-2', text: 'Más sobre PDF', action: () => onRequestFormatInfo ? onRequestFormatInfo('pdf') : null },
            { id: 'share-3', text: 'Comparar PDF y DOCX', action: () => handleSendMessage('¿Cuál es la diferencia entre PDF y DOCX?') }
          ];
        } else if (lowerText.includes('imagen') || lowerText.includes('foto')) {
          botResponse = 'Para imágenes, el mejor formato depende del uso:\n\n• JPG: Ideal para fotografías y imágenes con muchos colores\n• PNG: Mejor para gráficos, capturas de pantalla o imágenes con transparencia\n• SVG: Perfecto para logos e iconos que necesitan escalarse a diferentes tamaños\n• WebP: Formato moderno con buena compresión para web';
          
          newSuggestions = [
            { id: 'img-1', text: 'Más sobre JPG', action: () => onRequestFormatInfo ? onRequestFormatInfo('jpg') : null },
            { id: 'img-2', text: 'Más sobre PNG', action: () => onRequestFormatInfo ? onRequestFormatInfo('png') : null },
            { id: 'img-3', text: 'Convertir una imagen', action: () => handleSendMessage('Quiero convertir una imagen') }
          ];
        } else {
          botResponse = 'La elección del mejor formato depende de tus necesidades específicas. ¿Puedes decirme qué tipo de archivo estás manejando (documento, imagen, audio, etc.) y cómo planeas utilizarlo?';
        }
      } else if (lowerText.includes('varios archivos') || lowerText.includes('múltiples') || lowerText.includes('lote')) {
        botResponse = 'Para convertir varios archivos a la vez, puedes usar nuestra función de conversión por lotes. Simplemente:\n\n1. Selecciona la opción "Conversión por lotes"\n2. Sube múltiples archivos (hasta 20 en la versión gratuita)\n3. Elige el formato de salida para todos\n4. Inicia la conversión\n\nLos archivos se procesarán uno tras otro y podrás descargarlos individualmente o como un archivo ZIP.';
        
        if (!isPremium) {
          botResponse += '\n\nLa versión gratuita permite convertir hasta 20 archivos simultáneamente. Con una cuenta Premium, puedes convertir hasta 100 archivos por lote.';
        }
        
        newSuggestions = [
          { id: 'batch-1', text: 'Ir a conversión por lotes', action: () => window.location.href = '/batch' }
        ];
      } else if (lowerText.includes('calidad') || lowerText.includes('compress')) {
        botResponse = 'La calidad y el tamaño del archivo están directamente relacionados en la mayoría de los formatos. En nuestra herramienta puedes ajustar la calidad de compresión para encontrar el equilibrio perfecto entre tamaño y calidad visual.\n\nPara archivos PDF y documentos, recomendamos una configuración de compresión media que mantiene la legibilidad. Para imágenes, una compresión del 80-90% suele ser un buen equilibrio.';
        
        newSuggestions = [
          { id: 'quality-1', text: 'Configuración avanzada', action: () => handleSendMessage('¿Cómo uso la configuración avanzada?') },
          { id: 'quality-2', text: 'Comprimir un PDF', action: () => onRequestConversion ? onRequestConversion('pdf', 'pdf') : null }
        ];
      } else if (lowerText.includes('hola') || lowerText.includes('ayuda') || lowerText.includes('asistente')) {
        botResponse = `¡Hola! Soy tu asistente de conversión de Anclora Metaform. Puedo ayudarte con:\n\n• Recomendaciones sobre formatos de archivo\n• Información sobre tipos de conversión\n• Soluciones a problemas comunes\n• Consejos para optimizar tus archivos\n\n¿Sobre qué te gustaría saber más?`;
        
        newSuggestions = initialSuggestions;
      } else {
        botResponse = 'Entiendo tu consulta. Para poder ayudarte mejor, ¿podrías darme más detalles sobre el tipo de archivo que estás manejando y qué quieres hacer con él?';
        
        newSuggestions = [
          { id: 'help-1', text: 'Quiero convertir un archivo', action: () => handleSendMessage('¿Cómo convierto un archivo?') },
          { id: 'help-2', text: 'Necesito información sobre formatos', action: () => handleSendMessage('¿Qué formato debería usar?') },
          { id: 'help-3', text: 'Tengo un problema con una conversión', action: () => handleSendMessage('Tengo un problema con una conversión') }
        ];
      }
      
      // Add bot response message
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponse,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setCurrentSuggestions(newSuggestions);
      setShowSuggestions(true);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Show temporary success message
        alert('Mensaje copiado al portapapeles');
      },
      () => {
        alert('No se pudo copiar el mensaje');
      }
    );
  };

  const clearConversation = () => {
    setMessages([{
      id: 'welcome',
      text: `¡Hola ${userName}! Soy tu asistente de conversión de Anclora Metaform. ¿En qué puedo ayudarte hoy?`,
      isUser: false,
      timestamp: new Date(),
    }]);
    setCurrentSuggestions(initialSuggestions);
    setShowSuggestions(true);
  };

  const loadHistoricalConversation = (messages: Message[]) => {
    setMessages(messages);
    setShowConversationHistory(false);
    setCurrentSuggestions(initialSuggestions);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  // Helper functions
  const extractFormat = (text: string, prefix: string): string | null => {
    const regex = new RegExp(`${prefix} ([a-zA-Z0-9]+)`, 'i');
    const match = text.match(regex);
    return match ? match[1].toLowerCase() : null;
  };

  const extractFormatsToCompare = (text: string): string[] => {
    const formats = ['pdf', 'docx', 'jpg', 'png', 'svg', 'gif', 'mp3', 'mp4', 'webp', 'epub'];
    return formats.filter(format => text.toLowerCase().includes(format.toLowerCase()));
  };

  const generateFormatComparisonResponse = (formats: string[]): string => {
    if (formats.includes('jpg') && formats.includes('png')) {
      return 'La principal diferencia entre JPG y PNG es que:\n\n• JPG utiliza compresión con pérdida, lo que resulta en archivos más pequeños pero con cierta pérdida de calidad, ideal para fotografías.\n\n• PNG usa compresión sin pérdida, preservando la calidad exacta de la imagen y admitiendo transparencia, mejor para gráficos, capturas de pantalla y imágenes con texto.\n\nSi el tamaño del archivo es importante, usa JPG para fotos. Si necesitas máxima calidad o transparencia, usa PNG.';
    }
    
    if (formats.includes('pdf') && formats.includes('docx')) {
      return 'Las principales diferencias entre PDF y DOCX son:\n\n• PDF está diseñado para mantener un formato exacto en cualquier dispositivo o programa. Es ideal para documentos finales que no necesitan edición y para compartir.\n\n• DOCX (Word) está diseñado para la edición fácil de documentos. Ofrece todas las herramientas de edición pero puede verse diferente según el software y dispositivo usado.\n\nUsa PDF para documentos finales y distribución, y DOCX para documentos en desarrollo que requieren edición.';
    }
    
    // Generic comparison for other format combinations
    return `Comparando ${formats.map(f => f.toUpperCase()).join(' y ')}:\n\n` + 
           `Cada uno de estos formatos tiene diferentes casos de uso. Si me indicas para qué necesitas usar el archivo (edición, compartir, almacenamiento, etc.), puedo darte una recomendación más específica.`;
  };

  return (
    <div className={`${className}`}>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-col space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bot className="mr-2 text-primary" />
              <CardTitle>Asistente de Conversión</CardTitle>
            </div>
            <div className="flex">
              <Button
                className="bg-transparent text-sm px-2 py-1"
                onClick={() => setShowConversationHistory(!showConversationHistory)}
                title="Ver historial"
              >
                <MessageCircle size={18} />
              </Button>
              <Button
                className="bg-transparent text-sm px-2 py-1"
                onClick={clearConversation}
                title="Nueva conversación"
              >
                <Trash size={18} />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Conversation History Sidebar */}
          {showConversationHistory && (
            <div className="border-r border-slate-700 w-64 h-full overflow-y-auto p-3 bg-slate-900">
              <h3 className="text-sm font-medium text-slate-300 mb-2">Historial de Conversaciones</h3>
              
              {conversationHistory.map((category) => (
                <div key={category.category} className="mb-2">
                  <button 
                    className="flex items-center justify-between w-full text-left p-2 hover:bg-slate-800 rounded"
                    onClick={() => toggleCategory(category.category)}
                  >
                    <span className="text-xs font-medium text-slate-400">{category.category}</span>
                    {expandedCategories.includes(category.category) ? 
                      <ChevronDown size={14} className="text-slate-500" /> : 
                      <ChevronRight size={14} className="text-slate-500" />
                    }
                  </button>
                  
                  {expandedCategories.includes(category.category) && (
                    <div className="ml-2 space-y-1 mt-1">
                      {category.conversations.map((convo, index) => (
                        <button
                          key={index}
                          className="w-full text-left p-2 text-xs hover:bg-slate-800 rounded flex items-center"
                          onClick={() => loadHistoricalConversation(convo.messages)}
                        >
                          <div className="flex-1 truncate">
                            <div className="font-medium text-slate-300 truncate">{convo.title}</div>
                            <div className="text-slate-500 text-xs">
                              {convo.timestamp.toLocaleDateString()}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-primary/20 text-white'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center mb-1">
                      <div className="flex items-center">
                        {message.isUser ? (
                          <User size={14} className="text-slate-400 mr-1" />
                        ) : (
                          <Bot size={14} className="text-primary mr-1" />
                        )}
                        <span className="text-xs font-medium">
                          {message.isUser ? userName : 'Asistente'}
                        </span>
                      </div>
                      
                      {!message.isUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 ml-2"
                          onClick={() => handleCopyMessage(message.text)}
                        >
                          <Copy size={12} />
                        </Button>
                      )}
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.text}
                    </div>
                    
                    <div className="text-right text-xs text-slate-500 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-white rounded-lg p-4 max-w-[80%]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Suggestions */}
              {!isTyping && showSuggestions && currentSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentSuggestions.map((suggestion) => (
                    <Button
                      key={suggestion.id}
                      variant="outline"
                      size="sm"
                      onClick={suggestion.action}
                      className="text-xs"
                    >
                      {suggestion.text}
                    </Button>
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            
            {/* Premium badge for more features */}
            {!isPremium && (
              <div className="px-4 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/5 border-t border-amber-500/20">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-xs text-amber-400">
                    Desbloquea respuestas avanzadas y análisis de archivos con 
                    <Button 
                      className="h-auto p-0 text-xs text-amber-400 underline"
                      onClick={() => {}}
                    >
                      Premium
                    </Button>
                  </span>
                </div>
              </div>
            )}
            
            {/* Input area */}
            <div className="p-4 border-t border-slate-700">
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-l-md px-3 py-2 focus:outline-none focus:border-primary"
                  disabled={isTyping}
                />
                <Button
                  variant={inputText.trim() ? 'primary' : 'ghost'}
                  className="rounded-l-none"
                  onClick={() => handleSendMessage()}
                  disabled={isTyping || !inputText.trim()}
                >
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversionAssistant;
