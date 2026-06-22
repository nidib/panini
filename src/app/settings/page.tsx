"use client";

import { Check, Copy, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AppShell } from "src/components/app-shell";
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "src/components/ui/toggle-group";
import { useClientId } from "src/lib/client-id";

type ThemeOption = {
  value: "light" | "dark" | "system";
  label: string;
  icon: typeof Sun;
};

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Automático", icon: Monitor },
];

export default function SettingsPage() {
  const clientId = useClientId();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    if (!clientId) return;
    await navigator.clipboard.writeText(clientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AppShell>
      <div className="space-y-6 p-4">
        <h1 className="text-xl font-bold">Configurações</h1>

        <div className="space-y-2">
          <Label htmlFor="client-id">ID deste dispositivo</Label>
          <div className="flex gap-2">
            <Input
              id="client-id"
              value={clientId ?? ""}
              readOnly
              onFocus={(e) => e.target.select()}
              className="font-mono text-sm"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              disabled={!clientId}
              aria-label="Copiar ID do dispositivo"
            >
              {copied ? (
                <Check className="size-4" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>
          {!clientId && (
            <p className="text-sm text-destructive">
              Não foi possível carregar o ID deste dispositivo. Verifique as
              permissões do navegador.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Guarde este ID em um lugar seguro. Ele identifica seus álbuns neste
            dispositivo. Para acessar os mesmos álbuns em outro aparelho, cole
            este ID na tela inicial usando o botão de importar.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Tema</Label>
          <ToggleGroup
            value={mounted ? (theme ?? "system") : ""}
            onValueChange={(value) => {
              if (value) {
                setTheme(value);
              }
            }}
            className="w-full"
            disabled={!mounted}
          >
            {themeOptions.map((option) => {
              const Icon = option.icon;

              return (
                <ToggleGroupItem
                  key={option.value}
                  value={option.value}
                  className="flex flex-1 flex-col items-center gap-1 h-auto py-2.5"
                >
                  <Icon className="size-5" />
                  <span className="text-xs">{option.label}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
          <p className="text-xs text-muted-foreground">
            O modo Automático segue a configuração de tema do seu dispositivo.
          </p>
        </div>
      </div>
    </AppShell>
  );
}
