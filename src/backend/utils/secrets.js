"use strict";

/**
 * Secret masking & (MVP-grade) encryption helpers.
 *
 * - maskSecret: mask a secret for display/logs (keep first/last 4 chars).
 * - maskObject: recursively mask fields whose names look like secrets.
 * - encrypt/decrypt: XOR + base64 with key from env (SECRET_ENCRYPTION_KEY).
 *   NOT cryptographically strong — MVP only; replace with AES-256-GCM + Vault for prod.
 */

import crypto from "node:crypto";

const SECRET_KEY_NAMES = /password|passwd|secret|token|api[_-]?key|private[_-]?key|credential|auth/i;

function getEncryptionKey() {
  const k = process.env.SECRET_ENCRYPTION_KEY || process.env.AUTH_SECRET;
  if (k && k.length >= 16) return k;
  // Dev-only fallback. Warn once.
  if (!getEncryptionKey._warned) {
    // eslint-disable-next-line no-console
    console.warn("[secrets] No SECRET_ENCRYPTION_KEY set; using dev fallback. Do NOT use in production.");
    getEncryptionKey._warned = true;
  }
  return "ogmop-dev-only-insecure-key-change-me";
}

function maskSecret(value) {
  if (value === null || value === undefined) return value;
  const s = String(value);
  if (s.length === 0) return s;
  if (s.length <= 8) return "*".repeat(s.length);
  return s.slice(0, 4) + "*".repeat(Math.max(4, s.length - 8)) + s.slice(-4);
}

function isSecretKey(name) {
  return SECRET_KEY_NAMES.test(String(name || ""));
}

function maskObject(obj, depth) {
  depth = depth === undefined ? 0 : depth;
  if (depth > 8) return obj;
  if (Array.isArray(obj)) return obj.map((v) => maskObject(v, depth + 1));
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      if (isSecretKey(k)) {
        out[k] = typeof v === "string" ? maskSecret(v) : "[REDACTED]";
      } else {
        out[k] = maskObject(v, depth + 1);
      }
    }
    return out;
  }
  return obj;
}

function xorBuffer(buf, keyBuf) {
  const out = Buffer.alloc(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] ^ keyBuf[i % keyBuf.length];
  }
  return out;
}

function deriveKey() {
  return crypto.createHash("sha256").update(getEncryptionKey()).digest();
}

function encrypt(plaintext) {
  if (plaintext === null || plaintext === undefined) return plaintext;
  const key = deriveKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, tag, enc]);
  return "aes:" + payload.toString("base64");
}

function decrypt(ciphertext) {
  if (ciphertext === null || ciphertext === undefined) return ciphertext;
  const s = String(ciphertext);
  if (s.startsWith("aes:")) {
    try {
      const key = deriveKey();
      const payload = Buffer.from(s.slice(4), "base64");
      const iv = payload.slice(0, 12);
      const tag = payload.slice(12, 28);
      const enc = payload.slice(28);
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(tag);
      const dec = Buffer.concat([decipher.update(enc), decipher.final()]);
      return dec.toString("utf8");
    } catch (e) {
      return null;
    }
  }
  if (s.startsWith("enc:")) {
    // legacy XOR+base64 (MVP) — kept for backward compatibility
    try {
      const key = getEncryptionKey();
      const keyBuf = crypto.createHash("sha256").update(key).digest();
      const payload = Buffer.from(s.slice(4), "base64");
      const xored = payload.slice(12);
      const data = xorBuffer(xored, keyBuf);
      return data.toString("utf8");
    } catch (e) {
      return null;
    }
  }
  return s; // not encrypted, return as-is
}

function redactForLog(value) {
  if (typeof value === "string") {
    // Heuristic: mask anything that looks like a secret assignment.
    return value.replace(/(password|token|secret|api[_-]?key)\s*[:=]\s*["']?[^"'\s]+/gi, "$1=***");
  }
  return maskObject(value);
}

export {
  maskSecret,
  maskObject,
  isSecretKey,
  encrypt,
  decrypt,
  redactForLog,
};

export default {
  maskSecret,
  maskObject,
  isSecretKey,
  encrypt,
  decrypt,
  redactForLog,
};