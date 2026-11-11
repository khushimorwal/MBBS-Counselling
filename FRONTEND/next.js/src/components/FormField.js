export default function FormField({ label, name, id, error, as = "input", children, ...rest }) {
  const Tag = as;
  const inputId = id || name;
  return (
    <div className="mb-4">
      <label htmlFor={inputId} className="mb-1 block text-sm font-semibold text-brand-dark">
        {label}
      </label>
      <Tag
        id={inputId}
        name={name}
        className={`w-full rounded-xl border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/20 ${
          error ? "border-red-500" : "border-line"
        }`}
        {...rest}
      >
        {children}
      </Tag>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
