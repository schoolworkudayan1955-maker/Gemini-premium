
import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { GeminiModel } from "../types";

// Always use process.env.API_KEY directly for initialization as per guidelines
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to decode base64 string to Uint8Array as per guidelines
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode raw PCM audio data as per guidelines
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const streamChat = async (
  model: string,
  history: { role: string; parts: any[] }[],
  onChunk: (text: string) => void,
  options: { 
    systemInstruction?: string; 
    useSearch?: boolean; 
    thinkingBudget?: number;
  } = {}
) => {
  const ai = getAI();
  const config: any = {
    systemInstruction: options.systemInstruction || "You are Arlo AI, a high-performance assistant. You are exceptionally fast, concise, and smart.",
    temperature: 1,
  };

  if (options.useSearch) {
    config.tools = [{ googleSearch: {} }];
  }

  // Ensure thinkingConfig is only set for Gemini 3 and 2.5 series
  if (options.thinkingBudget !== undefined && (model.includes('gemini-3') || model.includes('gemini-2.5'))) {
    config.thinkingConfig = { thinkingBudget: options.thinkingBudget };
  }

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: history,
      config: config,
    });

    let fullText = "";
    let groundingMetadata: any = null;

    for await (const chunk of responseStream) {
      const text = chunk.text || "";
      fullText += text;
      onChunk(text);
      
      if (chunk.candidates?.[0]?.groundingMetadata) {
        groundingMetadata = chunk.candidates[0].groundingMetadata;
      }
    }

    return { 
      fullText, 
      groundingUrls: groundingMetadata?.groundingChunks?.map((c: any) => ({
        uri: c.web?.uri || '',
        title: c.web?.title || 'Search Source'
      })).filter((u: any) => u.uri) || [] 
    };
  } catch (error) {
    console.error("Arlo AI stream error:", error);
    throw error;
  }
};

export const generateImage = async (
  prompt: string, 
  config: { 
    aspectRatio?: "1:1" | "3:4" | "4:3" | "9:16" | "16:9", 
    isPro?: boolean 
  } = {}
) => {
  // Always default to IMAGE (flash) for "Faster" generation unless pro is strictly required
  const model = config.isPro ? GeminiModel.IMAGE_PRO : GeminiModel.IMAGE;
  
  if (config.isPro && (window as any).aistudio) {
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio || "1:1",
          ...(config.isPro ? { imageSize: "1K" } : {})
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      const candidate = response.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') {
        throw new Error("Content blocked by safety filters. Please refine your prompt.");
      }
      throw new Error("No candidates returned from Image model");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found. Try simplifying the prompt.");
  } catch (error: any) {
    console.error("Image generation error:", error);
    if (error.message?.includes("Requested entity was not found.")) {
      if ((window as any).aistudio) await (window as any).aistudio.openSelectKey();
    }
    throw error;
  }
};

export const textToSpeech = async (text: string): Promise<string> => {
    const ai = getAI();
    try {
      const response = await ai.models.generateContent({
        model: GeminiModel.TTS,
        contents: [{ parts: [{ text: `Say naturally: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });
      
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) throw new Error("No audio returned");
      return base64Audio;
    } catch (error) {
      console.error("TTS error:", error);
      throw error;
    }
};

export const generateVideo = async (prompt: string, onStatus: (msg: string) => void): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    const statusMessages = [
      'Initiating...',
      'Synthesizing...',
      'Optimizing...',
      'Finalizing...',
      'Wrapping up...'
    ];

    let i = 0;
    while (!operation.done) {
      onStatus(statusMessages[i % statusMessages.length]);
      i++;
      await new Promise(resolve => setTimeout(resolve, 8000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed");

    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
};
