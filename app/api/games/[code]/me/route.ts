import { NextResponse } from "next/server";
import { getGameByCode, getPlayerById } from "@/src/lib/store";
import { getPlayerSession } from "@/src/lib/session";

export async function GET(_: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const game = await getGameByCode(code);

  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const playerId = await getPlayerSession(game.id);
  if (!playerId) {
    return NextResponse.json({ me: null });
  }

  const player = getPlayerById(game, playerId);
  if (!player) {
    return NextResponse.json({ me: null });
  }

  return NextResponse.json({
    me: {
      id: player.id,
      displayName: player.displayName,
      submitted: player.submitted
    }
  });
}
