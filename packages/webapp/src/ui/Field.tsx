type FieldProps = { label: string; name?: string; placeholder?: string; required?: boolean; textarea?: boolean; type?: string };

export const Field = ({ label, name, placeholder, required = false, textarea = false, type = "text" }: FieldProps) => (
  <label className="block font-semibold">
    {label}
    {textarea ? (
      <textarea className="mt-1.5 min-h-28 w-full rounded-app border border-slate-300 bg-white px-3 py-2.5 font-normal" name={name} placeholder={placeholder} required={required} />
    ) : (
      <input className="mt-1.5 w-full rounded-app border border-slate-300 bg-white px-3 py-2.5 font-normal" name={name} placeholder={placeholder} required={required} type={type} />
    )}
  </label>
);
