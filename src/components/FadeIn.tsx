import { ReactNode } from "react";

export default function FadeIn({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
