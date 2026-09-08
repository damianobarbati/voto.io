import cx from "clsx-tw";
import type React from "react";

type SelectFieldProps = { className?: string; label: string; name?: string; onChange?: React.ChangeEventHandler<HTMLSelectElement>; options: string[]; value?: string };

export const SelectField = ({ className = "", label, name, onChange, options, value }: SelectFieldProps) => (
  <label className={cx("block font-semibold", className)}>
    {label}
    <select className={`mt-1.5 w-full rounded-app border border-slate-300 bg-white px-3 py-2.5 font-normal ${className}`} name={name} onChange={onChange} value={value}>
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  </label>
);
