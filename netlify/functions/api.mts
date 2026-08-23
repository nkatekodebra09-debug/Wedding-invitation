import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import bcrypt from "bcrypt";
import { count, eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { db } from "../../db/index.js";
import { guests, views } from "../../db/schema.js";

const jsonHeaders = { "content-type": "application/json; charset=utf-8" };

function getMediaStore() {
  return getStore("wedding-media");
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: jsonHeaders });
}

async function requestBody(req: Request) {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

function getToken(req: Request) {
  return req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
}

function isAuthorized(req: Request) {
  const token = getToken(req);
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return false;

  try {
    jwt.verify(token, secret);
    return true;
  } catch {
    return false;
  }
}

async function submitRsvp(req: Request) {
  const body = await requestBody(req);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : null;

  if (!name || !email || typeof body?.attending !== "boolean") {
    return json({ error: "Name, email, and attendance are required." }, 400);
  }

  const [guest] = await db
    .insert(guests)
    .values({ name, email, attending: body.attending, message })
    .returning();

  return json({ message: "RSVP received!", guest }, 201);
}

async function logView(req: Request, context: Context) {
  const body = await requestBody(req);
  const page = typeof body?.page === "string" ? body.page.slice(0, 500) : "/";

  await db.insert(views).values({ ip: context.ip || null, page });
  return json({ message: "View logged." }, 201);
}

async function login(req: Request) {
  const body = await requestBody(req);
  const configuredUsername = process.env.ADMIN_USERNAME;
  const configuredPassword = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.JWT_SECRET;

  if (!configuredUsername || !configuredPassword || !secret) {
    return json({ error: "Admin login is not configured." }, 503);
  }

  const usernameMatches = body?.username === configuredUsername;
  const passwordMatches = typeof body?.password === "string"
    ? await bcrypt.compare(body.password, configuredPassword)
    : false;

  if (!usernameMatches || !passwordMatches) {
    return json({ error: "Invalid credentials" }, 400);
  }

  const token = jwt.sign({ username: configuredUsername }, secret, { expiresIn: "1h" });
  return json({ message: "Login successful", token });
}

async function stats(req: Request) {
  if (!isAuthorized(req)) return json({ error: "Invalid or missing token" }, 401);

  const [[guestCount], [attendingCount], [viewCount]] = await Promise.all([
    db.select({ value: count() }).from(guests),
    db.select({ value: count() }).from(guests).where(eq(guests.attending, true)),
    db.select({ value: count() }).from(views),
  ]);

  return json({
    totalGuests: guestCount.value,
    attendingGuests: attendingCount.value,
    totalViews: viewCount.value,
  });
}

async function uploadMedia(req: Request) {
  if (!isAuthorized(req)) return json({ error: "Invalid or missing token" }, 401);

  const formData = await req.formData();
  const image = formData.get("image");
  const audio = formData.get("audio");
  const result: { image: string | null; audio: string | null } = { image: null, audio: null };

  if (image instanceof File && image.size > 0) {
    if (!["image/jpeg", "image/png", "image/webp"].includes(image.type) || image.size > 15 * 1024 * 1024) {
      return json({ error: "Unsupported image or image exceeds 15 MB." }, 400);
    }
    await getMediaStore().set("image", image);
    result.image = "/api/media/image";
  }

  if (audio instanceof File && audio.size > 0) {
    if (!["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"].includes(audio.type) || audio.size > 15 * 1024 * 1024) {
      return json({ error: "Unsupported audio or audio exceeds 15 MB." }, 400);
    }
    await getMediaStore().set("audio", audio);
    result.audio = "/api/media/audio";
  }

  if (!result.image && !result.audio) return json({ error: "No media file provided." }, 400);
  return json({ message: "Media uploaded successfully.", ...result });
}

async function serveMedia(req: Request, kind: "image" | "audio") {
  const file = await getMediaStore().get(kind, { type: "blob" });

  if (!file) {
    const fallback = kind === "image" ? "/assets/bride-groom.jpeg" : "/assets/weddingSong.mp3";
    return Response.redirect(new URL(fallback, req.url), 302);
  }

  const contentType = file instanceof Blob && file.type
    ? file.type
    : kind === "image" ? "image/jpeg" : "audio/mpeg";
  return new Response(file as Blob, { headers: { "content-type": contentType, "cache-control": "public, max-age=300" } });
}

export default async function handler(req: Request, context: Context) {
  const { pathname } = new URL(req.url);

  try {
    if (req.method === "POST" && pathname === "/api/guests/rsvp") return await submitRsvp(req);
    if (req.method === "POST" && pathname === "/api/views/view") return await logView(req, context);
    if (req.method === "POST" && pathname === "/api/admin/login") return await login(req);
    if (req.method === "GET" && pathname === "/api/admin/stats") return await stats(req);
    if (req.method === "POST" && pathname === "/api/media/upload") return await uploadMedia(req);
    if (req.method === "GET" && pathname === "/api/media/image") return await serveMedia(req, "image");
    if (req.method === "GET" && pathname === "/api/media/audio") return await serveMedia(req, "audio");
    return json({ error: "Not found" }, 404);
  } catch (error) {
    console.error("API request failed", error);
    return json({ error: "Request failed" }, 500);
  }
}

export const config: Config = {
  path: "/api/*",
};
