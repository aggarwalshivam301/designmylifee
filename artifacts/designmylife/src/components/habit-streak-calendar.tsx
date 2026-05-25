import { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface Entry {
  date: string;
  completed: boolean;
}

interface Props {
  completionHistory: Entry[];
  habitName: string;
  frequency?: string;
}

function getDays(count: number): string[] {
  const days: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}

function getMonthLabels(days: string[]): { label: string; colIndex: number }[] {
  const labels: { label: string; colIndex: number }[] = [];
  let lastMonth = -1;
  days.forEach((day, i) => {
    const col = Math.floor(i / 7);
    const month = new Date(day).getMonth();
    if (month !== lastMonth) {
      labels.push({ label: new Date(day).toLocaleDateString("en-US", { month: "short" }), colIndex: col });
      lastMonth = month;
    }
  });
  return labels;
}

const CELL_COLORS = {
  none: "bg-muted/60",
  done: "bg-primary",
};

export function HabitStreakCalendar({ completionHistory, habitName, frequency = "daily" }: Props) {
  const DAYS = frequency === "weekly" ? 84 : 91; // 13 or 13 weeks
  const days = useMemo(() => getDays(DAYS), [DAYS]);
  const monthLabels = useMemo(() => getMonthLabels(days), [days]);

  const completedSet = useMemo(() => {
    const s = new Set<string>();
    completionHistory.forEach(e => {
      if (e.completed) s.add(e.date.split("T")[0]);
    });
    return s;
  }, [completionHistory]);

  // Group into weeks (columns of 7 days)
  const weeks: string[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const streakCount = useMemo(() => {
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    for (let i = 0; i < days.length; i++) {
      const d = days[days.length - 1 - i];
      if (d > today) continue;
      if (completedSet.has(d)) streak++;
      else if (d !== today) break;
    }
    return streak;
  }, [days, completedSet]);

  const totalDone = useMemo(() => completedSet.size, [completedSet]);
  const rate = DAYS > 0 ? Math.round((totalDone / DAYS) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{totalDone} completions in the last {Math.round(DAYS / 7)} weeks</span>
        <span className="font-medium text-foreground">{rate}% completion rate</span>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex mb-1" style={{ paddingLeft: "28px" }}>
            {weeks.map((_, colIdx) => {
              const label = monthLabels.find(m => m.colIndex === colIdx);
              return (
                <div key={colIdx} className="w-3.5 mr-0.5 text-xs text-muted-foreground" style={{ minWidth: "14px" }}>
                  {label ? label.label : ""}
                </div>
              );
            })}
          </div>

          {/* Grid: day labels + cells */}
          <div className="flex">
            {/* Day of week labels */}
            <div className="flex flex-col mr-1" style={{ width: "24px" }}>
              {DAY_LABELS.map((d, i) => (
                <div
                  key={d}
                  className="text-xs text-muted-foreground leading-none mb-0.5"
                  style={{ height: "14px", lineHeight: "14px", visibility: i % 2 === 0 ? "visible" : "hidden" }}
                >
                  {d.slice(0, 1)}
                </div>
              ))}
            </div>

            {/* Week columns */}
            <div className="flex gap-0.5">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-0.5">
                  {week.map((day) => {
                    const done = completedSet.has(day);
                    const isToday = day === new Date().toISOString().split("T")[0];
                    const label = new Date(day).toLocaleDateString("en-US", {
                      weekday: "short", month: "short", day: "numeric",
                    });
                    return (
                      <Tooltip key={day}>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-3.5 h-3.5 rounded-sm cursor-default transition-colors ${
                              done ? CELL_COLORS.done : CELL_COLORS.none
                            } ${isToday ? "ring-1 ring-primary ring-offset-1 ring-offset-background" : ""}`}
                            style={{ minWidth: "14px", minHeight: "14px" }}
                            aria-label={`${label}: ${done ? "completed" : "not completed"}`}
                          />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs">
                          <span className="font-medium">{label}</span>
                          <span className={`ml-2 ${done ? "text-primary" : "text-muted-foreground"}`}>
                            {done ? "Completed" : "Not done"}
                          </span>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted/60" />
        <div className="w-3 h-3 rounded-sm bg-primary/30" />
        <div className="w-3 h-3 rounded-sm bg-primary/60" />
        <div className="w-3 h-3 rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}
