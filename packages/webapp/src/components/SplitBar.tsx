type SplitBarProps = { men: number; women: number };

export const SplitBar = ({ men, women }: SplitBarProps) => (
  <div className="flex h-7 overflow-hidden rounded-app text-center font-bold text-slate-900">
    <span className="flex items-center justify-center bg-sky-300" style={{ width: `${men}%` }}>
      {men}%
    </span>
    <span className="flex items-center justify-center bg-pink-400" style={{ width: `${women}%` }}>
      {women}%
    </span>
  </div>
);
