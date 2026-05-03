import { create } from "zustand";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatState = {
  messages: ChatMessage[];
  setMessages: (messages: ChatMessage[]) => void;
  clearChat: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  clearChat: () => set({ messages: [] }),
}));
