import React, { useEffect, useMemo, useState } from "react";

// =====================================================
// App.jsx (single-file MVP) — Sections & Functions Index
// =====================================================
// Data/constants: COLLECTIONS, VERSES, FONTS, COLORS
// i18n: translations (es/en)
// localStorage: *_STORAGE_KEY
// Helpers: buildDefaultHeroConfig, normalizeHeroConfig, l10n, money
// UI components: Button, Pill, SectionTitle, Stat, TopBar, NavLink, MobileTab
// Home components: CollectionCards, Hero, ProductCard, Step
// Pages: Home, Catalog, ProductDetail, Cart, Checkout, Blog, About, AdminPanel
// Root: App

// -----------------------------
// Data: COLLECTIONS / VERSES / FONTS / COLORS
// -----------------------------
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

// -----------------------------
// i18n: translations (ES/EN)
// -----------------------------
const translations = {
  es: {
    tagline: "Productos con propósito",

    navHome: "Inicio",
    navCatalog: "Catálogo",
    navBlog: "Blog",
    navValues: "Valores",
    navOrderStatus: "Estatus de Orden",
    navAdmin: "Admin",

    explore: "Explorar",
    cart: "Carrito",

    orderFlowProgress: (current, total) => `Paso ${current} de ${total}`,
    orderFlowStepCart: "Carrito",
    orderFlowStepCheckout: "Checkout",
    orderFlowStepReview: "Revisar y someter",

    adminProfitCardBody: "Ver reportes de ganancias y pérdidas.",

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

    heroCountdownEndsIn: "Termina en",
    heroCountdownDays: (n) => `${n} ${n === 1 ? "día" : "días"}`,

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
    step3Desc: "Carrito + checkout con tarjeta.",

    mottoTitle: "Lema",
    mottoQuote: "\"Productos con propósito, fe que transforma.\"",

    quickCtaTitle: "CTA rápido",
    quickCtaBody:
      "Lanza con pre-orden y cobra con tarjeta mientras validas demanda.",

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
      "Este MVP es solo frontend: luego integraremos pago con tarjeta (Stripe) y órdenes reales.",

    cartTitle: "Carrito",
    cartSubtitle: "Revisa tu pedido antes del checkout.",
    continueShopping: "Seguir comprando",
    emptyCart: "Tu carrito está vacío.",
    remove: "Eliminar",
    qty: "Cant.",
    total: "Total",
    estimatedTotal: "Este total es estimado para el MVP.",
    goToCheckout: "Ir a checkout",

    taxPrState: "IVU estatal (PR)",
    taxPrMunicipal: "IVU municipal (PR)",
    taxPrTotal: "IVU total (PR)",

    checkoutSubtotal: "Subtotal",
    checkoutTaxPr: "IVU (PR)",
    checkoutTaxStateLabel: "Estatal",
    checkoutTaxMunicipalLabel: "Municipal",
    checkoutTaxRateLabel: "Tasa (%)",
    checkoutShippingFee: "Costo de envío",
    checkoutGrandTotal: "Total",
    checkoutEditTaxesShippingHint:
      "El IVU y el envío se calculan automáticamente.",

    checkoutTitle: "Checkout",
    checkoutSubtitle: "Pago con tarjeta (Stripe) — demo frontend, sin backend todavía.",
    yourDetails: "Tus datos",
    namePlaceholder: "Nombre",
    phonePlaceholder: "Teléfono",
    notesPlaceholder: "Notas (ej: para regalo, fecha, etc.)",

    checkoutPaymentTitle: "Pago",
    checkoutPaymentSubtitle:
      "Pronto: pagos con tarjeta (Stripe) y PayPal. Demo UI por ahora.",
    paymentMethod: "Método de pago",
    payByPayPal: "PayPal",
    payByWhatsApp: "PayPal",
    payByCard: "Tarjeta (Stripe)",
    payPalDisclaimer: "PayPal (próximamente) — demo frontend.",
    checkoutContinueToReview: "Continuar a revisión",

    cardAcceptedLabel: "Tarjetas aceptadas",
    cardTypeLabel: "Tipo de tarjeta",
    cardTypeUnknown: "No identificada",
    cardTypeVisa: "Visa",
    cardTypeMastercard: "Mastercard",
    cardTypeAmex: "American Express",
    cardTypeDiscover: "Discover",

    cardDisclaimer: "Demo frontend — no se procesa el pago todavía.",
    cardNameLabel: "Nombre en la tarjeta",
    cardNamePlaceholder: "Nombre y apellido",
    cardNumberLabel: "Número de tarjeta",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    cardExpiryLabel: "Expiración (MM/AA)",
    cardExpiryPlaceholder: "MM/AA",
    cardCvcLabel: "CVC",
    cardCvcPlaceholder: "123",
    cardZipLabel: "ZIP / Postal",
    cardZipPlaceholder: "12345",
    payNow: "Pagar ahora",
    checkoutReviewTitle: "Revisar tu orden",
    checkoutReviewSubtitle: "Confirma los detalles antes de someter la orden.",
    checkoutEditDetails: "Editar datos",
    checkoutSubmitOrder: "Someter orden",
    checkoutDetailsRequired: "Completa nombre, teléfono y dirección de envío.",
    checkoutOrderSubmittedToast: "Orden sometida",
    cardRequired: "Completa todos los campos de tarjeta.",
    cardNotReady:
      "El pago con tarjeta estará disponible cuando se conecte el backend con Stripe.",
    checkoutCompleteHint:
      "Para completar tu orden, revisa los detalles y presiona “Someter orden”.",

    shippingTitle: "Dirección de envío",
    shippingSubtitle: "Para calcular envío y completar la orden.",
    addressLine1Label: "Dirección (línea 1)",
    addressLine1Placeholder: "Calle, número, apartamento, etc.",
    addressLine2Label: "Dirección (línea 2)",
    addressLine2Placeholder: "Opcional",
    cityLabel: "Ciudad",
    cityPlaceholder: "Ej: San Juan",
    stateLabel: "Estado / Provincia",
    statePlaceholder: "Ej: PR",
    postalLabel: "ZIP / Postal",
    postalPlaceholder: "Ej: 00901",
    countryLabel: "País",
    countryPlaceholder: "Ej: Puerto Rico / USA",

    waShippingAddress: "Dirección de envío:",

    sendWhatsApp: "Continuar con PayPal",
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

    inventoryTitle: "Inventario",
    inventorySubtitle:
      "Mantén el conteo de stock por producto y el costo para calcular márgenes.",
    inventoryInStock: "En stock",
    inventoryUnitCost: "Costo unitario",
    inventoryAdjustMinus: "-1",
    inventoryAdjustPlus: "+1",

    profitTitle: "Ganancias / Pérdidas",
    profitSubtitle:
      "Análisis por día, semana o mes basado en ventas registradas (demo frontend).",
    profitPeriodLabel: "Periodo",
    profitDay: "Día",
    profitWeek: "Semana",
    profitMonth: "Mes",
    profitDateLabel: "Fecha",
    profitRevenue: "Ingresos",
    profitCogs: "Costo (COGS)",
    profitGrossProfit: "Ganancia bruta",
    profitMargin: "Margen",
    profitUnits: "Unidades vendidas",
    profitTaxCollected: "IVU recaudado",
    profitTaxCollectedAllTime: "IVU recaudado (total)",

    adminCheckoutSettingsTitle: "Ajustes de Checkout",
    adminCheckoutSettingsSubtitle:
      "Solo el administrador puede cambiar IVU y envío. Aplica a artículos nuevos y existentes.",
    adminCheckoutDefaultShippingLabel: "Costo de envío",
    adminCheckoutTaxStateRateLabel: "IVU estatal (PR) — tasa (%)",
    adminCheckoutTaxMunicipalRateLabel: "IVU municipal (PR) — tasa (%)",
    profitNoSales: "No hay ventas registradas en este período.",
    profitTopProducts: "Productos top",

    profitReportPdfButton: "Reporte (PDF)",
    profitReportPeriodValueDay: "Día",
    profitReportPeriodValueWeek: "Semana",
    profitReportPeriodValueMonth: "Mes",
    profitReportRangeLabel: "Rango",
    profitReportGeneratedAt: "Generado",
    profitReportTopProductsTableProduct: "Producto",
    profitReportTopProductsTableUnits: "Unidades",
    profitReportTopProductsTableRevenue: "Ingresos",
    profitReportTopProductsTableProfit: "Ganancia",
    profitReportFooterHint: "En la ventana de imprimir, selecciona 'Guardar como PDF' para descargar el reporte.",

    adminStatOrdersPending: "Órdenes pendientes",
    adminStatOrdersPendingBody: "Pedidos por empacar / enviar.",

    ordersTitle: "Órdenes",
    ordersSubtitle: "Gestiona pedidos: imprime etiquetas y recibos.",
    ordersEmpty: "No hay órdenes todavía.",
    ordersStatusPending: "Pendiente",
    ordersStatusFulfilled: "Completada",
    ordersStatusCancelled: "Cancelada",
    ordersOrder: "Orden",
    ordersPlacedAt: "Creada",
    ordersCustomer: "Cliente",
    ordersShipping: "Envío",
    ordersItems: "Artículos",
    ordersTotal: "Total",
    ordersPrintLabel: "Imprimir etiqueta de envío",
    ordersPrintReceipt: "Recibo (PDF)",
    shippingLabelOrder: "Orden",
    shippingLabelShipTo: "ENVIAR A",
    shippingLabelPrintedFromAdmin: "Impreso desde Admin",
    ordersViewDetails: "Ver detalle de la orden",
    ordersHideDetails: "Ocultar detalle de la orden",
    ordersReceiptHint:
      "Tip: En la ventana de imprimir, selecciona 'Guardar como PDF' para archivarlo.",
    ordersMarkFulfilled: "Marcar completada",
    ordersMarkPending: "Marcar pendiente",

    ordersPaymentMethod: "Método de pago",
    ordersPaymentCard: "Tarjeta",
    ordersPaymentPayPal: "PayPal",
    ordersPaymentWhatsApp: "PayPal",

    ordersTrackingNumberLabel: "Tracking #",
    ordersTrackingNumberPlaceholder: "Ej: 9400 1000 0000 0000 0000 00",
    ordersEtaLabel: "Tiempo estimado",
    ordersEtaPlaceholder: "Ej: 3-5 días",

    orderConfirmationTitle: "Confirmación de orden",
    orderConfirmationSubtitle:
      "Gracias. Recibimos tu pedido. Guarda esta información por si surge alguna situación.",
    orderConfirmationOrderNumber: "Número de orden",
    orderConfirmationPaymentMethod: "Método de pago",
    orderConfirmationPrintReceipt: "Imprimir recibo (PDF)",
    orderConfirmationGoHome: "Volver al inicio",
    orderConfirmationGoAdmin: "Ir a Admin",
    orderConfirmationNotFound: "No encontramos esa orden.",
    orderConfirmationToastOrderSent: "Orden enviada",

    orderStatusTitle: "Estatus de Orden",
    orderStatusSubtitle: "Ingresa tu número de confirmación para ver el estatus en tiempo real.",
    orderStatusOrderNumberLabel: "Número de confirmación",
    orderStatusOrderNumberPlaceholder: "Ej: GBF-000123",
    orderStatusLookup: "Buscar",
    orderStatusNotFound: "No encontramos una orden con ese número.",
    orderStatusCurrentStatus: "Estatus actual",
    orderStatusUpdatedAt: "Actualizado",
    orderStatusTracking: "Tracking",
    orderStatusEta: "Tiempo estimado",
    orderStatusCancelRequestTitle: "Solicitud de cancelación",
    orderStatusRequestCancelButton: "Solicitar cancelación",
    orderStatusCancelRequestReasonLabel: "Razón de la cancelación",
    orderStatusCancelRequestReasonPlaceholder: "Explica brevemente por qué deseas cancelar.",
    orderStatusSendCancelRequest: "Enviar solicitud",
    orderStatusCancelModalClose: "Cerrar",
    orderStatusCancelRequestSent: "Solicitud enviada.",

    ordersStatusPreparing: "Preparar orden",
    ordersStatusPaused: "Pausar orden",
    ordersStatusShipped: "Orden enviada",
    ordersCancelReasonLabel: "Causa de cancelación",
    ordersCancelReasonPlaceholder: "Ej: Cliente solicitó cancelación / producto sin stock",
    ordersUpdateStatusLabel: "Actualizar estatus",
    ordersApplyStatus: "Aplicar",
    ordersStatusTrackingRequired: "Para marcar como 'Orden enviada' debes escribir el tracking.",
    ordersStatusCancelReasonRequired: "Para cancelar la orden debes escribir la causa de cancelación.",

    heroAdminTitle: "Promoción del Home",
    heroAdminSubtitle:
      "Edita el recuadro principal del inicio para promociones o para actualizar contenido sin programador.",
    heroAdminEnabled: "Activar cuadro del Home",
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

    uploadImageLabel: "Subir imagen",
    uploading: "Subiendo...",
    uploadFailed: "Error al subir:",
    uploadDevOnlyHint: "Funciona solo en desarrollo (npm run dev).",

    heroAdminTypeLabel: "Tipo",
    heroAdminTypeContent: "Solo actualizar contenido",
    heroAdminTypePromo: "Promoción (con fechas)",
    heroAdminScheduleTitle: "Fechas de promoción",
    heroAdminStartLabel: "Inicio",
    heroAdminEndLabel: "Fin",
    heroAdminScheduleHint: "Hora local",
    heroAdminStatusActive: "Activa ahora",
    heroAdminStatusInactive: "Inactiva ahora",

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
    footerWhatsAppCheckout: "Pago con tarjeta",
  },
  en: {
    tagline: "Products with purpose",

    navHome: "Home",
    navCatalog: "Catalog",
    navBlog: "Blog",
    navValues: "Values",
    navOrderStatus: "Order Status",
    navAdmin: "Admin",

    explore: "Explore",
    cart: "Cart",

    orderFlowProgress: (current, total) => `Step ${current} of ${total}`,
    orderFlowStepCart: "Cart",
    orderFlowStepCheckout: "Checkout",
    orderFlowStepReview: "Review & submit",

    adminProfitCardBody: "View profit/loss reports.",

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

    heroCountdownEndsIn: "Ends in",
    heroCountdownDays: (n) => `${n} ${n === 1 ? "day" : "days"}`,

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
    step3Desc: "Cart + card checkout.",

    mottoTitle: "Motto",
    mottoQuote: "\"Products with purpose, faith that transforms.\"",

    quickCtaTitle: "Quick CTA",
    quickCtaBody:
      "Launch with pre-orders and charge cards while validating demand.",

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
      "This MVP is frontend-only: later we'll add card payments (Stripe) and real orders.",

    cartTitle: "Cart",
    cartSubtitle: "Review your order before checkout.",
    continueShopping: "Continue shopping",
    emptyCart: "Your cart is empty.",
    remove: "Remove",
    qty: "Qty",
    total: "Total",
    estimatedTotal: "This total is estimated for the MVP.",
    goToCheckout: "Go to checkout",

    taxPrState: "PR state tax",
    taxPrMunicipal: "PR municipal tax",
    taxPrTotal: "PR tax total",

    checkoutSubtotal: "Subtotal",
    checkoutTaxPr: "PR tax",
    checkoutTaxStateLabel: "State",
    checkoutTaxMunicipalLabel: "Municipal",
    checkoutTaxRateLabel: "Rate (%)",
    checkoutShippingFee: "Shipping",
    checkoutGrandTotal: "Total",
    checkoutEditTaxesShippingHint:
      "Tax and shipping are calculated automatically.",

    checkoutTitle: "Checkout",
    checkoutSubtitle: "Card payment (Stripe) — frontend demo, no backend yet.",
    yourDetails: "Your details",
    namePlaceholder: "Name",
    phonePlaceholder: "Phone",
    notesPlaceholder: "Notes (e.g. gift, date, etc.)",

    checkoutPaymentTitle: "Payment",
    checkoutPaymentSubtitle:
      "Coming soon: card payments (Stripe) and PayPal. UI demo for now.",
    paymentMethod: "Payment method",
    payByPayPal: "PayPal",
    payByWhatsApp: "PayPal",
    payByCard: "Card (Stripe)",
    payPalDisclaimer: "PayPal (coming soon) — frontend demo.",
    checkoutContinueToReview: "Continue to review",

    cardAcceptedLabel: "Cards accepted",
    cardTypeLabel: "Card type",
    cardTypeUnknown: "Unknown",
    cardTypeVisa: "Visa",
    cardTypeMastercard: "Mastercard",
    cardTypeAmex: "American Express",
    cardTypeDiscover: "Discover",

    cardDisclaimer: "Frontend demo — no payment is processed yet.",
    cardNameLabel: "Name on card",
    cardNamePlaceholder: "Full name",
    cardNumberLabel: "Card number",
    cardNumberPlaceholder: "1234 5678 9012 3456",
    cardExpiryLabel: "Expiry (MM/YY)",
    cardExpiryPlaceholder: "MM/YY",
    cardCvcLabel: "CVC",
    cardCvcPlaceholder: "123",
    cardZipLabel: "ZIP / Postal",
    cardZipPlaceholder: "12345",
    payNow: "Pay now",
    checkoutReviewTitle: "Review your order",
    checkoutReviewSubtitle: "Confirm the details before submitting your order.",
    checkoutEditDetails: "Edit details",
    checkoutSubmitOrder: "Submit order",
    checkoutDetailsRequired: "Please enter your name, phone, and shipping address.",
    checkoutOrderSubmittedToast: "Order submitted",
    cardRequired: "Complete all card fields.",
    cardNotReady:
      "Card payments will be available once the backend is connected to Stripe.",
    checkoutCompleteHint:
      "To complete your order, review the details and press “Submit order”.",

    shippingTitle: "Shipping address",
    shippingSubtitle: "For shipping estimates and order completion.",
    addressLine1Label: "Address (line 1)",
    addressLine1Placeholder: "Street, number, apartment, etc.",
    addressLine2Label: "Address (line 2)",
    addressLine2Placeholder: "Optional",
    cityLabel: "City",
    cityPlaceholder: "e.g. San Juan",
    stateLabel: "State / Province",
    statePlaceholder: "e.g. PR",
    postalLabel: "ZIP / Postal",
    postalPlaceholder: "e.g. 00901",
    countryLabel: "Country",
    countryPlaceholder: "e.g. Puerto Rico / USA",

    waShippingAddress: "Shipping address:",

    sendWhatsApp: "Continue with PayPal",
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

    inventoryTitle: "Inventory",
    inventorySubtitle:
      "Track stock counts per product and unit costs to calculate margins.",
    inventoryInStock: "In stock",
    inventoryUnitCost: "Unit cost",
    inventoryAdjustMinus: "-1",
    inventoryAdjustPlus: "+1",

    profitTitle: "Profit / Loss",
    profitSubtitle:
      "Analyze by day, week, or month based on recorded sales (frontend demo).",
    profitPeriodLabel: "Period",
    profitDay: "Day",
    profitWeek: "Week",
    profitMonth: "Month",
    profitDateLabel: "Date",
    profitRevenue: "Revenue",
    profitCogs: "COGS",
    profitGrossProfit: "Gross profit",
    profitMargin: "Margin",
    profitUnits: "Units sold",
    profitTaxCollected: "Tax collected",
    profitTaxCollectedAllTime: "Tax collected (all time)",

    adminCheckoutSettingsTitle: "Checkout settings",
    adminCheckoutSettingsSubtitle:
      "Only the admin can change taxes and shipping. Applies to new and existing items.",
    adminCheckoutDefaultShippingLabel: "Shipping cost",
    adminCheckoutTaxStateRateLabel: "PR state tax — rate (%)",
    adminCheckoutTaxMunicipalRateLabel: "PR municipal tax — rate (%)",
    profitNoSales: "No sales recorded for this period.",
    profitTopProducts: "Top products",

    profitReportPdfButton: "Report (PDF)",
    profitReportPeriodValueDay: "Day",
    profitReportPeriodValueWeek: "Week",
    profitReportPeriodValueMonth: "Month",
    profitReportRangeLabel: "Range",
    profitReportGeneratedAt: "Generated",
    profitReportTopProductsTableProduct: "Product",
    profitReportTopProductsTableUnits: "Units",
    profitReportTopProductsTableRevenue: "Revenue",
    profitReportTopProductsTableProfit: "Profit",
    profitReportFooterHint: "In the print dialog, choose 'Save as PDF' to download the report.",

    adminStatOrdersPending: "Pending orders",
    adminStatOrdersPendingBody: "Orders waiting to be packed / shipped.",

    ordersTitle: "Orders",
    ordersSubtitle: "Manage orders: print shipping labels and receipts.",
    ordersEmpty: "No orders yet.",
    ordersStatusPending: "Pending",
    ordersStatusFulfilled: "Fulfilled",
    ordersStatusCancelled: "Cancelled",
    ordersOrder: "Order",
    ordersPlacedAt: "Placed",
    ordersCustomer: "Customer",
    ordersShipping: "Shipping",
    ordersItems: "Items",
    ordersTotal: "Total",
    ordersPrintLabel: "Print label",
    ordersPrintReceipt: "Receipt (PDF)",
    shippingLabelOrder: "Order",
    shippingLabelShipTo: "SHIP TO",
    shippingLabelPrintedFromAdmin: "Printed from Admin",
    ordersViewDetails: "View order details",
    ordersHideDetails: "Hide order details",
    ordersReceiptHint:
      "Tip: In the print dialog, choose 'Save as PDF' to archive it.",
    ordersMarkFulfilled: "Mark fulfilled",
    ordersMarkPending: "Mark pending",

    ordersPaymentMethod: "Payment method",
    ordersPaymentCard: "Card",
    ordersPaymentPayPal: "PayPal",
    ordersPaymentWhatsApp: "PayPal",

    ordersTrackingNumberLabel: "Tracking #",
    ordersTrackingNumberPlaceholder: "e.g. 9400 1000 0000 0000 0000 00",
    ordersEtaLabel: "Estimated time",
    ordersEtaPlaceholder: "e.g. 3–5 days",

    orderConfirmationTitle: "Order confirmation",
    orderConfirmationSubtitle:
      "Thank you. We received your order. Save this info in case you need it later.",
    orderConfirmationOrderNumber: "Order number",
    orderConfirmationPaymentMethod: "Payment method",
    orderConfirmationPrintReceipt: "Print receipt (PDF)",
    orderConfirmationGoHome: "Back to home",
    orderConfirmationGoAdmin: "Go to Admin",
    orderConfirmationNotFound: "We couldn't find that order.",
    orderConfirmationToastOrderSent: "Order sent",

    orderStatusTitle: "Order status",
    orderStatusSubtitle: "Enter your confirmation number to see real-time status.",
    orderStatusOrderNumberLabel: "Confirmation number",
    orderStatusOrderNumberPlaceholder: "e.g. GBF-000123",
    orderStatusLookup: "Search",
    orderStatusNotFound: "We couldn't find an order with that number.",
    orderStatusCurrentStatus: "Current status",
    orderStatusUpdatedAt: "Updated",
    orderStatusTracking: "Tracking",
    orderStatusEta: "Estimated time",
    orderStatusCancelRequestTitle: "Cancellation request",
    orderStatusRequestCancelButton: "Request cancellation",
    orderStatusCancelRequestReasonLabel: "Cancellation reason",
    orderStatusCancelRequestReasonPlaceholder: "Briefly explain why you want to cancel.",
    orderStatusSendCancelRequest: "Send request",
    orderStatusCancelModalClose: "Close",
    orderStatusCancelRequestSent: "Request sent.",

    ordersStatusPreparing: "Preparing order",
    ordersStatusPaused: "Order paused",
    ordersStatusShipped: "Order shipped",
    ordersCancelReasonLabel: "Cancellation reason",
    ordersCancelReasonPlaceholder: "e.g. Customer requested cancellation / out of stock",
    ordersUpdateStatusLabel: "Update status",
    ordersApplyStatus: "Apply",
    ordersStatusTrackingRequired: "To mark as 'Order shipped' you must enter a tracking number.",
    ordersStatusCancelReasonRequired: "To cancel the order you must enter a cancellation reason.",

    heroAdminTitle: "Homepage promotion",
    heroAdminSubtitle:
      "Edit the main homepage hero for promotions or content updates without needing a developer.",
    heroAdminEnabled: "Enable homepage hero",
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

    uploadImageLabel: "Upload image",
    uploading: "Uploading...",
    uploadFailed: "Upload error:",
    uploadDevOnlyHint: "Only works in development (npm run dev).",

    heroAdminTypeLabel: "Type",
    heroAdminTypeContent: "Content update only",
    heroAdminTypePromo: "Promotion (with dates)",
    heroAdminScheduleTitle: "Promotion dates",
    heroAdminStartLabel: "Start",
    heroAdminEndLabel: "End",
    heroAdminScheduleHint: "Local time",
    heroAdminStatusActive: "Active now",
    heroAdminStatusInactive: "Inactive now",

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
    footerWhatsAppCheckout: "Card checkout",
  },
};

