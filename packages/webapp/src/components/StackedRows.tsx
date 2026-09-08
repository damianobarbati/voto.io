import { SplitBar } from "#webapp/components/SplitBar.tsx";

export type DemographicRow = { label: string; men: number; women: number };

type StackedRowsProps = { rows: DemographicRow[] };

export const StackedRows = ({ rows }: StackedRowsProps) => (
  <div className="space-y-2">
    {rows.map((row) => (
      <div className="grid grid-cols-[4.5rem_1fr] items-center gap-2" key={row.label}>
        <span className="font-medium text-slate-600">{row.label}</span>
        <SplitBar men={row.men} women={row.women} />
      </div>
    ))}
  </div>
);
