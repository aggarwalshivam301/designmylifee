interface CompletionEntry {
  date: string;
  completed: boolean;
}

interface HabitData {
  id: number;
  frequency: string;
  currentStreak: number;
  longestStreak: number;
  completionHistory: CompletionEntry[];
}

interface GoalData {
  linkedHabitIds: number[];
}

interface BCIBreakdown {
  streakConsistency: number;
  completionRate: number;
  timeConsistency: number;
  goalAlignment: number;
}

interface BCIPrediction {
  successProbability: number;
  recommendation: string;
}

export interface BCIResult {
  score: number;
  grade: string;
  breakdown: BCIBreakdown;
  interpretation: string;
  prediction: BCIPrediction;
}

function streakConsistency(habits: HabitData[]): number {
  const scores = habits.map((h) => {
    const target = h.frequency === "daily" ? 30 : 12;
    const cur = Math.min((h.currentStreak / target) * 100, 100);
    const best = Math.min((h.longestStreak / target) * 100, 100);
    return cur * 0.7 + best * 0.3;
  });
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function completionRate(habits: HabitData[]): number {
  let total = 0,
    done = 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  habits.forEach((h) => {
    if (!h.completionHistory) return;
    const recent = h.completionHistory.filter(
      (c) => new Date(c.date) >= cutoff,
    );
    done += recent.filter((c) => c.completed).length;
    total += h.frequency === "daily" ? 30 : 12;
  });
  return total === 0 ? 0 : Math.min((done / total) * 100, 100);
}

function timeConsistency(habits: HabitData[]): number {
  const scores: number[] = [];
  habits.forEach((h) => {
    const times = (h.completionHistory || [])
      .filter((c) => c.completed && c.date)
      .map((c) => {
        const d = new Date(c.date);
        return d.getHours() + d.getMinutes() / 60;
      });
    if (times.length < 3) return;
    const mean = times.reduce((a, b) => a + b, 0) / times.length;
    const sd = Math.sqrt(
      times.reduce((s, t) => s + (t - mean) ** 2, 0) / times.length,
    );
    scores.push(Math.max(0, 100 - sd * 16.67));
  });
  return scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 50;
}

function goalAlignment(habits: HabitData[], goal: GoalData | null): number {
  if (!goal?.linkedHabitIds?.length) return 30;
  const linked = habits.filter((h) =>
    goal.linkedHabitIds.some((id) => id === h.id),
  );
  if (!linked.length) return 30;
  const active = linked.filter((h) => h.currentStreak > 0).length;
  return Math.min((active / linked.length) * 80 + Math.min(linked.length * 5, 20), 100);
}

function interpret(score: number): string {
  if (score >= 80) return "Excellent — very strong behavioral consistency.";
  if (score >= 65) return "Good — solid habits with room to improve.";
  if (score >= 50) return "Fair — habits forming but need more consistency.";
  if (score >= 35) return "Developing — focus on one habit at a time.";
  return "Starting out — begin with one small daily habit.";
}

function recommend(
  score: number,
  S: number,
  C: number,
  T: number,
  G: number,
): string {
  if (score >= 80)
    return "Excellent work! Add one new challenging habit to keep growing.";
  const weakest = { S, C, T, G };
  const key = (
    Object.entries(weakest).sort((a, b) => a[1] - b[1])[0][0] as string
  );
  const map: Record<string, string> = {
    S: "Set daily reminders to avoid breaking your streaks.",
    C: "Reduce habit difficulty or frequency to increase completion.",
    T: "Do habits at the same time each day to build a routine.",
    G: "Link your active habits to a goal for better alignment.",
  };
  return map[key] ?? "Keep building your habits one day at a time.";
}

export function calculateBCI(
  habits: HabitData[],
  goal: GoalData | null = null,
): BCIResult {
  if (!habits || habits.length === 0) {
    return {
      score: 0,
      grade: "N/A",
      breakdown: {
        streakConsistency: 0,
        completionRate: 0,
        timeConsistency: 0,
        goalAlignment: 0,
      },
      interpretation:
        "No habit data yet. Start tracking to get your BCI score.",
      prediction: {
        successProbability: 0,
        recommendation: "Create and track habits to begin.",
      },
    };
  }

  const S = streakConsistency(habits);
  const C = completionRate(habits);
  const T = timeConsistency(habits);
  const G = goal ? goalAlignment(habits, goal) : 50;

  const score = Math.round(S * 0.4 + C * 0.3 + T * 0.2 + G * 0.1);
  const prob = Math.round(
    (1 / (1 + Math.exp(-(score - 50) / 10))) * 100,
  );

  return {
    score,
    grade:
      score >= 80
        ? "A"
        : score >= 65
          ? "B"
          : score >= 50
            ? "C"
            : score >= 35
              ? "D"
              : "F",
    breakdown: {
      streakConsistency: Math.round(S),
      completionRate: Math.round(C),
      timeConsistency: Math.round(T),
      goalAlignment: Math.round(G),
    },
    interpretation: interpret(score),
    prediction: { successProbability: prob, recommendation: recommend(score, S, C, T, G) },
  };
}
