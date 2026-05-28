import { format, isPast, isToday } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { Task, TaskPriority } from "@/lib/tasks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Pencil, Trash2 } from "lucide-react";

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  high: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export function TaskCard({
  task, onEdit, onDelete,
}: { task: Task; onEdit: (t: Task) => void; onDelete: (t: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  const due = task.due_date ? new Date(task.due_date) : null;
  const overdue = due && task.stage !== "done" && isPast(due) && !isToday(due);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.5 : 1 }}
      className="group rounded-xl border border-border/60 bg-card/60 p-3 shadow-sm backdrop-blur transition-colors hover:border-primary/40"
    >
      <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing">
        <div className="flex items-start justify-between gap-2">
          <h4 className="line-clamp-2 text-sm font-medium leading-snug">{task.title}</h4>
          <Badge variant="outline" className={`shrink-0 text-[10px] uppercase ${PRIORITY_STYLES[task.priority as TaskPriority]}`}>
            {task.priority}
          </Badge>
        </div>
        {task.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
        )}
        {due && (
          <div className={`mt-3 flex items-center gap-1.5 text-xs ${overdue ? "text-rose-400" : "text-muted-foreground"}`}>
            <CalendarDays className="h-3.5 w-3.5" />
            {format(due, "MMM d")} {overdue && "· Overdue"}
          </div>
        )}
      </div>
      <div className="mt-3 flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(task)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(task)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
