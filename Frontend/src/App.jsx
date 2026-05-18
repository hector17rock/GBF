import React, { useEffect, useMemo, useState } from "react";

// MVP Frontend Mock (no backend)
// - Home, Catalog, Product Detail (with personalization), Cart, Checkout
// - Pure client-side state for visualization

const COLLECTIONS = [
  {
    id: "identidad",
    name: { es: "Identidad", en: "Identity" },
    desc: {
      es: "Recordar quién eres en Cristo en tu rutina diaria.",
      en: "Remember who you are in Christ in your daily routine.",
    },
  },
  {
    id: "paz",
    name: { es: "Paz", en: "Peace" },
    desc: {
      es: "Calma para el corazón: frases y versículos de descanso.",
      en: "Calm for the heart: phrases and verses for rest.",
    },
  },
  {
    id: "gratitud",
    name: { es: "Gratitud", en: "Gratitude" },
    desc: {
      es: "Un hábito simple que transforma el día.",
      en: "A simple habit that transforms your day.",
    },
  },
];

const VERSES = [
  "Jeremías 29:11",
  "Filipenses 4:6-7",
  "Salmos 23:1",
  "Proverbios 3:5-6",
  "Isaías 41:10",
];

const FONTS = [
  {
    id: "sans",
    label: { es: "Moderna", en: "Modern" },
    className: "font-sans",
  },
  {
    id: "serif",
    label: { es: "Clásica", en: "Classic" },
    className: "font-serif",
  },
  {
    id: "mono",
    label: { es: "Minimal", en: "Minimal" },
    className: "font-mono",
  },
];

const COLORS = [
  { id: "ink", label: { es: "Tinta", en: "Ink" }, swatch: "bg-zinc-900" },
  { id: "gold", label: { es: "Dorado", en: "Gold" }, swatch: "bg-amber-500" },
  {
    id: "sage",
    label: { es: "Sage", en: "Sage" },
    swatch: "bg-emerald-600",
  },
  { id: "sky", label: { es: "Cielo", en: "Sky" }, swatch: "bg-sky-600" },
  { id: "rose", label: { es: "Rosa", en: "Rose" }, swatch: "bg-rose-600" },
];

