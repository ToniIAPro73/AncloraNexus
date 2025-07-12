import { GoogleGenerativeAI } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY;

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

async function generateText(prompt: string, modelName = 'gemini-pro'): Promise<string> {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not defined');
  }
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export const geminiService = {
  generateText,
};

export default geminiService;
