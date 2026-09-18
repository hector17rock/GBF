import Pill from "./Pill";
import { normalizeSocialConfig } from "../utils/socials";

export default function Footer({ t, socialConfig }) {
  const year = new Date().getFullYear();
  const footerNote = typeof t?.footerNote === "function" ? t.footerNote(year) : t?.footerNote;
  const socials = normalizeSocialConfig(socialConfig).socials.filter((item) => item.enabled);

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 pb-10">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#EFE7DA]/55 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-bold text-[#2B2B2B]" style={{ fontFamily: "var(--gbf-brand-font)" }}>
              Grow by Faith
              <span
                className="ml-0.5 align-super font-sans text-[0.75em] font-semibold leading-none text-[#6B6B6B]"
                aria-hidden="true"
              >
                ®
              </span>
            </div>
            <div className="mt-1 text-xs text-[#6B6B6B]">{footerNote}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {socials.map((item) => {
              const inner = item.iconSrc ? (
                <img
                  src={item.iconSrc}
                  alt={item.label}
                  className="h-4 w-4 object-contain"
                  loading="lazy"
                  decoding="async"
                  draggable={false}
                />
              ) : (
                <span className="text-xs font-semibold">{item.label}</span>
              );

              return item.url ? (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={item.label}
                  title={item.label}
                  className="inline-flex"
                >
                  <Pill>{inner}</Pill>
                </a>
              ) : (
                <span key={item.id} title={item.label} className="inline-flex">
                  <Pill>{inner}</Pill>
                </span>
              );
            })}
            <Pill>{t.navBlog}</Pill>
            <Pill>
              <img
                src="/paypallogo.png"
                alt="PayPal"
                className="h-4 w-auto object-contain"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </Pill>
          </div>
        </div>
      </div>
    </div>
  );
}
