type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-[0.45rem] select-none ${className ?? ""}`}
      aria-label="Professional Limousine Driver"
    >
      <svg
        aria-hidden
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        className="translate-y-[2px]"
      >
        <path
          d="M12 2 L21 12 L12 22 L3 12 Z"
          stroke="currentColor"
          strokeWidth="1.2"
          fill="none"
        />
        <path
          d="M12 6 L17 12 L12 18 L7 12 Z"
          fill="currentColor"
        />
      </svg>
      <span className="font-display text-[1.02rem] sm:text-[1.18rem] leading-[0.95] tracking-[0.01em]">
        <span className="block">Professional</span>
        <span className="block">Limousine Driver</span>
      </span>
    </span>
  );
}
