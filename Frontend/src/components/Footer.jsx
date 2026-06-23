import Pill from "./Pill";

export default function Footer({ t }) {
  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 pb-10">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-bold text-zinc-900">Grow by Faith</div>
            <div className="mt-1 text-xs text-zinc-500">{t.footerNote}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>IG</Pill>
            <Pill>TikTok</Pill>
            <Pill>Blog</Pill>
            <Pill>{t.footerWhatsAppCheckout}</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}
