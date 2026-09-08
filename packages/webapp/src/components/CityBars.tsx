export type CityRow = { label: string; percentage: number };

type CityBarsProps = { rows: CityRow[] };

export const CityBars = ({ rows }: CityBarsProps) => (
  <div className="space-y-2">
    {rows.map((row) => (
      <div className="grid grid-cols-[4.5rem_1fr_2rem] items-center gap-2" key={row.label}>
        <span className="truncate font-medium text-app-text-muted">{row.label}</span>
        <div className="h-5 overflow-hidden rounded-app bg-app-subtle">
          <div className="h-full rounded-app bg-app-primary" style={{ width: `${row.percentage}%` }} />
        </div>
        <span className="text-right font-bold">{row.percentage}%</span>
      </div>
    ))}
  </div>
);
