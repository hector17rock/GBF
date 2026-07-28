import { useMemo, useState } from "react";
import Button from "../components/Button";
import SectionTitle from "../components/SectionTitle";

export default function AdminUsers({
  t,
  adminUsers,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onExportAdminUsersCode,
  onBack,
  onLogout,
}) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const [transferCode, setTransferCode] = useState("");
  const [transferMsg, setTransferMsg] = useState("");

  const users = Array.isArray(adminUsers) ? adminUsers : [];

  const canCreate = useMemo(() => {
    if (!name.trim() || !username.trim() || !password.trim()) return false;
    if (password.trim() !== password2.trim()) return false;
    return true;
  }, [name, username, password, password2]);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage("");

    const n = name.trim();
    const u = username.trim();

    if (!n || !u || !password.trim()) {
      setMessage(t.adminAuthRequiredName);
      return;
    }

    if (password.trim() !== password2.trim()) {
      setMessage(t.adminAuthPasswordMismatch);
      return;
    }

    setBusy(true);

    try {
      const ok =
        typeof onCreateUser === "function" ? await onCreateUser({ name: n, username: u, password }) : false;
      if (!ok) {
        setMessage(t.adminUsersCreateError);
        return;
      }

      setName("");
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

    if (editingId === u.id) {
      setEditingId(null);
      setEditingName("");
    }

    try {
      const ok = typeof onDeleteUser === "function" ? await onDeleteUser({ userId: u.id }) : false;
      if (!ok) {
        setMessage(t.adminUsersDeleteError);
      }
    } finally {
      setBusy(false);
    }
  }

  function startEditName(u) {
    if (!u?.id) return;
    setMessage("");
    setEditingId(u.id);
    setEditingName(String(u?.name || "").trim());
  }

  function cancelEditName() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveEditName(u) {
    if (!u?.id) return;
    const next = String(editingName || "").trim();
    if (!next) {
      setMessage(t.adminUsersNameRequired);
      return;
    }

    setMessage("");
    setBusy(true);

    try {
      const ok = typeof onUpdateUser === "function" ? await onUpdateUser({ userId: u.id, name: next }) : false;
      if (!ok) {
        setMessage(t.adminUsersUpdateError);
        return;
      }

      cancelEditName();
    } finally {
      setBusy(false);
    }
  }

  function generateTransferCode() {
    setTransferMsg("");
    if (typeof onExportAdminUsersCode !== "function") return;

    const code = String(onExportAdminUsersCode() || "").trim();
    setTransferCode(code);

    if (!code) {
      setTransferMsg(t.adminTransferEmpty);
    }
  }

  async function copyTransferCode() {
    setTransferMsg("");

    const code = String(transferCode || "").trim();
    if (!code) {
      generateTransferCode();
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
        setTransferMsg(t.adminTransferCopied);
        return;
      }
    } catch {
      // ignore
    }

    setTransferMsg(t.adminTransferCopyHint);
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
                <label className="text-xs font-semibold text-zinc-700">{t.adminAuthNameLabel}</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.adminAuthNamePlaceholder}
                  autoComplete="name"
                  className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                />
              </div>

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

            {typeof onExportAdminUsersCode === "function" ? (
              <div className="mt-4 rounded-2xl border border-zinc-200/60 bg-white/55 p-4">
                <div className="text-xs font-semibold text-zinc-600">{t.adminTransferTitle}</div>
                <div className="mt-1 text-xs leading-5 text-zinc-500">{t.adminTransferSubtitle}</div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button variant="secondary" type="button" onClick={generateTransferCode}>
                    {t.adminTransferGenerate}
                  </Button>
                  <Button variant="secondary" type="button" onClick={copyTransferCode}>
                    {t.adminTransferCopy}
                  </Button>
                </div>

                {transferMsg ? (
                  <div className="mt-2 text-xs font-semibold text-amber-700">{transferMsg}</div>
                ) : null}

                {transferCode ? (
                  <textarea
                    value={transferCode}
                    readOnly
                    rows={4}
                    className="mt-3 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs leading-5 text-zinc-700 outline-none"
                  />
                ) : null}
              </div>
            ) : null}

            {!users.length ? (
              <div className="mt-3 text-sm text-zinc-600">{t.adminUsersEmpty}</div>
            ) : (
              <div className="mt-4 grid gap-2">
                {users.map((u) => {
                  const canDelete = users.length > 1;
                  return (
                    <div
                      key={u.id}
                      className="rounded-2xl border border-zinc-200/60 bg-white/55 px-4 py-3"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          {editingId === u.id ? (
                            <div>
                              <label className="text-[11px] font-semibold text-zinc-600">{t.adminAuthNameLabel}</label>
                              <input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-sm outline-none focus:border-zinc-400"
                              />
                              <div className="mt-2 flex flex-wrap gap-2">
                                <Button variant="secondary" type="button" onClick={cancelEditName} disabled={busy}>
                                  {t.cancel}
                                </Button>
                                <Button variant="primary" type="button" onClick={() => saveEditName(u)} disabled={busy}>
                                  {t.save}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="text-sm font-bold text-zinc-900">{u.name}</div>
                              <div className="mt-1 text-xs font-semibold text-zinc-600">@{u.username}</div>
                              <div className="mt-1 text-[11px] text-zinc-500">{t.adminUsersCredentialHint}</div>
                            </>
                          )}
                        </div>

                        {editingId !== u.id ? (
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              type="button"
                              onClick={() => startEditName(u)}
                              disabled={busy}
                            >
                              {t.edit}
                            </Button>

                            <Button
                              variant="secondary"
                              disabled={!canDelete || busy}
                              onClick={() => handleDelete(u)}
                            >
                              {t.remove}
                            </Button>
                          </div>
                        ) : null}
                      </div>
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
