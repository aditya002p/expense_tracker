"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { chatApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import ChatBubble from "./ChatBubble";

interface ChatInterfaceProps {
  title?: string;
  initialMessages?: ChatMessage[];
  height?: string;
  className?: string;
  userId?: number;
  groupId?: number;
  showHeader?: boolean;
  placeholder?: string;
  onSendMessage?: (message: string) => Promise<string>;
}

const ChatInterface = ({
  title = "Chat",
  initialMessages = [],
  height = "h-[500px]",
  className = "",
  userId = 1, // Default to current user
  groupId,
  showHeader = true,
  placeholder = "Type your message...",
  onSendMessage
}: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message if no initial messages
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: "Hi there! I'm your expense assistant. You can ask me things like 'How much does Alex owe in Goa Trip?' or 'Show me my latest expenses.'",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      sender: "user",
      timestamp: new Date().toISOString(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
    
    try {
      let botResponse = "";
      
      // Use custom handler if provided, otherwise use default API
      if (onSendMessage) {
        botResponse = await onSendMessage(inputValue);
      } else {
        // In a real app, this would be an API call
        // const response = await chatApi.sendMessage(inputValue, userId, groupId);
        // botResponse = response.response;
        
        // Mock response for demonstration
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple pattern matching for demo purposes
        if (inputValue.toLowerCase().includes("owe")) {
          botResponse = "Based on current expenses, Alex owes ₹480 in the Goa Trip group.";
        } else if (inputValue.toLowerCase().includes("latest expense")) {
          botResponse = "Your latest expense was 'Dinner at Beach Shack' for ₹2,400 in the Goa Trip group.";
        } else if (inputValue.toLowerCase().includes("total")) {
          botResponse = "Your total expenses across all groups is ₹15,750.75.";
        } else if (inputValue.toLowerCase().includes("balance")) {
          botResponse = "Your current net balance is +₹400.50. You are owed ₹1,250.75 and you owe ₹850.25.";
        } else {
          botResponse = "I'm not sure how to answer that. Try asking about balances, expenses, or who owes whom in a specific group.";
        }
      }
      
      // Add bot response to chat
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        content: botResponse,
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        content: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className={cn("flex flex-col rounded-2xl border border-gray-200 overflow-hidden bg-white", className)}>
      {/* Chat Header */}
      {showHeader && (
        <div className="bg-[#1cc29f] text-white p-4">
          <h3 className="font-medium">{title}</h3>
        </div>
      )}

      {/* Chat Messages */}
      <div className={cn("flex-1 p-4 overflow-y-auto bg-gray-50", height)}>
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start">
              <div className="chat-bubble-bot typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          {/* Invisible element for scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 flex">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1cc29f] focus:border-transparent"
          disabled={isTyping}
        />
        <button
          type="submit"
          className={cn(
            "bg-[#1cc29f] text-white px-4 rounded-r-lg hover:bg-[#18b090] transition-colors flex items-center justify-center",
            (isTyping || !inputValue.trim()) && "opacity-70 cursor-not-allowed"
          )}
          disabled={isTyping || !inputValue.trim()}
        >
          {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
