import { AppShell } from "src/components/app-shell";

export default function StatsPage() {
  return (
    <AppShell>
      <div className="flex min-h-[60dvh] flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold">Estatísticas</h1>
        <p className="mt-2 text-muted-foreground">
          Em breve você poderá acompanhar o progresso do álbum por aqui.
        </p>
      </div>
    </AppShell>
  );
}
