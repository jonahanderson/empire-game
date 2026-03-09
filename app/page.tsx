import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-empire">Empire MVP</p>
        <h1 className="text-3xl font-bold">Set up your Empire party game</h1>
        <p className="text-slate-700">
          Create a game, invite players, and collect one secret famous person name per player.
        </p>
      </header>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold">Start</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/create" className="button-primary w-full">
            Create Game
          </Link>
          <Link href="/join" className="button-secondary w-full">
            Join Game
          </Link>
        </div>
      </section>
    </div>
  );
}
