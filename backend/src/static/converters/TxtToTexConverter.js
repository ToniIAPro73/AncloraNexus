/**
 * Conversor TXT → TEX (LaTeX)
 * Especializado para documentos académicos y científicos
 * 
 * Características:
 * - Estructura de documento académico estándar
 * - Detección automática de títulos y secciones
 * - Conversión de listas y enumeraciones
 * - Manejo de referencias y citas
 * - Escape correcto de caracteres especiales LaTeX
 * - Soporte para ecuaciones matemáticas básicas
 * - Metadatos académicos (autor, título, fecha)
 */

class TxtToTexConverter {
    constructor() {
        this.name = 'TXT to TEX Converter';
        this.version = '1.0.0';
        this.description = 'Convierte archivos de texto a formato LaTeX para documentos académicos';
        
        // Caracteres especiales que necesitan escape en LaTeX
        this.specialChars = {
            '\\': '\\textbackslash{}',
            '{': '\\{',
            '}': '\\}',
            '$': '\\$',
            '&': '\\&',
            '%': '\\%',
            '#': '\\#',
            '^': '\\textasciicircum{}',
            '_': '\\_',
            '~': '\\textasciitilde{}',
            '|': '\\textbar{}',
            '<': '\\textless{}',
            '>': '\\textgreater{}'
        };
        
        // Patrones para detección de elementos
        this.patterns = {
            title: /^[A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]{3,}$/,
            section: /^[A-Z][A-Za-z\s]{5,}:?\s*$/,
            subsection: /^[A-Z][a-z][A-Za-z\s]{3,}:?\s*$/,
            bulletList: /^[\s]*[-•*]\s+(.+)$/,
            numberedList: /^[\s]*\d+[\.\)]\s+(.+)$/,
            indentedText: /^[\s]{2,}(.+)$/,
            equation: /^[\s]*[a-zA-Z]\s*=\s*[^=]+$/,
            citation: /\[([^\]]+)\]/g,
            emphasis: /\*([^*]+)\*/g,
            strong: /\*\*([^*]+)\*\*/g
        };
    }

    /**
     * Escapa caracteres especiales de LaTeX
     */
    escapeLatex(text) {
        let escaped = text;
        
        // Primero manejar backslashes
        escaped = escaped.replace(/\\/g, this.specialChars['\\']);
        
        // Luego otros caracteres especiales
        for (const [char, replacement] of Object.entries(this.specialChars)) {
            if (char !== '\\') {
                escaped = escaped.replace(new RegExp('\\' + char, 'g'), replacement);
            }
        }
        
        return escaped;
    }

    /**
     * Detecta el tipo de línea
     */
    detectLineType(line, lineIndex, lines) {
        const trimmed = line.trim();
        
        if (!trimmed) return 'empty';
        
        // Título principal (primera línea no vacía en mayúsculas)
        if (lineIndex < 3 && this.patterns.title.test(trimmed)) {
            return 'title';
        }
        
        // Secciones (líneas en mayúsculas o con formato de sección)
        if (this.patterns.section.test(trimmed)) {
            return 'section';
        }
        
        // Subsecciones
        if (this.patterns.subsection.test(trimmed)) {
            return 'subsection';
        }
        
        // Listas con viñetas
        if (this.patterns.bulletList.test(trimmed)) {
            return 'bulletList';
        }
        
        // Listas numeradas
        if (this.patterns.numberedList.test(trimmed)) {
            return 'numberedList';
        }
        
        // Texto indentado (citas o código)
        if (this.patterns.indentedText.test(line)) {
            return 'indented';
        }
        
        // Ecuaciones simples
        if (this.patterns.equation.test(trimmed)) {
            return 'equation';
        }
        
        return 'paragraph';
    }

    /**
     * Procesa texto con formato inline
     */
    processInlineFormatting(text) {
        let processed = text;
        
        // Texto en negrita (**texto**)
        processed = processed.replace(this.patterns.strong, '\\textbf{$1}');
        
        // Texto en cursiva (*texto*)
        processed = processed.replace(this.patterns.emphasis, '\\textit{$1}');
        
        // Citas [referencia]
        processed = processed.replace(this.patterns.citation, '\\cite{$1}');
        
        return processed;
    }

    /**
     * Genera el preámbulo LaTeX
     */
    generatePreamble(options = {}) {
        const {
            documentClass = 'article',
            fontSize = '12pt',
            paperSize = 'a4paper',
            title = 'Documento',
            author = 'Autor',
            date = '\\today',
            language = 'spanish',
            encoding = 'utf8'
        } = options;

        return `\\documentclass[${fontSize},${paperSize}]{${documentClass}}

% Paquetes esenciales
\\usepackage[${encoding}]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[${language}]{babel}
\\usepackage{amsmath}
\\usepackage{amsfonts}
\\usepackage{amssymb}
\\usepackage{graphicx}
\\usepackage{cite}
\\usepackage{url}
\\usepackage{hyperref}
\\usepackage{geometry}
\\usepackage{setspace}

% Configuración de página
\\geometry{margin=2.5cm}
\\onehalfspacing

% Metadatos del documento
\\title{${this.escapeLatex(title)}}
\\author{${this.escapeLatex(author)}}
\\date{${date}}

% Configuración de hyperref
\\hypersetup{
    colorlinks=true,
    linkcolor=blue,
    filecolor=magenta,      
    urlcolor=cyan,
    citecolor=red
}

\\begin{document}

\\maketitle
\\tableofcontents
\\newpage

`;
    }

    /**
     * Genera el final del documento
     */
    generateEnding() {
        return `
\\end{document}`;
    }

    /**
     * Convierte el contenido principal
     */
    convertContent(text) {
        const lines = text.split('\n');
        let latex = '';
        let inList = false;
        let listType = '';
        let inQuote = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const lineType = this.detectLineType(line, i, lines);
            const trimmed = line.trim();
            
            // Cerrar listas si es necesario
            if (inList && !['bulletList', 'numberedList'].includes(lineType)) {
                latex += listType === 'bullet' ? '\\end{itemize}\n\n' : '\\end{enumerate}\n\n';
                inList = false;
                listType = '';
            }
            
            // Cerrar citas si es necesario
            if (inQuote && lineType !== 'indented') {
                latex += '\\end{quote}\n\n';
                inQuote = false;
            }
            
            switch (lineType) {
                case 'empty':
                    if (!inList && !inQuote) {
                        latex += '\n';
                    }
                    break;
                    
                case 'title':
                    // El título ya se maneja en el preámbulo, pero podemos agregar una sección
                    break;
                    
                case 'section':
                    latex += `\\section{${this.escapeLatex(trimmed.replace(/:$/, ''))}}\n\n`;
                    break;
                    
                case 'subsection':
                    latex += `\\subsection{${this.escapeLatex(trimmed.replace(/:$/, ''))}}\n\n`;
                    break;
                    
                case 'bulletList':
                    const bulletMatch = trimmed.match(this.patterns.bulletList);
                    if (bulletMatch) {
                        if (!inList || listType !== 'bullet') {
                            if (inList) latex += listType === 'bullet' ? '\\end{itemize}\n' : '\\end{enumerate}\n';
                            latex += '\\begin{itemize}\n';
                            inList = true;
                            listType = 'bullet';
                        }
                        const itemText = this.processInlineFormatting(this.escapeLatex(bulletMatch[1]));
                        latex += `\\item ${itemText}\n`;
                    }
                    break;
                    
                case 'numberedList':
                    const numberedMatch = trimmed.match(this.patterns.numberedList);
                    if (numberedMatch) {
                        if (!inList || listType !== 'numbered') {
                            if (inList) latex += listType === 'bullet' ? '\\end{itemize}\n' : '\\end{enumerate}\n';
                            latex += '\\begin{enumerate}\n';
                            inList = true;
                            listType = 'numbered';
                        }
                        const itemText = this.processInlineFormatting(this.escapeLatex(numberedMatch[1]));
                        latex += `\\item ${itemText}\n`;
                    }
                    break;
                    
                case 'indented':
                    const indentedMatch = line.match(this.patterns.indentedText);
                    if (indentedMatch) {
                        if (!inQuote) {
                            latex += '\\begin{quote}\n';
                            inQuote = true;
                        }
                        const quotedText = this.processInlineFormatting(this.escapeLatex(indentedMatch[1]));
                        latex += `${quotedText}\n`;
                    }
                    break;
                    
                case 'equation':
                    latex += `\\begin{equation}\n${this.escapeLatex(trimmed)}\n\\end{equation}\n\n`;
                    break;
                    
                case 'paragraph':
                    if (trimmed) {
                        const processedText = this.processInlineFormatting(this.escapeLatex(trimmed));
                        latex += `${processedText}\n\n`;
                    }
                    break;
            }
        }
        
        // Cerrar elementos abiertos
        if (inList) {
            latex += listType === 'bullet' ? '\\end{itemize}\n\n' : '\\end{enumerate}\n\n';
        }
        if (inQuote) {
            latex += '\\end{quote}\n\n';
        }
        
        return latex;
    }

    /**
     * Función principal de conversión
     */
    convert(text, options = {}) {
        try {
            if (!text || typeof text !== 'string') {
                return {
                    success: false,
                    error: 'Texto de entrada inválido'
                };
            }

            // Extraer título del texto si no se proporciona
            const lines = text.split('\n').filter(line => line.trim());
            const firstLine = lines[0] || 'Documento';
            
            const defaultOptions = {
                title: firstLine.length > 50 ? 'Documento Académico' : firstLine,
                author: 'Autor',
                documentClass: 'article',
                fontSize: '12pt',
                paperSize: 'a4paper',
                language: 'spanish'
            };

            const finalOptions = { ...defaultOptions, ...options };

            // Generar documento LaTeX completo
            let latexContent = '';
            
            // Preámbulo
            latexContent += this.generatePreamble(finalOptions);
            
            // Contenido principal
            latexContent += this.convertContent(text);
            
            // Final del documento
            latexContent += this.generateEnding();

            return {
                success: true,
                content: latexContent,
                metadata: {
                    title: finalOptions.title,
                    author: finalOptions.author,
                    documentClass: finalOptions.documentClass,
                    language: finalOptions.language,
                    generatedAt: new Date().toISOString(),
                    converter: this.name,
                    version: this.version
                }
            };

        } catch (error) {
            return {
                success: false,
                error: `Error en conversión LaTeX: ${error.message}`
            };
        }
    }

    /**
     * Valida si el contenido LaTeX generado es válido
     */
    validateLatex(latexContent) {
        const requiredElements = [
            '\\documentclass',
            '\\begin{document}',
            '\\end{document}'
        ];

        for (const element of requiredElements) {
            if (!latexContent.includes(element)) {
                return {
                    valid: false,
                    error: `Elemento requerido faltante: ${element}`
                };
            }
        }

        // Verificar balance de entornos
        const environments = ['itemize', 'enumerate', 'quote', 'equation'];
        for (const env of environments) {
            const beginCount = (latexContent.match(new RegExp(`\\\\begin\\{${env}\\}`, 'g')) || []).length;
            const endCount = (latexContent.match(new RegExp(`\\\\end\\{${env}\\}`, 'g')) || []).length;
            
            if (beginCount !== endCount) {
                return {
                    valid: false,
                    error: `Entorno ${env} no balanceado: ${beginCount} begin, ${endCount} end`
                };
            }
        }

        return { valid: true };
    }

    /**
     * Obtiene información sobre el conversor
     */
    getInfo() {
        return {
            name: this.name,
            version: this.version,
            description: this.description,
            inputFormat: 'TXT',
            outputFormat: 'TEX',
            features: [
                'Estructura de documento académico',
                'Detección automática de secciones',
                'Conversión de listas y enumeraciones',
                'Manejo de citas y referencias',
                'Escape de caracteres especiales',
                'Soporte para ecuaciones básicas',
                'Metadatos académicos completos',
                'Validación de LaTeX generado'
            ],
            supportedElements: [
                'Títulos y secciones',
                'Párrafos normales',
                'Listas con viñetas',
                'Listas numeradas',
                'Texto indentado (citas)',
                'Ecuaciones simples',
                'Formato inline (negrita, cursiva)',
                'Referencias y citas'
            ]
        };
    }
}

// Exportar para uso en Node.js y navegador
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TxtToTexConverter;
} else if (typeof window !== 'undefined') {
    window.TxtToTexConverter = TxtToTexConverter;
}

