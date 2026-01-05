
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

const optimizeImage = (base64Str: string, maxWidth = 1024, quality = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let { width, height } = img;
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
          resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
          resolve(base64Str);
      }
    };
    img.onerror = () => resolve(base64Str);
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
    parts.push({ text: `TARGET LANGUAGE FOR RESPONSE: ${targetLanguage}. ` });

    if (text) {
      parts.push({ text: `FORENSIC TARGET (TEXT): "${text}"` });
    }

    if (imageBase64) {
      const optimizedBase64 = await optimizeImage(imageBase64);
      const cleanBase64 = optimizedBase64.split(',')[1] || optimizedBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: cleanBase64
        }
      });
      parts.push({ text: "FORENSIC TARGET (IMAGE): Analyze for fraudulent visual patterns, logo spoofing, and metadata anomalies. Extract and check all visible text/URLs." });
    }

    if (audioBase64) {
       const cleanAudioBase64 = audioBase64.split(',')[1] || audioBase64;
       parts.push({
         inlineData: {
            mimeType: 'audio/mp3',
            data: cleanAudioBase64
         }
       });
       parts.push({ text: "FORENSIC TARGET (AUDIO): Perform biometric analysis on voice. Look for AI-synthetic artifacts, jitter, and psychological manipulation scripts." });
    }

    if (parts.length === 1) {
      throw new Error("No input provided");
    }

    // Using Gemini 3 Pro as it is the most capable model for complex reasoning and scam detection.
    const modelName = 'gemini-3-pro-preview';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts: parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.25, // Lower temperature for more consistent and focused reasoning
        tools: [{ googleSearch: {} }] 
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response from AI");
    }

    const result = cleanAndParseJSON(responseText);

    // Extract grounding metadata for transparency
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

    return {
      ...result,
      web_sources: webSources,
      confidence_score: result.confidence_score || 96
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
