export default function Button({ loading = false, children, className = "", ...rest }) {
  return (
    <button
      {...rest}
      disabled={loading || rest.disabled}
      className={`w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#cf4a24] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
