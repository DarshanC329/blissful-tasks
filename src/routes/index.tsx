import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sparkles, Layers, Zap, MoonStar } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && user) nav({ to: "/dashboard" });
  }, [user, loading, nav]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">TaskFlow AI</span>
        </div>
        <div className="flex gap-2">
          <Link to="/auth"><Button variant="ghost">Sign in</Button></Link>
          <Link to="/auth" search={{ mode: "signup" } as never}><Button>Get started</Button></Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-24 pt-16 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> New · Drag-and-drop Kanban
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold tracking-tight md:text-6xl">
          The calmest way to ship your <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent">to-do list</span>.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground">
          A modern Kanban task manager with drag-and-drop, priorities, due dates, and analytics — built for focused work.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/auth" search={{ mode: "signup" } as never}><Button size="lg">Start for free</Button></Link>
          <Link to="/auth"><Button size="lg" variant="outline">Sign in</Button></Link>
        </div>

        <div className="mx-auto mt-20 grid max-w-4xl gap-4 sm:grid-cols-3">
          {[
            { icon: Layers, title: "Kanban board", desc: "Todo, In Progress, Done — drag and drop between stages." },
            { icon: Zap, title: "Lightning fast", desc: "Optimistic updates feel instant, even on slow networks." },
            { icon: MoonStar, title: "Dark mode", desc: "Glassmorphism cards, refined for late-night focus." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border/60 bg-card/40 p-5 text-left backdrop-blur">
              <f.icon className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-medium">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
