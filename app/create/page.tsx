"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateGamePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [hostPlays, setHostPlays] = useState(true);
  const [hostDisplayName, setHostDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const hostNameRequired = useMemo(() => hostPlays, [hostPlays]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const response = await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        theme,
        hostPlays,
        hostDisplayName: hostPlays ? hostDisplayName : undefined
      })
    });

    const json = (await response.json()) as { error?: string; hostUrl?: string };

    if (!response.ok || !json.hostUrl) {
      setError(json.error ?? "Unable to create game.");
      setLoading(false);
      return;
    }

    router.push(json.hostUrl);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Create Game</h1>
      <form onSubmit={onSubmit} className="card space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="game-name">
            Game Name
          </label>
          <input
            id="game-name"
            className="input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={64}
            placeholder="Friday Night Empire"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="theme">
            Theme (optional)
          </label>
          <input
            id="theme"
            className="input"
            value={theme}
            onChange={(event) => setTheme(event.target.value)}
            maxLength={64}
            placeholder="Celebrities, movies, politics..."
          />
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Is host also playing?</legend>
          <div className="flex gap-3">
            <button
              type="button"
              className={hostPlays ? "button-primary" : "button-secondary"}
              onClick={() => setHostPlays(true)}
            >
              Yes
            </button>
            <button
              type="button"
              className={!hostPlays ? "button-primary" : "button-secondary"}
              onClick={() => setHostPlays(false)}
            >
              No
            </button>
          </div>
        </fieldset>

        {hostNameRequired && (
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="host-name">
              Your Display Name
            </label>
            <input
              id="host-name"
              className="input"
              value={hostDisplayName}
              onChange={(event) => setHostDisplayName(event.target.value)}
              required={hostPlays}
              maxLength={32}
              placeholder="Host player name"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="button-primary w-full" disabled={loading} type="submit">
          {loading ? "Creating..." : "Create Game"}
        </button>
      </form>
    </div>
  );
}
