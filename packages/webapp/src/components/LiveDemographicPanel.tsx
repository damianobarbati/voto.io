import { CityBars, type CityRow } from "#webapp/components/CityBars.tsx";
import { SplitBar } from "#webapp/components/SplitBar.tsx";
import { type DemographicRow, StackedRows } from "#webapp/components/StackedRows.tsx";

const ageRows: DemographicRow[] = [
  { label: "14–18", men: 46, women: 54 },
  { label: "19–24", men: 49, women: 51 },
  { label: "25–30", men: 44, women: 56 },
  { label: "31–40", men: 52, women: 48 },
  { label: "41–50", men: 55, women: 45 },
  { label: "51–60", men: 47, women: 53 },
  { label: "60+", men: 42, women: 58 },
];

const incomeRows: DemographicRow[] = [
  { label: "€0–10k", men: 43, women: 57 },
  { label: "€11–20k", men: 45, women: 55 },
  { label: "€21–30k", men: 48, women: 52 },
  { label: "€31–40k", men: 53, women: 47 },
  { label: "€41–50k", men: 56, women: 44 },
  { label: "€51–60k", men: 58, women: 42 },
  { label: "€61–100k", men: 61, women: 39 },
  { label: "€100k+", men: 64, women: 36 },
];

const cityRows: CityRow[] = [
  { label: "Milan", percentage: 22 },
  { label: "Rome", percentage: 16 },
  { label: "Turin", percentage: 12 },
  { label: "Naples", percentage: 9 },
  { label: "Bologna", percentage: 7 },
  { label: "Florence", percentage: 6 },
  { label: "Genoa", percentage: 5 },
  { label: "Palermo", percentage: 4 },
  { label: "Bari", percentage: 3 },
  { label: "Verona", percentage: 2 },
  { label: "Other cities", percentage: 14 },
];

export const LiveDemographicPanel = () => (
  <details className="mt-4 border-app-border-subtle border-t pt-4">
    <summary className="cursor-pointer font-bold text-app-primary">Demographic breakdown</summary>
    <div className="mt-5 space-y-6">
      <section>
        <h3 className="font-bold">Gender</h3>
        <div className="mt-2">
          <SplitBar men={48} women={52} />
        </div>
        <div className="mt-1 flex justify-between text-app-text-muted">
          <span>Men</span>
          <span>Women</span>
        </div>
      </section>
      <section>
        <h3 className="font-bold">Age</h3>
        <div className="mt-2">
          <StackedRows rows={ageRows} />
        </div>
      </section>
      <section>
        <h3 className="font-bold">Income</h3>
        <div className="mt-2">
          <StackedRows rows={incomeRows} />
        </div>
      </section>
      <section>
        <h3 className="font-bold">Geography</h3>
        <div className="mt-2">
          <CityBars rows={cityRows} />
        </div>
      </section>
    </div>
  </details>
);
