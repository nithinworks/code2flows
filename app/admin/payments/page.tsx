"use client";

import { useState, useEffect } from "react";
import { FiDollarSign } from "react-icons/fi";

interface Payment {
  id: string;
  user_email: string;
  amount: number; // Price in dollars
  credits: number; // Number of credits purchased
  status: string; // Always "succeeded" for now
  created_at: string;
  payment_id: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch("/api/admin/payments");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPayments(data.payments);
      setTotalRevenue(data.totalRevenue);
    } catch (error) {
      console.error("Error fetching payments:", error);
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
        Payment History
      </h1>

      {/* Revenue Card */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-[#eae9e8] max-w-xs">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#6b7280]">Total Revenue</p>
            <p className="text-2xl font-medium text-[#111827]">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
          <FiDollarSign className="w-8 h-8 text-[#9ca3af]" />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-[#eae9e8] overflow-hidden">
        <table className="w-full font-jakarta">
          <thead>
            <tr className="bg-[#f9fafb] border-b border-[#eae9e8]">
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Credits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-[#6b7280] uppercase tracking-wider font-bricolage">
                Payment ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eae9e8]">
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="hover:bg-[#f9fafb] transition-colors"
              >
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {payment.user_email}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">
                  ${payment.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {payment.credits}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === "succeeded"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {new Date(payment.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-[#111827]">
                  {payment.payment_id}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
