import { redirect } from "next/navigation";
import { getDebtInfo, getEasySlipInfo } from "@/app/actions/payment";
import { getOrSyncCurrentUser } from "@/lib/auth";
import { DebtSummary } from "@/components/payment/debt-summary";
import { SlipUploadForm } from "@/components/payment/slip-upload-form";
import { PaymentHistory } from "@/components/payment/payment-history";
import { AdminApprovalPanel } from "@/components/payment/admin-approval-panel";
import { LogoutButton } from "@/components/payment/logout-button";
import { AutoRefresh } from "@/components/payment/auto-refresh";
import { ShieldCheck, User } from "lucide-react";

export const metadata = {
  title: "ระบบชำระหนี้",
};

export default async function PaymentPage() {
  const [user, { debt, payments, paidAmount, remaining }, apiInfo] =
    await Promise.all([
      getOrSyncCurrentUser(),
      getDebtInfo(),
      getEasySlipInfo(),
    ]);

  if (!user) redirect("/sign-in");

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <AutoRefresh />
      <div className="max-w-lg mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              user.isAdmin
                ? "bg-violet-900/30 text-violet-300"
                : "bg-slate-800 text-slate-400"
            }`}
          >
            {user.isAdmin ? (
              <>
                <ShieldCheck className="size-3.5" />
                Admin
              </>
            ) : (
              <>
                <User className="size-3.5" />
                {user?.email ? user.email.split("@")[0] : "ผู้ใช้ทั่วไป"}
              </>
            )}
          </div>

          <LogoutButton />
        </div>

        {/* Debt summary */}
        <DebtSummary
          totalAmount={debt.totalAmount}
          paidAmount={paidAmount}
          remaining={remaining}
        />

        {/* Upload form or admin panel */}
        {user.isAdmin ? (
          <>
            <div className="flex items-center gap-2.5 p-4 bg-violet-950/30 border border-violet-800/50 rounded-xl text-sm text-violet-300">
              <ShieldCheck className="size-4 shrink-0" />
              <span>
                คุณเข้าสู่ระบบในฐานะ Admin — อนุมัติ/ปฏิเสธการชำระเงินได้
              </span>
            </div>
            <AdminApprovalPanel
              pendingPayments={payments.filter(p => p.status === "PENDING")}
            />
          </>
        ) : (
          <SlipUploadForm />
        )}

        {/* Payment history */}
        <PaymentHistory payments={payments} />

        {/* EasySlip quota */}
        {apiInfo?.success && (
          <p className="text-xs text-muted-foreground text-center pb-2">
            EasySlip quota: {apiInfo.data.application.quota.used} /{" "}
            {apiInfo.data.application.quota.max ?? "∞"} &nbsp;·&nbsp;{" "}
            {apiInfo.data.product.name}
          </p>
        )}
      </div>
    </main>
  );
}
