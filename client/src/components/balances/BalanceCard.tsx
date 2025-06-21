import { Balance } from "@/lib/types";
import { formatCurrency, getInitials, stringToColor } from "@/lib/utils";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  balance: Balance;
  currentUserId?: number;
  showDetails?: boolean;
  showAvatars?: boolean;
  className?: string;
  onClick?: () => void;
}

const BalanceCard = ({ 
  balance, 
  currentUserId = 1, // Default to user ID 1 as the current user
  showDetails = false,
  showAvatars = true,
  className = "",
  onClick
}: BalanceCardProps) => {
  // Determine if the current user is involved in this balance
  const isCurrentUserInvolved = balance.from_user_id === currentUserId || balance.to_user_id === currentUserId;
  
  // Determine if the current user owes money or is owed money
  const currentUserOwes = balance.from_user_id === currentUserId;
  const currentUserIsOwed = balance.to_user_id === currentUserId;
  
  // Format names for display
  const fromName = balance.from_user_name || `User ${balance.from_user_id}`;
  const toName = balance.to_user_name || `User ${balance.to_user_id}`;
  
  // Display "You" instead of the current user's name
  const displayFromName = balance.from_user_id === currentUserId ? "You" : fromName;
  const displayToName = balance.to_user_id === currentUserId ? "You" : toName;

  return (
    <div 
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {showAvatars && (
            <div className="flex items-center">
              {/* From user avatar */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white",
                  stringToColor(fromName)
                )}
              >
                {getInitials(fromName)}
              </div>
              
              {/* Arrow between avatars */}
              <ArrowRight size={16} className="mx-1 text-gray-400" />
              
              {/* To user avatar */}
              <div 
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white",
                  stringToColor(toName)
                )}
              >
                {getInitials(toName)}
              </div>
            </div>
          )}
          
          {/* Balance text */}
          <div className={showAvatars ? "ml-3" : ""}>
            <p className="font-medium">
              <span>{displayFromName}</span>
              <span className="text-gray-500 mx-1">owes</span>
              <span>{displayToName}</span>
            </p>
            
            {showDetails && (
              <p className="text-sm text-gray-500 mt-1">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        
        {/* Amount */}
        <div className={cn(
          "font-semibold",
          isCurrentUserInvolved && (currentUserOwes ? "text-red-500" : "text-green-500")
        )}>
          {isCurrentUserInvolved && (
            <span className="mr-1">
              {currentUserOwes ? <TrendingDown size={16} className="inline" /> : <TrendingUp size={16} className="inline" />}
            </span>
          )}
          {formatCurrency(balance.amount)}
        </div>
      </div>
      
      {/* Additional details if needed */}
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Group</span>
            <span>Shared expenses</span>
          </div>
          
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Status</span>
            <span className="text-amber-500">Pending</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BalanceCard;
