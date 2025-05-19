import type { ReactNode } from "react";

interface IconWrapperProps {
  children: ReactNode;
}

export default function IconWrapper({ children }: IconWrapperProps) {
  return (
    <div className="bg-white rounded-full p-2 shadow-md flex items-center justify-center">
      {children}
    </div>
  );
}
