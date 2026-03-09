import { Game, Player } from "@/src/lib/types";

const GAME_TTL_MS = 1000 * 60 * 60 * 12;

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
  let code = "";
  do {
    code = randomId(6);
  } while (store.byCode.has(code));
  return code;
}

function cleanupExpiredGames(): void {
  const now = Date.now();
  for (const [code, game] of store.byCode.entries()) {
    if (now - new Date(game.createdAt).getTime() > GAME_TTL_MS) {
      store.byCode.delete(code);
    }
  }
}

export function createGame(params: {
  name: string;
  theme?: string;
  hostPlays: boolean;
  hostDisplayName?: string;
}): Game {
  cleanupExpiredGames();

  const gameId = randomId(12);
  const code = createInviteCode();
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

  store.byCode.set(code, game);
  return game;
}

export function getGameByCode(code: string): Game | undefined {
  cleanupExpiredGames();
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