// -----------------------------
// Local images folder
// -----------------------------
// Put local images in: public/images/
// Then reference them like: "/images/hero.jpg" (Vite serves from /public)
// -----------------------------
// localStorage Keys
// -----------------------------
const HERO_STORAGE_KEY = "gbf.homeHero.v1";
const INVENTORY_STORAGE_KEY = "gbf.inventory.v1";
const PRODUCT_COSTS_STORAGE_KEY = "gbf.productCosts.v1";
const SALES_STORAGE_KEY = "gbf.sales.v1";
const ORDERS_STORAGE_KEY = "gbf.orders.v1";
const ORDER_COUNTER_STORAGE_KEY = "gbf.orderCounter.v1";
const CHECKOUT_CONFIG_STORAGE_KEY = "gbf.checkoutConfig.v1";

// -----------------------------
// Puerto Rico taxes (split)
// -----------------------------
const PR_TAX_STATE_RATE_PCT = 10.5;
const PR_TAX_MUNICIPAL_RATE_PCT = 1.0;
const PR_TAX_TOTAL_RATE_PCT = PR_TAX_STATE_RATE_PCT + PR_TAX_MUNICIPAL_RATE_PCT;

// -----------------------------
// Helper: buildDefaultCheckoutConfig
// -----------------------------
function buildDefaultCheckoutConfig() {
  return {
    prTaxStateRatePct: PR_TAX_STATE_RATE_PCT,
    prTaxMunicipalRatePct: PR_TAX_MUNICIPAL_RATE_PCT,
    defaultShippingFee: 0,
  };
}


// -----------------------------
// Helper: normalizeCheckoutConfig
// -----------------------------
function normalizeCheckoutConfig(cfg) {
  const base = buildDefaultCheckoutConfig();
  if (!cfg || typeof cfg !== "object") return base;

  const prTaxStateRatePct = Math.max(
    0,
    parseNumberOr(cfg.prTaxStateRatePct, base.prTaxStateRatePct)
  );
  const prTaxMunicipalRatePct = Math.max(
    0,
    parseNumberOr(cfg.prTaxMunicipalRatePct, base.prTaxMunicipalRatePct)
  );
  const defaultShippingFee = Math.max(0, parseNumberOr(cfg.defaultShippingFee, base.defaultShippingFee));

  return { prTaxStateRatePct, prTaxMunicipalRatePct, defaultShippingFee };
}


// -----------------------------
// Helper: buildDefaultCheckoutDraft
// -----------------------------
function buildDefaultCheckoutDraft() {
  return {
    paymentMethod: "card", // card | paypal
    customer: {
      name: "",
      phone: "",
      notes: "",
    },
    shipping: {
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateRegion: "",
      postalCode: "",
      country: "",
    },
    card: {
      name: "",
      number: "",
      expiry: "",
      cvc: "",
      zip: "",
    },
  };
}


// -----------------------------
// Helper: normalizeCheckoutDraft
// -----------------------------
function normalizeCheckoutDraft(draft) {
  const base = buildDefaultCheckoutDraft();
  const cfg = draft && typeof draft === "object" ? draft : {};

  const paymentMethod =
    cfg.paymentMethod === "paypal" || cfg.paymentMethod === "whatsapp" ? "paypal" : "card";

  return {
    ...base,
    ...cfg,
    paymentMethod,
    customer: { ...base.customer, ...(cfg.customer || {}) },
    shipping: { ...base.shipping, ...(cfg.shipping || {}) },
    card: { ...base.card, ...(cfg.card || {}) },
  };
}


// -----------------------------
// Card brand helpers (simple client-side detection)
// -----------------------------
function detectCardBrand(number) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";

  // Amex: 34, 37
  if (/^3[47]/.test(digits)) return "amex";

  // Visa: 4
  if (/^4/.test(digits)) return "visa";

  // MasterCard: 51-55, 2221-2720
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d{2}|27[01]\d|2720)/.test(digits)) return "mastercard";

  // Discover: 6011, 65, 644-649
  if (/^(6011|65|64[4-9])/.test(digits)) return "discover";

  // JCB: 3528-3589
  if (/^35(2[89]|[3-8]\d)/.test(digits)) return "jcb";

  // Diners (optional): 300-305, 36, 38-39
  if (/^(30[0-5]|36|3[89])/.test(digits)) return "diners";

  return "";
}

function formatCardNumberForDisplay(number, brand) {
  const digits = String(number || "").replace(/\D/g, "");
  if (!digits) return "";

  if (brand === "amex") {
    const p1 = digits.slice(0, 4);
    const p2 = digits.slice(4, 10);
    const p3 = digits.slice(10, 15);
    return [p1, p2, p3].filter(Boolean).join(" ");
  }

  // Default: group in 4s (supports 16-19 digits)
  return digits
    .match(/.{1,4}/g)
    ?.join(" ")
    .trim() || digits;
}

function sanitizeCardNumberInput(raw) {
  const digits = String(raw || "").replace(/\D/g, "");
  const brand = detectCardBrand(digits);

  const maxLen = brand === "amex" ? 15 : 19;
  const capped = digits.slice(0, maxLen);

  return {
    brand,
    digits: capped,
    formatted: formatCardNumberForDisplay(capped, brand),
  };
}

function sanitizeExpiryInput(raw) {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

function sanitizeCvcInput(raw, brand) {
  const maxLen = brand === "amex" ? 4 : 3;
  return String(raw || "").replace(/\D/g, "").slice(0, maxLen);
}

// Component: CreditCardBrandLogo
function CreditCardBrandLogo({ brand, active = false, className = "" }) {
  const base = "inline-flex h-9 w-[78px] items-center justify-center rounded-xl border bg-white";
  const border = active ? "border-zinc-900" : "border-zinc-200";

  const title =
    brand === "visa"
      ? "Visa"
      : brand === "mastercard"
      ? "Mastercard"
      : brand === "amex"
      ? "American Express"
      : brand === "discover"
      ? "Discover"
      : "";

  const commonSvgProps = {
    viewBox: "0 0 72 32",
    preserveAspectRatio: "xMidYMid meet",
    role: "img",
    "aria-label": title,
    className: "block h-7 w-[70px]",
  };

  const textProps = {
    textAnchor: "middle",
    dominantBaseline: "middle",
    x: 36,
    y: 16,
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
    fontWeight: 900,
    letterSpacing: 1,
  };

  const logo =
    brand === "visa" ? (
      <svg {...commonSvgProps}>
        <rect x="2" y="6" width="68" height="20" rx="6" fill="#1A1F71" />
        <text {...textProps} fill="#fff" fontSize="13">
          VISA
        </text>
      </svg>
    ) : brand === "mastercard" ? (
      <svg {...commonSvgProps}>
        <rect x="2" y="6" width="68" height="20" rx="6" fill="#ffffff" stroke="#e5e7eb" />
        <circle cx="34" cy="16" r="7" fill="#EB001B" opacity="0.95" />
        <circle cx="40" cy="16" r="7" fill="#F79E1B" opacity="0.95" />
        <text
          x="14"
          y="16"
          dominantBaseline="middle"
          fill="#111"
          fontSize="8"
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontWeight="900"
        >
          MC
        </text>
      </svg>
    ) : brand === "amex" ? (
      <svg {...commonSvgProps}>
        <rect x="2" y="6" width="68" height="20" rx="6" fill="#2E77BC" />
        <text {...textProps} fill="#fff" fontSize="11">
          AMEX
        </text>
      </svg>
    ) : brand === "discover" ? (
      <svg {...commonSvgProps}>
        <rect x="2" y="6" width="68" height="20" rx="6" fill="#ffffff" stroke="#e5e7eb" />
        <path d="M46 23c10-3 18-8 22-10" fill="none" stroke="#FF6A00" strokeWidth="3" />
        <circle cx="36" cy="16" r="5" fill="#FF6A00" opacity="0.9" />
        <text
          x="14"
          y="16"
          dominantBaseline="middle"
          fill="#111"
          fontSize="9"
          fontFamily="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial"
          fontWeight="900"
        >
          DISC
        </text>
      </svg>
    ) : null;

  return (
    <span title={title} className={`${base} ${border} ${className}`.trim()}>
      {logo}
    </span>
  );
}


// -----------------------------
// Hero promo defaults (used by Home + Admin)
// -----------------------------
const DEFAULT_HERO_IMAGES = {
  hero: "https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=1400&q=80",
  product1:
    "https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=1200&q=80",
  product2:
    "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
};

// Helper: buildDefaultHeroConfig
function buildDefaultHeroConfig() {
  return {
    enabled: false,
    promoType: "content", // "content" | "promo"
    promoSchedule: {
      startLocal: "", // datetime-local string (YYYY-MM-DDTHH:mm)
      endLocal: "",
    },
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

// Helper: normalizeHeroConfig
function normalizeHeroConfig(input) {
  const base = buildDefaultHeroConfig();
  const cfg = input && typeof input === "object" ? input : {};

  const promoType = cfg.promoType === "promo" ? "promo" : "content";

  return {
    ...base,
    ...cfg,
    promoType,
    promoSchedule: {
      ...base.promoSchedule,
      ...(cfg.promoSchedule || {}),
    },
    pill: { ...base.pill, ...(cfg.pill || {}) },
    titleOne: { ...base.titleOne, ...(cfg.titleOne || {}) },
    titleTwo: { ...base.titleTwo, ...(cfg.titleTwo || {}) },
    text: { ...base.text, ...(cfg.text || {}) },
    primary: { ...base.primary, ...(cfg.primary || {}) },
    secondary: { ...base.secondary, ...(cfg.secondary || {}) },
    images: { ...base.images, ...(cfg.images || {}) },
  };
}

// Helper: l10n
function l10n(value, language) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") return value[language] ?? value.es ?? "";
  return String(value);
}


// Helper: fileToDataUrl (for Admin image uploads)
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file"));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}


// Helper: buildUploadFilename
function buildUploadFilename(prefix, file) {
  const base = String(file?.name || "upload").replace(/\s+/g, "-");
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : String(Date.now());
  return `${prefix}-${id}-${base}`;
}


// Helper: uploadImageToPublicImages (dev-server endpoint)
async function uploadImageToPublicImages({ file, filename }) {
  const dataUrl = await fileToDataUrl(file);

  const res = await fetch("/__gbf_upload_image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, dataUrl }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.ok || typeof json?.url !== "string") {
    throw new Error(json?.error || `Upload failed (${res.status})`);
  }

  return json.url;
}


// Helper: localDateTimeStringToMs
function localDateTimeStringToMs(value) {
  const s = String(value || "").trim();
  if (!s) return Number.NaN;

  const m =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
  if (!m) return Number.NaN;

  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  const hour = Number(m[4]);
  const minute = Number(m[5]);
  const second = Number(m[6] || 0);

  const dt = new Date(year, month - 1, day, hour, minute, second, 0);
  return dt.getTime();
}


// Helper: formatHms
function formatHms(ms) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms) / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}


// Helper: isHeroOverrideActiveAt
function isHeroOverrideActiveAt(heroConfig, nowMs = Date.now()) {
  const enabled = Boolean(heroConfig?.enabled);
  if (!enabled) return false;

  const promoType = heroConfig?.promoType === "promo" ? "promo" : "content";
  if (promoType !== "promo") return true;

  const startMs = localDateTimeStringToMs(heroConfig?.promoSchedule?.startLocal);
  const endMs = localDateTimeStringToMs(heroConfig?.promoSchedule?.endLocal);

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) return false;

  return nowMs >= startMs && nowMs <= endMs;
}


// Helper: isHeroOverrideActive
function isHeroOverrideActive(heroConfig) {
  return isHeroOverrideActiveAt(heroConfig, Date.now());
}


