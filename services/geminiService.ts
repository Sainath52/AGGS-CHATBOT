
import { GoogleGenAI } from "@google/genai";

// The API key is injected from the environment.
// Do not edit this line.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TEXT_MODEL_NAME = 'gemini-2.5-flash';
const IMAGE_MODEL_NAME = 'imagen-3.0-generate-002';

export interface SearchResult {
  title: string;
  uri: string;
}

export interface EducationalResponse {
  text: string;
  imageUrl?: string;
  searchResults?: SearchResult[];
}

export interface Attachment {
    mimeType: string;
    data: string;
}

export const getEducationalResponse = async (question: string, language: string, attachment?: Attachment): Promise<EducationalResponse> => {
  if (!process.env.API_KEY) {
    return { text: "API Key is not configured. Please set up the API_KEY environment variable." };
  }

  try {
    const textPrompt = `
      You are AGGS, a professional educational assistant.
      Your primary function is to provide a clear, accurate, and concise answer to the user's question using information from the web.
      If the user provides an image, use it as context for your answer.
      Your tone must always be professional, helpful, and encouraging.
      Base your answer on the search results provided to you. Do not mention the search results in your response.
      Respond ONLY in the following language: ${language}.

      User's Question: "${question}"
    `;
    
    const imagePrompt = `An abstract, professional, educational-themed vector art image that visually represents the concept of: "${question}". Clean lines, vibrant but not childish colors, and a modern aesthetic. The concept should be understandable globally.`;

    const textPart = { text: textPrompt };
    const contentParts: ({ text: string; } | { inlineData: { mimeType: string; data: string; }; })[] = [textPart];

    if (attachment) {
        const imagePart = {
            inlineData: {
                mimeType: attachment.mimeType,
                data: attachment.data,
            },
        };
        // Add user's image to the beginning of the content parts
        contentParts.unshift(imagePart);
    }

    // We can run both API calls in parallel for better performance
    const [textResponse, imageResponse] = await Promise.all([
      ai.models.generateContent({
        model: TEXT_MODEL_NAME,
        contents: [{ parts: contentParts }], // Corrected structure to be Content[]
        config: {
          tools: [{googleSearch: {}}],
        }
      }),
      ai.models.generateImages({
        model: IMAGE_MODEL_NAME,
        prompt: imagePrompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      })
    ]);
    
    const text = textResponse.text;
    const groundingChunks = textResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;

    const searchResults: SearchResult[] = groundingChunks
        ?.map((chunk: any) => chunk?.web)
        .filter((web: any) => web?.uri && web?.title)
        .map((web: any) => ({ title: web.title, uri: web.uri })) ?? [];
        
    // Deduplicate search results based on URI to avoid showing the same link multiple times
    const uniqueSearchResults = Array.from(new Map(searchResults.map(item => [item.uri, item])).values());

    const base64ImageBytes = imageResponse.generatedImages?.[0]?.image?.imageBytes;
    const imageUrl = base64ImageBytes ? `data:image/jpeg;base64,${base64ImageBytes}` : undefined;

    return { text, imageUrl, searchResults: uniqueSearchResults };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return { text: "I'm sorry, but I encountered an error while processing your request. Please check your API key and network connection, or try again later." };
  }
};
