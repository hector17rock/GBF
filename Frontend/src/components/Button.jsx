export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99]";

  // NOTE: Keep ghost/secondary neutral so TopBar stays unchanged.
  const styles =
    variant === "primary"
      ? "bg-[#355E3B] text-white hover:bg-[#4B734E]"
      : variant === "ghost"
      ? "bg-transparent hover:bg-zinc-100 text-zinc-900"
      : "bg-white border border-zinc-200 hover:bg-zinc-50";

  return (
    <button {...props} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
