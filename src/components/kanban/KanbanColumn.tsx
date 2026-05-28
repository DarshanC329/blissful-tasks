import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStage } from "@/lib/tasks";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const STAGE_ACCENT: Record<TaskStage, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-indigo-400",
  done: "bg-emerald-400",
};

export function KanbanColumn({
  stage, label, tasks, onAdd, onEdit, onDelete,
}: {
  stage: TaskStage; label: string; tasks: Task[];
  onAdd: (stage: TaskStage) => void;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className={`flex min-h-[60vh] w-full flex-col rounded-2xl border border-border/60 bg-card/30 p-3 backdrop-blur transition-colors ${
        isOver ? "border-primary/50 bg-primary/5" : ""
      }`}
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${STAGE_ACCENT[stage]}`} />
          <h3 className="text-sm font-medium">{label}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{tasks.length}</span>
        </div>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onAdd(stage)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {tasks.length === 0 ? (
          <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
            Drop tasks here or
            <button onClick={() => onAdd(stage)} className="mt-1 text-primary hover:underline">
              add a new one
            </button>
          </div>
        ) : (
          tasks.map((t) => <TaskCard key={t.id} task={t} onEdit={onEdit} onDelete={onDelete} />)
        )}
      </div>
    </div>
  );
}