const translations = {
  es: {
    tagline: "Productos con propósito",

    navHome: "Inicio",
    navCatalog: "Catálogo",
    navBlog: "Blog",
    navValues: "Valores",
    navAdmin: "Admin",

    explore: "Explorar",
    cart: "Carrito",

    heroPill: "Evangelio para todos",
    heroTitleOne: "Productos con propósito,",
    heroTitleTwo: "fe que transforma.",
    heroText:
      "Una tienda cristiana moderna para regalos y hábitos espirituales. Personaliza tu Yeti o tu Journal con nombre, frase o versículo.",
    heroPrimary: "Personalizar ahora",
    heroSecondary: "Ver colección",

    heroFeature1Title: "Personalización",
    heroFeature1Body: "Texto, tipografía, color y versículo.",
    heroFeature2Title: "Listo para regalar",
    heroFeature2Body: "Diseños limpios y mensajes claros.",

    collectionsTitle: "Colecciones temáticas",
    collectionsSubtitle:
      "Temas actuales y desafíos espirituales para conectar con el corazón.",
    viewProducts: "Ver productos",

    featuredTitle: "Productos destacados",
    featuredSubtitle: "Arranca con dos líneas claras: Yeti y Journals.",

    stepsTitle: "Personaliza en 3 pasos",
    stepsSubtitle: "Un flujo simple que se siente como app.",
    step1Title: "Elige el producto",
    step1Desc: "Yeti o Journal según ocasión y estilo.",
    step2Title: "Personaliza",
    step2Desc: "Nombre, frase, tipografía, color y versículo.",
    step3Title: "Envía tu pedido",
    step3Desc: "Carrito + checkout. Puedes cerrar por WhatsApp.",

    mottoTitle: "Lema",
    mottoQuote: "\"Productos con propósito, fe que transforma.\"",

    quickCtaTitle: "CTA rápido",
    quickCtaBody:
      "Lanza con pre-orden y cierra por WhatsApp mientras validas demanda.",

    catalogTitle: "Catálogo",
    catalogSubtitle: "Explora por categoría y entra a personalizar.",
    all: "Todo",
    searchPlaceholder: "Buscar",

    back: "Volver",
    preview: "Vista previa",
    previewFallbackText: "Tu frase o nombre aquí",

    personalizationTitle: "Personalización",
    personalizationSubtitle:
      "Ajusta texto, tipografía y color. Esto es el corazón del MVP.",

    labelText: "Texto",
    textPlaceholder: "Ej: Hogar de la familia Rodríguez",
    textRecommendation: "Recomendación: 20–35 caracteres.",

    labelVerse: "Versículo",
    labelFont: "Tipografía",
    labelColor: "Color",

    summary: "Resumen",
    summaryText: "Texto:",
    summaryVerse: "Versículo:",
    summaryFont: "Tipografía:",
    summaryColor: "Color:",

    addToCart: "Añadir al carrito",
    continueExploring: "Seguir explorando",
    mvpNote:
      "Este MVP es solo frontend: el pedido se puede cerrar luego por WhatsApp o un formulario.",

    cartTitle: "Carrito",
    cartSubtitle: "Revisa tu pedido antes del checkout.",
    continueShopping: "Seguir comprando",
    emptyCart: "Tu carrito está vacío.",
    remove: "Eliminar",
    qty: "Cant.",
    total: "Total",
    estimatedTotal: "Este total es estimado para el MVP.",
    goToCheckout: "Ir a checkout",

    checkoutTitle: "Checkout",
    checkoutSubtitle: "Sin backend: cierre por WhatsApp o cotización.",
    yourDetails: "Tus datos",
    namePlaceholder: "Nombre",
    phonePlaceholder: "Teléfono",
    notesPlaceholder: "Notas (ej: para regalo, fecha, etc.)",
    sendWhatsApp: "Enviar por WhatsApp",
    backToCart: "Volver al carrito",
    nextStep:
      "Siguiente paso (luego): integrar pagos y órdenes reales.",
    finish: "Finalizar",

    waGreeting: "Hola, quiero hacer un pedido:",
    waTotalEstimated: "Total estimado:",
    waName: "Nombre:",
    waPhone: "Teléfono:",
    waNotes: "Notas:",
    waText: "Texto:",
    waVerse: "Versículo:",
    waFont: "Tipografía:",
    waColor: "Color:",

    blogTitle: "Blog",
    blogSubtitle:
      "Contenido de lectura corta para enganchar y nutrir a la audiencia.",
    read: "Leer",

    valuesTitle: "Valores",
    valuesSubtitle: "Nuestro fundamento",
    missionTitle: "Misión",
    missionText:
      "Compartir el amor de Cristo a través de cada producto. Que cada artículo sea una herramienta de evangelismo, esperanza y fe.",

    adminTitle: "Panel de administración",
    adminSubtitle: "Gestiona visualmente los productos de la tienda.",
    adminStatProducts: "Productos",
    adminStatProductsBody: "Artículos activos en catálogo.",
    adminStatMode: "Modo",
    adminStatModeBody: "Datos simulados en frontend.",
    adminStatManagement: "Gestión",
    adminStatManagementBody: "Próximo: añadir, editar y eliminar productos.",

    heroAdminTitle: "Promoción del Home",
    heroAdminSubtitle:
      "Edita el recuadro principal del inicio para promociones sin programador.",
    heroAdminEnabled: "Activar promoción",
    heroAdminReset: "Restablecer",
    heroAdminEs: "Español (ES)",
    heroAdminEn: "Inglés (EN)",
    heroAdminPill: "Etiqueta (pill)",
    heroAdminTitleOne: "Título línea 1",
    heroAdminTitleTwo: "Título línea 2",
    heroAdminText: "Texto",
    heroAdminPrimary: "Botón principal",
    heroAdminSecondary: "Botón secundario",
    heroAdminHeroImage: "Imagen principal",
    heroAdminImage1: "Imagen 1",
    heroAdminImage2: "Imagen 2",

    categoriesTitle: "Categorías",
    categoriesSubtitle:
      "Crea o elimina categorías disponibles para los productos.",
    deleteCategoryAria: (c) => `Eliminar categoría ${c}`,
    deleteCategoryTitleMinOne: "Debes tener al menos 1 categoría",
    deleteCategoryTitle: "Eliminar",
    newCategoryLabel: "Nueva categoría",
    newCategoryPlaceholder: "Ej: Biblias",
    addCategory: "Añadir categoría",

    addProductTitle: "Añadir producto",
    addProductSubtitle: "Crea un nuevo producto visualmente en el catálogo.",
    productNameLabel: "Nombre",
    productNamePlaceholder: "Ej: Yeti personalizado 30oz",
    productCategoryLabel: "Categoría",
    productPriceLabel: "Precio",
    productImageLabel: "Imagen URL",
    productImagePlaceholder: "https://...",
    productShortLabel: "Descripción corta",
    productShortPlaceholder: "Ej: Vaso premium con mensaje de fe.",
    productDescriptionLabel: "Descripción completa",
    productDescriptionPlaceholder:
      "Describe el producto, su propósito y detalles importantes.",
    addProduct: "Añadir producto",

    currentProductsTitle: "Productos actuales",
    currentProductsSubtitle: "Vista administrativa del catálogo.",
    edit: "Editar",
    delete: "Eliminar",

    footerNote: "MVP visual (solo frontend) para validar interés.",
    footerWhatsAppCheckout: "Checkout WhatsApp",
  },
  en: {
    tagline: "Products with purpose",

    navHome: "Home",
    navCatalog: "Catalog",
    navBlog: "Blog",
    navValues: "Values",
    navAdmin: "Admin",

    explore: "Explore",
    cart: "Cart",

    heroPill: "Gospel for everyone",
    heroTitleOne: "Products with purpose,",
    heroTitleTwo: "faith that transforms.",
    heroText:
      "A modern Christian store for meaningful gifts and spiritual habits. Customize your Yeti or Journal with a name, phrase, or verse.",
    heroPrimary: "Customize now",
    heroSecondary: "View collection",

    heroFeature1Title: "Customization",
    heroFeature1Body: "Text, typography, color, and verse.",
    heroFeature2Title: "Ready to gift",
    heroFeature2Body: "Clean designs and clear messages.",

    collectionsTitle: "Themed collections",
    collectionsSubtitle:
      "Current themes and spiritual challenges that connect with the heart.",
    viewProducts: "View products",

    featuredTitle: "Featured products",
    featuredSubtitle: "Start with two clear lines: Yeti and Journals.",

    stepsTitle: "Customize in 3 steps",
    stepsSubtitle: "A simple flow that feels like an app.",
    step1Title: "Choose the product",
    step1Desc: "Pick a Yeti or Journal based on the occasion and style.",
    step2Title: "Customize",
    step2Desc: "Name, phrase, typography, color, and verse.",
    step3Title: "Place your order",
    step3Desc: "Cart + checkout. You can finalize via WhatsApp.",

    mottoTitle: "Motto",
    mottoQuote: "\"Products with purpose, faith that transforms.\"",

    quickCtaTitle: "Quick CTA",
    quickCtaBody:
      "Launch with pre-orders and close via WhatsApp while validating demand.",

    catalogTitle: "Catalog",
    catalogSubtitle: "Browse by category and jump into customization.",
    all: "All",
    searchPlaceholder: "Search",

    back: "Back",
    preview: "Preview",
    previewFallbackText: "Your phrase or name here",

    personalizationTitle: "Customization",
    personalizationSubtitle:
      "Adjust text, typography, and color. This is the heart of the MVP.",

    labelText: "Text",
    textPlaceholder: "e.g. The Rodriguez family home",
    textRecommendation: "Recommendation: 20–35 characters.",

    labelVerse: "Verse",
    labelFont: "Typography",
    labelColor: "Color",

    summary: "Summary",
    summaryText: "Text:",
    summaryVerse: "Verse:",
    summaryFont: "Typography:",
    summaryColor: "Color:",

    addToCart: "Add to cart",
    continueExploring: "Keep browsing",
    mvpNote:
      "This MVP is frontend-only: the order can be finalized later via WhatsApp or a form.",

    cartTitle: "Cart",
    cartSubtitle: "Review your order before checkout.",
    continueShopping: "Continue shopping",
    emptyCart: "Your cart is empty.",
    remove: "Remove",
    qty: "Qty",
    total: "Total",
    estimatedTotal: "This total is estimated for the MVP.",
    goToCheckout: "Go to checkout",

    checkoutTitle: "Checkout",
    checkoutSubtitle: "No backend: finalize via WhatsApp or quote.",
    yourDetails: "Your details",
    namePlaceholder: "Name",
    phonePlaceholder: "Phone",
    notesPlaceholder: "Notes (e.g. gift, date, etc.)",
    sendWhatsApp: "Send via WhatsApp",
    backToCart: "Back to cart",
    nextStep: "Next step (later): integrate payments and real orders.",
    finish: "Finish",

    waGreeting: "Hi, I'd like to place an order:",
    waTotalEstimated: "Estimated total:",
    waName: "Name:",
    waPhone: "Phone:",
    waNotes: "Notes:",
    waText: "Text:",
    waVerse: "Verse:",
    waFont: "Typography:",
    waColor: "Color:",

    blogTitle: "Blog",
    blogSubtitle: "Short reads to attract and nurture your audience.",
    read: "Read",

    valuesTitle: "Values",
    valuesSubtitle: "Our foundation",
    missionTitle: "Mission",
    missionText:
      "Share the love of Christ through every product. May each item be a tool for evangelism, hope, and faith.",

    adminTitle: "Admin panel",
    adminSubtitle: "Visually manage the store's products.",
    adminStatProducts: "Products",
    adminStatProductsBody: "Active items in the catalog.",
    adminStatMode: "Mode",
    adminStatModeBody: "Frontend-only mock data.",
    adminStatManagement: "Management",
    adminStatManagementBody: "Next: add, edit, and delete products.",

    heroAdminTitle: "Homepage promotion",
    heroAdminSubtitle:
      "Edit the main homepage hero for promotions without needing a developer.",
    heroAdminEnabled: "Enable promotion",
    heroAdminReset: "Reset",
    heroAdminEs: "Spanish (ES)",
    heroAdminEn: "English (EN)",
    heroAdminPill: "Badge (pill)",
    heroAdminTitleOne: "Title line 1",
    heroAdminTitleTwo: "Title line 2",
    heroAdminText: "Text",
    heroAdminPrimary: "Primary button",
    heroAdminSecondary: "Secondary button",
    heroAdminHeroImage: "Main image",
    heroAdminImage1: "Image 1",
    heroAdminImage2: "Image 2",

    categoriesTitle: "Categories",
    categoriesSubtitle: "Create or remove available product categories.",
    deleteCategoryAria: (c) => `Delete category ${c}`,
    deleteCategoryTitleMinOne: "You must keep at least 1 category",
    deleteCategoryTitle: "Delete",
    newCategoryLabel: "New category",
    newCategoryPlaceholder: "e.g. Bibles",
    addCategory: "Add category",

    addProductTitle: "Add product",
    addProductSubtitle: "Create a new product visually in the catalog.",
    productNameLabel: "Name",
    productNamePlaceholder: "e.g. Custom 30oz Yeti",
    productCategoryLabel: "Category",
    productPriceLabel: "Price",
    productImageLabel: "Image URL",
    productImagePlaceholder: "https://...",
    productShortLabel: "Short description",
    productShortPlaceholder: "e.g. Premium tumbler with a faith message.",
    productDescriptionLabel: "Full description",
    productDescriptionPlaceholder:
      "Describe the product, its purpose, and important details.",
    addProduct: "Add product",

    currentProductsTitle: "Current products",
    currentProductsSubtitle: "Administrative view of the catalog.",
    edit: "Edit",
    delete: "Delete",

    footerNote: "Visual MVP (frontend-only) to validate interest.",
    footerWhatsAppCheckout: "WhatsApp Checkout",
  },
};

