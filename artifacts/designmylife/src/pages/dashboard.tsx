import { useGetDashboardSummary, getGetDashboardSummaryQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Activity, Target, ListTodo, BookOpen, ChevronRight, TrendingUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { token } = useAuth();
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: {
      enabled: !!token,
      queryKey: getGetDashboardSummaryQueryKey()
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl md:col-span-2" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">Cockpit</h1>
        <p className="text-muted-foreground mt-1">Your life's operating system overview.</p>
      </div>

      {summary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-primary text-primary-foreground border-primary-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-primary-foreground/80 text-sm font-medium">Behavioral Consistency Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-serif font-bold">{summary.bci.score}</span>
                  <span className="text-xl opacity-80">/100</span>
                  <span className="ml-auto text-2xl font-bold px-3 py-1 bg-white/20 rounded-lg">{summary.bci.grade}</span>
                </div>
                <p className="text-sm mt-4 opacity-90">{summary.bci.interpretation}</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>BCI Breakdown</CardTitle>
                <CardDescription>What's driving your score right now</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Streak Consistency</span>
                    <div className="text-2xl font-serif font-semibold">{Math.round(summary.bci.breakdown.streakConsistency)}%</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Completion Rate</span>
                    <div className="text-2xl font-serif font-semibold">{Math.round(summary.bci.breakdown.completionRate)}%</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Time Consistency</span>
                    <div className="text-2xl font-serif font-semibold">{Math.round(summary.bci.breakdown.timeConsistency)}%</div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-sm text-muted-foreground">Goal Alignment</span>
                    <div className="text-2xl font-serif font-semibold">{Math.round(summary.bci.breakdown.goalAlignment)}%</div>
                  </div>
                </div>
                {summary.bci.prediction && (
                  <div className="mt-4 pt-4 border-t flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground">{summary.bci.prediction.recommendation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Habits</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{summary.habits.completedToday} / {summary.habits.activeToday}</div>
                <p className="text-xs text-muted-foreground mt-1">Completed today</p>
                <div className="mt-4">
                  <Link href="/habits">
                    <Button variant="outline" size="sm" className="w-full justify-between" data-testid="link-habits-card">
                      Manage <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Goals</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{summary.goals.active}</div>
                <p className="text-xs text-muted-foreground mt-1">Active goals ({summary.goals.completed} completed)</p>
                <div className="mt-4">
                  <Link href="/goals">
                    <Button variant="outline" size="sm" className="w-full justify-between" data-testid="link-goals-card">
                      View progress <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tasks</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{summary.tasks.todo}</div>
                <p className="text-xs text-muted-foreground mt-1">Pending tasks ({summary.tasks.urgent} urgent)</p>
                <div className="mt-4">
                  <Link href="/tasks">
                    <Button variant="outline" size="sm" className="w-full justify-between" data-testid="link-tasks-card">
                      View tasks <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Journal</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-serif font-bold">{summary.journal.thisWeek}</div>
                <p className="text-xs text-muted-foreground mt-1">Entries this week</p>
                <div className="mt-4">
                  <Link href="/journal">
                    <Button variant="outline" size="sm" className="w-full justify-between" data-testid="link-journal-card">
                      Reflect <ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}