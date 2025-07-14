/**
 * Mock del Motor Profesional para Tests
 * Simula el comportamiento del motor real para validar workflows
 */

function findProfessionalConversionRoutes(sourceExt, targetExt, fileSize) {
  // Validar entrada
  if (!sourceExt || !targetExt || sourceExt === targetExt) {
    return {
      success: false,
      error: 'Formatos inválidos o iguales',
      recommendation: 'Seleccione formatos diferentes'
    };
  }

  // Definir workflows profesionales
  const professionalWorkflows = {
    // Audio Mastering
    audio_mastering: {
      triggers: [
        { source: 'wav', target: 'mp3', minSize: 50 * 1024 * 1024 },
        { source: 'wav', target: 'aac', minSize: 50 * 1024 * 1024 },
        { source: 'flac', target: 'mp3', minSize: 30 * 1024 * 1024 },
        { source: 'flac', target: 'aac', minSize: 30 * 1024 * 1024 },
        { source: 'wav', target: 'flac', minSize: 40 * 1024 * 1024 }
      ],
      baseQuality: 95,
      steps: 3,
      estimatedTime: 5
    },

    // Video Post-Production
    video_postproduction: {
      triggers: [
        { source: 'mov', target: 'mp4', minSize: 100 * 1024 * 1024 },
        { source: 'mov', target: 'avi', minSize: 100 * 1024 * 1024 },
        { source: 'avi', target: 'mp4', minSize: 100 * 1024 * 1024 },
        { source: 'avi', target: 'webm', minSize: 100 * 1024 * 1024 }
      ],
      baseQuality: 95,
      steps: 3,
      estimatedTime: 5
    },

    // Image Professional
    image_professional: {
      triggers: [
        { source: 'tiff', target: 'jpg', minSize: 0 },
        { source: 'tiff', target: 'png', minSize: 0 },
        { source: 'png', target: 'webp', minSize: 10 * 1024 * 1024 }
      ],
      baseQuality: 95,
      steps: 2,
      estimatedTime: 3
    },

    // Document Publishing
    document_publishing: {
      triggers: [
        { source: 'docx', target: 'webp', minSize: 0 },
        { source: 'html', target: 'png', minSize: 0 },
        { source: 'pdf', target: 'jpg', minSize: 0 }
      ],
      baseQuality: 85,
      steps: 4,
      estimatedTime: 8
    }
  };

  // Buscar workflow profesional aplicable
  for (const [workflowName, workflow] of Object.entries(professionalWorkflows)) {
    const trigger = workflow.triggers.find(t => 
      t.source === sourceExt && 
      t.target === targetExt && 
      fileSize >= t.minSize
    );

    if (trigger) {
      const quality = Math.max(60, workflow.baseQuality - (workflow.steps - 1) * 8);
      
      return {
        success: true,
        primaryPath: {
          path: [sourceExt, ...Array(workflow.steps - 2).fill('intermediate'), targetExt],
          steps: workflow.steps,
          estimatedQuality: quality,
          estimatedTime: workflow.estimatedTime,
          workflow: workflowName,
          isProfessional: true
        },
        alternativePaths: []
      };
    }
  }

  // Conversiones estándar (no profesionales)
  const standardConversions = {
    // Audio estándar
    'mp3_aac': { steps: 1, quality: 90, time: 3 },
    'wav_mp3': { steps: 1, quality: 90, time: 3 },
    'flac_mp3': { steps: 1, quality: 90, time: 3 },
    
    // Video estándar
    'mp4_webm': { steps: 1, quality: 90, time: 3 },
    'avi_mp4': { steps: 1, quality: 90, time: 3 },
    
    // Imagen estándar
    'jpg_png': { steps: 1, quality: 90, time: 3 },
    'png_jpg': { steps: 1, quality: 90, time: 3 },
    'jpg_webp': { steps: 1, quality: 90, time: 3 },
    
    // Documento estándar
    'docx_pdf': { steps: 1, quality: 90, time: 3 },
    'html_pdf': { steps: 1, quality: 90, time: 3 },
    'md_html': { steps: 1, quality: 90, time: 3 }
  };

  const conversionKey = `${sourceExt}_${targetExt}`;
  const standardConversion = standardConversions[conversionKey];

  if (standardConversion) {
    return {
      success: true,
      primaryPath: {
        path: [sourceExt, targetExt],
        steps: standardConversion.steps,
        estimatedQuality: standardConversion.quality,
        estimatedTime: standardConversion.time,
        workflow: 'standard',
        isProfessional: false
      },
      alternativePaths: []
    };
  }

  // Conversiones multi-paso complejas
  const multiStepRoutes = {
    'txt_jpg': { path: ['txt', 'pdf', 'jpg'], steps: 2, quality: 82, time: 5 },
    'docx_webp': { path: ['docx', 'pdf', 'png', 'webp'], steps: 3, quality: 74, time: 8 },
    'html_png': { path: ['html', 'pdf', 'png'], steps: 2, quality: 82, time: 5 },
    'md_jpg': { path: ['md', 'html', 'pdf', 'jpg'], steps: 3, quality: 74, time: 8 }
  };

  const multiStepRoute = multiStepRoutes[conversionKey];
  if (multiStepRoute) {
    return {
      success: true,
      primaryPath: {
        path: multiStepRoute.path,
        steps: multiStepRoute.steps,
        estimatedQuality: multiStepRoute.quality,
        estimatedTime: multiStepRoute.time,
        workflow: 'multi_step',
        isProfessional: false
      },
      alternativePaths: []
    };
  }

  // Conversiones imposibles
  const impossibleConversions = [
    'mp3_png', 'wav_jpg', 'jpg_mp3', 'png_wav',
    'mp4_txt', 'avi_md', 'txt_mp4', 'html_wav'
  ];

  if (impossibleConversions.includes(conversionKey)) {
    return {
      success: false,
      error: 'Conversión no lógica entre categorías incompatibles',
      recommendation: 'Seleccione formatos compatibles o use conversor especializado'
    };
  }

  // Fallback: conversión no soportada
  return {
    success: false,
    error: 'Conversión no soportada en el sistema actual',
    recommendation: 'Verifique que ambos formatos estén soportados'
  };
}

module.exports = {
  findProfessionalConversionRoutes
};

