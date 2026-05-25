import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Target, 
  ListTodo, 
  BookOpen, 
  BarChart2, 
  Timer, 
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useGetProfile, useGetDashboardSummary, getGetDashboardSummaryQueryKey, getGetProfileQueryKey } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Habits", href: "/habits", icon: CheckCircle2 },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Tasks", href: "/tasks", icon: ListTodo },
  { name: "Journal", href: "/journal", icon: BookOpen },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Focus", href: "/focus", icon: Timer },
  { name: "Settings", href: "/settings", icon: SettingsIcon },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout, token } = useAuth();
  
  const { data: profile } = useGetProfile({ 
    query: { 
      enabled: !!token, 
      queryKey: getGetProfileQueryKey() 
    } 
  });
  
  const { data: summary } = useGetDashboardSummary({
    query: {
      enabled: !!token,
      queryKey: getGetDashboardSummaryQueryKey()
    }
  });

  return (
    <div className="w-64 flex flex-col h-screen border-r bg-sidebar text-sidebar-foreground">
      <div className="p-6">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-primary">DesignMyLife</h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href} className="block">
              <span className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                  : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
              }`}>
                <Icon className="w-5 h-5" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {summary?.bci && (
        <div className="mx-4 mb-4 p-4 rounded-xl bg-card border shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">BCI Score</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {summary.bci.grade}
            </span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-serif font-bold text-foreground leading-none">
              {summary.bci.score}
            </span>
            <span className="text-sm text-muted-foreground mb-0.5">/100</span>
          </div>
        </div>
      )}

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20">
              <AvatarImage src={profile?.avatar || undefined} />
              <AvatarFallback className="text-primary font-medium">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <div className="truncate">
              <p className="text-sm font-medium truncate">{profile?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email || ""}</p>
            </div>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}