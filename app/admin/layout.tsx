"use client";

import { useAuth } from "@/lib/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FiUsers,
  FiDollarSign,
  FiCreditCard,
  FiSettings,
  FiActivity,
  FiUserPlus,
} from "react-icons/fi";
import Link from "next/link";
import { User } from "@/lib/supabase/types";

interface AuthContextType {
  user: User | null;
  // ... other properties
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin" && user.role !== "super_admin") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#fbfaf9] flex font-bricolage">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-sm border-r border-[#eae9e8] p-6">
        <div className="mb-8">
          <Link href="/" className="flex items-center">
            <img src="/favicon.png" alt="Logo" className="w-8 h-8" />
            <span className="ml-2 font-medium text-[#111827] font-bricolage">
              Admin Panel
            </span>
          </Link>
        </div>

        <nav className="space-y-1">
          <Link
            href="/admin"
            className="flex items-center px-4 py-2.5 text-[#4b5563] hover:bg-[#f3f4f6] rounded-md transition-colors"
          >
            <FiUsers className="w-5 h-5 mr-3 text-[#6b7280]" />
            <span className="text-sm font-medium">Users</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="flex items-center px-4 py-2.5 text-[#4b5563] hover:bg-[#f3f4f6] rounded-md transition-colors"
          >
            <FiActivity className="w-5 h-5 mr-3 text-[#6b7280]" />
            <span className="text-sm font-medium">Analytics</span>
          </Link>

          <Link
            href="/admin/admins"
            className="flex items-center px-4 py-2.5 text-[#4b5563] hover:bg-[#f3f4f6] rounded-md transition-colors"
          >
            <FiUserPlus className="w-5 h-5 mr-3 text-[#6b7280]" />
            <span className="text-sm font-medium">Add Admins</span>
          </Link>

          <Link
            href="/admin/payments"
            className="flex items-center px-4 py-2.5 text-[#4b5563] hover:bg-[#f3f4f6] rounded-md transition-colors"
          >
            <FiDollarSign className="w-5 h-5 mr-3 text-[#6b7280]" />
            <span className="text-sm font-medium">Payments</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 bg-[#fbfaf9]">{children}</main>
    </div>
  );
}
