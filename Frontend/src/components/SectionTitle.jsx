export default function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-[#2B2B2B]">{title}</h2>
      {subtitle ? <p className="mt-1 text-sm text-[#6B6B6B]">{subtitle}</p> : null}
    </div>
  );
}
