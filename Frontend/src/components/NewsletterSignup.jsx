import { useState } from "react";
import Button from "./Button";

function isValidEmail(email) {
  const s = String(email || "").trim();
  if (!s) return false;
  // Simple pragmatic check
  return /\S+@\S+\.[A-Za-z]{2,}/.test(s);
}

export default function NewsletterSignup({ t, onSubmitEmail }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    setError("");

    const value = String(email || "").trim();
    if (!isValidEmail(value)) {
      setError(t.newsletterInvalid);
      return;
    }

    if (typeof onSubmitEmail === "function") {
      onSubmitEmail(value);
    }

    setEmail("");
  }

  return (
    <div className="rounded-[28px] border border-[#DDD6CA] bg-white p-6 shadow-sm md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-extrabold text-[#2B2B2B]">{t.newsletterTitle}</div>
          <div className="mt-1 text-sm text-[#6B6B6B]">{t.newsletterSubtitle}</div>
        </div>

        <form onSubmit={submit} className="grid w-full max-w-md gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.newsletterPlaceholder}
            inputMode="email"
            autoComplete="email"
            className="w-full rounded-2xl border border-[#DDD6CA] bg-white px-4 py-2 text-sm outline-none focus:border-[#355E3B]"
          />
          <Button variant="primary" className="w-full md:w-auto">
            {t.newsletterCta}
          </Button>
          {error ? <div className="text-xs font-semibold text-amber-700 md:col-span-2">{error}</div> : null}
        </form>
      </div>
    </div>
  );
}
