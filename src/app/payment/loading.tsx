import { Skeleton } from '@/components/ui/skeleton'

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
      {children}
    </div>
  )
}

export default function PaymentLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between py-2">
          <Skeleton className="h-7 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>

        {/* DebtSummary */}
        <CardShell>
          <Skeleton className="h-5 w-24 mb-5" />
          <div className="grid grid-cols-3 gap-3 text-center mb-5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-16 mx-auto" />
                <Skeleton className="h-6 w-20 mx-auto" />
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        </CardShell>

        {/* Upload form */}
        <CardShell>
          <Skeleton className="h-5 w-32 mb-5" />
          <Skeleton className="h-40 w-full rounded-xl mb-5" />
          <Skeleton className="h-11 w-full rounded-lg" />
        </CardShell>

        {/* Payment history */}
        <CardShell>
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            ))}
          </div>
        </CardShell>

      </div>
    </main>
  )
}
