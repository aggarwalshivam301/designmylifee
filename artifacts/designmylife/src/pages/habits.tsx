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
import { CheckCircle2, Circle, Plus, Pencil, Trash2, Flame, Trophy, Calendar } from "lucide-react";

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
      onSuccess: () => { invalidate(); toast({ title: "Habit deleted" }); },
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
          <h1 className="text-3xl font-serif font-bold">Habits</h1>
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const list = (habits || []) as Habit[];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Habits</h1>
          <p className="text-muted-foreground mt-1">
            {list.length} habits tracked &middot; {list.filter(isCompletedToday).length} done today
          </p>
        </div>
        <Button onClick={openCreate} data-testid="button-new-habit">
          <Plus className="w-4 h-4 mr-2" />
          New habit
        </Button>
      </div>

      {list.length === 0 && (
        <Card className="text-center py-20 border-dashed">
          <CardContent>
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground font-medium">No habits yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start with one small daily habit and build from there.</p>
            <Button className="mt-6" onClick={openCreate}>Add your first habit</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((habit) => {
          const done = isCompletedToday(habit);
          const rate = habit.completionHistory.length > 0
            ? Math.round(
                (habit.completionHistory.filter(c => c.completed).length /
                  Math.max(habit.completionHistory.length, 1)) * 100
              )
            : 0;
          return (
            <Card
              key={habit.id}
              className={`transition-all duration-200 ${done ? "opacity-80" : "hover:shadow-md"}`}
              data-testid={`habit-card-${habit.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className={`text-base font-semibold leading-snug ${done ? "line-through text-muted-foreground" : ""}`}>
                      {habit.name}
                    </CardTitle>
                    {habit.description && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">{habit.description}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="shrink-0 capitalize text-xs">
                    {habit.frequency}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-primary">
                      <Flame className="w-3.5 h-3.5" />
                      <span className="font-bold font-serif text-lg">{habit.currentStreak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">streak</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-chart-2">
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="font-bold font-serif text-lg">{habit.longestStreak}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">best</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-chart-3">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="font-bold font-serif text-lg">{rate}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">rate</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={done ? "secondary" : "default"}
                    className="flex-1 transition-all"
                    onClick={() => !done && handleCheckIn(habit.id)}
                    disabled={done || checkInHabit.isPending}
                    data-testid={`button-checkin-${habit.id}`}
                  >
                    {done ? (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Done!</>
                    ) : (
                      <><Circle className="w-4 h-4 mr-2" /> Check in</>
                    )}
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(habit)} data-testid={`button-edit-${habit.id}`}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => handleDelete(habit.id)} data-testid={`button-delete-${habit.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={createHabit.isPending || updateHabit.isPending || !form.name.trim()}
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
