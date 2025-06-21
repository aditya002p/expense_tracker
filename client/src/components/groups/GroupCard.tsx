import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { Group } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface GroupCardProps {
  group: Group;
  className?: string;
}

const GroupCard = ({ group, className = "" }: GroupCardProps) => {
  return (
    <Link 
      href={`/groups/${group.id}`} 
      className={`card bg-white hover:shadow-lg transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-12 h-12 rounded-full bg-[#e4f9f5] flex items-center justify-center text-[#1cc29f]">
          <Users size={20} />
        </div>
        <span className="badge badge-blue">
          {group.members.length} members
        </span>
      </div>
      <h3 className="text-lg font-semibold mb-1">{group.name}</h3>
      <p className="text-gray-500 text-sm mb-3">
        Total expenses: {formatCurrency(group.total_expenses || 0)}
      </p>
      <div className="mt-auto pt-2">
        <span className="text-[#1cc29f] text-sm font-medium flex items-center">
          View details <ArrowRight size={14} className="ml-1" />
        </span>
      </div>
    </Link>
  );
};

export default GroupCard;