const HERO_STORAGE_KEY = "gbf.homeHero.v1";

const DEFAULT_HERO_IMAGES = {
  hero: "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=1400&q=80",
  product1:
    "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=1200&q=80",
  product2:
    "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
};

function buildDefaultHeroConfig() {
  return {
    enabled: false,
    pill: { es: translations.es.heroPill, en: translations.en.heroPill },
    titleOne: { es: translations.es.heroTitleOne, en: translations.en.heroTitleOne },
    titleTwo: { es: translations.es.heroTitleTwo, en: translations.en.heroTitleTwo },
    text: { es: translations.es.heroText, en: translations.en.heroText },
    primary: { es: translations.es.heroPrimary, en: translations.en.heroPrimary },
    secondary: {
      es: translations.es.heroSecondary,
      en: translations.en.heroSecondary,
    },
    images: { ...DEFAULT_HERO_IMAGES },
  };
}

function normalizeHeroConfig(input) {
  const base = buildDefaultHeroConfig();
  const cfg = input && typeof input === "object" ? input : {};
  return {
    ...base,
    ...cfg,
    pill: { ...base.pill, ...(cfg.pill || {}) },
    titleOne: { ...base.titleOne, ...(cfg.titleOne || {}) },
    titleTwo: { ...base.titleTwo, ...(cfg.titleTwo || {}) },
    text: { ...base.text, ...(cfg.text || {}) },
    primary: { ...base.primary, ...(cfg.primary || {}) },
    secondary: { ...base.secondary, ...(cfg.secondary || {}) },
    images: { ...base.images, ...(cfg.images || {}) },
  };
}

function l10n(value, language) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") return value[language] ?? value.es ?? "";
  return String(value);
}


