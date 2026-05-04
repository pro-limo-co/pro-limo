type LogoProps = {
  className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={`inline-flex items-baseline gap-[0.35rem] select-none ${className ?? ""}`}
      aria-label="Pro Limo"
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
      <span className="font-display text-[1.45rem] leading-none tracking-[-0.01em]">
        Pro Limo
      </span>
    </span>
  );
}
