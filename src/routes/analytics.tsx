import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth";
import { listTasks, type Task } from "@/lib/tasks";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, ListTodo, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  component: () => (<AppLayout><Analytics /></AppLayout>),
});

function Analytics() {
  const { user } = useAuth();
  const uid = user!.id;
  const { data: tasks = [] } = useQuery({ queryKey: ["tasks", uid], queryFn: () => listTasks(uid) });

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.stage === "done").length;
    const inProgress = tasks.filter((t) => t.stage === "in_progress").length;
    const todo = tasks.filter((t) => t.stage === "todo").length;
    const overdue = tasks.filter((t) => t.due_date && t.stage !== "done" && new Date(t.due_date) < new Date()).length;
    return { total, done, inProgress, todo, overdue, completion: total ? Math.round((done / total) * 100) : 0 };
  }, [tasks]);

  const recent: Task[] = useMemo(
    () => [...tasks].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()).slice(0, 6),
    [tasks]
  );

  const cards = [
    { label: "Total tasks", value: stats.total, icon: ListTodo, tone: "text-indigo-400" },
    { label: "Completed", value: stats.done, icon: CheckCircle2, tone: "text-emerald-400" },
    { label: "In progress", value: stats.inProgress, icon: Clock, tone: "text-amber-400" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, tone: "text-rose-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Analytics</h2>
        <p className="text-sm text-muted-foreground">Your productivity at a glance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/60 bg-card/50 p-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.tone}`} />
            </div>
            <div className="mt-2 text-3xl font-semibold">{c.value}</div>
          </Card>
        ))}
      </div>

      <Card className="border-border/60 bg-card/50 p-5 backdrop-blur">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Completion rate</h3>
          <span className="text-sm text-muted-foreground">{stats.completion}%</span>
        </div>
        <Progress value={stats.completion} className="mt-3" />
        <div className="mt-3 text-xs text-muted-foreground">
          {stats.done} of {stats.total} tasks completed
        </div>
      </Card>

      <Card className="border-border/60 bg-card/50 p-5 backdrop-blur">
        <h3 className="font-medium">Recent activity</h3>
        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No activity yet — create your first task.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60">
            {recent.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{t.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{t.stage.replace("_", " ")} · {t.priority}</div>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(t.updated_at), { addSuffix: true })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
