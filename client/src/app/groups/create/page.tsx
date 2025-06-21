"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import CreateGroupForm from "@/components/groups/CreateGroupForm";

export default function CreateGroupPage() {
  return (
    <div className="space-y-6">
      {/* Page Header with Back Button */}
      <div className="flex items-center gap-4">
        <Link 
          href="/groups" 
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <h1 className="text-3xl font-bold">Create a New Group</h1>
      </div>

      {/* Description */}
      <p className="text-gray-600 max-w-2xl">
        Create a group to track and split expenses with friends, roommates, or for a trip.
        Add members who will be part of this expense sharing group.
      </p>

      {/* Create Group Form */}
      <div className="max-w-2xl">
        <CreateGroupForm />
      </div>
    </div>
  );
}
