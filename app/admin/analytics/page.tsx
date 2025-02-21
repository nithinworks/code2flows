"use client";

import { useEffect, useState } from "react";
import { FiUsers, FiCreditCard, FiActivity } from "react-icons/fi";

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalCreditsIssued: number;
  totalCreditsUsed: number;
}

interface Transaction {
  id: string;
  user_id: string;
  user_email: string;
  amount: number;
  type: string;
  created_at: string;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setAnalytics(data.analytics);
      setTransactions(data.transactions);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <h1 className="text-2xl font-medium text-[#111827] mb-6 font-bricolage">
        Analytics Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#eae9e8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b7280]">Total Users</p>
              <p className="text-2xl font-medium text-[#111827]">
                {analytics?.totalUsers}
              </p>
            </div>
            <FiUsers className="w-8 h-8 text-[#9ca3af]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#eae9e8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b7280]">Active Users</p>
              <p className="text-2xl font-medium text-[#111827]">
                {analytics?.activeUsers}
              </p>
            </div>
            <FiActivity className="w-8 h-8 text-[#9ca3af]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#eae9e8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b7280]">Total Credits Issued</p>
              <p className="text-2xl font-medium text-[#111827]">
                {analytics?.totalCreditsIssued}
              </p>
            </div>
            <FiCreditCard className="w-8 h-8 text-[#9ca3af]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-[#eae9e8]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#6b7280]">Total Credits Used</p>
              <p className="text-2xl font-medium text-[#111827]">
                {analytics?.totalCreditsUsed}
              </p>
            </div>
            <FiCreditCard className="w-8 h-8 text-[#9ca3af]" />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[#eae9e8] overflow-hidden">
        <h2 className="text-lg font-semibold text-[#111827] p-6 border-b-2 border-[#eae9e8]">
          Recent Transactions
        </h2>
        <table className="w-full font-jakarta">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#eae9e8]">
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae9e8]">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-[#f9fafb] transition-colors"
              >
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {transaction.user_email}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827] capitalize">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {transaction.amount}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
