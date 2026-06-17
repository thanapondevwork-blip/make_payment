interface DebtSummaryProps {
  totalAmount: number
  paidAmount: number
  remaining: number
}

function fmt(amount: number) {
  return new Intl.NumberFormat('th-TH').format(amount)
}

export function DebtSummary({ totalAmount, paidAmount, remaining }: DebtSummaryProps) {
  const percentage = Math.min((paidAmount / totalAmount) * 100, 100)

  return (
    <div className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-base font-semibold text-foreground">สรุปยอดหนี้</h2>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">ยอดหนี้รวม</p>
          <p className="text-lg font-bold text-foreground">{fmt(totalAmount)}</p>
          <p className="text-xs text-muted-foreground">บาท</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">ชำระแล้ว</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">{fmt(paidAmount)}</p>
          <p className="text-xs text-muted-foreground">บาท</p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">คงเหลือ</p>
          <p className="text-lg font-bold text-destructive">{fmt(remaining)}</p>
          <p className="text-xs text-muted-foreground">บาท</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>ความคืบหน้า</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: percentage > 0 ? `max(${percentage}%, 4px)` : '0%' }}
          />
        </div>
      </div>
    </div>
  )
}
