import type React from "react";

type MetricProps = { icon: React.ReactNode; label: string; value: string };

export const Metric = ({ icon, label, value }: MetricProps) => (
  <div className="rounded-app border border-app-border bg-app-surface p-5">
    <div className="flex items-center gap-2 text-app-text-muted">
      {icon}
      {label}
    </div>
    <p className="mt-2 font-bold">{value}</p>
  </div>
);
