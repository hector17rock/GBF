export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-zinc-600">{subtitle}</p> : null}
    </div>
  );
}
