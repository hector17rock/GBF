// -----------------------------
// Data: COLLECTIONS / VERSES / FONTS / COLORS
// -----------------------------

export const COLLECTIONS = [
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

export const VERSES = [
  "Jeremías 29:11",
  "Filipenses 4:6-7",
  "Salmos 23:1",
  "Proverbios 3:5-6",
  "Isaías 41:10",
];

// Daily verse (reference + full text)
export const DAILY_VERSES = [
  {
    ref: { es: "Jeremías 29:11", en: "Jeremiah 29:11" },
    text: {
      es: "Porque yo sé los planes que tengo para ti —dice el Señor—: planes de bienestar y no de mal, para darte un futuro y una esperanza.",
      en: "For I know the plans I have for you, says the Lord: plans for your good and not for harm, to give you a future and a hope.",
    },
  },
  {
    ref: { es: "Filipenses 4:6-7", en: "Philippians 4:6–7" },
    text: {
      es: "No te preocupes por nada. Más bien, ora por todo: presenta tus peticiones a Dios con oración y ruego, con gratitud. Y la paz de Dios, que sobrepasa todo entendimiento, cuidará tu corazón y tu mente en Cristo Jesús.",
      en: "Do not worry about anything. Instead, pray about everything: present your requests to God with prayer and gratitude. And the peace of God, which surpasses all understanding, will guard your heart and mind in Christ Jesus.",
    },
  },
  {
    ref: { es: "Salmos 23:1", en: "Psalm 23:1" },
    text: {
      es: "El Señor es mi pastor; nada me faltará.",
      en: "The Lord is my shepherd; I shall not lack.",
    },
  },
  {
    ref: { es: "Proverbios 3:5-6", en: "Proverbs 3:5–6" },
    text: {
      es: "Confía en el Señor con todo tu corazón y no te apoyes en tu propia prudencia. Reconócelo en todos tus caminos, y él enderezará tus sendas.",
      en: "Trust in the Lord with all your heart, and do not lean on your own understanding. Acknowledge Him in all your ways, and He will make your paths straight.",
    },
  },
  {
    ref: { es: "Isaías 41:10", en: "Isaiah 41:10" },
    text: {
      es: "No temas, porque yo estoy contigo; no te desalientes, porque yo soy tu Dios. Te fortaleceré y te ayudaré; te sostendré con mi mano derecha victoriosa.",
      en: "Do not fear, for I am with you; do not be discouraged, for I am your God. I will strengthen you and help you; I will uphold you with my victorious right hand.",
    },
  },
];

export const FONTS = [
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

export const COLORS = [
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
