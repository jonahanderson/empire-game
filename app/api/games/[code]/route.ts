import { NextResponse } from "next/server";
import { getGameByCode, getPlayerById, listPlayers } from "@/src/lib/store";
import { getPlayerSession } from "@/src/lib/session";

export async function GET(_: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const game = await getGameByCode(code);
  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const playerId = await getPlayerSession(game.id);
  const me = playerId ? getPlayerById(game, playerId) : undefined;

  return NextResponse.json({
    code: game.code,
    name: game.name,
    theme: game.theme,
    hostPlays: game.hostPlays,
    joinedCount: listPlayers(game).length,
    me: me
      ? {
          id: me.id,
          displayName: me.displayName,
          submitted: me.submitted
        }
      : null
  });
}
