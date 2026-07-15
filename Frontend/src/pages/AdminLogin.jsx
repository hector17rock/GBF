import { useMemo, useState } from "react";
import Button from "../components/Button";
import SectionTitle from "../components/SectionTitle";

export default function AdminLogin({
  t,
  language,
  hasAdmins,
  onLogin,
  onCreateFirstAdmin,
  onGoHome,
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const isSetup = !hasAdmins;

  const canSubmit = useMemo(() => {
    if (isSetup) {
      if (!name.trim() || !username.trim() || !password.trim()) return false;
      if (password.trim() !== password2.trim()) return false;
      return true;
    }

    if (!username.trim() || !password.trim()) return false;
    return true;
  }, [name, username, password, password2, isSetup]);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const n = name.trim();
    const u = username.trim();
    const p = password;

    if (isSetup) {
      if (!n || !u || !p) {
        setMessage(
          t?.adminAuthRequiredName ||
            (language === "es" ? "Completa nombre, usuario y contraseña." : "Enter name, username, and password.")
        );
        return;
      }
    } else {
      if (!u || !p) {
        setMessage(
          t?.adminAuthRequired ||
            (language === "es" ? "Completa usuario y contraseña." : "Enter username and password.")
        );
        return;
      }
    }

    if (isSetup && password.trim() !== password2.trim()) {
      setMessage(t?.adminAuthPasswordMismatch || (language === "es" ? "Las contraseñas no coinciden." : "Passwords do not match."));
      return;
    }

    setBusy(true);

    try {
      const ok = isSetup
        ? await (typeof onCreateFirstAdmin === "function"
            ? onCreateFirstAdmin({ name: n, username: u, password: p })
            : false)
        : await (typeof onLogin === "function" ? onLogin({ username: u, password: p }) : false);

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
        <SectionTitle
          title={isSetup ? t.adminSetupTitle : t.adminLoginTitle}
          subtitle={isSetup ? t.adminSetupSubtitle : t.adminLoginSubtitle}
        />

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form onSubmit={handleSubmit} className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
            <div className="grid gap-3">
              {isSetup ? (
                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.adminAuthNameLabel}</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.adminAuthNamePlaceholder}
                    autoComplete="name"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              ) : null}

              <div>
                <label className="text-xs font-semibold text-zinc-700">{t.adminAuthUsernameLabel}</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.adminAuthUsernamePlaceholder}
                  autoComplete="username"
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700">{t.adminAuthPasswordLabel}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.adminAuthPasswordPlaceholder}
                  autoComplete={isSetup ? "new-password" : "current-password"}
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

              {isSetup ? (
                <div>
                  <label className="text-xs font-semibold text-zinc-700">{t.adminAuthConfirmPasswordLabel}</label>
                  <input
                    type="password"
                    value={password2}
                    onChange={(e) => setPassword2(e.target.value)}
                    placeholder={t.adminAuthConfirmPasswordPlaceholder}
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                  />
                </div>
              ) : null}

              {message ? <div className="text-xs font-semibold text-amber-700">{message}</div> : null}

              <Button variant="primary" className="w-full" disabled={!canSubmit || busy}>
                {isSetup ? t.adminSetupCreateButton : t.adminLoginButton}
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
