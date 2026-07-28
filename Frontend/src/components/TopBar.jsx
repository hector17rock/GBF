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

  const menuLabel = t.menu;
  const openMenuLabel = t.openMenu;
  const closeMenuLabel = t.closeMenu;

  const go = (nextRoute) => {
    setMenuOpen(false);

    // Let the menu close render first, then navigate.
    window.requestAnimationFrame(() => {
      setRoute(nextRoute);
    });
  };

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/55 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img src="/gbficon.png" alt="Grow by Faith®" className="h-10 w-10 object-contain" />
          </div>
          <div className="leading-tight">
            <div
              className="text-[28px] font-normal leading-none text-[#7a6f69] md:text-[32px]"
              style={{ fontFamily: '"Allura", cursive' }}
            >
              Grow by Faith
              <span
                className="ml-0.5 align-super font-sans text-[0.55em] font-semibold leading-none text-zinc-500"
                aria-hidden="true"
              >
                ®
              </span>
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
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px] gbfMenuOverlayIn"
            aria-label={closeMenuLabel}
            onClick={() => setMenuOpen(false)}
          />

          <div
            id="gbf-hamburger-menu"
            role="dialog"
            aria-modal="true"
            aria-label={menuLabel}
            className="absolute right-4 top-4 w-[min(92vw,360px)] rounded-[28px] border border-zinc-200/60 bg-white/75 p-4 shadow-xl backdrop-blur-xl gbfMenuPanelIn"
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
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "home"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "40ms" }}
              >
                {t.navHome}
              </button>
              <button
                onClick={() => go("catalog")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "catalog"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "70ms" }}
              >
                {t.navCatalog}
              </button>
              <button
                onClick={() => go("wishlist")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "wishlist"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "100ms" }}
              >
                {t.navWishlist}
              </button>
              <button
                onClick={() => go("blog")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "blog"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "130ms" }}
              >
                {t.navBlog}
              </button>
              <button
                onClick={() => go("about")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "about"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "160ms" }}
              >
                {t.navValues}
              </button>
              <button
                onClick={() => go("faq")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "faq"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "190ms" }}
              >
                {t.navFaq}
              </button>
              <button
                onClick={() => go("policies")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "policies"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "220ms" }}
              >
                {t.navPolicies}
              </button>
              <button
                onClick={() => go("order_status")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "order_status"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "250ms" }}
              >
                {t.navOrderStatus}
              </button>
              <button
                onClick={() => go("admin")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition-all duration-200 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#355E3B]/30 ${
                  route === "admin" ||
                  route === "admin_orders" ||
                  route === "admin_profit" ||
                  route === "admin_inventory" ||
                  route === "admin_products" ||
                  route === "admin_homepage" ||
                  route === "admin_product_preview" ||
                  route === "admin_login" ||
                  route === "admin_users"
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-800 hover:bg-zinc-100 hover:shadow-sm hover:-translate-y-[1px]"
                } gbfMenuItemIn`}
                style={{ animationDelay: "280ms" }}
              >
                {t.navAdmin}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 gbfMenuItemIn" style={{ animationDelay: "320ms" }}>
              <Button variant="secondary" onClick={() => setLanguage(language === "es" ? "en" : "es")}>
                {language === "es" ? "EN" : "ES"}
              </Button>
            </div>
          </div>

          <style>{`
            @keyframes gbfMenuFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes gbfMenuPanelIn {
              from { opacity: 0; transform: translate3d(0, -10px, 0) scale(0.98); }
              to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
            }
            @keyframes gbfMenuItemIn {
              from { opacity: 0; transform: translate3d(10px, 0, 0); }
              to { opacity: 1; transform: translate3d(0, 0, 0); }
            }
            .gbfMenuOverlayIn { animation: gbfMenuFadeIn 160ms ease-out both; }
            .gbfMenuPanelIn { animation: gbfMenuPanelIn 210ms cubic-bezier(0.22, 1, 0.36, 1) both; }
            .gbfMenuItemIn { animation: gbfMenuItemIn 260ms cubic-bezier(0.22, 1, 0.36, 1) both; }
            @media (prefers-reduced-motion: reduce) {
              .gbfMenuOverlayIn, .gbfMenuPanelIn, .gbfMenuItemIn { animation: none !important; }
            }
          `}</style>
        </div>
      ) : null}
    </div>
  );
}

function DesktopNavButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm font-semibold transition ${
        active ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}
