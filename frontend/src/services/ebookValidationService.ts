export const EbookValidationService = {
  getInstance() {
    return {
      validateEbook: async (_file: File) => {
        // Minimal mock validation
        return { valid: true, errors: [] };
      }
    };
  }
};