// Helper: money
function money(n, language = "en") {
  const locale = language === "es" ? "es-US" : "en-US";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(n);
}


// Helper: roundMoney
function roundMoney(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.round(x * 100) / 100;
}


// Helper: parseNumberOr
function parseNumberOr(value, fallback = 0) {
  const s = String(value ?? "").trim();
  if (!s) return fallback;
  const n = Number(s);
  return Number.isFinite(n) ? n : fallback;
}


// Helper: formatRatePct
function formatRatePct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "";
  return x % 1 === 0 ? x.toFixed(1) : String(x);
}


// Helper: getPrTaxBreakdownFromOrder
function getPrTaxBreakdownFromOrder(order, subtotalFallback = 0) {
  const subtotal = Number.isFinite(Number(order?.subtotal))
    ? Number(order.subtotal)
    : Math.max(0, Number(subtotalFallback) || 0);

  const stateRateFromOrder = Number.isFinite(Number(order?.taxStateRatePct))
    ? Number(order.taxStateRatePct)
    : null;
  const municipalRateFromOrder = Number.isFinite(Number(order?.taxMunicipalRatePct))
    ? Number(order.taxMunicipalRatePct)
    : null;

  const totalRateFromOrder = Number.isFinite(Number(order?.taxRatePct)) ? Number(order.taxRatePct) : null;

  const stateRateDefault =
    totalRateFromOrder != null
      ? (totalRateFromOrder * PR_TAX_STATE_RATE_PCT) / PR_TAX_TOTAL_RATE_PCT
      : PR_TAX_STATE_RATE_PCT;

  const municipalRateDefault =
    totalRateFromOrder != null
      ? (totalRateFromOrder * PR_TAX_MUNICIPAL_RATE_PCT) / PR_TAX_TOTAL_RATE_PCT
      : PR_TAX_MUNICIPAL_RATE_PCT;

  const stateRatePct = Math.max(0, parseNumberOr(stateRateFromOrder, stateRateDefault));
  const municipalRatePct = Math.max(0, parseNumberOr(municipalRateFromOrder, municipalRateDefault));

  const taxTotalAmountFromOrder = Number.isFinite(Number(order?.taxAmount)) ? Number(order.taxAmount) : null;

  let stateAmount = Number.isFinite(Number(order?.taxStateAmount))
    ? Number(order.taxStateAmount)
    : roundMoney(subtotal * (stateRatePct / 100));

  let municipalAmount = Number.isFinite(Number(order?.taxMunicipalAmount))
    ? Number(order.taxMunicipalAmount)
    : roundMoney(subtotal * (municipalRatePct / 100));

  let totalAmount = taxTotalAmountFromOrder;
  if (totalAmount == null) {
    totalAmount = roundMoney(stateAmount + municipalAmount);
  } else {
    totalAmount = roundMoney(totalAmount);
  }

  const diff = roundMoney(totalAmount - (stateAmount + municipalAmount));
  if (diff !== 0) stateAmount = roundMoney(stateAmount + diff);

  const totalRatePct = roundMoney(stateRatePct + municipalRatePct);

  return {
    subtotal,
    stateRatePct,
    municipalRatePct,
    totalRatePct,
    stateAmount,
    municipalAmount,
    totalAmount,
  };
}


// Helper: normalizeOrderStatus
function normalizeOrderStatus(status) {
  const s = String(status || "").trim().toLowerCase();
  if (s === "fulfilled") return "shipped";
  if (s === "preparing" || s === "paused" || s === "cancelled" || s === "shipped" || s === "pending") {
    return s;
  }
  return "pending";
}


// Helper: isOpenOrderStatus
function isOpenOrderStatus(status) {
  const s = normalizeOrderStatus(status);
  return s !== "shipped" && s !== "cancelled";
}


// Helper: orderStatusLabel
function orderStatusLabel(status, t) {
  const s = normalizeOrderStatus(status);
  if (s === "preparing") return t.ordersStatusPreparing;
  if (s === "paused") return t.ordersStatusPaused;
  if (s === "shipped") return t.ordersStatusShipped;
  if (s === "cancelled") return t.ordersStatusCancelled;
  return t.ordersStatusPending;
}


// Helper: orderStatusBadgeClass
function orderStatusBadgeClass(status) {
  const s = normalizeOrderStatus(status);
  if (s === "shipped") return "bg-emerald-100 text-emerald-800";
  if (s === "cancelled") return "bg-zinc-200 text-zinc-800";
  if (s === "paused") return "bg-sky-100 text-sky-800";
  if (s === "preparing") return "bg-violet-100 text-violet-800";
  return "bg-amber-100 text-amber-800";
}


// Helper: escapeHtml
function escapeHtml(value) {
  const s = String(value ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// Helper: getNextOrderNumber
function getNextOrderNumber() {
  const fallback = `GBF-${Date.now()}`;
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(ORDER_COUNTER_STORAGE_KEY);
    const prev = Number(raw);
    const base = Number.isFinite(prev) && prev > 0 ? prev : 0;
    const next = base + 1;
    window.localStorage.setItem(ORDER_COUNTER_STORAGE_KEY, String(next));
    return `GBF-${String(next).padStart(6, "0")}`;
  } catch {
    return fallback;
  }
}


// Helper: openPrintWindow
function openPrintWindow({ title, bodyHtml, cssText, autoPrint = true }) {
  if (typeof window === "undefined") return;

  const safeTitle = escapeHtml(title || "Print");
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${safeTitle}</title>
    <style>
      ${cssText || ""}
    </style>
  </head>
  <body>
    ${bodyHtml || ""}
  </body>
</html>`;

  // Try opening a new tab/window (best UX when allowed).
  const w = window.open("", "_blank");

  if (w) {
    try {
      w.document.open();
      w.document.write(html);
      w.document.close();

      if (autoPrint) {
        const tryPrint = () => {
          try {
            w.focus();
            w.print();
          } catch {
            // ignore
          }
        };

        // Some browsers need a little extra time for layout/fonts.
        w.addEventListener?.("load", () => window.setTimeout(tryPrint, 200));
        window.setTimeout(tryPrint, 500);
      }

      return;
    } catch {
      // Fall through to iframe-based printing.
    }
  }

  // Fallback: print via an in-page hidden iframe (avoids popup blockers).
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.setAttribute("aria-hidden", "true");

  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  if (autoPrint) {
    const doPrint = () => {
      try {
        win.focus();
        win.print();
      } catch {
        // ignore
      } finally {
        window.setTimeout(() => iframe.remove(), 500);
      }
    };

    // Wait a moment to ensure the iframe has rendered.
    window.setTimeout(doPrint, 500);
  }
}


// Helper: buildShippingLabelHtml
function buildShippingLabelHtml({ order, language }) {
  const lang = language === "es" ? "es" : "en";
  const tr = translations[lang];

  const toName = escapeHtml(order?.customer?.name || "");
  const toPhone = escapeHtml(order?.customer?.phone || "");

  const ship = order?.shipping || {};
  const lines = [
    ship.addressLine1,
    ship.addressLine2,
    [ship.city, ship.stateRegion].filter(Boolean).join(", "),
    ship.postalCode,
    ship.country,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  const toAddress = lines.map((l) => `<div>${escapeHtml(l)}</div>`).join("");

  const orderNo = escapeHtml(order?.orderNumber || order?.id || "");

  return `
  <div class="page">
    <div class="row">
      <div class="from">
        <div class="brand">Grow by Faith</div>
      </div>
      <div class="order">
        <div class="muted">${escapeHtml(tr.shippingLabelOrder)}</div>
        <div class="orderNo">${orderNo}</div>
      </div>
    </div>

    <div class="box">
      <div class="muted">${escapeHtml(tr.shippingLabelShipTo)}</div>
      <div class="name">${toName || "—"}</div>
      <div class="address">${toAddress || "<div>—</div>"}</div>
      ${toPhone ? `<div class="phone">${toPhone}</div>` : ""}
    </div>

    <div class="footer">
      <div class="small muted">${escapeHtml(tr.shippingLabelPrintedFromAdmin)}</div>
    </div>
  </div>`;
}


// Helper: buildReceiptHtml
function buildReceiptHtml({ order, language }) {
  const lang = language === "es" ? "es" : "en";
  const tr = translations[lang];

  const orderNo = escapeHtml(order?.orderNumber || order?.id || "");
  const createdAt =
    typeof order?.createdAt === "number"
      ? new Date(order.createdAt).toLocaleString(lang === "es" ? "es-US" : "en-US")
      : "";

  const customerName = escapeHtml(order?.customer?.name || "");
  const customerPhone = escapeHtml(order?.customer?.phone || "");
  const customerNotes = escapeHtml(order?.customer?.notes || "");

  const ship = order?.shipping || {};
  const shipLines = [
    ship.addressLine1,
    ship.addressLine2,
    [ship.city, ship.stateRegion].filter(Boolean).join(", "),
    ship.postalCode,
    ship.country,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean);

  const shipHtml = shipLines.map((l) => `<div>${escapeHtml(l)}</div>`).join("");

  const items = Array.isArray(order?.items) ? order.items : [];
  const rows = items
    .map((it) => {
      const name = escapeHtml(l10n(it?.name, lang));
      const qty = Number(it?.qty) || 0;
      const unitPrice = Number(it?.unitPrice) || 0;
      const lineTotal = qty * unitPrice;
      const p = it?.personalization || {};
      const pText = escapeHtml(p.text || "");
      const pVerse = escapeHtml(p.verse || "");
      const pExtra = [
        pText ? `${lang === "es" ? "Texto" : "Text"}: ${pText}` : "",
        pVerse ? `${lang === "es" ? "Versículo" : "Verse"}: ${pVerse}` : "",
      ]
        .filter(Boolean)
        .join(" · ");

      return `
        <tr>
          <td>
            <div class="itemName">${name}</div>
            ${pExtra ? `<div class="itemMeta">${pExtra}</div>` : ""}
          </td>
          <td class="qty">${qty}</td>
          <td class="money">${escapeHtml(money(unitPrice, lang))}</td>
          <td class="money">${escapeHtml(money(lineTotal, lang))}</td>
        </tr>`;
    })
    .join("");

  const total = Number(order?.total) || 0;
  const subtotal = Number.isFinite(Number(order?.subtotal))
    ? Number(order.subtotal)
    : roundMoney(
        items.reduce(
          (acc, it) => acc + (Number(it?.qty) || 0) * (Number(it?.unitPrice) || 0),
          0
        )
      );

  const prTax = getPrTaxBreakdownFromOrder(order, subtotal);

  const shippingFee = Number.isFinite(Number(order?.shippingFee)) ? Number(order.shippingFee) : 0;

  const paymentText =
    order?.paymentMethod === "paypal" || order?.paymentMethod === "whatsapp"
      ? tr.ordersPaymentPayPal
      : tr.ordersPaymentCard;

  const tracking = escapeHtml(order?.trackingNumber || "");
  const etaText = escapeHtml(order?.etaText || "");

  return `
  <div class="receipt">
    <div class="header">
      <div>
        <div class="brandRow">
          <img class="brandLogo" src="/gbficon.png" alt="Grow by Faith" />
          <div class="brandName">Grow by Faith</div>
        </div>
        <div class="muted">${lang === "es" ? "Recibo" : "Receipt"}</div>
      </div>
      <div class="right">
        <div class="muted">${lang === "es" ? "Orden" : "Order"}</div>
        <div class="orderNo">${orderNo}</div>
        <div class="muted">${escapeHtml(createdAt)}</div>
      </div>
    </div>

    <div class="muted" style="margin-top: 6px;">
      ${lang === "es" ? "Método de pago" : "Payment method"}: ${escapeHtml(paymentText)}
      ${tracking ? ` · ${lang === "es" ? "Tracking" : "Tracking"}: ${tracking}` : ""}
      ${etaText ? ` · ${lang === "es" ? "Tiempo" : "ETA"}: ${etaText}` : ""}
    </div>

    <div class="grid">
      <div class="card">
        <div class="cardTitle">${lang === "es" ? "Cliente" : "Customer"}</div>
        <div>${customerName || "—"}</div>
        ${customerPhone ? `<div>${customerPhone}</div>` : ""}
        ${customerNotes ? `<div class="muted">${customerNotes}</div>` : ""}
      </div>
      <div class="card">
        <div class="cardTitle">${lang === "es" ? "Envío" : "Shipping"}</div>
        ${shipHtml || "<div>—</div>"}
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>${lang === "es" ? "Artículo" : "Item"}</th>
          <th class="qty">${lang === "es" ? "Cant." : "Qty"}</th>
          <th class="money">${lang === "es" ? "Precio" : "Price"}</th>
          <th class="money">${lang === "es" ? "Total" : "Total"}</th>
        </tr>
      </thead>
      <tbody>
        ${rows || ""}
      </tbody>
    </table>

    <div style="margin-top: 14px;">
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${lang === "es" ? "Subtotal" : "Subtotal"}</div>
        <div class="money">${escapeHtml(money(subtotal, lang))}</div>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${escapeHtml(tr.taxPrState)} (${escapeHtml(formatRatePct(prTax.stateRatePct))}%)</div>
        <div class="money">${escapeHtml(money(prTax.stateAmount, lang))}</div>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${escapeHtml(tr.taxPrMunicipal)} (${escapeHtml(formatRatePct(prTax.municipalRatePct))}%)</div>
        <div class="money">${escapeHtml(money(prTax.municipalAmount, lang))}</div>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${escapeHtml(tr.taxPrTotal)} (${escapeHtml(formatRatePct(prTax.totalRatePct))}%)</div>
        <div class="money">${escapeHtml(money(prTax.totalAmount, lang))}</div>
      </div>
      <div style="display:flex; justify-content: space-between; gap: 12px; margin-top: 6px;">
        <div class="muted">${lang === "es" ? "Envío" : "Shipping"}</div>
        <div class="money">${escapeHtml(money(shippingFee, lang))}</div>
      </div>
    </div>

    <div class="totalRow">
      <div class="muted">${lang === "es" ? "Total" : "Total"}</div>
      <div class="total">${escapeHtml(money(total, lang))}</div>
    </div>

    <div class="muted footer">
      ${lang === "es" ? "Imprime y guarda como PDF para archivarlo." : "Print and save as PDF to archive."}
    </div>
  </div>`;
}


// Helper: buildProfitReportHtml
function buildProfitReportHtml({
  language,
  profitPeriod,
  profitDate,
  profitRange,
  profitStats,
  taxCollectedStats,
}) {
  const lang = language === "es" ? "es" : "en";
  const tr = translations[lang];

  const periodLabel =
    profitPeriod === "day"
      ? tr.profitReportPeriodValueDay
      : profitPeriod === "month"
      ? tr.profitReportPeriodValueMonth
      : tr.profitReportPeriodValueWeek;

  const start =
    typeof profitRange?.startMs === "number" ? new Date(profitRange.startMs) : null;
  const endExclusive =
    typeof profitRange?.endMs === "number" ? new Date(profitRange.endMs) : null;
  const endInclusive = endExclusive ? new Date(endExclusive.getTime() - 1) : null;

  const dateFmt = (d) =>
    d instanceof Date && !Number.isNaN(d.getTime())
      ? d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "";

  const rangeText =
    start && endInclusive
      ? `${dateFmt(start)} — ${dateFmt(endInclusive)}`
      : profitDate
      ? String(profitDate)
      : "";

  const generatedAt = new Date().toLocaleString(lang === "es" ? "es-US" : "en-US");

  const revenue = Number(profitStats?.revenue) || 0;
  const cogs = Number(profitStats?.cogs) || 0;
  const grossProfit = Number(profitStats?.grossProfit) || 0;
  const margin = Number(profitStats?.margin) || 0;
  const units = Number(profitStats?.units) || 0;

  const taxInRange = Number(taxCollectedStats?.inRange) || 0;
  const taxAllTime = Number(taxCollectedStats?.allTime) || 0;

  const topProducts = Array.isArray(profitStats?.topProducts) ? profitStats.topProducts : [];

  const topRows = topProducts
    .map((p) => {
      const name = escapeHtml(p?.name || p?.productId || "");
      const pUnits = Number(p?.units) || 0;
      const pRevenue = Number(p?.revenue) || 0;
      const pProfit = Number(p?.profit) || 0;

      return `
        <tr>
          <td class="name">${name || "—"}</td>
          <td class="num">${escapeHtml(String(pUnits))}</td>
          <td class="money">${escapeHtml(money(pRevenue, lang))}</td>
          <td class="money">${escapeHtml(money(pProfit, lang))}</td>
        </tr>`;
    })
    .join("");

  const hasSales = Array.isArray(profitStats?.inRange) ? profitStats.inRange.length > 0 : false;

  return `
  <div class="report">
    <div class="header">
      <div class="brandRow">
        <img class="brandLogo" src="/gbficon.png" alt="Grow by Faith" />
        <div>
          <div class="brandName">Grow by Faith</div>
          <div class="muted">${escapeHtml(tr.profitTitle)}</div>
        </div>
      </div>

      <div class="meta">
        <div><span class="label">${escapeHtml(tr.profitPeriodLabel)}:</span> ${escapeHtml(periodLabel)}</div>
        <div><span class="label">${escapeHtml(tr.profitDateLabel)}:</span> ${escapeHtml(profitDate || "")}</div>
        <div><span class="label">${escapeHtml(tr.profitReportRangeLabel)}:</span> ${escapeHtml(rangeText)}</div>
        <div class="muted"><span class="label">${escapeHtml(tr.profitReportGeneratedAt)}:</span> ${escapeHtml(generatedAt)}</div>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitRevenue)}</div>
        <div class="cardValue">${escapeHtml(money(revenue, lang))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitCogs)}</div>
        <div class="cardValue">${escapeHtml(money(cogs, lang))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitGrossProfit)}</div>
        <div class="cardValue">${escapeHtml(money(grossProfit, lang))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitMargin)}</div>
        <div class="cardValue">${escapeHtml(`${(margin * 100).toFixed(1)}%`)}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitUnits)}</div>
        <div class="cardValue">${escapeHtml(String(units))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitTaxCollected)}</div>
        <div class="cardValue">${escapeHtml(money(taxInRange, lang))}</div>
      </div>
      <div class="card">
        <div class="cardLabel">${escapeHtml(tr.profitTaxCollectedAllTime)}</div>
        <div class="cardValue">${escapeHtml(money(taxAllTime, lang))}</div>
      </div>
    </div>

    <div class="section">
      <div class="sectionTitle">${escapeHtml(tr.profitTopProducts)}</div>

      ${!hasSales ? `<div class="muted">${escapeHtml(tr.profitNoSales)}</div>` : ""}

      <table class="table">
        <thead>
          <tr>
            <th>${escapeHtml(tr.profitReportTopProductsTableProduct)}</th>
            <th class="num">${escapeHtml(tr.profitReportTopProductsTableUnits)}</th>
            <th class="money">${escapeHtml(tr.profitReportTopProductsTableRevenue)}</th>
            <th class="money">${escapeHtml(tr.profitReportTopProductsTableProfit)}</th>
          </tr>
        </thead>
        <tbody>
          ${topRows || `<tr><td colspan="4" class="muted">${escapeHtml(tr.profitNoSales)}</td></tr>`}
        </tbody>
      </table>
    </div>

    <div class="footer muted">${escapeHtml(tr.profitReportFooterHint)}</div>
  </div>`;
}


// Component: Button
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

// Component: Pill
function Pill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800">
      {children}
    </span>
  );
}

// Component: SectionTitle
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

// Component: Stat
function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
      <div className="text-xs font-semibold text-zinc-500">{label}</div>
      <div className="mt-2 text-base font-extrabold text-zinc-900">{value}</div>
    </div>
  );
}

// Component: TopBar
function TopBar({
  route,
  setRoute,
  cartCount,
  t,
  language,
  setLanguage,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [route]);

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
            <img
              src="/gbficon.png"
              alt="Grow by Faith"
              className="h-10 w-10 object-contain"
            />
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
          <Button
            variant="ghost"
            className="p-2"
            onClick={() => go("cart")}
          >
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
                  route === "home"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navHome}
              </button>
              <button
                onClick={() => go("catalog")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "catalog"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navCatalog}
              </button>
              <button
                onClick={() => go("blog")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "blog"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navBlog}
              </button>
              <button
                onClick={() => go("about")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "about"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-800 hover:bg-zinc-100"
                }`}
              >
                {t.navValues}
              </button>
              <button
                onClick={() => go("order_status")}
                className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                  route === "order_status"
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-800 hover:bg-zinc-100"
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
              <Button
                variant="secondary"
                onClick={() => setLanguage(language === "es" ? "en" : "es")}
              >
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

