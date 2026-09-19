const DEFAULT_BLOG_POSTS = [
  {
    id: "prayer-journal",
    enabled: true,
    title: {
      es: "Cómo empezar un journal de oración",
      en: "How to start a prayer journal",
    },
    excerpt: {
      es: "Una estructura simple de 10 minutos al día para crecer en fe y constancia.",
      en: "A simple 10-minute daily structure to grow in faith and consistency.",
    },
    content: {
      es: "Separa unos minutos cada día para escribir una oración, un versículo y una acción práctica. Con el tiempo, podrás mirar atrás y ver cómo Dios ha trabajado en tu vida.",
      en: "Set aside a few minutes each day to write a prayer, a verse, and one practical action. Over time, you’ll be able to look back and see how God has worked in your life.",
    },
  },
  {
    id: "purposeful-gifts",
    enabled: true,
    title: {
      es: "3 maneras de regalar con propósito",
      en: "3 ways to gift with purpose",
    },
    excerpt: {
      es: "Ideas para personalizar un Yeti o un journal y bendecir a alguien.",
      en: "Ideas to customize a Yeti or a journal and bless someone.",
    },
    content: {
      es: "Puedes escoger una frase significativa, añadir un versículo favorito o incluir el nombre de la persona. Un regalo personalizado puede convertirse en un recordatorio diario de fe y esperanza.",
      en: "You can choose a meaningful phrase, add a favorite verse, or include the person’s name. A personalized gift can become a daily reminder of faith and hope.",
    },
  },
  {
    id: "identity",
    enabled: true,
    title: {
      es: "Identidad: cuando te sientes inestable",
      en: "Identity: when you feel unstable",
    },
    excerpt: {
      es: "Una lectura corta para recordar quién eres y cómo volver a la calma.",
      en: "A short read to remember who you are and how to return to calm.",
    },
    content: {
      es: "Cuando las emociones cambian, la verdad de Dios permanece. Toma un momento para respirar, orar y recordar que tu identidad no depende de un día difícil.",
      en: "When emotions change, God’s truth remains. Take a moment to breathe, pray, and remember that your identity does not depend on a difficult day.",
    },
  },
];

function normalizeLocalizedText(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return {
      es: String(value.es || value.en || "").trim(),
      en: String(value.en || value.es || "").trim(),
    };
  }

  const text = String(value || "").trim();
  return { es: text, en: text };
}

export function buildDefaultBlogConfig() {
  return {
    version: 1,
    posts: DEFAULT_BLOG_POSTS.map((post) => ({
      ...post,
      title: { ...post.title },
      excerpt: { ...post.excerpt },
      content: { ...post.content },
    })),
  };
}

export function normalizeBlogPost(post, index = 0) {
  const raw = post && typeof post === "object" ? post : {};
  const id = String(raw.id || `blog-${index + 1}`).trim() || `blog-${index + 1}`;

  return {
    id,
    enabled: raw.enabled !== false,
    title: normalizeLocalizedText(raw.title),
    excerpt: normalizeLocalizedText(raw.excerpt),
    content: normalizeLocalizedText(raw.content || raw.body),
  };
}

export function normalizeBlogConfig(value) {
  const raw = value && typeof value === "object" ? value : {};
  const rawPosts = Array.isArray(raw.posts)
    ? raw.posts
    : Array.isArray(raw.items)
      ? raw.items
      : DEFAULT_BLOG_POSTS;
  const seen = new Set();

  const posts = rawPosts
    .map((post, index) => normalizeBlogPost(post, index))
    .map((post, index) => {
      let id = post.id;
      if (seen.has(id)) id = `${id}-${index + 1}`;
      seen.add(id);
      return { ...post, id };
    })
    .filter((post) => post.id);

  return {
    version: 1,
    posts,
  };
}
