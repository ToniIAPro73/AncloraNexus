export const EbookValidationService = {
  getInstance() {
    return {
      validateEbook: async () => ({ isValid: true, quality: 'good', issues: [], metadata: {} })
    };
  }
};