function money(n, language = "en") {
  const locale = language === "es" ? "es-US" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

function Button({ children, onClick, variant = "primary", className = "" }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition active:scale-[0.99]";
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : variant === "ghost"
      ? "bg-transparent hover:bg-zinc-100 text-zinc-900"
      : "bg-white border border-zinc-200 hover:bg-zinc-50";
  return (
    <button onClick={onClick} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800">
      {children}
    </span>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <h2 className="text-xl font-bold text-zinc-900">{title}</h2>
      {subtitle ? (
        <p className="mt-1 text-sm text-zinc-600">{subtitle}</p>
      ) : null}
    </div>
  );
}

function TopBar({
  route,
  setRoute,
  cartCount,
  t,
  language,
  setLanguage,
}) {

  return (
    <div className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white">
            GBF
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-zinc-900">
              Grow by Faith
            </div>
            <div className="text-xs text-zinc-500">{t.tagline}</div>
          </div>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink active={route === "home"} onClick={() => setRoute("home")}>
            {t.navHome}
          </NavLink>
          <NavLink
            active={route === "catalog"}
            onClick={() => setRoute("catalog")}
          >
            {t.navCatalog}
          </NavLink>
          <NavLink active={route === "blog"} onClick={() => setRoute("blog")}>
            {t.navBlog}
          </NavLink>
          <NavLink
            active={route === "about"}
            onClick={() => setRoute("about")}
          >
            {t.navValues}
          </NavLink>

          <NavLink
            active={route === "admin"}
            onClick={() => setRoute("admin")}
          >
            {t.navAdmin}
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setRoute("catalog")}>
            {t.explore}
          </Button>
          <Button
            variant="secondary"
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
          >
            {language === "es" ? "EN" : "ES"}
          </Button>
          <Button variant="primary" onClick={() => setRoute("cart")}>
            {t.cart}
            {cartCount > 0 ? (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1 text-xs">
                {cartCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-2 md:hidden">
        <div className="grid grid-cols-5 gap-2">
          <MobileTab active={route === "home"} onClick={() => setRoute("home")}>
            {t.navHome}
          </MobileTab>
          <MobileTab
            active={route === "catalog"}
            onClick={() => setRoute("catalog")}
          >
            {t.navCatalog}
          </MobileTab>
          <MobileTab active={route === "blog"} onClick={() => setRoute("blog")}>
            {t.navBlog}
          </MobileTab>
          <MobileTab active={route === "about"} onClick={() => setRoute("about")}>
            {t.navValues}
          </MobileTab>
          <MobileTab active={route === "admin"} onClick={() => setRoute("admin")}>
            {t.navAdmin}
          </MobileTab>
        </div>
      </div>
    </div>
  );
}

function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm transition ${
        active
          ? "bg-zinc-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100"
      }`}
    >
      {children}
    </button>
  );
}

function MobileTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-3 py-2 text-xs font-semibold transition ${
        active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}


function CollectionCards({ onPick, language, t }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {COLLECTIONS.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c)}
          className="rounded-[24px] border border-zinc-200 bg-white p-5 text-left transition hover:bg-zinc-50"
        >
          <div className="text-sm font-bold text-zinc-900">
            {l10n(c.name, language)}
          </div>
          <div className="mt-2 text-sm leading-6 text-zinc-600">
            {l10n(c.desc, language)}
          </div>
          <div className="mt-4">
            <Pill>{t.viewProducts}</Pill>
          </div>
        </button>
      ))}
    </div>
  );
}

 // El Hero (Home) usando heroConfig (override + fallback) //
function Hero({ onPrimary, onSecondary, t, heroConfig, language }) {
  const enabled = Boolean(heroConfig?.enabled);

  const pillOverride = enabled ? l10n(heroConfig?.pill, language).trim() : "";
  const titleOneOverride = enabled
    ? l10n(heroConfig?.titleOne, language).trim()
    : "";
  const titleTwoOverride = enabled
    ? l10n(heroConfig?.titleTwo, language).trim()
    : "";
  const textOverride = enabled ? l10n(heroConfig?.text, language).trim() : "";
  const primaryOverride = enabled
    ? l10n(heroConfig?.primary, language).trim()
    : "";
  const secondaryOverride = enabled
    ? l10n(heroConfig?.secondary, language).trim()
    : "";

  const pillText = pillOverride || t.heroPill;
  const titleOne = titleOneOverride || t.heroTitleOne;
  const titleTwo = titleTwoOverride || t.heroTitleTwo;
  const heroText = textOverride || t.heroText;
  const primaryLabel = primaryOverride || t.heroPrimary;
  const secondaryLabel = secondaryOverride || t.heroSecondary;

  const heroImage =
    enabled && typeof heroConfig?.images?.hero === "string" && heroConfig.images.hero.trim()
      ? heroConfig.images.hero.trim()
      : DEFAULT_HERO_IMAGES.hero;

  const image1 =
    enabled &&
    typeof heroConfig?.images?.product1 === "string" &&
    heroConfig.images.product1.trim()
      ? heroConfig.images.product1.trim()
      : DEFAULT_HERO_IMAGES.product1;

  const image2 =
    enabled &&
    typeof heroConfig?.images?.product2 === "string" &&
    heroConfig.images.product2.trim()
      ? heroConfig.images.product2.trim()
      : DEFAULT_HERO_IMAGES.product2;

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white">
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative grid gap-6 p-6 md:grid-cols-2 md:p-10">
        <div>
          <Pill>{pillText}</Pill>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl">
            {titleOne}
            <span className="block">{titleTwo}</span>
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            {heroText}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={onPrimary} variant="primary">
              {primaryLabel}
            </Button>

            <Button onClick={onSecondary} variant="secondary">
              {secondaryLabel}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-zinc-600 md:max-w-md">
            <div className="rounded-2xl bg-zinc-50 p-3">
              <div className="font-semibold text-zinc-900">{t.heroFeature1Title}</div>
              <div className="mt-1">{t.heroFeature1Body}</div>
            </div>

            <div className="rounded-2xl bg-zinc-50 p-3">
              <div className="font-semibold text-zinc-900">{t.heroFeature2Title}</div>
              <div className="mt-1">{t.heroFeature2Body}</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="overflow-hidden rounded-[24px] border border-zinc-200">
            <img
              alt="hero"
              src={heroImage}
              className="h-44 w-full object-cover md:h-52"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-[24px] border border-zinc-200">
              <img
                alt="product"
                src={image1}
                className="h-36 w-full object-cover"
              />
            </div>

            <div className="overflow-hidden rounded-[24px] border border-zinc-200">
              <img
                alt="product"
                src={image2}
                className="h-36 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ p, onOpen, language }) {
  const name = l10n(p.name, language);
  const short = l10n(p.short, language);

  return (
    <button
      onClick={() => onOpen(p)}
      className="group overflow-hidden rounded-[24px] border border-zinc-200 bg-white text-left transition hover:bg-zinc-50"
    >
      <div className="overflow-hidden">
        <img
          alt={name}
          src={p.image}
          className="h-40 w-full object-cover transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-zinc-500">{p.category}</div>
            <div className="mt-1 text-sm font-bold text-zinc-900">{name}</div>
          </div>
          <div className="text-sm font-bold text-zinc-900">{money(p.price, language)}</div>
        </div>
        <div className="mt-2 text-sm text-zinc-600">{short}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.tags.map((tag, idx) => {
            const key = `${l10n(tag, "en") || l10n(tag, "es") || "tag"}-${idx}`;
            return <Pill key={key}>{l10n(tag, language)}</Pill>;
          })}
        </div>
      </div>
    </button>
  );
}

function Home({
  products,
  onGoCatalog,
  onOpenProduct,
  onPickCollection,
  t,
  language,
  heroConfig,
}) {

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Hero
        onPrimary={onGoCatalog}
        onSecondary={onGoCatalog}
        t={t}
        heroConfig={heroConfig}
        language={language}
      />

      <div className="mt-8">
        <SectionTitle title={t.collectionsTitle} subtitle={t.collectionsSubtitle} />
        <CollectionCards onPick={onPickCollection} t={t} language={language} />
      </div>

      <div className="mt-10">
        <SectionTitle title={t.featuredTitle} subtitle={t.featuredSubtitle} />
        <div className="grid gap-3 md:grid-cols-2">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={onOpenProduct} language={language} />
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle title={t.stepsTitle} subtitle={t.stepsSubtitle} />
        <div className="grid gap-4 md:grid-cols-3">
          <Step n="1" title={t.step1Title} desc={t.step1Desc} />
          <Step n="2" title={t.step2Title} desc={t.step2Desc} />
          <Step n="3" title={t.step3Title} desc={t.step3Desc} />
        </div>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6">
          <div className="text-sm font-bold text-zinc-900">{t.mottoTitle}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.mottoQuote}</p>
        </div>
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6">
          <div className="text-sm font-bold text-zinc-900">{t.quickCtaTitle}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.quickCtaBody}</p>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="rounded-[24px] bg-zinc-50 p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-bold text-white">
          {n}
        </div>
        <div className="text-sm font-bold text-zinc-900">{title}</div>
      </div>
      <div className="mt-2 text-sm leading-6 text-zinc-600">{desc}</div>
    </div>
  );
}

function Catalog({
  products = [],
  categories = [],
  onOpenProduct,
  t,
  language,
}) {
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const byCat = category === "All" ? true : p.category === category;
      const haystack = `${l10n(p.name, language)} ${l10n(p.short, language)}`.toLowerCase();
      const byQ =
        q.trim().length === 0 ? true : haystack.includes(q.trim().toLowerCase());
      return byCat && byQ;
    });
  }, [category, q, products, language]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle title={t.catalogTitle} subtitle={t.catalogSubtitle} />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={category === "All"}
              onClick={() => setCategory("All")}
            >
              {t.all}
            </FilterChip>
            {categories.map((c) => (
              <FilterChip
                key={c}
                active={category === c}
                onClick={() => setCategory(c)}
              >
                {c}
              </FilterChip>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400 md:w-72"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p} onOpen={onOpenProduct} language={language} />
        ))}
      </div>

      <Footer t={t} />
    </div>
  );
}

function FilterChip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-800"
      }`}
    >
      {children}
    </button>
  );
}

