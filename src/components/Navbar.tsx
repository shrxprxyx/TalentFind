"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/lib/hooks/useDashboard";

const allNavLinks = [
  { href: "/dashboard", label: "Dashboard", roles: ["FREELANCER", "CLIENT", "BOTH"] },
  { href: "/projects", label: "Browse", roles: ["FREELANCER", "CLIENT", "BOTH"] },
  { href: "/portfolio", label: "Portfolio", roles: ["FREELANCER", "BOTH"] },
  { href: "/proposals", label: "Proposals", roles: ["FREELANCER", "BOTH"] },
  { href: "/projects/new", label: "Post Project", roles: ["CLIENT", "BOTH"] },
];

export default function Navbar({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname();
  const { data } = useDashboard();
  const role = data?.user?.role;

  const navLinks = role
    ? allNavLinks.filter((l) => l.roles.includes(role))
    : allNavLinks.filter((l) => l.roles.includes("FREELANCER")); // safe default

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard">
            <span
              className="text-xl font-bold text-amber-400 tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              TalentStage
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors duration-200",
                  pathname === href
                    ? "text-amber-400 bg-amber-500/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userEmail && (
            <span className="text-sm text-muted-foreground hidden sm:block">{userEmail}</span>
          )}
          <UserButton
            appearance={{
              elements: { avatarBox: "w-9 h-9 ring-2 ring-amber-500/30" },
            }}
          />
        </div>
      </div>
    </header>
  );
}