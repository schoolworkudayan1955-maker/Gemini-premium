
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
    systemInstruction: options.systemInstruction || "You are Gemini, a helpful and premium AI assistant optimized for speed.",
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
      // Use .text property instead of text() method to extract generated content
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
    console.error("Gemini stream error:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: GeminiModel.IMAGE,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        }
      }
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No candidates returned from Image model");
    }

    // Iterate through parts to find the image part
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response parts");
  } catch (error) {
    console.error("Image generation error:", error);
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

// Implement generateVideo as required by VideoCreatorView using Veo 3.1
export const generateVideo = async (prompt: string, onStatus: (msg: string) => void): Promise<string> => {
  // Create a new instance right before the call to ensure the latest API key is used
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
      'Initiating high-speed generation...',
      'Synthesizing cinematic frames...',
      'Optimizing motion vectors...',
      'Finalizing your masterpiece...',
      'Almost there, hanging tight...'
    ];

    let i = 0;
    while (!operation.done) {
      onStatus(statusMessages[i % statusMessages.length]);
      i++;
      // Poll every 10 seconds as recommended
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed - no URI found");

    // Fetch the video file using the download link and append the API key
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
};
