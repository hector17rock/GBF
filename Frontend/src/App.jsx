import React, { useMemo, useState } from "react";

// MVP Frontend Mock (no backend)
// - Home, Catalog, Product Detail (with personalization), Cart, Checkout
// - Pure client-side state for visualization

const PRODUCTS = [
  {
    id: "yeti-20",
    category: "Yeti",
    name: "Yeti Rambler 20oz",
    price: 40,
    short: "Vaso premium para regalos con propósito.",
    description:
      "Un vaso resistente para el día a día. Personalízalo con nombre, frase o versículo y conviértelo en un regalo memorable.",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&q=80",
    tags: ["Regalo", "Premium", "Personalizable"],
  },
  {
    id: "journal-1",
    category: "Journals",
    name: "Libreta Journal (A5)",
    price: 26,
    short: "Journaling y devocional diario.",
    description:
      "Una libreta para escribir, orar y reflexionar. Perfecta para rutinas de fe, metas y gratitud.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=80",
    tags: ["Devocional", "Hábitos", "Regalo"],
  },
];

const COLLECTIONS = [
  {
    id: "identidad",
    name: "Identidad",
    desc: "Recordar quién eres en Cristo en tu rutina diaria.",
  },
  {
    id: "paz",
    name: "Paz",
    desc: "Calma para el corazón: frases y versículos de descanso.",
  },
  {
    id: "gratitud",
    name: "Gratitud",
    desc: "Un hábito simple que transforma el día.",
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
  { id: "sans", label: "Moderna", className: "font-sans" },
  { id: "serif", label: "Clásica", className: "font-serif" },
  { id: "mono", label: "Minimal", className: "font-mono" },
];

const COLORS = [
  { id: "ink", label: "Tinta", swatch: "bg-zinc-900" },
  { id: "gold", label: "Dorado", swatch: "bg-amber-500" },
  { id: "sage", label: "Sage", swatch: "bg-emerald-600" },
  { id: "sky", label: "Sky", swatch: "bg-sky-600" },
  { id: "rose", label: "Rose", swatch: "bg-rose-600" },
];

function money(n) {
  return new Intl.NumberFormat("en-US", {
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

function TopBar({ route, setRoute, cartCount }) {
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
            <div className="text-xs text-zinc-500">Productos con propósito</div>
          </div>
        </div>

        <div className="hidden items-center gap-1 md:flex">
          <NavLink active={route === "home"} onClick={() => setRoute("home")}>
            Inicio
          </NavLink>
          <NavLink
            active={route === "catalog"}
            onClick={() => setRoute("catalog")}
          >
            Catálogo
          </NavLink>
          <NavLink active={route === "blog"} onClick={() => setRoute("blog")}>
            Blog
          </NavLink>
          <NavLink
            active={route === "about"}
            onClick={() => setRoute("about")}
          >
            Valores
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setRoute("catalog")}>
            Explorar
          </Button>
          <Button variant="primary" onClick={() => setRoute("cart")}>
            Carrito
            {cartCount > 0 ? (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white/15 px-1 text-xs">
                {cartCount}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-2 md:hidden">
        <div className="grid grid-cols-4 gap-2">
          <MobileTab active={route === "home"} onClick={() => setRoute("home")}>
            Inicio
          </MobileTab>
          <MobileTab
            active={route === "catalog"}
            onClick={() => setRoute("catalog")}
          >
            Catálogo
          </MobileTab>
          <MobileTab active={route === "blog"} onClick={() => setRoute("blog")}>
            Blog
          </MobileTab>
          <MobileTab active={route === "about"} onClick={() => setRoute("about")}>
            Valores
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

function Hero({ onPrimary, onSecondary }) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-zinc-200 bg-white">
      <div className="absolute inset-0">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -right-32 -bottom-32 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
      </div>

      <div className="relative grid gap-6 p-6 md:grid-cols-2 md:p-10">
        <div>
          <Pill>Evangelio para todos</Pill>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-zinc-900 md:text-4xl">
            Productos con propósito,
            <span className="block">fe que transforma.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-600">
            Una tienda cristiana moderna para regalos y hábitos espirituales.
            Personaliza tu Yeti o tu Journal con nombre, frase o versículo.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={onPrimary} variant="primary">
              Personalizar ahora
            </Button>
            <Button onClick={onSecondary} variant="secondary">
              Ver colección
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-zinc-600 md:max-w-md">
            <div className="rounded-2xl bg-zinc-50 p-3">
              <div className="font-semibold text-zinc-900">Personalización</div>
              <div className="mt-1">Texto, tipografía, color y versículo.</div>
            </div>
            <div className="rounded-2xl bg-zinc-50 p-3">
              <div className="font-semibold text-zinc-900">Listo para regalar</div>
              <div className="mt-1">Diseños limpios y mensajes claros.</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="overflow-hidden rounded-[24px] border border-zinc-200">
            <img
              alt="hero"
              src="https://images.unsplash.com/photo-1517685352821-92cf88aee5a5?auto=format&fit=crop&w=1400&q=80"
              className="h-44 w-full object-cover md:h-52"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="overflow-hidden rounded-[24px] border border-zinc-200">
              <img
                alt="product"
                src="https://images.unsplash.com/photo-1544717305-996b815c338c?auto=format&fit=crop&w=1200&q=80"
                className="h-36 w-full object-cover"
              />
            </div>
            <div className="overflow-hidden rounded-[24px] border border-zinc-200">
              <img
                alt="product"
                src="https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80"
                className="h-36 w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CollectionCards({ onPick }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {COLLECTIONS.map((c) => (
        <button
          key={c.id}
          onClick={() => onPick(c)}
          className="rounded-[24px] border border-zinc-200 bg-white p-5 text-left transition hover:bg-zinc-50"
        >
          <div className="text-sm font-bold text-zinc-900">{c.name}</div>
          <div className="mt-2 text-sm leading-6 text-zinc-600">{c.desc}</div>
          <div className="mt-4">
            <Pill>Ver productos</Pill>
          </div>
        </button>
      ))}
    </div>
  );
}

function ProductCard({ p, onOpen }) {
  return (
    <button
      onClick={() => onOpen(p)}
      className="group overflow-hidden rounded-[24px] border border-zinc-200 bg-white text-left transition hover:bg-zinc-50"
    >
      <div className="overflow-hidden">
        <img
          alt={p.name}
          src={p.image}
          className="h-40 w-full object-cover transition group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-zinc-500">{p.category}</div>
            <div className="mt-1 text-sm font-bold text-zinc-900">{p.name}</div>
          </div>
          <div className="text-sm font-bold text-zinc-900">{money(p.price)}</div>
        </div>
        <div className="mt-2 text-sm text-zinc-600">{p.short}</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {p.tags.map((t) => (
            <Pill key={t}>{t}</Pill>
          ))}
        </div>
      </div>
    </button>
  );
}

function Home({ onGoCatalog, onOpenProduct, onPickCollection }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Hero onPrimary={onGoCatalog} onSecondary={onGoCatalog} />

      <div className="mt-8">
        <SectionTitle
          title="Colecciones temáticas"
          subtitle="Temas actuales y desafíos espirituales para conectar con el corazón."
        />
        <CollectionCards onPick={onPickCollection} />
      </div>

      <div className="mt-10">
        <SectionTitle
          title="Productos destacados"
          subtitle="Arranca con dos líneas claras: Yeti y Journals."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} onOpen={onOpenProduct} />
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle
          title="Personaliza en 3 pasos"
          subtitle="Un flujo simple que se siente como app."
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Step
            n="1"
            title="Elige el producto"
            desc="Yeti o Journal según ocasión y estilo."
          />
          <Step
            n="2"
            title="Personaliza"
            desc="Nombre, frase, tipografía, color y versículo."
          />
          <Step
            n="3"
            title="Envía tu pedido"
            desc="Carrito + checkout. Puedes cerrar por WhatsApp."
          />
        </div>
      </div>

      <div className="mt-10 grid gap-3 md:grid-cols-2">
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6">
          <div className="text-sm font-bold text-zinc-900">Lema</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            "Productos con propósito, fe que transforma."
          </p>
        </div>
        <div className="rounded-[28px] border border-zinc-200 bg-white p-6">
          <div className="text-sm font-bold text-zinc-900">CTA rápido</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Lanza con pre-orden y cierra por WhatsApp mientras validas demanda.
          </p>
        </div>
      </div>

      <Footer />
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

function Catalog({ onOpenProduct }) {
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    return PRODUCTS.filter((p) => {
      const byCat = category === "All" ? true : p.category === category;
      const byQ =
        q.trim().length === 0
          ? true
          : (p.name + " " + p.short)
              .toLowerCase()
              .includes(q.trim().toLowerCase());
      return byCat && byQ;
    });
  }, [category, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle
          title="Catálogo"
          subtitle="Explora por categoría y entra a personalizar."
        />
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <FilterChip
              active={category === "All"}
              onClick={() => setCategory("All")}
            >
              Todo
            </FilterChip>
            <FilterChip
              active={category === "Yeti"}
              onClick={() => setCategory("Yeti")}
            >
              Yeti
            </FilterChip>
            <FilterChip
              active={category === "Journals"}
              onClick={() => setCategory("Journals")}
            >
              Journals
            </FilterChip>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar"
              className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400 md:w-72"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {filtered.map((p) => (
          <ProductCard key={p.id} p={p} onOpen={onOpenProduct} />
        ))}
      </div>

      <Footer />
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

