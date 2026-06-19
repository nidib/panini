import { BottomNav } from "src/components/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center">
      <main className="w-full max-w-md flex-1 pb-16">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
