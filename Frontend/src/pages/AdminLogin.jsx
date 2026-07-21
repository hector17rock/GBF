import { useMemo, useState } from "react";
import Button from "../components/Button";
import SectionTitle from "../components/SectionTitle";

export default function AdminLogin({ t, language, hasAdmins, onLogin, onGoHome }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const isConfigured = Boolean(hasAdmins);

  const canSubmit = useMemo(() => {
    if (!isConfigured) return false;
    if (!username.trim() || !password.trim()) return false;
    return true;
  }, [username, password, isConfigured]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    if (!isConfigured) {
      setMessage(
        t?.adminAuthNotConfigured ||
          (language === "es"
            ? "El acceso admin no está configurado. Contacta al administrador."
            : "Admin access is not configured. Contact the administrator.")
      );
      return;
    }

    const u = username.trim();
    const p = password;

    if (!u || !p) {
      setMessage(
        t?.adminAuthRequired ||
          (language === "es" ? "Completa usuario y contraseña." : "Enter username and password.")
      );
      return;
    }

    setBusy(true);

    try {
      const ok = await (typeof onLogin === "function" ? onLogin({ username: u, password: p }) : false);

      if (!ok) {
        setMessage(t?.adminAuthInvalid || (language === "es" ? "Acceso denegado." : "Access denied."));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <SectionTitle title={t.adminLoginTitle} subtitle={t.adminLoginSubtitle} />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl"
          >
            <div className="grid gap-3">
              {!isConfigured ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {t.adminAuthNotConfigured ||
                    (language === "es"
                      ? "El acceso admin no está configurado. Contacta al administrador."
                      : "Admin access is not configured. Contact the administrator.")}
                </div>
              ) : null}

              <div>
                <label className="text-xs font-semibold text-zinc-700">{t.adminAuthUsernameLabel}</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.adminAuthUsernamePlaceholder}
                  autoComplete="username"
                  disabled={!isConfigured}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">{t.adminAuthPasswordLabel}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.adminAuthPasswordPlaceholder}
                  autoComplete="current-password"
                  disabled={!isConfigured}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400 disabled:opacity-60"
                />
              </div>

              {message ? <div className="text-xs font-semibold text-amber-700">{message}</div> : null}

              <Button variant="primary" className="w-full" disabled={!canSubmit || busy}>
                {t.adminLoginButton}
              </Button>

              {typeof onGoHome === "function" ? (
                <Button variant="secondary" className="w-full" onClick={onGoHome} type="button">
                  {t.adminAuthBackHome}
                </Button>
              ) : null}

              <div className="text-xs leading-5 text-zinc-500">{t.adminAuthDisclaimer}</div>
            </div>
          </form>

          <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-extrabold text-zinc-900">{t.adminAuthTipsTitle}</div>
            <ul className="mt-3 grid gap-2 text-sm text-zinc-700">
              <li className="flex gap-2">
                <span className="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-zinc-900" />
                <span className="leading-6">{t.adminAuthTip1}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-zinc-900" />
                <span className="leading-6">{t.adminAuthTip2}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-2 inline-flex h-2 w-2 shrink-0 rounded-full bg-zinc-900" />
                <span className="leading-6">{t.adminAuthTip3}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