// Component: OrderFlowStepper
function OrderFlowStepper({ currentStep = 1, t }) {
  const steps = [
    { key: "cart", label: t.orderFlowStepCart },
    { key: "checkout", label: t.orderFlowStepCheckout },
    { key: "review", label: t.orderFlowStepReview },
  ];

  const total = steps.length;
  const safeStep = Math.min(Math.max(1, Number(currentStep) || 1), total);
  const progressPct = total <= 1 ? 0 : ((safeStep - 1) / (total - 1)) * 100;

  return (
    <div className="mx-auto max-w-6xl px-4 pt-4">
      <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs font-semibold text-zinc-600">
            {typeof t.orderFlowProgress === "function" ? t.orderFlowProgress(safeStep, total) : ""}
          </div>
        </div>

        <div className="relative mt-3">
          <div className="h-2 w-full rounded-full bg-zinc-200" />
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-emerald-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {steps.map((s, idx) => {
            const n = idx + 1;
            const done = n < safeStep;
            const current = n === safeStep;

            return (
              <div key={s.key} className="flex flex-col items-center gap-1 text-center">
                <span
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-extrabold ${
                    done
                      ? "border-emerald-200 bg-emerald-100 text-emerald-900"
                      : current
                      ? "border-zinc-900 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white text-zinc-700"
                  }`}
                  aria-label={`${n}`}
                >
                  {done ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    n
                  )}
                </span>
                <div
                  className={`text-[11px] font-semibold leading-4 ${
                    current ? "text-zinc-900" : "text-zinc-500"
                  }`}
                >
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Component: NavLink
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

// Component: CollectionCards
function CollectionCards({ onPick, language, t }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {COLLECTIONS.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c)}
          className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/70"
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

// Component: Hero
function Hero({ onPrimary, onSecondary, t, heroConfig, language }) {
  const promoType = heroConfig?.promoType === "promo" ? "promo" : "content";
  const promoStart = heroConfig?.promoSchedule?.startLocal || "";
  const promoEnd = heroConfig?.promoSchedule?.endLocal || "";

  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!heroConfig?.enabled || promoType !== "promo") return;

    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [heroConfig?.enabled, promoType, promoStart, promoEnd]);

  const enabled = isHeroOverrideActiveAt(heroConfig, nowMs);

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

  const promoEndMs = localDateTimeStringToMs(heroConfig?.promoSchedule?.endLocal);
  const remainingMs = Number.isFinite(promoEndMs) ? promoEndMs - nowMs : Number.NaN;
  const showCountdown =
    promoType === "promo" &&
    enabled &&
    Number.isFinite(promoEndMs) &&
    Number.isFinite(remainingMs) &&
    remainingMs >= 0;

  const dayMs = 24 * 60 * 60 * 1000;
  const countdownValue = showCountdown
    ? remainingMs > dayMs
      ? t.heroCountdownDays(Math.ceil(remainingMs / dayMs))
      : formatHms(remainingMs)
    : "";

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
    <div className="relative overflow-hidden rounded-[28px] border border-zinc-200/60 bg-white/55 shadow-sm backdrop-blur-xl">
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative grid gap-6 p-6 md:grid-cols-2 md:p-10">
        <div>
          <Pill>{pillText}</Pill>

          {showCountdown ? (
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-zinc-200/60 bg-white/55 px-3 py-1 text-xs font-semibold text-zinc-800 shadow-sm backdrop-blur-xl">
              <span className="text-zinc-600">{t.heroCountdownEndsIn}</span>
              <span className="text-zinc-900">{countdownValue}</span>
            </div>
          ) : null}

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
            <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-3 shadow-sm backdrop-blur-xl">
              <div className="font-semibold text-zinc-900">{t.heroFeature1Title}</div>
              <div className="mt-1">{t.heroFeature1Body}</div>
            </div>

            <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-3 shadow-sm backdrop-blur-xl">
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

// Component: ProductCard
function ProductCard({ p, onOpen, language }) {
  const name = l10n(p.name, language);
  const short = l10n(p.short, language);

  return (
    <button
      onClick={() => onOpen(p)}
      className="group overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white/55 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/70"
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

// Page: Home
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

      <div className="mt-10 rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.stepsTitle} subtitle={t.stepsSubtitle} />
        <div className="grid gap-4 md:grid-cols-3">
          <Step n="1" title={t.step1Title} desc={t.step1Desc} />
          <Step n="2" title={t.step2Title} desc={t.step2Desc} />
          <Step n="3" title={t.step3Title} desc={t.step3Desc} />
        </div>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
          <div className="text-sm font-bold text-zinc-900">{t.mottoTitle}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.mottoQuote}</p>
        </div>
        <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
          <div className="text-sm font-bold text-zinc-900">{t.quickCtaTitle}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.quickCtaBody}</p>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Component: Step
function Step({ n, title, desc }) {
  return (
    <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
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

// Page: Catalog
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
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
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

// Component: FilterChip
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

// Page: ProductDetail
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
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
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
                <div className="rounded-[22px] border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
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

              <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
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

// Page: Cart
function Cart({ cart, checkoutConfig, onRemove, onCheckout, onBack, t, language }) {
  const subtotal = cart.reduce((acc, it) => acc + it.price * it.qty, 0);

  const cfg = normalizeCheckoutConfig(checkoutConfig);

  const taxStateRate = Math.max(0, parseNumberOr(cfg.prTaxStateRatePct, PR_TAX_STATE_RATE_PCT));
  const taxMunicipalRate = Math.max(
    0,
    parseNumberOr(cfg.prTaxMunicipalRatePct, PR_TAX_MUNICIPAL_RATE_PCT)
  );

  const taxStateAmount = roundMoney(subtotal * (taxStateRate / 100));
  const taxMunicipalAmount = roundMoney(subtotal * (taxMunicipalRate / 100));
  const taxAmount = roundMoney(taxStateAmount + taxMunicipalAmount);

  const shipping = Math.max(0, parseNumberOr(cfg.defaultShippingFee, 0));
  const total = roundMoney(subtotal + taxAmount + shipping);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
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
          <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
            {t.emptyCart}
          </div>
        ) : (
          <div className="grid gap-3">
            {cart.map((it) => (
              <div
                key={it.key}
                className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
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

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div>
                <div className="text-sm font-bold text-zinc-900">{t.total}</div>
                <div className="text-sm text-zinc-600">{t.estimatedTotal}</div>

                <div className="mt-3 grid gap-1 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">{t.checkoutSubtotal}</div>
                    <div className="font-semibold text-zinc-900">{money(subtotal, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrState} ({formatRatePct(taxStateRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxStateAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrMunicipal} ({formatRatePct(taxMunicipalRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxMunicipalAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrTotal} ({formatRatePct(taxStateRate + taxMunicipalRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">{t.checkoutShippingFee}</div>
                    <div className="font-semibold text-zinc-900">{money(shipping, language)}</div>
                  </div>
                </div>
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

// Page: Checkout
function Checkout({
  cart,
  checkoutConfig,
  checkoutDraft,
  setCheckoutDraft,
  onBack,
  onGoReview,
  onPlaceOrder,
  t,
  language,
}) {
  const subtotal = cart.reduce((acc, it) => acc + it.price * it.qty, 0);

  const cfg = normalizeCheckoutConfig(checkoutConfig);

  const taxStateRate = Math.max(0, parseNumberOr(cfg.prTaxStateRatePct, PR_TAX_STATE_RATE_PCT));
  const taxMunicipalRate = Math.max(
    0,
    parseNumberOr(cfg.prTaxMunicipalRatePct, PR_TAX_MUNICIPAL_RATE_PCT)
  );

  const shippingFeeAmount = Math.max(0, parseNumberOr(cfg.defaultShippingFee, 0));

  const taxStateAmount = roundMoney(subtotal * (taxStateRate / 100));
  const taxMunicipalAmount = roundMoney(subtotal * (taxMunicipalRate / 100));
  const taxAmount = roundMoney(taxStateAmount + taxMunicipalAmount);
  const taxRate = roundMoney(taxStateRate + taxMunicipalRate);

  const grandTotal = roundMoney(subtotal + taxAmount + shippingFeeAmount);

  const draft = normalizeCheckoutDraft(checkoutDraft);
  const paymentMethod = draft.paymentMethod;

  const [paymentMessage, setPaymentMessage] = useState("");
  const [cardMessage, setCardMessage] = useState("");

  const name = String(draft.customer?.name || "");
  const phone = String(draft.customer?.phone || "");
  const notes = String(draft.customer?.notes || "");

  const addressLine1 = String(draft.shipping?.addressLine1 || "");
  const addressLine2 = String(draft.shipping?.addressLine2 || "");
  const city = String(draft.shipping?.city || "");
  const stateRegion = String(draft.shipping?.stateRegion || "");
  const postalCode = String(draft.shipping?.postalCode || "");
  const country = String(draft.shipping?.country || "");

  const cardName = String(draft.card?.name || "");
  const cardNumber = String(draft.card?.number || "");
  const cardExpiry = String(draft.card?.expiry || "");
  const cardCvc = String(draft.card?.cvc || "");
  const cardZip = String(draft.card?.zip || "");

  const cardNumberMeta = useMemo(() => sanitizeCardNumberInput(cardNumber), [cardNumber]);
  const cardBrand = cardNumberMeta.brand;
  const cardNumberFormatted = cardNumberMeta.formatted;

  const acceptedCardBrands = ["visa", "mastercard", "amex", "discover"];

  const cardBrandLabel =
    cardBrand === "visa"
      ? t.cardTypeVisa
      : cardBrand === "mastercard"
      ? t.cardTypeMastercard
      : cardBrand === "amex"
      ? t.cardTypeAmex
      : cardBrand === "discover"
      ? t.cardTypeDiscover
      : t.cardTypeUnknown;

  // Draft setter: setDraftPaymentMethod
  function setDraftPaymentMethod(value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => ({
      ...normalizeCheckoutDraft(prev),
      paymentMethod: value === "paypal" || value === "whatsapp" ? "paypal" : "card",
    }));
  }

  // Draft setter: setDraftCustomerField
  function setDraftCustomerField(field, value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => {
      const base = normalizeCheckoutDraft(prev);
      return { ...base, customer: { ...base.customer, [field]: value } };
    });
  }

  // Draft setter: setDraftShippingField
  function setDraftShippingField(field, value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => {
      const base = normalizeCheckoutDraft(prev);
      return { ...base, shipping: { ...base.shipping, [field]: value } };
    });
  }

  // Draft setter: setDraftCardField
  function setDraftCardField(field, value) {
    if (typeof setCheckoutDraft !== "function") return;
    setCheckoutDraft((prev) => {
      const base = normalizeCheckoutDraft(prev);
      return { ...base, card: { ...base.card, [field]: value } };
    });
  }

  // Validation: validateCustomerAndShipping
  function validateCustomerAndShipping() {
    const customerOk = name.trim() && phone.trim();
    const shippingOk = addressLine1.trim() && city.trim();
    return Boolean(customerOk && shippingOk);
  }

  // handleGoToReview (Card)
  function handleGoToReview(e) {
    e.preventDefault();
    setCardMessage("");
    setPaymentMessage("");

    const cardOk =
      cardName.trim() &&
      cardNumber.trim() &&
      cardExpiry.trim() &&
      cardCvc.trim() &&
      cardZip.trim();

    if (!validateCustomerAndShipping()) {
      setCardMessage(t.checkoutDetailsRequired);
      return;
    }

    if (!cardOk) {
      setCardMessage(t.cardRequired);
      return;
    }

    if (typeof onGoReview === "function") {
      onGoReview();
    }
  }


  // handlePayPalContinue
  function handlePayPalContinue() {
    setPaymentMessage("");

    if (!validateCustomerAndShipping()) {
      setPaymentMessage(t.checkoutDetailsRequired);
      return;
    }

    if (typeof onGoReview === "function") {
      onGoReview();
    }
  }


  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.checkoutTitle} subtitle={t.checkoutSubtitle} />
          <div className="text-lg font-bold text-zinc-900">{money(grandTotal, language)}</div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-bold text-zinc-900">{t.yourDetails}</div>
            <div className="mt-4 grid gap-3">
              <input
                value={name}
                onChange={(e) => setDraftCustomerField("name", e.target.value)}
                placeholder={t.namePlaceholder}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <input
                value={phone}
                onChange={(e) => setDraftCustomerField("phone", e.target.value)}
                placeholder={t.phonePlaceholder}
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <textarea
                value={notes}
                onChange={(e) => setDraftCustomerField("notes", e.target.value)}
                placeholder={t.notesPlaceholder}
                rows={4}
                className="w-full resize-none rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.shippingTitle}</div>
              <div className="mt-1 text-xs leading-5 text-zinc-600">{t.shippingSubtitle}</div>

              <div className="mt-4 grid gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.addressLine1Label}
                  </label>
                  <input
                    value={addressLine1}
                    onChange={(e) => setDraftShippingField("addressLine1", e.target.value)}
                    placeholder={t.addressLine1Placeholder}
                    autoComplete="shipping address-line1"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.addressLine2Label}
                  </label>
                  <input
                    value={addressLine2}
                    onChange={(e) => setDraftShippingField("addressLine2", e.target.value)}
                    placeholder={t.addressLine2Placeholder}
                    autoComplete="shipping address-line2"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.cityLabel}
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setDraftShippingField("city", e.target.value)}
                      placeholder={t.cityPlaceholder}
                      autoComplete="shipping address-level2"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.stateLabel}
                    </label>
                    <input
                      value={stateRegion}
                      onChange={(e) => setDraftShippingField("stateRegion", e.target.value)}
                      placeholder={t.statePlaceholder}
                      autoComplete="shipping address-level1"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.postalLabel}
                    </label>
                    <input
                      value={postalCode}
                      onChange={(e) => setDraftShippingField("postalCode", e.target.value)}
                      placeholder={t.postalPlaceholder}
                      inputMode="numeric"
                      autoComplete="shipping postal-code"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.countryLabel}
                    </label>
                    <input
                      value={country}
                      onChange={(e) => setDraftShippingField("country", e.target.value)}
                      placeholder={t.countryPlaceholder}
                      autoComplete="shipping country"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.checkoutPaymentTitle}</div>
              <div className="mt-1 text-xs leading-5 text-zinc-600">
                {t.checkoutPaymentSubtitle}
              </div>

              <div className="mt-4">
                <div className="text-xs font-semibold text-zinc-700">{t.paymentMethod}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setDraftPaymentMethod("paypal")}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      paymentMethod === "paypal"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    {t.payByPayPal}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDraftPaymentMethod("card")}
                    className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                      paymentMethod === "card"
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50"
                    }`}
                  >
                    {t.payByCard}
                  </button>
                </div>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-zinc-600">{t.cardAcceptedLabel}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {acceptedCardBrands.map((b) => (
                      <CreditCardBrandLogo
                        key={b}
                        brand={b}
                        active={paymentMethod === "card" && cardBrand === b}
                      />
                    ))}
                  </div>
                </div>

                {paymentMessage ? (
                  <div className="mt-2 text-xs font-semibold text-amber-700">
                    {paymentMessage}
                  </div>
                ) : null}
              </div>

              {paymentMethod === "paypal" ? (
                <div className="mt-4 grid gap-3">
                  <Button variant="primary" onClick={handlePayPalContinue} className="w-full">
                    {t.sendWhatsApp}
                  </Button>
                  <div className="text-xs leading-5 text-zinc-500">{t.payPalDisclaimer}</div>
                </div>
              ) : (
                <form onSubmit={handleGoToReview} className="mt-4 grid gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.cardNameLabel}
                  </label>
                  <input
                    value={cardName}
                    onChange={(e) => setDraftCardField("name", e.target.value)}
                    placeholder={t.cardNamePlaceholder}
                    autoComplete="cc-name"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-semibold text-zinc-600">{t.cardAcceptedLabel}</div>
                    <div className="flex flex-wrap items-center gap-2">
                      {acceptedCardBrands.map((b) => (
                        <CreditCardBrandLogo key={b} brand={b} active={cardBrand === b} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs font-semibold text-zinc-700">{t.cardNumberLabel}</label>
                    <input
                      value={cardNumberFormatted}
                      onChange={(e) => {
                        const next = sanitizeCardNumberInput(e.target.value);
                        setDraftCardField("number", next.formatted);
                      }}
                      placeholder={t.cardNumberPlaceholder}
                      inputMode="numeric"
                      autoComplete="cc-number"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                    <div className="mt-2 text-xs text-zinc-600">
                      {t.cardTypeLabel}: <span className="font-semibold">{cardBrandLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-zinc-700">{t.cardExpiryLabel}</label>
                    <input
                      value={cardExpiry}
                      onChange={(e) => setDraftCardField("expiry", sanitizeExpiryInput(e.target.value))}
                      placeholder={t.cardExpiryPlaceholder}
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-zinc-700">{t.cardCvcLabel}</label>
                    <input
                      value={cardCvc}
                      onChange={(e) => setDraftCardField("cvc", sanitizeCvcInput(e.target.value, cardBrand))}
                      placeholder={cardBrand === "amex" ? "1234" : t.cardCvcPlaceholder}
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      maxLength={cardBrand === "amex" ? 4 : 3}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label className="text-xs font-semibold text-zinc-700">{t.cardZipLabel}</label>
                    <input
                      value={cardZip}
                      onChange={(e) => setDraftCardField("zip", e.target.value)}
                      placeholder={t.cardZipPlaceholder}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>

                <Button variant="primary" className="w-full">
                  {t.payNow}
                </Button>

                <div className="text-xs leading-5 text-zinc-500">{t.cardDisclaimer}</div>

                {cardMessage ? (
                  <div className="text-xs font-semibold text-amber-700">
                    {cardMessage}
                  </div>
                ) : null}
                </form>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" onClick={onBack}>
                {t.backToCart}
              </Button>
            </div>

            <div className="mt-3 text-xs leading-5 text-zinc-500">{t.nextStep}</div>
          </div>

          <div>
            <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.summary}</div>
              <div className="mt-4 grid gap-3">
                {cart.map((it) => (
                  <div key={it.key} className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
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

              <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <div className="grid gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-semibold text-zinc-700">{t.checkoutSubtotal}</div>
                    <div className="font-bold text-zinc-900">{money(subtotal, language)}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-zinc-600">
                      {t.taxPrState} ({formatRatePct(taxStateRate)}%)
                    </div>
                    <div className="font-bold text-zinc-900">{money(taxStateAmount, language)}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-zinc-600">
                      {t.taxPrMunicipal} ({formatRatePct(taxMunicipalRate)}%)
                    </div>
                    <div className="font-bold text-zinc-900">{money(taxMunicipalAmount, language)}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="font-semibold text-zinc-700">
                      {t.taxPrTotal} ({formatRatePct(taxRate)}%)
                    </div>
                    <div className="font-bold text-zinc-900">{money(taxAmount, language)}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="text-zinc-600">{t.checkoutShippingFee}</div>
                    <div className="font-bold text-zinc-900">{money(shippingFeeAmount, language)}</div>
                  </div>

                  <div className="mt-1 flex items-center justify-between border-t border-zinc-200/60 pt-3 text-base">
                    <div className="font-extrabold text-zinc-900">{t.checkoutGrandTotal}</div>
                    <div className="text-lg font-extrabold text-zinc-900">
                      {money(grandTotal, language)}
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500">{t.checkoutEditTaxesShippingHint}</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
                {t.checkoutCompleteHint}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: CheckoutReview
function CheckoutReview({
  cart,
  checkoutConfig,
  checkoutDraft,
  onBack,
  onRemove,
  onPlaceOrder,
  t,
  language,
}) {
  const cfg = normalizeCheckoutConfig(checkoutConfig);
  const draft = normalizeCheckoutDraft(checkoutDraft);

  const subtotal = Array.isArray(cart) ? cart.reduce((acc, it) => acc + it.price * it.qty, 0) : 0;

  const taxStateRate = Math.max(0, parseNumberOr(cfg.prTaxStateRatePct, PR_TAX_STATE_RATE_PCT));
  const taxMunicipalRate = Math.max(
    0,
    parseNumberOr(cfg.prTaxMunicipalRatePct, PR_TAX_MUNICIPAL_RATE_PCT)
  );

  const shippingFeeAmount = Math.max(0, parseNumberOr(cfg.defaultShippingFee, 0));

  const taxStateAmount = roundMoney(subtotal * (taxStateRate / 100));
  const taxMunicipalAmount = roundMoney(subtotal * (taxMunicipalRate / 100));
  const taxAmount = roundMoney(taxStateAmount + taxMunicipalAmount);
  const taxRate = roundMoney(taxStateRate + taxMunicipalRate);

  const grandTotal = roundMoney(subtotal + taxAmount + shippingFeeAmount);

  const [message, setMessage] = useState("");
  const [submitToken, setSubmitToken] = useState(0);

  useEffect(() => {
    if (!submitToken) return;
    const timer = window.setTimeout(() => setSubmitToken(0), 2000);
    return () => window.clearTimeout(timer);
  }, [submitToken]);

  // Validation: validateDraft
  function validateDraft() {
    const customerOk = String(draft?.customer?.name || "").trim() && String(draft?.customer?.phone || "").trim();
    const shippingOk = String(draft?.shipping?.addressLine1 || "").trim() && String(draft?.shipping?.city || "").trim();
    return Boolean(customerOk && shippingOk);
  }

  // Action: submitOrder (shows toast then calls onPlaceOrder)
  function submitOrder() {
    setMessage("");

    if (!Array.isArray(cart) || cart.length === 0) {
      setMessage(t.emptyCart);
      return;
    }

    if (draft.paymentMethod !== "card" && draft.paymentMethod !== "paypal") {
      setMessage(t.checkoutDetailsRequired);
      return;
    }

    if (!validateDraft()) {
      setMessage(t.checkoutDetailsRequired);
      return;
    }

    setSubmitToken(Date.now());

    window.setTimeout(() => {
      if (typeof onPlaceOrder !== "function") return;

      onPlaceOrder({
        customer: {
          name: String(draft.customer?.name || "").trim(),
          phone: String(draft.customer?.phone || "").trim(),
          notes: String(draft.customer?.notes || "").trim(),
        },
        shipping: {
          addressLine1: String(draft.shipping?.addressLine1 || "").trim(),
          addressLine2: String(draft.shipping?.addressLine2 || "").trim(),
          city: String(draft.shipping?.city || "").trim(),
          stateRegion: String(draft.shipping?.stateRegion || "").trim(),
          postalCode: String(draft.shipping?.postalCode || "").trim(),
          country: String(draft.shipping?.country || "").trim(),
        },
        paymentMethod: draft.paymentMethod,
        taxRatePct: taxRate,
        taxStateRatePct: taxStateRate,
        taxMunicipalRatePct: taxMunicipalRate,
        shippingFee: shippingFeeAmount,
      });
    }, 900);
  }

  const shipLines = [
    draft?.shipping?.addressLine1,
    draft?.shipping?.addressLine2,
    [draft?.shipping?.city, draft?.shipping?.stateRegion].filter(Boolean).join(", "),
    draft?.shipping?.postalCode,
    draft?.shipping?.country,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .join("\n");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.checkoutReviewTitle} subtitle={t.checkoutReviewSubtitle} />
          <div className="text-lg font-bold text-zinc-900">{money(grandTotal, language)}</div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.yourDetails}</div>
              <div className="mt-2 text-sm font-extrabold text-zinc-900">
                {String(draft?.customer?.name || "").trim() || "—"}
              </div>
              <div className="mt-1 text-xs text-zinc-600">
                {String(draft?.customer?.phone || "").trim() || "—"}
              </div>
              {String(draft?.customer?.notes || "").trim() ? (
                <div className="mt-3 text-xs text-zinc-600">{String(draft.customer.notes)}</div>
              ) : null}

              <div className="mt-6 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <div className="text-xs font-semibold text-zinc-500">{t.shippingTitle}</div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-700">
                  {shipLines || "—"}
                </pre>
              </div>

              {message ? (
                <div className="mt-4 text-xs font-semibold text-amber-700">{message}</div>
              ) : null}

              <div className="mt-6 grid gap-2 md:grid-cols-2">
                <Button variant="secondary" onClick={onBack}>
                  {t.checkoutEditDetails}
                </Button>
                <Button variant="primary" onClick={submitOrder} disabled={Boolean(submitToken)}>
                  {t.checkoutSubmitOrder}
                </Button>
              </div>
            </div>
          </div>

          <div>
            <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.summary}</div>

              {Array.isArray(cart) && cart.length > 0 ? (
                <div className="mt-4 grid gap-3">
                  {cart.map((it) => (
                    <div
                      key={it.key}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl"
                    >
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">{it.category}</div>
                        <div className="mt-1 text-sm font-bold text-zinc-900">
                          {l10n(it.name, language)}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryText} {it.personalization?.text || "—"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryVerse} {it.personalization?.verse || "—"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.qty} {Number(it.qty) || 0}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-bold text-zinc-900">
                          {money((Number(it.price) || 0) * (Number(it.qty) || 0), language)}
                        </div>
                        {typeof onRemove === "function" ? (
                          <div className="mt-2">
                            <Button variant="secondary" onClick={() => onRemove(it.key)}>
                              {t.remove}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
                  {t.emptyCart}
                </div>
              )}

              <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">{t.checkoutSubtotal}</div>
                    <div className="font-semibold text-zinc-900">{money(subtotal, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrState} ({formatRatePct(taxStateRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxStateAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrMunicipal} ({formatRatePct(taxMunicipalRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxMunicipalAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">
                      {t.taxPrTotal} ({formatRatePct(taxRate)}%)
                    </div>
                    <div className="font-semibold text-zinc-900">{money(taxAmount, language)}</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-zinc-600">{t.checkoutShippingFee}</div>
                    <div className="font-semibold text-zinc-900">{money(shippingFeeAmount, language)}</div>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-zinc-200/60 pt-3">
                    <div className="font-extrabold text-zinc-900">{t.checkoutGrandTotal}</div>
                    <div className="text-lg font-extrabold text-zinc-900">{money(grandTotal, language)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {submitToken ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div
            key={submitToken}
            className="pointer-events-none inline-flex max-w-xl items-center gap-3 rounded-[22px] border border-emerald-200 bg-white px-5 py-4 text-base font-extrabold text-emerald-900 shadow-xl"
            style={{ animation: "gbfPop 280ms ease-out" }}
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <span className="absolute inset-0 rounded-full bg-emerald-200 opacity-70 animate-ping" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative h-6 w-6"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span>{t.checkoutOrderSubmittedToast}</span>
          </div>

          <style>{`@keyframes gbfPop { from { transform: translateY(10px) scale(0.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }`}</style>
        </div>
      ) : null}

      <Footer t={t} />
    </div>
  );
}

// Page: OrderConfirmation
function OrderConfirmation({ order, onGoHome, t, language }) {
  const [orderSentToken, setOrderSentToken] = useState(0);

  useEffect(() => {
    if (!order) return;
    setOrderSentToken(Date.now());
  }, [order?.id]);

  useEffect(() => {
    if (!orderSentToken) return;
    const timer = window.setTimeout(() => setOrderSentToken(0), 3000);
    return () => window.clearTimeout(timer);
  }, [orderSentToken]);

  const paymentText =
    order?.paymentMethod === "paypal" || order?.paymentMethod === "whatsapp"
      ? t.ordersPaymentPayPal
      : t.ordersPaymentCard;

  const createdLabel =
    typeof order?.createdAt === "number"
      ? new Date(order.createdAt).toLocaleString(language === "es" ? "es-US" : "en-US")
      : "";

  const ship = order?.shipping || {};
  const shipLines = [
    ship.addressLine1,
    ship.addressLine2,
    [ship.city, ship.stateRegion].filter(Boolean).join(", "),
    ship.postalCode,
    ship.country,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .join("\n");

  const items = Array.isArray(order?.items) ? order.items : [];
  const itemsCount = items.reduce((acc, it) => acc + (Number(it?.qty) || 0), 0);

  const subtotal = Number.isFinite(Number(order?.subtotal))
    ? Number(order.subtotal)
    : roundMoney(
        items.reduce(
          (acc, it) => acc + (Number(it?.qty) || 0) * (Number(it?.unitPrice) || 0),
          0
        )
      );

  const prTax = getPrTaxBreakdownFromOrder(order, subtotal);
  const shippingFee = Number.isFinite(Number(order?.shippingFee)) ? Number(order.shippingFee) : 0;
  const orderTotal = Number.isFinite(Number(order?.total))
    ? Number(order.total)
    : roundMoney(subtotal + prTax.totalAmount + shippingFee);

  // printReceipt
  function printReceipt() {
    if (!order) return;

    const css = `
@import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');

@page { size: letter; margin: 0.6in; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111; }
.muted { color: #555; font-size: 12px; }

.receipt { max-width: 760px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.right { text-align: right; }
.orderNo { font-size: 16px; font-weight: 800; }

.brandRow { display: flex; align-items: center; gap: 10px; }
.brandLogo { width: 42px; height: 42px; object-fit: contain; }
.brandName { font-family: 'Allura', cursive; font-size: 34px; line-height: 1; color: #7a6f69; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.card { border: 1px solid #ddd; border-radius: 12px; padding: 12px; }
.cardTitle { font-size: 12px; font-weight: 800; color: #111; margin-bottom: 6px; }
.items { width: 100%; border-collapse: collapse; margin-top: 10px; }
.items th, .items td { border-bottom: 1px solid #eee; padding: 10px 6px; vertical-align: top; }
.items th { text-align: left; font-size: 12px; color: #333; }
.qty { width: 60px; text-align: right; }
.money { width: 110px; text-align: right; }
.itemName { font-weight: 800; }
.itemMeta { margin-top: 4px; font-size: 12px; color: #555; }
.totalRow { display: flex; justify-content: space-between; margin-top: 14px; font-weight: 900; }
.total { font-size: 18px; }
.footer { margin-top: 16px; }
`;

    openPrintWindow({
      title: `${t.orderConfirmationPrintReceipt} ${order?.orderNumber || ""}`.trim(),
      bodyHtml: buildReceiptHtml({ order, language }),
      cssText: css,
      autoPrint: true,
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.orderConfirmationTitle} subtitle={t.orderConfirmationSubtitle} />

        {!order ? (
          <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
            {t.orderConfirmationNotFound}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Stat
                label={t.orderConfirmationOrderNumber}
                value={order.orderNumber || order.id}
              />
              <Stat label={t.orderConfirmationPaymentMethod} value={paymentText} />
              <Stat label={t.ordersItems} value={String(itemsCount)} />
            </div>

            <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  {createdLabel ? (
                    <div className="text-xs text-zinc-500">
                      {t.ordersPlacedAt}: {createdLabel}
                    </div>
                  ) : null}
                  <div className="mt-2 text-sm font-bold text-zinc-900">
                    {t.total}: {money(orderTotal, language)}
                  </div>

                  <div className="mt-3 grid gap-1 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">{t.checkoutSubtotal}</div>
                      <div className="font-semibold text-zinc-900">{money(subtotal, language)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">
                        {t.taxPrState} ({formatRatePct(prTax.stateRatePct)}%)
                      </div>
                      <div className="font-semibold text-zinc-900">{money(prTax.stateAmount, language)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">
                        {t.taxPrMunicipal} ({formatRatePct(prTax.municipalRatePct)}%)
                      </div>
                      <div className="font-semibold text-zinc-900">{money(prTax.municipalAmount, language)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">
                        {t.taxPrTotal} ({formatRatePct(prTax.totalRatePct)}%)
                      </div>
                      <div className="font-semibold text-zinc-900">{money(prTax.totalAmount, language)}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-zinc-600">{t.checkoutShippingFee}</div>
                      <div className="font-semibold text-zinc-900">{money(shippingFee, language)}</div>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-zinc-200/60 pt-2">
                      <div className="font-extrabold text-zinc-900">{t.checkoutGrandTotal}</div>
                      <div className="font-extrabold text-zinc-900">{money(orderTotal, language)}</div>
                    </div>
                  </div>

                  {order?.trackingNumber ? (
                    <div className="mt-2 text-xs text-zinc-600">
                      {t.ordersTrackingNumberLabel}: {order.trackingNumber}
                    </div>
                  ) : null}
                  {order?.etaText ? (
                    <div className="mt-1 text-xs text-zinc-600">
                      {t.ordersEtaLabel}: {order.etaText}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <Button variant="secondary" onClick={printReceipt}>
                    {t.orderConfirmationPrintReceipt}
                  </Button>
                  <Button variant="primary" onClick={onGoHome}>
                    {t.orderConfirmationGoHome}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
                <div className="text-xs font-semibold text-zinc-500">{t.ordersCustomer}</div>
                <div className="mt-1 text-sm font-bold text-zinc-900">
                  {order?.customer?.name || "—"}
                </div>
                {order?.customer?.phone ? (
                  <div className="mt-1 text-xs text-zinc-600">{order.customer.phone}</div>
                ) : null}
                {order?.customer?.notes ? (
                  <div className="mt-2 text-xs text-zinc-600">{order.customer.notes}</div>
                ) : null}
              </div>

              <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
                <div className="text-xs font-semibold text-zinc-500">{t.ordersShipping}</div>
                <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-700">
                  {shipLines || "—"}
                </pre>
              </div>
            </div>

            <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div className="text-sm font-bold text-zinc-900">{t.ordersItems}</div>
              <div className="mt-3 grid gap-2">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-start justify-between gap-3 rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {l10n(it.name, language)}
                      </div>
                      {it?.personalization?.text ? (
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryText} {it.personalization.text}
                        </div>
                      ) : null}
                      {it?.personalization?.verse ? (
                        <div className="mt-1 text-xs text-zinc-600">
                          {t.summaryVerse} {it.personalization.verse}
                        </div>
                      ) : null}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-900">×{Number(it.qty) || 0}</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {money(Number(it.unitPrice) || 0, language)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {orderSentToken ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div
            key={orderSentToken}
            className="pointer-events-none inline-flex max-w-xl items-center gap-3 rounded-[22px] border border-emerald-200 bg-white px-5 py-4 text-base font-extrabold text-emerald-900 shadow-xl"
            style={{ animation: "gbfPop 280ms ease-out" }}
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <span className="absolute inset-0 rounded-full bg-emerald-200 opacity-70 animate-ping" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative h-6 w-6"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span>{t.orderConfirmationToastOrderSent}</span>
          </div>

          <style>{`@keyframes gbfPop { from { transform: translateY(10px) scale(0.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }`}</style>
        </div>
      ) : null}

      <Footer t={t} />
    </div>
  );
}

// Page: OrderStatus
function OrderStatus({ orders, setOrders, t, language }) {
  const [orderNumber, setOrderNumber] = useState("");
  const [searchedOrderNumber, setSearchedOrderNumber] = useState("");

  const [cancelReason, setCancelReason] = useState("");
  const [cancelRequestMessage, setCancelRequestMessage] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelSuccessToken, setCancelSuccessToken] = useState(0);

  useEffect(() => {
    if (!cancelSuccessToken) return;
    const timer = window.setTimeout(() => setCancelSuccessToken(0), 3000);
    return () => window.clearTimeout(timer);
  }, [cancelSuccessToken]);

  const normalizedQuery = String(searchedOrderNumber || "").trim().toLowerCase();

  const order = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    if (!normalizedQuery) return null;

    return (
      list.find((o) => String(o?.orderNumber || "").trim().toLowerCase() === normalizedQuery) || null
    );
  }, [orders, normalizedQuery]);

  const status = normalizeOrderStatus(order?.status);
  const statusText = order ? orderStatusLabel(status, t) : "";
  const statusClass = order ? orderStatusBadgeClass(status) : "";

  const updatedAtMs =
    typeof order?.statusUpdatedAt === "number"
      ? order.statusUpdatedAt
      : typeof order?.updatedAt === "number"
      ? order.updatedAt
      : typeof order?.createdAt === "number"
      ? order.createdAt
      : null;

  const updatedAtLabel =
    updatedAtMs != null
      ? new Date(updatedAtMs).toLocaleString(language === "es" ? "es-US" : "en-US")
      : "";

  const cancelRequested =
    Boolean(order?.customerCancelRequestedAt) && Boolean(order?.customerCancelRequestReason);

  const canRequestCancel = Boolean(order) && isOpenOrderStatus(status) && !cancelRequested;

  // Handler: submitLookup
  function submitLookup(e) {
    e.preventDefault();
    setCancelRequestMessage("");
    setSearchedOrderNumber(orderNumber.trim());
  }

  // Handler: sendCancelRequest
  function sendCancelRequest() {
    setCancelRequestMessage("");
    const reason = cancelReason.trim();
    if (!order || !reason || typeof setOrders !== "function") return;

    setOrders((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      return base.map((o) => {
        if (o?.id !== order.id) return o;
        return {
          ...o,
          customerCancelRequestReason: reason,
          customerCancelRequestedAt: Date.now(),
          updatedAt: Date.now(),
        };
      });
    });

    setCancelReason("");
    setShowCancelModal(false);
    setCancelRequestMessage(t.orderStatusCancelRequestSent);
    setCancelSuccessToken(Date.now());
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.orderStatusTitle} subtitle={t.orderStatusSubtitle} />

        <form onSubmit={submitLookup} className="grid gap-3 md:grid-cols-3 md:items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-zinc-700">
              {t.orderStatusOrderNumberLabel}
            </label>
            <input
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder={t.orderStatusOrderNumberPlaceholder}
              className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
            />
          </div>
          <Button variant="primary" className="w-full">
            {t.orderStatusLookup}
          </Button>
        </form>

        {!normalizedQuery ? null : !order ? (
          <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
            {t.orderStatusNotFound}
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold text-zinc-500">{t.orderConfirmationOrderNumber}</div>
                  <div className="mt-1 text-sm font-extrabold text-zinc-900">
                    {order.orderNumber || order.id}
                  </div>

                  {updatedAtLabel ? (
                    <div className="mt-2 text-xs text-zinc-600">
                      {t.orderStatusUpdatedAt}: {updatedAtLabel}
                    </div>
                  ) : null}
                </div>

                <div className="text-right">
                  <div className="text-xs font-semibold text-zinc-500">{t.orderStatusCurrentStatus}</div>
                  <div className={`mt-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                    {statusText}
                  </div>
                </div>
              </div>

              {status === "shipped" && order?.trackingNumber ? (
                <div className="mt-3 text-sm text-zinc-700">
                  <span className="font-semibold">{t.orderStatusTracking}:</span> {order.trackingNumber}
                </div>
              ) : null}

              {order?.etaText ? (
                <div className="mt-1 text-sm text-zinc-700">
                  <span className="font-semibold">{t.orderStatusEta}:</span> {order.etaText}
                </div>
              ) : null}

              {status === "cancelled" && order?.cancelReason ? (
                <div className="mt-3 text-sm text-zinc-700">
                  <span className="font-semibold">{t.ordersCancelReasonLabel}:</span> {order.cancelReason}
                </div>
              ) : null}

              {cancelRequested ? (
                <div className="mt-3 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-700 shadow-sm backdrop-blur-xl">
                  <div className="text-xs font-semibold text-zinc-500">{t.orderStatusCancelRequestTitle}</div>
                  <div className="mt-2">
                    {order?.customerCancelRequestReason}
                  </div>
                </div>
              ) : null}
            </div>

            {canRequestCancel ? (
              <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
                <Button
                  variant="primary"
                  className="w-full md:w-auto"
                  onClick={() => {
                    setCancelRequestMessage("");
                    setShowCancelModal(true);
                  }}
                >
                  {t.orderStatusRequestCancelButton}
                </Button>
              </div>
            ) : null}

            {canRequestCancel && showCancelModal ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="w-full max-w-xl rounded-[24px] border border-zinc-200 bg-white p-5 shadow-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-extrabold text-zinc-900">
                        {t.orderStatusRequestCancelButton}
                      </div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {t.orderStatusCancelRequestReasonLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCancelModal(false)}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700 hover:border-zinc-300"
                    >
                      {t.orderStatusCancelModalClose}
                    </button>
                  </div>

                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={4}
                    placeholder={t.orderStatusCancelRequestReasonPlaceholder}
                    className="mt-4 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                      {t.orderStatusCancelModalClose}
                    </Button>
                    <Button variant="primary" onClick={sendCancelRequest} disabled={!cancelReason.trim()}>
                      {t.orderStatusSendCancelRequest}
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {cancelSuccessToken ? (
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div
            key={cancelSuccessToken}
            className="pointer-events-none inline-flex max-w-xl items-center gap-3 rounded-[22px] border border-emerald-200 bg-white px-5 py-4 text-base font-extrabold text-emerald-900 shadow-xl"
            style={{ animation: "gbfPop 280ms ease-out" }}
          >
            <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
              <span className="absolute inset-0 rounded-full bg-emerald-200 opacity-70 animate-ping" />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="relative h-6 w-6"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span>{t.orderStatusCancelRequestSent}</span>
          </div>

          <style>{`@keyframes gbfPop { from { transform: translateY(10px) scale(0.98); opacity: 0 } to { transform: translateY(0) scale(1); opacity: 1 } }`}</style>
        </div>
      ) : null}

      <Footer t={t} />
    </div>
  );
}

// Page: Blog
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
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.blogTitle} subtitle={t.blogSubtitle} />
        <div className="grid gap-3 md:grid-cols-3">
          {posts.map((p, idx) => (
            <div
              key={`${l10n(p.title, "en") || l10n(p.title, "es")}-${idx}`}
              className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
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

// Page: About
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
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.valuesTitle} subtitle={t.valuesSubtitle} />
        <div className="grid gap-3 md:grid-cols-2">
          {values.map((v, idx) => (
            <div
              key={`${l10n(v.title, "en") || l10n(v.title, "es")}-${idx}`}
              className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
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

        <div className="mt-6 rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
          <div className="text-sm font-bold text-zinc-900">{t.missionTitle}</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">{t.missionText}</p>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminPanel
function AdminPanel({
  products = [],
  setProducts,
  categories = [],
  setCategories,
  heroConfig,
  setHeroConfig,
  inventory,
  setInventory,
  productCosts,
  setProductCosts,
  sales,
  orders,
  setOrders,
  checkoutConfig,
  setCheckoutConfig,
  onGoOrders,
  onGoProfit,
  t,
  language,
}) {
  const fallbackCategory = categories[0] ?? "Yeti";

  const [newCategory, setNewCategory] = useState("");

  const [uploading, setUploading] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});


  const ordersList = Array.isArray(orders) ? orders : [];
  const openOrders = ordersList.filter((o) =>
    isOpenOrderStatus(normalizeOrderStatus(o?.status))
  );

  // getInventoryCount
  function getInventoryCount(productId) {
    const n = Number(inventory?.[productId]);
    return Number.isFinite(n) ? n : 0;
  }


  // setInventoryCount
  function setInventoryCount(productId, value) {
    const n = Number(value);
    setInventory((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      [productId]: Number.isFinite(n) ? n : 0,
    }));
  }


  // adjustInventory
  function adjustInventory(productId, delta) {
    setInventoryCount(productId, getInventoryCount(productId) + delta);
  }


  // getUnitCost
  function getUnitCost(productId) {
    const n = Number(productCosts?.[productId]);
    return Number.isFinite(n) ? n : 0;
  }


  // setUnitCost
  function setUnitCost(productId, value) {
    const n = Number(value);
    setProductCosts((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      [productId]: Number.isFinite(n) ? n : 0,
    }));
  }
  

  // setHeroEnabled
  function setHeroEnabled(enabled) {
    setHeroConfig((prev) => ({ ...normalizeHeroConfig(prev), enabled }));
  }


  // setHeroTextField
  function setHeroTextField(field, lang, value) {
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      [field]: {
        ...(prev?.[field] || {}),
        [lang]: value,
      },
    }));
  }


  // setHeroImageField
  function setHeroImageField(field, value) {
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      images: {
        ...(prev?.images || {}),
        [field]: value,
      },
    }));
  }


  // setHeroPromoType
  function setHeroPromoType(value) {
    const promoType = value === "promo" ? "promo" : "content";
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      promoType,
    }));
  }


  // setHeroPromoScheduleField
  function setHeroPromoScheduleField(field, value) {
    setHeroConfig((prev) => ({
      ...normalizeHeroConfig(prev),
      promoSchedule: {
        ...(prev?.promoSchedule || {}),
        [field]: value,
      },
    }));
  }


  // resetHero
  function resetHero() {
    setHeroConfig(buildDefaultHeroConfig());
  }


  // handleUploadImage
  async function handleUploadImage({ key, file, filenamePrefix, onSuccess }) {
    if (!file) return;

    setUploadErrors((prev) => ({ ...(prev || {}), [key]: "" }));
    setUploading((prev) => ({ ...(prev || {}), [key]: true }));

    try {
      const filename = buildUploadFilename(filenamePrefix, file);
      const url = await uploadImageToPublicImages({ file, filename });
      onSuccess(url);
    } catch (err) {
      setUploadErrors((prev) => ({
        ...(prev || {}),
        [key]: err?.message || "Upload failed",
      }));
    } finally {
      setUploading((prev) => ({ ...(prev || {}), [key]: false }));
    }
  }

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: fallbackCategory,
    price: "",
    short: "",
    description: "",
    image: "",
  });

  // handleAddCategory
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


  // handleDeleteCategory
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


  // handleNewProductChange
  function handleNewProductChange(e) {
    const { name, value } = e.target;

    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


  // handleAddProduct
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

  const normalizedCheckoutConfig = normalizeCheckoutConfig(checkoutConfig);

  // setCheckoutConfigField
  function setCheckoutConfigField(field, value) {
    if (typeof setCheckoutConfig !== "function") return;

    setCheckoutConfig((prev) =>
      normalizeCheckoutConfig({
        ...(prev && typeof prev === "object" ? prev : {}),
        [field]: value,
      })
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.adminTitle} subtitle={t.adminSubtitle} />

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-bold text-zinc-900">{t.adminStatProducts}</div>

            <div className="mt-2 text-3xl font-extrabold text-zinc-900">
              {products.length}
            </div>

            <p className="mt-1 text-sm text-zinc-600">{t.adminStatProductsBody}</p>
          </div>

          <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-bold text-zinc-900">{t.adminStatMode}</div>

            <div className="mt-2 text-3xl font-extrabold text-zinc-900">
              MVP
            </div>

            <p className="mt-1 text-sm text-zinc-600">{t.adminStatModeBody}</p>
          </div>

          {/* Dashboard card: Profit / Loss (go to AdminProfit page) */}
          <button
            type="button"
            onClick={() => (typeof onGoProfit === "function" ? onGoProfit() : null)}
            className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/70"
          >
            <div className="text-sm font-bold text-zinc-900">{t.profitTitle}</div>

            <div className="mt-2 text-3xl font-extrabold text-zinc-900">P/L</div>

            <p className="mt-1 text-sm text-zinc-600">{t.adminProfitCardBody}</p>
          </button>

          {/* Dashboard card: Orders (go to AdminOrders page) */}
          <button
            type="button"
            onClick={() => (typeof onGoOrders === "function" ? onGoOrders() : null)}
            className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 text-left shadow-sm backdrop-blur-xl transition hover:bg-white/70"
          >
            <div className="text-sm font-bold text-zinc-900">{t.ordersTitle}</div>

            <div className="mt-2 text-3xl font-extrabold text-zinc-900">
              {openOrders.length}
            </div>

            <p className="mt-1 text-sm text-zinc-600">
              {t.adminStatOrdersPendingBody} · {t.ordersTotal}: {ordersList.length}
            </p>
          </button>
        </div>

        {/* Admin: Checkout Settings */}
        <div className="mt-8 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
          <SectionTitle
            title={t.adminCheckoutSettingsTitle}
            subtitle={t.adminCheckoutSettingsSubtitle}
          />

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-zinc-700">
                {t.adminCheckoutTaxStateRateLabel}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={String(normalizedCheckoutConfig.prTaxStateRatePct)}
                onChange={(e) => setCheckoutConfigField("prTaxStateRatePct", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">
                {t.adminCheckoutTaxMunicipalRateLabel}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={String(normalizedCheckoutConfig.prTaxMunicipalRatePct)}
                onChange={(e) =>
                  setCheckoutConfigField("prTaxMunicipalRatePct", e.target.value)
                }
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700">
                {t.adminCheckoutDefaultShippingLabel}
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                inputMode="decimal"
                placeholder={language === "es" ? "0.00" : "0.00"}
                value={String(normalizedCheckoutConfig.defaultShippingFee)}
                onChange={(e) => setCheckoutConfigField("defaultShippingFee", e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <div className="mt-1 text-[11px] text-zinc-500">USD</div>
            </div>
          </div>

          <div className="mt-3 text-xs text-zinc-500">
            {t.taxPrTotal} ({formatRatePct(
              normalizedCheckoutConfig.prTaxStateRatePct +
                normalizedCheckoutConfig.prTaxMunicipalRatePct
            )}%)
          </div>
        </div>

        {/* Dashboard: Inventory */}
        <div className="mt-8 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
          <SectionTitle title={t.inventoryTitle} subtitle={t.inventorySubtitle} />

          <div className="grid gap-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="flex flex-col gap-4 rounded-[24px] border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.image}
                    alt={l10n(p.name, language)}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                  <div>
                    <div className="text-xs font-semibold text-zinc-500">{p.category}</div>
                    <div className="mt-1 text-sm font-bold text-zinc-900">
                      {l10n(p.name, language)}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2 md:items-end">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.inventoryInStock}
                    </label>
                    <input
                      type="number"
                      value={getInventoryCount(p.id)}
                      onChange={(e) => setInventoryCount(p.id, e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => adjustInventory(p.id, -1)}
                        className="w-full"
                      >
                        {t.inventoryAdjustMinus}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => adjustInventory(p.id, 1)}
                        className="w-full"
                      >
                        {t.inventoryAdjustPlus}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.inventoryUnitCost}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={getUnitCost(p.id)}
                      onChange={(e) => setUnitCost(p.id, e.target.value)}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Admin: Home Hero Promotion */}
        <div className="mt-8 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
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

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-zinc-900">
                {t.heroAdminTypeLabel}
              </label>
              <select
                value={heroConfig?.promoType === "promo" ? "promo" : "content"}
                onChange={(e) => setHeroPromoType(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
              >
                <option value="content">{t.heroAdminTypeContent}</option>
                <option value="promo">{t.heroAdminTypePromo}</option>
              </select>
            </div>

            {heroConfig?.promoType === "promo" ? (
              <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                <div className="text-sm font-bold text-zinc-900">
                  {t.heroAdminScheduleTitle}
                </div>

                <div className="mt-3 grid gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700">
                        {t.heroAdminStartLabel}
                      </label>
                      <input
                        type="datetime-local"
                        value={heroConfig?.promoSchedule?.startLocal || ""}
                        onChange={(e) =>
                          setHeroPromoScheduleField("startLocal", e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-zinc-700">
                        {t.heroAdminEndLabel}
                      </label>
                      <input
                        type="datetime-local"
                        value={heroConfig?.promoSchedule?.endLocal || ""}
                        onChange={(e) =>
                          setHeroPromoScheduleField("endLocal", e.target.value)
                        }
                        className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                      />
                    </div>
                  </div>

                  <div className="text-xs text-zinc-500">
                    {t.heroAdminScheduleHint}
                    {heroConfig?.enabled ? (
                      <>
                        {" · "}
                        {isHeroOverrideActive(heroConfig)
                          ? t.heroAdminStatusActive
                          : t.heroAdminStatusInactive}
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
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

                <div className="mt-2">
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.uploadImageLabel}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={Boolean(uploading["hero:hero"])}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      handleUploadImage({
                        key: "hero:hero",
                        file,
                        filenamePrefix: "hero-hero",
                        onSuccess: (url) => setHeroImageField("hero", url),
                      });
                    }}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                  />

                  {uploading["hero:hero"] ? (
                    <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                  ) : null}

                  {uploadErrors["hero:hero"] ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">
                      {t.uploadFailed} {uploadErrors["hero:hero"]}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                  )}
                </div>
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

                <div className="mt-2">
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.uploadImageLabel}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={Boolean(uploading["hero:product1"])}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      handleUploadImage({
                        key: "hero:product1",
                        file,
                        filenamePrefix: "hero-product1",
                        onSuccess: (url) => setHeroImageField("product1", url),
                      });
                    }}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                  />

                  {uploading["hero:product1"] ? (
                    <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                  ) : null}

                  {uploadErrors["hero:product1"] ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">
                      {t.uploadFailed} {uploadErrors["hero:product1"]}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                  )}
                </div>
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

                <div className="mt-2">
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.uploadImageLabel}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={Boolean(uploading["hero:product2"])}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      handleUploadImage({
                        key: "hero:product2",
                        file,
                        filenamePrefix: "hero-product2",
                        onSuccess: (url) => setHeroImageField("product2", url),
                      });
                    }}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                  />

                  {uploading["hero:product2"] ? (
                    <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                  ) : null}

                  {uploadErrors["hero:product2"] ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">
                      {t.uploadFailed} {uploadErrors["hero:product2"]}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
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

        <div className="mt-8 rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl">
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

                <div className="mt-2">
                  <label className="text-xs font-semibold text-zinc-700">
                    {t.uploadImageLabel}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={Boolean(uploading["newProduct:image"])}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      handleUploadImage({
                        key: "newProduct:image",
                        file,
                        filenamePrefix: "product-new",
                        onSuccess: (url) =>
                          setNewProduct((prev) => ({ ...prev, image: url })),
                      });
                    }}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                  />

                  {uploading["newProduct:image"] ? (
                    <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                  ) : null}

                  {uploadErrors["newProduct:image"] ? (
                    <div className="mt-1 text-xs font-semibold text-red-600">
                      {t.uploadFailed} {uploadErrors["newProduct:image"]}
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                  )}
                </div>
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
                className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
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

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.productImageLabel}
                    </label>
                    <input
                      value={product.image}
                      onChange={(e) => {
                        const nextUrl = e.target.value;
                        setProducts((prev) =>
                          prev.map((p) =>
                            p.id === product.id ? { ...p, image: nextUrl } : p
                          )
                        );
                      }}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700">
                      {t.uploadImageLabel}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={Boolean(uploading[`product:${product.id}`])}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        e.target.value = "";
                        handleUploadImage({
                          key: `product:${product.id}`,
                          file,
                          filenamePrefix: `product-${product.id}`,
                          onSuccess: (url) => {
                            setProducts((prev) =>
                              prev.map((p) =>
                                p.id === product.id ? { ...p, image: url } : p
                              )
                            );
                          },
                        });
                      }}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-2 text-sm"
                    />

                    {uploading[`product:${product.id}`] ? (
                      <div className="mt-1 text-xs text-zinc-600">{t.uploading}</div>
                    ) : null}

                    {uploadErrors[`product:${product.id}`] ? (
                      <div className="mt-1 text-xs font-semibold text-red-600">
                        {t.uploadFailed} {uploadErrors[`product:${product.id}`]}
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-zinc-500">{t.uploadDevOnlyHint}</div>
                    )}
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

// Page: AdminProfit
function AdminProfit({ products = [], sales, orders, t, language, onBack }) {
  const [profitPeriod, setProfitPeriod] = useState("week");
  const [profitDate, setProfitDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
  });

  const profitRange = useMemo(() => {
    const base = new Date(`${profitDate}T00:00:00`);
    if (Number.isNaN(base.getTime())) {
      const now = new Date();
      return { startMs: now.getTime(), endMs: now.getTime() };
    }

    if (profitPeriod === "day") {
      const start = new Date(base);
      const end = new Date(base);
      end.setDate(end.getDate() + 1);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }

    if (profitPeriod === "month") {
      const start = new Date(base.getFullYear(), base.getMonth(), 1);
      const end = new Date(base.getFullYear(), base.getMonth() + 1, 1);
      return { startMs: start.getTime(), endMs: end.getTime() };
    }

    // week (Mon-Sun)
    const day = base.getDay(); // 0 Sun ... 6 Sat
    const diffToMonday = (day + 6) % 7;
    const start = new Date(base);
    start.setDate(start.getDate() - diffToMonday);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { startMs: start.getTime(), endMs: end.getTime() };
  }, [profitDate, profitPeriod]);

  const profitStats = useMemo(() => {
    const rows = Array.isArray(sales) ? sales : [];
    const inRange = rows.filter(
      (s) =>
        typeof s?.createdAt === "number" &&
        s.createdAt >= profitRange.startMs &&
        s.createdAt < profitRange.endMs
    );

    let revenue = 0;
    let cogs = 0;
    let units = 0;

    const byProduct = new Map();

    for (const s of inRange) {
      const qty = Number(s.qty) || 0;
      const unitPrice = Number(s.unitPrice) || 0;
      const unitCost = Number(s.unitCost) || 0;
      const productId = String(s.productId ?? "");

      units += qty;
      revenue += qty * unitPrice;
      cogs += qty * unitCost;

      if (!byProduct.has(productId)) {
        byProduct.set(productId, {
          productId,
          units: 0,
          revenue: 0,
          profit: 0,
        });
      }

      const agg = byProduct.get(productId);
      agg.units += qty;
      agg.revenue += qty * unitPrice;
      agg.profit += qty * (unitPrice - unitCost);
    }

    const grossProfit = revenue - cogs;
    const margin = revenue > 0 ? grossProfit / revenue : 0;

    const topProducts = Array.from(byProduct.values())
      .filter((x) => x.productId)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5)
      .map((x) => {
        const product = products.find((p) => p.id === x.productId);
        return {
          ...x,
          name: product ? l10n(product.name, language) : x.productId,
        };
      });

    return { inRange, revenue, cogs, grossProfit, margin, units, topProducts };
  }, [sales, profitRange, products, language]);

  const taxCollectedStats = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    let inRangeTax = 0;
    let allTimeTax = 0;

    for (const o of list) {
      const status = o?.status || "pending";
      if (status === "cancelled") continue;

      const createdAt = typeof o?.createdAt === "number" ? o.createdAt : null;
      const prTax = getPrTaxBreakdownFromOrder(o, 0);
      const tax = Number(prTax?.totalAmount) || 0;

      allTimeTax += tax;

      if (createdAt != null && createdAt >= profitRange.startMs && createdAt < profitRange.endMs) {
        inRangeTax += tax;
      }
    }

    return {
      inRange: roundMoney(inRangeTax),
      allTime: roundMoney(allTimeTax),
    };
  }, [orders, profitRange]);

  // printProfitReportPdf
  function printProfitReportPdf() {
    const css = `
@import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');

@page { size: letter; margin: 0.7in; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111; }

.report { max-width: 860px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding-bottom: 14px; border-bottom: 1px solid #e5e7eb; }
.brandRow { display: flex; align-items: center; gap: 12px; }
.brandLogo { width: 44px; height: 44px; object-fit: contain; }
.brandName { font-family: 'Allura', cursive; font-size: 34px; line-height: 1; color: #7a6f69; }
.muted { color: #555; font-size: 12px; }
.meta { font-size: 12px; line-height: 1.55; }
.label { font-weight: 800; color: #111; }

.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px; }
.card { border: 1px solid #e5e7eb; border-radius: 14px; padding: 12px; }
.cardLabel { font-size: 12px; color: #555; font-weight: 700; }
.cardValue { margin-top: 6px; font-size: 16px; font-weight: 900; }

.section { margin-top: 18px; }
.sectionTitle { font-size: 14px; font-weight: 900; margin-bottom: 8px; }

.table { width: 100%; border-collapse: collapse; }
.table th, .table td { border-bottom: 1px solid #eee; padding: 10px 6px; vertical-align: top; }
.table th { text-align: left; font-size: 12px; color: #333; }
.table td { font-size: 12px; }
.name { font-weight: 700; }
.num { text-align: right; width: 70px; }
.money { text-align: right; width: 120px; }

.footer { margin-top: 14px; }

@media print {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
`;

    const body = buildProfitReportHtml({
      language,
      profitPeriod,
      profitDate,
      profitRange,
      profitStats,
      taxCollectedStats,
    });

    const title = `${t.profitTitle} — ${profitDate || ""}`.trim();

    openPrintWindow({
      title,
      bodyHtml: body,
      cssText: css,
      autoPrint: true,
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.profitTitle} subtitle={t.profitSubtitle} />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={printProfitReportPdf}>
              {t.profitReportPdfButton}
            </Button>
            <Button
              variant="secondary"
              onClick={() => (typeof onBack === "function" ? onBack() : null)}
            >
              {t.back}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.profitPeriodLabel}</label>
                  <select
                    value={profitPeriod}
                    onChange={(e) => setProfitPeriod(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  >
                    <option value="day">{t.profitDay}</option>
                    <option value="week">{t.profitWeek}</option>
                    <option value="month">{t.profitMonth}</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.profitDateLabel}</label>
                  <input
                    type="date"
                    value={profitDate}
                    onChange={(e) => setProfitDate(e.target.value)}
                    className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Stat label={t.profitRevenue} value={money(profitStats.revenue, language)} />
                <Stat label={t.profitCogs} value={money(profitStats.cogs, language)} />
                <Stat label={t.profitGrossProfit} value={money(profitStats.grossProfit, language)} />
                <Stat label={t.profitMargin} value={`${(profitStats.margin * 100).toFixed(1)}%`} />
                <Stat label={t.profitUnits} value={String(profitStats.units)} />
                <Stat label={t.profitTaxCollected} value={money(taxCollectedStats.inRange, language)} />
                <Stat label={t.profitTaxCollectedAllTime} value={money(taxCollectedStats.allTime, language)} />
              </div>

              {profitStats.inRange.length === 0 ? (
                <div className="text-sm text-zinc-600">{t.profitNoSales}</div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-bold text-zinc-900">{t.profitTopProducts}</div>
            <div className="mt-3 grid gap-2">
              {profitStats.topProducts.length === 0 ? (
                <div className="text-sm text-zinc-600">{t.profitNoSales}</div>
              ) : (
                profitStats.topProducts.map((x) => (
                  <div
                    key={x.productId}
                    className="flex items-center justify-between rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-900">{x.name}</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        {t.profitUnits}: {x.units}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-zinc-900">{money(x.profit, language)}</div>
                      <div className="mt-1 text-xs text-zinc-600">{money(x.revenue, language)}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer t={t} />
    </div>
  );
}

// Page: AdminOrders
function AdminOrders({ orders, setOrders, t, language, onBack }) {
  const ordersList = Array.isArray(orders) ? orders : [];
  const openOrders = ordersList.filter((o) =>
    isOpenOrderStatus(normalizeOrderStatus(o?.status))
  );

  const [expandedOrders, setExpandedOrders] = useState({});

  const [orderStatusDrafts, setOrderStatusDrafts] = useState({});
  const [orderStatusErrors, setOrderStatusErrors] = useState({});

  // toggleOrderDetails
  function toggleOrderDetails(orderId) {
    setExpandedOrders((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      [orderId]: !Boolean(prev?.[orderId]),
    }));
  }

  // Draft setter: setOrderStatusDraft
  function setOrderStatusDraft(orderId, patch) {
    setOrderStatusErrors((prev) => ({ ...(prev || {}), [orderId]: "" }));
    setOrderStatusDrafts((prev) => ({
      ...(prev && typeof prev === "object" ? prev : {}),
      [orderId]: {
        ...(prev?.[orderId] || {}),
        ...(patch && typeof patch === "object" ? patch : {}),
      },
    }));
  }

  // Action: applyOrderStatusUpdate
  function applyOrderStatusUpdate(order) {
    if (!order?.id || typeof setOrders !== "function") return;

    const draft = orderStatusDrafts?.[order.id] || {};
    const nextStatus = normalizeOrderStatus(draft.nextStatus || order.status);

    const trackingNumber = String(order?.trackingNumber || "").trim();

    const cancelReason = String(
      (draft.cancelReason || "").trim() ||
        (order?.cancelReason || "").trim() ||
        (order?.customerCancelRequestReason || "").trim()
    ).trim();

    if (nextStatus === "cancelled" && !cancelReason) {
      setOrderStatusErrors((prev) => ({
        ...(prev || {}),
        [order.id]: t.ordersStatusCancelReasonRequired,
      }));
      return;
    }

    if (nextStatus === "shipped" && !trackingNumber) {
      setOrderStatusErrors((prev) => ({
        ...(prev || {}),
        [order.id]: t.ordersStatusTrackingRequired,
      }));
      return;
    }

    const now = Date.now();

    setOrders((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      return base.map((o) => {
        if (o?.id !== order.id) return o;

        const next = {
          ...o,
          status: nextStatus,
          statusUpdatedAt: now,
          updatedAt: now,
          shippedAt:
            nextStatus === "shipped"
              ? typeof o?.shippedAt === "number"
                ? o.shippedAt
                : now
              : null,
          cancelledAt: nextStatus === "cancelled" ? now : null,
          cancelReason: nextStatus === "cancelled" ? cancelReason : "",
        };

        return next;
      });
    });
  }

  // printShippingLabel
  function printShippingLabel(order) {
    const css = `
@page { size: 4in 6in; margin: 0; }
html, body { width: 4in; height: 6in; margin: 0; padding: 0; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; }
.page { box-sizing: border-box; width: 100%; height: 100%; padding: 0.25in; }
.row { display: flex; justify-content: space-between; gap: 12px; }
.brand { font-size: 18px; font-weight: 800; }
.muted { color: #555; font-size: 12px; }
.orderNo { font-size: 16px; font-weight: 800; }
.box { margin-top: 16px; border: 2px solid #000; border-radius: 10px; padding: 14px; }
.name { margin-top: 6px; font-size: 22px; font-weight: 800; }
.address { margin-top: 10px; font-size: 18px; line-height: 1.2; font-weight: 700; }
.phone { margin-top: 10px; font-size: 16px; font-weight: 700; }
.footer { position: absolute; left: 0.25in; right: 0.25in; bottom: 0.25in; }
.small { font-size: 11px; }
`;

    const body = buildShippingLabelHtml({ order, language });
    openPrintWindow({
      title: `${t.ordersPrintLabel} ${order?.orderNumber || ""}`.trim(),
      bodyHtml: body,
      cssText: css,
      autoPrint: true,
    });
  }

  // printReceiptPdf
  function printReceiptPdf(order) {
    const css = `
@import url('https://fonts.googleapis.com/css2?family=Allura&display=swap');

@page { size: letter; margin: 0.6in; }
body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color: #111; }
.muted { color: #555; font-size: 12px; }

.receipt { max-width: 760px; margin: 0 auto; }
.header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 18px; }
.right { text-align: right; }
.orderNo { font-size: 16px; font-weight: 800; }

.brandRow { display: flex; align-items: center; gap: 10px; }
.brandLogo { width: 42px; height: 42px; object-fit: contain; }
.brandName { font-family: 'Allura', cursive; font-size: 34px; line-height: 1; color: #7a6f69; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
.card { border: 1px solid #ddd; border-radius: 12px; padding: 12px; }
.cardTitle { font-size: 12px; font-weight: 800; color: #111; margin-bottom: 6px; }
.items { width: 100%; border-collapse: collapse; margin-top: 10px; }
.items th, .items td { border-bottom: 1px solid #eee; padding: 10px 6px; vertical-align: top; }
.items th { text-align: left; font-size: 12px; color: #333; }
.qty { width: 60px; text-align: right; }
.money { width: 110px; text-align: right; }
.itemName { font-weight: 800; }
.itemMeta { margin-top: 4px; font-size: 12px; color: #555; }
.totalRow { display: flex; justify-content: space-between; margin-top: 14px; font-weight: 900; }
.total { font-size: 18px; }
.footer { margin-top: 16px; }
`;

    const body = buildReceiptHtml({ order, language });
    openPrintWindow({
      title: `${t.ordersPrintReceipt} ${order?.orderNumber || ""}`.trim(),
      bodyHtml: body,
      cssText: css,
      autoPrint: true,
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle title={t.ordersTitle} subtitle={t.ordersSubtitle} />
          <Button
            variant="secondary"
            onClick={() => (typeof onBack === "function" ? onBack() : null)}
          >
            {t.back}
          </Button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Stat label={t.ordersStatusPending} value={String(openOrders.length)} />
          <Stat label={t.ordersTotal} value={String(ordersList.length)} />
        </div>

        <div className="mt-3 text-xs text-zinc-500">{t.ordersReceiptHint}</div>

        {ordersList.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur-xl">
            {t.ordersEmpty}
          </div>
        ) : (
          <div className="mt-4 grid gap-3">
            {ordersList
              .slice()
              .sort((a, b) => {
                const aStatus = normalizeOrderStatus(a?.status);
                const bStatus = normalizeOrderStatus(b?.status);

                const rank = (s) => (s === "cancelled" ? 2 : s === "shipped" ? 1 : 0);

                const aRank = rank(aStatus);
                const bRank = rank(bStatus);
                if (aRank !== bRank) return aRank - bRank;

                const aTime = typeof a?.createdAt === "number" ? a.createdAt : 0;
                const bTime = typeof b?.createdAt === "number" ? b.createdAt : 0;
                return bTime - aTime;
              })
              .slice(0, 200)
              .map((o) => {
                const status = normalizeOrderStatus(o?.status);
                const statusText = orderStatusLabel(status, t);
                const statusClass = orderStatusBadgeClass(status);

                const createdLabel =
                  typeof o?.createdAt === "number"
                    ? new Date(o.createdAt).toLocaleString(
                        language === "es" ? "es-US" : "en-US"
                      )
                    : "";

                const paymentText =
                  o?.paymentMethod === "paypal" || o?.paymentMethod === "whatsapp"
                    ? t.ordersPaymentPayPal
                    : t.ordersPaymentCard;

                const ship = o?.shipping || {};
                const shipLines = [
                  ship.addressLine1,
                  ship.addressLine2,
                  [ship.city, ship.stateRegion].filter(Boolean).join(", "),
                  ship.postalCode,
                  ship.country,
                ]
                  .map((x) => String(x || "").trim())
                  .filter(Boolean)
                  .join("\n");

                const itemsCount = Array.isArray(o?.items)
                  ? o.items.reduce((acc, it) => acc + (Number(it?.qty) || 0), 0)
                  : 0;

                const isExpanded = Boolean(expandedOrders?.[o.id]);

                const draft = orderStatusDrafts?.[o.id] || {};
                const nextStatusDraft = normalizeOrderStatus(draft.nextStatus || status);
                const showCancelReason = nextStatusDraft === "cancelled";
                const statusError = String(orderStatusErrors?.[o.id] || "").trim();

                const hasCustomerCancelRequest =
                  Boolean(o?.customerCancelRequestedAt) && Boolean(o?.customerCancelRequestReason);

                const customerCancelRequestedAtLabel =
                  typeof o?.customerCancelRequestedAt === "number"
                    ? new Date(o.customerCancelRequestedAt).toLocaleString(
                        language === "es" ? "es-US" : "en-US"
                      )
                    : "";

                return (
                  <div
                    key={o.id}
                    className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-5 shadow-sm backdrop-blur-xl"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="text-sm font-extrabold text-zinc-900">
                            {t.ordersOrder} {o.orderNumber || o.id}
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
                            {statusText}
                          </span>
                        </div>

                        <div className="mt-1 text-xs text-zinc-600">
                          {(o?.customer?.name || "—")}
                          {createdLabel ? ` · ${t.ordersPlacedAt}: ${createdLabel}` : ""}
                          {` · ${t.ordersItems}: ${itemsCount}`}
                          {` · ${t.ordersTotal}: ${money(Number(o?.total) || 0, language)}`}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 md:justify-end">
                        <Button variant="secondary" onClick={() => toggleOrderDetails(o.id)}>
                          {isExpanded ? t.ordersHideDetails : t.ordersViewDetails}
                        </Button>
                        <Button variant="secondary" onClick={() => printShippingLabel(o)}>
                          {t.ordersPrintLabel}
                        </Button>
                        <Button variant="secondary" onClick={() => printReceiptPdf(o)}>
                          {t.ordersPrintReceipt}
                        </Button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="md:col-span-3 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                            <div>
                              <div className="text-sm font-bold text-zinc-900">{t.ordersUpdateStatusLabel}</div>
                              {statusError ? (
                                <div className="mt-2 text-xs font-semibold text-rose-700">{statusError}</div>
                              ) : null}
                            </div>

                            <div className="grid gap-3 md:grid-cols-3 md:items-end">
                              <div>
                                <label className="text-[11px] font-semibold text-zinc-600">
                                  {t.orderStatusCurrentStatus}
                                </label>
                                <select
                                  value={nextStatusDraft}
                                  onChange={(e) =>
                                    setOrderStatusDraft(o.id, { nextStatus: e.target.value })
                                  }
                                  className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400"
                                >
                                  <option value="pending">{orderStatusLabel("pending", t)}</option>
                                  <option value="preparing">{orderStatusLabel("preparing", t)}</option>
                                  <option value="paused">{orderStatusLabel("paused", t)}</option>
                                  <option value="shipped">{orderStatusLabel("shipped", t)}</option>
                                  <option value="cancelled">{orderStatusLabel("cancelled", t)}</option>
                                </select>
                              </div>

                              {showCancelReason ? (
                                <div>
                                  <label className="text-[11px] font-semibold text-zinc-600">
                                    {t.ordersCancelReasonLabel}
                                  </label>
                                  <input
                                    value={String(draft.cancelReason ?? o?.cancelReason ?? "")}
                                    onChange={(e) =>
                                      setOrderStatusDraft(o.id, { cancelReason: e.target.value })
                                    }
                                    placeholder={t.ordersCancelReasonPlaceholder}
                                    className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400"
                                  />
                                </div>
                              ) : (
                                <div />
                              )}

                              <div>
                                <Button
                                  variant="primary"
                                  className="w-full"
                                  onClick={() => applyOrderStatusUpdate(o)}
                                >
                                  {t.ordersApplyStatus}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {nextStatusDraft === "shipped" && !statusError ? (
                            <div className="mt-2 text-xs text-zinc-600">
                              {t.ordersStatusTrackingRequired}
                            </div>
                          ) : null}

                          {hasCustomerCancelRequest ? (
                            <div className="mt-3 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                              <div className="text-xs font-semibold text-zinc-500">
                                {t.orderStatusCancelRequestTitle}
                              </div>
                              {customerCancelRequestedAtLabel ? (
                                <div className="mt-1 text-[11px] text-zinc-600">
                                  {customerCancelRequestedAtLabel}
                                </div>
                              ) : null}
                              <div className="mt-2 text-sm text-zinc-800">
                                {o?.customerCancelRequestReason}
                              </div>
                            </div>
                          ) : null}
                        </div>

                        <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="text-xs font-semibold text-zinc-500">{t.ordersCustomer}</div>
                          <div className="mt-1 text-sm font-bold text-zinc-900">
                            {o?.customer?.name || "—"}
                          </div>
                          {o?.customer?.phone ? (
                            <div className="mt-1 text-xs text-zinc-600">{o.customer.phone}</div>
                          ) : null}
                          {o?.customer?.notes ? (
                            <div className="mt-2 text-xs text-zinc-600">{o.customer.notes}</div>
                          ) : null}

                          <div className="mt-3 text-xs text-zinc-600">
                            {t.ordersPaymentMethod}: {paymentText}
                          </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="text-xs font-semibold text-zinc-500">{t.ordersShipping}</div>
                          <pre className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-700">
                            {shipLines || "—"}
                          </pre>

                          <div className="mt-3 grid gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-zinc-600">
                                {t.ordersTrackingNumberLabel}
                              </label>
                              <input
                                value={o?.trackingNumber || ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setOrders((prev) => {
                                    const base = Array.isArray(prev) ? prev : [];
                                    return base.map((x) =>
                                      x?.id === o.id
                                        ? { ...x, trackingNumber: v, updatedAt: Date.now() }
                                        : x
                                    );
                                  });
                                }}
                                placeholder={t.ordersTrackingNumberPlaceholder}
                                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-semibold text-zinc-600">
                                {t.ordersEtaLabel}
                              </label>
                              <input
                                value={o?.etaText || ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setOrders((prev) => {
                                    const base = Array.isArray(prev) ? prev : [];
                                    return base.map((x) =>
                                      x?.id === o.id
                                        ? { ...x, etaText: v, updatedAt: Date.now() }
                                        : x
                                    );
                                  });
                                }}
                                placeholder={t.ordersEtaPlaceholder}
                                className="mt-1 w-full rounded-2xl border border-zinc-200 bg-white px-3 py-2 text-xs outline-none focus:border-zinc-400"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="text-xs font-semibold text-zinc-500">{t.ordersItems}</div>
                          <div className="mt-1 text-sm font-bold text-zinc-900">{itemsCount}</div>
                          <div className="mt-1 text-xs text-zinc-600">
                            {t.ordersTotal}: {money(Number(o?.total) || 0, language)}
                          </div>
                        </div>

                        <div className="md:col-span-3 rounded-2xl border border-zinc-200/60 bg-white/55 p-4 shadow-sm backdrop-blur-xl">
                          <div className="text-xs font-semibold text-zinc-500">{t.ordersItems}</div>
                          <div className="mt-3 grid gap-2">
                            {(Array.isArray(o?.items) ? o.items : []).map((it) => {
                              const p = it?.personalization || {};
                              const fontLabel =
                                l10n(FONTS.find((f) => f.id === p.font)?.label, language) ||
                                String(p.font || "").trim() ||
                                "—";
                              const colorLabel =
                                l10n(COLORS.find((c) => c.id === p.color)?.label, language) ||
                                String(p.color || "").trim() ||
                                "—";

                              return (
                                <div
                                  key={it.id}
                                  className="rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3 shadow-sm backdrop-blur-xl"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div>
                                      <div className="text-sm font-bold text-zinc-900">
                                        {l10n(it?.name, language)}
                                      </div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {t.summaryText} {p.text ? p.text : "—"}
                                      </div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {t.summaryVerse} {p.verse ? p.verse : "—"}
                                      </div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {t.summaryFont} {fontLabel}
                                      </div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {t.summaryColor} {colorLabel}
                                      </div>
                                    </div>

                                    <div className="text-right">
                                      <div className="text-sm font-bold text-zinc-900">×{Number(it?.qty) || 0}</div>
                                      <div className="mt-1 text-xs text-zinc-600">
                                        {money(Number(it?.unitPrice) || 0, language)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <Footer t={t} />
    </div>
  );
}

// Component: Footer
function Footer({ t }) {
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

// Root: App
// (localStorage persistence + simple client-side routing)
export default function App() {
  const [route, setRoute] = useState("home");
  const [lastOrderId, setLastOrderId] = useState(null);

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

  const [checkoutConfig, setCheckoutConfig] = useState(() => {
    if (typeof window === "undefined") return buildDefaultCheckoutConfig();
    try {
      const raw = window.localStorage.getItem(CHECKOUT_CONFIG_STORAGE_KEY);
      if (!raw) return buildDefaultCheckoutConfig();
      return normalizeCheckoutConfig(JSON.parse(raw));
    } catch {
      return buildDefaultCheckoutConfig();
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        CHECKOUT_CONFIG_STORAGE_KEY,
        JSON.stringify(normalizeCheckoutConfig(checkoutConfig))
      );
    } catch {
      // ignore storage errors
    }
  }, [checkoutConfig]);

  const [checkoutDraft, setCheckoutDraft] = useState(() => buildDefaultCheckoutDraft());

  const [inventory, setInventory] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(INVENTORY_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(inventory));
    } catch {
      // ignore storage errors
    }
  }, [inventory]);

  const [productCosts, setProductCosts] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(PRODUCT_COSTS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        PRODUCT_COSTS_STORAGE_KEY,
        JSON.stringify(productCosts)
      );
    } catch {
      // ignore storage errors
    }
  }, [productCosts]);

  const [sales, setSales] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(SALES_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(SALES_STORAGE_KEY, JSON.stringify(sales));
    } catch {
      // ignore storage errors
    }
  }, [sales]);

  const [orders, setOrders] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // ignore storage errors
    }
  }, [orders]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Handler: onStorage (sync orders between tabs)
    function onStorage(e) {
      if (!e) return;
      if (e.key !== ORDERS_STORAGE_KEY) return;

      try {
        const parsed = e.newValue ? JSON.parse(e.newValue) : [];
        if (!Array.isArray(parsed)) return;
        setOrders(parsed);
      } catch {
        // ignore
      }
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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

  const confirmationOrder = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    if (lastOrderId) {
      return list.find((o) => o?.id === lastOrderId) || null;
    }
    return list[0] || null;
  }, [orders, lastOrderId]);

  // openProduct
  function openProduct(p) {
    setSelected(p);
    setRoute("product");
  }


  // addToCart
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


  // removeFromCart
  function removeFromCart(key) {
    setCart((prev) => prev.filter((x) => x.key !== key));
  }


  // pickCollection
  function pickCollection() {
    setRoute("catalog");
  }


  // placeOrder
  function placeOrder({
    customer,
    shipping,
    paymentMethod,
    taxRatePct,
    taxStateRatePct,
    taxMunicipalRatePct,
    shippingFee,
  }) {
    if (!Array.isArray(cart) || cart.length === 0) return null;

    const createdAt = Date.now();
    const orderId = crypto.randomUUID();
    const orderNumber = getNextOrderNumber();

    const nextPaymentMethod =
      paymentMethod === "paypal" || paymentMethod === "whatsapp" ? "paypal" : "card";

    const orderItems = cart.map((it) => ({
      id: crypto.randomUUID(),
      productId: String(it.id),
      qty: Number(it.qty) || 0,
      unitPrice: Number(it.price) || 0,
      name: it.name,
      category: it.category,
      personalization: it.personalization,
    }));

    const subtotal = roundMoney(
      orderItems.reduce(
        (acc, it) => acc + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
        0
      )
    );

    const nextTotalTaxRate = parseNumberOr(taxRatePct, Number.NaN);

    const nextStateRateFallback = Number.isFinite(nextTotalTaxRate)
      ? (nextTotalTaxRate * PR_TAX_STATE_RATE_PCT) / PR_TAX_TOTAL_RATE_PCT
      : PR_TAX_STATE_RATE_PCT;

    const nextMunicipalRateFallback = Number.isFinite(nextTotalTaxRate)
      ? (nextTotalTaxRate * PR_TAX_MUNICIPAL_RATE_PCT) / PR_TAX_TOTAL_RATE_PCT
      : PR_TAX_MUNICIPAL_RATE_PCT;

    const nextStateRate = Math.max(0, parseNumberOr(taxStateRatePct, nextStateRateFallback));
    const nextMunicipalRate = Math.max(
      0,
      parseNumberOr(taxMunicipalRatePct, nextMunicipalRateFallback)
    );

    const nextTaxRate = roundMoney(nextStateRate + nextMunicipalRate);

    const nextShipping = Math.max(0, parseNumberOr(shippingFee, 0));

    const taxStateAmount = roundMoney(subtotal * (nextStateRate / 100));
    const taxMunicipalAmount = roundMoney(subtotal * (nextMunicipalRate / 100));
    const taxAmount = roundMoney(taxStateAmount + taxMunicipalAmount);

    const total = roundMoney(subtotal + taxAmount + nextShipping);

    const order = {
      id: orderId,
      orderNumber,
      createdAt,
      updatedAt: createdAt,
      statusUpdatedAt: createdAt,
      status: "pending", // pending | preparing | paused | shipped | cancelled
      customer,
      shipping,
      paymentMethod: nextPaymentMethod, // card | paypal
      trackingNumber: "",
      shippedAt: null,
      etaText: "",
      cancelReason: "",
      cancelledAt: null,
      customerCancelRequestReason: "",
      customerCancelRequestedAt: null,
      subtotal,
      taxRatePct: nextTaxRate,
      taxStateRatePct: nextStateRate,
      taxMunicipalRatePct: nextMunicipalRate,
      taxStateAmount,
      taxMunicipalAmount,
      taxAmount,
      shippingFee: nextShipping,
      items: orderItems,
      total,
      currency: "USD",
    };

    setOrders((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const next = [order, ...base];
      return next.slice(0, 2000);
    });

    const saleItems = orderItems.map((it) => {
      const unitCost = Number(productCosts?.[it.productId] ?? 0) || 0;

      return {
        id: crypto.randomUUID(),
        createdAt,
        orderId,
        orderNumber,
        productId: it.productId,
        qty: it.qty,
        unitPrice: it.unitPrice,
        unitCost,
        name: it.name,
        category: it.category,
        personalization: it.personalization,
        customer,
        shipping,
      };
    });

    setSales((prev) => {
      const base = Array.isArray(prev) ? prev : [];
      const next = [...saleItems, ...base];
      return next.slice(0, 5000);
    });

    setInventory((prev) => {
      const next = { ...(prev && typeof prev === "object" ? prev : {}) };
      for (const it of cart) {
        const productId = String(it.id);
        const current = Number(next[productId] ?? 0) || 0;
        next[productId] = current - (Number(it.qty) || 0);
      }
      return next;
    });

    setCart([]);
    setCheckoutDraft(buildDefaultCheckoutDraft());
    setLastOrderId(orderId);
    setRoute("order_confirmation");

    return { orderId, orderNumber };
  }

  const orderFlowStep =
    route === "cart" ? 1 : route === "checkout" ? 2 : route === "checkout_review" ? 3 : 0;

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

      {/* Order flow progress (Cart → Checkout → Review) */}
      {orderFlowStep ? <OrderFlowStepper currentStep={orderFlowStep} t={t} /> : null}

      {/* Route: home */}
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


      {/* Route: catalog */}
      {route === "catalog" ? (
        <Catalog
          products={products}
          categories={categories}
          onOpenProduct={openProduct}
          t={t}
          language={language}
        />
      ) : null}


      {/* Route: product */}
      {route === "product" && selected ? (
        <ProductDetail
          product={selected}
          onBack={() => setRoute("catalog")}
          onAddToCart={addToCart}
          t={t}
          language={language}
        />
      ) : null}


      {/* Route: cart */}
      {route === "cart" ? (
        <Cart
          cart={cart}
          checkoutConfig={checkoutConfig}
          onRemove={removeFromCart}
          onCheckout={() => setRoute("checkout")}
          onBack={() => setRoute("catalog")}
          t={t}
          language={language}
        />
      ) : null}


      {/* Route: checkout */}
      {route === "checkout" ? (
        <Checkout
          cart={cart}
          checkoutConfig={checkoutConfig}
          checkoutDraft={checkoutDraft}
          setCheckoutDraft={setCheckoutDraft}
          onBack={() => setRoute("cart")}
          onGoReview={() => setRoute("checkout_review")}
          onPlaceOrder={placeOrder}
          t={t}
          language={language}
        />
      ) : null}

      {/* Route: checkout review */}
      {route === "checkout_review" ? (
        <CheckoutReview
          cart={cart}
          checkoutConfig={checkoutConfig}
          checkoutDraft={checkoutDraft}
          onBack={() => setRoute("checkout")}
          onRemove={removeFromCart}
          onPlaceOrder={placeOrder}
          t={t}
          language={language}
        />
      ) : null}

      {/* Route: order confirmation */}
      {route === "order_confirmation" ? (
        <OrderConfirmation
          order={confirmationOrder}
          onGoHome={() => setRoute("home")}
          t={t}
          language={language}
        />
      ) : null}

      {/* Route: order status */}
      {route === "order_status" ? (
        <OrderStatus orders={orders} setOrders={setOrders} t={t} language={language} />
      ) : null}

      {/* Route: blog */}
      {route === "blog" ? <Blog t={t} language={language} /> : null}

      {/* Route: about */}
      {route === "about" ? <About t={t} language={language} /> : null}

      {/* Route: admin */}
      {route === "admin" ? (
        <AdminPanel
          products={products}
          setProducts={setProducts}
          categories={categories}
          setCategories={setCategories}
          heroConfig={heroConfig}
          setHeroConfig={setHeroConfig}
          inventory={inventory}
          setInventory={setInventory}
          productCosts={productCosts}
          setProductCosts={setProductCosts}
          sales={sales}
          orders={orders}
          setOrders={setOrders}
          checkoutConfig={checkoutConfig}
          setCheckoutConfig={setCheckoutConfig}
          onGoOrders={() => setRoute("admin_orders")}
          onGoProfit={() => setRoute("admin_profit")}
          t={t}
          language={language}
        />
      ) : null}

      {/* Route: admin orders */}
      {route === "admin_orders" ? (
        <AdminOrders
          orders={orders}
          setOrders={setOrders}
          t={t}
          language={language}
          onBack={() => setRoute("admin")}
        />
      ) : null}

      {/* Route: admin profit/loss */}
      {route === "admin_profit" ? (
        <AdminProfit
          products={products}
          sales={sales}
          orders={orders}
          t={t}
          language={language}
          onBack={() => setRoute("admin")}
        />
      ) : null}

      <div className="pb-10" />
    </div>
  );
}
