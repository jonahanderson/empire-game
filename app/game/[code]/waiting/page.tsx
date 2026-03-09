"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type MeResponse = {
  me: {
    displayName: string;
    submitted: boolean;
  } | null;
};

type GameResponse = {
  code: string;
  name: string;
  theme?: string;
};

export default function WaitingPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();

  const [game, setGame] = useState<GameResponse | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const [gameRes, meRes] = await Promise.all([
        fetch(`/api/games/${code}`),
        fetch(`/api/games/${code}/me`)
      ]);

      if (!gameRes.ok) {
        router.replace("/");
        return;
      }

      const gameJson = (await gameRes.json()) as GameResponse;
      const meJson = (await meRes.json()) as MeResponse;

      if (!meJson.me) {
        router.replace(`/join?code=${code}`);
        return;
      }

      if (!meJson.me.submitted) {
        router.replace(`/game/${code}/submit`);
        return;
      }

      if (mounted) {
        setGame(gameJson);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [code, router]);

  if (!game) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-empire">{game.code}</p>
        <h1 className="text-2xl font-bold">Submission Received</h1>
        <p className="text-slate-700">Theme: {game.theme || "Open"}</p>
      </div>

      <div className="card space-y-3">
        <p>Your secret name has been locked in.</p>
        <p className="text-slate-700">Please wait for the host to continue.</p>
      </div>

      <Link href="/" className="button-secondary">
        Back Home
      </Link>
    </div>
  );
}
