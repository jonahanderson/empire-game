import { NextResponse } from "next/server";
import { getGameByCode, listPlayers } from "@/src/lib/store";
import { getHostSession } from "@/src/lib/session";

export async function GET(_: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const game = getGameByCode(code);

  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const hostSession = await getHostSession(game.id);
  if (!hostSession || hostSession !== game.hostSessionId) {
    return NextResponse.json({ error: "Host access denied." }, { status: 403 });
  }

  const players = listPlayers(game).map((player) => ({
    id: player.id,
    displayName: player.displayName,
    submitted: player.submitted
  }));

  const response: {
    game: {
      name: string;
      theme?: string;
      code: string;
      hostPlays: boolean;
      players: { id: string; displayName: string; submitted: boolean }[];
      playerCount: number;
      submissionCount: number;
      invitePath: string;
      submissionsLocked: boolean;
    };
    submissions?: { playerId?: string; displayName?: string; famousPerson: string }[];
  } = {
    game: {
      name: game.name,
      theme: game.theme,
      code: game.code,
      hostPlays: game.hostPlays,
      players,
      playerCount: players.length,
      submissionCount: players.filter((player) => player.submitted).length,
      invitePath: `/join?code=${game.code}`,
      submissionsLocked: game.submissionsLocked
    }
  };

  const submittedPlayers = listPlayers(game).filter((player) => player.submitted && player.submission);
  response.submissions = submittedPlayers.map((player) =>
    game.hostPlays
      ? {
          famousPerson: player.submission as string
        }
      : {
          playerId: player.id,
          displayName: player.displayName,
          famousPerson: player.submission as string
        }
  );

  return NextResponse.json(response);
}

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const game = getGameByCode(code);

  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  const hostSession = await getHostSession(game.id);
  if (!hostSession || hostSession !== game.hostSessionId) {
    return NextResponse.json({ error: "Host access denied." }, { status: 403 });
  }

  const body = (await request.json()) as { action?: string };
  if (body.action === "lock_submissions") {
    game.submissionsLocked = true;
    return NextResponse.json({ locked: true });
  }

  return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
}
