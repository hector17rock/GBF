import { useMemo, useState } from "react";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";
import { normalizePoliciesConfig } from "../utils/policies";

export default function Policies({ policiesConfig, t, language }) {
  const normalized = useMemo(() => normalizePoliciesConfig(policiesConfig), [policiesConfig]);

  const published = useMemo(() => {
    const categories = Array.isArray(normalized?.categories) ? normalized.categories : [];

    return categories
      .map((c) => ({
        id: String(c?.id || "").trim(),
        name: String(c?.name || "").trim(),
        content: String(c?.content || ""),
      }))
      .filter((c) => c.id && c.name && c.content.trim());
  }, [normalized]);

  const [requestedOpenId, setRequestedOpenId] = useState(() => published[0]?.id || "");

  const openId = useMemo(() => {
    if (!requestedOpenId) return "";
    const ok = published.some((c) => c.id === requestedOpenId);
    return ok ? requestedOpenId : published[0]?.id || "";
  }, [requestedOpenId, published]);

  const subtitle =
    t?.policiesPublicSubtitle ||
    (language === "es" ? "Información importante" : "Important information");

  const emptyText =
    t?.policiesPublicEmpty ||
    (language === "es"
      ? "Aún no hay políticas publicadas."
      : "No policies have been published yet.");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#F8F6F2]/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.policiesTitle} subtitle={subtitle} />

        {published.length === 0 ? (
          <div className="mt-6 rounded-[22px] border border-[#DDD6CA]/60 bg-white/55 p-5 text-sm text-[#6B6B6B] shadow-sm backdrop-blur-xl">
            {emptyText}
          </div>
        ) : (
          <div className="mt-6 grid gap-2">
            {published.map((c) => {
              const open = c.id === openId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setRequestedOpenId(open ? "" : c.id)}
                  className="rounded-[22px] border border-[#DDD6CA]/60 bg-white/55 p-5 text-left shadow-sm backdrop-blur-xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-extrabold text-[#2B2B2B]">{c.name}</div>
                    <div className="mt-0.5 text-xs font-bold text-[#6B6B6B]">{open ? "−" : "+"}</div>
                  </div>
                  {open ? (
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#6B6B6B]">
                      {c.content}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}
