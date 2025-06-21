import { cn } from "@/lib/utils";
import { ChatMessage } from "@/lib/types";

interface ChatBubbleProps {
  message: ChatMessage;
  showTimestamp?: boolean;
  className?: string;
}

const ChatBubble = ({ 
  message, 
  showTimestamp = true, 
  className = "" 
}: ChatBubbleProps) => {
  // Format timestamp for display
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isUser = message.sender === "user";

  return (
    <div
      className={cn(
        "flex flex-col",
        isUser ? "items-end" : "items-start",
        className
      )}
    >
      <div
        className={cn(
          "chat-bubble",
          isUser ? "chat-bubble-user" : "chat-bubble-bot"
        )}
      >
        {message.content}
      </div>
      
      {showTimestamp && (
        <span className="text-xs text-gray-500 mt-1 px-2">
          {formatTime(message.timestamp)}
        </span>
      )}
    </div>
  );
};

export default ChatBubble;
