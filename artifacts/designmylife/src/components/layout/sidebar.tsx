import { useState } from "react";
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
  LogOut,
  X,
  Menu,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  useGetProfile,
  useGetDashboardSummary,
  getGetDashboardSummaryQueryKey,
  getGetProfileQueryKey,
} from "@workspace/api-client-react";
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

interface SidebarInnerProps {
  onClose?: () => void;
}

function SidebarInner({ onClose }: SidebarInnerProps) {
  const [location] = useLocation();
  const { logout, token } = useAuth();

  const { data: profile } = useGetProfile({
    query: { enabled: !!token, queryKey: getGetProfileQueryKey() },
  });
  const { data: summary } = useGetDashboardSummary({
    query: { enabled: !!token, queryKey: getGetDashboardSummaryQueryKey() },
  });

  const handleNav = () => {
    onClose?.();
  };

  return (
    <div className="w-64 flex flex-col h-full bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between p-5">
        <h1 className="font-serif text-xl font-bold tracking-tight text-primary">DesignMyLife</h1>
        {onClose && (
          <Button variant="ghost" size="icon" className="md:hidden -mr-2" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="block" onClick={handleNav}>
              <span
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80 hover:text-sidebar-foreground"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {summary?.bci && (
        <div className="mx-3 mb-3 p-3 rounded-xl bg-card border shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">BCI Score</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {summary.bci.grade}
            </span>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-3xl font-serif font-bold text-foreground leading-none">
              {summary.bci.score}
            </span>
            <span className="text-xs text-muted-foreground mb-0.5">/100</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
            {summary.bci.prediction?.recommendation}
          </p>
        </div>
      )}

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 mb-3 px-1">
          <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20 shrink-0">
            <AvatarImage src={profile?.avatar || undefined} />
            <AvatarFallback className="text-primary font-medium text-sm">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="truncate min-w-0">
            <p className="text-sm font-medium truncate leading-tight">{profile?.name || "User"}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email || ""}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm h-9"
          onClick={() => { handleNav(); logout(); }}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );
}

export function MobileHeader({ onMenuOpen }: { onMenuOpen: () => void }) {
  const [location] = useLocation();
  const currentPage = navItems.find(n => n.href === location)?.name || "DesignMyLife";
  return (
    <div className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-sidebar/80 backdrop-blur sticky top-0 z-30">
      <Button variant="ghost" size="icon" onClick={onMenuOpen} data-testid="button-menu">
        <Menu className="w-5 h-5" />
      </Button>
      <span className="font-serif font-bold text-primary">{currentPage}</span>
      <div className="w-9" />
    </div>
  );
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col h-screen border-r shrink-0">
        <SidebarInner />
      </aside>

      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 border-r shadow-xl transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarInner onClose={() => setMobileOpen(false)} />
      </aside>

      {/* Mobile header strip — rendered here so layout can use it */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 border-b bg-sidebar/95 backdrop-blur">
        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} data-testid="button-menu">
          <Menu className="w-5 h-5" />
        </Button>
        <span className="font-serif font-bold text-primary text-sm">DesignMyLife</span>
        <div className="w-9" />
      </div>
    </>
  );
}
