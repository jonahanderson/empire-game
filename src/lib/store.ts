import { Game, Player } from "@/src/lib/types";

const GAME_TTL_SECONDS = 60 * 60 * 12;
const GAME_TTL_MS = GAME_TTL_SECONDS * 1000;
const KV_URL = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
const USE_KV = Boolean(KV_URL && KV_TOKEN);

type GameStore = {
  byCode: Map<string, Game>;
};

declare global {
  // eslint-disable-next-line no-var
  var __empireStore: GameStore | undefined;
}

const store: GameStore = globalThis.__empireStore ?? { byCode: new Map<string, Game>() };

if (!globalThis.__empireStore) {
  globalThis.__empireStore = store;
}

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(length = 16): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function createInviteCode(): string {
  return randomId(6);
}

function cleanupExpiredGamesMemory(): void {
  const now = Date.now();
  for (const [code, game] of store.byCode.entries()) {
    if (now - new Date(game.createdAt).getTime() > GAME_TTL_MS) {
      store.byCode.delete(code);
    }
  }
}

function gameKey(code: string): string {
  return `empire:game:${code.toUpperCase()}`;
}

async function kvCommand<T>(command: unknown[]): Promise<T> {
  const response = await fetch(KV_URL as string, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KV_TOKEN as string}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("KV_ERROR");
  }

  const json = (await response.json()) as { result: T };
  return json.result;
}

async function kvGetGame(code: string): Promise<Game | undefined> {
  const raw = await kvCommand<string | null>(["GET", gameKey(code)]);
  if (!raw) {
    return undefined;
  }

  try {
    return JSON.parse(raw) as Game;
  } catch {
    return undefined;
  }
}

async function kvSetGame(game: Game): Promise<void> {
  await kvCommand(["SETEX", gameKey(game.code), GAME_TTL_SECONDS, JSON.stringify(game)]);
}

export async function saveGame(game: Game): Promise<void> {
  if (USE_KV) {
    await kvSetGame(game);
    return;
  }
  store.byCode.set(game.code, game);
}

export async function createGame(params: {
  name: string;
  theme?: string;
  hostPlays: boolean;
  hostDisplayName?: string;
}): Promise<Game> {
  if (!USE_KV) {
    cleanupExpiredGamesMemory();
  }

  const gameId = randomId(12);
  let code = "";
  for (let i = 0; i < 50; i += 1) {
    const candidate = createInviteCode();
    const existing = await getGameByCode(candidate);
    if (!existing) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    throw new Error("CODE_GENERATION_FAILED");
  }

  const hostSessionId = randomId(20);
  const game: Game = {
    id: gameId,
    code,
    name: params.name,
    theme: params.theme?.trim() || undefined,
    hostPlays: params.hostPlays,
    hostSessionId,
    createdAt: nowIso(),
    submissionsLocked: false,
    players: {}
  };

  if (params.hostPlays && params.hostDisplayName) {
    const playerId = randomId(12);
    game.hostParticipantId = playerId;
    const hostPlayer: Player = {
      id: playerId,
      displayName: params.hostDisplayName.trim(),
      submitted: false,
      joinedAt: nowIso()
    };
    game.players[playerId] = hostPlayer;
  }

  await saveGame(game);
  return game;
}

export async function getGameByCode(code: string): Promise<Game | undefined> {
  if (USE_KV) {
    return kvGetGame(code.toUpperCase());
  }
  cleanupExpiredGamesMemory();
  return store.byCode.get(code.toUpperCase());
}

export function addPlayerToGame(game: Game, displayName: string): Player {
  const playerId = randomId(12);
  const player: Player = {
    id: playerId,
    displayName: displayName.trim(),
    submitted: false,
    joinedAt: nowIso()
  };
  game.players[player.id] = player;
  return player;
}

export function getPlayerById(game: Game, playerId: string): Player | undefined {
  return game.players[playerId];
}

export function submitForPlayer(game: Game, playerId: string, famousPerson: string): Player {
  const player = game.players[playerId];
  if (!player) {
    throw new Error("PLAYER_NOT_FOUND");
  }
  if (player.submitted) {
    throw new Error("ALREADY_SUBMITTED");
  }
  player.submitted = true;
  player.submission = famousPerson.trim();
  return player;
}

export function listPlayers(game: Game): Player[] {
  return Object.values(game.players).sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
}
