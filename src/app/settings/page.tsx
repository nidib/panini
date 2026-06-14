import { AppShell } from "src/components/app-shell";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="flex min-h-[60dvh] flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="mt-2 text-muted-foreground">
          Em breve você poderá ajustar as configurações do aplicativo por aqui.
        </p>
      </div>
    </AppShell>
  );
}
