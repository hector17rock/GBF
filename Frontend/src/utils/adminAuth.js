function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let out = "";
  for (const b of bytes) out += b.toString(16).padStart(2, "0");
  return out;
}

function utf8ToBytes(text) {
  try {
    if (typeof TextEncoder !== "undefined") {
      return new TextEncoder().encode(String(text));
    }
  } catch {
    // ignore
  }

  // Fallback: encodeURIComponent produces UTF-8 percent-encoding.
  const s = unescape(encodeURIComponent(String(text)));
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

function rotr(x, n) {
  return (x >>> n) | (x << (32 - n));
}

function sha256HexJs(input) {
  const bytes = utf8ToBytes(input);

  // Initial hash values
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4,
    0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe,
    0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f,
    0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc,
    0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116,
    0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7,
    0xc67178f2,
  ];

  // Pre-processing (padding)
  const bitLen = bytes.length * 8;
  const withOne = bytes.length + 1;
  const padLen = (withOne % 64 <= 56 ? 56 - (withOne % 64) : 56 + (64 - (withOne % 64)));
  const totalLen = bytes.length + 1 + padLen + 8;

  const msg = new Uint8Array(totalLen);
  msg.set(bytes, 0);
  msg[bytes.length] = 0x80;

  const hi = Math.floor(bitLen / 0x100000000);
  const lo = bitLen >>> 0;
  msg[totalLen - 8] = (hi >>> 24) & 0xff;
  msg[totalLen - 7] = (hi >>> 16) & 0xff;
  msg[totalLen - 6] = (hi >>> 8) & 0xff;
  msg[totalLen - 5] = hi & 0xff;
  msg[totalLen - 4] = (lo >>> 24) & 0xff;
  msg[totalLen - 3] = (lo >>> 16) & 0xff;
  msg[totalLen - 2] = (lo >>> 8) & 0xff;
  msg[totalLen - 1] = lo & 0xff;

  const W = new Uint32Array(64);

  for (let offset = 0; offset < msg.length; offset += 64) {
    for (let i = 0; i < 16; i++) {
      const j = offset + i * 4;
      W[i] =
        ((msg[j] << 24) | (msg[j + 1] << 16) | (msg[j + 2] << 8) | msg[j + 3]) >>> 0;
    }

    for (let i = 16; i < 64; i++) {
      const s0 = (rotr(W[i - 15], 7) ^ rotr(W[i - 15], 18) ^ (W[i - 15] >>> 3)) >>> 0;
      const s1 = (rotr(W[i - 2], 17) ^ rotr(W[i - 2], 19) ^ (W[i - 2] >>> 10)) >>> 0;
      W[i] = (W[i - 16] + s0 + W[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + K[i] + W[i]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((x) => x.toString(16).padStart(8, "0"))
    .join("");

  return out;
}

async function sha256Hex(input) {
  // Prefer native WebCrypto when available.
  if (typeof crypto !== "undefined" && crypto.subtle && typeof TextEncoder !== "undefined") {
    const enc = new TextEncoder();
    const data = enc.encode(String(input));
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toHex(digest);
  }

  // Fallback for insecure contexts (e.g. http://LAN-IP) or limited browsers.
  return sha256HexJs(input);
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
