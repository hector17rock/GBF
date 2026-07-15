function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

async function sha256Hex(input) {
  if (typeof crypto === "undefined" || !crypto.subtle) return null;

  const enc = new TextEncoder();
  const data = enc.encode(String(input));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

export function normalizeAdminUsers(input) {
  const list = Array.isArray(input) ? input : [];

  return list
    .map((u) => {
      const id = String(u?.id || "").trim();
      const username = String(u?.username || "").trim();
      const name = String(u?.name || "").trim();
      const salt = typeof u?.salt === "string" ? u.salt : "";
      const hash = typeof u?.hash === "string" ? u.hash : "";
      const algo = u?.algo === "sha256" || u?.algo === "plain" ? u.algo : "sha256";
      const createdAt = typeof u?.createdAt === "number" ? u.createdAt : null;

      if (!id || !username) return null;

      // Migration: older records didn't have a name.
      const safeName = name || username;

      return { id, username, name: safeName, salt, hash, algo, createdAt };
    })
    .filter(Boolean);
}

export async function buildPasswordRecord(password, salt) {
  const pw = String(password || "");
  const s = String(salt || "");

  const digest = await sha256Hex(`${s}:${pw}`);
  if (typeof digest === "string" && digest.length > 0) {
    return { algo: "sha256", salt: s, hash: digest };
  }

  // Fallback (old/limited browsers) — NOT secure, but keeps MVP working offline.
  return { algo: "plain", salt: s, hash: pw };
}

export async function verifyPassword(user, password) {
  const u = user && typeof user === "object" ? user : null;
  if (!u) return false;

  const pw = String(password || "");
  const algo = u.algo === "plain" ? "plain" : "sha256";

  if (algo === "plain") {
    return String(u.hash || "") === pw;
  }

  const digest = await sha256Hex(`${String(u.salt || "")}:${pw}`);
  if (typeof digest !== "string") return false;
  return digest === String(u.hash || "");
}
