
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants.ts';
import { AnalysisResult, WebSource } from '../types.ts';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

function cleanAndParseJSON(text: string): AnalysisResult {
  try {
    return JSON.parse(text);
  } catch (e) {
    const match = text.match(/```json([\s\S]*?)```/);
    if (match && match[1]) return JSON.parse(match[1]);
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) return JSON.parse(text.substring(start, end + 1));
    throw new Error("Could not parse JSON from AI response");
  }
}

export const analyzeContent = async (
  text: string | null,
  imageBase64: string | null,
  audioBase64: string | null,
  targetLanguage: string = 'English'
): Promise<AnalysisResult> => {
  try {
    const parts: any[] = [{ text: `TARGET LANGUAGE: ${targetLanguage}. ` }];
    if (text) parts.push({ text: `FORENSIC TARGET (TEXT): "${text}"` });
    if (imageBase64) parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] } }, { text: "Analyze image for fraudulent visual patterns." });
    if (audioBase64) parts.push({ inlineData: { mimeType: 'audio/mp3', data: audioBase64.split(',')[1] } }, { text: "Analyze audio for AI synthetic patterns." });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.1, tools: [{ googleSearch: {} }] }
    });

    const result = cleanAndParseJSON(response.text || '');
    const webSources: WebSource[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri) webSources.push({ title: chunk.web.title || 'Source', uri: chunk.web.uri });
      });
    }
    return { ...result, web_sources: webSources, confidence_score: result.confidence_score || 96 };
  } catch (error) {
    console.error("Analysis Failed:", error);
    throw error;
  }
};
