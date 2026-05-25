import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListTasks,
  getListTasksQueryKey,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  getGetDashboardSummaryQueryKey,
  type TaskInputPriority,
  type TaskUpdatePriority,
  type TaskUpdateStatus,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ListTodo, Plus, Pencil, Trash2, Clock } from "lucide-react";

interface Task {
  id: number;
  title: string;
  description?: string | null;
  priority: string;
  status: string;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  completedAt?: string | null;
}

const PRIORITY_BADGE: Record<string, string> = {
  urgent: "bg-destructive/10 text-destructive border-destructive/20",
  high: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  low: "bg-muted text-muted-foreground",
};

export default function Tasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: tasks, isLoading } = useListTasks();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const [tab, setTab] = useState("todo");
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: "", description: "", priority: "medium", dueDate: "", estimatedMinutes: "30" });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListTasksQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: "", description: "", priority: "medium", dueDate: "", estimatedMinutes: "30" });
    setShowDialog(true);
  };

  const openEdit = (t: Task) => {
    setEditTarget(t);
    setForm({
      title: t.title,
      description: t.description || "",
      priority: t.priority,
      dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
      estimatedMinutes: t.estimatedMinutes?.toString() || "30",
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editTarget) {
      updateTask.mutate({ id: editTarget.id, data: {
        title: form.title,
        description: form.description,
        priority: form.priority as TaskUpdatePriority,
        dueDate: form.dueDate || undefined,
        estimatedMinutes: parseInt(form.estimatedMinutes) || 30,
      } }, {
        onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Task updated" }); },
      });
    } else {
      createTask.mutate({ data: {
        title: form.title,
        description: form.description,
        priority: form.priority as TaskInputPriority,
        dueDate: form.dueDate || undefined,
        estimatedMinutes: parseInt(form.estimatedMinutes) || 30,
      } }, {
        onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Task created" }); },
      });
    }
  };

  const handleToggleDone = (t: Task) => {
    const newStatus = (t.status === "completed" ? "todo" : "completed") as TaskUpdateStatus;
    updateTask.mutate({ id: t.id, data: { status: newStatus } }, { onSuccess: invalidate });
  };

  const handleStatusChange = (t: Task, status: string) => {
    updateTask.mutate({ id: t.id, data: { status: status as TaskUpdateStatus } }, { onSuccess: invalidate });
  };

  const handleDelete = (id: number) => {
    deleteTask.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Task deleted" }); } });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold">Tasks</h1>
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    );
  }

  const list = (tasks || []) as Task[];
  const filtered = list.filter(t => {
    if (tab === "todo") return t.status === "todo";
    if (tab === "in-progress") return t.status === "in-progress";
    if (tab === "completed") return t.status === "completed";
    return true;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    const p: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
    return (p[b.priority] || 2) - (p[a.priority] || 2);
  });

  const counts = {
    all: list.length,
    todo: list.filter(t => t.status === "todo").length,
    "in-progress": list.filter(t => t.status === "in-progress").length,
    completed: list.filter(t => t.status === "completed").length,
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            {counts.todo} pending &middot; {counts["in-progress"]} in progress &middot; {counts.completed} done
          </p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-task">
          <Plus className="w-4 h-4 mr-2" />
          New task
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="todo" data-testid="tab-todo">To do ({counts.todo})</TabsTrigger>
          <TabsTrigger value="in-progress" data-testid="tab-inprogress">In progress ({counts["in-progress"]})</TabsTrigger>
          <TabsTrigger value="completed" data-testid="tab-completed">Done ({counts.completed})</TabsTrigger>
        </TabsList>
      </Tabs>

      {sortedFiltered.length === 0 && (
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <ListTodo className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">
              {tab === "completed" ? "No completed tasks yet" : "No tasks here"}
            </p>
            {tab === "todo" && (
              <Button className="mt-6" onClick={openCreate}>Add a task</Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {sortedFiltered.map((task) => (
          <Card key={task.id} className={`transition-all ${task.status === "completed" ? "opacity-60" : "hover:shadow-sm"}`} data-testid={`task-card-${task.id}`}>
            <CardContent className="py-3 px-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={task.status === "completed"}
                  onCheckedChange={() => handleToggleDone(task)}
                  data-testid={`checkbox-task-${task.id}`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium text-sm ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className={`text-xs capitalize ${PRIORITY_BADGE[task.priority] || ""}`} variant="outline">
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {task.estimatedMinutes && (
                      <span className="text-xs text-muted-foreground">{task.estimatedMinutes}m</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {task.status === "todo" && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleStatusChange(task, "in-progress")}>
                      Start
                    </Button>
                  )}
                  {task.status === "in-progress" && (
                    <Button variant="ghost" size="sm" className="text-xs" onClick={() => handleStatusChange(task, "todo")}>
                      Pause
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(task)} data-testid={`button-edit-task-${task.id}`}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(task.id)} data-testid={`button-delete-task-${task.id}`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">{editTarget ? "Edit task" : "New task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Review project proposal"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                data-testid="input-task-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Additional context..."
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={v => setForm(f => ({ ...f, priority: v }))}>
                  <SelectTrigger data-testid="select-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Est. minutes</Label>
                <Input
                  type="number"
                  min={5}
                  max={480}
                  value={form.estimatedMinutes}
                  onChange={e => setForm(f => ({ ...f, estimatedMinutes: e.target.value }))}
                  data-testid="input-estimated-minutes"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={createTask.isPending || updateTask.isPending || !form.title.trim()}
              data-testid="button-save-task"
            >
              {editTarget ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
