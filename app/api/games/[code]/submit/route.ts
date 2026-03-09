import { NextResponse } from "next/server";
import { getGameByCode, submitForPlayer } from "@/src/lib/store";
import { getPlayerSession } from "@/src/lib/session";

export async function POST(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const game = getGameByCode(code);

  if (!game) {
    return NextResponse.json({ error: "Game not found." }, { status: 404 });
  }

  if (game.submissionsLocked) {
    return NextResponse.json({ error: "Submissions are locked." }, { status: 403 });
  }

  const playerId = await getPlayerSession(game.id);
  if (!playerId || !game.players[playerId]) {
    return NextResponse.json({ error: "You must join the game first." }, { status: 401 });
  }

  const body = (await request.json()) as { famousPerson?: string; confirm?: boolean };
  const famousPerson = body.famousPerson?.trim();

  if (!body.confirm) {
    return NextResponse.json({ error: "Submission must be confirmed." }, { status: 400 });
  }

  if (!famousPerson) {
    return NextResponse.json({ error: "Famous person name is required." }, { status: 400 });
  }

  if (famousPerson.length > 80) {
    return NextResponse.json({ error: "Please keep the name under 80 characters." }, { status: 400 });
  }

  try {
    submitForPlayer(game, playerId, famousPerson);
  } catch (error) {
    if (error instanceof Error && error.message === "ALREADY_SUBMITTED") {
      return NextResponse.json({ error: "Submission already finalized." }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to submit." }, { status: 400 });
  }

  return NextResponse.json({ submitted: true });
}
