import { NextResponse } from "next/server";
import { createGame } from "@/src/lib/store";
import { setHostSession, setPlayerSession } from "@/src/lib/session";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    theme?: string;
    hostPlays?: boolean;
    hostDisplayName?: string;
  };

  const name = body.name?.trim();
  if (!name) {
    return NextResponse.json({ error: "Game name is required." }, { status: 400 });
  }

  const hostPlays = Boolean(body.hostPlays);
  const hostDisplayName = body.hostDisplayName?.trim();
  if (hostPlays && !hostDisplayName) {
    return NextResponse.json({ error: "Host display name is required when host is playing." }, { status: 400 });
  }

  const game = await createGame({
    name,
    theme: body.theme,
    hostPlays,
    hostDisplayName
  });

  await setHostSession(game.id, game.hostSessionId);
  if (game.hostPlays && game.hostParticipantId) {
    await setPlayerSession(game.id, game.hostParticipantId);
  }

  return NextResponse.json({
    code: game.code,
    hostUrl: `/host/${game.code}`,
    inviteUrl: `/join?code=${game.code}`
  });
}
