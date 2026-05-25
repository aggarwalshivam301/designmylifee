import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}