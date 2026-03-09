"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { withBasePath } from "@/src/lib/base-path";

type GameResponse = {
  code: string;
  name: string;
  theme?: string;
  me: {
    displayName: string;
    submitted: boolean;
  } | null;
};

export default function SubmissionPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code.toUpperCase();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [game, setGame] = useState<GameResponse | null>(null);
  const [famousPerson, setFamousPerson] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const response = await fetch(withBasePath(`/api/games/${code}`));
      const json = (await response.json()) as GameResponse & { error?: string };

      if (!response.ok) {
        if (mounted) {
          setError(json.error ?? "Game not found.");
          setLoading(false);
        }
        return;
      }

      if (!json.me) {
        router.replace(`/join?code=${code}`);
        return;
      }

      if (json.me.submitted) {
        router.replace(`/game/${code}/waiting`);
        return;
      }

      if (mounted) {
        setGame(json);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [code, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!confirm) {
      setError("Please confirm this is your final submission.");
      return;
    }

    setSubmitting(true);
    const response = await fetch(withBasePath(`/api/games/${code}/submit`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ famousPerson, confirm: true })
    });

    const json = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(json.error ?? "Unable to submit.");
      setSubmitting(false);
      return;
    }

    router.push(`/game/${code}/waiting`);
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error && !game) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">{error}</p>
        <Link href="/join" className="button-secondary">
          Join a Game
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-empire">{game?.code}</p>
        <h1 className="text-2xl font-bold">{game?.name}</h1>
        <p className="text-slate-700">Theme: {game?.theme || "Open"}</p>
      </div>

      <form onSubmit={onSubmit} className="card space-y-4">
        <p className="text-sm text-slate-700">
          Submit one secret famous person name. This cannot be edited after confirmation.
        </p>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="famous-person">
            Famous Person
          </label>
          <input
            id="famous-person"
            className="input"
            value={famousPerson}
            onChange={(event) => setFamousPerson(event.target.value)}
            required
            maxLength={80}
            placeholder="e.g. Princess Leia"
          />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={confirm}
            onChange={(event) => setConfirm(event.target.checked)}
          />
          I confirm this is my final submission.
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="button-primary w-full" disabled={submitting} type="submit">
          {submitting ? "Submitting..." : "Submit Final Name"}
        </button>
      </form>
    </div>
  );
}
