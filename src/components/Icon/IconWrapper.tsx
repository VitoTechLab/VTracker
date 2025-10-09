import type { ReactNode } from "react";

interface IconWrapperProps {
  children: ReactNode;
}

export default function IconWrapper({ children }: IconWrapperProps) {
  return (
    <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[var(--border-soft)]/70 bg-[var(--surface-1)]/80 text-[var(--accent)] shadow-[0_20px_60px_-45px_rgba(57,255,20,0.7)] transition-colors duration-500 dark:bg-[var(--surface-2)]/80">
      {children}
    </div>
  );
}
