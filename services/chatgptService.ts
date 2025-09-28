import axios from 'axios';

export interface ChatGPTResponse {
  text: string;
}

export const getChatGPTResponse = async (question: string): Promise<ChatGPTResponse> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) {
    return { text: 'OpenAI API key is not configured.' };
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are AGGS, an educational assistant. Provide clear, accurate, and helpful answers to user questions about the education sector.' },
          { role: 'user', content: question },
        ],
        max_tokens: 512,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return { text: response.data.choices[0].message.content };
  } catch (error) {
    return { text: 'Sorry, there was an error contacting ChatGPT.' };
  }
};
