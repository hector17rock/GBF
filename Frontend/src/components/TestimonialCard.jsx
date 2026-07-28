import { l10n } from "../utils/format";

function StarRow({ t, language }) {
  const label =
    t?.rating5StarsLabel || (language === "es" ? "5 estrellas" : "5 stars");

  return (
    <div className="flex items-center gap-1 text-[#355E3B]" aria-label={label}>
      {Array.from({ length: 5 }).map((_, idx) => (
        <svg
          key={idx}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialCard({ testimonial, language, t }) {
  const quote = l10n(testimonial?.quote, language);
  const author = l10n(testimonial?.author, language);

  return (
    <div className="rounded-[24px] border border-[#DDD6CA] bg-white p-5 shadow-sm">
      <StarRow t={t} language={language} />
      <div className="mt-3 text-sm font-semibold leading-6 text-[#2B2B2B]">“{quote}”</div>
      <div className="mt-3 text-xs font-semibold text-[#6B6B6B]">— {author}</div>
    </div>
  );
}
