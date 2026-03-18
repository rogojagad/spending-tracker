import * as jose from "jose";
import { Context, Next } from "@hono/hono";

const JWT_SECRET = Deno.env.get("JWT_SECRET");
if (!JWT_SECRET) {
  throw new Error(`JWT_SECRET environment variable not configured`);
}

const APP_PASSWORD = Deno.env.get("APP_PASSWORD");
if (!APP_PASSWORD) {
  throw new Error(`APP_PASSWORD environment variable not configured`);
}

const secret = new TextEncoder().encode(JWT_SECRET);

export async function generateToken(): Promise<string> {
  const token = await new jose.SignJWT({}).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("10 minutes")
    .sign(secret);

  return token;
}

export function validatePassword(password: string): boolean {
  return password === APP_PASSWORD;
}

export async function auth(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized - Missing auth header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    await jose.jwtVerify(token, secret);

    return next();
  } catch (error) {
    console.error(`Error when checking token: ${error}`);
    return c.json({ error: "Unauthorized - Invalid token" }, 401);
  }
}
