export const EbookConversionService = {
  getInstance() {
    return {
      validateFile: async () => ({ success: true, data: null }),
      startConversion: async () => ({ success: true, data: null })
    };
  }
};
