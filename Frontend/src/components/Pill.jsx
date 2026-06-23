export default function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800">
      {children}
    </span>
  );
}
