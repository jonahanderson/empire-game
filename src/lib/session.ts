import { cookies } from "next/headers";

const PLAYER_COOKIE = "empire_player_sessions";
const HOST_COOKIE = "empire_host_sessions";

type SessionMap = Record<string, string>;

function safeParse(value: string | undefined): SessionMap {
  if (!value) {
    return {};
  }
  try {
    const parsed = JSON.parse(value) as unknown;
    if (parsed && typeof parsed === "object") {
      const out: SessionMap = {};
      for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
        if (typeof v === "string") {
          out[k] = v;
        }
      }
      return out;
    }
    return {};
  } catch {
    return {};
  }
}

export async function getPlayerSession(gameId: string): Promise<string | undefined> {
  const jar = await cookies();
  const map = safeParse(jar.get(PLAYER_COOKIE)?.value);
  return map[gameId];
}

export async function setPlayerSession(gameId: string, playerId: string): Promise<void> {
  const jar = await cookies();
  const map = safeParse(jar.get(PLAYER_COOKIE)?.value);
  map[gameId] = playerId;

  jar.set(PLAYER_COOKIE, JSON.stringify(map), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function getHostSession(gameId: string): Promise<string | undefined> {
  const jar = await cookies();
  const map = safeParse(jar.get(HOST_COOKIE)?.value);
  return map[gameId];
}

export async function setHostSession(gameId: string, hostSessionId: string): Promise<void> {
  const jar = await cookies();
  const map = safeParse(jar.get(HOST_COOKIE)?.value);
  map[gameId] = hostSessionId;

  jar.set(HOST_COOKIE, JSON.stringify(map), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}
