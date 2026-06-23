import { useEffect, useState } from "react";
import Button from "./Button";

export default function TopBar({ route, setRoute, cartCount, t, language, setLanguage }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const menuLabel = language === "es" ? "Menú" : "Menu";
  const openMenuLabel = language === "es" ? "Abrir menú" : "Open menu";
  const closeMenuLabel = language === "es" ? "Cerrar menú" : "Close menu";

  const go = (nextRoute) => {
    setRoute(nextRoute);
    setMenuOpen(false);
  };

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/55 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img src="/gbficon.png" alt="Grow by Faith" className="h-10 w-10 object-contain" />
          </div>
          <div className="leading-tight">
            <div
              className="text-[28px] font-normal leading-none text-[#7a6f69] md:text-[32px]"
              style={{ fontFamily: '"Allura", cursive' }}
            >
              Grow by Faith
            </div>
            <div className="mt-1 text-xs text-zinc-500">{t.tagline}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" className="p-2" onClick={() => go("cart")}>
            <span className="sr-only">{t.cart}</span>
            <span className="relative inline-flex items-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M6.5 6.5H21l-1.6 8.2a2 2 0 0 1-2 1.6H8.1a2 2 0 0 1-2-1.7L4.7 3.8A1.5 1.5 0 0 0 3.2 2.5H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  fill="currentColor"
                />
              </svg>

              {cartCount > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-extrabold leading-none text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              ) : null}
            </span>
          </Button>

          <Button
            variant="ghost"
            className="p-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="gbf-hamburger-menu"
          >
            <span className="sr-only">{menuOpen ? closeMenuLabel : openMenuLabel}</span>
            {menuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </Button>
        </div>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            aria-label={closeMenuLabel}
            onClick={() => setMenuOpen(false)}
          />

          <div
            id="gbf-hamburger-menu"
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            className="absolute right-4 top-4 w-[min(92vw,360px)] rounded-[28px] border border-zinc-200/60 bg-white/75 p-4 shadow-xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold text-zinc-900">{menuLabel}</div>
              <Button variant="ghost" className="p-2" onClick={() => setMenuOpen(false)}>
                <span className="sr-only">{closeMenuLabel}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Button>
            </div>

            <div className="mt-3 grid gap-1">
              <button
                onClick={() => go("home")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "home" ? "bg-zinc-900 text-white" : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navHome}
              </button>
              <button
                onClick={() => go("catalog")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "catalog" ? "bg-zinc-900 text-white" : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navCatalog}
              </button>
              <button
                onClick={() => go("blog")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "blog" ? "bg-zinc-900 text-white" : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navBlog}
              </button>
              <button
                onClick={() => go("about")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "about" ? "bg-zinc-900 text-white" : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navValues}
              </button>
              <button
                onClick={() => go("order_status")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "order_status" ? "bg-zinc-900 text-white" : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navOrderStatus}
              </button>
              <button
                onClick={() => go("admin")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "admin" || route === "admin_orders" || route === "admin_profit"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navAdmin}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => setLanguage(language === "es" ? "en" : "es")}>
                {language === "es" ? "EN" : "ES"}
              </Button>
              <Button variant="secondary" onClick={() => go("catalog")}>
                {t.explore}
              </Button>
              <Button variant="secondary" onClick={() => go("cart")}>
                {t.cart}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
