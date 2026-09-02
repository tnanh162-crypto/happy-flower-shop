import crypto from "crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import db from "./db";

export const SESSION_COOKIE = "flower_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s) {
    // Fallback so local/dev runs still work if the developer forgot to set
    // SESSION_SECRET, but this must never be relied on in production.
    return "dev-only-insecure-secret-change-me";
  }
  return s;
}

function sign(value) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function createSessionToken() {
  const payload = JSON.stringify({
    admin: true,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token || !token.includes(".")) return false;
  const [encoded, signature] = token.split(".");
  const expected = sign(encoded);
  const valid =
    signature &&
    expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return false;
  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString());
    if (!payload.admin || payload.exp < Date.now()) return false;
    return true;
  } catch {
    return false;
  }
}

/** Server Components / route handlers: is the current request an authenticated admin? */
export function isAdminSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

/** Verify username/password against the single seeded admin row. */
export function verifyAdminCredentials(username, password) {
  const row = db
    .prepare("SELECT * FROM admin WHERE username = ?")
    .get(username);
  if (!row) return false;
  return bcrypt.compareSync(password, row.password_hash);
}

export function adminExists() {
  const row = db.prepare("SELECT COUNT(*) as c FROM admin").get();
  return row.c > 0;
}
