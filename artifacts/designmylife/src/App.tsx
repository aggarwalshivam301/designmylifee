import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

import AppLayout from "@/components/layout/app-layout";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Habits from "@/pages/habits";
import Goals from "@/pages/goals";
import Tasks from "@/pages/tasks";
import Journal from "@/pages/journal";
import Analytics from "@/pages/analytics";
import Focus from "@/pages/focus";
import Settings from "@/pages/settings";

const queryClient = new QueryClient();

// Configure the api client to use the token from zustand
setAuthTokenGetter(() => {
  const token = localStorage.getItem("dml_token");
  return token;
});

function ProtectedRoute({ component: Component, ...rest }: { component: any, path: string }) {
  const { token } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  if (!token) return null;

  return (
    <Route {...rest}>
      <AppLayout>
        <Component />
      </AppLayout>
    </Route>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/habits" component={Habits} />
      <ProtectedRoute path="/goals" component={Goals} />
      <ProtectedRoute path="/tasks" component={Tasks} />
      <ProtectedRoute path="/journal" component={Journal} />
      <ProtectedRoute path="/analytics" component={Analytics} />
      <ProtectedRoute path="/focus" component={Focus} />
      <ProtectedRoute path="/settings" component={Settings} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
