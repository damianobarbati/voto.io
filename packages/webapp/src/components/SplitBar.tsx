type SplitBarProps = { men: number; women: number };

export const SplitBar = ({ men, women }: SplitBarProps) => (
  <div className="flex h-7 overflow-hidden rounded-app text-center font-bold text-app-text">
    <span className="flex items-center justify-center bg-app-info" style={{ width: `${men}%` }}>
      {men}%
    </span>
    <span className="flex items-center justify-center bg-app-accent" style={{ width: `${women}%` }}>
      {women}%
    </span>
  </div>
);