function ProductDetail({ product, onBack, onAddToCart, t, language }) {
  const [text, setText] = useState("");
  const [verse, setVerse] = useState(VERSES[1]);
  const [font, setFont] = useState(FONTS[0].id);
  const [color, setColor] = useState(COLORS[0].id);

  const fontClass = FONTS.find((f) => f.id === font)?.className ?? "font-sans";

  const colorClass =
    color === "gold"
      ? "text-amber-500"
      : color === "sage"
      ? "text-emerald-600"
      : color === "sky"
      ? "text-sky-600"
      : color === "rose"
      ? "text-rose-600"
      : "text-zinc-900";

  const personalization = {
    text: text.trim(),
    verse,
    font,
    color,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-zinc-500">
              {product.category}
            </div>
            <div className="mt-1 text-2xl font-extrabold text-zinc-900">
              {l10n(product.name, language)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBack}>
              {t.back}
            </Button>
            <div className="text-lg font-bold text-zinc-900">
              {money(product.price, language)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-[28px] border border-zinc-200">
            <div className="relative">
              <img
                alt={l10n(product.name, language)}
                src={product.image}
                className="h-80 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-[22px] bg-white/90 p-4 backdrop-blur">
                  <div className="text-xs font-semibold text-zinc-500">
                    {t.preview}
                  </div>
                  <div
                    className={`mt-1 text-base font-bold ${fontClass} ${colorClass}`}
                  >
                    {personalization.text.length > 0
                      ? personalization.text
                      : t.previewFallbackText}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    {personalization.verse}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle
              title={t.personalizationTitle}
              subtitle={t.personalizationSubtitle}
            />

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.labelText}
                </label>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t.textPlaceholder}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
                <div className="mt-1 text-xs text-zinc-500">{t.textRecommendation}</div>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.labelVerse}
                </label>
                <select
                  value={verse}
                  onChange={(e) => setVerse(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                >
                  {VERSES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.labelFont}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {FONTS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setFont(f.id)}
                      className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                        font === f.id
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      {l10n(f.label, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.labelColor}
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setColor(c.id)}
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                        color === c.id
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                      }`}
                    >
                      <span
                        className={`h-3 w-3 rounded-full ${c.swatch}`}
                      />
                      {l10n(c.label, language)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-zinc-50 p-5">
                <div className="text-sm font-bold text-zinc-900">{t.summary}</div>
                <div className="mt-2 text-sm text-zinc-700">
                  <div>
                    <span className="font-semibold">{t.summaryText}</span>{" "}
                    {personalization.text.length ? personalization.text : "—"}
                  </div>
                  <div>
                    <span className="font-semibold">{t.summaryVerse}</span> {verse}
                  </div>
                  <div>
                    <span className="font-semibold">{t.summaryFont}</span>{" "}
                    {l10n(FONTS.find((f) => f.id === font)?.label, language)}
                  </div>
                  <div>
                    <span className="font-semibold">{t.summaryColor}</span>{" "}
                    {l10n(COLORS.find((c) => c.id === color)?.label, language)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => onAddToCart(product, personalization)}
                  className="w-full md:w-auto"
                >
                  {t.addToCart}
                </Button>
                <Button variant="secondary" onClick={onBack}>
                  {t.continueExploring}
                </Button>
              </div>

              <div className="text-xs leading-5 text-zinc-500">{t.mvpNote}</div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

function Cart({ cart, onRemove, onCheckout, onBack, t, language }) {
  const total = cart.reduce((acc, it) => acc + it.price * it.qty, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle title={t.cartTitle} subtitle={t.cartSubtitle} />
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBack}>
              {t.continueShopping}
            </Button>
            <div className="text-lg font-bold text-zinc-900">{money(total, language)}</div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[24px] bg-zinc-50 p-6 text-sm text-zinc-600">
            {t.emptyCart}
          </div>
        ) : (
          <div className="grid gap-3">
            {cart.map((it) => (
              <div
                key={it.key}
                className="rounded-[24px] border border-zinc-200 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">
                      {it.category}
                    </div>
                    <div className="mt-1 text-sm font-bold text-zinc-900">
                      {l10n(it.name, language)}
                    </div>
                    <div className="mt-2 text-sm text-zinc-600">
                      {it.personalization.text ? (
                        <>
                          <span className="font-semibold">{t.summaryText}</span>{" "}
                          {it.personalization.text}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">{t.summaryText}</span> —
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      <span className="font-semibold">{t.summaryVerse}</span>{" "}
                      {it.personalization.verse}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-900">
                      {money(it.price, language)}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">
                      {t.qty}: {it.qty}
                    </div>
                    <div className="mt-3">
                      <Button variant="secondary" onClick={() => onRemove(it.key)}>
                        {t.remove}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-zinc-50 p-5">
              <div>
                <div className="text-sm font-bold text-zinc-900">{t.total}</div>
                <div className="text-sm text-zinc-600">{t.estimatedTotal}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-extrabold text-zinc-900">
                  {money(total, language)}
                </div>
                <Button variant="primary" onClick={onCheckout}>
                  {t.goToCheckout}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}

function Checkout({ cart, onBack, onDone, t, language }) {
  const total = cart.reduce((acc, it) => acc + it.price * it.qty, 0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const whatsappText = useMemo(() => {
    const lines = [];
    lines.push(t.waGreeting);
    cart.forEach((it, idx) => {
      lines.push(
        `${idx + 1}. ${l10n(it.name, language)} (${it.category}) x${it.qty} - ${money(it.price, language)}`
      );
      lines.push(`   ${t.waText} ${it.personalization.text || "—"}`);
      lines.push(`   ${t.waVerse} ${it.personalization.verse}`);
      lines.push(`   ${t.waFont} ${it.personalization.font}`);
      lines.push(`   ${t.waColor} ${it.personalization.color}`);
    });
    lines.push(`${t.waTotalEstimated} ${money(total, language)}`);
    if (name.trim()) lines.push(`${t.waName} ${name.trim()}`);
    if (phone.trim()) lines.push(`${t.waPhone} ${phone.trim()}`);
    if (notes.trim()) lines.push(`${t.waNotes} ${notes.trim()}`);
    return encodeURIComponent(lines.join("\n"));
  }, [cart, total, name, phone, notes, t, language]);

  const whatsappHref = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.checkoutTitle} subtitle={t.checkoutSubtitle} />
          <div className="text-lg font-bold text-zinc-900">{money(total, language)}</div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] bg-zinc-50 p-6">
            <div className="text-sm font-bold text-zinc-900">{t.yourDetails}</div>
            <div className="mt-4 grid gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={4}
                className="w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                {t.sendWhatsApp}
              </a>
              <Button variant="secondary" onClick={onBack}>
                {t.backToCart}
              </Button>
            </div>

            <div className="mt-3 text-xs leading-5 text-zinc-500">{t.nextStep}</div>
          </div>

          <div>
            <div className="rounded-[24px] border border-zinc-200 p-6">
              <div className="text-sm font-bold text-zinc-900">{t.summary}</div>
              <div className="mt-4 grid gap-3">
                {cart.map((it) => (
                  <div key={it.key} className="rounded-2xl bg-zinc-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">
                          {it.category}
                        </div>
                        <div className="mt-1 text-sm font-bold text-zinc-900">
                          {l10n(it.name, language)}
                        </div>
                        <div className="mt-2 text-xs text-zinc-600">
                          {t.summaryText} {it.personalization.text || "—"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryVerse} {it.personalization.verse}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-zinc-900">
                        {money(it.price, language)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-zinc-50 p-4">
                <div className="text-sm font-bold text-zinc-900">{t.total}</div>
                <div className="text-base font-extrabold text-zinc-900">
                  {money(total, language)}
                </div>
              </div>

              <div className="mt-4">
                <Button variant="primary" onClick={onDone}>
                  {t.finish}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

function Blog({ t, language }) {
  const posts = [
    {
      title: {
        es: "Cómo empezar un journal de oración",
        en: "How to start a prayer journal",
      },
      excerpt: {
        es: "Una estructura simple de 10 minutos al día para crecer en fe y constancia.",
        en: "A simple 10-minute daily structure to grow in faith and consistency.",
      },
    },
    {
      title: {
        es: "3 maneras de regalar con propósito",
        en: "3 ways to gift with purpose",
      },
      excerpt: {
        es: "Ideas para personalizar un Yeti o un journal y bendecir a alguien.",
        en: "Ideas to customize a Yeti or a journal and bless someone.",
      },
    },
    {
      title: {
        es: "Identidad: cuando te sientes inestable",
        en: "Identity: when you feel unstable",
      },
      excerpt: {
        es: "Una lectura corta para recordar quién eres y cómo volver a la calma.",
        en: "A short read to remember who you are and how to return to calm.",
      },
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle title={t.blogTitle} subtitle={t.blogSubtitle} />
        <div className="grid gap-3 md:grid-cols-3">
          {posts.map((p, idx) => (
            <div
              key={`${l10n(p.title, "en") || l10n(p.title, "es")}-${idx}`}
              className="rounded-[24px] border border-zinc-200 bg-white p-5"
            >
              <div className="text-sm font-bold text-zinc-900">
                {l10n(p.title, language)}
              </div>
              <div className="mt-2 text-sm leading-6 text-zinc-600">
                {l10n(p.excerpt, language)}
              </div>
              <div className="mt-4">
                <Pill>{t.read}</Pill>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

function About({ t, language }) {
  const values = [
    {
      title: { es: "Fe", en: "Faith" },
      desc: {
        es: "Todo lo que hacemos está fundamentado en la Palabra.",
        en: "Everything we do is grounded in the Word.",
      },
    },
    {
      title: { es: "Integridad", en: "Integrity" },
      desc: {
        es: "Operamos con transparencia, honestidad y responsabilidad.",
        en: "We operate with transparency, honesty, and accountability.",
      },
    },
    {
      title: { es: "Servicio", en: "Service" },
      desc: { es: "Servimos con amor y excelencia.", en: "We serve with love and excellence." },
    },
    {
      title: { es: "Esperanza", en: "Hope" },
      desc: {
        es: "Promovemos mensajes que edifican y transforman vidas.",
        en: "We promote messages that build up and transform lives.",
      },
    },
    {
      title: { es: "Comunidad", en: "Community" },
      desc: {
        es: "Fomentamos unidad entre creyentes y quienes buscan.",
        en: "We foster unity among believers and seekers.",
      },
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle title={t.valuesTitle} subtitle={t.valuesSubtitle} />
        <div className="grid gap-3 md:grid-cols-2">
          {values.map((v, idx) => (
            <div
              key={`${l10n(v.title, "en") || l10n(v.title, "es")}-${idx}`}
              className="rounded-[24px] border border-zinc-200 bg-white p-5"
            >
              <div className="text-sm font-bold text-zinc-900">
                {l10n(v.title, language)}
              </div>
              <div className="mt-2 text-sm leading-6 text-zinc-600">
                {l10n(v.desc, language)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[24px] bg-zinc-50 p-6">
          <div className="text-sm font-bold text-zinc-900">{t.missionTitle}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.missionText}</p>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

 // La sección nueva del Admin (inputs que modifican heroConfig) //
function AdminPanel({
  products = [],
  setProducts,
  categories = [],
  setCategories,
  heroConfig,
  setHeroConfig,
  t,
  language,
}) {
  const fallbackCategory = categories[0] ?? "Yeti";

  const [newCategory, setNewCategory] = useState("");
  
  function setHeroEnabled(enabled) {
    setHeroConfig((prev) => ({ ...normalizeHeroConfig(prev), enabled }));
  }

  function setHeroTextField(field, lang, value) {
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      [field]: {
        ...(prev?.[field] || {}),
        [lang]: value,
      },
    }));
  }

  function setHeroImageField(field, value) {
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      images: {
        ...(prev?.images || {}),
        [field]: value,
      },
    }));
  }

  function resetHero() {
    setHeroConfig(buildDefaultHeroConfig());
  }

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: fallbackCategory,
    price: "",
    short: "",
    description: "",
    image: "",
  });

  function handleAddCategory(e) {
    e.preventDefault();

    const candidate = newCategory.trim();
    if (!candidate) return;

    const exists = categories.some(
      (c) => c.trim().toLowerCase() === candidate.toLowerCase()
    );
    if (exists) {
      setNewCategory("");
      return;
    }

    setCategories((prev) => [...prev, candidate]);

    // If there were no categories yet, make sure the product form uses this one.
    if (categories.length === 0) {
      setNewProduct((prev) => ({ ...prev, category: candidate }));
    }

    setNewCategory("");
  }

  function handleDeleteCategory(categoryToDelete) {
    if (categories.length <= 1) return;

    const nextCategories = categories.filter((c) => c !== categoryToDelete);
    const nextFallback = nextCategories[0] ?? "Yeti";

    setCategories(nextCategories);

    // Re-assign any products using the deleted category.
    setProducts((prev) =>
      prev.map((p) =>
        p.category === categoryToDelete ? { ...p, category: nextFallback } : p
      )
    );

    // Keep the form in a valid category.
    setNewProduct((prev) => ({
      ...prev,
      category: prev.category === categoryToDelete ? nextFallback : prev.category,
    }));
  }

  function handleNewProductChange(e) {
    const { name, value } = e.target;

    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleAddProduct(e) {
    e.preventDefault();

    const productToAdd = {
      id: crypto.randomUUID(),
      category: newProduct.category,
      name: { es: newProduct.name, en: newProduct.name },
      price: Number(newProduct.price),
      short: { es: newProduct.short, en: newProduct.short },
      description: { es: newProduct.description, en: newProduct.description },
      image:
        newProduct.image ||
        "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=1200&q=80",
      tags: [
        { es: "Nuevo", en: "New" },
        { es: "Personalizable", en: "Customizable" },
      ],
    };

    setProducts((prev) => [...prev, productToAdd]);

    setNewProduct({
      name: "",
      category: categories[0] ?? "Yeti",
      price: "",
      short: "",
      description: "",
      image: "",
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle title={t.adminTitle} subtitle={t.adminSubtitle} />

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[24px] bg-zinc-50 p-5">
            <div className="text-sm font-bold text-zinc-900">{t.adminStatProducts}</div>

            <div className="mt-2 text-3xl font-extrabold text-zinc-900">
              {products.length}
            </div>

            <p className="mt-1 text-sm text-zinc-600">{t.adminStatProductsBody}</p>
          </div>

          <div className="rounded-[24px] bg-zinc-50 p-5">
            <div className="text-sm font-bold text-zinc-900">{t.adminStatMode}</div>

            <div className="mt-2 text-3xl font-extrabold text-zinc-900">
              MVP
            </div>

            <p className="mt-1 text-sm text-zinc-600">{t.adminStatModeBody}</p>
          </div>

          <div className="rounded-[24px] bg-zinc-50 p-5">
            <div className="text-sm font-bold text-zinc-900">{t.adminStatManagement}</div>

            <div className="mt-2 text-3xl font-extrabold text-zinc-900">
              CRUD
            </div>

            <p className="mt-1 text-sm text-zinc-600">{t.adminStatManagementBody}</p>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-zinc-200 p-5">
          <SectionTitle title={t.heroAdminTitle} subtitle={t.heroAdminSubtitle} />

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900">
              <input
                type="checkbox"
                checked={Boolean(heroConfig?.enabled)}
                onChange={(e) => setHeroEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              {t.heroAdminEnabled}
            </label>

            <Button variant="secondary" onClick={resetHero}>
              {t.heroAdminReset}
            </Button>
          </div>

          <div className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminPill} — {t.heroAdminEs}
                </label>
                <input
                  value={heroConfig?.pill?.es ?? ""}
                  onChange={(e) => setHeroTextField("pill", "es", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminPill} — {t.heroAdminEn}
                </label>
                <input
                  value={heroConfig?.pill?.en ?? ""}
                  onChange={(e) => setHeroTextField("pill", "en", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminTitleOne} — {t.heroAdminEs}
                </label>
                <input
                  value={heroConfig?.titleOne?.es ?? ""}
                  onChange={(e) =>
                    setHeroTextField("titleOne", "es", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminTitleOne} — {t.heroAdminEn}
                </label>
                <input
                  value={heroConfig?.titleOne?.en ?? ""}
                  onChange={(e) =>
                    setHeroTextField("titleOne", "en", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminTitleTwo} — {t.heroAdminEs}
                </label>
                <input
                  value={heroConfig?.titleTwo?.es ?? ""}
                  onChange={(e) =>
                    setHeroTextField("titleTwo", "es", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminTitleTwo} — {t.heroAdminEn}
                </label>
                <input
                  value={heroConfig?.titleTwo?.en ?? ""}
                  onChange={(e) =>
                    setHeroTextField("titleTwo", "en", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminText} — {t.heroAdminEs}
                </label>
                <textarea
                  value={heroConfig?.text?.es ?? ""}
                  onChange={(e) => setHeroTextField("text", "es", e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminText} — {t.heroAdminEn}
                </label>
                <textarea
                  value={heroConfig?.text?.en ?? ""}
                  onChange={(e) => setHeroTextField("text", "en", e.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminPrimary} — {t.heroAdminEs}
                </label>
                <input
                  value={heroConfig?.primary?.es ?? ""}
                  onChange={(e) =>
                    setHeroTextField("primary", "es", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminPrimary} — {t.heroAdminEn}
                </label>
                <input
                  value={heroConfig?.primary?.en ?? ""}
                  onChange={(e) =>
                    setHeroTextField("primary", "en", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminSecondary} — {t.heroAdminEs}
                </label>
                <input
                  value={heroConfig?.secondary?.es ?? ""}
                  onChange={(e) =>
                    setHeroTextField("secondary", "es", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminSecondary} — {t.heroAdminEn}
                </label>
                <input
                  value={heroConfig?.secondary?.en ?? ""}
                  onChange={(e) =>
                    setHeroTextField("secondary", "en", e.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminHeroImage}
                </label>
                <input
                  value={heroConfig?.images?.hero ?? ""}
                  onChange={(e) => setHeroImageField("hero", e.target.value)}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminImage1}
                </label>
                <input
                  value={heroConfig?.images?.product1 ?? ""}
                  onChange={(e) => setHeroImageField("product1", e.target.value)}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.heroAdminImage2}
                </label>
                <input
                  value={heroConfig?.images?.product2 ?? ""}
                  onChange={(e) => setHeroImageField("product2", e.target.value)}
                  placeholder="https://..."
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-zinc-200 p-5">
          <SectionTitle title={t.categoriesTitle} subtitle={t.categoriesSubtitle} />

          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-2 text-sm font-semibold text-zinc-800"
              >
                {c}
                <button
                  type="button"
                  onClick={() => handleDeleteCategory(c)}
                  disabled={categories.length <= 1}
                  className="rounded-full px-2 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={t.deleteCategoryAria(c)}
                  title={
                    categories.length <= 1
                      ? t.deleteCategoryTitleMinOne
                      : t.deleteCategoryTitle
                  }
                >
                  ✕
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddCategory} className="mt-4 flex flex-col gap-2 md:flex-row md:items-end">
            <div className="flex-1">
              <label className="text-sm font-semibold text-zinc-900">
                {t.newCategoryLabel}
              </label>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={t.newCategoryPlaceholder}
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>
            <Button variant="secondary" className="md:mb-[2px]">
              {t.addCategory}
            </Button>
          </form>
        </div>

        <div className="mt-8 rounded-[24px] border border-zinc-200 p-5">
          <SectionTitle title={t.addProductTitle} subtitle={t.addProductSubtitle} />

          <form onSubmit={handleAddProduct} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.productNameLabel}
                </label>
                <input
                  name="name"
                  value={newProduct.name}
                  onChange={handleNewProductChange}
                  placeholder={t.productNamePlaceholder}
                  required
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.productCategoryLabel}
                </label>
                <select
                  name="category"
                  value={newProduct.category}
                  onChange={handleNewProductChange}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.productPriceLabel}
                </label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newProduct.price}
                  onChange={handleNewProductChange}
                  placeholder={language === "es" ? "Ej: 35" : "e.g. 35"}
                  required
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  {t.productImageLabel}
                </label>
                <input
                  name="image"
                  value={newProduct.image}
                  onChange={handleNewProductChange}
                  placeholder={t.productImagePlaceholder}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-900">
                {t.productShortLabel}
              </label>
              <input
                name="short"
                value={newProduct.short}
                onChange={handleNewProductChange}
                placeholder={t.productShortPlaceholder}
                required
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-zinc-900">
                {t.productDescriptionLabel}
              </label>
              <textarea
                name="description"
                value={newProduct.description}
                onChange={handleNewProductChange}
                placeholder={t.productDescriptionPlaceholder}
                rows={4}
                required
                className="mt-2 w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div className="flex justify-end">
              <Button variant="primary">
                {t.addProduct}
              </Button>
            </div>
          </form>
        </div>

        <div className="mt-8">
          <SectionTitle
            title={t.currentProductsTitle}
            subtitle={t.currentProductsSubtitle}
          />

          <div className="grid gap-3">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-[24px] border border-zinc-200 p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                  <div className="flex items-center gap-4">
                    <img
                      src={product.image}
                      alt={l10n(product.name, language)}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />

                    <div>
                      <div className="text-xs font-semibold text-zinc-500">
                        {product.category}
                      </div>

                      <div className="text-sm font-bold text-zinc-900">
                        {l10n(product.name, language)}
                      </div>

                      <div className="mt-1 text-sm text-zinc-600">
                        {l10n(product.short, language)}
                      </div>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <div className="text-sm font-bold text-zinc-900">
                      {money(product.price, language)}
                    </div>

                    <div className="mt-2 flex gap-2 md:justify-end">
                      <Button variant="secondary">
                        {t.edit}
                      </Button>

                      <Button variant="secondary">{t.delete}</Button>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

function Footer({ t }) {
  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 pb-10">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6">
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

 // Persistencia en localStorage + pasar props a Home/Admin //
export default function App() {
  const [route, setRoute] = useState("home");

  const [language, setLanguage] = useState("es");

  const t = translations[language];

  const [heroConfig, setHeroConfig] = useState(() => {
    if (typeof window === "undefined") return buildDefaultHeroConfig();
    try {
      const raw = window.localStorage.getItem(HERO_STORAGE_KEY);
      if (!raw) return buildDefaultHeroConfig();
      return normalizeHeroConfig(JSON.parse(raw));
    } catch {
      return buildDefaultHeroConfig();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(heroConfig));
    } catch {
      // ignore storage errors
    }
  }, [heroConfig]);

  const [categories, setCategories] = useState(["Yeti", "Journals"]);

  const [products, setProducts] = useState([
    {
      id: "yeti-20",
      category: "Yeti",
      name: { es: "Yeti Rambler 20oz", en: "Yeti Rambler 20oz" },
      price: 40,
      short: {
        es: "Vaso premium para regalos con propósito.",
        en: "Premium tumbler for meaningful gifts.",
      },
      description: {
        es: "Un vaso resistente para el día a día. Personalízalo con nombre, frase o versículo y conviértelo en un regalo memorable.",
        en: "A durable tumbler for everyday life. Customize it with a name, phrase, or verse and turn it into a memorable gift.",
      },
      image:
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80",
      tags: [
        { es: "Regalo", en: "Gift" },
        { es: "Premium", en: "Premium" },
        { es: "Personalizable", en: "Customizable" },
      ],
    },
    {
      id: "journal-1",
      category: "Journals",
      name: { es: "Libreta Journal (A5)", en: "Journal notebook (A5)" },
      price: 26,
      short: { es: "Journaling y devocional diario.", en: "Journaling and daily devotional." },
      description: {
        es: "Una libreta para escribir, orar y reflexionar. Perfecta para rutinas de fe, metas y gratitud.",
        en: "A notebook to write, pray, and reflect. Perfect for faith routines, goals, and gratitude.",
      },
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
      tags: [
        { es: "Devocional", en: "Devotional" },
        { es: "Hábitos", en: "Habits" },
        { es: "Regalo", en: "Gift" },
      ],
    },
  ]);

  const [selected, setSelected] = useState(null);
  const [cart, setCart] = useState([]);

  const cartCount = cart.reduce((acc, it) => acc + it.qty, 0);

  function openProduct(p) {
    setSelected(p);
    setRoute("product");
  }

  function addToCart(product, personalization) {
    const key = `${product.id}-${personalization.text}-${personalization.verse}-${personalization.font}-${personalization.color}`;
    setCart((prev) => {
      const found = prev.find((x) => x.key === key);
      if (found) {
        return prev.map((x) => (x.key === key ? { ...x, qty: x.qty + 1 } : x));
      }
      return [
        ...prev,
        {
          key,
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          qty: 1,
          personalization,
        },
      ];
    });
    setRoute("cart");
  }

  function removeFromCart(key) {
    setCart((prev) => prev.filter((x) => x.key !== key));
  }

  function pickCollection() {
    setRoute("catalog");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <TopBar
        route={route}
        setRoute={setRoute}
        cartCount={cartCount}
        t={t}
        language={language}
        setLanguage={setLanguage}
      />

      {route === "home" ? (
        <Home
          products={products}
          t={t}
          language={language}
          heroConfig={heroConfig}
          onGoCatalog={() => setRoute("catalog")}
          onOpenProduct={openProduct}
          onPickCollection={pickCollection}
        />
      ) : null}

      {route === "catalog" ? (
        <Catalog
          products={products}
          categories={categories}
          onOpenProduct={openProduct}
          t={t}
          language={language}
        />
      ) : null}

      {route === "product" && selected ? (
        <ProductDetail
          product={selected}
          onBack={() => setRoute("catalog")}
          onAddToCart={addToCart}
          t={t}
          language={language}
        />
      ) : null}

      {route === "cart" ? (
        <Cart
          cart={cart}
          onRemove={removeFromCart}
          onCheckout={() => setRoute("checkout")}
          onBack={() => setRoute("catalog")}
          t={t}
          language={language}
        />
      ) : null}

      {route === "checkout" ? (
        <Checkout
          cart={cart}
          onBack={() => setRoute("cart")}
          onDone={() => {
            setCart([]);
            setRoute("home");
          }}
          t={t}
          language={language}
        />
      ) : null}

      {route === "blog" ? <Blog t={t} language={language} /> : null}
      {route === "about" ? <About t={t} language={language} /> : null}
      {route === "admin" ? (
        <AdminPanel
          products={products}
          setProducts={setProducts}
          categories={categories}
          setCategories={setCategories}
          heroConfig={heroConfig}
          setHeroConfig={setHeroConfig}
          t={t}
          language={language}
        />
      ) : null}

      <div className="pb-10" />
    </div>
  );
}
