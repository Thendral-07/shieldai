
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from '../constants';
import { AnalysisResult, WebSource } from '../types';

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to extract JSON from potentially messy model output
function cleanAndParseJSON(text: string): AnalysisResult {
  try {
    // 1. Try direct parse
    return JSON.parse(text);
  } catch (e) {
    // 2. Try extracting from markdown code blocks
    const match = text.match(/```json([\s\S]*?)```/);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    }
    // 3. Try finding first { and last }
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      return JSON.parse(text.substring(start, end + 1));
    }
    throw new Error("Could not parse JSON from AI response");
  }
}

// Optimization: Resize image to reduce token count and latency
// Resizing to max 1024px is usually sufficient for OCR and vastly faster
const optimizeImage = (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let { width, height } = img;
      
      // Calculate new dimensions if larger than maxWidth
      if (width > maxWidth || height > maxWidth) {
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with reduced quality
          resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
          // Fallback if context fails
          resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str); // Fallback on error
  });
};

export const analyzeContent = async (
  text: string | null,
  imageBase64: string | null,
  audioBase64: string | null,
  targetLanguage: string = 'English'
): Promise<AnalysisResult> => {
  
  try {
    const parts: any[] = [];

    // Inject language instruction into the prompt
    parts.push({ text: `TARGET LANGUAGE FOR RESPONSE: ${targetLanguage}. ` });

    if (text) {
      parts.push({ text: `Analyze this text: "${text}"` });
    }

    if (imageBase64) {
      // 1. Optimize Image (Resize & Compress)
      const optimizedBase64 = await optimizeImage(imageBase64);
      const cleanBase64 = optimizedBase64.split(',')[1] || optimizedBase64;
      
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
      
      // 2. Focused Prompt for Speed
      // Direct instruction to focus on OCR immediately to save processing time
      parts.push({ text: "Perform rapid OCR extraction. Identify visible text, logos, and scam indicators. Be concise and focus on the risk assessment." });
    }

    if (audioBase64) {
       const cleanAudioBase64 = audioBase64.split(',')[1] || audioBase64;
       parts.push({
         inlineData: {
            mimeType: 'audio/mp3',
            data: cleanAudioBase64
         }
       });
    }

    if (parts.length === 1) { // Only language instruction
      throw new Error("No input provided");
    }

    // Using gemini-3-pro-preview as requested, but optimization above reduces latency
    const modelName = 'gemini-3-pro-preview';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3, // Lower temperature for more consistent JSON
        tools: [{ googleSearch: {} }] 
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    const result = cleanAndParseJSON(responseText);

    // Extract grounding metadata (Web Sources)
    const webSources: WebSource[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          webSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri
          });
        }
      });
    }

    // Merge web sources into result
    return {
      ...result,
      web_sources: webSources
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
