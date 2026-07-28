import Pill from "./Pill";

export default function Footer({ t }) {
  const year = new Date().getFullYear();
  const footerNote = typeof t?.footerNote === "function" ? t.footerNote(year) : t?.footerNote;

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 pb-10">
      <div className="rounded-[28px] border border-[#DDD6CA]/60 bg-[#EFE7DA]/55 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-bold text-[#2B2B2B]">
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
            <Pill>
              <img
                src="/Instagram_icon.png"
                alt="Instagram"
                className="h-4 w-4 object-contain"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </Pill>
            <Pill>
              <img
                src="/tiktok-icon.png"
                alt="TikTok"
                className="h-4 w-4 object-contain"
                loading="lazy"
                decoding="async"
                draggable={false}
              />
            </Pill>
            <Pill>Blog</Pill>
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
