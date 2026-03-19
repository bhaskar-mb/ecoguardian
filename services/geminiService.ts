import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult, IncidentType, Severity } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeEnvironmentalImage = async (base64Image: string): Promise<AIAnalysisResult> => {
  const model = 'gemini-3-flash-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
          },
        },
        {
          text: `Analyze this image for environmental or wildlife concerns. 
          Identify if it shows land damage, illegal tree cutting, injured animals, or road accidents. 
          Assess the severity and provide a short explanation and recommended immediate action.`,
        },
      ],
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          detectedType: {
            type: Type.STRING,
            description: "Category of the incident",
          },
          severity: {
            type: Type.STRING,
            description: "Severity level",
          },
          explanation: {
            type: Type.STRING,
            description: "Concise description",
          },
          recommendedAction: {
            type: Type.STRING,
            description: "Recommendation",
          },
        },
        required: ["detectedType", "severity", "explanation", "recommendedAction"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Could not interpret AI analysis.");
  try {
    return JSON.parse(text) as AIAnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON from AI response:", text);
    throw new Error("Invalid AI response format.");
  }
};

export const generateCommunityUpdate = async (recentReports: any[]) => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Write a short, inspiring 2-sentence summary for a community dashboard based on these environmental incidents: ${JSON.stringify(recentReports)}`
  });
  return response.text || "The grid is stable. Vigilance continues.";
};