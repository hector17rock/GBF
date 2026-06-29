import { useMemo, useState } from "react";
import Button from "../components/Button";
import SectionTitle from "../components/SectionTitle";

export default function AdminUsers({
  t,
  language,
  adminUsers,
  onCreateUser,
  onDeleteUser,
  onBack,
  onLogout,
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const users = Array.isArray(adminUsers) ? adminUsers : [];

  const canCreate = useMemo(() => {
    if (!username.trim() || !password.trim()) return false;
    if (password.trim() !== password2.trim()) return false;
    return true;
  }, [username, password, password2]);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");

    const u = username.trim();

    if (!u || !password.trim()) {
      setMessage(t?.adminAuthRequired || (language === "es" ? "Completa usuario y contraseña." : "Enter username and password."));
      return;
    }

    if (password.trim() !== password2.trim()) {
      setMessage(t?.adminAuthPasswordMismatch || (language === "es" ? "Las contraseñas no coinciden." : "Passwords do not match."));
      return;
    }

    setBusy(true);

    try {
      const ok = typeof onCreateUser === "function" ? await onCreateUser({ username: u, password }) : false;
      if (!ok) {
        setMessage(t?.adminUsersCreateError || (language === "es" ? "No se pudo crear el admin." : "Could not create admin."));
        return;
      }

      setUsername("");
      setPassword("");
      setPassword2("");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(u) {
    if (!u?.id) return;
    if (users.length <= 1) return;

    setMessage("");
    setBusy(true);

    try {
      const ok = typeof onDeleteUser === "function" ? await onDeleteUser({ userId: u.id }) : false;
      if (!ok) {
        setMessage(t?.adminUsersDeleteError || (language === "es" ? "No se pudo eliminar." : "Could not delete."));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="rounded-[28px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl md:p-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <SectionTitle title={t.adminUsersTitle} subtitle={t.adminUsersSubtitle} />

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={onBack}>
              {t.back}
            </Button>
            {typeof onLogout === "function" ? (
              <Button variant="secondary" onClick={onLogout}>
                {t.adminLogout}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <form onSubmit={handleCreate} className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-extrabold text-zinc-900">{t.adminUsersCreateTitle}</div>

            <div className="mt-4 grid gap-3">
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
                  autoComplete="new-password"
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

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

              {message ? <div className="text-xs font-semibold text-amber-700">{message}</div> : null}

              <Button variant="primary" className="w-full" disabled={!canCreate || busy}>
                {t.adminUsersCreateButton}
              </Button>

              <div className="text-xs leading-5 text-zinc-500">{t.adminAuthDisclaimer}</div>
            </div>
          </form>

          <div className="rounded-[24px] border border-zinc-200/60 bg-white/55 p-6 shadow-sm backdrop-blur-xl">
            <div className="text-sm font-extrabold text-zinc-900">{t.adminUsersListTitle}</div>

            {!users.length ? (
              <div className="mt-3 text-sm text-zinc-600">{t.adminUsersEmpty}</div>
            ) : (
              <div className="mt-4 grid gap-2">
                {users.map((u) => {
                  const canDelete = users.length > 1;
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-zinc-900">{u.username}</div>
                        <div className="mt-1 text-[11px] text-zinc-500">{t.adminUsersCredentialHint}</div>
                      </div>

                      <Button
                        variant="secondary"
                        disabled={!canDelete || busy}
                        onClick={() => handleDelete(u)}
                      >
                        {t.remove}
                      </Button>
                    </div>
                  );
                })}

                {users.length <= 1 ? (
                  <div className="mt-2 text-[11px] text-zinc-500">{t.adminUsersCannotDeleteLast}</div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
