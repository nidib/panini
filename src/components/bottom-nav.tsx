"use client";

import { Album, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "src/lib/utils";

const tabs = [
  { href: "/", label: "Álbuns", icon: Album },
  { href: "/stats", label: "Estatísticas", icon: BarChart3 },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <ul className="flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-5" />
                <span>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
