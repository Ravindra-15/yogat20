// Diabmukt - My Plans and Billings Page
// Subscription overview (current week + progress) + consultations + transactions
// Route: /my-plans-and-billings (protected, fully-onboarded users)

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Activity,
  Receipt,
  CalendarClock,
  Award,
  PlayCircle,
  RefreshCw,
  Clock,
} from "lucide-react";
import CustomerNavbar from "../../../components/customer/layout/CustomerNavbar";
import CustomerFooter from "../../../components/customer/layout/CustomerFooter";
import {
  fetchBillingSummary,
  fetchMyTransactions,
  fetchMySubscription,
} from "../../../services/customerBillingService";
import TransactionRow from "./components/TransactionRow";

// 🏢 This frontend's program — change only this line when copying to another program
const PROGRAM_ID = "yogat20";

// 📅 Format a date as "Jan 1, 2026"
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

export default function MyPlansAndBillings() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState({ totalCompleted: 0 });
  const [transactions, setTransactions] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [pendingRenewal, setPendingRenewal] = useState(null);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 📥 Load billing summary + transactions + subscription
  useEffect(() => {
    (async () => {
      try {
        const [s, t, sub] = await Promise.all([
          fetchBillingSummary(),
          fetchMyTransactions(),
          fetchMySubscription(PROGRAM_ID),
        ]);
        setSummary(s?.consultations || { totalCompleted: 0 });
        setTransactions(t || []);
        setSubscription(sub?.subscription || null);
        setPendingRenewal(sub?.pendingRenewal || null);
        setPendingList(sub?.pendingList || []);
      } catch {
        toast.error("Failed to load billing data");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col">
      <CustomerNavbar />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#6B7280] hover:text-orange-500 text-sm mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            My Plans and Billings
          </h1>
          <p className="text-[#6B7280] text-sm mt-1">
            Manage your identity, view clinical history, and secure your account
          </p>
        </div>

        {/* ============================================ */}
        {/* 📊 TOP STAT CARDS — Current Week + Consultations */}
        {/* ============================================ */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Current Week — only if user has a subscription */}
          {subscription && (
            <div className="bg-white rounded-2xl border border-[#E7EAF3] shadow-[0_1px_3px_rgba(16,24,40,0.04)] p-5 sm:p-6 flex flex-col w-full sm:w-auto sm:min-w-[220px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#FFF7ED rounded-lg flex items-center justify-center">
                  <CalendarClock size={16} className="text-orange-500" />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  Current Week
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800">
                {subscription.currentWeek} / {subscription.totalWeeks}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {subscription.weeksRemaining} weeks remaining
              </p>
            </div>
          )}

          {/* Consultations */}
          <div className="bg-white rounded-2xl border border-[#E7EAF3] shadow-[0_1px_3px_rgba(16,24,40,0.04)] p-5 sm:p-6 flex flex-col w-full sm:w-auto sm:min-w-[220px]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Activity size={16} className="text-green-500" />
              </div>
              <span className="text-sm font-semibold text-gray-800">
                Consultations
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-800">
              {loading ? "—" : summary.totalCompleted || 0}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Total completed</p>
          </div>
        </div>

        {/* ============================================ */}
        {/* 🏆 MY CURRENT PROGRAM — progress card        */}
        {/* ============================================ */}
        {subscription && (
          <div className="bg-white rounded-2xl border border-[#E7EAF3] shadow-[0_1px_3px_rgba(16,24,40,0.04)] p-5 sm:p-6 mb-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                  <Award size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm sm:text-base">
                    My Current Program: {subscription.programName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {subscription.isActive ? "Active" : "Expired"} since{" "}
                    {formatDate(subscription.startDate)} • Ends{" "}
                    {formatDate(subscription.endDate)}
                  </p>
                </div>
              </div>

              {/* Action buttons — Dashboard (active) + Renew (expiring soon or expired) */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {subscription.isActive && (
                  <button
                    onClick={() =>
                      navigate(`/programs/${PROGRAM_ID}/dashboard`)
                    }
                    className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-[0_4px_14px_rgba(91,79,247,0.25)] transition-colors"
                  >
                    <PlayCircle size={15} />
                    Go to Dashboard
                  </button>
                )}

                {/* Renew — show when expired, OR active+expiring within 7 days and no renewal already queued */}
                {(!subscription.isActive ||
                  (subscription.daysUntilExpiry <= 7 && !pendingRenewal)) && (
                  <button
                    onClick={() => navigate(`/programs/${PROGRAM_ID}/tenure`)}
                    className="inline-flex items-center justify-center gap-2 border border-orange-500 text-orange-500 hover:bg-[#F5F7FF] text-sm font-semibold px-5 py-2.5 rounded-full transition-colors"
                  >
                    <RefreshCw size={15} />
                    Renew Program
                  </button>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>Current: Week {subscription.currentWeek}</span>
              <span>Remaining: {subscription.weeksRemaining} Weeks</span>
            </div>
            <div className="w-full h-3 bg-[#EEF0F6] rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${subscription.progressPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400 mt-1.5">
              <span>Started</span>
              <span>{subscription.progressPercent}%</span>
              <span>Completion</span>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* 🔜 PENDING RENEWAL — new plan starts after current ends */}
        {/* ============================================ */}
        {pendingList.length > 0 && (
          <div className="bg-[#F5F7FF] rounded-2xl border border-[#D9DDF0] p-5 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={18} className="text-white" />
              </div>
              <p className="font-bold text-gray-800 text-sm sm:text-base">
                {pendingList.length > 1
                  ? "Your upcoming plans"
                  : "Your new plan will start soon"}
              </p>
            </div>

            <div className="space-y-2">
              {pendingList.map((p, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl border border-[#E7EAF3] px-4 py-3 flex items-start gap-2"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-[#EEF2FF] text-orange-500 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-xs text-gray-600">
                    {p.programName} ({p.tenure}) — starts{" "}
                    <strong>{formatDate(p.startDate)}</strong> and ends{" "}
                    <strong>{formatDate(p.endDate)}</strong>.
                  </p>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-gray-400 mt-3">
              These start automatically, one after another. No action needed.
            </p>
          </div>
        )}

        {/* ============================================ */}
        {/* 💳 RECENT TRANSACTIONS                        */}
        {/* ============================================ */}
        <div className="bg-white rounded-2xl border border-[#E7EAF3] shadow-[0_1px_3px_rgba(16,24,40,0.04)] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-[#FFF7ED rounded-lg flex items-center justify-center">
              <Receipt size={16} className="text-orange-500" />
            </div>
            <h3 className="text-base font-bold text-gray-800">
              Recent Transactions
            </h3>
          </div>
          <p className="text-[#6B7280] text-xs mb-5 ml-10">
            Your complete payment history
          </p>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-[#E7EAF3]">
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Description</th>
                  <th className="py-3 pr-4 font-medium">Amount</th>
                  <th className="py-3 pr-4 font-medium">Status</th>
                  <th className="py-3 font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-gray-400 text-xs"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-gray-400 text-xs"
                    >
                      No transactions yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} variant="desktop" />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {loading ? (
              <p className="text-center text-gray-400 text-xs py-6">
                Loading transactions...
              </p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-6">
                No transactions yet.
              </p>
            ) : (
              transactions.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} variant="mobile" />
              ))
            )}
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}