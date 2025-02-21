"use client";

import { useState, useEffect } from "react";
import { FiSlash, FiCheck, FiEdit, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "@/lib/context/auth";
import EditCreditsModal from "@/app/components/EditCreditsModal";

interface User {
  id: string;
  email: string;
  credits: number;
  status: "active" | "banned";
  email_verified: boolean;
  verified_at: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "banned" : "active";
      const response = await fetch("/api/admin/users/ban", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          status: newStatus,
          adminId: user?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to update user status");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleUpdateCredits = async (
    userId: string,
    credits: number,
    notes: string
  ) => {
    try {
      const response = await fetch("/api/admin/users/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          credits,
          adminId: user?.id,
          notes,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update credits");

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error updating credits:", error);
      throw error;
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/users/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          adminId: user?.id,
        }),
      });

      if (!response.ok) throw new Error("Failed to verify user");
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error("Error verifying user:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-[#001e2b] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-medium text-[#111827] mb-6 font-bricolage">
        User Management
      </h1>

      <div className="bg-white rounded-lg shadow-sm border border-[#eae9e8] overflow-hidden">
        <table className="w-full font-jakarta">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#eae9e8]">
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Verified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae9e8]">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-[#f9fafb] transition-colors"
              >
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {user.credits}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.email_verified ? (
                    <FiCheck className="w-5 h-5 text-green-500" />
                  ) : (
                    <span className="text-red-500">No</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleBanUser(user.id, user.status)}
                      className="text-[#6b7280] hover:text-[#4b5563] transition-colors"
                      title={
                        user.status === "active" ? "Ban User" : "Unban User"
                      }
                    >
                      <FiSlash className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditClick(user)}
                      className="text-[#6b7280] hover:text-[#4b5563] transition-colors"
                      title="Edit Credits"
                    >
                      <FiEdit className="w-5 h-5" />
                    </button>
                    {!user.email_verified && (
                      <button
                        onClick={() => handleVerifyUser(user.id)}
                        className="text-[#6b7280] hover:text-[#4b5563] transition-colors"
                        title="Verify User"
                      >
                        <FiCheckCircle className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <EditCreditsModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.id}
          userEmail={selectedUser.email}
          currentCredits={selectedUser.credits}
          onUpdate={handleUpdateCredits}
        />
      )}
    </div>
  );
}
