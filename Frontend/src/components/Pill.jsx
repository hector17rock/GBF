export default function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-[#A8B99A]/25 px-3 py-1 text-xs font-medium text-[#2B2B2B]">
      {children}
    </span>
  );
}
