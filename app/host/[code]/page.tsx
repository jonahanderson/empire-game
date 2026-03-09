"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { CopyButton } from "@/src/components/copy-button";

type Player = {
  id: string;
  displayName: string;
  submitted: boolean;
};

type Dashboard = {
  game: {
    name: string;
    theme?: string;
    code: string;
    hostPlays: boolean;
    players: Player[];
    playerCount: number;
    submissionCount: number;
    invitePath: string;
    submissionsLocked: boolean;
  };
  submissions?: {
    playerId?: string;
    displayName?: string;
    famousPerson: string;
  }[];
};

export default function HostDashboardPage() {
  const params = useParams<{ code: string }>();
  const code = params.code.toUpperCase();

  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState("");
  const [locking, setLocking] = useState(false);

  async function loadDashboard() {
    const response = await fetch(`/api/host/${code}`, { cache: "no-store" });
    const json = (await response.json()) as Dashboard & { error?: string };

    if (!response.ok) {
      setError(json.error ?? "Unable to load host dashboard.");
      return;
    }

    setError("");
    setData(json);
  }

  useEffect(() => {
    loadDashboard();
    const timer = window.setInterval(loadDashboard, 3000);
    return () => window.clearInterval(timer);
  }, [code]);

  const inviteUrl = useMemo(() => {
    if (!data) {
      return "";
    }
    if (typeof window === "undefined") {
      return data.game.invitePath;
    }
    return `${window.location.origin}${data.game.invitePath}`;
  }, [data]);

  async function onLockSubmissions() {
    setLocking(true);
    await fetch(`/api/host/${code}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "lock_submissions" })
    });
    await loadDashboard();
    setLocking(false);
  }

  if (error && !data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Host Dashboard</h1>
        <p className="text-red-600">{error}</p>
        <Link href="/" className="button-secondary">
          Home
        </Link>
      </div>
    );
  }

  if (!data) {
    return <p>Loading...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-empire">Host Dashboard</p>
        <h1 className="text-2xl font-bold">{data.game.name}</h1>
        <p className="text-slate-700">Theme: {data.game.theme || "Open"}</p>
      </div>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Invites</h2>
        <div className="space-y-2">
          <p>
            Code: <span className="font-mono text-lg font-bold">{data.game.code}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            <CopyButton value={data.game.code} label="Copy Code" />
            <CopyButton value={inviteUrl} label="Copy Invite Link" />
          </div>
          <p className="break-all text-sm text-slate-600">{inviteUrl}</p>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Players</h2>
        <p className="text-sm text-slate-700">
          {data.game.playerCount} players joined • {data.game.submissionCount} submitted
        </p>
        {data.game.hostPlays && (
          <Link href={`/game/${data.game.code}/submit`} className="button-secondary">
            Submit As Host Player
          </Link>
        )}
        <ul className="space-y-2">
          {data.game.players.map((player) => (
            <li key={player.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
              <span>{player.displayName}</span>
              <span className={player.submitted ? "text-empire" : "text-slate-500"}>
                {player.submitted ? "Submitted" : "Not submitted"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="text-lg font-semibold">Secret Submissions</h2>
        <p className="text-sm text-slate-700">
          {data.game.hostPlays
            ? "Host is playing, so submissions are shown without player names."
            : "Host is moderator-only, so player names are shown with submissions."}
        </p>
        <ul className="space-y-2">
          {data.submissions?.length ? (
            data.submissions.map((entry, index) => (
              <li
                key={entry.playerId ?? `${entry.famousPerson}-${index}`}
                className="rounded-xl border border-slate-200 p-3"
              >
                {!data.game.hostPlays && entry.displayName && <p className="font-medium">{entry.displayName}</p>}
                {data.game.hostPlays && <p className="text-xs font-medium uppercase text-slate-500">Anonymous</p>}
                <p className="text-slate-700">{entry.famousPerson}</p>
              </li>
            ))
          ) : (
            <li className="text-slate-500">No submissions yet.</li>
          )}
        </ul>
      </section>

      <button
        className="button-secondary"
        onClick={onLockSubmissions}
        disabled={locking || data.game.submissionsLocked}
        type="button"
      >
        {data.game.submissionsLocked ? "Submissions Locked" : locking ? "Locking..." : "Lock Submissions"}
      </button>
    </div>
  );
}
