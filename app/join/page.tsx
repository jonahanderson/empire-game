"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { withBasePath } from "@/src/lib/base-path";

export default function JoinGamePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefilledCode = new URLSearchParams(window.location.search).get("code");
    if (prefilledCode) {
      setCode(prefilledCode.toUpperCase());
    }
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const cleanedCode = code.trim().toUpperCase();

    const response = await fetch(withBasePath(`/api/games/${cleanedCode}/join`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName })
    });

    const json = (await response.json()) as { error?: string; code?: string };

    if (!response.ok || !json.code) {
      setError(json.error ?? "Unable to join game.");
      setLoading(false);
      return;
    }

    router.push(`/game/${json.code}/submit`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Join Game</h1>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="code">
            Invite Code
          </label>
          <input
            id="code"
            className="input uppercase"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            required
            minLength={4}
            maxLength={8}
            placeholder="ABC123"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="display-name">
            Display Name
          </label>
          <input
            id="display-name"
            className="input"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            required
            maxLength={32}
            placeholder="Your name"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="button-primary w-full" disabled={loading} type="submit">
          {loading ? "Joining..." : "Join Game"}
        </button>
      </form>
    </div>
  );
}
