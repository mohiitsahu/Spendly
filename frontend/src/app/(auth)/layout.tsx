import { Wallet, PieChart, Target } from "lucide-react";

const HIGHLIGHTS = [
  { icon: Wallet, text: "Track income and expenses in seconds" },
  { icon: PieChart, text: "See spending against your budgets" },
  { icon: Target, text: "Watch your savings goals fill in" },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12">
        <span className="font-display text-xl">Spendly</span>

        <div className="max-w-sm">
          <p className="font-display text-3xl leading-snug mb-8">
            &ldquo;A clear ledger for your money.&rdquo;
          </p>
          <div className="space-y-4">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                    <Icon size={16} />
                  </div>
                  <p className="text-sm text-white/80">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-white/40">Built by Mohit Sahu</p>
      </div>

      <div className="flex items-center justify-center px-4 py-12 bg-paper">{children}</div>
    </div>
  );
}