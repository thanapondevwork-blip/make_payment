"use client";

import { useState, useTransition } from "react";
import type { Payment } from "@prisma/client";

type PaymentWithUser = Payment & { user: { email: string } };
import { CheckCircle2, XCircle, Clock, ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { approvePayment, rejectPayment } from "@/app/actions/payment";

interface AdminApprovalPanelProps {
  pendingPayments: PaymentWithUser[];
}

function fmt(amount: number) {
  return new Intl.NumberFormat("th-TH").format(amount);
}

function fmtDate(date: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function PaymentApprovalCard({ payment }: { payment: PaymentWithUser }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  const handleApprove = () => {
    startTransition(async () => {
      const res = await approvePayment(payment.id);
      setResult(res);
    });
  };

  const handleReject = () => {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    startTransition(async () => {
      const res = await rejectPayment(payment.id, rejectReason || undefined);
      setResult(res);
    });
  };

  if (result) {
    return (
      <div
        className={`rounded-xl border p-4 flex items-center gap-2.5 text-sm ${
          result.success
            ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-300"
            : "bg-red-950/30 border-red-800/50 text-red-400"
        }`}
      >
        {result.success ? (
          <CheckCircle2 className="size-4 shrink-0" />
        ) : (
          <XCircle className="size-4 shrink-0" />
        )}
        <span>{result.message}</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-l-4 border-amber-400 bg-amber-950/20 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-bold text-foreground">
            {fmt(payment.amount)} บาท
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {payment.senderName ?? "-"} · {payment.senderBank ?? "-"}
          </p>
          <p className="text-xs text-muted-foreground">
            โอนเมื่อ {fmtDate(payment.slipDate)}
          </p>
          <p className="text-xs text-muted-foreground">
            ส่งเมื่อ {fmtDate(payment.createdAt)}
          </p>
          <p className="text-xs text-muted-foreground/70 truncate">
            Email: {payment.user.email}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-semibold shrink-0">
          <Clock className="size-3" />
          รอดำเนินการ
        </span>
      </div>

      {payment.slipImageUrl && (
        <a
          href={payment.slipImageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 hover:underline"
        >
          <ImageIcon className="size-3" />
          ดูรูปสลิป
        </a>
      )}

      <p className="text-xs text-muted-foreground font-mono truncate">
        Ref: {payment.transRef}
      </p>

      {showRejectInput && (
        <textarea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          placeholder="ระบุเหตุผลการปฏิเสธ (ไม่บังคับ)..."
          className="w-full h-16 px-3 py-2 text-xs border border-input rounded-lg resize-none bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
        />
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleApprove}
          disabled={isPending}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <CheckCircle2 className="size-3.5" />
          )}
          อนุมัติ
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={handleReject}
          disabled={isPending}
          className="flex-1"
        >
          {isPending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <XCircle className="size-3.5" />
          )}
          {showRejectInput ? "ยืนยันปฏิเสธ" : "ปฏิเสธ"}
        </Button>
      </div>
    </div>
  );
}

export function AdminApprovalPanel({
  pendingPayments,
}: AdminApprovalPanelProps) {
  if (pendingPayments.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
        <h2 className="text-base font-semibold text-foreground mb-3">
          รออนุมัติ
        </h2>
        <p className="text-sm text-muted-foreground text-center py-4">
          ไม่มีรายการรอดำเนินการ
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2">
        <h2 className="text-base font-semibold text-foreground">รออนุมัติ</h2>
        <span className="inline-flex items-center justify-center size-5 text-xs font-bold bg-yellow-500 text-white rounded-full">
          {pendingPayments.length}
        </span>
      </div>

      <div className="space-y-3">
        {pendingPayments.map(payment => (
          <PaymentApprovalCard key={payment.id} payment={payment} />
        ))}
      </div>
    </div>
  );
}
