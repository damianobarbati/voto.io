import { useTranslation } from "react-i18next";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type Range = { range: string; votes: number; percentage: number };

type DemographicChartProps = { data: Range[]; title: string };

export const DemographicChart = ({ data, title }: DemographicChartProps) => {
  const { t } = useTranslation();
  return (
    <section className="rounded-app border border-slate-200 bg-white p-5">
      <h2 className="font-bold">{title}</h2>
      <div className="mt-4 h-72">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart data={data} layout="vertical">
            <XAxis dataKey="percentage" tickFormatter={(value) => `${value}%`} type="number" />
            <YAxis dataKey="range" type="category" width={70} />
            <Tooltip formatter={(value) => [`${value}%`, t("ui.turnout")] as [string, string]} />
            <Bar dataKey="percentage" radius={[0, 5, 5, 0]}>
              {data.map((item) => (
                <Cell fill="var(--color-app-primary-hover)" key={item.range} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};
