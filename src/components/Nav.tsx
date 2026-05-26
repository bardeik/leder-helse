"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const pageTitleByPath: Record<string, string> = {
  "/": "Oversikt",
  "/log": "Logg i dag",
  "/check-in": "Ukentlig innsjekk",
  "/workout": "Intervalløkt",
  "/settings": "Innstillinger"
};

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const pageTitle = pageTitleByPath[pathname] ?? "Helseloggen";

  return (
    <header className="topbar-wrap">
      <nav className="topbar" aria-label="Hovednavigasjon">
        <strong className="topbar-brand">Helseloggen</strong>
        <strong className="topbar-page-title" aria-live="polite">
          {pageTitle}
        </strong>
        <button
          className="topbar-menu-button"
          type="button"
          aria-label="Åpne meny"
          aria-expanded={menuOpen}
          aria-controls="main-menu-panel"
          onClick={() => setMenuOpen((open) => !open)}
        >
          ☰
        </button>
      </nav>

      {menuOpen ? (
        <div id="main-menu-panel" className="topbar-menu-panel" role="menu">
          <Link className="topbar-menu-link" href="/" role="menuitem" onClick={() => setMenuOpen(false)}>
            Oversikt
          </Link>
          <Link className="topbar-menu-link" href="/log" role="menuitem" onClick={() => setMenuOpen(false)}>
            Logg i dag
          </Link>
          <Link className="topbar-menu-link" href="/check-in" role="menuitem" onClick={() => setMenuOpen(false)}>
            Ukentlig innsjekk
          </Link>
          <Link className="topbar-menu-link" href="/workout" role="menuitem" onClick={() => setMenuOpen(false)}>
            Intervalløkt
          </Link>
          <Link className="topbar-menu-link" href="/settings" role="menuitem" onClick={() => setMenuOpen(false)}>
            Innstillinger
          </Link>
        </div>
      ) : null}
    </header>
  );
}
