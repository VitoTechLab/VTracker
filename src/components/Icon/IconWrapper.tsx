import type { ReactNode } from "react";

interface IconWrapperProps {
  children: ReactNode;
}

export default function IconWrapper({ children }: IconWrapperProps) {
  return (
    <div className="grid h-12 w-12 place-items-center rounded-xl border border-[var(--border-soft)] bg-[var(--surface-1)] text-[var(--accent)] shadow-sm transition-colors duration-300 dark:bg-[var(--surface-2)]">
      {children}
    </div>
  );
}
