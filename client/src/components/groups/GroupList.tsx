import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Group } from "@/lib/types";
import GroupCard from "./GroupCard";

interface GroupListProps {
  groups: Group[];
  showCreateButton?: boolean;
  emptyMessage?: string;
  className?: string;
}

const GroupList = ({ 
  groups, 
  showCreateButton = true, 
  emptyMessage = "No groups found", 
  className = "" 
}: GroupListProps) => {
  const hasGroups = groups.length > 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {/* Render group cards */}
      {hasGroups ? (
        groups.map((group) => (
          <GroupCard key={group.id} group={group} />
        ))
      ) : (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}

      {/* Create new group card */}
      {showCreateButton && (
        <Link 
          href="/groups/create" 
          className="card bg-gray-50 hover:bg-gray-100 border-dashed border-2 border-gray-200 flex flex-col items-center justify-center text-center p-6 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#1cc29f] mb-3">
            <PlusCircle size={24} />
          </div>
          <h3 className="text-lg font-semibold mb-1">Create a new group</h3>
          <p className="text-gray-500 text-sm">
            Start tracking expenses with friends, roommates, or for a trip
          </p>
        </Link>
      )}
    </div>
  );
};

export default GroupList;
