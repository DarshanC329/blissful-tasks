import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { KanbanColumn } from "@/components/kanban/KanbanColumn";
import { TaskDialog, type TaskFormValues } from "@/components/kanban/TaskDialog";
import { STAGES, listTasks, createTask, updateTask, deleteTask, type Task, type TaskStage, type TaskPriority } from "@/lib/tasks";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Search } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  component: () => (<AppLayout><Dashboard /></AppLayout>),
});

function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const uid = user!.id;

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", uid],
    queryFn: () => listTasks(uid),
  });

  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultStage, setDefaultStage] = useState<TaskStage>("todo");
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) =>
      (!q || t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) &&
      (priorityFilter === "all" || t.priority === priorityFilter)
    );
  }, [tasks, query, priorityFilter]);

  const grouped = useMemo(() => {
    const map: Record<TaskStage, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const t of filtered) map[t.stage as TaskStage].push(t);
    return map;
  }, [filtered]);

  const createMut = useMutation({
    mutationFn: (values: TaskFormValues) => createTask({
      user_id: uid,
      title: values.title,
      description: values.description ?? "",
      priority: values.priority,
      stage: values.stage,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", uid] }); toast.success("Task created"); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: TaskFormValues }) => updateTask(id, {
      title: values.title,
      description: values.description ?? "",
      priority: values.priority,
      stage: values.stage,
      due_date: values.due_date ? new Date(values.due_date).toISOString() : null,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", uid] }); toast.success("Task updated"); },
  });

  const stageMut = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: TaskStage }) => updateTask(id, { stage }),
    onMutate: async ({ id, stage }) => {
      await qc.cancelQueries({ queryKey: ["tasks", uid] });
      const prev = qc.getQueryData<Task[]>(["tasks", uid]);
      qc.setQueryData<Task[]>(["tasks", uid], (old) => old?.map((t) => t.id === id ? { ...t, stage } : t) ?? []);
      return { prev };
    },
    onError: (_e, _v, ctx) => { if (ctx?.prev) qc.setQueryData(["tasks", uid], ctx.prev); toast.error("Could not move task"); },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks", uid] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks", uid] }); toast.success("Task deleted"); },
  });

  const onDragEnd = (e: DragEndEvent) => {
    const overId = e.over?.id as TaskStage | undefined;
    const id = e.active.id as string;
    if (!overId) return;
    const task = tasks.find((t) => t.id === id);
    if (!task || task.stage === overId) return;
    stageMut.mutate({ id, stage: overId });
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const openCreate = (stage: TaskStage) => { setEditing(null); setDefaultStage(stage); setDialogOpen(true); };
  const openEdit = (t: Task) => { setEditing(t); setDialogOpen(true); };

  const stats = useMemo(() => ({
    total: tasks.length,
    done: tasks.filter((t) => t.stage === "done").length,
    inProgress: tasks.filter((t) => t.stage === "in_progress").length,
    overdue: tasks.filter((t) => t.due_date && t.stage !== "done" && new Date(t.due_date) < new Date()).length,
  }), [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground">
            {stats.total} tasks · {stats.done} done · {stats.inProgress} in progress
            {stats.overdue > 0 && <span className="text-rose-400"> · {stats.overdue} overdue</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tasks" className="w-48 pl-8 md:w-64"
            />
          </div>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => openCreate("todo")}><Plus className="mr-1.5 h-4 w-4" /> New task</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 rounded-2xl border border-border/60 p-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {STAGES.map((s) => (
              <KanbanColumn
                key={s.id} stage={s.id} label={s.label} tasks={grouped[s.id]}
                onAdd={openCreate} onEdit={openEdit} onDelete={setDeleteTarget}
              />
            ))}
          </div>
        </DndContext>
      )}

      <TaskDialog
        open={dialogOpen} onOpenChange={setDialogOpen} initial={editing} defaultStage={defaultStage}
        onSubmit={async (values) => {
          if (editing) await updateMut.mutateAsync({ id: editing.id, values });
          else await createMut.mutateAsync(values);
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be permanently deleted. This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) deleteMut.mutate(deleteTarget.id); setDeleteTarget(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