function ProductDetail({ product, onBack, onAddToCart }) {
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
              {product.name}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBack}>
              Volver
            </Button>
            <div className="text-lg font-bold text-zinc-900">
              {money(product.price)}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-[28px] border border-zinc-200">
            <div className="relative">
              <img
                alt={product.name}
                src={product.image}
                className="h-80 w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4">
                <div className="rounded-[22px] bg-white/90 p-4 backdrop-blur">
                  <div className="text-xs font-semibold text-zinc-500">
                    Preview
                  </div>
                  <div
                    className={`mt-1 text-base font-bold ${fontClass} ${colorClass}`}
                  >
                    {personalization.text.length > 0
                      ? personalization.text
                      : "Tu frase o nombre aquí"}
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
              title="Personalización"
              subtitle="Ajusta texto, tipografía y color. Esto es el corazón del MVP."
            />

            <div className="grid gap-4">
              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  Texto
                </label>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Ej: Hogar de la familia Rodríguez"
                  className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
                <div className="mt-1 text-xs text-zinc-500">
                  Recomendación: 20–35 caracteres.
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  Versículo
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
                  Tipografía
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
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-zinc-900">
                  Color
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
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-zinc-50 p-5">
                <div className="text-sm font-bold text-zinc-900">Resumen</div>
                <div className="mt-2 text-sm text-zinc-700">
                  <div>
                    <span className="font-semibold">Texto:</span>{" "}
                    {personalization.text.length ? personalization.text : "—"}
                  </div>
                  <div>
                    <span className="font-semibold">Versículo:</span> {verse}
                  </div>
                  <div>
                    <span className="font-semibold">Tipografía:</span>{" "}
                    {FONTS.find((f) => f.id === font)?.label}
                  </div>
                  <div>
                    <span className="font-semibold">Color:</span>{" "}
                    {COLORS.find((c) => c.id === color)?.label}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  onClick={() => onAddToCart(product, personalization)}
                  className="w-full md:w-auto"
                >
                  Añadir al carrito
                </Button>
                <Button variant="secondary" onClick={onBack}>
                  Seguir explorando
                </Button>
              </div>

              <div className="text-xs leading-5 text-zinc-500">
                Este MVP es solo frontend: el pedido se puede cerrar luego por
                WhatsApp o un formulario.
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Cart({ cart, onRemove, onCheckout, onBack }) {
  const total = cart.reduce((acc, it) => acc + it.price * it.qty, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionTitle
            title="Carrito"
            subtitle="Revisa tu pedido antes del checkout."
          />
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onBack}>
              Seguir comprando
            </Button>
            <div className="text-lg font-bold text-zinc-900">{money(total)}</div>
          </div>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-[24px] bg-zinc-50 p-6 text-sm text-zinc-600">
            Tu carrito está vacío.
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
                      {it.name}
                    </div>
                    <div className="mt-2 text-sm text-zinc-600">
                      {it.personalization.text ? (
                        <>
                          <span className="font-semibold">Texto:</span>{" "}
                          {it.personalization.text}
                        </>
                      ) : (
                        <>
                          <span className="font-semibold">Texto:</span> —
                        </>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-zinc-600">
                      <span className="font-semibold">Versículo:</span>{" "}
                      {it.personalization.verse}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold text-zinc-900">
                      {money(it.price)}
                    </div>
                    <div className="mt-2 text-xs text-zinc-500">Qty: {it.qty}</div>
                    <div className="mt-3">
                      <Button variant="secondary" onClick={() => onRemove(it.key)}>
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-zinc-50 p-5">
              <div>
                <div className="text-sm font-bold text-zinc-900">Total</div>
                <div className="text-sm text-zinc-600">
                  Este total es estimado para el MVP.
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-lg font-extrabold text-zinc-900">
                  {money(total)}
                </div>
                <Button variant="primary" onClick={onCheckout}>
                  Ir a checkout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function Checkout({ cart, onBack, onDone }) {
  const total = cart.reduce((acc, it) => acc + it.price * it.qty, 0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  const whatsappText = useMemo(() => {
    const lines = [];
    lines.push("Hola, quiero hacer un pedido:");
    cart.forEach((it, idx) => {
      lines.push(
        `${idx + 1}. ${it.name} (${it.category}) x${it.qty} - ${money(it.price)}`
      );
      lines.push(`   Texto: ${it.personalization.text || "—"}`);
      lines.push(`   Versículo: ${it.personalization.verse}`);
      lines.push(`   Tipografía: ${it.personalization.font}`);
      lines.push(`   Color: ${it.personalization.color}`);
    });
    lines.push(`Total estimado: ${money(total)}`);
    if (name.trim()) lines.push(`Nombre: ${name.trim()}`);
    if (phone.trim()) lines.push(`Teléfono: ${phone.trim()}`);
    if (notes.trim()) lines.push(`Notas: ${notes.trim()}`);
    return encodeURIComponent(lines.join("\n"));
  }, [cart, total, name, phone, notes]);

  const whatsappHref = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionTitle
            title="Checkout"
            subtitle="Sin backend: cierre por WhatsApp o cotización."
          />
          <div className="text-lg font-bold text-zinc-900">{money(total)}</div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-[24px] bg-zinc-50 p-6">
            <div className="text-sm font-bold text-zinc-900">Tus datos</div>
            <div className="mt-4 grid gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono"
                className="w-full rounded-2xl border border-zinc-200 px-4 py-2 text-sm outline-none focus:border-zinc-400"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas (ej: para regalo, fecha, etc.)"
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
                Enviar por WhatsApp
              </a>
              <Button variant="secondary" onClick={onBack}>
                Volver al carrito
              </Button>
            </div>

            <div className="mt-3 text-xs leading-5 text-zinc-500">
              Siguiente paso (luego): integrar pagos y órdenes reales.
            </div>
          </div>

          <div>
            <div className="rounded-[24px] border border-zinc-200 p-6">
              <div className="text-sm font-bold text-zinc-900">Resumen</div>
              <div className="mt-4 grid gap-3">
                {cart.map((it) => (
                  <div key={it.key} className="rounded-2xl bg-zinc-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs font-semibold text-zinc-500">
                          {it.category}
                        </div>
                        <div className="mt-1 text-sm font-bold text-zinc-900">
                          {it.name}
                        </div>
                        <div className="mt-2 text-xs text-zinc-600">
                          Texto: {it.personalization.text || "—"}
                        </div>
                        <div className="mt-1 text-xs text-zinc-600">
                          Versículo: {it.personalization.verse}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-zinc-900">
                        {money(it.price)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl bg-zinc-50 p-4">
                <div className="text-sm font-bold text-zinc-900">Total</div>
                <div className="text-base font-extrabold text-zinc-900">
                  {money(total)}
                </div>
              </div>

              <div className="mt-4">
                <Button variant="primary" onClick={onDone}>
                  Finalizar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Blog() {
  const posts = [
    {
      title: "Cómo empezar un journal de oración",
      excerpt:
        "Una estructura simple de 10 minutos al día para crecer en fe y constancia.",
    },
    {
      title: "3 maneras de regalar con propósito",
      excerpt:
        "Ideas para personalizar un Yeti o un journal y bendecir a alguien.",
    },
    {
      title: "Identidad: cuando te sientes inestable",
      excerpt:
        "Una lectura corta para recordar quién eres y cómo volver a la calma.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle
          title="Blog"
          subtitle="Contenido de lectura corta para enganchar y nutrir a la audiencia."
        />
        <div className="grid gap-3 md:grid-cols-3">
          {posts.map((p) => (
            <div
              key={p.title}
              className="rounded-[24px] border border-zinc-200 bg-white p-5"
            >
              <div className="text-sm font-bold text-zinc-900">{p.title}</div>
              <div className="mt-2 text-sm leading-6 text-zinc-600">{p.excerpt}</div>
              <div className="mt-4">
                <Pill>Leer</Pill>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function About() {
  const values = [
    { title: "Fe", desc: "Todo lo que hacemos está fundamentado en la Palabra." },
    {
      title: "Integridad",
      desc: "Operamos con transparencia, honestidad y responsabilidad.",
    },
    { title: "Servicio", desc: "Servimos con amor y excelencia." },
    {
      title: "Esperanza",
      desc: "Promovemos mensajes que edifican y transforman vidas.",
    },
    {
      title: "Comunidad",
      desc: "Fomentamos unidad entre creyentes y quienes buscan.",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6 md:p-10">
        <SectionTitle title="Valores" subtitle="Nuestro fundamento" />
        <div className="grid gap-3 md:grid-cols-2">
          {values.map((v) => (
            <div
              key={v.title}
              className="rounded-[24px] border border-zinc-200 bg-white p-5"
            >
              <div className="text-sm font-bold text-zinc-900">{v.title}</div>
              <div className="mt-2 text-sm leading-6 text-zinc-600">{v.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[24px] bg-zinc-50 p-6">
          <div className="text-sm font-bold text-zinc-900">Misión</div>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Compartir el amor de Cristo a través de cada producto. Que cada
            artículo sea una herramienta de evangelismo, esperanza y fe.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 pb-10">
      <div className="rounded-[28px] border border-zinc-200 bg-white p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-sm font-bold text-zinc-900">Grow by Faith</div>
            <div className="mt-1 text-xs text-zinc-500">
              MVP visual (solo frontend) para validar interés.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Pill>IG</Pill>
            <Pill>TikTok</Pill>
            <Pill>Blog</Pill>
            <Pill>WhatsApp Checkout</Pill>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState("home");
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
      <TopBar route={route} setRoute={setRoute} cartCount={cartCount} />

      {route === "home" ? (
        <Home
          onGoCatalog={() => setRoute("catalog")}
          onOpenProduct={openProduct}
          onPickCollection={pickCollection}
        />
      ) : null}

      {route === "catalog" ? <Catalog onOpenProduct={openProduct} /> : null}

      {route === "product" && selected ? (
        <ProductDetail
          product={selected}
          onBack={() => setRoute("catalog")}
          onAddToCart={addToCart}
        />
      ) : null}

      {route === "cart" ? (
        <Cart
          cart={cart}
          onRemove={removeFromCart}
          onCheckout={() => setRoute("checkout")}
          onBack={() => setRoute("catalog")}
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
        />
      ) : null}

      {route === "blog" ? <Blog /> : null}
      {route === "about" ? <About /> : null}

      <div className="pb-10" />
    </div>
  );
}
