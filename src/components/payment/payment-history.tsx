import type { Payment } from "@prisma/client";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { SlipImageModal } from "./slip-image-modal";

type PaymentWithUser = Payment & { user: { email: string } };

interface PaymentHistoryProps {
  payments: PaymentWithUser[];
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

function StatusBadge({ status }: { status: Payment["status"] }) {
  if (status === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-semibold">
        <CheckCircle2 className="size-3" />
        อนุมัติแล้ว
      </span>
    );
  }
  if (status === "REJECTED") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-full font-semibold">
        <XCircle className="size-3" />
        ปฏิเสธแล้ว
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-semibold">
      <Clock className="size-3" />
      รอการอนุมัติ
    </span>
  );
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-base font-semibold text-foreground">
          ประวัติการชำระ
          {payments.length > 0 ? ` (${payments.length} รายการ)` : ""}
        </h2>
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8 px-6">
          ยังไม่มีประวัติการชำระ
        </p>
      ) : (
        <div className="divide-y divide-border">
          {payments.map(payment => (
            <div
              key={payment.id}
              className="px-6 py-4 space-y-2 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {fmt(payment.amount)} บาท
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {payment.senderName ?? "-"} · {payment.senderBank ?? "-"}
                  </p>
                  <p className="text-xs text-muted-foreground/70 truncate">
                    Email: {payment.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {fmtDate(payment.slipDate)}
                  </p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <StatusBadge status={payment.status} />
                  <p className="text-xs text-muted-foreground font-mono max-w-[140px] truncate text-right">
                    {payment.transRef}
                  </p>
                </div>
              </div>

              {payment.rejectedReason && (
                <div className="text-xs text-red-400 bg-red-950/30 border border-red-800/50 rounded-lg px-3 py-2">
                  <span className="font-semibold">เหตุผลการปฏิเสธ:</span>{" "}
                  {payment.rejectedReason}
                </div>
              )}

              {payment.slipImageUrl && (
                <SlipImageModal
                  imageUrl={payment.slipImageUrl}
                  label={`สลิป ${fmt(payment.amount)} บาท — ${payment.senderName ?? ""}`}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
