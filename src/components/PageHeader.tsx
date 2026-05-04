type PageHeaderProps = {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  className?: string;
};

export function PageHeader({ eyebrow, title, subtitle, className }: PageHeaderProps) {
  return (
    <header className={`relative pt-[112px] lg:pt-[140px] pb-14 lg:pb-20 spotlight grain ${className ?? ""}`}>
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 relative z-10">
        <p className="eyebrow rise rise-1">{eyebrow}</p>
        <h1 className="display-xl mt-6 max-w-[16ch] rise rise-2">{title}</h1>
        {subtitle && (
          <p className="mt-7 max-w-2xl text-[1.05rem] leading-[1.7] text-[color:var(--color-bone-dim)] rise rise-3">
            {subtitle}
          </p>
        )}
      </div>
    </header>
  );
}
