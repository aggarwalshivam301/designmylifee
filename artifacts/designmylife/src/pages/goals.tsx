import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListGoals,
  getListGoalsQueryKey,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
  useUpdateGoalMilestones,
  getGetDashboardSummaryQueryKey,
  type GoalInputCategory,
  type GoalUpdateCategory,
  type GoalUpdateStatus,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, Pencil, Trash2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { randomUUID } from "@/lib/utils";

interface Milestone { id: string; title: string; done: boolean; dueDate?: string | null }
interface Goal {
  id: number;
  title: string;
  description?: string | null;
  category: string;
  targetDate?: string | null;
  progress: number;
  status: string;
  milestones: Milestone[];
  linkedHabitIds: number[];
}

const CATEGORIES = ["career", "health", "learning", "finance", "relationships", "project", "other"];
const STATUS_COLORS: Record<string, string> = {
  active: "bg-primary/10 text-primary",
  completed: "bg-chart-1/10 text-chart-1",
  paused: "bg-muted text-muted-foreground",
  abandoned: "bg-destructive/10 text-destructive",
};

export default function Goals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: goals, isLoading } = useListGoals();

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const updateMilestones = useUpdateGoalMilestones();

  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Goal | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "other", targetDate: "" });
  const [newMilestone, setNewMilestone] = useState<Record<number, string>>({});

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: "", description: "", category: "other", targetDate: "" });
    setShowDialog(true);
  };

  const openEdit = (g: Goal) => {
    setEditTarget(g);
    setForm({
      title: g.title,
      description: g.description || "",
      category: g.category,
      targetDate: g.targetDate ? g.targetDate.split("T")[0] : "",
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editTarget) {
      updateGoal.mutate({ id: editTarget.id, data: {
        title: form.title,
        description: form.description,
        category: form.category as GoalUpdateCategory,
        targetDate: form.targetDate || undefined,
      } }, {
        onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Goal updated" }); },
      });
    } else {
      createGoal.mutate({ data: {
        title: form.title,
        description: form.description,
        category: form.category as GoalInputCategory,
        targetDate: form.targetDate || undefined,
      } }, {
        onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Goal created" }); },
      });
    }
  };

  const handleDelete = (id: number) => {
    deleteGoal.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Goal deleted" }); } });
  };

  const handleToggleMilestone = (goal: Goal, milestoneId: string) => {
    const updated = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, done: !m.done } : m
    );
    updateMilestones.mutate({ id: goal.id, data: { milestones: updated } }, {
      onSuccess: () => invalidate(),
    });
  };

  const handleAddMilestone = (goal: Goal) => {
    const title = (newMilestone[goal.id] || "").trim();
    if (!title) return;
    const updated = [...goal.milestones, { id: randomUUID(), title, done: false, dueDate: null }];
    updateMilestones.mutate({ id: goal.id, data: { milestones: updated } }, {
      onSuccess: () => { invalidate(); setNewMilestone(m => ({ ...m, [goal.id]: "" })); },
    });
  };

  const handleStatusChange = (goal: Goal, status: string) => {
    updateGoal.mutate({ id: goal.id, data: { status: status as GoalUpdateStatus } }, { onSuccess: invalidate });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-serif font-bold">Goals</h1>
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    );
  }

  const list = (goals || []) as Goal[];
  const active = list.filter(g => g.status === "active");
  const rest = list.filter(g => g.status !== "active");

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground mt-1">{active.length} active &middot; {list.filter(g => g.status === "completed").length} completed</p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-goal">
          <Plus className="w-4 h-4 mr-2" />
          New goal
        </Button>
      </div>

      {list.length === 0 && (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No goals yet</p>
            <p className="text-sm text-muted-foreground mt-1">Set a meaningful target and break it into milestones.</p>
            <Button className="mt-6" onClick={openCreate}>Set your first goal</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {[...active, ...rest].map((goal) => {
          const isExpanded = expandedId === goal.id;
          const doneCount = goal.milestones.filter(m => m.done).length;
          return (
            <Card key={goal.id} className="transition-all hover:shadow-sm" data-testid={`goal-card-${goal.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base font-semibold">{goal.title}</CardTitle>
                      <Badge className={`text-xs capitalize ${STATUS_COLORS[goal.status] || ""}`} variant="outline">
                        {goal.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">{goal.category}</Badge>
                    </div>
                    {goal.description && (
                      <CardDescription className="mt-1 line-clamp-2">{goal.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(goal)} data-testid={`button-edit-goal-${goal.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(goal.id)} data-testid={`button-delete-goal-${goal.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setExpandedId(isExpanded ? null : goal.id)} data-testid={`button-expand-goal-${goal.id}`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Progress value={goal.progress} className="flex-1 h-2" />
                  <span className="text-sm font-medium w-10 text-right">{goal.progress}%</span>
                </div>
                {goal.milestones.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{doneCount} / {goal.milestones.length} milestones</p>
                )}
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 border-t space-y-4">
                  <div className="flex gap-2 flex-wrap pt-3">
                    {["active", "paused", "completed"].map(s => (
                      <Button key={s} variant={goal.status === s ? "default" : "outline"} size="sm" className="capitalize" onClick={() => handleStatusChange(goal, s)}>
                        {s}
                      </Button>
                    ))}
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Milestones</p>
                    {goal.milestones.length === 0 && (
                      <p className="text-sm text-muted-foreground">No milestones yet. Add your first one below.</p>
                    )}
                    <div className="space-y-2">
                      {goal.milestones.map(m => (
                        <div key={m.id} className="flex items-center gap-3">
                          <Checkbox
                            checked={m.done}
                            onCheckedChange={() => handleToggleMilestone(goal, m.id)}
                            data-testid={`checkbox-milestone-${m.id}`}
                          />
                          <span className={`text-sm flex-1 ${m.done ? "line-through text-muted-foreground" : ""}`}>
                            {m.title}
                          </span>
                          {m.done && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Add milestone..."
                        value={newMilestone[goal.id] || ""}
                        onChange={e => setNewMilestone(m => ({ ...m, [goal.id]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleAddMilestone(goal)}
                        data-testid={`input-milestone-${goal.id}`}
                      />
                      <Button variant="outline" size="icon" onClick={() => handleAddMilestone(goal)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">{editTarget ? "Edit goal" : "New goal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Run a half-marathon"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                data-testid="input-goal-title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Textarea
                placeholder="Why does this goal matter?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger data-testid="select-goal-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Target date (optional)</Label>
                <Input
                  type="date"
                  value={form.targetDate}
                  onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={createGoal.isPending || updateGoal.isPending || !form.title.trim()}
              data-testid="button-save-goal"
            >
              {editTarget ? "Save changes" : "Create goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
