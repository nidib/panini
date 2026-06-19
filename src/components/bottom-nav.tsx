"use client";

import { Album, BarChart3, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "src/lib/utils";

const tabs = [
  { href: "/", label: "Álbuns", icon: Album, activeFor: ["/", "/album"] },
  {
    href: "/stats",
    label: "Estatísticas",
    icon: BarChart3,
    activeFor: ["/stats"],
  },
  {
    href: "/settings",
    label: "Configurações",
    icon: Settings,
    activeFor: ["/settings"],
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <ul className="mx-auto flex max-w-md items-center justify-around">
        {tabs.map((tab) => {
          const isActive = tab.activeFor.some((prefix) =>
            prefix === "/" ? pathname === "/" : pathname.startsWith(prefix),
          );
          const Icon = tab.icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="size-5" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </ul>
    </nav>
  );
}
