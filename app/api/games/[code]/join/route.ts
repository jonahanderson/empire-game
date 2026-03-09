import { NextResponse } from "next/server";
import { addPlayerToGame, getGameByCode, listPlayers, saveGame } from "@/src/lib/store";
import { getPlayerSession, setPlayerSession } from "@/src/lib/session";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const game = await getGameByCode(code);

  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const body = (await request.json()) as { displayName?: string };
  const displayName = body.displayName?.trim();

  if (!displayName) {
    return NextResponse.json({ error: "Display name is required." }, { status: 400 });
  }

  if (displayName.length > 32) {
    return NextResponse.json({ error: "Display name must be 32 characters or less." }, { status: 400 });
  }

  const existingSession = await getPlayerSession(game.id);
  if (existingSession && game.players[existingSession]) {
    return NextResponse.json({ code: game.code, alreadyJoined: true });
  }

  const alreadyExists = listPlayers(game).some(
    (player) => player.displayName.toLowerCase() === displayName.toLowerCase()
  );

  if (alreadyExists) {
    return NextResponse.json({ error: "Display name is already taken in this game." }, { status: 409 });
  }

  const player = addPlayerToGame(game, displayName);
  await saveGame(game);
  await setPlayerSession(game.id, player.id);

  return NextResponse.json({ code: game.code, joined: true });
}
