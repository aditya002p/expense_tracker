"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, MinusSquare } from "lucide-react";
import { ChatMessage } from "@/lib/types";
import { chatApi } from "@/lib/api";
import { cn } from "@/lib/utils";

// Mock user ID for demonstration
const CURRENT_USER_ID = 1;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add welcome message when chat is first opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: "Hi there! I'm your expense assistant. You can ask me things like 'How much does Alex owe in Goa Trip?' or 'Show me my latest expenses.'",
        sender: "bot",
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
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
      // In a real app, this would be an API call
      // const response = await chatApi.sendMessage(inputValue, CURRENT_USER_ID);
      
      // Mock response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let botResponse = "";
      
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

  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-[#1cc29f] text-white p-4 rounded-full shadow-lg hover:bg-[#18b090] transition-colors flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-xl w-80 sm:w-96 flex flex-col overflow-hidden border border-gray-200">
          {/* Chat Header */}
          <div className="bg-[#1cc29f] text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare size={20} className="mr-2" />
              <h3 className="font-medium">Expense Assistant</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMinimize}
                className="p-1 hover:bg-[#18b090] rounded"
                aria-label={isMinimized ? "Maximize chat" : "Minimize chat"}
              >
                <MinusSquare size={18} />
              </button>
              <button
                onClick={toggleChat}
                className="p-1 hover:bg-[#18b090] rounded"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Chat Body */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto max-h-96 bg-gray-50">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex flex-col",
                        message.sender === "user" ? "items-end" : "items-start"
                      )}
                    >
                      <div
                        className={cn(
                          "chat-bubble",
                          message.sender === "user"
                            ? "chat-bubble-user"
                            : "chat-bubble-bot"
                        )}
                      >
                        {message.content}
                      </div>
                      <span className="text-xs text-gray-500 mt-1 px-2">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
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
                  placeholder="Ask about expenses or balances..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#1cc29f] focus:border-transparent"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  className={cn(
                    "bg-[#1cc29f] text-white px-4 rounded-r-lg hover:bg-[#18b090] transition-colors flex items-center justify-center",
                    isTyping && "opacity-70 cursor-not-allowed"
                  )}
                  disabled={isTyping || !inputValue.trim()}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
