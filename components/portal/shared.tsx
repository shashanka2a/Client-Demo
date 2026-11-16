import { CheckCircle2 } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

export function Card({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...rest} className={`bg-card rounded-2xl border border-white/8 ${className}`}>
      {children}
    </div>
  );
}

export function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold tracking-widest uppercase text-[#FF6633] mb-4">
      {label}
    </p>
  );
}

export function StatusPill({ status }: { status: "Active" | "Paused" | "Completed" }) {
  const config = {
    Active: { bg: "bg-[#34C759]/15", text: "text-[#34C759]", dot: "bg-[#34C759]" },
    Paused: { bg: "bg-[#FF9500]/15", text: "text-[#FF9500]", dot: "bg-[#FF9500]" },
    Completed: { bg: "bg-[#5856D6]/15", text: "text-[#5856D6]", dot: "bg-[#5856D6]" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "High" | "Critical" }) {
  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
      priority === "Critical"
        ? "bg-[#FF3B30]/15 text-[#FF3B30]"
        : "bg-[#FF9500]/15 text-[#FF9500]"
    }`}>
      {priority}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const value = status.toLowerCase();
  const styles =
    value === "resolved" || value === "closed"
      ? "bg-[#34C759]/15 text-[#34C759]"
      : value.includes("progress")
        ? "bg-[#5856D6]/15 text-[#5856D6]"
        : "bg-white/8 text-white/60";

  return (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${styles}`}>
      {status}
    </span>
  );
}

export function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <p className="text-xs font-semibold tracking-wide text-[#FF6633] uppercase mb-0.5">{label}</p>
      <p className={`text-sm text-white/90 whitespace-pre-line leading-relaxed ${mono ? "font-mono text-xs" : ""}`}>
        {value}
      </p>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 py-3 px-3 rounded-xl bg-[#34C759]/8 border border-[#34C759]/20">
      <CheckCircle2 size={16} className="text-[#34C759] flex-shrink-0" />
      <p className="text-sm text-[#34C759]/90">{message}</p>
    </div>
  );
}
