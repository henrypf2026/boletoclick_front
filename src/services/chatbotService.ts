import { api } from "@/lib/apiClient";

interface ChatbotApiResponse {
  answer: string;
}

export const chatbotService = {
  async ask(message: string): Promise<string> {
    const data = await api.post<ChatbotApiResponse>("/chatbot", { message });
    return data.answer;
  },
};
