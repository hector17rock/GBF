import { useState } from "react";
import Footer from "../components/Footer";
import SectionTitle from "../components/SectionTitle";

export default function Faq({ t }) {
  const items = Array.isArray(t?.faqItems) ? t.faqItems : [];

  const [openIdx, setOpenIdx] = useState(0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#F8F6F2]/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.faqTitle} subtitle={t.faqSubtitle} />

        <div className="mt-6 grid gap-2">
          {items.map((it, idx) => {
            const open = idx === openIdx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setOpenIdx(open ? -1 : idx)}
                className="rounded-[22px] border border-[#DDD6CA]/60 bg-white/55 p-5 text-left shadow-sm backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-extrabold text-[#2B2B2B]">{it.q}</div>
                  <div className="mt-0.5 text-xs font-bold text-[#6B6B6B]">{open ? "−" : "+"}</div>
                </div>
                {open ? (
                  <div className="mt-3 text-sm leading-6 text-[#6B6B6B]">{it.a}</div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}
