import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListHabits,
  getListHabitsQueryKey,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
  useCheckInHabit,
  getGetDashboardSummaryQueryKey,
  type HabitInputFrequency,
  type HabitUpdateFrequency,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { HabitStreakCalendar } from "@/components/habit-streak-calendar";
import { CheckCircle2, Circle, Plus, Pencil, Trash2, Flame, Trophy, ChevronDown, ChevronUp } from "lucide-react";

interface Habit {
  id: number;
  name: string;
  description?: string | null;
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  isActive: boolean;
  completionHistory: Array<{ date: string; completed: boolean }>;
}

function isCompletedToday(habit: Habit): boolean {
  const today = new Date().toISOString().split("T")[0];
  return habit.completionHistory.some(
    (c) => c.date.startsWith(today) && c.completed
  );
}

export default function Habits() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: habits, isLoading } = useListHabits();

  const createHabit = useCreateHabit();
  const updateHabit = useUpdateHabit();
  const deleteHabit = useDeleteHabit();
  const checkInHabit = useCheckInHabit();

  const [showDialog, setShowDialog] = useState(false);
  const [editTarget, setEditTarget] = useState<Habit | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "", frequency: "daily" });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListHabitsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetDashboardSummaryQueryKey() });
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: "", description: "", frequency: "daily" });
    setShowDialog(true);
  };

  const openEdit = (h: Habit) => {
    setEditTarget(h);
    setForm({ name: h.name, description: h.description || "", frequency: h.frequency });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editTarget) {
      updateHabit.mutate(
        { id: editTarget.id, data: { name: form.name, description: form.description, frequency: form.frequency as HabitUpdateFrequency } },
        {
          onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Habit updated" }); },
          onError: () => toast({ variant: "destructive", title: "Failed to update" }),
        }
      );
    } else {
      createHabit.mutate(
        { data: { name: form.name, description: form.description, frequency: form.frequency as HabitInputFrequency } },
        {
          onSuccess: () => { invalidate(); setShowDialog(false); toast({ title: "Habit created" }); },
          onError: () => toast({ variant: "destructive", title: "Failed to create" }),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    deleteHabit.mutate({ id }, {
      onSuccess: () => {
        if (expandedId === id) setExpandedId(null);
        invalidate();
        toast({ title: "Habit deleted" });
      },
    });
  };

  const handleCheckIn = (id: number) => {
    checkInHabit.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Check-in recorded!" }); },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-serif font-bold">Habits</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const list = (habits || []) as Habit[];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Habits</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {list.length} tracked &middot; {list.filter(isCompletedToday).length} done today
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="shrink-0" data-testid="button-new-habit">
          <Plus className="w-4 h-4 mr-1.5" />
          New
        </Button>
      </div>

      {list.length === 0 && (
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No habits yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start with one small daily habit.</p>
            <Button className="mt-5" onClick={openCreate}>Add your first habit</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {list.map((habit) => {
          const done = isCompletedToday(habit);
          const isExpanded = expandedId === habit.id;

          return (
            <Card
              key={habit.id}
              className={`transition-all duration-200 ${done ? "" : "hover:shadow-sm"}`}
              data-testid={`habit-card-${habit.id}`}
            >
              <CardHeader className="pb-0 pt-4 px-4">
                <div className="flex items-start gap-3">
                  {/* Check-in button — left side */}
                  <button
                    onClick={() => !done && handleCheckIn(habit.id)}
                    disabled={done || checkInHabit.isPending}
                    className={`mt-0.5 shrink-0 transition-all duration-200 ${done ? "text-primary scale-110" : "text-muted-foreground/40 hover:text-primary hover:scale-110"}`}
                    data-testid={`button-checkin-${habit.id}`}
                    aria-label="Check in"
                  >
                    {done
                      ? <CheckCircle2 className="w-6 h-6" />
                      : <Circle className="w-6 h-6" />
                    }
                  </button>

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className={`text-sm font-semibold leading-snug ${done ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs capitalize shrink-0">{habit.frequency}</Badge>
                    </div>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{habit.description}</p>
                    )}
                  </div>

                  {/* Stats — streaks */}
                  <div className="hidden sm:flex items-center gap-4 text-center shrink-0">
                    <div>
                      <div className="flex items-center gap-1 text-primary">
                        <Flame className="w-3 h-3" />
                        <span className="font-bold font-serif text-base">{habit.currentStreak}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">streak</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-chart-2">
                        <Trophy className="w-3 h-3" />
                        <span className="font-bold font-serif text-base">{habit.longestStreak}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">best</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(habit)} data-testid={`button-edit-${habit.id}`}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(habit.id)} data-testid={`button-delete-${habit.id}`}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="icon" className="h-8 w-8"
                      onClick={() => setExpandedId(isExpanded ? null : habit.id)}
                      data-testid={`button-expand-${habit.id}`}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                {/* Mobile stats row */}
                <div className="sm:hidden flex items-center gap-4 mt-2 ml-9 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-primary">
                    <Flame className="w-3 h-3" /> {habit.currentStreak} streak
                  </span>
                  <span className="flex items-center gap-1 text-chart-2">
                    <Trophy className="w-3 h-3" /> {habit.longestStreak} best
                  </span>
                </div>
              </CardHeader>

              {/* Expandable calendar */}
              {isExpanded && (
                <CardContent className="pt-4 pb-4 px-4 border-t mt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">Completion history</p>
                  <HabitStreakCalendar
                    completionHistory={habit.completionHistory}
                    habitName={habit.name}
                    frequency={habit.frequency}
                  />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">{editTarget ? "Edit habit" : "New habit"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="habit-name">Name</Label>
              <Input
                id="habit-name"
                placeholder="e.g. Morning meditation"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                data-testid="input-habit-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="habit-desc">Description (optional)</Label>
              <Textarea
                id="habit-desc"
                placeholder="Why does this habit matter to you?"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={form.frequency} onValueChange={v => setForm(f => ({ ...f, frequency: v }))}>
                <SelectTrigger data-testid="select-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={createHabit.isPending || updateHabit.isPending || !form.name.trim()}
              className="w-full sm:w-auto"
              data-testid="button-save-habit"
            >
              {editTarget ? "Save changes" : "Create habit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
