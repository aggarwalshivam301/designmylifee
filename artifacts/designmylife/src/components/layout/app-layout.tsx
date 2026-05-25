import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Spacer for mobile sticky header */}
        <div className="md:hidden h-[52px]" />
        <div className="container mx-auto px-4 py-6 md:px-8 md:py-8 max-w-6xl">
          {children}
        </div>
      </main>
    </div>
  );
}
