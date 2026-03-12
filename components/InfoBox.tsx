type Variant = 'info' | 'tip' | 'warning';

const styles: Record<Variant, { border: string; bg: string; icon: string; heading: string; text: string }> = {
  info: {
    border: 'border-blue-200 dark:border-blue-900/50',
    bg: 'bg-blue-50/60 dark:bg-blue-950/30',
    icon: 'bg-blue-100 dark:bg-blue-900/50',
    heading: 'text-blue-900 dark:text-blue-200',
    text: 'text-blue-800/80 dark:text-blue-300/80',
  },
  tip: {
    border: 'border-emerald-200 dark:border-emerald-900/50',
    bg: 'bg-emerald-50/60 dark:bg-emerald-950/30',
    icon: 'bg-emerald-100 dark:bg-emerald-900/50',
    heading: 'text-emerald-900 dark:text-emerald-200',
    text: 'text-emerald-800/80 dark:text-emerald-300/80',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-900/50',
    bg: 'bg-amber-50/60 dark:bg-amber-950/30',
    icon: 'bg-amber-100 dark:bg-amber-900/50',
    heading: 'text-amber-900 dark:text-amber-200',
    text: 'text-amber-800/80 dark:text-amber-300/80',
  },
};

const icons: Record<Variant, string> = {
  info: 'ℹ️',
  tip: '💡',
  warning: '⚠️',
};

type Props = {
  variant?: Variant;
  title: string;
  children: React.ReactNode;
};

export function InfoBox({ variant = 'info', title, children }: Props) {
  const s = styles[variant];
  return (
    <div className={`my-6 flex items-start gap-4 rounded-xl border ${s.border} ${s.bg} p-5`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${s.icon} text-lg`}>
        {icons[variant]}
      </div>
      <div className="min-w-0">
        <h4 className={`text-sm font-semibold ${s.heading}`}>{title}</h4>
        <div className={`mt-1 text-sm ${s.text}`}>{children}</div>
      </div>
    </div>
  );
}
