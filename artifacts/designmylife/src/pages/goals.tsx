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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, Pencil, Trash2, ChevronDown, ChevronUp, CheckCircle2, Sparkles, Loader2, Wand2 } from "lucide-react";
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

function getToken(): string {
  return localStorage.getItem("dml_token") || "";
}

async function elaborateGoal(vague: string): Promise<{
  title: string; description: string; category: string;
  targetDate: string; milestones: Milestone[]; reasoning: string;
}> {
  const res = await fetch("/api/ai/elaborate-goal", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ vague }),
  });
  if (!res.ok) throw new Error("Failed to elaborate goal");
  return res.json();
}

async function decomposeGoal(goalId: number): Promise<{ milestones: Milestone[]; reasoning: string }> {
  const res = await fetch("/api/ai/decompose-goal", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({ goalId }),
  });
  if (!res.ok) throw new Error("Failed to decompose goal");
  return res.json();
}

export default function Goals() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: goals, isLoading } = useListGoals();

  const createGoal = useCreateGoal();
  const updateGoal = useUpdateGoal();
  const deleteGoal = useDeleteGoal();
  const updateMilestones = useUpdateGoalMilestones();

  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Goal | null>(null);
  const [form, setForm] = useState({ title: "", description: "", category: "other", targetDate: "" });
  const [pendingMilestones, setPendingMilestones] = useState<Milestone[]>([]);

  // AI assist in dialog
  const [aiMode, setAiMode] = useState(false);
  const [vagueInput, setVagueInput] = useState("");
  const [aiElaborating, setAiElaborating] = useState(false);
  const [aiReasoning, setAiReasoning] = useState("");

  // Per-card state
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [newMilestone, setNewMilestone] = useState<Record<number, string>>({});
  const [decomposingId, setDecomposingId] = useState<number | null>(null);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ title: "", description: "", category: "other", targetDate: "" });
    setPendingMilestones([]);
    setAiMode(false);
    setVagueInput("");
    setAiReasoning("");
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
    setPendingMilestones([]);
    setAiMode(false);
    setVagueInput("");
    setAiReasoning("");
    setShowDialog(true);
  };

  const handleElaborate = async () => {
    if (!vagueInput.trim()) return;
    setAiElaborating(true);
    try {
      const result = await elaborateGoal(vagueInput.trim());
      setForm({
        title: result.title,
        description: result.description,
        category: result.category || "other",
        targetDate: result.targetDate || "",
      });
      setPendingMilestones(result.milestones || []);
      setAiReasoning(result.reasoning || "");
      setAiMode(false);
      toast({ title: "Goal structured by AI", description: "Review and adjust the details below." });
    } catch {
      toast({ variant: "destructive", title: "AI failed", description: "Could not elaborate goal. Check if AI is configured." });
    } finally {
      setAiElaborating(false);
    }
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const onSuccess = async (data: { id?: number } | unknown) => {
      // If creating and we have pending milestones, save them
      const newId = (data as { id?: number })?.id;
      if (!editTarget && pendingMilestones.length > 0 && newId) {
        updateMilestones.mutate({ id: newId, data: { milestones: pendingMilestones } }, {
          onSuccess: () => { invalidate(); },
        });
      } else {
        invalidate();
      }
      setShowDialog(false);
      toast({ title: editTarget ? "Goal updated" : "Goal created" });
    };

    if (editTarget) {
      updateGoal.mutate({ id: editTarget.id, data: {
        title: form.title, description: form.description,
        category: form.category as GoalUpdateCategory,
        targetDate: form.targetDate || undefined,
      } }, { onSuccess });
    } else {
      createGoal.mutate({ data: {
        title: form.title, description: form.description,
        category: form.category as GoalInputCategory,
        targetDate: form.targetDate || undefined,
      } }, { onSuccess });
    }
  };

  const handleDelete = (id: number) => {
    deleteGoal.mutate({ id }, { onSuccess: () => { invalidate(); toast({ title: "Goal deleted" }); } });
  };

  const handleToggleMilestone = (goal: Goal, milestoneId: string) => {
    const updated = goal.milestones.map(m =>
      m.id === milestoneId ? { ...m, done: !m.done } : m
    );
    updateMilestones.mutate({ id: goal.id, data: { milestones: updated } }, { onSuccess: () => invalidate() });
  };

  const handleAddMilestone = (goal: Goal) => {
    const title = (newMilestone[goal.id] || "").trim();
    if (!title) return;
    const updated = [...goal.milestones, { id: randomUUID(), title, done: false, dueDate: null }];
    updateMilestones.mutate({ id: goal.id, data: { milestones: updated } }, {
      onSuccess: () => { invalidate(); setNewMilestone(m => ({ ...m, [goal.id]: "" })); },
    });
  };

  const handleDecompose = async (goal: Goal) => {
    setDecomposingId(goal.id);
    try {
      const result = await decomposeGoal(goal.id);
      // Merge with existing milestones (keep done ones, replace undone)
      const existing = goal.milestones.filter(m => m.done);
      const merged = [...existing, ...result.milestones.filter((m: Milestone) => !existing.some(e => e.title === m.title))];
      updateMilestones.mutate({ id: goal.id, data: { milestones: merged } }, {
        onSuccess: () => {
          invalidate();
          toast({ title: "Milestones generated", description: result.reasoning || "AI has structured your goal into steps." });
        },
      });
    } catch {
      toast({ variant: "destructive", title: "AI failed", description: "Could not decompose goal." });
    } finally {
      setDecomposingId(null);
    }
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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Goals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{active.length} active &middot; {list.filter(g => g.status === "completed").length} completed</p>
        </div>
        <Button onClick={openCreate} size="sm" className="shrink-0" data-testid="button-new-goal">
          <Plus className="w-4 h-4 mr-1.5" />
          New
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
          const isDecomposing = decomposingId === goal.id;

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
                    {/* AI decompose button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                      onClick={() => { setExpandedId(goal.id); handleDecompose(goal); }}
                      disabled={isDecomposing}
                      title="AI: auto-generate milestones"
                      data-testid={`button-ai-goal-${goal.id}`}
                    >
                      {isDecomposing
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Sparkles className="w-4 h-4" />
                      }
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(goal)} data-testid={`button-edit-goal-${goal.id}`}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(goal.id)} data-testid={`button-delete-goal-${goal.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setExpandedId(isExpanded ? null : goal.id)} data-testid={`button-expand-goal-${goal.id}`}>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <Progress value={goal.progress} className="flex-1 h-2" />
                  <span className="text-sm font-medium w-10 text-right">{goal.progress}%</span>
                </div>
                {goal.milestones.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{doneCount} / {goal.milestones.length} milestones done</p>
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
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">Milestones</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground hover:text-primary gap-1"
                        onClick={() => handleDecompose(goal)}
                        disabled={isDecomposing}
                      >
                        {isDecomposing
                          ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating...</>
                          : <><Sparkles className="w-3 h-3" /> AI suggest</>
                        }
                      </Button>
                    </div>
                    {goal.milestones.length === 0 && !isDecomposing && (
                      <p className="text-sm text-muted-foreground mb-3">No milestones yet. Add one below or use AI to generate steps.</p>
                    )}
                    {isDecomposing && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        AI is structuring your goal into steps...
                      </div>
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
                          {m.done && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
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

      {/* Create / Edit dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">{editTarget ? "Edit goal" : "New goal"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* AI Assist section — only in create mode */}
            {!editTarget && (
              <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-primary">AI Goal Builder</p>
                  <Badge variant="outline" className="text-xs ml-auto">optional</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Describe your goal vaguely. AI will structure it into a proper goal with milestones.</p>

                {aiMode ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder='e.g. "get fit", "learn guitar", "save money", "start a business"'
                      value={vagueInput}
                      onChange={e => setVagueInput(e.target.value)}
                      rows={2}
                      className="text-sm resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleElaborate}
                        disabled={aiElaborating || !vagueInput.trim()}
                        className="flex-1"
                      >
                        {aiElaborating
                          ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Structuring...</>
                          : <><Sparkles className="w-3.5 h-3.5 mr-1.5" /> Build my goal</>
                        }
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setAiMode(false); setVagueInput(""); }}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => setAiMode(true)}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    Start from a vague idea
                  </Button>
                )}

                {aiReasoning && !aiMode && (
                  <p className="text-xs text-muted-foreground italic border-t border-primary/20 pt-2">
                    AI interpretation: {aiReasoning}
                  </p>
                )}
              </div>
            )}

            {!aiMode && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="goal-title">Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g. Run a half-marathon"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    data-testid="input-goal-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal-desc">Description (optional)</Label>
                  <Textarea
                    id="goal-desc"
                    placeholder="Why does this goal matter?"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    className="resize-none"
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

                {/* Show pending AI-generated milestones */}
                {pendingMilestones.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      <p className="text-sm font-medium">AI-suggested milestones</p>
                      <span className="text-xs text-muted-foreground ml-auto">will be saved with the goal</span>
                    </div>
                    <div className="space-y-1.5 rounded-md border p-3 bg-muted/30">
                      {pendingMilestones.map((m, i) => (
                        <div key={m.id} className="flex items-center gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span>{m.title}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground h-7"
                      onClick={() => setPendingMilestones([])}
                    >
                      Clear milestones
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {!aiMode && (
            <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">Cancel</Button>
              <Button
                onClick={handleSave}
                disabled={createGoal.isPending || updateGoal.isPending || !form.title.trim()}
                className="w-full sm:w-auto"
                data-testid="button-save-goal"
              >
                {editTarget ? "Save changes" : "Create goal"}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
