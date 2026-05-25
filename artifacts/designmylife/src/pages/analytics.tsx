import {
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
  useListHabits,
  getListHabitsQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";

interface Habit {
  id: number;
  name: string;
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  completionHistory: Array<{ date: string; completed: boolean }>;
}

const COLORS = ["hsl(160,35%,40%)", "hsl(40,80%,50%)", "hsl(200,40%,40%)", "hsl(300,30%,50%)", "hsl(0,50%,60%)"];

function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

export default function Analytics() {
  const { token } = useAuth();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary({
    query: { enabled: !!token, queryKey: getGetDashboardSummaryQueryKey() },
  });
  const { data: habits, isLoading: loadingHabits } = useListHabits({
    query: { enabled: !!token, queryKey: getListHabitsQueryKey() },
  });

  const isLoading = loadingSummary || loadingHabits;

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <h1 className="text-3xl font-serif font-bold">Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const habitList = (habits || []) as Habit[];

  // Habit completion last 7 days
  const last7 = getLast7Days();
  const completionData = last7.map(date => {
    const completed = habitList.filter(h =>
      h.completionHistory.some(c => c.date.startsWith(date) && c.completed)
    ).length;
    return {
      date: new Date(date).toLocaleDateString("en-US", { weekday: "short" }),
      completed,
      total: habitList.length,
    };
  });

  // BCI breakdown
  const bciData = summary?.bci ? [
    { name: "Streak", value: Math.round(summary.bci.breakdown.streakConsistency), weight: "40%" },
    { name: "Completion", value: Math.round(summary.bci.breakdown.completionRate), weight: "30%" },
    { name: "Time", value: Math.round(summary.bci.breakdown.timeConsistency), weight: "20%" },
    { name: "Goal Align", value: Math.round(summary.bci.breakdown.goalAlignment), weight: "10%" },
  ] : [];

  // BCI radar
  const radarData = bciData.map(d => ({ subject: d.name, value: d.value, fullMark: 100 }));

  // Task status pie
  const taskData = summary?.tasks ? [
    { name: "To do", value: summary.tasks.todo },
    { name: "In progress", value: summary.tasks.inProgress },
    { name: "Completed", value: summary.tasks.completed },
  ].filter(d => d.value > 0) : [];

  // Streaks
  const streakData = habitList
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 8)
    .map(h => ({
      name: h.name.length > 14 ? h.name.slice(0, 14) + "…" : h.name,
      current: h.currentStreak,
      best: h.longestStreak,
    }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">Visualize your consistency and behavioral patterns.</p>
      </div>

      {/* BCI Summary Row */}
      {summary?.bci && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {bciData.map((d, i) => (
            <Card key={d.name}>
              <CardContent className="pt-5 pb-4">
                <p className="text-xs text-muted-foreground">{d.name} ({d.weight})</p>
                <div className="flex items-end gap-1.5 mt-1">
                  <span className="text-3xl font-serif font-bold" style={{ color: COLORS[i] }}>{d.value}</span>
                  <span className="text-muted-foreground text-sm mb-0.5">/100</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit completion last 7 days */}
        <Card>
          <CardHeader>
            <CardTitle>Habit Completions</CardTitle>
            <CardDescription>How many habits you completed each day (last 7 days)</CardDescription>
          </CardHeader>
          <CardContent>
            {habitList.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No habits to show yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={completionData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number, name: string) => [value, name === "completed" ? "Completed" : "Total"]}
                  />
                  <Bar dataKey="total" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} name="Total" />
                  <Bar dataKey="completed" fill={COLORS[0]} radius={[4, 4, 0, 0]} name="Completed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* BCI Radar */}
        <Card>
          <CardHeader>
            <CardTitle>BCI Breakdown</CardTitle>
            <CardDescription>Your four behavioral consistency components</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {!summary?.bci || summary.bci.score === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">Start tracking habits to see your BCI breakdown</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Radar name="Score" dataKey="value" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.25} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                    formatter={(v: number) => [`${v}/100`, "Score"]}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Streak leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Habit Streaks</CardTitle>
            <CardDescription>Current vs best streak by habit</CardDescription>
          </CardHeader>
          <CardContent>
            {streakData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No habits yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={streakData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                  <Bar dataKey="best" fill="hsl(var(--muted))" radius={[0, 4, 4, 0]} name="Best streak" />
                  <Bar dataKey="current" fill={COLORS[1]} radius={[0, 4, 4, 0]} name="Current streak" />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Task status pie */}
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
            <CardDescription>Breakdown of your tasks by status</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            {taskData.length === 0 ? (
              <p className="text-center text-muted-foreground py-12 text-sm">No tasks yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`}
                    labelLine={false}
                  >
                    {taskData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
